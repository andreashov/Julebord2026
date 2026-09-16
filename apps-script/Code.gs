/**
 * Julebord 2026 — mottak av påmeldinger til Google Sheet.
 *
 * Dette er en Google Apps Script som kobles til et Google Sheet du eier.
 * Nettsiden sender påmeldinger hit, og hver påmelding blir en ny rad i arket.
 * Gjestene ser ALDRI regnearket — de fyller kun ut den fine nettsiden.
 *
 * Oppsett (se README.md for detaljer):
 *   1. Lag et nytt Google Sheet.
 *   2. Utvidelser → Apps Script. Lim inn denne koden. Lagre.
 *   3. Distribuer → Ny distribusjon → Web-app.
 *        - Kjør som: Meg selv
 *        - Hvem har tilgang: Alle (Anyone)
 *   4. Godkjenn tilgangene. Kopier web-app-URL-en (slutter på /exec)
 *      og lim den inn i index.html (CONFIG.paameldingEndepunkt).
 */

/* ===================== INNSTILLINGER ===================== */

// Overskrifter i regnearket (rekkefølge = kolonnerekkefølge)
var HEADERS = ['Tidspunkt', 'Navn', 'E-post', 'Mobil', 'Mat', 'Kommentar', 'Betalt'];

// Valgfritt: få e-postvarsel ved hver påmelding.
// Sett inn din e-post for å slå det på, f.eks. "andreashov@gmail.com".
// La stå tom ("") for å slå det av.
var NOTIFY_EMAIL = "";

/* ======================================================== */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // unngå at to samtidige påmeldinger overskriver hverandre

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Sørg for at overskriftsraden finnes
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);

    // Tidspunkt fra klienten er ISO — gjør det til lesbar dato/tid
    var naar = data.tidspunkt ? new Date(data.tidspunkt) : new Date();

    sheet.appendRow([
      naar,
      data.navn || '',
      data.epost || '',
      "'" + (data.telefon || ''),   // apostrof bevarer ledende nuller i telefonnr.
      data.mat || '',
      data.kommentar || '',
      ''                            // 'Betalt' — kryss av manuelt når Vipps er mottatt
    ]);

    if (NOTIFY_EMAIL) {
      sendNotification(data, naar);
    }

    return json({ result: 'ok' });

  } catch (err) {
    return json({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Enkel helsesjekk hvis du åpner URL-en i nettleser
function doGet() {
  return json({ result: 'ok', message: 'Julebord 2026 påmeldings-endepunkt er oppe.' });
}

function sendNotification(data, naar) {
  try {
    var emne = 'Ny påmelding julebord: ' + (data.navn || 'Ukjent');
    var linjer = [
      'Ny påmelding registrert ' + naar.toLocaleString('no-NO'),
      '',
      'Navn:      ' + (data.navn || ''),
      'E-post:    ' + (data.epost || ''),
      'Mobil:     ' + (data.telefon || ''),
      'Mat:       ' + (data.mat || ''),
      'Kommentar: ' + (data.kommentar || '(ingen)')
    ];
    MailApp.sendEmail(NOTIFY_EMAIL, emne, linjer.join('\n'));
  } catch (err) {
    // La aldri en varslingsfeil stoppe selve lagringen
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
