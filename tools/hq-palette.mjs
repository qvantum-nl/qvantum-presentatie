// Zet de platen (toepassingenplaat, principeplaten, InEx) om naar de HQ-huisstijl, variant D2 (akkoord Viktor 24-11-2026).
// Gebruik: node tools/hq-palette.mjs [bestand.svg ...]   zonder argumenten: alle platen in illustrations/ (behalve *-voor.svg).
// Draai dit opnieuw na elke run van tools/generate-*.js, want de generatoren schrijven nog de oude kleuren.
// Regels:
//  - Techniek blijft: rood warm, blauw koud, geel elektriciteit, temperatuurkleuren, accent (KEEP), en elke andere
//    verzadigde kleur (s > 0,38) zoals de luchtstromen in de QE-platen. Uitzondering: navy (te donker) en #3B5C80.
//  - Navy-vlakken: klein (< 1200 px²) = raam -> blauwgrijs #2C3644; groot = dak/zonnepaneel -> donkergrijs #2B2927.
//  - Kozijnlijnen #3B5C80 -> #4B5A6E. Overige navy (lijnen, tekst) -> #2B2927.
//  - Bomen houden hun groen; gras wordt gedempt saliegroen; water en licht glas blijven lichtblauw.
//  - Alle overige grijzen, olijf en wit -> warme HQ-grijzen met dezelfde lichtheid (wit -> paper #F4F3F0).
// Idempotent: een omgezet bestand krijgt de markering <!-- hq-palette D2 --> en wordt daarna overgeslagen.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const KEEP = new Set(['#C41230', '#3164FD', '#1E4BD8', '#2F5BFF', '#F2B705', '#FF8D5A', '#8FB8FF', '#9CC3FF', '#F08A96', '#5B9BD5', '#F4905F', '#B7D9FF', '#F4CDD2', '#D5DFFE', '#C9A85A', '#4AA1FF']);
const WIN = '#2C3644', WIN_LINE = '#4B5A6E', ROOF = '#2B2927';
const OUT = new Set([WIN, WIN_LINE, ROOF]);

const hue2 = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
const hls2hex = (h, l, s) => { let r, g, b; if (s === 0) r = g = b = l; else { const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = hue2(p, q, h + 1 / 3); g = hue2(p, q, h); b = hue2(p, q, h - 1 / 3); }
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, '0').toUpperCase()).join(''); };
const hex2hls = c => { const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, l, 0]; const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h / 6, l, s]; };
const warm = l => hls2hex(40 / 360, l, l < .5 ? .02 : .03 + .10 * l);

const area = pts => { const n = pts.trim().split(/[\s,]+/).map(Number), p = []; for (let i = 0; i + 1 < n.length; i += 2) p.push([n[i], n[i + 1]]);
  let a = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; };

const cache = new Map();
function map(c) {
  const C = c.toUpperCase(); if (KEEP.has(C) || OUT.has(C)) return c; if (cache.has(C)) return cache.get(C);
  const [h, l, s] = hex2hls(C), hd = h * 360; let out;
  if (C === '#FFFFFF') out = '#F4F3F0';
  else if (C === '#002656') out = ROOF;
  else if (C === '#F4F3F0') out = C;
  else if (l < .08) out = '#0A0A0A';
  else if (s > .38 && l > .25 && l < .9) out = c;                                        // verzadigd = techniek/betekenis: blijft
  else if (hd >= 75 && hd <= 160 && s > .25 && l <= .85) out = c;                          // bomen
  else if (hd >= 75 && hd <= 160 && s > .12 && l > .75) out = hls2hex(85 / 360, l - .015, .22); // gras
  else if (hd >= 190 && hd <= 230 && s > .25 && l > .7) out = c;                           // water, glas licht
  else out = warm(l);
  cache.set(C, out); return out;
}

const MARK = '<!-- hq-palette D2 -->';
export function hqPalette(svg) {
  if (svg.includes(MARK)) return svg;
  let s = svg.replace(/<polygon\b[^>]*#002656[^>]*>/g, tag => { const m = tag.match(/points="([^"]*)"/); let big = false; try { big = !!m && area(m[1]) > 1200; } catch {} return tag.replace(/#002656/g, big ? ROOF : WIN); });
  s = s.replace(/#3B5C80/gi, WIN_LINE);
  s = s.replace(/#[0-9A-Fa-f]{6}\b/g, c => map(c));
  return s.replace(/(<svg\b[^>]*>)/, `$1${MARK}`);
}

async function svgsIn(dir) { const out = []; for (const e of await readdir(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) out.push(...await svgsIn(p)); else if (e.name.endsWith('.svg') && !e.name.endsWith('-voor.svg')) out.push(p); } return out; }

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('hq-palette.mjs')) {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
  const files = process.argv.length > 2 ? process.argv.slice(2) : await svgsIn(path.join(root, 'illustrations'));
  let n = 0;
  for (const f of files) { const a = await readFile(f, 'utf8'), b = hqPalette(a); if (a !== b) { await writeFile(f, b); n++; console.log('omgezet  ' + path.relative(root, f)); } }
  console.log(`${n} van ${files.length} bestanden omgezet`);
}
