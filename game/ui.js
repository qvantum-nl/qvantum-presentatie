// Dashboard en paneel: tekst en knoppen, zonder spellogica. Teksten uit i18n/<taal>.js, getallen uit engine.js.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (s, o = {}) => String(s || '').replace(/\{(\w+)\}/g, (_, k) => (o[k] != null ? o[k] : ''));

export class UI {
  constructor(root, T, cfg, actions) {
    this.root = root; this.T = T; this.cfg = cfg; this.a = actions;
    this.locale = T.locale || 'en-GB';
  }

  kw(v) {
    const a = Math.abs(v);
    if (a >= 1000) return `${(v / 1000).toLocaleString(this.locale, { maximumFractionDigits: 2 })} MW`;
    return `${Math.round(v).toLocaleString(this.locale)} kW`;
  }
  pct(v) { return v === null || v === undefined ? '–' : `${Math.round(v * 100)}%`; }

  loadsLine(id) {
    const T = this.T, b = id === 'storage' ? null : this.cfg.buildings[id];
    if (!b) return '';
    const parts = [];
    if (b.heating) parts.push(`${this.kw(b.heating)} ${T.heating}`);
    if (b.dhw) parts.push(`${this.kw(b.dhw)} ${T.dhw}`);
    if (b.cooling) parts.push(`${this.kw(b.cooling)} ${T.cooling}`);
    let d = b.direct;
    if (b.modes) d = b.modes[b.defaultMode].direct;
    const flexible = b.flexible || (b.modes && b.modes[b.defaultMode].flexible);
    if (flexible && d) parts.push(fmt(T.flexibleSource, { kw: this.kw(typeof d === 'number' ? d : Math.max(...Object.values(d))) }));
    else if (typeof d === 'number' && d) parts.push(`${this.kw(d)} ${T.yearRound}`);
    else if (d && typeof d === 'object') {
      if (d.winter && d.summer) parts.push(`${this.kw(d.winter)} ${T.winterOnly} · ${this.kw(d.summer)} ${T.summerOnly}`);
      else if (d.summer) parts.push(`${this.kw(d.summer)} ${T.summerOnly}`);
      else if (d.winter) parts.push(`${this.kw(d.winter)} ${T.winterOnly}`);
    }
    if (b.assumed) parts.push(T.indicative);
    return parts.join(' · ');
  }

  message(m) {
    const T = this.T, p = m.params || {};
    const o = { kw: this.kw(p.topUp ?? p.shortfallKw ?? p.shortKw ?? p.dumped ?? 0), n: p.unitsNeeded, cap: this.kw(p.powerKw || 0), name: p.name,
                pct: this.pct(p.utilisation ?? p.imbalance), taken: (p.takenMw ?? 0).toFixed(2), dumped: (p.dumpedMw ?? 0).toFixed(2) };
    return fmt(T.messages[m.id], o);
  }

  // ---- dashboard: alles in één oogopslag, zonder scrollen (feedback 28 okt)
  dash(r, net, view) {
    const T = this.T;
    const roofQa = r.roof.kind === 'qa50';
    // kleur van de kop: blauw = niets bij te verwarmen, oranje = meer QA-50's nodig, rood = tekort dat niemand aanvult
    // (drycoolers; wens Viktor 29 okt). Netto krijgt dezelfde rode kleur zolang er zo'n probleem is.
    const shortfall = !roofQa && r.topUp > 0;
    const scoreClass = r.overCapacity ? 'over' : shortfall ? 'short' : (r.topUp === 0 ? 'zero' : '');
    const problem = shortfall || r.overCapacity;
    const barPct = r.roof.capacityKw > 0 ? Math.min(100, r.topUp / r.roof.capacityKw * 100) : (r.topUp > 0 ? 100 : 0);
    const stageText = fmt(T.stage[net.stage], { n: Math.max(0, this.cfg.network.backboneAfterConnections - net.connections) });
    const checks = view.checks || {};
    const chipMeta = (id) => {
      const c = checks[id];
      if (c && !c.ok) return fmt(T.needsSource, { kw: this.kw(c.shortKw) });
      if (this.cfg.decor && this.cfg.decor[id]) { const [w, h] = this.cfg.decor[id].footprint; return `${w} × ${h}`; }
      if (this.cfg.buildings[id] && this.cfg.buildings[id].fixedAt) return `${this.shortLoads(id)}, ${T.wholeQuay}`;
      return this.shortLoads(id);
    };
    const chipName = (id) => (this.cfg.decor && this.cfg.decor[id]) ? T.decor[id] : T.buildings[id].name;
    const chips = (items, header, kind, cls = '') => items.length ? `
      <div class="muted" style="font-size:12px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase">${esc(header)}</div>
      <div class="palette ${cls}">${items.map((id) => `
        <button data-act="${kind}" data-id="${id}" class="${view.placing === id ? 'on' : ''} ${checks[id] && !checks[id].ok ? 'blocked' : ''}" title="${esc(this.loadsLine(id))}">
          ${view.icons && view.icons[id] ? `<img class="ico" src="${esc(view.icons[id])}" alt="">` : ''}
          <span class="txt"><span class="name">${esc(chipName(id))}</span><span class="meta">${esc(chipMeta(id))}</span></span>
        </button>`).join('')}</div>` : '';
    // hooguit twee meldingen; in het startstadium één (het paneel is dan het volst: alle aansluit- en bouwknoppen staan er nog)
    const msgs = r.messages.slice(0, view.notice || net.stage === 'start' ? 1 : 2);
    const badges = [['g1', r.goals.g1], ['g2', r.goals.g2], ['g3', r.goals.g3]];
    this.root.innerHTML = `
      <div class="kicker">${esc(T.loop)} · ${esc(T.seasons[r.season])} · ${esc(fmt(T.connected, { n: (net.attached || 0) + 1 }))} · ${esc(fmt(T.pipe, { m: net.metres.toLocaleString(this.locale) }))}</div>
      <div>
        <div class="row"><h3>${esc(roofQa ? T.topUp : T.shortfall)}</h3>
          ${r.overCapacity && r.roof.extraAllowed && r.roof.count < r.roof.max ? `<button class="btn outline" data-act="addUnit" style="height:40px;font-size:15px;padding:0 12px">${esc(T.addUnit)}</button>` : ''}</div>
        <div class="score ${scoreClass}">${esc(this.kw(r.topUp))}</div>
        <div class="bar ${r.overCapacity ? 'over' : shortfall ? 'short' : ''}"><div style="width:${barPct}%"></div></div>
        <div class="sub" style="margin-top:6px;font-size:15px">${roofQa ? `${esc(T.capacity)} · ${esc(fmt(T.unitsFmt, { n: r.roof.count, kw: this.kw(r.roof.capacityKw) }))}` : esc(T.roofKind.drycooler)} · ${esc(stageText)}</div>
      </div>
      <div class="sparkrow"><div><span class="sub">${esc(T.utilisation)}</span> <span style="font-size:26px;font-weight:600;margin-left:8px">${esc(this.pct(r.utilisation))}</span></div>${this.sparkline(view.history || [], 230, 36)}</div>
      <div class="stats">
        ${this.stat(T.taken, this.kw(r.taken))}${this.stat(T.put, this.kw(r.brought))}${this.stat(T.net, Math.abs(r.net) < 0.5 ? this.kw(0) : `${r.net > 0 ? T.deficit : T.surplus} ${this.kw(Math.abs(r.net))}`, problem && r.net > 0 ? 'short' : '')}
        ${this.stat(T.storage, r.storage ? (r.storage.discharge > 0 ? `${this.kw(r.storage.discharge)} ${T.storageOut}` : r.storage.charge > 0 ? `${this.kw(r.storage.charge)} ${T.storageIn}` : '–') : '–')}
        ${this.stat(T.rejected, this.kw(r.dumped))}${this.stat(T.pipes, `${r.temperatures.cold.toFixed(0)} / ${r.temperatures.warm.toFixed(0)} °C`)}
      </div>
      ${view.notice ? `<div class="msg warn">${esc(this.message(view.notice))}</div>` : ''}
      ${msgs.map((m) => `<div class="msg ${['overCapacity', 'loopUnbalanced', 'storageUnbalanced'].includes(m.id) ? 'warn' : ''}">${esc(this.message(m))}</div>`).join('')}
      <div class="groups">${chips(view.connectable, T.connectHeader, 'connect')}${chips(view.buildable, T.buildHeader, 'build')}${chips(view.decorable || [], T.decorHeader, 'build', 'decor')}</div>
      <div class="badges">${badges.map(([g, ok]) => `<div class="badge ${ok ? 'done' : ''}"><span class="medal">${ok ? '✓' : (g === 'g1' ? '1' : g === 'g2' ? '2' : '3')}</span><span>${esc(T.badges[g])}</span></div>`).join('')}</div>`;
    // passen de knoppengroepen niet (lange teksten, veel meldingen), dan schuiven ze; een vervaagde onderrand laat dat zien
    const groups = this.root.querySelector('.groups');
    if (groups && groups.scrollHeight > groups.clientHeight + 1) groups.classList.add('more');
  }

  stat(k, v, cls = '') { return `<div class="stat"><span class="k">${esc(k)}</span><span class="v ${cls}">${esc(v)}</span></div>`; }

  // korte belastingsregel voor de chips: alleen de grootste post (de volledige regel staat in de title en in het gebouwpaneel)
  shortLoads(id) {
    const T = this.T, b = this.cfg.buildings[id];
    if (!b) return T.buildings.storage ? '' : '';
    let d = b.direct; if (b.modes) d = b.modes[b.defaultMode].direct;
    if (typeof d === 'object' && d) d = Math.max(d.winter || 0, d.summer || 0);
    if (b.flexible || (b.modes && b.modes[b.defaultMode].flexible)) return fmt(T.flexibleSource, { kw: this.kw(d) });
    const parts = [];
    if (b.heating) parts.push([b.heating, `${this.kw(b.heating)} ${T.heating}`]);
    if (b.cooling) parts.push([b.cooling, `${this.kw(b.cooling)} ${T.cooling}`]);
    if (d) parts.push([d, `${this.kw(d)} ${b.source ? T.sourceShort : T.yearRound}`]);
    parts.sort((x, y) => y[0] - x[0]);
    return parts.length ? parts[0][1] : '';
  }

  // scoreverloop per aansluiting (winter-bijverwarming), kleine lijn met het laatste punt gemarkeerd
  sparkline(history, W = 516, H = 44) {
    const T = this.T;
    if (history.length < 2) return '';
    const pad = 4;
    const vals = history.map((h) => h.topUp);
    const max = Math.max(1, ...vals);
    const pts = vals.map((v, i) => `${(pad + i * (W - 2 * pad) / (vals.length - 1)).toFixed(1)},${(H - pad - (v / max) * (H - 2 * pad)).toFixed(1)}`);
    const last = pts[pts.length - 1].split(',');
    return `<div title="${esc(T.sparkline)}"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">
      <polyline points="${pts.join(' ')}" fill="none" stroke="#8FB8FF" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="${last[0]}" cy="${last[1]}" r="3.5" fill="#FFFFFF"/></svg>
      <div class="sub muted" style="font-size:12px;text-align:right">${esc(T.sparkline)}</div></div>`;
  }

  // ---- gebouw
  info(id, state, r, check = null) {
    const T = this.T, b = this.cfg.buildings[id], isNew = b && b.existing === false;
    const contrib = r.perBuilding.find((p) => p.id === id);
    const line = contrib ? (contrib.net > 0.5 ? fmt(T.takes, { kw: this.kw(contrib.net) }) : contrib.net < -0.5 ? fmt(T.gives, { kw: this.kw(-contrib.net) }) : T.neutral) : '';
    const connected = state.connected.includes(id);
    const fixed = b && b.fixed;
    const hp = this.heatPumpLine(id, state);
    this.root.innerHTML = `
      <div class="row"><div><div class="kicker">${esc(isNew ? T.newBuild : b.source ? T.source : T.existing)}</div><h2>${esc(T.buildings[id].name)}</h2></div><button class="close" data-act="close">×</button></div>
      <div class="sub" style="font-size:20px;line-height:27px">${esc(T.buildings[id].desc)}</div>
      <div class="table kv"><span>${esc(T.loads)}</span><span>${esc(this.loadsLine(id))}</span>${hp ? `<span>${esc(T.heatPump)}</span><span>${esc(hp)}</span>` : ''}</div>
      ${connected && line ? `<div class="msg">${esc(line)}</div>` : ''}
      ${!connected && check && check.load ? `<div class="check ${check.ok ? 'ok' : 'bad'}"><div class="kicker">${esc(T.sourceCheck)}</div>
        <div>${esc(fmt(T.scNeeds, { kw: this.kw(check.needKw) }))} · ${esc(fmt(T.scLoop, { kw: this.kw(check.loopKw) }))} · ${esc(fmt(T.scHeadroom, { kw: this.kw(check.headroomKw) }))}</div>
        <div style="font-weight:600">${esc(check.ok ? T.scOk : fmt(T.scShort, { kw: this.kw(check.shortKw) }))}</div></div>` : ''}
      ${fixed ? this.towerExtra(state, r) : ''}
      <div class="row" style="justify-content:flex-start;gap:10px;flex-wrap:wrap">
        ${!connected ? `<button class="btn primary" data-act="connect" data-id="${id}" ${check && !check.ok ? 'disabled' : ''}>${esc(T.connect)}</button>` : ''}
        ${connected && !fixed ? `<button class="btn outline" data-act="disconnect" data-id="${id}">${esc(isNew ? T.remove : T.disconnect)}</button>` : ''}
      </div>`;
  }

  // Welke warmtepomp het gebouw gebruikt (wens Viktor 29 okt): QG-7 per woning of appartement, centrale water-waterwarmtepomp,
  // of geen (koelinstallatie, warmtewisselaar); bij de toren ook de dakunits.
  heatPumpLine(id, state) {
    const T = this.T, b = this.cfg.buildings[id];
    if (!b || !b.heatPump || !T.heatPumps || !T.heatPumps[b.heatPump]) return '';
    let s = fmt(T.heatPumps[b.heatPump], { n: b.homes || 0 });
    if (b.fixed && b.roofUnits) {
      const count = state.roofUnits ?? b.roofUnits.count;
      s += ' · ' + (state.roofKind === 'drycooler' ? T.roofKind.drycooler : fmt(T.heatPumpRoof, { k: count }));
    }
    return s;
  }

  towerExtra(state, r) {
    const T = this.T, ru = this.cfg.buildings.woontoren.roofUnits;
    const kind = state.roofKind;
    return `
      <div class="switch">${ru.kinds.map((k) => `<button data-act="roofKind" data-id="${k}" class="${kind === k ? 'on' : ''}">${esc(T.roofKind[k])}</button>`).join('')}</div>
      ${kind === 'qa50' ? `<div class="row" style="justify-content:flex-start;gap:10px">
        <span class="sub">${esc(fmt(T.unitsFmt, { n: r.roof.count, kw: this.kw(r.roof.capacityKw) }))}</span>
        ${ru.extraAllowed && r.roof.count < ru.max ? `<button class="btn outline" data-act="addUnit" style="height:44px;font-size:17px">${esc(T.addUnit)}</button>` : ''}
        ${r.roof.count > ru.count ? `<button class="btn ghost" data-act="removeUnit">${esc(T.removeUnit)}</button>` : ''}
      </div>` : ''}
      <div class="cards">
        <div class="card"><div class="img"><img src="assets/products/qg.png" alt="QG-7"></div><h4>${esc(T.qgTitle)}</h4><p>${esc(T.qgBody)}</p></div>
        ${kind === 'qa50' && T.showQaCard !== false ? `<div class="card"><div class="img"><img src="assets/qa-50.svg" alt="QA-50" class="iso"></div><h4>${esc(T.qaTitle)}</h4><p>${esc(T.qaBody)}</p></div>` : ''}
      </div>`;
  }

  // ---- opslag
  storageInfo(state, r) {
    const T = this.T, cfg = this.cfg, kind = state.storage;
    const spec = cfg.storage[kind];
    const y = r.annual;
    return this.root.innerHTML = `
      <div class="row"><div><div class="kicker">${esc(T.storageItem)}</div><h2>${esc(T.storageKind[kind])}</h2></div><button class="close" data-act="close">×</button></div>
      <div class="sub" style="font-size:20px;line-height:27px">${esc(T.buildings.storage.desc)}</div>
      <div class="switch">${['closed', 'wko'].map((k) => `<button data-act="storageKind" data-id="${k}" class="${kind === k ? 'on' : ''}">${esc(T.storageKind[k])}</button>`).join('')}</div>
      <div class="sub">${esc(fmt(T.storageNote[kind], { kw: this.kw(spec.powerKw), mwh: `${Math.round(spec.capacityKwh / 1000).toLocaleString(this.locale)} MWh` }))}</div>
      <div class="table">
        <span>${esc(T.yearBal)}</span><span>${esc(T.in)} ${Math.round(y.offeredIn / 1000)} MWh · ${esc(T.out)} ${Math.round(y.requestedOut / 1000)} MWh</span>
        <span>${esc(T.storageLevel)}</span><span>${esc(this.pct(r.storage ? r.storage.levelFraction : 0))}</span>
      </div>
      <div class="bar"><div style="width:${Math.round((r.storage ? r.storage.levelFraction : 0) * 100)}%;background:#8FB8FF"></div></div>
      ${r.messages.filter((m) => ['storageUnbalanced', 'wkoPermit'].includes(m.id)).map((m) => `<div class="msg">${esc(this.message(m))}</div>`).join('')}
      <div><button class="btn outline" data-act="disconnect" data-id="storage">${esc(T.remove)}</button></div>`;
  }

  // ---- decor en windpark
  decorInfo(iid, type) {
    const T = this.T;
    this.root.innerHTML = `
      <div class="row"><div><div class="kicker">${esc(T.decorItem)}</div><h2>${esc(T.decor[type])}</h2></div><button class="close" data-act="close">×</button></div>
      <div><button class="btn outline" data-act="remove" data-id="${esc(iid)}">${esc(T.remove)}</button></div>`;
  }

  windparkInfo(fu) {
    const T = this.T;
    this.root.innerHTML = `
      <div class="row"><div><div class="kicker">${esc(T.flexKicker)}</div><h2>${esc(T.buildings.windpark.name)}</h2></div><button class="close" data-act="close">×</button></div>
      <div class="sub" style="font-size:20px;line-height:27px">${esc(T.buildings.windpark.desc)}</div>
      ${fu && !fu.unlocked ? `<div class="msg">${esc(fmt(T.buildings.windpark.locked, { n: fu.remaining }))}</div>` : `<div><button class="btn primary" data-act="flexOpen">${esc(T.flexPill)}</button></div>`}`;
  }

  // ---- flexlaag: 24-uursklok, daggrafiek met en zonder buffer, "Overschot van het net"
  flexPanel(fd, fx) {
    const T = this.T, cfg = this.cfg;
    const [p0, p1] = fd.peakWindow, [w0] = fd.window, len = fd.windowLen, hour = Math.floor(fx.hour) % 24;
    const inWin = ((hour - w0 + 24) % 24) < len, inPeak = hour >= p0 && hour < p1;
    const kwh = (v) => `${Math.round(v).toLocaleString(this.locale)} kWh`;
    const hh = (h) => `${String(((h % 24) + 24) % 24).padStart(2, '0')}:00`;
    // klok
    const R = 76, cx = 100, cy = 100;
    const ang = (h) => (h / 24) * 2 * Math.PI - Math.PI / 2;
    const pt = (h, r) => [cx + r * Math.cos(ang(h)), cy + r * Math.sin(ang(h))];
    const arc = (a, b, r, color) => {
      const [x0, y0] = pt(a, r), [x1, y1] = pt(b, r), large = ((b - a + 24) % 24) > 12 ? 1 : 0;
      return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="butt" opacity="0.85"/>`;
    };
    const ticks = Array.from({ length: 24 }, (_, h) => { const [x0, y0] = pt(h, R - 2), [x1, y1] = pt(h, h % 6 === 0 ? R - 12 : R - 7); return `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="#FFFFFF" stroke-width="${h % 6 === 0 ? 2 : 1}" opacity="0.7"/>`; }).join('');
    const labels = [0, 6, 12, 18].map((h) => { const [x, y] = pt(h, R + 15); return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="11" fill="#C9BFB2">${h}</text>`; }).join('');
    const [hx, hy] = pt(hour + 0.5, R - 22);
    const clock = `<svg class="clock" data-act="clock" width="200" height="200" viewBox="0 0 200 200">
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.25)"/>
      ${arc(p0, p1, R + 2, '#C41230')}${fx.useBuffer ? arc(w0, w0 + len, R + 2, '#3164FD') : ''}${ticks}${labels}
      <line x1="${cx}" y1="${cy}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="4" fill="#FFFFFF"/>
      <text x="${cx}" y="${cy + 36}" text-anchor="middle" font-size="18" font-weight="600" fill="#FFFFFF">${hh(hour)}</text></svg>`;
    // staafdiagram: 24 uur, zonder buffer als omtrek, met buffer gevuld
    const W = 524, H = 160, L = 40, B = 22, top = 10, bw = (W - L - 6) / 24;
    const maxKw = Math.max(1, ...fd.without, ...(fx.useBuffer ? fd.withBuf : []));
    const y = (v) => top + (H - top - B) * (1 - v / maxKw);
    const band = (a, b, color) => { const x0 = L + a * bw, x1 = L + b * bw; return `<rect x="${x0.toFixed(1)}" y="${top}" width="${(x1 - x0).toFixed(1)}" height="${H - top - B}" fill="${color}" opacity="0.14"/>`; };
    const bands = band(p0, p1, '#C41230') + (fx.useBuffer ? (w0 + len <= 24 ? band(w0, w0 + len, '#3164FD') : band(w0, 24, '#3164FD') + band(0, (w0 + len) % 24, '#3164FD')) : '');
    const bars = fd.without.map((v, h) => {
      const x = L + h * bw + 1.5, wv = fx.useBuffer ? fd.withBuf[h] : v;
      return `${fx.useBuffer ? `<rect x="${x.toFixed(1)}" y="${y(wv).toFixed(1)}" width="${(bw - 3).toFixed(1)}" height="${(y(0) - y(wv)).toFixed(1)}" fill="${h === hour ? '#FFFFFF' : '#8FB8FF'}" opacity="${h === hour ? 1 : 0.9}"/>` : ''}
        <rect x="${x.toFixed(1)}" y="${y(v).toFixed(1)}" width="${(bw - 3).toFixed(1)}" height="${(y(0) - y(v)).toFixed(1)}" fill="${fx.useBuffer ? 'none' : (h === hour ? '#FFFFFF' : 'rgba(255,255,255,.55)')}" stroke="rgba(255,255,255,.75)" stroke-width="1"/>`;
    }).join('');
    const xl = [0, 6, 12, 18, 24].map((h) => `<text x="${(L + h * bw).toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="11" fill="#C9BFB2">${h}</text>`).join('');
    const chart = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">
      ${bands}<line x1="${L}" y1="${y(0)}" x2="${W - 6}" y2="${y(0)}" stroke="rgba(255,255,255,.35)"/>
      <text x="${L - 6}" y="${top + 10}" text-anchor="end" font-size="11" fill="#C9BFB2">${Math.round(maxKw)}</text>
      <text x="${L - 6}" y="${y(0)}" text-anchor="end" font-size="11" fill="#C9BFB2">0</text>
      <text x="${W - 6}" y="${top + 10}" text-anchor="end" font-size="11" fill="#C9BFB2">${esc(T.chartKw)}</text>
      ${bars}${xl}</svg>`;
    const msg = fx.useBuffer ? (inWin ? T.flexWindy : inPeak ? T.flexPeakMsg : T.flexNormal) : T.flexNoBuffer;
    this.root.innerHTML = `
      <div class="row"><div><div class="kicker">${esc(T.flexKicker)}</div><h2>${esc(T.flexTitle)}</h2></div><button class="close" data-act="close">×</button></div>
      <div class="sub">${esc(fmt(T.flexSub, { kwh: kwh(fd.bufferKwh), p0, p1 }))}</div>
      <div class="flexrow">${clock}
        <div class="flexstats">
          ${this.stat(fmt(T.flexEveningPeak, { p0, p1 }), fx.useBuffer ? `${this.kw(fd.eveningPeakWithout)} → ${this.kw(fd.eveningPeakWith)}` : this.kw(fd.eveningPeakWithout))}
          ${this.stat(T.flexShifted, fx.useBuffer ? kwh(fd.shiftedKwh) : '–')}
          ${this.stat(T.flexBuffer, kwh(fd.bufferKwh))}
          ${this.stat(T.flexWindow, fx.useBuffer ? `${hh(w0)}–${hh(w0 + len)}` : '–')}
          <div><button class="btn outline" data-act="flexPlay" style="height:40px;font-size:15px;padding:0 14px">${esc(fx.playing ? T.flexPause : T.flexPlay)}</button></div>
        </div></div>
      ${chart}
      <div class="msg ${inWin && fx.useBuffer ? '' : ''}">${esc(msg)}</div>
      <div class="row" style="justify-content:flex-start;flex-wrap:wrap;gap:10px">
        <div class="switch"><button data-act="flexBuffer" data-id="0" class="${fx.useBuffer ? '' : 'on'}">${esc(T.flexWithout)}</button><button data-act="flexBuffer" data-id="1" class="${fx.useBuffer ? 'on' : ''}">${esc(T.flexWith)}</button></div>
        <button class="btn primary" data-act="flexExcess" ${fx.useBuffer ? '' : 'disabled'}>${esc(T.flexExcess)}</button>
        ${fx.windowStart !== null ? `<button class="btn ghost" data-act="flexReset">${esc(T.flexResetWindow)}</button>` : ''}
      </div>`;
  }

  help() {
    const T = this.T;
    return `<div class="row"><h2>${esc(T.how)}</h2><button class="close" data-act="closeHelp">×</button></div>
      ${T.howBody.map((l) => `<p>${esc(l)}</p>`).join('')}`;
  }
}
