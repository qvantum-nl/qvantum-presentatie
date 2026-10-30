// Iso-plaat als SVG: grondplaat, water, ringweg, lus, aftakkingen, gebouwen (assets uit assets/manifest.json),
// bomen, ghost-footprint en tikvlakken. Alles in schermcoördinaten van de stage (1920 x 1080).

import { CONFIG as DEFAULT_CONFIG } from './config.js?v=1793339689';
import { cellType, footprintCells, ringPoint, ringCornersT, key } from './grid.js?v=1793339689';

const COS = Math.cos(Math.PI / 6);
const C = {
  ground: '#E4E8DC', road: '#F4F4F4', roadEdge: '#DEDFD8', soilL: '#91877A', soilR: '#7B7266', water: '#B7D9FF',
  waterSide: '#4AA1FF', grass: '#D8DFCF', warm: '#C41230', cold: '#3164FD', slot: '#DEDFD8', grid: '#C9CAC1',
  ghostOk: '#A9CB9C', ghostOkLine: '#2E7D32', ghostBad: '#F2B2B9', ghostBadLine: '#C41230', lid: '#AEB0A4', lidIn: '#DEDFD8',
  wind: '#E9EEE4', windLine: '#6E8A5E',
};

export class Renderer {
  constructor(svg, manifest, cfg = DEFAULT_CONFIG) {
    this.svg = svg; this.cfg = cfg; this.manifest = manifest;
    this.assets = Object.fromEntries(manifest.assets.map((a) => [a.id, a]));
    this.c = cfg.grid.cellPx;
    this.s = cfg.grid.assetScale;
    this.layers = {};
    for (const name of ['ground', 'roads', 'pipes', 'grid', 'objects', 'ghost', 'labels']) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', `layer-${name}`);
      svg.appendChild(g); this.layers[name] = g;
    }
    this.trees = this.treePositions();
    this.drawStatic();
  }

  // cel -> scherm
  Q(u, v, h = 0) {
    const { x, y } = this.cfg.grid.origin;
    return [x + (u - v) * this.c * COS, y + (u + v) * this.c * 0.5 - h];
  }
  // scherm -> cel (grondvlak)
  cellAt(x, y) {
    const { x: ox, y: oy } = this.cfg.grid.origin;
    const dx = x - ox, dy = y - oy;
    const u = (dx / COS + 2 * dy) / (2 * this.c), v = (2 * dy - dx / COS) / (2 * this.c);
    return [Math.floor(u), Math.floor(v)];
  }
  pts(arr) { return arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '); }
  diamond(u, v, w, h) { return [this.Q(u, v), this.Q(u + w, v), this.Q(u + w, v + h), this.Q(u, v + h)]; }
  el(tag, attrs, parent) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, val] of Object.entries(attrs)) e.setAttribute(k, val);
    (parent || this.svg).appendChild(e);
    return e;
  }
  clear(layer) { const g = this.layers[layer]; while (g.firstChild) g.removeChild(g.firstChild); }

  treePositions() {
    // vaste strooiing: hoeken van de buitenband, voorrand; nooit op weg, water, windpark (het parkje is decor)
    const base = [[0.5, 10.6], [1.3, 11.3], [0.6, 11.6], [0.7, 0.9], [1.5, 1.4],
                  [16.4, 0.7], [16.5, 1.6], [3.5, 11.2], [6.2, 11.4], [12.5, 0.6], [10.3, 1.8], [14.2, 9.8], [9.5, 10.6],
                  [2.6, 9.6], [16.3, 9.4], [11.5, 11.3], [15.8, 11.2]];
    return base.filter(([u, v]) => cellType(Math.floor(u), Math.floor(v), this.cfg) === 'free');
  }

  drawStatic() {
    const g = this.cfg.grid, NU = g.sizeU, NV = g.sizeV, L = this.layers.ground;
    this.clear('ground');
    this.el('polygon', { points: this.pts([this.Q(0, NV), this.Q(NU, NV), this.Q(NU, NV, -60), this.Q(0, NV, -60)]), fill: C.soilL }, L);
    this.el('polygon', { points: this.pts([this.Q(NU, 0), this.Q(NU, NV), this.Q(NU, NV, -60), this.Q(NU, 0, -60)]), fill: C.soilR }, L);
    this.el('polygon', { points: this.pts(this.diamond(0, 0, NU, NV)), fill: C.ground }, L);
    const w = g.water;
    this.el('polygon', { points: this.pts(this.diamond(w.u, w.v, w.w, w.h)), fill: C.water }, L);
    this.el('polygon', { points: this.pts([this.Q(NU, 0), this.Q(NU, NV), this.Q(NU, NV, -14), this.Q(NU, 0, -14)]), fill: C.waterSide }, L);
    for (let k = 0; k < 5; k++) {
      const [x, y] = this.Q(w.u + 0.5, 1.2 + k * 2.4);
      this.el('path', { d: `M${x - 14} ${y} q 7 -4 14 0 t 14 0`, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 1.5 }, L);
    }
    const wp = this.cfg.reserved.windpark;
    this.el('polygon', { points: this.pts(this.diamond(wp.u, wp.v, wp.w, wp.h)), fill: C.wind, stroke: C.windLine, 'stroke-width': 1, 'stroke-dasharray': '6 4', opacity: 0.6 }, L);
    // ringweg: één vlak met stoeprand aan de buiten- en binnenkant (opruimronde 29 okt)
    const R = this.layers.roads; this.clear('roads');
    const { u: [u0, u1], v: [v0, v1] } = g.ring;
    const kerb = g.kerbPx ? { stroke: C.roadEdge, 'stroke-width': g.kerbPx } : {};
    this.el('polygon', { points: this.pts(this.diamond(u0, v0, u1 - u0 + 1, v1 - v0 + 1)), fill: C.road, ...kerb }, R);
    this.el('polygon', { points: this.pts(this.diamond(u0 + 1, v0 + 1, u1 - u0 - 1, v1 - v0 - 1)), fill: C.ground, ...kerb }, R);
    // toegangswegen naar de rand van het plangebied; ze lopen iets de ring in, zodat de stoeprand daar onderbroken is
    for (const r of g.accessRoads || []) {
      const toward = r.v + r.h === v0 ? 'south' : r.v === v1 + 1 ? 'north' : r.u + r.w === u0 ? 'east' : 'west';
      this.pavedStrip(r.u, r.v, r.w, r.h, toward, R);
    }
  }

  // Verharde strook (zijweg of straatje naar een gebouw): vlak met stoeprand langs de lange zijden. toward = de kant
  // waar de ringweg ligt; de strook loopt roadJoinOverlapCells de ring in, zodat de stoeprand van de ring daar wegvalt.
  pavedStrip(u, v, w, h, toward, parent) {
    const g = this.cfg.grid, e = g.roadJoinOverlapCells || 0;
    if (toward === 'south') h += e; else if (toward === 'north') { v -= e; h += e; }
    else if (toward === 'east') w += e; else if (toward === 'west') { u -= e; w += e; }
    this.el('polygon', { points: this.pts(this.diamond(u, v, w, h)), fill: C.road }, parent);
    if (!g.kerbPx) return;
    const alongV = toward === 'north' || toward === 'south';
    const edges = alongV ? [[[u, v], [u, v + h]], [[u + w, v], [u + w, v + h]]] : [[[u, v], [u + w, v]], [[u, v + h], [u + w, v + h]]];
    for (const [a, b] of edges) this.el('polyline', { points: this.pts([this.Q(...a), this.Q(...b)]), fill: 'none', stroke: C.roadEdge, 'stroke-width': g.kerbPx }, parent);
  }

  // rasterlijnen (alleen in plaatsmodus)
  drawGrid(show, zones = []) {
    this.clear('grid');
    if (!show) return;
    const g = this.cfg.grid, L = this.layers.grid;
    // toegestane zone voor de functie die geplaatst wordt: lichte groene was op de vrije cellen (zonering 29 okt)
    for (const z of zones) {
      for (let u = z.u; u < z.u + z.w; u++) for (let v = z.v; v < z.v + z.h; v++) {
        if (cellType(u, v, this.cfg) !== 'free') continue;
        this.el('polygon', { points: this.pts(this.diamond(u, v, 1, 1)), fill: C.ghostOk, opacity: 0.28 }, L);
      }
    }
    for (let i = 0; i <= g.sizeU; i++) this.el('polyline', { points: this.pts([this.Q(i, 0), this.Q(i, g.sizeV)]), fill: 'none', stroke: C.grid, 'stroke-width': 1, 'stroke-dasharray': '4 5' }, L);
    for (let j = 0; j <= g.sizeV; j++) this.el('polyline', { points: this.pts([this.Q(0, j), this.Q(g.sizeU, j)]), fill: 'none', stroke: C.grid, 'stroke-width': 1, 'stroke-dasharray': '4 5' }, L);
  }

  // lus en aftakkingen uit buildNetwork(); flow = { dir: 1 | -1, speed: 0..1 }
  drawNetwork(net, flow, highlightId = null) {
    this.clear('pipes');
    const L = this.layers.pipes, cfg = this.cfg, o = cfg.loop.offsetCells;
    const corners = ringCornersT(cfg);
    const sampled = (t0, t1, off) => {
      const ts = [t0];
      for (const ct of corners) { if (ct > t0 && ct < t1) ts.push(ct); const ct2 = ct + corners[4]; if (ct2 > t0 && ct2 < t1) ts.push(ct2); }
      ts.push(t1);
      return ts.sort((a, b) => a - b).map((t) => { const [u, v] = ringPoint(t, off, cfg); return this.Q(u, v); });
    };
    // straatjes: verharde strook van de gevel naar de ringweg, met stoeprand (opruimronde 29 okt)
    for (const lane of Object.values(net.lanes)) {
      if (!lane.cells.length) continue;
      const us = lane.cells.map((c) => c[0]), vs = lane.cells.map((c) => c[1]);
      const u = Math.min(...us), v = Math.min(...vs);
      this.pavedStrip(u, v, Math.max(...us) - u + 1, Math.max(...vs) - v + 1, lane.side, L);
    }
    // sleuf
    for (const [t0, t1] of net.intervals) {
      this.el('polyline', { points: this.pts(sampled(t0, t1, 0)), fill: 'none', stroke: C.slot, 'stroke-width': cfg.loop.slotPx, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, L);
    }
    // aansluiting op het grotere net (alleen met backbone)
    const en = cfg.reserved.loopEntry;
    if (net.backbone) {
      const path = [this.Q(en.u, en.fromRingV), this.Q(en.u, en.toEdgeV)];
      this.el('polyline', { points: this.pts(path), fill: 'none', stroke: C.slot, 'stroke-width': cfg.loop.slotPx, 'stroke-linecap': 'round' }, L);
    }
    // warm (buiten) en koud (binnen), evenwijdig; aftakkingen haaks; kruisingen met een onderbreking in de lijn
    const dash = cfg.loop.flowDashPx, gap = cfg.loop.flowGapPx, period = dash + gap;
    const pxPerSec = cfg.loop.flowSpeedPxPerSecondMin + (cfg.loop.flowSpeedPxPerSecondMax - cfg.loop.flowSpeedPxPerSecondMin) * flow.speed;
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stroke = (points, color, extra = {}) => this.el('polyline', { points: this.pts(points), fill: 'none', stroke: color, 'stroke-width': cfg.loop.strokePx, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...extra }, L);
    // Stroming: warm heen, koud terug, in de zomer andersom. Web Animations met precies één periode per cyclus en
    // startTime 0 op de documenttijdlijn: geen verspringing aan het eind van de cyclus en geen herstart bij hertekenen.
    const flowLine = (points, color, sw = cfg.loop.strokePx) => {
      const e = this.el('polyline', { points: this.pts(points), fill: 'none', stroke: 'rgba(255,255,255,.85)', 'stroke-width': Math.max(1.5, sw * 0.45), 'stroke-dasharray': `${dash} ${gap}`, 'pointer-events': 'none', class: 'flow' }, L);
      const sign = (color === C.warm ? 1 : -1) * (flow.dir < 0 ? -1 : 1);
      if (!reduce && typeof e.animate === 'function') {
        const a = e.animate([{ strokeDashoffset: '0px' }, { strokeDashoffset: `${-sign * period}px` }], { duration: period / Math.max(1, pxPerSec) * 1000, iterations: Infinity, easing: 'linear' });
        a.startTime = 0;
      }
      return e;
    };
    for (const [t0, t1] of net.intervals) {
      const warm = sampled(t0, t1, +o), cold = sampled(t0, t1, -o);
      stroke(warm, C.warm); stroke(cold, C.cold);
      flowLine(warm, C.warm); flowLine(cold, C.cold);
    }
    if (net.backbone) {
      const warm = [this.Q(en.u - o, en.fromRingV + o), this.Q(en.u - o, en.toEdgeV)];
      const cold = [this.Q(en.u + o, en.fromRingV - o), this.Q(en.u + o, en.toEdgeV)];
      stroke(warm, C.warm); stroke(cold, C.cold); flowLine(warm, C.warm); flowLine(cold, C.cold);
      for (const v of [en.fromRingV + 1.2, en.toEdgeV - 0.15]) this.lid(this.Q(en.u, v), L);
    }
    // aftakkingen: van de ringhartlijn (warm = buitenlijn, koud = binnenlijn) haaks naar de gevel, door het
    // straatje. De lijn die van de verste ringlijn komt kruist de dichtstbijzijnde: daar een duidelijk kruispunt.
    const g = cfg.grid.ring;
    // aftakkingen dunner dan de ring en standaard zonder streepjes (opruimronde 29 okt): de ring blijft de blikvanger
    const bs = cfg.loop.branchStrokePx || cfg.loop.strokePx;
    for (const [bid, br] of Object.entries(net.branches)) {
      const port = net.ports && net.ports[bid];
      const [ru, rv] = br.ring;
      const centre = [ru + 0.5, rv + 0.5];
      const horizontal = br.side === 'west' || br.side === 'east';
      // buitennormaal van de ring op deze cel
      const nOut = horizontal ? [ru === g.u[0] ? -1 : 1, 0] : [0, rv === g.v[0] ? -1 : 1];
      // richting van de aftakking (naar het gebouw) en de dwarsrichting (langs de ring)
      const dir = horizontal ? [Math.sign(br.from[0] - centre[0]), 0] : [0, Math.sign(br.from[1] - centre[1])];
      const perp = horizontal ? [0, 1] : [1, 0];
      const outside = dir[0] * nOut[0] + dir[1] * nOut[1] > 0;
      const warmRing = [centre[0] + nOut[0] * o - perp[0] * o, centre[1] + nOut[1] * o - perp[1] * o];
      const coldRing = [centre[0] - nOut[0] * o + perp[0] * o, centre[1] - nOut[1] * o + perp[1] * o];
      const warmEnd = [br.from[0] - perp[0] * o, br.from[1] - perp[1] * o];
      const coldEnd = [br.from[0] + perp[0] * o, br.from[1] + perp[1] * o];
      // door naar het aansluitpunt in het blok (bijv. de techniekruimte van de opslag): eerst in de richting van de
      // aftakking, dan dwars; onder het asset, dat geen eigen grondplaat heeft
      const tail = (end) => {
        if (!port) return [end];
        const mid = horizontal ? [port[0], end[1]] : [end[0], port[1]];
        return [end, mid, port];
      };
      const W = [this.Q(...warmRing), ...tail(warmEnd).map((p) => this.Q(...p))];
      const K = [this.Q(...coldRing), ...tail(coldEnd).map((p) => this.Q(...p))];
      if (bid === highlightId) {
        // geselecteerd gebouw: de aftakking licht op (brede witte gloed onder de leidingen)
        for (const pts of [W, K]) this.el('polyline', { points: this.pts(pts), fill: 'none', stroke: '#FFFFFF', 'stroke-width': cfg.loop.strokePx * 3, 'stroke-linecap': 'round', opacity: 0.55 }, L);
      }
      stroke(W, C.warm, { 'stroke-width': bs }); stroke(K, C.cold, { 'stroke-width': bs });
      if (cfg.loop.branchFlow) { flowLine(W, C.warm, bs); flowLine(K, C.cold, bs); }
      // kruispunt: gebouw buiten de ring -> de koude aftakking kruist de warme ringlijn; binnen -> andersom
      const cross = outside
        ? [centre[0] + nOut[0] * o + perp[0] * o, centre[1] + nOut[1] * o + perp[1] * o]
        : [centre[0] - nOut[0] * o - perp[0] * o, centre[1] - nOut[1] * o - perp[1] * o];
      const [cx, cy] = this.Q(...cross);
      this.el('circle', { cx, cy, r: Math.max(2, bs * 0.9), fill: outside ? C.cold : C.warm, stroke: '#FFFFFF', 'stroke-width': 1.2 }, L);
      const [fx, fy] = port ? this.Q(port[0], port[1]) : this.Q(br.from[0], br.from[1]);
      this.el('ellipse', { cx: fx, cy: fy, rx: 6, ry: 3, fill: C.lid }, L);
    }
  }

  lid([x, y], parent) {
    this.el('ellipse', { cx: x, cy: y, rx: 7, ry: 3.8, fill: C.lid }, parent);
    this.el('ellipse', { cx: x, cy: y, rx: 4.5, ry: 2.4, fill: C.lidIn }, parent);
  }

  // gebouwen en bomen, gesorteerd van achter naar voor. items = [{ id, assetId, u, v, w, h, dimmed, selected }]
  drawObjects(items) {
    this.clear('objects');
    const L = this.layers.objects;
    const occupied = new Set();
    for (const it of items) for (const [u, v] of footprintCells(it.u, it.v, it.w, it.h)) occupied.add(key(u, v));
    const objs = [];
    for (const [u, v] of this.trees) {
      if (occupied.has(key(Math.floor(u), Math.floor(v)))) continue;
      objs.push({ z: u + v, draw: () => this.drawAsset('boom', u - 1, v - 1, 1, 1, { opacity: 1, scale: 0.9 + ((u * 7 + v * 13) % 5) * 0.08 }) });
    }
    for (const it of items) {
      // overlays (de damwand in de kademuur) liggen onder alles wat op dezelfde cellen staat
      objs.push({ z: it.overlay ? it.u + it.v : it.u + it.v + (it.w + it.h) / 2, draw: () => {
        const g = this.el('g', { 'data-id': it.id, class: `obj ${it.dimmed ? 'dimmed' : ''} ${it.selected ? 'selected' : ''}` }, L);
        const img = this.drawAsset(it.assetId, it.u, it.v, it.w, it.h, { opacity: 1, parent: g });
        if (img && this.assets[it.assetId] && this.assets[it.assetId].hubs) this.drawRotors(this.assets[it.assetId], img, g);
        // tikvlak: de footprint, opgetrokken tot de bovenkant van het gebouw (niet de hele viewBox, anders dekt
        // een gebouw vooraan het gebouw erachter af)
        const a = this.assets[it.assetId];
        const d = this.diamond(it.u, it.v, it.w, it.h);
        const diamondH = (it.w + it.h) * this.c * 0.5;
        const top = a ? Math.max(16, (a.anchor[1] - a.viewBox[1]) * this.s - diamondH) : 60;
        this.el('polygon', { points: this.pts([d[3], [d[3][0], d[3][1] - top], [d[0][0], d[0][1] - top], [d[1][0], d[1][1] - top], d[1], d[2]]), fill: 'transparent', class: 'hit' }, g);
        if (it.selected) this.el('polygon', { points: this.pts(d), fill: 'none', stroke: C.cold, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
        if (it.dimmed) this.el('polygon', { points: this.pts(d), fill: 'none', stroke: '#91877A', 'stroke-width': 1.2, 'stroke-dasharray': '8 6', 'stroke-linejoin': 'round', opacity: 0.8 }, g);
      } });
    }
    objs.sort((a, b) => a.z - b.z);
    for (const o of objs) o.draw();
  }

  // rotors van het windpark op de naafpunten (manifest.hubs), draaiend om de naaf; snelheid via setWind(0..1)
  drawRotors(asset, img, parent) {
    const rot = this.assets.rotor;
    if (!rot) return;
    const s = this.s, [vx, vy] = asset.viewBox, [rx, ry, rw, rh] = rot.viewBox;
    const ix = parseFloat(img.getAttribute('x')), iy = parseFloat(img.getAttribute('y'));
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.rotors = [];
    asset.hubs.forEach(([hx, hy], k) => {
      const outer = this.el('g', { transform: `translate(${(ix + (hx - vx) * s).toFixed(1)},${(iy + (hy - vy) * s).toFixed(1)})`, 'pointer-events': 'none' }, parent);
      const inner = this.el('g', { class: 'rotor' }, outer);
      this.el('image', { href: rot.file, x: (rx * s).toFixed(1), y: (ry * s).toFixed(1), width: (rw * s).toFixed(1), height: (rh * s).toFixed(1) }, inner);
      if (!reduce && typeof inner.animate === 'function') {
        const a = inner.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: this.cfg.flex.rotorSecondsPerTurn * 1000, iterations: Infinity, easing: 'linear' });
        a.startTime = -k * 900;
        a.playbackRate = this.wind ?? this.cfg.flex.idleTurbineFactor;
        this.rotors.push(a);
      }
    });
  }
  setWind(factor) { this.wind = factor; for (const a of this.rotors || []) a.playbackRate = factor; }

  // asset op een blok van w x h cellen: het ankerpunt (voorste hoek) komt op de voorste hoek van het blok
  drawAsset(assetId, u, v, _w, _h, opts = {}) {
    const a = this.assets[assetId];
    if (!a) return null;
    const s = this.s * (opts.scale || 1);
    const [ax, ay] = this.Q(u + a.footprint[0], v + a.footprint[1]);
    const [vx, vy, vw, vh] = a.viewBox;
    const img = this.el('image', {
      href: `${a.file}`, x: (ax - (a.anchor[0] - vx) * s).toFixed(1), y: (ay - (a.anchor[1] - vy) * s).toFixed(1),
      width: (vw * s).toFixed(1), height: (vh * s).toFixed(1), opacity: opts.opacity ?? 1, 'pointer-events': 'none',
    }, opts.parent || this.layers.objects);
    return img;
  }

  // ghost-footprint bij het plaatsen: groen geldig, rood ongeldig; met het straatje als het er een nodig heeft
  drawGhost(ghost) {
    this.clear('ghost');
    if (!ghost) return;
    const L = this.layers.ghost;
    const ok = ghost.ok;
    if (ok && ghost.lane) for (const [u, v] of ghost.lane.cells) this.el('polygon', { points: this.pts(this.diamond(u, v, 1, 1)), fill: C.road, opacity: 0.7 }, L);
    this.el('polygon', { points: this.pts(this.diamond(ghost.u, ghost.v, ghost.w, ghost.h)), fill: ok ? C.ghostOk : C.ghostBad, 'fill-opacity': 0.6, stroke: ok ? C.ghostOkLine : C.ghostBadLine, 'stroke-width': 3, 'stroke-linejoin': 'round' }, L);
    if (ok && ghost.assetId) this.drawAsset(ghost.assetId, ghost.u, ghost.v, ghost.w, ghost.h, { opacity: 0.55, parent: L });
  }
}
