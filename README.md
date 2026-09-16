# Julebord 2026 — invitasjonsside

En stilig, mobil-først invitasjonsside i «Liquid Glass»-stil (iOS 26/27) med julevariant:
frostede glasspaneler, langsomme fargeskyer og diskret snø i bakgrunnen. Gjestene går gjennom
tre skjermer — **Forside → Påmelding → Betaling** — og betaler med Vipps.
Siden er gratis å drifte (statisk HTML på GitHub Pages), og påmeldingene havner automatisk
i et Google Sheet du eier. Gjestene ser aldri regnearket.

## Slik henger det sammen

```
  Gjest på mobil
        │  fyller ut den fine siden (index.html)
        ▼
  Google Apps Script  ──►  Google Sheet (din oversikt: hvem, mat, kommentar, betalt)
        │
        ▼
  «Betal med Vipps»-knapp  ──►  Vipps-boksen din (viser hvem som har betalt)
```

## ⚠️ Viktig om Vipps (les dette)

Det finnes **ingen gratis, privat måte å la nettsiden automatisk bekrefte betaling på.**
Full automatikk krever Vipps' bedrifts-API (organisasjonsnummer, bedriftsavtale, avgift og en
server). For et privat julebord er den praktiske løsningen:

- Nettsiden sender gjesten videre til **Vipps-boksen** din med ett trykk.
- Du ser i Vipps-boksen hvem som har betalt, og krysser av kolonnen **«Betalt»** i regnearket.

Dette er «sømløst» så langt en gratis, privat løsning kan være. Bekreft gjerne selv i Vipps-appen
at «Bokser» finnes og viser betalingsoversikt — funksjoner endres over tid.

---

## Oppsett — 4 steg

### 1) Google Sheet + påmeldingsmottak
1. Lag et nytt tomt Google Sheet (sheets.new).
2. **Utvidelser → Apps Script**. Slett det som står der, lim inn innholdet fra
   [`apps-script/Code.gs`](apps-script/Code.gs). Lagre.
3. **Distribuer → Ny distribusjon** → velg type **Web-app**.
   - *Kjør som*: **Meg selv**
   - *Hvem har tilgang*: **Alle** (Anyone)
4. Godkjenn tilgangene når Google spør. Kopier **web-app-URL-en** (slutter på `/exec`).

### 2) Vipps-boks
1. Åpne Vipps-appen → **Bokser** → lag en boks for julebordet.
2. Del boksen → **Kopier lenke**.

### 3) Fyll inn i `index.html`
Øverst i `<script>`-blokken finner du `CONFIG`. Fyll inn:
```js
const CONFIG = {
  pris: 500,
  vippsLenke: "https://qr.vipps.no/box/....",   // allerede satt — bytt ut med din egen boks
  paameldingEndepunkt: "LIM_INN_APPS_SCRIPT_URL_HER",
  detaljer: {
    dato:    "Fredag 4. desember 2026",
    tid:     "Kl. 19:00",
    sted:    "Restaurantens navn",
    adresse: "Gateadresse 1, 0000 By",
    antrekk: "Pent / mørk dress",
    frist:   "15. november 2026"
  }
};
```
> Tips: Du kan la `vippsLenke` og `paameldingEndepunkt` stå tomme (`""`) mens du tester —
> da fungerer siden fortsatt, men lagrer ikke og viser en deaktivert Vipps-knapp.

### 4) Publiser gratis med GitHub Pages
1. Push til GitHub (gjøres allerede av denne branchen).
2. På GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Velg branch (f.eks. `main`) og mappe `/root`. Lagre.
4. Etter et par minutter får du en offentlig URL du kan sende ut som invitasjon.

---

## Teste lokalt
Åpne `index.html` direkte i nettleseren, eller kjør en enkel server:
```bash
python3 -m http.server 8000
# åpne http://localhost:8000
```

## Personvern
Du samler inn navn, e-post, mobil, matpreferanser og kommentar. Del kun regnearket med
de som trenger det, og slett dataene etter arrangementet.

## Endre design/tekst
- Farger: `:root`-blokken øverst i `<style>`.
- Tekst/overskrifter: rediger direkte i HTML-en (godt kommentert).
