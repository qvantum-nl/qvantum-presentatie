#!/usr/bin/env node
// Controleert de referentiecases van de beurspresentatie. Draait zonder afhankelijkheden:
//   node tools/check-refcases.mjs [map met Beurspresentatie.dc.html]   (standaard: site/, anders de huidige map)
// Meldt FOUT (afsluitcode 1) of LET OP (afsluitcode 0) per punt:
//  1. elke case in de zichtbaarheidslijsten bestaat in REFCASES; geen dubbelen
//  2. elke case waarnaar de interactieve plaat verwijst (CASES in Interactieve plaat.dc.html en Mobiel.dc.html, aquathermie-knop) staat in PLATE_CASES en is in elke taal bereikbaar
//  3. elke zichtbare case heeft in elke taal een titel en de drie kerncijfers in copy.js
//  4. elk beeld van een case bestaat
//  5. elke case staat als pin op de kaart van zijn land, en elke pin hoort bij een bestaande case
//  6. de knopteksten op de plaat (caseRefs in plate.js) dekken in elke taal precies de koppelingen van de plaat
import { readFile, access } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(process.argv[2] || (await exists('site/Beurspresentatie.dc.html') ? 'site' : '.'));
const LANGS = ['nl', 'uk', 'de', 'se', 'pl', 'fr', 'dk', 'cz'];
const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
async function exists(p) { try { await access(p); return true; } catch { return false; } }
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);

const sec = await imp('i18n/sections.js');
const { COPY } = await imp('i18n/copy.js');
const plate = await imp('i18n/plate.js');
const RC = sec.REFCASES, ids = new Set(RC.map(r => r.id));
if (!sec.visibleCases || !sec.PLATE_CASES) { console.log('FOUT    i18n/sections.js is een oude versie zonder visibleCases/PLATE_CASES (export van vóór 9 nov 2026); importeer eerst de nieuwe export.'); process.exit(1); }

// 1. lijsten
for (const lang of LANGS) {
  const list = sec.VISIBILITY.refcases[lang];
  if (!list) { err(`geen zichtbaarheidslijst voor ${lang}`); continue; }
  const seen = new Set();
  for (const id of list) { if (!ids.has(id)) err(`${lang}: '${id}' in de zichtbaarheidslijst bestaat niet in REFCASES`); if (seen.has(id)) err(`${lang}: '${id}' staat dubbel in de lijst`); seen.add(id); }
}
for (const id of sec.PLATE_CASES) if (!ids.has(id)) err(`PLATE_CASES: '${id}' bestaat niet in REFCASES`);

// 2. koppelingen vanaf de plaat (Mobiel leest dezelfde CASES-tabel uit de plaat, dus één bron)
const plateCases = {};
for (const file of ['Interactieve plaat.dc.html', 'Mobiel.dc.html']) {
  const html = await readFile(path.join(root, file), 'utf8');
  if (file.startsWith('Interactieve')) {
    const m = html.match(/CASES = \{([^}]*)\}/); // waarde is één id ('x') of een lijst (['nieuw', 'oud'])
    if (!m) err(`${file}: geen CASES-tabel gevonden`);
    else for (const [, app, val] of m[1].matchAll(/(\w+):\s*(\[[^\]]*\]|'[^']+')/g)) { const list = [...val.matchAll(/'([^']+)'/g)].map(x => x[1]); plateCases[app] = list; if (list.length > 3) warn(`${file}: toepassing '${app}' heeft ${list.length} cases; alleen de eerste drie komen in beeld`); for (const id of list) { if (!ids.has(id)) err(`${file}: toepassing '${app}' verwijst naar onbekende case '${id}'`); if (!sec.PLATE_CASES.includes(id)) err(`${file}: '${id}' (toepassing '${app}') ontbreekt in PLATE_CASES in sections.js`); } }
  }
  for (const [, id] of html.matchAll(/'case:([a-z0-9-]+)'/g)) if (!sec.PLATE_CASES.includes(id)) err(`${file}: route 'case:${id}' ontbreekt in PLATE_CASES`);
}
for (const lang of LANGS) {
  const vis = new Set(sec.visibleCases(RC, lang).map(r => r.id));
  for (const id of sec.PLATE_CASES) { const rc = RC.find(r => r.id === id); if (rc && rc.from && Date.now() < Date.parse(rc.from)) { if (lang === 'nl') warn(`case '${id}' is verborgen tot ${rc.from} (publicatiedatum)`); continue; } if (!vis.has(id)) err(`${lang}: plaatcase '${id}' is niet bereikbaar (verborgen via hideRefcases?)`); }
}

// 3. teksten
for (const lang of LANGS) {
  const t = COPY[lang] || {};
  for (const r of sec.visibleCases(RC, lang)) {
    for (const k of ['_title', '_valuelabel1', '_valuelabel2', '_valuelabel4']) if (!t[r.k + k]) (k === '_title' ? err : warn)(`${lang}: case '${r.id}' mist tekst ${r.k}${k}`);
  }
}

// 4. beelden, inclusief extra beeld (media): maximaal 4 foto's en 1 video per case, video alleen voor plaatcases
for (const r of RC) for (const k of ['a', 'b', 'inset']) if (r[k] && !(await exists(path.join(root, r[k])))) err(`case '${r.id}': beeld ontbreekt: ${r[k]}`);
for (const r of RC) {
  const med = r.media || [];
  for (const m of med) for (const k of ['img', 'video', 'poster', 'plate']) if (m[k] && !(await exists(path.join(root, m[k])))) err(`case '${r.id}': media ontbreekt: ${m[k]}`);
  for (const m of med) if (m.video && !m.poster) warn(`case '${r.id}': video zonder poster (${m.video}); thumbnail blijft leeg`);
  const fotos = med.filter(m => !m.video).length + (r.inset ? 1 : 0), videos = med.filter(m => m.video).length;
  if (fotos > 4) warn(`case '${r.id}': ${fotos} extra foto's, afgesproken maximum is 4`);
  if (videos > 1) warn(`case '${r.id}': ${videos} video's, afgesproken maximum is 1`);
  if (videos && !sec.PLATE_CASES.includes(r.id)) warn(`case '${r.id}': video bij een case die niet op de interactieve plaat staat (afspraak: alleen PLATE_CASES)`);
}

// 5. kaartpinnen
const maps = Object.fromEntries(sec.MAPS.map(m => [m.id, m]));
for (const r of RC) { const m = maps[r.c]; if (!m) { warn(`case '${r.id}': geen kaart voor land '${r.c}'`); continue; } if (!m.pins[r.id]) warn(`case '${r.id}': geen pin op kaart ${r.c}`); }
for (const m of sec.MAPS) for (const id of Object.keys(m.pins)) if (!ids.has(id)) err(`kaart ${m.id}: pin '${id}' hoort bij geen enkele case`);

// 6. knopteksten op de plaat
for (const lang of LANGS) {
  const S = plate.plateFor(lang).S || {}, refs = S.caseRefs || {};
  const labels = S.caseLabels || {};
  for (const app of Object.keys(plateCases)) { const list = plateCases[app], last = list[list.length - 1]; for (const id of list) if (!labels[id] && !(id === last && refs[app])) err(`${lang}: plate.js mist knoptekst voor case '${id}' bij toepassing '${app}' (caseLabels, of caseRefs voor de laatste)`); }
  for (const app of Object.keys(refs)) if (!plateCases[app]) warn(`${lang}: plate.js caseRefs heeft '${app}' zonder koppeling in CASES`);
}

// 7. beeld per taal (LOCAL_IMG): bron en vervanging moeten bestaan
for (const [lang, map] of Object.entries(sec.LOCAL_IMG || {})) for (const [from, to] of Object.entries(map)) {
  if (!(await exists(path.join(root, from)))) warn(`LOCAL_IMG ${lang}: standaardbeeld ${from} ontbreekt`);
  if (!(await exists(path.join(root, to)))) err(`LOCAL_IMG ${lang}: vervanging ${to} ontbreekt (voor ${from})`);
}

// overzicht
console.log(`Referentiecases: ${RC.length} cases, ${LANGS.length} talen`);
for (const lang of LANGS) console.log(`  ${lang}: ${sec.visibleCases(RC, lang).map(r => r.id).join(', ')}`);
for (const w of warnings) console.log('LET OP  ' + w);
for (const e of errors) console.log('FOUT    ' + e);
console.log(errors.length ? `${errors.length} fout(en)` : 'Geen fouten' + (warnings.length ? `, ${warnings.length} aandachtspunt(en)` : ''));
process.exit(errors.length ? 1 : 0);
