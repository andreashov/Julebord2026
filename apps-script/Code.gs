/**
 * Julebord 2026 — mottak av påmeldinger til Google Sheet.
 *
 * Dette er en Google Apps Script som kobles til et Google Sheet du eier.
 * Nettsiden sender påmeldinger hit, og hver påmelding blir en ny rad i arket.
 * Gjestene ser ALDRI regnearket — de fyller kun ut den fine nettsiden.
 *
 * Oppsett (se README.md for skjermbilder/detaljer):
 *   1. Lag et nytt Google Sheet.
 *   2. Utvidelser → Apps Script. Lim inn denne koden.
 *   3. Distribuer → Ny distribusjon → Web-app.
 *        - Kjør som: Meg selv
 *        - Hvem har tilgang: Alle (Anyone)
 *   4. Kopier web-app-URL-en og lim den inn i index.html (CONFIG.paameldingEndepunkt).
 */

// Overskrifter i regnearket (rekkefølge = kolonnerekkefølge)
var HEADERS = ['Tidspunkt', 'Navn', 'E-post', 'Mobil', 'Antall', 'Allergi/mat', 'Kommentar', 'Betalt'];

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

    // Tidspunkt fra klienten er ISO — gjør det til lesbar norsk tid
    var naar = data.tidspunkt ? new Date(data.tidspunkt) : new Date();

    sheet.appendRow([
      naar,
      data.navn || '',
      data.epost || '',
      "'" + (data.telefon || ''),   // apostrof bevarer ledende nuller i telefonnr.
      data.antall || '1',
      data.allergi || '',
      data.kommentar || '',
      ''                            // 'Betalt' — kryss av manuelt når Vipps er mottatt
    ]);

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

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
