const dict = {
  en: {
    title: 'Pellet tracker', login: 'Family login', password: 'Password', enter: 'Enter', wrongPw: 'Wrong password',
    logout: 'Log out', install: 'Install', showPw: 'Show password', hidePw: 'Hide password',
    iosHint: 'To install on iPhone: open this page in Safari, tap the Share button, then "Add to Home Screen".', localBanner: 'Local mode: data is saved only in this browser. Fill in firebase-config.js to share it with the family.',
    add: 'New entry', edit: 'Edit entry', when: 'Date & time', now: 'now', bags: 'Bags', cleaned: 'Cleaned (soot)',
    restarted: 'Restarted', note: 'Note', save: 'Save', update: 'Update', cancel: 'Cancel',
    stats: 'Statistics', from: 'From', to: 'To', d7: '7 days', d14: '14 days', d30: '30 days', all: 'All',
    avgPlain: 'Average use', avgWeighted: 'Weighted average (recent counts more)', perDay: 'bags/day',
    totalBags: 'Bags added', refills: 'Refills', cleanings: 'Cleanings', restarts: 'Restarts',
    nextRefill: 'Next refill (estimate)', suggest: 'about {n} bags', basisLevel: 'based on bags in hopper', basisRoutine: 'assuming your usual leftover',
    noData: 'Not enough data (need 2+ refills)', history: 'History', empty: 'No entries in this range',
    del: 'Delete', confirmDel: 'Delete this entry?', settings: 'Settings', close: 'Close',
    horizon: 'Weighting horizon (days)', capacity: 'Hopper capacity (bags)', levelAfter: 'Bags in hopper right after a refill (optional)',
    kgPerBag: 'Kg per bag', defaultBags: 'Default bags per entry', exportCsv: 'Export CSV', exportJson: 'Export JSON',
    sinceClean: 'Since last cleaning', skipRestarts: 'Ignore intervals that ended with a restart in the averages', neverCleaned: 'never logged', daysUnit: 'days', chartTitle: 'Use per refill interval (bags/day)',
    bagsUnit: 'bags', kgDay: 'kg/day',
    importBtn: 'Import CSV/JSON', importDone: 'Imported {n} entries ({s} skipped)', importBad: 'Could not read that file', badBags: 'Bags must be a whole number (0 or more)',
  },
  hu: {
    title: 'Pellet napló', login: 'Családi belépés', password: 'Jelszó', enter: 'Belépés', wrongPw: 'Hibás jelszó',
    logout: 'Kilépés', install: 'Telepítés', showPw: 'Jelszó megjelenítése', hidePw: 'Jelszó elrejtése',
    iosHint: 'iPhone-on telepítéshez: nyisd meg Safariban, koppints a Megosztás gombra, majd a „Hozzáadás a főképernyőhöz" pontra.', localBanner: 'Helyi mód: az adatok csak ebben a böngészőben vannak. Töltsd ki a firebase-config.js-t a családi megosztáshoz.',
    add: 'Új bejegyzés', edit: 'Bejegyzés szerkesztése', when: 'Dátum és idő', now: 'most', bags: 'Zsákok', cleaned: 'Tisztítva (korom)',
    restarted: 'Újraindítva', note: 'Megjegyzés', save: 'Mentés', update: 'Frissítés', cancel: 'Mégse',
    stats: 'Statisztika', from: 'Tól', to: 'Ig', d7: '7 nap', d14: '14 nap', d30: '30 nap', all: 'Mind',
    avgPlain: 'Átlagos fogyasztás', avgWeighted: 'Súlyozott átlag (az újabb többet számít)', perDay: 'zsák/nap',
    totalBags: 'Betöltött zsákok', refills: 'Töltések', cleanings: 'Tisztítások', restarts: 'Újraindítások',
    nextRefill: 'Következő töltés (becslés)', suggest: 'kb. {n} zsák', basisLevel: 'a tartály szintje alapján', basisRoutine: 'a szokásos maradékot feltételezve',
    noData: 'Nincs elég adat (legalább 2 töltés kell)', history: 'Előzmények', empty: 'Nincs bejegyzés ebben az időszakban',
    del: 'Törlés', confirmDel: 'Törlöd ezt a bejegyzést?', settings: 'Beállítások', close: 'Bezár',
    horizon: 'Súlyozási időtáv (nap)', capacity: 'Tartály kapacitása (zsák)', levelAfter: 'Zsákok a tartályban töltés után (opcionális)',
    kgPerBag: 'Kg / zsák', defaultBags: 'Alapértelmezett zsákszám', exportCsv: 'CSV export', exportJson: 'JSON export',
    sinceClean: 'Utolsó tisztítás óta', skipRestarts: 'Az újraindítással végződő időszakok kihagyása az átlagokból', neverCleaned: 'nincs rögzítve', daysUnit: 'nap', chartTitle: 'Fogyasztás töltési időszakonként (zsák/nap)',
    bagsUnit: 'zsák', kgDay: 'kg/nap',
    importBtn: 'CSV/JSON import', importDone: '{n} bejegyzés importálva ({s} kihagyva)', importBad: 'Nem sikerült beolvasni a fájlt', badBags: 'A zsákok száma egész szám legyen (0 vagy több)',
  },
};

let lang = 'en';
export const getLang = () => lang;
export const setLang = (l) => { lang = dict[l] ? l : 'en'; document.documentElement.lang = lang; };
export const t = (k, vars = {}) =>
  (dict[lang][k] ?? k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? '');

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
}
