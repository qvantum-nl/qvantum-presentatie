// Raster, plaatsing en netgroei. Puur, zonder DOM; alle maten komen uit config.js.
//
// Coördinaten: cel (u, v) met u naar rechtsonder en v naar linksonder; een footprint beslaat de cellen
// u..u+w-1, v..v+h-1. De ringweg is een cyclus van cellen; de lus ligt in het midden van die weg.

import { CONFIG as DEFAULT_CONFIG } from './config.js?v=1793339689';
import { countsForBackbone } from './engine.js?v=1793339689';

export const key = (u, v) => `${u},${v}`;

// Statische celtypen: 'road' (ringweg), 'access' (toegangsweg naar de rand), 'water', 'wind' (windparkrand), 'free', 'out'.
export function cellType(u, v, cfg = DEFAULT_CONFIG) {
  const g = cfg.grid;
  if (u < 0 || v < 0 || u >= g.sizeU || v >= g.sizeV) return 'out';
  if (u >= g.water.u && u < g.water.u + g.water.w && v >= g.water.v && v < g.water.v + g.water.h) return 'water';
  const onRing = ((u === g.ring.u[0] || u === g.ring.u[1]) && v >= g.ring.v[0] && v <= g.ring.v[1])
    || ((v === g.ring.v[0] || v === g.ring.v[1]) && u >= g.ring.u[0] && u <= g.ring.u[1]);
  if (onRing) return 'road';
  for (const r of g.accessRoads || []) if (u >= r.u && u < r.u + r.w && v >= r.v && v < r.v + r.h) return 'access';
  const w = cfg.reserved.windpark;
  if (u >= w.u && u < w.u + w.w && v >= w.v && v < w.v + w.h) return 'wind';
  return 'free';
}

export function inRect(r, u, v) { return u >= r.u && u < r.u + r.w && v >= r.v && v < r.v + r.h; }

// Zonering: de rechthoeken waarin deze functie mag staan (leeg = overal). Decor en overlays kennen geen zonering.
export function zoneRects(id, cfg = DEFAULT_CONFIG) {
  if (cfg.decor && cfg.decor[id]) return [];
  const b = id === 'storage' ? cfg.storage : cfg.buildings[id];
  if (!b || b.overlay || !b.zones) return [];
  const names = Array.isArray(b.zones) ? b.zones : (cfg.zoneSets && cfg.zoneSets[b.zones]) || [];
  return names.map((n) => cfg.zones && cfg.zones[n]).filter(Boolean);
}

export function footprintCells(u, v, w, h) {
  const out = [];
  for (let i = u; i < u + w; i++) for (let j = v; j < v + h; j++) out.push([i, j]);
  return out;
}

// Ringweg als geordende cyclus van cellen: bovenrij links->rechts, rechterkolom omlaag, onderrij rechts->links,
// linkerkolom omhoog. ringIndex(u, v) geeft de positie; t = index is ook de parameter langs de hartlijn.
export function ringCells(cfg = DEFAULT_CONFIG) {
  const { u: [u0, u1], v: [v0, v1] } = cfg.grid.ring;
  const cells = [];
  for (let u = u0; u <= u1; u++) cells.push([u, v0]);
  for (let v = v0 + 1; v <= v1; v++) cells.push([u1, v]);
  for (let u = u1 - 1; u >= u0; u--) cells.push([u, v1]);
  for (let v = v1 - 1; v > v0; v--) cells.push([u0, v]);
  const index = new Map(cells.map(([u, v], i) => [key(u, v), i]));
  return { cells, index, length: cells.length };
}

// Punt op de hartlijn van de ring (celcoördinaten, midden van de weg) bij parameter t, met offset o naar buiten
// (o > 0) of naar binnen (o < 0): zo lopen warm en koud evenwijdig zonder kruisingen.
export function ringPoint(t, o, cfg = DEFAULT_CONFIG) {
  const { u: [u0, u1], v: [v0, v1] } = cfg.grid.ring;
  const A = [u0 + 0.5 - o, v0 + 0.5 - o], B = [u1 + 0.5 + o, v0 + 0.5 - o];
  const C = [u1 + 0.5 + o, v1 + 0.5 + o], D = [u0 + 0.5 - o, v1 + 0.5 + o];
  const L1 = u1 - u0, L2 = v1 - v0;
  const lerp = (P, Q, k) => [P[0] + (Q[0] - P[0]) * k, P[1] + (Q[1] - P[1]) * k];
  const n = 2 * (L1 + L2);
  t = ((t % n) + n) % n;
  if (t <= L1) return lerp(A, B, t / L1);
  if (t <= L1 + L2) return lerp(B, C, (t - L1) / L2);
  if (t <= 2 * L1 + L2) return lerp(C, D, (t - L1 - L2) / L1);
  return lerp(D, A, (t - 2 * L1 - L2) / L2);
}

export function ringCornersT(cfg = DEFAULT_CONFIG) {
  const { u: [u0, u1], v: [v0, v1] } = cfg.grid.ring;
  const L1 = u1 - u0, L2 = v1 - v0;
  return [0, L1, L1 + L2, 2 * L1 + L2, 2 * (L1 + L2)];
}

// Bezetting: Map key -> { id, kind: 'building' | 'lane' }.
// Decor (p.type) telt mee; passable decor (weg, parkeerplaats) laat straatjes door. Overlays (de damwand in de
// kademuur) bezetten geen cellen.
export function occupancy(placed, lanes) {
  const occ = new Map();
  for (const [id, p] of Object.entries(placed)) {
    if (p.overlay) continue;
    for (const [u, v] of footprintCells(p.u, p.v, p.w, p.h)) occ.set(key(u, v), { id, kind: p.type ? 'decor' : 'building', passable: !!p.passable });
  }
  for (const [id, lane] of Object.entries(lanes)) {
    for (const [u, v] of lane.cells) occ.set(key(u, v), { id, kind: 'lane' });
  }
  return occ;
}

// Kortste rechte aftakking van een footprint naar de ringweg: vanuit het midden van elke zijde, haaks, door
// vrije cellen, hooguit maxLaneLength cellen. Zuid en oost zijn de zichtbare voorkanten in de iso-weergave;
// die krijgen voorrang als ze hooguit laneFrontBias cellen langer zijn (anders ligt de leiding achter het gebouw).
// Geeft { side, cells, ring: [u, v], from: [u, v] } of null.
export function laneFor(u, v, w, h, occ, cfg = DEFAULT_CONFIG, ownId = null) {
  const max = cfg.grid.maxLaneLength, bias = cfg.grid.laneFrontBias || 0;
  const sides = [
    { side: 'south', front: true, start: [u + Math.floor(w / 2), v + h], step: [0, 1], from: [u + Math.floor(w / 2) + 0.5, v + h] },
    { side: 'east', front: true, start: [u + w, v + Math.floor(h / 2)], step: [1, 0], from: [u + w, v + Math.floor(h / 2) + 0.5] },
    { side: 'north', front: false, start: [u + Math.floor(w / 2), v - 1], step: [0, -1], from: [u + Math.floor(w / 2) + 0.5, v] },
    { side: 'west', front: false, start: [u - 1, v + Math.floor(h / 2)], step: [-1, 0], from: [u, v + Math.floor(h / 2) + 0.5] },
  ];
  let best = null;
  for (const s of sides) {
    const cells = [];
    let [cu, cv] = s.start;
    let ok = false;
    for (let n = 0; n <= max; n++) {
      const type = cellType(cu, cv, cfg);
      if (type === 'road') { ok = true; break; }
      if (type !== 'free') break;
      const o = occ.get(key(cu, cv));
      if (o && !(o.kind === 'lane' && o.id === ownId) && !o.passable) break;
      cells.push([cu, cv]);
      cu += s.step[0]; cv += s.step[1];
    }
    const score = cells.length - (s.front ? bias : 0);
    if (ok && (!best || score < best.score)) best = { side: s.side, cells, ring: [cu, cv], from: s.from, score };
  }
  if (best) delete best.score;
  return best;
}

// Mag deze functie hier? Geeft { ok, reason, lane }.
// Decor mag vaker; een functie met fixedAt (de damwand = de hele kade) alleen daar; een overlay negeert bezetting.
export function canPlace(id, u, v, placed, lanes, cfg = DEFAULT_CONFIG) {
  const decor = cfg.decor && cfg.decor[id];
  const b = decor || (id === 'storage' ? cfg.storage : cfg.buildings[id]);
  const [w, h] = b.footprint;
  if (!decor && placed[id]) return { ok: false, reason: 'onlyOnce' };
  if (b.fixedAt && (u !== b.fixedAt.u || v !== b.fixedAt.v)) return { ok: false, reason: 'fixed' };
  const occ = occupancy(placed, lanes);
  const zones = zoneRects(id, cfg);
  for (const [cu, cv] of footprintCells(u, v, w, h)) {
    const type = cellType(cu, cv, cfg);
    if (type === 'out') return { ok: false, reason: 'outside' };
    if (type === 'road' || type === 'access') return { ok: false, reason: 'road' };
    if (type === 'water') return { ok: false, reason: 'water' };
    if (type === 'wind') return { ok: false, reason: 'wind' };
    // zonering (29 okt): hoogbouw achteraan, platte bronnen en opslag in de banden, de kade alleen voor waterbronnen
    if (zones.length && !zones.some((z) => inRect(z, cu, cv))) {
      const quay = cfg.zones && cfg.zones.kade && inRect(cfg.zones.kade, cu, cv);
      return { ok: false, reason: quay ? 'zoneQuay' : (b.zoneReason || 'zone') };
    }
    if (!b.overlay && occ.has(key(cu, cv))) return { ok: false, reason: 'occupied' };
  }
  if (b.requiresWater && u + w !== cfg.grid.water.u) return { ok: false, reason: 'needsWater' };
  if (decor) return { ok: true };
  const lane = laneFor(u, v, w, h, occ, cfg);
  if (!lane) return { ok: false, reason: 'noLane' };
  return { ok: true, lane };
}

// Netgroei: welke ringcellen liggen er leiding? covered = Set van ringindexen.
// connectArc voegt de kortste boog toe van een aftakpunt naar het bestaande net (beide richtingen).
export function connectArc(covered, ringIdx, ring) {
  if (covered.size === 0) { covered.add(ringIdx); return [ringIdx]; }
  if (covered.has(ringIdx)) return [];
  const n = ring.length;
  let best = null;
  for (const dir of [1, -1]) {
    const path = [];
    let i = ringIdx;
    for (let steps = 0; steps < n; steps++) {
      path.push(i);
      i = (i + dir + n) % n;
      if (covered.has(i)) break;
    }
    if (!best || path.length < best.length) best = path;
  }
  for (const i of best) covered.add(i);
  return best;
}

// Aaneengesloten intervallen [t0, t1] (ringparameter, cel i beslaat [i - 0.5, i + 0.5]) van bedekte cellen.
export function coveredIntervals(covered, ring) {
  const n = ring.length;
  if (covered.size === n) return [[-0.5, n - 0.5]];
  const out = [];
  const has = (i) => covered.has(((i % n) + n) % n);
  // begin bij een niet-bedekte cel, loop rond
  let start = 0;
  while (start < n && has(start)) start++;
  if (start === n) return [[-0.5, n - 0.5]];
  let i = start, run = null;
  for (let k = 0; k < n; k++) {
    const idx = (start + k) % n;
    if (has(idx)) {
      if (!run) run = [idx - 0.5, idx + 0.5];
      else run[1] = run[0] + (run[1] - run[0]) + 1;
    } else if (run) { out.push(run); run = null; }
    i = idx;
  }
  if (run) out.push(run);
  return out;
}

// Meters leiding: ringcellen + aftakkingen (halve cel per aansluiting) + straatjes, alleen ter informatie.
export function pipeMetres(covered, lanes, cfg = DEFAULT_CONFIG) {
  const perCell = cfg.network.pipeMetresPerCell;
  let cells = covered.size;
  for (const lane of Object.values(lanes)) cells += lane.cells.length + 0.5;
  return Math.round(cells * perCell);
}

// Volledige netstaat uit de spelstaat: aftakkingen voor alle aangesloten functies en de bedekte ringcellen.
// state.placed = { id: {u, v, w, h} } voor bestaande (uit config.existingLayout) en geplaatste functies,
// state.connected = [ids], state.order = volgorde van aansluiten (voor de groei).
// Bij de start (alleen de toren) ligt er nog geen lus: zonder bron geen lus (Viktor 28 okt). Voor de backbone tellen
// alleen gebouwen met vraag (countsForBackbone); attached = alles wat aan de toren hangt.
export function buildNetwork(state, cfg = DEFAULT_CONFIG) {
  const ring = ringCells(cfg);
  const lanes = {};
  const branches = {};
  const occ = occupancy(state.placed, {});
  const fixed = Object.keys(cfg.buildings).find((id) => cfg.buildings[id].fixed) || 'woontoren';
  const attached = state.order.filter((id) => id !== fixed).length;
  if (attached > 0) {
    for (const id of state.order) {
      const p = state.placed[id];
      if (!p) continue;
      const lane = laneFor(p.u, p.v, p.w, p.h, occ, cfg, id);
      if (!lane) continue;
      lanes[id] = lane;
      for (const [u, v] of lane.cells) occ.set(key(u, v), { id, kind: 'lane' });
      branches[id] = { ...lane, ringIdx: ring.index.get(key(...lane.ring)) };
    }
  }
  const covered = new Set();
  const stageInfo = { stage: 'start' };
  const connections = state.order.filter((id) => countsForBackbone(id, cfg)).length;
  const backbone = connections >= cfg.network.backboneAfterConnections;
  if (backbone) {
    for (let i = 0; i < ring.length; i++) covered.add(i);
    stageInfo.stage = 'backbone';
  } else {
    for (const id of state.order) if (branches[id]) connectArc(covered, branches[id].ringIdx, ring);
    stageInfo.stage = attached === 0 ? 'start' : 'organic';
  }
  // aansluitpunten in het blok (uit het manifest, in cellen vanaf de achterhoek), omgezet naar plaatcoördinaten
  const ports = {};
  for (const id of state.order) {
    const p = state.placed[id]; let pt = state.ports && state.ports[id];
    if (pt && !Array.isArray(pt)) pt = (lanes[id] && pt[lanes[id].side]) || pt.default;   // aansluitpunt per aftakrichting (opslag: ec aan de kant van de leiding)
    if (p && pt) ports[id] = [p.u + pt[0], p.v + pt[1]];
  }
  return { ring, lanes, branches, covered, intervals: coveredIntervals(covered, ring), backbone, ports,
           metres: pipeMetres(covered, lanes, cfg), stage: stageInfo.stage, connections, attached };
}
