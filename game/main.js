// Build your own ambient loop: spelstaat, invoer en koppeling van engine, grid, render en ui.
import { CONFIG } from './config.js?v=1793339689';
import { compute, networkStage, sourceCheck, flexDay, flexUnlocked, windFactor } from './engine.js?v=1793339689';
import { canPlace, buildNetwork, zoneRects } from './grid.js?v=1793339689';
import { Renderer } from './render.js?v=1793339689';
import { UI } from './ui.js?v=1793339689';

const params = new URLSearchParams(location.search);
const rawLang = (params.get('lang') || CONFIG.defaultLanguage).toLowerCase();
const LANG = CONFIG.languageAliases[rawLang] || (CONFIG.languages.includes(rawLang) ? rawLang : CONFIG.defaultLanguage);

const $ = (sel) => document.querySelector(sel);

const ASSET_IDS = new Set();   // gevuld uit het manifest bij het opstarten

// side = richting van de aftakking ('north', 'south', ...): de opslag heeft een variant met de techniekruimte aan de
// zuidkant voor een aftakking naar het zuiden (wens Viktor 29 okt: het aansluitpunt wijst naar de leiding)
function assetFor(id, state, side = null) {
  const p = state.placed[id];
  if (p && p.type) return CONFIG.decor[p.type].asset;
  if (id === 'woontoren') return state.roofKind === 'qa50' ? 'woontoren' : 'woontoren-drycoolers';
  if (id === 'storage') {
    const base = state.storage === 'wko' ? 'opslag-wko' : 'opslag-gesloten';
    return side === 'south' && ASSET_IDS.has(base + '-zuid') ? base + '-zuid' : base;
  }
  if (id === 'datacenter') return CONFIG.buildings.datacenter.modes[CONFIG.buildings.datacenter.defaultMode].asset;
  return id;
}

function initialState() {
  const placed = {};
  for (const [id, pos] of Object.entries(CONFIG.existingLayout)) {
    const [w, h] = CONFIG.buildings[id].footprint;
    placed[id] = { u: pos.u, v: pos.v, w, h };
  }
  let decorSeq = 0;
  for (const d of CONFIG.initialDecor || []) {
    const def = CONFIG.decor[d.type]; const [w, h] = def.footprint;
    placed[`${d.type}#${++decorSeq}`] = { u: d.u, v: d.v, w, h, type: d.type, passable: !!def.passable };
  }
  return {
    season: 'winter', placed, connected: ['woontoren'], order: ['woontoren'], storage: null,
    roofUnits: CONFIG.buildings.woontoren.roofUnits.count, roofKind: CONFIG.buildings.woontoren.roofUnits.kind,
    placing: null, selected: null, ghost: null, backboneSeen: false, phase: 'start',
    history: [],   // scoreverloop: { id, topUp } na elke aansluiting (winter), voor de sparkline
    goalsSeen: { g1: false, g2: false, g3: false },
    decorSeq, notice: null,
    flex: { on: false, hour: CONFIG.flex.startHour, playing: true, useBuffer: true, windowStart: null },
  };
}

async function boot() {
  const [{ T }, manifest] = await Promise.all([
    import(`./i18n/${LANG}.js?v=1793339689`).catch(() => import('./i18n/en.js')),
    fetch('assets/manifest.json?v=1793339689').then((r) => r.json()),
  ]);
  document.documentElement.lang = LANG;
  const stage = $('#stage');
  const fit = () => { const k = Math.min(innerWidth / 1920, innerHeight / 1080) || 1; stage.style.transform = `scale(${k})`; stage.dataset.k = k; };
  fit(); addEventListener('resize', fit);

  const R = new Renderer($('#city'), manifest, CONFIG);
  let state = initialState();
  const ui = new UI($('#panel'), T, CONFIG, {});
  // vaste teksten
  $('#kicker').textContent = T.kicker; $('#title').textContent = T.title;
  $('#startKicker').textContent = T.kicker; $('#startTitle').textContent = T.title; $('#startBody').textContent = T.startBody;
  $('#startBtn').textContent = T.startBtn; $('#helpBtn').textContent = T.how; $('#backBtn').textContent = T.back;
  $('#resetBtn').textContent = T.reset; $('#flexBtn').textContent = T.flexPill;
  $('#cfTitle').textContent = T.resetTitle; $('#cfBody').textContent = T.resetBody; $('#cfOk').textContent = T.resetOk; $('#cfCancel').textContent = T.cancel;
  document.title = T.title;
  for (const s of ['winter', 'summer']) $(`#season-${s}`).textContent = T.seasons[s];
  $('#backBtn').href = CONFIG.behaviour.backToPresentation;

  const engineState = () => ({ season: state.season, buildings: state.connected, datacenterMode: CONFIG.buildings.datacenter.defaultMode,
                               storage: state.storage, roofUnits: state.roofUnits, roofKind: state.roofKind });
  const assetPorts = Object.fromEntries(manifest.assets.map((a) => [a.id, a.port]));
  manifest.assets.forEach((a) => ASSET_IDS.add(a.id));
  const netState = () => ({ placed: state.placed, order: state.order,
                            ports: Object.fromEntries(Object.keys(state.placed).map((id) => [id, id === 'storage'
                              ? { default: assetPorts[assetFor(id, state)] || null, south: assetPorts[assetFor(id, state, 'south')] || null }
                              : assetPorts[assetFor(id, state)] || null])) });

  function connectable() {
    return Object.keys(CONFIG.buildings).filter((id) => CONFIG.buildings[id].existing && CONFIG.buildings[id].enabled !== false && !state.connected.includes(id));
  }
  function buildable() {
    const ids = Object.keys(CONFIG.buildings).filter((id) => CONFIG.buildings[id].existing === false && CONFIG.buildings[id].enabled !== false && !state.placed[id]);
    if (!state.storage) ids.push('storage');
    return ids;
  }
  const decorable = () => Object.keys(CONFIG.decor || {});
  // bron-check per chip: afnemers die nu niet aangesloten kunnen worden, krijgen dat te zien vóór het tikken
  function checks() {
    const es = engineState(), out = {};
    for (const id of [...connectable(), ...buildable()]) if (CONFIG.buildings[id]) out[id] = sourceCheck(es, id, CONFIG);
    return out;
  }
  function blockedBySource(id) {
    if (!CONFIG.buildings[id]) return false;
    const c = sourceCheck(engineState(), id, CONFIG);
    if (c.ok) return false;
    state.notice = { id: 'noSource', params: { name: T.buildings[id].name, shortKw: c.shortKw } };
    return true;
  }

  const flexData = () => flexDay(engineState(), CONFIG, state.flex.useBuffer ? state.flex.windowStart : null);
  // flexlaag: alleen het paneel en de rotors verversen (elke klokstap), niet de hele plaat
  function renderFlex() {
    const fd = flexData();
    ui.flexPanel(fd, state.flex);
    R.setWind(windFactor(state.flex.hour, fd, CONFIG));
    $('#hint').textContent = T.hintFlex;
  }
  function openFlex() {
    const fu = flexUnlocked(engineState(), CONFIG);
    if (!fu.unlocked) { $('#hint').textContent = fmt(T.flexLocked, { n: fu.remaining }); return false; }
    state.flex.on = true; state.selected = null; state.placing = null; state.ghost = null;
    return true;
  }

  function record(id) {
    const w = compute({ ...engineState(), season: 'winter' }, CONFIG);
    state.history.push({ id, topUp: w.topUp });
  }

  function render() {
    const r = compute(engineState(), CONFIG);
    const net = buildNetwork(netState(), CONFIG);
    const flowDir = state.season === 'summer' ? -1 : 1;
    const speed = Math.min(1, Math.abs(r.net) / 500);
    R.drawNetwork(net, { dir: flowDir, speed }, state.selected);
    R.drawGrid(!!state.placing, state.placing ? zoneRects(state.placing, CONFIG) : []);
    const items = Object.entries(state.placed).map(([id, p]) => ({
      id, assetId: assetFor(id, state, net.lanes[id] && net.lanes[id].side), u: p.u, v: p.v, w: p.w, h: p.h, overlay: !!p.overlay,
      dimmed: !p.type && id !== 'storage' && !state.connected.includes(id), selected: state.selected === id,
    }));
    const wp = CONFIG.reserved.windpark;
    items.push({ id: 'windpark', assetId: 'windpark', u: wp.u, v: wp.v, w: wp.w, h: wp.h, selected: state.selected === 'windpark' });
    R.drawObjects(items);
    R.drawGhost(state.ghost);
    // paneel
    const selP = state.selected && state.placed[state.selected];
    const fu = flexUnlocked(engineState(), CONFIG);
    $('#flexBtn').classList.toggle('on', state.flex.on); $('#flexBtn').classList.toggle('locked', !fu.unlocked);
    if (state.flex.on && !fu.unlocked) state.flex.on = false;
    if (state.flex.on) ui.flexPanel(flexData(), state.flex);
    else if (state.selected === 'storage') ui.storageInfo(state, r);
    else if (state.selected === 'windpark') ui.windparkInfo(fu);
    else if (selP && selP.type) ui.decorInfo(state.selected, selP.type);
    else if (state.selected) ui.info(state.selected, state, r, state.connected.includes(state.selected) ? null : sourceCheck(engineState(), state.selected, CONFIG));
    else {
      // miniatuur van het asset op elke knop (feedback 28 okt): zie wat je gaat plaatsen
      const iconFor = (id) => CONFIG.decor[id] ? CONFIG.decor[id].asset : id === 'storage' ? 'opslag-gesloten' : (CONFIG.buildings[id].icon || assetFor(id, state));
      const ids = [...connectable(), ...buildable(), ...decorable()];
      const icons = Object.fromEntries(ids.map((id) => [id, (R.assets[iconFor(id)] || {}).file]).filter(([, f]) => f));
      // aankleden pas na de backbone (de afwerking; eerder is het paneel te vol met aansluit- en bouwknoppen)
      ui.dash(r, net, { placing: state.placing, connectable: connectable(), buildable: buildable(), decorable: net.stage === 'backbone' ? decorable() : [], checks: checks(), notice: state.notice, history: state.history, icons });
    }
    // doelen: pop-up zodra er een behaald wordt (badges staan onderin het paneel)
    const reached = ['g1', 'g2', 'g3'].filter((g) => r.goals[g] && !state.goalsSeen[g]);
    for (const g of ['g1', 'g2', 'g3']) state.goalsSeen[g] = r.goals[g];
    if (reached.length && state.phase === 'build') toast(T.goalReached, reached.map((g) => T.badges[g]).join(' · '));
    // hint en seizoen
    R.setWind(state.flex.on ? windFactor(state.flex.hour, flexData(), CONFIG) : CONFIG.flex.idleTurbineFactor);
    const placeHint = state.placing && CONFIG.decor[state.placing] ? T.hintDecor : T.hintPlace;
    $('#hint').textContent = state.flex.on ? T.hintFlex : state.placing
      ? (state.ghost && !state.ghost.ok && T.invalid[state.ghost.reason] ? `${T.invalid[state.ghost.reason]} ${placeHint}` : placeHint)
      : `${T.hintConnect} ${T.hintDetails}`;
    for (const s of ['winter', 'summer']) $(`#season-${s}`).classList.toggle('on', state.season === s);
    // backbone-gebeurtenis
    const st = networkStage(engineState(), CONFIG);
    if (st.stage === 'backbone' && !state.backboneSeen) {
      state.backboneSeen = true;
      $('#bbTitle').textContent = T.backboneTitle; $('#bbBody').textContent = T.backboneBody; $('#bbOk').textContent = T.backboneOk;
      $('#backbone').classList.remove('hidden');
    }
    try { localStorage.setItem('qv-beurs', JSON.stringify({ lang: rawLang, route: 'game' })); } catch (e) { /* kiosk-meting is optioneel */ }
  }

  let toastTimer = null;
  function toast(kicker, text) {
    const el = $('#toast');
    el.innerHTML = `<div class="kicker"></div><div></div>`;
    el.firstChild.textContent = kicker; el.lastChild.textContent = text;
    el.classList.remove('hidden');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.add('hidden'), 4500);
  }

  // ---- acties
  function connect(id) {
    if (!state.placed[id] || state.connected.includes(id)) return;
    if (blockedBySource(id)) { state.selected = null; return; }
    state.connected.push(id); state.order.push(id); state.selected = id; state.flex.on = false;
    record(id);
  }
  function disconnect(id) {
    if (id === 'storage') { state.storage = null; delete state.placed.storage; }
    else if (CONFIG.buildings[id].existing === false) { delete state.placed[id]; }
    state.connected = state.connected.filter((x) => x !== id);
    state.order = state.order.filter((x) => x !== id);
    state.selected = null;
    record(id);
  }
  function place(id, u, v) {
    const d = CONFIG.decor[id];
    if (d) {
      // decor: meerdere stuks, blijft in plaatsmodus zodat je door kunt tikken
      const [w, h] = d.footprint;
      state.placed[`${id}#${++state.decorSeq}`] = { u, v, w, h, type: id, passable: !!d.passable };
      state.ghost = null;
      return;
    }
    if (blockedBySource(id)) { state.placing = null; state.ghost = null; return; }
    const b = id === 'storage' ? { footprint: CONFIG.storage.footprint } : CONFIG.buildings[id];
    const [w, h] = b.footprint;
    state.placed[id] = { u, v, w, h, overlay: !!b.overlay };
    if (id === 'storage') state.storage = state.storage || 'closed';
    else state.connected.push(id);
    state.order.push(id);
    state.placing = null; state.ghost = null; state.selected = id;
    record(id);
  }
  function ghostAt(id, u, v) {
    const d = CONFIG.decor[id];
    const b = d || (id === 'storage' ? { footprint: CONFIG.storage.footprint } : CONFIG.buildings[id]);
    const [w, h] = b.footprint;
    const res = canPlace(id, u, v, state.placed, {}, CONFIG);
    return { u, v, w, h, ok: res.ok, reason: res.reason, lane: res.lane, assetId: d ? d.asset : assetFor(id, state, res.lane && res.lane.side) };
  }
  // bouwknop: decor en gewone functies gaan naar plaatsmodus; een functie met een vaste plek (de damwand) staat er meteen
  function startBuild(id) {
    state.selected = null; state.ghost = null; state.flex.on = false;
    if (state.placing === id) { state.placing = null; return; }
    const b = CONFIG.buildings[id];
    if (b && b.fixedAt) { if (ghostAt(id, b.fixedAt.u, b.fixedAt.v).ok) place(id, b.fixedAt.u, b.fixedAt.v); return; }
    if (b && blockedBySource(id)) { state.placing = null; return; }
    state.placing = id;
  }

  // ---- invoer op de plaat
  const city = $('#city');
  const stagePoint = (ev) => { const b = stage.getBoundingClientRect(); const k = parseFloat(stage.dataset.k) || 1; return [(ev.clientX - b.left) / k, (ev.clientY - b.top) / k]; };
  let raf = null;
  city.addEventListener('pointermove', (ev) => {
    if (!state.placing || ev.pointerType === 'touch') return;
    const [x, y] = stagePoint(ev);
    const [u, v] = R.cellAt(x, y);
    if (state.ghost && state.ghost.u === u && state.ghost.v === v) return;
    state.ghost = ghostAt(state.placing, u, v);
    if (!raf) raf = requestAnimationFrame(() => { raf = null; R.drawGhost(state.ghost); });
  });
  city.addEventListener('click', (ev) => {
    if (state.placing) {
      const [x, y] = stagePoint(ev);
      const [u, v] = R.cellAt(x, y);
      const g = ghostAt(state.placing, u, v);
      if (g.ok) place(state.placing, u, v);
      else { state.ghost = g; }
      render(); return;
    }
    const hit = ev.target.closest('[data-id]');
    if (hit) {
      const id = hit.dataset.id;
      if (id === 'windpark' && openFlex()) { render(); return; }
      state.selected = id; state.flex.on = false;
    } else { state.selected = null; state.flex.on = false; }
    render();
  });

  // ---- paneel en knoppen
  $('#panel').addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-act]'); if (!btn) return;
    const act = btn.dataset.act, id = btn.dataset.id;
    state.notice = null;
    if (act === 'connect') { if (state.placed[id]) connect(id); }
    else if (act === 'build') startBuild(id);
    else if (act === 'remove') { delete state.placed[id]; state.selected = null; }
    else if (act === 'flexOpen') { openFlex(); }
    else if (act === 'flexPlay') { state.flex.playing = !state.flex.playing; }
    else if (act === 'flexBuffer') { state.flex.useBuffer = id === '1'; }
    else if (act === 'flexExcess') { state.flex.windowStart = Math.floor(state.flex.hour) % 24; }
    else if (act === 'flexReset') { state.flex.windowStart = null; }
    else if (act === 'clock') {
      const r = btn.getBoundingClientRect();
      const a = Math.atan2(ev.clientY - (r.top + r.height / 2), ev.clientX - (r.left + r.width / 2)) + Math.PI / 2;
      state.flex.hour = ((Math.round((a / (2 * Math.PI)) * 24) % 24) + 24) % 24; state.flex.playing = false;
    }
    else if (act === 'disconnect') disconnect(id);
    else if (act === 'close') { state.selected = null; state.flex.on = false; }
    else if (act === 'help') { $('#helpBody').innerHTML = ui.help(); $('#help').classList.remove('hidden'); return; }
    else if (act === 'roofKind') state.roofKind = id;
    else if (act === 'addUnit') { state.roofUnits = Math.min(CONFIG.buildings.woontoren.roofUnits.max, state.roofUnits + 1); record('qa50'); }
    else if (act === 'removeUnit') { state.roofUnits = Math.max(CONFIG.buildings.woontoren.roofUnits.count, state.roofUnits - 1); record('qa50'); }
    else if (act === 'storageKind') { state.storage = id; record('storage'); }
    render();
  });
  $('#help').addEventListener('click', (ev) => { if (ev.target.closest('[data-act="closeHelp"]') || ev.target === $('#help')) $('#help').classList.add('hidden'); });
  $('#helpBtn').addEventListener('click', () => { $('#helpBody').innerHTML = ui.help(); $('#help').classList.remove('hidden'); });
  $('#bbOk').addEventListener('click', () => $('#backbone').classList.add('hidden'));
  for (const s of ['winter', 'summer']) $(`#season-${s}`).addEventListener('click', () => { state.season = s; render(); });
  $('#flexBtn').addEventListener('click', () => { if (state.flex.on) state.flex.on = false; else if (!openFlex()) return; render(); });
  // klok: een uur per (clockSecondsPerDay / 24) s zolang de flexlaag open staat en afspeelt
  setInterval(() => {
    if (!state.flex.on || !state.flex.playing || state.phase !== 'build') return;
    state.flex.hour = (Math.floor(state.flex.hour) + 1) % 24;
    renderFlex();
  }, CONFIG.flex.clockSecondsPerDay / 24 * 1000);
  // Opnieuw beginnen: met bevestiging (config.behaviour.resetConfirm), anders wist één tik alles
  $('#resetBtn').addEventListener('click', () => { if (CONFIG.behaviour.resetConfirm) $('#confirm').classList.remove('hidden'); else { state = initialState(); render(); } });
  $('#cfOk').addEventListener('click', () => { $('#confirm').classList.add('hidden'); state = initialState(); render(); });
  $('#cfCancel').addEventListener('click', () => $('#confirm').classList.add('hidden'));
  $('#confirm').addEventListener('click', (ev) => { if (ev.target === $('#confirm')) $('#confirm').classList.add('hidden'); });
  // Idle-reset naar het begin: alleen als config.behaviour.attractIdleSeconds > 0 (op de kiosk doet de overlay dit al)
  if (CONFIG.behaviour.attractIdleSeconds > 0) {
    let idleTimer = null;
    const arm = () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => { if (state.phase === 'build') { state = initialState(); $('#start').classList.remove('hidden'); render(); } }, CONFIG.behaviour.attractIdleSeconds * 1000); };
    for (const evn of ['pointerdown', 'keydown', 'touchstart']) document.addEventListener(evn, arm, { passive: true });
    arm();
  }
  $('#startBtn').addEventListener('click', () => { $('#start').classList.add('hidden'); state.phase = 'build'; if (!state.history.length) record('woontoren'); render(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { state.placing = null; state.ghost = null; state.selected = null; render(); } });

  // ?scenario=kantoor,supermarkt,ziekenhuis,storage:wko,pvt-veld@9x9  (voor tests en schermafbeeldingen; slaat het startscherm over)
  const scenario = params.get('scenario');
  if (scenario !== null) {
    $('#start').classList.add('hidden'); state.phase = 'build'; record('woontoren');
    for (const item of scenario.split(',').map((x) => x.trim()).filter(Boolean)) {
      const [idPart, at] = item.split('@');
      const [id, kind] = idPart.split(':');
      if (CONFIG.existingLayout[id]) connect(id);
      else if (CONFIG.buildings[id] && CONFIG.buildings[id].fixedAt) startBuild(id);
      else if (at) { const [u, v] = at.split('x').map(Number); const g = ghostAt(id, u, v); if (g.ok) { place(id, u, v); if (id === 'storage' && kind) state.storage = kind; } }
      state.placing = null; state.notice = null;
    }
    state.selected = null; state.backboneSeen = params.get('backbone') !== 'show';
    if (params.get('season') === 'summer') state.season = 'summer';
    if (params.get('flex') === '1') { state.flex.on = true; state.flex.playing = false; }
    if (params.get('hour') !== null) state.flex.hour = Number(params.get('hour')) % 24;
    if (params.get('place')) startBuild(params.get('place'));   // plaatsmodus open (zone-arcering) voor schermafbeeldingen
  }
  render();
}

boot().catch((e) => { console.error(e); document.body.insertAdjacentHTML('beforeend', `<pre style="color:#fff;position:fixed;left:16px;top:16px;z-index:9">${String(e.stack || e)}</pre>`); });
