// InEx-platen (toepassing 9): wijk iso (dezelfde primitives als generate-v3.js) + drie doorsnedes in de stijl van illustrations/principles/qg-appartement.svg
// Uitvoer: illustrations/inex/wijk.svg, woning.svg, woontoren.svg, blokken.svg + productplaten illustrations/principles/qg-woning-bodembron.svg, qa-qh-woning.svg, qe-woning-gevelrooster.svg, qe-qs-woning.svg, qe-qs-multiducto-woning.svg (zelfde woningdoorsnede)
const f = v => Math.round(v * 10) / 10;
const N = '#002656', NB = '#3B5C80', R = '#C41230', B = '#3164FD', B2 = '#2F5BFF', Y = '#A89880', EL = '#F2B705', WALL = '#91877A', BG = '#E5E6DF', ROOM = '#FFFFFF', ROOM2 = '#F5F5F1', SOIL = '#E4E8DC', HL = '#DEDFD8', WARM = '#F4CDD2', COLD = '#D5DFFE', LBL = '#91877A', SHAFT = '#D3D5CB', DOT = '#5B9BD5';
const FONT = `font-family="'Host Grotesk','Helvetica Neue',Arial,sans-serif"`;

/* ---------- 2D primitives ---------- */
const rect = (x, y, w, h, fill, ex = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${ex}/>`;
const path = (d, st, sw, ex = '') => `<path d="${d}" fill="none" stroke="${st}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${ex}/>`;
const flow = (d, cls, sw, dash = '10 70', ex = '') => `<path class="${cls}" d="${d}" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${dash}"${ex}/>`;
const TS = 1.45;
const txt = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-size="${f((o.size || 20) * TS)}" fill="${o.fill || LBL}" text-anchor="${o.anchor || 'start'}" font-weight="${o.weight || 400}" letter-spacing="${o.ls == null ? 2 : o.ls}"${o.k ? ` data-k="${o.k}"` : ''}${o.up ? ' data-up="1"' : ''}${o.pre ? ` data-pre="${o.pre}"` : ''}${o.post ? ` data-post="${o.post}"` : ''}${o.id ? ` id="${o.id}"` : ''}${o.ex || ''}>${t}</text>`;
const roomLbl = (x, y, t, k, anchor = 'middle') => txt(x, y, t, { k, up: 1, size: 18, anchor, ls: 2.5 });
// staande geïsoleerde buffer: ronde kop en voet, vulniveau (class tank-fill) binnen een clip, peilstreepjes rechts
const tank = (id, x, y, w, h, fill, housing) => { const r = Math.min(w, h) / 2; return `<g class="tank" data-tank="${id}">${housing ? rect(x - 10, y - 6, w + 20, h + 6, '#D6D7CE', ' stroke="#C4C6BB" stroke-width="1.5" rx="3"') : ''}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#FFFFFF" stroke="${N}" stroke-width="3"/><clipPath id="${id}-clip"><rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="${r - 3}"/></clipPath><rect class="tank-fill" clip-path="url(#${id}-clip)" x="${x + 3}" y="${y + h - 3}" width="${w - 6}" height="0" fill="${fill}"/>${[.3, .5, .7].map(p => `<line x1="${x + w - 16}" y1="${f(y + h * p)}" x2="${x + w - 8}" y2="${f(y + h * p)}" stroke="${N}" stroke-width="2"/>`).join('')}</g>`; };
// unit: wit blok, navy rand, blauwe statusled, naam
const unit = (x, y, w, h, name) => { const ink = '#3E3C3B', n = w < 60 ? 3 : 5, sw = w < 60 ? 5 : 8; let o = ''; for (let i = 0; i < n; i++) { const sx = x + w * .14 + i * (w * .72 / Math.max(1, n - 1)) - sw / 2; o += rect(sx, y - 9, sw, 11, '#E5E6DF', ` stroke="${ink}" stroke-width="1.5" rx="${sw / 2}"`); } o += rect(x, y, w, h, '#FFFFFF', ` stroke="${ink}" stroke-width="2.5" rx="1.5"`) + `<circle cx="${f(x + w / 2)}" cy="${f(y + h * .2)}" r="${w < 60 ? 3 : 5}" fill="${N}"/><circle cx="${f(x + w / 2 + (w < 60 ? .6 : 1))}" cy="${f(y + h * .2 - (w < 60 ? .4 : .6))}" r="${w < 60 ? 1.2 : 2}" fill="${R}"/>`; return o + txt(x + w / 2, y + h * .78, name, { size: w < 60 ? 12 : 18, fill: N, anchor: 'middle', weight: 600, ls: 0 }); };
// QA buitenunit als vooraanzicht (naar de iso-productrender): kast, ventilator links, lamellen rechts, twee pootjes
const ashp2d = (x, y, w, h, k, label = 'Lucht/water') => { const ink = '#3E3C3B', body = '#8E8880', r = h * .36, cx = x + w * .3, cy = y + h * .5; let o = rect(x + w * .08, y + h, w * .12, 7, ink) + rect(x + w * .8, y + h, w * .12, 7, ink) + rect(x, y, w, h, body, ` stroke="${ink}" stroke-width="3" rx="2"`); o += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${ink}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * .5)}" fill="none" stroke="${body}" stroke-width="2" opacity=".55"/>`; for (let i = 0; i < 4; i++) { const lx = f(x + w * .64 + i * w * .085); o += `<line x1="${lx}" y1="${f(y + h * .18)}" x2="${lx}" y2="${f(y + h * .82)}" stroke="${ink}" stroke-width="2.5"/>`; } o += txt(x + w * .93, y + h * .22, 'QA', { size: 11, fill: '#FFFFFF', anchor: 'end', weight: 600, ls: 0 }); return o + txt(x + w / 2, y - 12, label, { k, size: 18, fill: N, anchor: 'middle', ls: 0 }); };
// QE (ventilatiewarmtepomp) naar de iso-productrender: kast met naad op een derde, twee ronde kanaalaansluitingen op het dak (x + 12 en x + 32 bij w 46), blauwe led op het front
const spigots = (x, y, dx) => dx.map(d => { const cx = x + d; return rect(cx - 7, y - 8, 14, 9, '#E5E6DF', ' stroke="#3E3C3B" stroke-width="1.5"') + `<ellipse cx="${cx}" cy="${y - 8}" rx="7" ry="3" fill="#6E6C6A" stroke="#3E3C3B" stroke-width="1.5"/>`; }).join('');
const unitQE = (x, y, w, h) => { const ink = '#3E3C3B'; let o = spigots(x, y, [12, 34]); o += rect(x, y, w, h, '#FFFFFF', ` stroke="${ink}" stroke-width="2.5" rx="1.5"`) + `<line x1="${x}" y1="${f(y + h * .32)}" x2="${x + w}" y2="${f(y + h * .32)}" stroke="${ink}" stroke-width="1.5"/><circle cx="${f(x + w / 2)}" cy="${f(y + h * .5)}" r="3" fill="${N}"/><circle cx="${f(x + w / 2 + .6)}" cy="${f(y + h * .5 - .4)}" r="1.2" fill="${R}"/>`; return o + txt(x + w / 2, y + h * .82, 'QE', { size: 12, fill: N, anchor: 'middle', weight: 600, ls: 0 }); };
const pvt2d = (x, y, n, pitch = 56, w = 46, skew = 14, hh = 40) => Array.from({ length: n }, (_, i) => { const px = x + i * pitch; return `<polygon points="${px},${y} ${px + w},${y} ${px + w + skew},${y - hh} ${px + skew},${y - hh}" fill="${N}" stroke="${NB}" stroke-width="1.5"/><line x1="${px + skew / 2 + 8}" y1="${y - hh / 2}" x2="${px + w + skew / 2 - 8}" y2="${y - hh / 2}" stroke="${NB}" stroke-width="1.2"/>`; }).join('');
const trafo = (x, y, k) => rect(x, y, 36, 52, '#D3D5CB', ' stroke="#AEB0A4" stroke-width="1.5"') + rect(x + 5, y + 5, 26, 42, '#6E6C6A') + bolt(x + 18, y + 26, 8) + txt(x + 18, y - 10, 'stroom', { k, size: 13, anchor: 'middle', ls: 0 });
const bolt = (x, y, r = 11) => rect(x - r, y - r, 2 * r, 2 * r, EL, ' rx="2"') + `<polygon points="${[[.25, .75], [-.45, -.05], [0, -.05], [-.2, -.75], [.45, .05], [0, .05]].map(([a, b]) => f(x + a * r) + ',' + f(y + b * r)).join(' ')}" fill="${N}"/>`;
const hot = (id, x, y) => `<g data-hot="${id}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="30" fill="${B}"/><path d="M${x - 11} ${y}H${x + 11}M${x} ${y - 11}V${y + 11}" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/></g>`;
const snow = (x, y) => `<g data-season="winter" transform="translate(${x} ${y})" stroke="#4AA1FF" stroke-width="4" stroke-linecap="round" fill="none"><path d="M0 -24V24M-21 -12L21 12M-21 12L21 -12"/></g>`;
const sun = (x, y) => `<g data-season="summer" transform="translate(${x} ${y})"><circle r="17" fill="#F2B705"/><g stroke="#F2B705" stroke-width="4" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map(r => `<path d="M0 -24V-30" transform="rotate(${r})"/>`).join('')}</g></g>`;
const legend = (items, y = 1018) => { let x = 40; return items.map(([kind, t, k, col]) => { let sw = ''; if (kind === 'duct') sw = `<rect x="${x}" y="${y - 9}" width="40" height="12" rx="2" fill="${col}"/>`; else if (kind === 'dash') sw = `<path d="M${x} ${y - 3}H${x + 40}" stroke="${B2}" stroke-width="6" stroke-dasharray="7 5"/>`; else if (kind === 'gas') sw = `<rect x="${x}" y="${y - 7}" width="40" height="10" rx="2" fill="${Y}"/><rect x="${x + 6}" y="${y - 3}" width="8" height="2" fill="#FFFFFF"/><rect x="${x + 22}" y="${y - 3}" width="8" height="2" fill="#FFFFFF"/>`; else if (kind === 'el') sw = `<rect x="${x}" y="${y - 3.5}" width="40" height="3" fill="${EL}"/>`; else if (kind === 'tapw' || kind === 'tapc') sw = `<rect x="${x}" y="${y - 4}" width="40" height="4" rx="2" fill="${kind === 'tapw' ? R : B2}"/>`; else if (kind === 'src') sw = `<rect x="${x}" y="${y - 9}" width="40" height="5" rx="2.5" fill="${R}"/><rect x="${x}" y="${y - 1}" width="40" height="5" rx="2.5" fill="#5B9BD5"/>`; else if (kind === 'flow') sw = `<rect x="${x}" y="${y - 5}" width="40" height="6" rx="3" fill="#B9BBB0"/><rect x="${x + 6}" y="${y - 3}" width="8" height="2" fill="#FFFFFF"/><rect x="${x + 22}" y="${y - 3}" width="8" height="2" fill="#FFFFFF"/>`; else sw = `<rect x="${x}" y="${y - 5}" width="40" height="6" rx="3" fill="${kind === 'warm' ? R : B2}"/>`; const s = sw + txt(x + 52, y + 7, t, { k, up: 1, size: 16, ls: 2 }); x += 52 + t.length * 11.5 * TS + 56; return s; }).join(''); };
const head2d = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1050" ${FONT}>${rect(0, 0, 1800, 1050, BG)}`;

/* ---------- Woning-doorsnede (gedeeld door InEx-woning en de productplaten QG/QA/QE): woningtype E1–E5, twee bouwlagen van 2,7 m + kap 2,45 m, berging rechts, 76 px/m ---------- */
// hooks: pre (achter alles), pipes (na de huisleidingen, vóór meterpaneel en unit), post (bovenop, ook over het dak). attr = true → data-flow="fwd" en dash 8 64 (productplaten, flowPlate in Beurspresentatie/Mobiel)
// unitAt: 'berging' (QG/QH/InEx) of 'tech' (QE in een techniekkast naast de meterkast, schacht erboven); heating=false laat radiatoren en cv weg (Multiducto)
const houseSection = ({ H = 1050, unit: U, unitAt = 'berging', techUnits = {}, heating = true, attr = false, muted = false, gardenX = 1600, defs = '', pre = () => '', pipes = () => '', post = () => '', legendItems, legendRows }) => {
  const k = 76, G = 740, F1 = f(G - 2.7 * k), F2 = f(G - 5.4 * k), RIDGE = f(G - 7.85 * k), XL = 380, XR = 1080, WT = 20, FT = 20, MID = (XL + XR) / 2;
  const BX = 1326, BT = f(G - 2.6 * k), SB = BT - 16; // berging: buitenwand rechts, vloerpeil dak, dakplaat
  const tech = unitAt === 'tech'; U = U || (tech ? { name: 'QE', w: 46, h: 155 } : { name: 'QG', w: 55, h: 152 });
  // techniekkolom 640–800 (begane grond techniek, verdieping schacht): links de QS (en Multiducto), rechts de QE; toevoer naar links (woonkamer, slaapkamer), afzuiging naar rechts (keuken, badkamer)
  const CL = 640, CR = 800, TU = techUnits, mdX = tech && TU.md ? 646 : null, qsX = tech ? (TU.md ? 694 : TU.qs ? 672 : null) : null, qeX = tech ? (TU.md ? 752 : TU.qs ? 732 : 697) : null;
  const QX = tech ? qeX : 1100, QW = U.w, QH = U.h;
  const MK0 = 700, MK1 = 790; // meterkast tussen woonkamer en hal (wanden 8, binnen 708–782); kolommen: koud 712/722, gas 734/762, cv 744/752, warm tapwater 774
  const D = attr ? '8 64' : '8 60', fl = (p, cls, sw) => flow(p, cls, sw, D, attr ? ' data-flow="fwd"' : '');
  const C = { H, G, F1, F2, SB, BT, BX, XL, XR, QX, QW, QH, MK0, MK1, fl, CL, CR, qeX, qsX, mdX };
  let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 ${H}" ${FONT}>${defs}` + rect(0, 0, 1800, H, BG);
  o += rect(0, G, 1800, H - G, SOIL) + rect(0, G - 4, 1800, 4, '#C9CBC0');
  o += pre(C);
  // ruimtes: zolder (driehoek), verdieping, begane grond, berging
  o += `<polygon points="${XL},${F2} ${XR},${F2} ${MID},${RIDGE}" fill="${ROOM}"/>` + rect(XL + WT, F2, XR - XL - 2 * WT, G - F2, ROOM) + rect(XR, SB, BX - XR, G - SB, ROOM2);
  // wanden, vloeren, fundering; dak navy met scherpe hoeken (zoals de productplaten)
  o += rect(XL, F2, WT, G - F2, WALL) + rect(XR - WT, F2, WT, G - F2, WALL) + rect(XL, F1, XR - XL, FT, WALL) + rect(XL, F2, XR - XL, FT, WALL) + rect(XL - 10, G, BX - XL + 20, 22, WALL);
  if (!tech) o += rect(MK0, F1 + FT, 8, G - F1 - FT, WALL) + rect(MK1 - 8, F1 + FT, 8, G - F1 - FT, WALL) + rect(MK0 + 8, F1 + FT, MK1 - MK0 - 16, G - F1 - FT, SHAFT) + rect(880, F1 + FT, 8, G - F1 - FT, WALL) + rect(680, F2 + FT, 8, F1 - F2 - FT, WALL) + rect(850, F2 + FT, 8, F1 - F2 - FT, WALL);
  else o += rect(CL, F2 + FT, CR - CL, F1 - F2 - FT, SHAFT) + rect(CL - 8, F2 + FT, 8, G - F2 - FT, WALL) + rect(CR, F2 + FT, 8, G - F2 - FT, WALL); // techniekkolom
  o += `<path d="M${XL - 16} ${f(F2 + 8.5)}L${MID} ${RIDGE}L${XR + 16} ${f(F2 + 8.5)}" fill="none" stroke="${N}" stroke-width="22" stroke-linejoin="miter" stroke-miterlimit="8"/>`;
  // berging: dakplaat op de woningwand, buitenwand, deur naar de keuken
  o += rect(XR - WT, SB, BX - XR + WT, 16, WALL) + rect(BX - 16, SB, 16, G - SB, WALL) + rect(XR - WT, G - 152, WT, 152, ROOM2) + rect(XR - 12, G - 152, 4, 152, N);
  // labels
  o += roomLbl(tech ? 516 : 550, F1 + FT + 36, 'Woonkamer', 'rmLiving') + (tech ? '' : roomLbl(835, F1 + FT + 36, 'Hal', 'rmHall')) + roomLbl(tech ? 960 : 974, F1 + FT + 36, 'Keuken', 'rmKitchen');
  o += roomLbl(tech ? 516 : 540, F2 + FT + 36, 'Slaapkamer', 'rmBedroom') + (tech ? '' : roomLbl(769, F2 + FT + 36, 'Overloop', 'rmLanding')) + roomLbl(tech ? 960 : 957, F2 + FT + 36, 'Badkamer', 'rmBath') + roomLbl(tech ? 900 : MID, F2 - 22, 'Zolder', 'rmAttic');
  o += roomLbl(1150, BT + 28, 'Berging', 'rmStorage') + roomLbl(gardenX, G - 20, 'Tuin', 'rmGarden');
  let hp = '';
  if (!tech) {
    // berging: leidingen onder de vloer (van ondiep naar diep): warm tapwater 748, (gas 772), cv 790/800, koud water 812; gas én koud water komen via de meterkast (haarspeld achter het meterpaneel); cv en tapwater stijgen in de meterkast naar de verdiepingsvloer
    const CVR = 'M1132 712V790H500V736', CVB = 'M1140 712V800H460V736', RSR = 'M752 790V538.5H500V535', RSB = 'M744 800V551.5H470V535', HOT = 'M1104 712V748H774V545H1070V400H1036', COLD = 'M0 812H712V644H722V812H1148V712';
    hp += path(COLD, B2, 4) + fl(COLD, 'cv-fwd', 2);
    if (heating) hp += path(CVR, R, 5) + fl(CVR, 'cv-fwd', 2.5) + path(CVB, B2, 5) + fl('M460 736V800H1140V712', 'cv-fwd', 2.5) + path(RSR, R, 4) + fl(RSR, 'cv-fwd', 2) + path(RSB, B2, 4) + fl('M470 535V551.5H744V800', 'cv-fwd', 2);
    hp += path(HOT, R, 4) + fl(HOT, 'cv-fwd', 2) + path('M990 748V690', R, 4);
  } else {
    // techniekkolom: onder de QE van links naar rechts cv aanvoer, cv retour, koud water, warm tapwater; cv via de linkerbuitenwand naar beide radiatoren, warm tapwater via de rechterbuitenwand naar douche en keukenkraan
    const COLD = `M0 812H${QX + 28}V712`, HOT = `M${QX + 40} 712V748H1070V400H1036`;
    hp += path(COLD, B2, 4) + fl(COLD, 'cv-fwd', 2) + path(HOT, R, 4) + fl(HOT, 'cv-fwd', 2) + path('M1070 680H1046', R, 4);
    if (heating) { const CVR = `M${QX + 6} 712V790H394V520H430`, CVB = `M430 500H388V800H${QX + 16}V712`; hp += path(CVR, R, 5) + fl(CVR, 'cv-fwd', 2.5) + path('M500 790V736', R, 5) + fl('M500 790V736', 'cv-fwd', 2.5) + path(CVB, B2, 5) + fl(CVB, 'cv-fwd', 2.5) + path('M460 736V800', B2, 5) + fl('M460 736V800', 'cv-fwd', 2.5); }
  }
  // muted (InEx): huisleidingen op 35 % zodat gasleiding en bufferleiding het beeld dragen
  o += (muted ? `<g opacity=".35">${hp}</g>` : hp) + txt(40, 804, 'koud water', { k: 'hmCold', size: 14, ls: 0 });
  o += pipes(C);
  // meterpaneel in de meterkast (gas/water/stroom); de leidingen lopen erachter langs
  if (!tech) o += rect(MK0 + 8, 600, 68, 56, '#AEB0A4', ' rx="3"') + [0, 1, 2].map(i => `<circle cx="${MK0 + 24 + i * 18}" cy="628" r="4" fill="#6E6C6A"/>`).join('');
  // radiatoren (waaier: in de InEx-plaat per seizoen, in de productplaten alleen warm), keukenblok met kraan, douche hoog aan de buitenwand
  const rad = (x, y, w, h) => rect(x, y, w, h, '#FFFFFF', ` stroke="${N}" stroke-width="2.5" rx="3"`) + Array.from({ length: Math.floor(w / 22) - 1 }, (_, i) => `<line x1="${x + 20 + i * 22}" y1="${y + 8}" x2="${x + 20 + i * 22}" y2="${y + h - 8}" stroke="${N}" stroke-width="1.5"/>`).join('');
  const curl = (xs, y, c) => xs.map(x => path(`M${x} ${y}C${x - 8} ${y - 14} ${x + 8} ${y - 26} ${x} ${y - 40}`, c, 3)).join('');
  const fan = (xs, y) => attr ? curl(xs, y, R) : `<g data-season="winter">${curl(xs, y, R)}</g><g data-season="summer">${curl(xs, y, B2)}</g>`;
  if (heating) o += rad(430, 690, 110, 46) + fan([455, 485, 515], 676) + rad(430, 489, 90, 46) + fan([460, 490], 475) + roomLbl(485, 842, 'Verwarming', 'rmHeating');
  o += rect(934, G - 68, 112, 68, '#F5F5F1', ` stroke="${WALL}" stroke-width="2"`) + rect(930, G - 74, 120, 8, WALL, ' rx="1.5"') + `<line x1="990" y1="${G - 58}" x2="990" y2="${G - 4}" stroke="${WALL}" stroke-width="1.5"/><line x1="978" y1="${G - 44}" x2="978" y2="${G - 30}" stroke="${WALL}" stroke-width="2.5"/><line x1="1002" y1="${G - 44}" x2="1002" y2="${G - 30}" stroke="${WALL}" stroke-width="2.5"/>`;
  o += `<g transform="translate(979 ${G - 84.4}) scale(.65)"><rect width="34" height="16" rx="3" fill="${WALL}"/><path d="M17 2V-26Q17 -42 3 -42Q-11 -42 -11 -28" fill="none" stroke="${WALL}" stroke-width="6"/></g>` + txt(990, 626, 'Tapwater', { k: 'rmTap', size: 14, fill: N, anchor: 'middle', ls: 0 });
  o += `<path d="M1046 396H1024L1016 412H1054Z" fill="${WALL}"/><path d="M1022 422V492M1035 422V492M1048 422V492" stroke="${B2}" stroke-width="3" stroke-dasharray="7 8" stroke-linecap="round"/>` + txt(1000, 412, 'Douche', { k: 'rmShower', size: 14, fill: N, anchor: 'end', ls: 0 });
  // unit, vóór de leidingen die erachter beginnen
  if (tech) { // QS (toevoermodule) naast de QE, met de waterleidingen ertussen; bij Multiducto de verdeelkast links van de QS
    if (qsX != null) o += path(`M${qsX + 46} 620H${QX}`, R, 3) + path(`M${qsX + 46} 640H${QX}`, B2, 3) + spigots(qsX, 600, [12, 34]) + rect(qsX, 600, 46, 60, '#FFFFFF', ` stroke="#3E3C3B" stroke-width="2.5" rx="1.5"`) + txt(qsX + 23, 636, 'QS', { size: 12, fill: N, anchor: 'middle', weight: 600, ls: 0 });
    if (mdX != null) o += spigots(mdX, 600, [18]) + rect(mdX, 600, 36, 60, '#FFFFFF', ` stroke="#3E3C3B" stroke-width="2.5" rx="1.5"`) + `<text transform="translate(${mdX + 23} 630) rotate(-90)" font-size="13" font-weight="600" fill="${N}" text-anchor="middle">Multiducto</text>`;
    o += unitQE(QX, G - QH, QW, QH); } else o += unit(QX, G - QH, QW, QH, U.name);
  o += post(C);
  const rows = legendRows || [legendItems]; rows.forEach((it, i) => { o += legend(it, H - 32 - 34 * (rows.length - 1 - i)); });
  o += '</svg>';
  return o;
};
const tree = G => `<line x1="1720" y1="${G - 4}" x2="1720" y2="${G - 30}" stroke="${WALL}" stroke-width="5"/><circle cx="1720" cy="${G - 58}" r="34" fill="#A9CB9C"/><circle cx="1708" cy="${G - 72}" r="18" fill="#C6DEBA"/>`;
// hotspot als blauwe pil met tekst — niet meer gebruikt op de productplaten (touchscreen: bezoekers wijzen aan en openen per ongeluk het paneel); de knop staat onder de plaat
const hotPill = (id, x, y, t, k) => `<g data-hot="${id}" style="cursor:pointer"><rect x="${x}" y="${y}" width="250" height="44" rx="8" fill="${B}"/>${txt(x + 125, y + 29, t, { k, size: 13, fill: '#FFFFFF', anchor: 'middle', weight: 600, ls: 0 })}</g>`;

/* ---------- A · InEx-woning: bestaand gasnet, QG in de berging, buffer buiten of binnen ---------- */
{
  const o = houseSection({ muted: true,
    legendItems: [['gas', 'bestaande gasleiding', 'lgGas'], ['warm', 'warm', 'lgWarm'], ['cold', 'koud', 'lgCold'], ['flow', 'stroming', 'lgFlow']],
    pre: () => path('M0 890H1800', Y, 18) + flow('M0 890H1800', 'main-flow', 6, '12 84') + txt(40, 936, 'Bestaande gasleiding', { k: 'hmLoop1', size: 22, fill: N, ls: 0 }) + txt(40, 962, 'ontworpen voor 8 bar gas · draait nu op 1–2 bar water', { k: 'hmLoop2', size: 17, ls: 0 }),
    pipes: ({ G, SB, BX, QX, QW }) => {
      const TW = f(.9 * 76), TH = f(2 * 76), TX = 1420, TY = G - TH, TC = TX + TW / 2, IX = 1226, IC = IX + TW / 2, GAS = 'M734 890V636H762V772H1118V740', QC = QX + QW / 2;
      // aansluitleiding (één leiding, bestaand, geel): straat → meterkast → QG; ademt: streepjes wisselen van richting
      let s = path(GAS, Y, 10) + flow(GAS, 'svc-in', 4, '8 36') + flow('M1118 740V772H762V636H734V890', 'svc-out', 4, '8 36');
      s += tree(G);
      // buffer buiten (standaard): Ø 0,9 × 2,0 m ≈ 1,3 m³ in een lichtgrijze omkasting; de leiding begint achter het midden van de unit
      s += '<g id="buf-out">' + path(`M${QC} 650H${TX}`, R, 10, ' class="buf-pipe"') + flow(`M${QC} 650H${TX}`, 'buf-in', 4, '8 36') + flow(`M${TX} 650H${QC}`, 'buf-out', 4, '8 36') + rect(TX - 22, G, TW + 44, 8, '#C4C6BB') + tank('tk-out', TX, TY, TW, TH, WARM, true) + txt(TC, TY - 30, 'Buffer', { k: 'hmStore', size: 20, fill: N, anchor: 'middle', weight: 600, ls: 0 }) + txt(TC, TY - 54, '0,5 – 2 m³', { k: 'hmStoreSize', size: 16, anchor: 'middle', ls: 0 }) + txt(TX + TW + 24, 660, '', { id: 'st-out', size: 15, fill: N, ls: 0 }) + '</g>';
      // buffer binnen (berging), naast de QG
      s += '<g id="buf-in" style="display:none">' + path(`M${QC} 650H${IX}`, R, 10, ' class="buf-pipe"') + flow(`M${QC} 650H${IX}`, 'buf-in', 4, '8 36') + flow(`M${IX} 650H${QC}`, 'buf-out', 4, '8 36') + tank('tk-in', IX, TY, TW, TH, WARM) + txt(IC, SB - 14, 'Buffer', { k: 'hmStore', size: 18, fill: N, anchor: 'middle', weight: 600, ls: 0 }) + txt(BX + 24, 660, '', { id: 'st-in', size: 15, fill: N, ls: 0 }) + '</g>';
      return s; },
    post: ({ QX, QW }) => txt(754, 846, '', { id: 'svc-lbl', size: 17, fill: N, weight: 600, ls: 0 }) + txt(754, 870, 'één leiding', { k: 'hmOne', size: 17, fill: N, ls: 0 }) + snow(70, 86) + sun(70, 86) + txt(112, 98, 'Winter', { id: 'season-lbl', size: 34, fill: N, weight: 600, ls: 0 }) + txt(112, 128, '', { id: 'season-sub', size: 19, ls: 0 }) + hot('kleppen', QX + QW + 16, 612),
  });
  await saveFile('illustrations/inex/woning.svg', o);
}

/* ---------- P1 · Productplaat QG met bodembron (16:9, data-flow voor flowPlate) ---------- */
const PLEG = [['warm', 'verwarming aanvoer', 'lgCvFwd'], ['cold', 'retour', 'lgCvBack'], ['tapw', 'tapwater warm', 'lgTapW'], ['tapc', 'tapwater koud', 'lgTapC']];
const SRC = '#5B9BD5';
{
  const o = houseSection({ H: 1012, attr: true, legendItems: [...PLEG, ['src', 'bodembron', 'lgSrc']],
    pipes: ({ G }) => {
      // bron: twee leidingen van de QG onder de bergingvloer door naar een bodemlus in de tuin
      const OUT = 'M1112 712V760H1500V920', IN = 'M1516 920V772H1124V712';
      return tree(G) + path(OUT, SRC, 6) + flow(OUT, 'src-out', 3, '8 64', ' data-flow="fwd"') + path(IN, R, 6) + flow(IN, 'src-in', 3, '8 64', ' data-flow="fwd"') + `<path d="M1500 920A8 8 0 0 0 1516 920" fill="none" stroke="${R}" stroke-width="6"/>` + txt(1540, 870, 'Bodembron', { k: 'qgSource', size: 17, fill: N, ls: 0 }); },
  });
  await saveFile('illustrations/principles/qg-woning-bodembron.svg', o);
}

/* ---------- P2 · Productplaat QA (buitenunit in de tuin) + QH (binnenunit in de berging) ---------- */
{
  const AX = 1370, AW = 98, AH = 70;
  const o = houseSection({ H: 1012, attr: true, unit: { name: 'QH', w: 55, h: 112 }, gardenX: 1700, legendItems: [...PLEG, ['src', 'buitenunit', 'lgSrc']],
    pipes: ({ G }) => {
      const OUT = `M1112 712V760H${AX + 30}V${G - 30}`, IN = `M${AX + 42} ${G - 30}V772H1124V712`;
      let s = path(OUT, SRC, 6) + flow(OUT, 'src-out', 3, '8 64', ' data-flow="fwd"') + path(IN, R, 6) + flow(IN, 'src-in', 3, '8 64', ' data-flow="fwd"');
      s += ashp2d(AX, G - 7 - AH, AW, AH, 'qaOut', 'Buitenunit');
      // buitenlucht: twee gestippelde pijlen van rechts de lamellen in
      s += `<path d="M1600 ${G - 56}C1570 ${G - 56} 1560 ${G - 48} ${AX + AW + 6} ${G - 48}M1600 ${G - 26}C1570 ${G - 26} 1560 ${G - 34} ${AX + AW + 6} ${G - 34}" fill="none" stroke="${B2}" stroke-width="5" stroke-dasharray="7 6"/><path d="M${AX + AW - 4} ${G - 48}L${AX + AW + 10} ${G - 56}V${G - 40}ZM${AX + AW - 4} ${G - 34}L${AX + AW + 10} ${G - 42}V${G - 26}Z" fill="${B2}"/>` + txt(1604, G - 64, 'Buitenlucht', { k: 'qaAir', size: 15, fill: N, ls: 0 });
      return s; },
  });
  await saveFile('illustrations/principles/qa-qh-woning.svg', o);
}

/* ---------- P3 · QE-platen: NIET uit deze generator. De oorspronkelijke handgetekende platen (qe-woning-gevelrooster.svg, qe-qs-woning.svg, qe-qs-multiducto-woning.svg) zijn teruggezet vanuit handoff/qvantum/illustrations/principles/ (13 okt): afvoerlucht navy, waterleidingen op 35 %. De tech-modus van houseSection (techniekkolom met QE/QS) blijft beschikbaar maar wordt niet gebruikt. ---------- */

/* ---------- P4 · Aquathermie: energiedamwand (Theehuis Vreeswijk) en warmtewisselaar in oppervlaktewater; 16:9, data-flow voor flowPlate ---------- */
// doorsnede haaks op de kade: kanaalwater links, damwand op x 700, kade met paviljoen rechts; 100 px/m, kadepeil 460, waterpeil 540, bodem 860
{
  const H = 1012, G = 460, WL = 540, BED = 860, WX = 700, WATER = '#B7D9FF', STEEL = '#5A5955', SRC = '#5B9BD5';
  const rad = (x, y, w, h) => rect(x, y, w, h, '#FFFFFF', ` stroke="${N}" stroke-width="2.5" rx="3"`) + Array.from({ length: Math.floor(w / 24) - 1 }, (_, i) => `<line x1="${x + 22 + i * 24}" y1="${y + 8}" x2="${x + 22 + i * 24}" y2="${y + h - 8}" stroke="${N}" stroke-width="1.5"/>`).join('');
  const fl = (d, cls) => flow(d, cls, 3, '8 64', ' data-flow="fwd"');
  const scene = (variant) => {
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 ${H}" ${FONT}>` + rect(0, 0, 1800, H, BG);
    // water, bodem, kade
    o += rect(0, WL, WX, BED - WL, WATER) + rect(0, BED, WX, H - BED, SOIL) + rect(WX, G, 1800 - WX, H - G, SOIL) + rect(WX, G - 4, 1800 - WX, 4, '#C9CBC0') + rect(0, WL - 3, WX, 3, '#8FB8FF');
    // gebouw aan het water (6 × 3,2 m): glazen pui links, plat dak, QG binnen, convector aan de pui; bij de warmtewisselaar staat het gebouw verder van de kade
    const X0 = variant === 'damwand' ? 860 : 1000, X1 = X0 + 600, TOP = G - 320;
    o += rect(X0 + 20, TOP, X1 - X0 - 40, G - TOP, ROOM) + rect(X0 - 10, TOP - 20, X1 - X0 + 20, 20, WALL) + rect(X1 - 20, TOP, 20, G - TOP, WALL) + rect(X0 - 10, G, X1 - X0 + 20, 22, WALL);
    o += rect(X0, TOP, 20, 16, WALL) + rect(X0, G - 20, 20, 20, WALL) + rect(X0 + 6, TOP + 16, 8, G - TOP - 36, '#9CC3FF') + `<line x1="${X0 + 10}" y1="${TOP + 16}" x2="${X0 + 10}" y2="${G - 20}" stroke="#FFFFFF" stroke-width="1.5" opacity=".7"/>`;
    o += roomLbl((X0 + X1) / 2, TOP + 38, variant === 'damwand' ? 'Theehuis' : 'Woning', variant === 'damwand' ? 'aqRoom' : 'rmHouse');
    const QX = X1 - 100, QW = 60, QH = 200;
    // cv: QG → convector aan de pui (onder de vloer)
    const RX = X0 + 40, CVR = `M${QX + 12} 440V490H${RX + 40}V460`, CVB = `M${QX + 22} 440V500H${RX + 80}V460`;
    o += path(CVR, R, 5) + fl(CVR, 'cv') + path(CVB, B2, 5) + fl(`M${RX + 80} 460V500H${QX + 22}V440`, 'cv');
    if (variant === 'damwand') {
      // bronlus: twee leidingen langs de landzijde van de damwand tot bijna onderin, U onderaan
      const OUT = `M${QX + 34} 440V536H720V900`, IN = `M732 900V548H${QX + 44}V440`;
      o += path(OUT, SRC, 6) + fl(OUT, 'src') + path(IN, R, 6) + fl(IN, 'src') + `<path d="M732 900A6 6 0 0 1 720 900" fill="none" stroke="${R}" stroke-width="6"/>`;
    } else {
      // warmtewisselaar in een put op de kade: inname uit het water, retour terug het water in; bronleidingen naar de QG
      o += rect(840, G, 110, 120, ROOM2, ` stroke="${WALL}" stroke-width="3"`);
      const INT = 'M620 660H882V556', RET = 'M910 556V700H640', SO = `M934 516H${QX + 34}V440`, SI = `M${QX + 44} 440V532H934`;
      o += path(INT, SRC, 6) + fl(INT, 'src') + rect(596, 648, 24, 24, '#6E6C6A', ' rx="2"') + path(RET, B2, 6) + fl(RET, 'src') + `<path d="M640 692L626 700L640 708Z" fill="${B2}"/>`;
      o += path(SO, R, 6) + fl(SO, 'src') + path(SI, SRC, 6) + fl(SI, 'src');
      o += rect(854, 496, 80, 60, '#FFFFFF', ` stroke="${N}" stroke-width="2.5" rx="2"`) + `<path d="M864 542L879 508L894 542L909 508L924 542" fill="none" stroke="${N}" stroke-width="2"/>`;
      o += txt(894, 448, 'Warmtewisselaar', { k: 'aqHx', size: 14, fill: N, anchor: 'middle', ls: 0 });
    }
    // damwand (stalen plaat met kop), convector, unit
    o += rect(WX - 2, 436, 16, 494, STEEL) + rect(WX - 10, 430, 32, 8, '#3E3C3B');
    o += rad(RX, 410, 120, 50) + unit(QX, G - QH, QW, QH, 'QG');
    if (variant === 'damwand') {
      for (const y of [620, 700, 780]) o += `<path d="M646 ${y}H684" stroke="${R}" stroke-width="5" stroke-linecap="round"/><path d="M684 ${y - 8}L696 ${y}L684 ${y + 8}Z" fill="${R}"/>`;
      o += txt(632, 626, 'warmte uit het water', { k: 'aqHeat', size: 14, fill: N, anchor: 'end', ls: 0 });
      o += txt(690, 422, 'Energiedamwand', { k: 'aqWall', size: 18, fill: N, anchor: 'end', weight: 600, ls: 0 }) + txt(748, 690, 'collector achter de damwand', { k: 'aqColl', size: 14, fill: N, ls: 0 });
    } else {
      o += txt(690, 422, 'Damwand', { k: 'aqWallPlain', size: 18, fill: N, anchor: 'end', weight: 600, ls: 0 }) + txt(600, 636, 'inname', { k: 'aqIntake', size: 13, anchor: 'end', ls: 0 }) + txt(612, 726, 'retour', { k: 'aqReturn', size: 13, anchor: 'end', ls: 0 });
    }
    o += txt(40, 580, 'Kanaalwater', { k: 'aqWater', size: 18, fill: N, weight: 600, ls: 0 });
    o += txt(40, 950, 'Winter: warmte uit het water. Zomer: warmte terug in het water.', { k: 'aqNote', size: 15, ls: 0 });
    o += legend([['warm', 'verwarming aanvoer', 'lgCvFwd'], ['cold', 'retour', 'lgCvBack'], ['src', variant === 'damwand' ? 'bron via de damwand' : 'bron via de warmtewisselaar', variant === 'damwand' ? 'lgSrcWall' : 'lgSrcHx']], H - 32);
    return o + '</svg>';
  };
  await saveFile('illustrations/principles/aqua-damwand.svg', scene('damwand'));
  await saveFile('illustrations/principles/aqua-teo.svg', scene('teo'));
}

/* ---------- P5 · Datacenter op het ZLT-uitwisselingsnet (bron E): zonder afnemer (warmte via drycoolers de lucht in) en met warmtelevering aan het net; 16:9, data-flow voor flowPlate ---------- */
// zijaanzicht naar het Haskoning-schema (Warmte365, 12 okt 2026): woningen met QG links, koelcentrale met drycoolers op het dak in het midden, serverzaal rechts.
// Twee gescheiden kringen. Primair (serverkring): racks 30 °C → TSA koeling (rechterzijde) → koelmachine (verdamper) → 20 °C terug naar de racks. Secundair (drycoolerkring, in serie): drycoolers → blauwe stijgleiding 890 → TSA koeling (links, boven in/onder uit) → condensor koelmachine → rode stijgleiding 870 → TSA warmtelevering → drycoolers. Net: secundaire zijde TSA warmtelevering → QG. Standalone uit te voeren: kop van dit bestand + dit blok.
{
  const H = 1012, G = 790, TOP = 330, MUTE = '#B9BBB0', INK = '#3E3C3B', GR = '#91877A';
  const fl = (d, cls) => flow(d, cls, 3, '8 64', ' data-flow="fwd"');
  const halo = d => path(d, BG, 14); // kruising: bovenliggende leiding krijgt een onderbreking in de onderliggende
  // warmtewisselaar: rechthoek met diagonaal (twee gescheiden zijden)
  const hx = (x, y, w, h, on = true) => { const c = on ? N : MUTE; return rect(x, y, w, h, '#FFFFFF', ` stroke="${c}" stroke-width="2.5" rx="2"`) + `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="${c}" stroke-width="2"/>`; };
  const dot = (x, y, c) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}"/>`;
  const arrowL = (x, y, c) => `<path d="M${x + 18} ${y - 10}L${x} ${y}L${x + 18} ${y + 10}Z" fill="${c}"/>`;
  const arrowR = (x, y, c) => `<path d="M${x - 18} ${y - 10}L${x} ${y}L${x - 18} ${y + 10}Z" fill="${c}"/>`;
  const curl = (x, y, c) => path(`M${x} ${y}C${x - 8} ${y - 14} ${x + 8} ${y - 26} ${x} ${y - 40}`, c, 3);
  // drycooler: kast met drie ventilatoren bovenop en lamellen; on = draait (rode warmtekrullen)
  const dry = (x, y, w, h, on) => { const body = on ? '#8E8880' : '#C4C6BB'; let o = rect(x, y, w, h, body, ` stroke="${INK}" stroke-width="2.5" rx="2"`); for (let i = 0; i < 6; i++) { const lx = f(x + 24 + i * ((w - 48) / 5)); o += `<line x1="${lx}" y1="${y + 18}" x2="${lx}" y2="${y + h - 12}" stroke="${INK}" stroke-width="2"/>`; } for (let i = 0; i < 3; i++) { const cx = f(x + w * (.2 + .3 * i)); o += `<circle cx="${cx}" cy="${y}" r="20" fill="${INK}"/><circle cx="${cx}" cy="${y}" r="10" fill="none" stroke="${body}" stroke-width="2"/>`; if (on) o += curl(cx, y - 32, R); } return o; };
  const rack = (x, y) => { let o = rect(x, y, 54, 200, N, ' rx="2"'); for (let j = 0; j < 8; j++) o += rect(x + 8, y + 12 + j * 23, 34, 4, NB) + `<circle cx="${x + 46}" cy="${y + 14 + j * 23}" r="1.8" fill="#9CC3FF"/>`; return o; };
  const scene = variant => {
    const net = variant === 'net', dryOn = !net;
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 ${H}" ${FONT}>` + rect(0, 0, 1800, H, BG);
    o += rect(0, G, 1800, H - G, SOIL) + rect(0, G - 4, 1800, 4, '#C9CBC0');
    // gebouwen: woningen 40–340, koelcentrale 620–1140 (drycoolers op het dak), serverzaal 1240–1720
    const bld = (x0, x1) => rect(x0 + 20, TOP, x1 - x0 - 40, G - TOP, ROOM) + rect(x0, TOP - 20, x1 - x0, 20, WALL) + rect(x0, TOP, 20, G - TOP, WALL) + rect(x1 - 20, TOP, 20, G - TOP, WALL) + rect(x0 - 10, G, x1 - x0 + 20, 22, WALL);
    o += bld(40, 340) + bld(620, 1140) + bld(1240, 1720);
    o += roomLbl(190, TOP + 36, 'Woningen', 'dzHomes') + txt(190, TOP + 64, 'verwarming en tapwater', { k: 'dzHomesSub', size: 14, fill: net ? N : GR, anchor: 'middle', ls: 0 });
    o += roomLbl(745, TOP + 36, 'Koelcentrale', 'dzPlant') + roomLbl(1480, TOP + 36, 'Serverzaal', 'dzHall');
    o += txt(1480, TOP - 44, 'Datacenter', { k: 'dzDc', size: 18, fill: N, anchor: 'middle', weight: 600, ls: 0 });
    for (let i = 0; i < 4; i++) o += rack(1330 + i * 80, 560);
    // primaire kring (servers): racks → TSA koeling → koelmachine → racks
    const P1 = 'M1600 520H1080', P2 = 'M1080 580H1120V710H1080', P3 = 'M1080 730H1160V770H1600';
    o += path(P1, R, 6) + fl(P1, 'srv') + path(P2, R, 6) + fl(P2, 'srv') + path(P3, B2, 6) + fl(P3, 'srv');
    for (let i = 0; i < 4; i++) { const x = 1357 + i * 80; o += path(`M${x} 520V560`, R, 4) + path(`M${x} 760V770`, B2, 4); }
    o += txt(1206, 506, '30 °C', { size: 16, fill: R, anchor: 'middle', weight: 600, ls: 0 }) + txt(1206, 760, '20 °C', { size: 16, fill: B2, anchor: 'middle', weight: 600, ls: 0 });
    // secundaire kring (drycoolers): blauw omlaag via 890 naar TSA en condensor, rood omhoog via 870 naar de drycoolers; TSA warmtelevering parallel op de rode stijgleiding
    // drycoolerkring in serie (naar het schema): drycoolers (koud, blauw) → stijgleiding 890 → TSA koeling linksboven in, linksonder uit → condensor koelmachine → warm (rood) via stijgleiding 870 omhoog; TSA warmtelevering op die stijgleiding (580 in, 540 uit)
    const UP = net ? B2 : R; // boven de TSA warmtelevering: zonder afnemer warm naar de drycoolers, met afnemer afgekoeld terug
    const B_H1 = 'M690 282H890', B_H2 = 'M1080 282H890', B_RISE = 'M890 282V500H960', B_MID = 'M960 600H890V710H900';
    const R_LOW = 'M900 730H870V580', R_BYP = 'M870 580V540', R_UP = 'M870 540V260', R_H1 = 'M870 260H690', R_H2 = 'M870 260H1080';
    const E_F = 'M870 580H820', E_B = 'M820 540H870';
    o += path(B_H2, B2, 6) + fl(B_H2, 'dry') + path(B_RISE, B2, 6) + fl(B_RISE, 'dry') + path(B_MID, B2, 6) + fl(B_MID, 'dry');
    o += path(R_LOW, R, 6) + fl(R_LOW, 'dry') + (net ? path(R_BYP, MUTE, 6) : path(R_BYP, R, 6) + fl(R_BYP, 'dry')) + path(R_UP, UP, 6) + fl(R_UP, 'dry') + path(R_H1, UP, 6) + fl(R_H1, 'dry') + path(R_H2, UP, 6) + fl(R_H2, 'dry');
    o += halo('M858 282H882') + path(B_H1, B2, 6) + fl(B_H1, 'dry');
    o += path(E_F, net ? R : MUTE, 6) + path(E_B, net ? B2 : MUTE, 6) + (net ? fl(E_F, 'exp') + fl(E_B, 'exp') + dot(870, 580, R) + dot(870, 540, B2) : '');
    // net: secundaire zijde TSA warmtelevering → QG in de woningen en terug
    const N_R = 'M700 520H230V590', N_B = 'M250 590V600H700';
    o += path(N_R, net ? R : MUTE, 6) + path(N_B, net ? B2 : MUTE, 6);
    if (net) o += fl(N_R, 'net') + fl(N_B, 'net') + arrowL(350, 520, R) + arrowR(690, 600, B2) + txt(480, 502, '± 25 °C', { size: 16, fill: R, anchor: 'middle', weight: 600, ls: 0 }) + txt(480, 634, '± 15 °C', { size: 16, fill: B2, anchor: 'middle', weight: 600, ls: 0 });
    // koelmachine: verdamper rechts (serverkring), condensor links (drycoolerkring)
    o += rect(900, 690, 180, 60, '#FFFFFF', ` stroke="${N}" stroke-width="2.5" rx="3"`) + `<line x1="990" y1="690" x2="990" y2="750" stroke="${N}" stroke-width="2"/><circle cx="945" cy="720" r="16" fill="none" stroke="${N}" stroke-width="2.5"/>` + rect(1010, 708, 52, 24, 'none', ` stroke="${N}" stroke-width="2"`);
    o += txt(990, 776, 'Koelmachine', { k: 'dzChiller', size: 15, fill: N, anchor: 'middle', ls: 0 });
    // warmtewisselaars, QG en drycoolers bovenop de leidingen
    o += hx(960, 490, 120, 120) + txt(1020, 474, 'TSA koeling', { k: 'dzHxCool', size: 17, fill: N, anchor: 'middle', ls: 0 });
    o += hx(700, 490, 120, 120, net) + txt(760, 474, 'TSA warmtelevering', { k: 'dzHxExp', size: 17, fill: net ? N : GR, anchor: 'middle', ls: 0 });
    o += unit(210, G - 200, 60, 200, 'QG');
    o += dry(650, 230, 200, 80, dryOn) + dry(910, 230, 200, 80, dryOn);
    o += txt(880, 128, dryOn ? 'warmte naar de buitenlucht' : 'drycoolers alleen op warme dagen', { k: dryOn ? 'dzAir' : 'dzPeak', size: 18, fill: dryOn ? R : GR, anchor: 'middle', weight: 600, ls: 0 });
    // net tussen woningen en koelcentrale
    o += txt(480, 450, 'ZLT-uitwisselingsnet', { k: 'dzNet', size: 20, fill: net ? N : GR, anchor: 'middle', weight: 600, ls: 0 });
    if (!net) o += txt(480, 660, 'aansluiting gereserveerd,', { k: 'dzReserved1', size: 16, fill: GR, anchor: 'middle', ls: 0 }) + txt(480, 688, 'nog geen afnemer', { k: 'dzReserved2', size: 16, fill: GR, anchor: 'middle', ls: 0 });
    o += txt(40, 950, net ? 'Dezelfde warmte, nu het net in. De drycoolers blijven staan: het datacenter blijft altijd zelfstandig.' : 'Het datacenter koelt het hele jaar. Zonder afnemer verdwijnt de warmte via de drycoolers in de lucht.', { k: net ? 'dzNoteNet' : 'dzNoteAir', size: 18, fill: '#232222', ls: 0 });
    o += legend([['warm', 'warm · aanvoer', 'lgDzWarm'], ['cold', 'koud · retour', 'lgDzCold']], H - 32);
    return o + '</svg>';
  };
  await saveFile('illustrations/principles/datacenter-lucht.svg', scene('lucht'));
  await saveFile('illustrations/principles/datacenter-net.svg', scene('net'));
}

/* ---------- P6 · Passief koelen (QG + QP-koelset, zelfde module zit in de QG-7-P): drie standen Verwarmen / Passief koelen / Actief koelen + koelvermogengrafiek; 16:9 ---------- */
// Woningdoorsnede als P1. De QP-koelset hangt in de berging naast de QG: beide bronleidingen lopen via de set (mengkraan), de platenwisselaar zit op één lijn. Verwarmen: bron → QG, wisselaar passief. Passief koelen: compressor uit, bron (koud) geeft via de wisselaar koude aan de cv; de bodem laadt op. Actief koelen: compressor aan, bron neemt de warmte op. Standalone uit te voeren: kop + houseSection + dit blok.
{
  const MUTE = '#B9BBB0', GR = '#91877A';
  const fl = (d, cls) => flow(d, cls, 3, '8 64', ' data-flow="fwd"');
  const head = (x, y, dir, c) => dir === 'L' ? `<path d="M${x + 14} ${y - 8}L${x} ${y}L${x + 14} ${y + 8}Z" fill="${c}"/>` : dir === 'R' ? `<path d="M${x - 14} ${y - 8}L${x} ${y}L${x - 14} ${y + 8}Z" fill="${c}"/>` : dir === 'U' ? `<path d="M${x - 8} ${y + 14}L${x} ${y}L${x + 8} ${y + 14}Z" fill="${c}"/>` : `<path d="M${x - 8} ${y - 14}L${x} ${y}L${x + 8} ${y - 14}Z" fill="${c}"/>`;
  const rad = (x, y, w, h) => rect(x, y, w, h, '#FFFFFF', ` stroke="${N}" stroke-width="2.5" rx="3"`) + Array.from({ length: Math.floor(w / 22) - 1 }, (_, i) => `<line x1="${x + 20 + i * 22}" y1="${y + 8}" x2="${x + 20 + i * 22}" y2="${y + h - 8}" stroke="${N}" stroke-width="1.5"/>`).join('');
  const curl = (xs, y, c) => xs.map(x => path(`M${x} ${y}C${x - 8} ${y - 14} ${x + 8} ${y - 26} ${x} ${y - 40}`, c, 3)).join('');
  const scene = mode => {
    const heat = mode === 'heat', pas = mode === 'passive', act = mode === 'active';
    const cA = heat ? R : SRC, cB = pas ? R : cA, cC = heat ? SRC : R; // bron: grond → QP, QP → QG, QG → QP → grond
    const cvS = heat ? R : B2, cvR = heat ? B2 : R; // cv aanvoer / retour
    return houseSection({ H: 1012, attr: true, heating: false, legendItems: [['warm', 'warm', 'lgWarm'], ['cold', 'koud', 'lgCold'], ['src', 'bodembron', 'lgSrc']],
      pipes: ({ G }) => {
        let o = tree(G);
        // bron: grond → QP (x 1252), QP → QG (links, y 560/590), QG → QP → grond (x 1296)
        const G_IN = 'M1516 920V772H1252V670', QP_QG = 'M1190 620H1170V700H1155', QG_QP = 'M1155 712H1178V650H1190', QP_OUT = 'M1296 670V760H1500V920';
        o += path(G_IN, cA, 6) + fl(G_IN, 'src') + path(QP_QG, cB, 6) + fl(QP_QG, 'src') + path(QG_QP, cC, 6) + fl(QG_QP, 'src') + path(QP_OUT, cC, 6) + fl(QP_OUT, 'src') + `<path d="M1500 920A8 8 0 0 0 1516 920" fill="none" stroke="${cC}" stroke-width="6"/>`;
        o += head(1252, 700, 'U', cA) + head(1296, 740, 'D', cC);
        // cv: bij verwarmen en actief koelen vanuit de QG, bij passief koelen vanuit de QP
        const S0 = pas ? 'M1200 670V790' : 'M1132 712V790', R0 = pas ? 'H1210V670' : 'H1140V712';
        const CVS = S0 + 'H500V736', CVR = 'M460 736V800' + R0, RSS = 'M752 790V538.5H500V535', RSR = 'M470 535V551.5H744V800';
        o += path(CVS, cvS, 5) + fl(CVS, 'cv') + path(CVR, cvR, 5) + fl(CVR, 'cv') + path(RSS, cvS, 4) + fl(RSS, 'cv') + path(RSR, cvR, 4) + fl(RSR, 'cv');
        o += head(600, 790, 'L', cvS) + head(600, 800, 'R', cvR);
        // radiatoren met warmte- (rood) of koudewaaier (blauw)
        o += rad(430, 690, 110, 46) + curl([455, 485, 515], 676, heat ? R : B2) + rad(430, 489, 90, 46) + curl([460, 490], 475, heat ? R : B2) + roomLbl(485, 842, heat ? 'Verwarming' : 'Koeling', heat ? 'rmHeating' : 'rmCooling');
        return o;
      },
      post: ({ G }) => {
        let o = '';
        // QP-koelset aan de wand: platenwisselaar (actief bij passief koelen), mengkraan, circulatiepomp
        const phe = pas ? N : MUTE;
        o += rect(1190, 600, 110, 70, '#FFFFFF', ` stroke="${N}" stroke-width="2.5" rx="3"`);
        o += rect(1200, 610, 30, 50, pas ? '#D5DFFE' : '#FFFFFF', ` stroke="${phe}" stroke-width="2"`) + `<path d="M1206 652L1212 618L1218 652L1224 618" fill="none" stroke="${phe}" stroke-width="1.6"/>`;
        o += `<path d="M1246 616L1258 626L1246 636ZM1270 616L1258 626L1270 636Z" fill="${pas ? N : MUTE}"/><circle cx="1276" cy="654" r="9" fill="none" stroke="${pas ? N : MUTE}" stroke-width="2"/><path d="M1272 649L1283 654L1272 659Z" fill="${pas ? N : MUTE}"/>`;
        o += txt(1245, 594, 'QP', { size: 12, fill: N, anchor: 'middle', weight: 600, ls: 0 });
        o += txt(1127, G - 154, heat || act ? 'compressor aan' : 'compressor uit', { k: heat || act ? 'qpCompOn' : 'qpCompOff', size: 10, fill: pas ? GR : N, anchor: 'middle', ls: 0 });
        o += txt(1540, 870, 'Bodembron', { k: 'qgSource', size: 17, fill: N, ls: 0 }) + txt(1540, 896, pas || act ? 'neemt warmte op' : 'levert warmte', { k: pas || act ? 'qpSrcIn' : 'qpSrcOut', size: 13, fill: GR, ls: 0 });
        o += txt(40, 950, heat ? 'Verwarmen: de bron levert warmte aan de QG, de compressor brengt die op temperatuur. De koelset doet niets.' : pas ? 'Passief koelen: de compressor staat uit. De koude bron koelt via de platenwisselaar het afgiftesysteem; alleen de circulatiepomp draait. De bodem laadt op voor de winter.' : 'Actief koelen: de compressor koelt het afgiftesysteem verder af (7/12 °C mogelijk). De warmte gaat de bodem in.', { k: heat ? 'qpNoteHeat' : pas ? 'qpNotePassive' : 'qpNoteActive', size: 15, fill: '#232222', ls: 0 });
        return o;
      },
    });
  };
  await saveFile('illustrations/principles/qgp-verwarmen.svg', scene('heat'));
  await saveFile('illustrations/principles/qgp-passief.svg', scene('passive'));
  await saveFile('illustrations/principles/qgp-actief.svg', scene('active'));

  // Koelvermogengrafiek (uit de QG-7-P-handleiding / QP-presentatie, afgelezen): bron 10 → 15 °C, retour 21 en 23 °C, 6 kW-module en 2 modules (QG-14)
  const DATA = { 21: { one: [6.2, 3.4], two: [12.3, 6.8] }, 23: { one: [7.3, 4.6], two: [14.7, 9.2] } };
  const W = 1800, H = 1012; let g = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ${FONT}>` + rect(0, 0, W, H, BG);
  const panel = (x0, ret, kRet) => {
    const PW = 700, PH = 620, y0 = 130, XM = 10, XX = 16, YM = 0, YX = 16;
    const px = v => x0 + (v - XM) / (XX - XM) * PW, py = v => y0 + PH - (v - YM) / (YX - YM) * PH;
    let o = rect(x0, y0, PW, PH, '#FFFFFF', ` stroke="${HL}" stroke-width="1.5"`);
    for (let v = XM; v <= XX; v++) o += `<line x1="${px(v)}" y1="${y0}" x2="${px(v)}" y2="${y0 + PH}" stroke="${HL}" stroke-width="1"/>` + txt(px(v), y0 + PH + 30, String(v), { size: 13, fill: '#6E6C6A', anchor: 'middle', ls: 0 });
    for (let v = YM; v <= YX; v += 2) o += `<line x1="${x0}" y1="${py(v)}" x2="${x0 + PW}" y2="${py(v)}" stroke="${HL}" stroke-width="1"/>` + txt(x0 - 14, py(v) + 5, String(v), { size: 13, fill: '#6E6C6A', anchor: 'end', ls: 0 });
    const d = DATA[ret];
    o += path(`M${px(10)} ${py(d.two[0])}L${px(15)} ${py(d.two[1])}`, R, 4, ' stroke-dasharray="14 10"') + path(`M${px(10)} ${py(d.one[0])}L${px(15)} ${py(d.one[1])}`, N, 4);
    const lab = (v, x, dy, c, anchor) => txt(x, py(v) + dy, String(v).replace('.', ',') + ' kW', { size: 15, fill: c, anchor, weight: 600, ls: 0 });
    o += lab(d.one[0], px(10) + 10, -14, N, 'start') + lab(d.one[1], px(15) + 12, 6, N, 'start') + lab(d.two[0], px(10) + 10, -14, R, 'start') + lab(d.two[1], px(15) + 12, 6, R, 'start');
    o += txt(x0, y0 - 60, ret + ' °C', { k: kRet, pre: '', size: 24, fill: N, weight: 600, ls: 0 }) + txt(x0 + 116, y0 - 60, 'retourtemperatuur afgiftesysteem', { k: 'qpChartRet', size: 16, fill: GR, ls: 0 });
    o += txt(x0 + PW / 2, y0 + PH + 66, 'brontemperatuur in (°C)', { k: 'qpChartX', size: 16, fill: GR, anchor: 'middle', ls: 0 });
    o += txt(x0 - 14, y0 - 22, 'kW', { size: 14, fill: GR, anchor: 'end', ls: 0 });
    return o;
  };
  g += panel(140, 21, 'qpRet21') + panel(960, 23, 'qpRet23');
  // legenda
  g += `<line x1="160" y1="900" x2="200" y2="900" stroke="${N}" stroke-width="4"/>` + txt(212, 906, '6 kW-module: QG-7-P, QG-7 + QP', { k: 'qpLegOne', size: 17, fill: N, ls: 0 });
  g += `<line x1="660" y1="900" x2="700" y2="900" stroke="${R}" stroke-width="4" stroke-dasharray="14 10"/>` + txt(712, 906, 'twee modules: QG-14 + QP', { k: 'qpLegTwo', size: 17, fill: N, ls: 0 });
  g += txt(160, 950, 'Bij nominaal debiet van afgiftesysteem en bron. Afgelezen uit de fabrieksgrafiek; indicatief.', { k: 'qpChartNote', size: 15, fill: GR, ls: 0 });
  await saveFile('illustrations/principles/qgp-koelvermogen.svg', g + '</svg>');
}

/* ---------- P7 · (VERVALLEN, 21 okt) Thermische batterij-herontwerp. De platen tb-*.svg zijn de oorspronkelijke handgetekende versies (illustrations/principles/old-tb/) met alleen een stromingsoverlay (data-flow) per actieve leiding; blok staat hier uit (false &&). ---------- */
// Hydraulische module: buffervat 175 l met elektrisch element, platenwisselaar tapwater met pomp, verdeelklep (condensor → buffer of verwarming), mengklep (retour / buffer) met pomp. Warmtepompmodule: verdamper, compressor, condensor, expansieventiel; bron onderaan. Inactieve leidingen grijs, actieve met stroming.
if (false) {
  const MUTE = '#B9BBB0', GR = '#91877A', EL2 = '#F2B705';
  const fl = (d, cls) => flow(d, cls, 3, '8 64', ' data-flow="fwd"');
  const pp = (d, col, on, w = 6) => path(d, on ? col : MUTE, w) + (on ? fl(d, 'tb') : '');
  const hx = (x, y, w, h, on) => rect(x, y, w, h, '#FFFFFF', ` stroke="${on ? N : MUTE}" stroke-width="2.5" rx="2"`) + `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="${on ? N : MUTE}" stroke-width="2"/>`;
  const pump = (x, y, on, dir = 'D') => { const c = on ? N : MUTE, t = dir === 'D' ? `M${x - 7} ${y - 6}L${x + 7} ${y - 6}L${x} ${y + 8}Z` : dir === 'L' ? `M${x + 6} ${y - 7}L${x + 6} ${y + 7}L${x - 8} ${y}Z` : `M${x - 6} ${y - 7}L${x - 6} ${y + 7}L${x + 8} ${y}Z`; return `<circle cx="${x}" cy="${y}" r="16" fill="#FFFFFF" stroke="${c}" stroke-width="2.5"/><path d="${t}" fill="${c}"/>`; };
  const valve3 = (x, y, on, ports) => { const c = on ? N : MUTE; const T = { L: `M${x - 20} ${y - 13}L${x} ${y}L${x - 20} ${y + 13}Z`, R: `M${x + 20} ${y - 13}L${x} ${y}L${x + 20} ${y + 13}Z`, U: `M${x - 13} ${y - 20}L${x} ${y}L${x + 13} ${y - 20}Z`, D: `M${x - 13} ${y + 20}L${x} ${y}L${x + 13} ${y + 20}Z` }; return `<path d="${ports.map(p => T[p]).join('')}" fill="${c}"/>`; };
  const arrow = (x, y, dir, c) => dir === 'L' ? `<path d="M${x + 18} ${y - 10}L${x} ${y}L${x + 18} ${y + 10}Z" fill="${c}"/>` : dir === 'U' ? `<path d="M${x - 10} ${y + 18}L${x} ${y}L${x + 10} ${y + 18}Z" fill="${c}"/>` : `<path d="M${x - 10} ${y - 18}L${x} ${y}L${x + 10} ${y - 18}Z" fill="${c}"/>`;
  const scene = mode => {
    const tap = mode === 1 || mode === 4, hp = mode !== 1, toTank = mode === 2, toHeat = mode === 3 || mode === 4, fromTank = mode === 2 || mode === 4, elOn = mode === 4;
    let o = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1012" ${FONT}><defs><linearGradient id="tbTank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${R}"/><stop offset=".5" stop-color="#E39AA8"/><stop offset=".8" stop-color="#9CC3FF"/><stop offset="1" stop-color="${B2}"/></linearGradient></defs>` + rect(0, 0, 1800, 1012, BG);
    // kast en modules
    o += rect(420, 100, 1000, 820, 'none', ` stroke="${N}" stroke-width="2" stroke-dasharray="10 8" rx="6"`) + txt(436, 134, 'QG', { size: 22, fill: N, weight: 600, ls: 0 }) + txt(1404, 134, 'Hydraulische module', { k: 'tbHydro', size: 15, fill: GR, anchor: 'end', ls: 0 });
    o += rect(560, 660, 540, 220, '#ECEDE7', ` stroke="${HL}" stroke-width="1.5" rx="4"`) + txt(1086, 684, 'Warmtepompmodule', { k: 'tbHpModule', size: 15, fill: GR, anchor: 'end', ls: 0 });
    // verwarming (boven) en bron (onder) buiten de kast
    o += txt(1330, 60, 'Verwarming', { k: 'tbHeating', size: 18, fill: toHeat ? N : GR, anchor: 'middle', weight: 600, ls: 0 }) + txt(1300, 86, 'aanvoer', { k: 'tbFlow', size: 13, fill: GR, anchor: 'end', ls: 0 }) + txt(1360, 86, 'retour', { k: 'tbReturn', size: 13, fill: GR, anchor: 'start', ls: 0 });
    o += txt(560, 962, 'Bron', { k: 'tbSource', size: 18, fill: hp ? N : GR, anchor: 'end', weight: 600, ls: 0 });
    // tapwater links
    o += txt(320, 300, 'Warm tapwater', { k: 'tbHw', size: 15, fill: tap ? N : GR, ls: 0 }) + txt(320, 432, 'Koud water', { k: 'tbCw', size: 15, fill: tap ? N : GR, ls: 0 }) + txt(320, 500, 'circulatie', { k: 'tbCirc', size: 13, fill: tap ? N : GR, ls: 0 });
    // --- leidingen ---
    // tapwater primair: buffer boven → platenwisselaar → pomp → buffer onder
    o += pp('M760 220H580V300', R, tap) + pp('M580 420V530H760', B2, tap);
    // tapwater secundair: koud water → wisselaar → warm tapwater; circulatie
    o += pp('M320 400H560', B2, tap) + pp('M560 320H320', R, tap) + arrow(320, 320, 'L', tap ? R : MUTE) + pp('M320 470H500V400', EL2, tap, 4);
    o += rect(440, 390, 30, 20, '#FFFFFF', ` stroke="${tap ? N : MUTE}" stroke-width="2"`) + `<path d="M444 394L466 406M444 406L466 394" stroke="${tap ? N : MUTE}" stroke-width="1.5"/>`;
    // condensor → verdeelklep; verdeelklep → buffer / → verwarming aanvoer
    o += pp('M1040 730H1120V268', R, hp) + pp('M1102 250H920', R, toTank) + pp('M1138 250H1300V100', R, toHeat) + (toHeat ? arrow(1300, 100, 'U', R) : '');
    // verwarming retour → mengklep A; buffer → mengklep B (kruising met de stijgleiding); mengklep → pomp → condensor
    o += pp('M1360 100V542', B2, toHeat) + path('M1108 520H1132', BG, 14) + pp('M920 520H1342', toTank ? B2 : R, fromTank) + pp('M1360 578V830H1040', B2, hp);
    // bron: aanvoer (warm uit de bodem) naar de verdamper, retour koud terug
    o += pp('M640 940V830H660', R, hp) + pp('M660 730H620V940', SRC, hp) + arrow(620, 940, 'D', hp ? SRC : MUTE) + arrow(640, 940, 'U', hp ? R : MUTE);
    // koudemiddelkring: verdamper → compressor → condensor → expansieventiel → verdamper
    const RF = 'M680 720V690H846', RF2 = 'M894 690H1020V720', RF3 = 'M1020 840V858H884', RF4 = 'M856 858H680V840';
    for (const d of [RF, RF2, RF3, RF4]) o += path(d, hp ? N : MUTE, 3, hp ? '' : ' stroke-dasharray="6 6"') + (hp ? flow(d, 'tb', 2, '6 40', ' data-flow="fwd"') : '');
    // --- componenten ---
    o += rect(760, 180, 160, 380, 'url(#tbTank)', ` stroke="${N}" stroke-width="3" rx="40"`) + txt(840, 164, 'Buffervat 175 l', { k: 'tbTank', size: 15, fill: N, anchor: 'middle', weight: 600, ls: 0 });
    o += (elOn ? bolt(840, 528, 12) : rect(828, 516, 24, 24, '#D6D7CE', ' rx="2"')) + txt(840, 584, 'elektrisch element', { k: 'tbEl', size: 12, fill: elOn ? N : GR, anchor: 'middle', ls: 0 });
    o += hx(560, 300, 40, 120, tap) + txt(580, 284, 'Platenwisselaar', { k: 'tbPhex', size: 13, fill: tap ? N : GR, anchor: 'middle', ls: 0 }) + pump(580, 478, tap, 'D');
    o += valve3(1120, 250, hp, ['L', 'R', 'D']) + txt(1120, 218, 'Verdeelklep', { k: 'tbDv', size: 13, fill: hp ? N : GR, anchor: 'middle', ls: 0 });
    o += valve3(1360, 560, hp, ['U', 'L', 'D']) + txt(1392, 566, 'Mengklep', { k: 'tbMv', size: 13, fill: hp ? N : GR, ls: 0 }) + pump(1360, 650, hp, 'D');
    o += hx(660, 720, 40, 120, hp) + txt(680, 900, 'Verdamper', { k: 'tbEvap', size: 13, fill: hp ? N : GR, anchor: 'middle', ls: 0 });
    o += hx(1000, 720, 40, 120, hp) + txt(1020, 900, 'Condensor', { k: 'tbCond', size: 13, fill: hp ? N : GR, anchor: 'middle', ls: 0 });
    o += `<circle cx="870" cy="690" r="24" fill="#FFFFFF" stroke="${hp ? N : MUTE}" stroke-width="2.5"/><path d="M858 702L870 676L882 702" fill="none" stroke="${hp ? N : MUTE}" stroke-width="2"/>` + txt(870, 652, 'Compressor', { k: 'tbComp', size: 13, fill: hp ? N : GR, anchor: 'middle', ls: 0 });
    o += `<path d="M856 846L870 858L856 870ZM884 846L870 858L884 870Z" fill="${hp ? N : MUTE}"/>` + txt(870, 900, 'Expansieventiel', { k: 'tbExp', size: 13, fill: hp ? N : GR, anchor: 'middle', ls: 0 });
    o += txt(1020, 940, hp ? 'compressor aan' : 'compressor uit', { k: hp ? 'tbOn' : 'tbOff', size: 13, fill: hp ? N : GR, anchor: 'middle', ls: 0 });
    o += legend([['warm', 'warm', 'lgWarm'], ['cold', 'koud', 'lgCold'], ['el', 'circulatie tapwater', 'lgCirc'], ['src', 'bron', 'lgSrc']], 980);
    return o + '</svg>';
  };
  await saveFile('illustrations/principles/tb-tapwater.svg', scene(1));
  await saveFile('illustrations/principles/tb-buffer.svg', scene(2));
  await saveFile('illustrations/principles/tb-verwarming.svg', scene(3));
  await saveFile('illustrations/principles/tb-alles.svg', scene(4));
}

// woningaansluiting op de gele leiding: winter neemt de QG warm af en levert koud terug, zomer neemt hij koud af en levert warm terug (kleuren en richting wisselen met het seizoen)
const homePipes = (xr, xu, y0) => { const pin = xr < xu ? `M${xr} ${y0 + 46}H${xu}` : `M${xr} ${y0 + 46}H${xu}`, pout = `M${xu} ${y0 + 94}H${xr}`; const g = (cIn, cOut) => path(pin, cIn, 5) + flow(pin, 'fl-home', 2.5, '8 40') + path(pout, cOut, 5) + flow(pout, 'fl-home', 2.5, '8 40'); return `<g data-season="winter">${g(R, B2)}</g><g data-season="summer">${g(B2, R)}</g>`; };

/* ---------- D · Woontoren (doorsnede) ---------- */
{
  let o = head2d;
  o += rect(0, 800, 1800, 250, SOIL) + rect(0, 796, 1800, 4, '#C9CBC0');
  // romp
  o += rect(396, 200, 684, 596, ROOM) + rect(996, 200, 84, 596, SHAFT) + rect(990, 200, 6, 596, WALL);
  let hp = ''; // woningleidingen op 35 %: de gele leiding en de buffers dragen het beeld
  for (let i = 0; i < 5; i++) { const y0 = 200 + i * 120, n = 5 - i; if (i) o += rect(396, y0 - 6, 594, 10, WALL); o += txt(420, y0 + 30, 'Woning ' + n, { k: 'twHome', post: ' ' + n, up: 1, size: 17, ls: 2.5 });
    o += unit(900, y0 + 22, 44, 92, 'QG');
    hp += homePipes(1040, 944, y0);
    if (i === 0) o += txt(760, y0 + 30, 'onttrekken ↓ · terugleveren ↑', { k: 'twTake', size: 15, anchor: 'middle', ls: 0 }); }
  o += `<g opacity=".35">${hp}</g>` + rect(380, 180, 16, 620, WALL) + rect(1080, 180, 16, 620, WALL) + rect(380, 164, 716, 18, WALL) + rect(360, 796, 760, 16, WALL);
  // stijgleiding: één leiding, wisselt van richting
  // kelder
  o += rect(396, 812, 684, 108, ROOM2) + rect(380, 812, 16, 116, WALL) + rect(1080, 812, 16, 116, WALL) + rect(380, 920, 716, 12, WALL) + rect(396, 796, 684, 16, WALL);
  o += roomLbl(430, 846, 'Kelder', 'rmBasement', 'start');
  o += path('M1040 900V164', Y, 14) + flow('M1040 900V164', 'rise-up', 7, '16 42') + flow('M1040 164V900', 'rise-down', 7, '16 42');
  o += txt(1110, 450, 'één stijgleiding', { k: 'twRiser1', size: 19, fill: N, weight: 600, ls: 0 }) + txt(1110, 480, 'dak- en grondbuffer', { k: 'twRiser2', size: 16, ls: 0 }) + txt(1110, 506, 'wisselen uit', { k: 'twRiser3', size: 16, ls: 0 });
  // dak: lucht/water, PVT, dakbuffer; de stijgleiding komt onder in de dakbuffer uit
  // dak: lucht/water links, PVT rechts ernaast; twee aparte leidingen naar de dakbuffer (PVT-verzamelleiding op 116, lucht/water op 100, alleen winter); stroom PVT → unit en PVT → trafo (door de dakplaat, langs de linkergevel)
  o += `<g opacity=".35">${path('M810 116H1000', R, 6) + flow('M810 116H1000', 'pv-flow', 3, '8 50')}</g><g data-season="winter" opacity=".35">${path('M750 100H1000', R, 6) + flow('M750 100H1000', 'pv-flow', 3, '8 50')}</g><g data-season="summer">${path('M750 100H1000', '#C4C6BB', 6) + txt(770, 92, 'uit', { k: 'twOff', size: 13, ls: 0 })}</g>`;
  o += path('M800 160H750', EL, 3) + path('M800 164V176H372V770H352', EL, 3) + ashp2d(640, 94, 110, 70, 'twAshp') + pvt2d(800, 164, 3) + txt(890, 86, 'PVT', { size: 16, fill: N, weight: 600, ls: 1, anchor: 'middle' });
  o += trafo(316, 744, 'twPower');
  o += tank('tk-roof', 1010, 54, 60, 110, WARM, true) + txt(1040, 36, 'dakbuffer', { k: 'twRoofStore', size: 16, fill: N, anchor: 'middle', ls: 0 });
  // grondbuffer naast de toren, aan dezelfde leiding
  o += path('M1040 900H800', Y, 12) + flow('M800 900H1040', 'rise-up', 6, '16 42') + flow('M1040 900H800', 'rise-down', 6, '16 42');
  o += tank('tk-ground', 640, 826, 200, 86, WARM, true) + txt(740, 852, 'grondbuffer', { k: 'twGroundStore', size: 16, fill: N, anchor: 'middle', ls: 0, ex: ' transform="translate(0 -6)"' });
  o += txt(1116, 870, '', { id: 'st-ground', size: 16, fill: N, ls: 0 });
  o += snow(70, 86) + sun(70, 86) + txt(112, 98, 'Winter', { id: 'season-lbl', size: 34, fill: N, weight: 600, ls: 0 });
  o += legend([['warm', 'warm', 'lgWarm'], ['cold', 'koud', 'lgCold'], ['el', 'stroom van pvt', 'lgEl'], ['flow', 'stroming', 'lgFlow']]);
  o += '</svg>';
  await saveFile('illustrations/inex/woontoren.svg', o);
}

/* ---------- F · Twee blokken als één gebouw (doorsnede) ---------- */
// één gebouw (200–1240) met twee vleugels, schachten links en rechts; de lus: straat → links omhoog → over het dak onder het PVT-veld → rechts omlaag → onder de grond terug. Dakbuffer (gevoed door PVT) en grondbuffer (gevoed door de lucht/water-unit) voeden de lus elk in één richting; de lus zelf wisselt elke 10 s van richting.
{
  let o = head2d;
  o += rect(0, 800, 1800, 250, SOIL) + rect(0, 796, 1800, 4, '#C9CBC0');
  const X0 = 200, X1 = 1240, LX = 256, RX = 1184, TOPY = 150;
  o += rect(X0 + 16, 200, X1 - X0 - 32, 596, ROOM) + rect(X0 + 16, 200, 80, 596, SHAFT) + rect(X0 + 96, 200, 6, 596, WALL) + rect(X1 - 96, 200, 80, 596, SHAFT) + rect(X1 - 102, 200, 6, 596, WALL);
  for (let i = 1; i < 5; i++) o += rect(X0 + 16, 200 + i * 120 - 6, X1 - X0 - 32, 10, WALL);
  o += rect(X0, 180, 16, 620, WALL) + rect(X1 - 16, 180, 16, 620, WALL) + rect(X0, 164, X1 - X0, 18, WALL) + rect(X0 - 20, 796, X1 - X0 + 40, 16, WALL);
  // aansluiting op het net en de lus
  // aansluiting op het net: voorlopig niet getekend (nog af te stemmen met de expert)
  const LOOP = `M${LX} 910V${TOPY}H${RX}V910Z`, LOOPR = `M${LX} 910H${RX}V${TOPY}H${LX}Z`;
  const LOOPSVG = path(LOOP, Y, 14) + flow(LOOP, 'loop-cw', 7, '16 42') + flow(LOOPR, 'loop-ccw', 7, '16 42');
  // QG per woning, links en rechts, leidingen op 35 %
  let hp = '';
  for (let i = 0; i < 5; i++) { const y0 = 200 + i * 120;
    o += unit(330, y0 + 22, 44, 92, 'QG'); hp += homePipes(LX, 330, y0);
    o += unit(1066, y0 + 22, 44, 92, 'QG'); hp += homePipes(RX, 1110, y0); }
  o += `<g opacity=".35">${hp}</g>` + LOOPSVG + rect(714, 200, 12, 596, WALL); // woningleidingen onder de lus; scheidingswand tussen de vleugels
  o += txt(560, 232, 'Blok A', { k: 'twBlockA', up: 1, size: 17, anchor: 'middle', ls: 2.5 }) + txt(880, 232, 'Blok B', { k: 'twBlockB', up: 1, size: 17, anchor: 'middle', ls: 2.5 });
  o += txt(560, 262, 'warmtepomp per woning', { k: 'bkPerHome', size: 15, anchor: 'middle', ls: 0 });
  // dak: één PVT-veld over de lus heen; verzamelleiding (rood) naar de dakbuffer; dakbuffer voedt de lus van bovenaf (één richting)
  // PVT-veld in twee delen rond de dakbuffer (op het dak, 60 × 110); verzamelleiding langs de paneeltoppen naar de buffer; de lus loopt onder de buffer door en de buffer voedt de lus (één richting)
  o += `<g opacity=".35">${path('M340 116H696', R, 6) + flow('M340 116H696', 'pv-flow', 3, '8 50') + path('M1066 116H764', R, 6) + flow('M1066 116H764', 'pv-flow', 3, '8 50')}</g>` + pvt2d(330, 164, 6) + pvt2d(794, 164, 5) + txt(336, 104, 'PVT', { size: 16, fill: N, weight: 600, ls: 1 });
  o += tank('tk-roof', 700, 54, 60, 110, WARM, true) + txt(730, 36, 'dakbuffer', { k: 'twRoofStore', size: 15, fill: N, anchor: 'middle', ls: 0 });
  // stroom: PVT → één trafokast rechts naast het gebouw → lucht/water-unit
  o += path('M1074 160H1250V770H1268', EL, 3) + trafo(1268, 744, 'twPower') + path('M1304 770H1387', EL, 3);
  // lucht/water-unit rechts op het maaiveld, voedt de grondbuffer (alleen winter); grondbuffer voedt de lus onder de grond (één richting)
  o += `<g data-season="winter" opacity=".35">${path('M1507 760H1600', R, 6) + flow('M1507 760H1600', 'pv-flow', 3, '8 50')}</g><g data-season="summer">${path('M1507 760H1600', '#C4C6BB', 6) + txt(1550, 748, 'uit', { k: 'twOff', size: 13, anchor: 'middle', ls: 0 })}</g>` + ashp2d(1387, 716, 120, 76, 'twAshp');
  o += path(`M1645 800V910H${RX}`, Y, 12) + flow(`M1645 800V910H${RX}`, 'main-flow', 6, '16 42') + tank('tk-ground', 1600, 540, 90, 260, WARM, true) + txt(1645, 516, 'grondbuffer', { k: 'twGroundStore', size: 16, fill: N, anchor: 'middle', ls: 0 });
  o += txt(720, 964, 'en onder de grond: één circulerende lus', { k: 'twLoopNote', size: 19, fill: N, anchor: 'middle', ls: 0 });
  o += txt(1000, 60, 'de lus wisselt elke 10 seconden van richting', { k: 'bkLoopDir', size: 15, anchor: 'middle', ls: 0 });
  o += snow(70, 86) + sun(70, 86) + txt(112, 98, 'Winter', { id: 'season-lbl', size: 34, fill: N, weight: 600, ls: 0 });
  o += legend([['gas', 'bestaande gasleiding', 'lgGas'], ['warm', 'warm', 'lgWarm'], ['cold', 'koud', 'lgCold'], ['el', 'stroom van pvt', 'lgEl'], ['flow', 'stroming', 'lgFlow']]);
  o += '</svg>';
  await saveFile('illustrations/inex/blokken.svg', o);
}

/* ---------- C · Wijk (iso, zelfde projectie als de hoofdplaat) ---------- */
{
  const K = Math.sqrt(3) / 2, s = .7, W = 1000, D = 800, T = 80, OX = 40 + D * K * s, OY = 380;
  const C = { ground: '#E4E8DC', road: '#F4F4F4', sideL: '#91877A', sideR: '#7B7266', t: '#FFFFFF', l: '#ECEDE7', r: '#D3D5CB', n: N, b: B, red: R, tree1: '#A9CB9C', tree2: '#C6DEBA', pv: '#6E6C6A', pvl: '#9A9896', trunk: '#91877A' };
  const P = (x, y, z = 0) => [OX + (x - y) * K * s, OY + (x + y) / 2 * s - z * s];
  const S = a => a.map(p => f(p[0]) + ',' + f(p[1])).join(' ');
  const poly = (a, fill, ex = '') => `<polygon points="${S(a)}" fill="${fill}" stroke="${fill}" stroke-width="1" stroke-linejoin="round"${ex}/>`;
  const pl = (a, st, sw, ex = '') => `<polyline points="${S(a)}" fill="none" stroke="${st}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${ex}/>`;
  const circ = (fn, cu, cv, r, n = 28) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return fn(cu + r * Math.cos(a), cv + r * Math.sin(a)); });
  const quad = (fn, u0, v0, u1, v1) => [fn(u0, v0), fn(u1, v0), fn(u1, v1), fn(u0, v1)];
  const FYf = (x, y) => (u, v) => P(x + u, y, v), FXf = (x, y) => (u, v) => P(x, y + u, v), TOPf = z => (u, v) => P(u, v, z);
  const box = (x, y, z, w, d, h, t = { t: C.t, l: C.l, r: C.r }) => poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], t.t) + poly([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], t.l) + poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], t.r);
  const winGrid = (fn, cols, rows, u0, du, uw, v0, dv, vh, fill = C.n) => { let o = ''; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const u = u0 + c * du, v = v0 + r * dv; o += poly(quad(fn, u, v, u + uw, v + vh), fill); if (uw >= 20 && fill === C.n) o += pl([fn(u + uw / 2, v), fn(u + uw / 2, v + vh)], NB, 1.5) + pl([fn(u, v + vh * .66), fn(u + uw, v + vh * .66)], NB, 1.5); } return o; };
  const plinth = (x, y, w, d, hp) => poly(quad(FYf(x, y + d), 0, 0, w, hp), '#DEDFD8') + poly(quad(FXf(x + w, y), 0, 0, d, hp), '#C4C6BB');
  const parapet = (x, y, w, d, z, i = 8) => poly([P(x + i, y + i, z), P(x + w - i, y + i, z), P(x + w - i, y + d - i, z), P(x + i, y + d - i, z)], '#ECEDE7') + pl([P(x + i, y + d - i, z), P(x + i, y + i, z), P(x + w - i, y + i, z)], '#D3D5CB', 2);
  const fanTop = (cx, cy, z, r) => poly(circ(TOPf(z), cx, cy, r), C.n) + poly(circ(TOPf(z + .1), cx, cy, r * .3), '#FFFFFF');
  // S4: drycooler (open frame op poten, lamellen, ventilatorringen bovenop); Pt = puntfunctie (x,y,z)→scherm
  const dcool = (Pt, x, y, z, L, Wd, cols, rows) => { const lg = 6, bh = 10, pp = (a, fill) => `<polygon points="${S(a)}" fill="${fill}" stroke="${fill}" stroke-width="1" stroke-linejoin="round"/>`, ln = (a, st, sw) => `<polyline points="${S(a)}" fill="none" stroke="${st}" stroke-width="${sw}" stroke-linecap="round"/>`; let o = ''; { const yr = y + Wd * .35, yb = y + Wd * .65, xe = x + L + 6, xr = x + L * .3, xb = xr + 6, yo = y + Wd + 6, ring = (cx, cy, rx, ry) => Array.from({ length: 20 }, (_, i) => { const a = i / 20 * Math.PI * 2; return Pt(cx + rx * Math.cos(a), cy + ry * Math.sin(a), z); });
      o += pp(ring(xr + 3, yo + 1.5, 8, 5), '#AEB0A4') + pp(ring(xr + 3, yo + 1.5, 5.5, 3.2), '#DEDFD8');
      o += ln([Pt(x + L, yr, z + lg + 4), Pt(xe, yr, z + lg + 4), Pt(xe, yr, z + 3), Pt(xr, yr, z + 3), Pt(xr, yo, z + 3), Pt(xr, yo, z)], R, 2) + ln([Pt(x + L, yb, z + lg + 4), Pt(xe, yb, z + lg + 4), Pt(xe, yb, z + 3), Pt(xb, yb, z + 3), Pt(xb, yo + 3, z + 3), Pt(xb, yo + 3, z)], B, 2); }
    for (const [lx, ly] of [[x + 2, y + 2], [x + L - 2, y + 2], [x + L - 2, y + Wd - 2], [x + 2, y + Wd - 2]]) o += ln([Pt(lx, ly, z), Pt(lx, ly, z + lg)], '#AEB0A4', 2);
    const zb = z + lg; o += pp([Pt(x, y, zb + bh), Pt(x + L, y, zb + bh), Pt(x + L, y + Wd, zb + bh), Pt(x, y + Wd, zb + bh)], '#F4F4F4') + pp([Pt(x, y + Wd, zb), Pt(x + L, y + Wd, zb), Pt(x + L, y + Wd, zb + bh), Pt(x, y + Wd, zb + bh)], '#E3E4DC') + pp([Pt(x + L, y, zb), Pt(x + L, y + Wd, zb), Pt(x + L, y + Wd, zb + bh), Pt(x + L, y, zb + bh)], '#CDCFC5');
    for (let v = 2.5; v < bh - 1; v += 2.5) o += ln([Pt(x + 2, y + Wd, zb + v), Pt(x + L - 2, y + Wd, zb + v)], '#B9BBB0', .8) + ln([Pt(x + L, y + 2, zb + v), Pt(x + L, y + Wd - 2, zb + v)], '#A9ABA0', .8);
    const r = Math.min(L / cols, Wd / rows) * .4, zt = zb + bh, cf = (cx, cy, rr) => Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; return Pt(cx + rr * Math.cos(a), cy + rr * Math.sin(a), zt); });
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const cx = x + L * (i + .5) / cols, cy = y + Wd * (j + .5) / rows; o += pp(cf(cx, cy, r), C.n) + pp(cf(cx, cy, r * .74), '#E3E4DC') + pp(cf(cx, cy, r * .2), C.n); }
    return o; };
  const pvRow = (x0, x1, y, z, dep = 30, up = 18) => { let o = poly([P(x0, y, z), P(x1, y, z), P(x1, y - dep, z + up), P(x0, y - dep, z + up)], C.pv); for (let xx = x0 + 20; xx < x1; xx += 24) o += pl([P(xx, y, z), P(xx, y - dep, z + up)], C.pvl, 1.2); return o; };
  const treeSvg = (x, y, r) => { const [tx, ty] = P(x, y, 0); const tt = 16; return pl([[tx, ty], [tx, ty - tt]], C.trunk, 4) + `<circle cx="${f(tx)}" cy="${f(ty - tt - r)}" r="${f(r)}" fill="${C.tree1}"/><circle cx="${f(tx - r * .3)}" cy="${f(ty - tt - r * 1.25)}" r="${f(r * .55)}" fill="${C.tree2}"/>`; };
  // staande cilinder (buffer): zijkant in schermruimte, boven- en onderellips
  const cyl = (x, y, z, r, h, side = '#F4F4F4', top = '#FFFFFF', band) => { const [cx, cy] = P(x, y, z), rx = r * Math.SQRT2 * K * s, ry = r * Math.SQRT2 / 2 * s, topY = cy - h * s; let o = `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${side}"/><rect x="${f(cx - rx)}" y="${f(topY)}" width="${f(rx)}" height="${f(h * s)}" fill="${side}"/><rect x="${f(cx)}" y="${f(topY)}" width="${f(rx)}" height="${f(h * s)}" fill="#DEDFD8"/>`; if (band) o += `<rect x="${f(cx - rx)}" y="${f(topY + h * s * .35)}" width="${f(2 * rx)}" height="${f(h * s * .12)}" fill="${band}"/>`; o += `<ellipse cx="${f(cx)}" cy="${f(topY)}" rx="${f(rx)}" ry="${f(ry)}" fill="${top}" stroke="#DEDFD8" stroke-width="1"/>`; return o; };
  const ventPipe = (px, py, pz) => pl([P(px, py, pz), P(px, py, pz + 14)], '#A3998C', 4) + poly(circ(TOPf(pz + 14), px, py, 4.5, 12), '#6E665B');
  // rijtje in de stijl van scène 2 van de hoofdplaat (generate-v3 'th'): twee bouwlagen, kap, deur met luifel, ramen per laag met rooster, PV 2×3; u-maten schalen met uw/110, v-maten met h/100
  const terrace = (Pt, x0, n, uw, by, d, h, rh) => { const x1 = x0 + n * uw, yf = by + d, ym = by + d / 2, q = uw / 110, vq = h / 100; let o = '';
    const FY = (u, v) => Pt(x0 + u, yf, v), FX = (u, v) => Pt(x1, by + u, v), qd = (F, u0, v0, u1, v1) => [F(u0, v0), F(u1, v0), F(u1, v1), F(u0, v1)];
    const win = (F, a, v0, b, v1) => poly(qd(F, a, v0, b, v1), C.n) + pl([F((a + b) / 2, v0), F((a + b) / 2, v1)], NB, 1.5) + pl([F(a - 2 * q, v1 + 2.5 * vq), F(b + 2 * q, v1 + 2.5 * vq)], '#BFC1B6', 2);
    const gwin = (F, a, v0, b, v1) => win(F, a, v0, b, v1) + poly(qd(F, a + q, v1 - 5 * vq, b - q, v1 - vq), '#A3A599') + Array.from({ length: Math.floor((b - a) / (6 * q)) }, (_, k) => pl([F(a + (4 + k * 6) * q, v1 - 4.5 * vq), F(a + (4 + k * 6) * q, v1 - 1.5 * vq)], '#DEDFD8', 1)).join('');
    const bx = (x, y, z, w, dd, hh) => poly([Pt(x, y, z + hh), Pt(x + w, y, z + hh), Pt(x + w, y + dd, z + hh), Pt(x, y + dd, z + hh)], '#DEDFD8') + poly([Pt(x, y + dd, z), Pt(x + w, y + dd, z), Pt(x + w, y + dd, z + hh), Pt(x, y + dd, z + hh)], '#D3D5CB') + poly([Pt(x + w, y, z), Pt(x + w, y + dd, z), Pt(x + w, y + dd, z + hh), Pt(x + w, y, z + hh)], '#C4C6BB');
    o += poly([Pt(x1, by, 0), Pt(x1, yf, 0), Pt(x1, yf, h), Pt(x1, ym, h + rh), Pt(x1, by, h)], C.r);
    o += poly([Pt(x0, yf, 0), Pt(x1, yf, 0), Pt(x1, yf, h), Pt(x0, yf, h)], C.l);
    o += poly([Pt(x0, ym, h + rh), Pt(x1, ym, h + rh), Pt(x1, yf, h), Pt(x0, yf, h)], C.n);
    const sp = (u, t) => Pt(u, ym + t * (d / 2), h + rh - t * rh);
    for (let i = 0; i < n; i++) { const u0 = x0 + i * uw, lu = i * uw;
      const pa = (a, b) => sp(u0 + 12 * q + (uw - 24 * q) * a, .12 + .76 * b);
      o += poly([pa(0, 0), pa(1, 0), pa(1, 1), pa(0, 1)], C.pv) + pl([pa(.5, 0), pa(.5, 1)], C.pvl, 1) + pl([pa(0, 1 / 3), pa(1, 1 / 3)], C.pvl, 1) + pl([pa(0, 2 / 3), pa(1, 2 / 3)], C.pvl, 1);
      o += poly(qd(FY, lu, 0, lu + uw, 6 * vq), '#DEDFD8') + poly(qd(FY, lu + 14 * q, 0, lu + 30 * q, 37 * vq), C.n) + pl([FY(lu + 26 * q, 17 * vq), FY(lu + 26 * q, 20 * vq)], '#BFC1B6', 2) + bx(x0 + lu + 11 * q, yf, 38 * vq, 22 * q, 8 * q, 3 * vq);
      o += gwin(FY, lu + 44 * q, 12 * vq, lu + 96 * q, 42 * vq); for (const [a, b] of [[18, 48], [60, 92]]) o += win(FY, lu + a * q, 62 * vq, lu + b * q, 92 * vq);
      if (i > 0) o += pl([Pt(u0, yf, 0), Pt(u0, yf, h)], C.sideR, 2) + pl([Pt(u0, yf, h), Pt(u0, ym, h + rh)], C.l, 2); }
    o += pl([Pt(x0, yf + 2, h), Pt(x1, yf + 2, h)], '#AEB0A4', 3);
    for (const [a, b] of [[d * .3, d * .5], [d * .6, d * .8]]) o += gwin(FX, a, 12 * vq, b, 42 * vq) + win(FX, a, 62 * vq, b, 92 * vq);
    return o; };
  const house = (x, y, w, d, h, rh) => { let o = box(x, y, 0, w, d, h); o += poly([P(x, y, h), P(x + w, y, h), P(x + w, y + d / 2, h + rh), P(x, y + d / 2, h + rh)], NB) + poly([P(x + w, y, h), P(x + w, y + d, h), P(x + w, y + d / 2, h + rh)], C.r) + poly([P(x, y + d, h), P(x + w, y + d, h), P(x + w, y + d / 2, h + rh), P(x, y + d / 2, h + rh)], C.n); const F = FYf(x, y + d); o += poly(quad(F, 8, 10, 22, 36), C.n) + poly(quad(F, w - 22, 10, w - 8, 36), C.n) + poly(quad(F, w / 2 - 6, 0, w / 2 + 6, 28), C.n); return o; };
  const G = []; const obj = (key, svg) => G.push({ key, svg });
  // Objecten 1-op-1 uit de hoofdplaat (illustrations/v3/00-overview.svg): groep met id ophalen en in schermruimte schalen/verplaatsen. (ax,ay) = wereldanker in de hoofdplaat, (bx,by) = wereldanker hier, kw = schaal in wereldunits.
  const OV = await readFile('illustrations/v3/00-overview.svg');
  const ovGroup = id => { const i = OV.indexOf('<g id="' + id + '"'); if (i < 0) throw new Error('ov group ' + id); let j = OV.indexOf('>', i) + 1, depth = 1, k = j; while (depth) { const o = OV.indexOf('<g', k), c = OV.indexOf('</g>', k); if (c < 0) break; if (o >= 0 && o < c) { depth++; k = o + 2; } else { depth--; if (!depth) return OV.slice(j, c); k = c + 4; } } return OV.slice(j); };
  const Pov = (x, y, z = 0) => [1600 - 400 / 2 * K * .8 + (x - y) * K * .8, 395 + (x + y) / 2 * .8 - z * .8];
  const ovEls = id => ovGroup(id).split(/(?=<polygon|<polyline|<circle|<ellipse|<path)/).filter(Boolean);
  const embedS = (inner, p0, bx, by, kw) => { const fct = s * kw / .8, p1 = P(bx, by); return `<g transform="translate(${f(p1[0] - fct * p0[0])} ${f(p1[1] - fct * p0[1])}) scale(${f(fct)})">${inner}</g>`; };
  const embed = (id, ax, ay, bx, by, kw, pick = e => e) => embedS(pick(ovEls(id)).join(''), Pov(ax, ay), bx, by, kw);
  // slab + wegen
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1160 1080" ${FONT}>`;
  out += `<g id="ground">` + poly([P(0, D, 0), P(W, D, 0), P(W, D, -T), P(0, D, -T)], C.sideL) + poly([P(W, 0, 0), P(W, D, 0), P(W, D, -T), P(W, 0, -T)], C.sideR) + poly([P(0, 0), P(W, 0), P(W, D), P(0, D)], C.ground);
  out += poly([P(0, 400), P(W, 400), P(W, 470), P(0, 470)], C.road) + poly([P(330, 0), P(390, 0), P(390, 400), P(330, 400)], C.road) + `</g>`;
  // aftakkingen: woningen A/B tegengesteld, toren, blokken, bronnen
  let br = '';
  const KW = .8, TX0 = 90, TBY = 580, TN = 5, UW = 60, TYF = TBY + 100 * KW, TD = 128; const HX = Array.from({ length: TN }, (_, i) => TX0 + UW / 2 + UW * i);
  HX.forEach((hx, i) => { const a = [P(hx, 720), P(hx, TBY + 100 * KW)]; br += pl(a, Y, 3) + pl(a, '#F08A96', 2.4, ` class="${i % 2 ? 'br-b' : 'br-a'}" stroke-dasharray="5 18"`); });
  { const a = [P(160, 435), P(160, 240)]; br += pl(a, Y, 4) + pl(a, '#F08A96', 2.4, ' class="br-a" stroke-dasharray="5 18"'); }
  { const a = [P(600, 435), P(600, 260)]; br += pl(a, Y, 4) + pl(a, '#F08A96', 2.4, ' class="br-a" stroke-dasharray="5 18"'); } // twee blokken: één aansluiting op de naad, zelfde fase als de toren
  // bronnen: datacenter (altijd leverend, rood), boorveld (seizoen), lucht/water (alleen winter)
  { const a = [P(500, 637), P(500, 720)]; br += pl(a, R, 3.5) + pl(a, 'rgba(255,255,255,.9)', 2, ' class="src-dc" stroke-dasharray="5 18"'); }
  { br += `<g id="src-bhe">` + pl([P(820, 560), P(960, 560)], R, 3.5, ' class="bhe-pipe"') + pl([P(820, 560), P(960, 560)], 'rgba(255,255,255,.9)', 2, ' class="src-bhe" stroke-dasharray="5 18"') + `</g>`; }
  { br += `<g id="src-ashp">` + pl([P(920, 380), P(920, 435)], R, 3.5) + pl([P(920, 380), P(920, 435)], 'rgba(255,255,255,.9)', 2, ' class="src-ashp" stroke-dasharray="5 18"') + `</g>`; }
  out += `<g id="branches">${br}</g>`;
  // gasring (altijd geel) + stroming met de klok mee
  const ring = [P(40, 435), P(960, 435), P(960, 720), P(40, 720), P(40, 435)];
  out += `<g id="gas">` + pl(ring, Y, 7) + pl(ring, '#F08A96', 3.2, ' class="ring-flow" stroke-dasharray="7 34" pathLength="1927"') + `</g>`;
  // boorveld: putdeksels in een raster, rechtsvoor
  { let o = ''; for (const r of [500, 540, 580, 620]) for (const c of [830, 870, 910]) o += poly(circ(TOPf(0), c, r, 9), C.t) + poly(circ(TOPf(0), c, r, 4.5), C.n, ' class="bhe-dot"'); out += `<g id="field">${o}</g>`; }
  // rijwoningen voor de weg, buffers in de achtertuin (A/B om en om warm/koud gevuld)
  obj(TX0 + TN * UW / 2 + TYF, terrace(P, TX0, TN, UW, TYF - TD, TD, 80, 60));
  HX.forEach((hx, i) => obj(hx + TYF + 20 + 400, cyl(hx + 16, TYF + 20, 0, 5, 26, '#F4F4F4', '#FFFFFF', i % 2 ? COLD : WARM)));
  // dezelfde rij, in hoofdplaatcoördinaten, als groep 'inex' voor generate-v3 (illustrations/v3/inex-group.svg): plateau, weg en water uit het bestaande bestand, twee blokken van vijf
  { const IG = await readFile('illustrations/v3/inex-group.svg'); const i0 = IG.indexOf('<g id="inex">'), j0 = IG.indexOf('</g>', i0); const E = IG.slice(i0 + 13, j0).split(/(?=<polygon|<polyline|<circle|<ellipse|<path)/).filter(Boolean), st = E.findIndex(e => e.includes('#DEDFD8'));
    await saveFile('illustrations/v3/inex-group.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3200 2000">\n<g id="inex">' + E.slice(0, st).join('') + terrace(Pov, 800, 5, 68, -180, 140, 100, 75) + terrace(Pov, 1190, 5, 68, -180, 140, 100, 75) + '</g>\n</svg>'); }
  // lucht/water-centrale, rechtsachter
  obj(920 + 340 + 40, '<g id="ashp-unit">' + box(880, 300, 0, 80, 80, 36) + dcool(P, 886, 320, 36, 66, 40, 2, 2) + '</g>');
  // woontoren linksachter met PVT, lucht/water en dakbuffer; grondbuffer ernaast
  { const x = 80, y = 80, w = 160, d = 160, h = 380; let o = box(x, y, 0, w, d, h) + plinth(x, y, w, d, 14) + parapet(x, y, w, d, h); o += winGrid(FYf(x, y + d), 4, 10, 16, 36, 22, 24, 34, 18) + winGrid(FXf(x + w, y), 4, 10, 16, 36, 22, 24, 34, 18); o += pvRow(x + 16, x + 90, y + 60, h, 28, 16) + pvRow(x + 16, x + 90, y + 110, h, 28, 16); o += dcool(P, x + 98, y + 28, h, 52, 30, 2, 1); o += cyl(x + 124, y + 120, h, 14, 46, '#F4F4F4', '#FFFFFF', WARM); obj(x + y + (w + d) / 2, o); }
  // twee blokken achter de weg, tegen elkaar aan; de daklus staat alleen in de doorsnede
  { const mk = (x, right = true) => { const y = 120, w = 160, d = 140, h = 200; let o = box(x, y, 0, w, d, h) + plinth(x, y, w, d, 12) + parapet(x, y, w, d, h); o += winGrid(FYf(x, y + d), 4, 6, 16, 36, 22, 20, 30, 16); if (right) o += winGrid(FXf(x + w, y), 3, 6, 20, 40, 24, 20, 30, 16); o += pvRow(x + 16, x + 140, y + 40, h, 28, 16) + pvRow(x + 16, x + 140, y + 90, h, 28, 16); return o; }; obj(440 + 120 + 150, mk(440, false)); obj(600 + 120 + 150, mk(600));
    }
  // datacenter rechtsvoor: laag, met koelers op het dak
  // datacenter zoals op de hoofdplaat (generate-v3 'ec'): navy deur, louvres op de zijgevel, één koelblok met zes ventilatoren
  // datacenter = groep 'xsrc-dc' van de hoofdplaat (marker E): 340×200 op (-500, 960), hier op 65 %
  { const kw = .6, w = 260, d = 200, h = 84, x = 500 - w * kw / 2, y = 577 - d * kw / 2; const Q = (u, v, z = 0) => P(x + u * kw, y + v * kw, z * kw); const UW = { t: '#FFFFFF', l: '#F4F4F4', r: '#DEDFD8' };
    const bx = (u, v, z, bw, bd, bh, t = { t: C.t, l: C.l, r: C.r }) => poly([Q(u, v, z + bh), Q(u + bw, v, z + bh), Q(u + bw, v + bd, z + bh), Q(u, v + bd, z + bh)], t.t) + poly([Q(u, v + bd, z), Q(u + bw, v + bd, z), Q(u + bw, v + bd, z + bh), Q(u, v + bd, z + bh)], t.l) + poly([Q(u + bw, v, z), Q(u + bw, v + bd, z), Q(u + bw, v + bd, z + bh), Q(u + bw, v, z + bh)], t.r);
    let o = bx(0, 0, 0, w, d, h) + poly([Q(0, d, 0), Q(w, d, 0), Q(w, d, 8), Q(0, d, 8)], '#DEDFD8') + poly([Q(w, 0, 0), Q(w, d, 0), Q(w, d, 8), Q(w, 0, 8)], '#C4C6BB') + poly([Q(8, 8, h), Q(w - 8, 8, h), Q(w - 8, d - 8, h), Q(8, d - 8, h)], '#ECEDE7') + pl([Q(8, d - 8, h), Q(8, 8, h), Q(w - 8, 8, h)], '#D3D5CB', 1.5);
    for (let i = 0; i < 11; i++) o += poly([Q(16 + i * 22.5, d, 12), Q(28 + i * 22.5, d, 12), Q(28 + i * 22.5, d, 64), Q(16 + i * 22.5, d, 64)], C.n); for (let i = 0; i < 8; i++) o += poly([Q(w, 16 + i * 22.5, 12), Q(w, 28 + i * 22.5, 12), Q(w, 28 + i * 22.5, 64), Q(w, 16 + i * 22.5, 64)], C.n);
    o += dcool(Q, 30, 30, h, 200, 50, 4, 2) + dcool(Q, 30, 120, h, 200, 50, 4, 2);
    obj(x + y + (w * kw + d * kw) / 2, o); }
  // bomen
  for (const [tx, ty] of [[320, 60], [900, 60], [40, 480], [660, 660], [40, 770], [540, 770], [980, 770], [860, 440]]) obj(tx + ty, treeSvg(tx, ty, 14));
  G.sort((a, b) => a.key - b.key); out += `<g id="objects">${G.map(g => g.svg).join('')}</g>`;
  // ankers voor de hotspots (DOM) en labels
  const A = { woning: P(TX0 + TN * UW / 2, TBY + 20, 110), toren: P(160, 160, 420), blokken: P(600, 190, 250), dc: P(470, 690, 0), bhe: P(960, 570, 0), ashp: P(1000, 300, 0) };
  out += `<g id="anchors">${Object.entries(A).map(([k, p]) => `<circle data-hot="${k}" cx="${f(p[0])}" cy="${f(p[1])}" r="0" fill="none"/>`).join('')}</g>`;
  out += '</svg>';
  await saveFile('illustrations/inex/wijk.svg', out);
  log('wijk anchors', JSON.stringify(Object.fromEntries(Object.entries(A).map(([k, p]) => [k, [f(p[0]), f(p[1])]]))));
}
log('done');
