// Rekenmodel van het spel: puur, zonder DOM. Alle getallen komen uit config.js.
// Gebruik: compute(state, CONFIG) geeft de cijfers voor het getoonde seizoen, de jaarbalans, de doelen en de
// meldingen; flexDay(state, CONFIG, windowStart) het 24-uursprofiel van de flexlaag; networkStage(state, CONFIG)
// het stadium van het net.
//
// state = {
//   season: 'winter' | 'summer',
//   buildings: ['woontoren', 'ziekenhuis', ...],      // aangesloten functies (elk hooguit één keer)
//   datacenterMode: '1MW',
//   storage: null | 'closed' | 'wko',
//   roofUnits: 6,                                      // aantal QA-50's op de toren (optioneel)
//   roofKind: 'qa50' | 'drycooler',                     // dakunit-keuze (optioneel)
// }

import { CONFIG as DEFAULT_CONFIG } from './config.js?v=1793339689';

// direct = directe warmte-input in de lus: een getal (jaarrond) of per seizoen ({ winter, summer }), zoals bij de bronnen.
export function loadsFor(id, state, cfg = DEFAULT_CONFIG, season = null) {
  const b = cfg.buildings[id];
  if (!b) throw new Error(`Onbekend gebouw: ${id}`);
  let direct = b.direct || 0;
  if (b.modes) {
    const mode = state.datacenterMode || b.defaultMode;
    direct = b.modes[mode].direct;
  }
  if (direct && typeof direct === 'object') direct = season ? (direct[season] || 0) : Math.max(...Object.values(direct));
  const flexible = !!(b.flexible || (b.modes && b.modes[state.datacenterMode || b.defaultMode].flexible));
  return { heating: b.heating || 0, dhw: b.dhw || 0, cooling: b.cooling || 0, direct, flexible };
}

// Genomen uit de lus en gebracht in de lus voor één gebouw in één seizoen (kW).
export function exchangeFor(id, season, state, cfg = DEFAULT_CONFIG) {
  const L = loadsFor(id, state, cfg, season);
  const s = cfg.seasons[season];
  const e = cfg.efficiency;
  const taken = L.heating * s.heating * (1 - 1 / e.copHeating) + L.dhw * (1 - 1 / e.copDhw);
  // flexibele bron (datacenter): levert niet vast, maar vult later het tekort aan tot flexKw
  const brought = L.cooling * s.cooling * (1 + 1 / e.eerCooling) + (L.flexible ? 0 : L.direct);
  return { id, taken, brought, net: taken - brought, flexKw: L.flexible ? L.direct : 0 };
}

// Totalen van de vaste stromen; flexCapacity = wat flexibele bronnen maximaal kunnen aanvullen.
export function totals(season, state, cfg = DEFAULT_CONFIG) {
  const perBuilding = state.buildings.map((id) => exchangeFor(id, season, state, cfg));
  const taken = perBuilding.reduce((a, b) => a + b.taken, 0);
  const brought = perBuilding.reduce((a, b) => a + b.brought, 0);
  const flexCapacity = perBuilding.reduce((a, b) => a + b.flexKw, 0);
  return { season, perBuilding, taken, brought, net: taken - brought, flexCapacity };
}

// Verdeling van een tekort: eerst de opslag (ontladen), dan de flexibele bronnen (datacenter), dan de QA-50's.
export function fillGap(net, discharge, flexCapacity) {
  const gap = Math.max(0, net - discharge);
  const flex = Math.min(flexCapacity, gap);
  return { flex, topUp: gap - flex };
}

function storageSpec(state, cfg) {
  return state.storage ? cfg.storage[state.storage] : null;
}

// Dakunits op de toren: QA-50's leveren bijverwarming (kwEach per stuk); drycoolers leveren niets.
export function roofCapacity(state, cfg = DEFAULT_CONFIG) {
  const fixed = Object.keys(cfg.buildings).find((id) => cfg.buildings[id].fixed) || 'woontoren';
  const ru = cfg.buildings[fixed].roofUnits;
  const kind = state.roofKind || ru.kind;
  const count = Math.max(ru.count, Math.min(ru.max, state.roofUnits ?? ru.count));
  const capacityKw = kind === 'qa50' ? count * ru.kwEach : 0;
  return { kind, count, kwEach: ru.kwEach, capacityKw, baseCount: ru.count, max: ru.max, extraAllowed: ru.extraAllowed };
}

// Jaarsimulatie van de opslag: seizoenen in de volgorde van cfg.yearCycle (zomer, winter). Twee rondes zodat
// het laadniveau periodiek wordt. Levert per seizoen de gemiddelde vermogens (kW) en de energiebalans (kWh).
export function annual(state, cfg = DEFAULT_CONFIG) {
  const spec = storageSpec(state, cfg);
  const steps = cfg.yearCycle.map((season) => {
    const t = totals(season, state, cfg);
    const hours = cfg.seasons[season].hours / cfg.yearCycle.filter((x) => x === season).length;
    return { season, hours, ...t };
  });
  let level = 0;
  let results = [];
  for (let round = 0; round < 2; round++) {
    results = [];
    for (const st of steps) {
      let charge = 0, discharge = 0;
      if (spec) {
        if (st.net < 0) {
          const kw = Math.min(spec.powerKw, -st.net);
          const kwh = Math.min(kw * st.hours, spec.capacityKwh - level);
          charge = kwh / st.hours; level += kwh;
        } else if (st.net > 0) {
          const kw = Math.min(spec.powerKw, st.net);
          const kwh = Math.min(kw * st.hours, level);
          discharge = kwh / st.hours; level -= kwh;
        }
      }
      const { flex, topUp } = fillGap(st.net, discharge, st.flexCapacity);
      const dumped = Math.max(0, -st.net - charge);
      const brought = st.brought + flex;
      const used = brought - dumped;
      results.push({ ...st, charge, discharge, flex, brought, topUp, dumped, used, levelKwh: level,
                     levelFraction: spec ? level / spec.capacityKwh : 0 });
    }
  }
  // Energiebalans van de bodem: wat de seizoenen aan de opslag aanbieden (laden) tegenover wat ze vragen
  // (ontladen), elk begrensd door het vermogen maar niet door elkaar (zelfde definitie als spel-v1).
  let offeredIn = 0, requestedOut = 0;
  if (spec) {
    for (const st of steps) {
      if (st.net < 0) offeredIn += Math.min(spec.powerKw, -st.net) * st.hours;
      else if (st.net > 0) requestedOut += Math.min(spec.powerKw, st.net) * st.hours;
    }
  }
  const inKwh = results.reduce((a, r) => a + r.charge * r.hours, 0);
  const outKwh = results.reduce((a, r) => a + r.discharge * r.hours, 0);
  const imbalance = Math.max(offeredIn, requestedOut) > 0
    ? Math.abs(offeredIn - requestedOut) / Math.max(offeredIn, requestedOut) : 0;
  const idle = !!spec && requestedOut === 0;   // de lus heeft het hele jaar overschot: de opslag wordt nooit gevraagd
  const hoursTotal = results.reduce((a, r) => a + r.hours, 0);
  const topUpKwh = results.reduce((a, r) => a + r.topUp * r.hours, 0);
  const takenKwh = results.reduce((a, r) => a + r.taken * r.hours, 0);
  const broughtKwh = results.reduce((a, r) => a + r.brought * r.hours, 0);
  const usedKwh = results.reduce((a, r) => a + r.used * r.hours, 0);
  return {
    steps: results, hoursTotal, inKwh, outKwh, offeredIn, requestedOut, imbalance, idle,
    balanced: !!spec && !idle && inKwh > 0 && outKwh > 0 && imbalance <= cfg.storage.balanceTolerance,
    topUpKwh, baselineKwh: takenKwh, broughtKwh, usedKwh,
    utilisation: broughtKwh > 0 ? usedKwh / broughtKwh : null,
    topUpFraction: takenKwh > 0 ? topUpKwh / takenKwh : 0,
  };
}

export function temperatures(taken, brought, cfg = DEFAULT_CONFIG) {
  const T = cfg.temperatures;
  const denom = Math.max(taken, brought, 1e-9);
  const ratio = Math.max(-1, Math.min(1, (brought - taken) / denom));
  const clamp = (x) => Math.max(T.min, Math.min(T.max, x));
  const cold = clamp(T.coldBase + ratio * T.ratioSpan);
  const warm = clamp(cold + T.deltaT);
  return { cold, warm, ratio };
}

// Basislijn zoals in spel-v1: de toren alleen, in de winter, zonder uitwisseling (131 kW).
export function baselineKw(cfg = DEFAULT_CONFIG) {
  const fixed = Object.keys(cfg.buildings).find((id) => cfg.buildings[id].fixed) || 'woontoren';
  return exchangeFor(fixed, 'winter', { buildings: [fixed] }, cfg).net;
}

// Stadium van het net: 'start' (alleen de toren), 'organic' (leiding groeit per aansluiting), 'backbone'
// (na cfg.network.backboneAfterConnections aansluitingen na de toren ligt de hele ring).
// Alleen gebouwen met warmte- of koudevraag tellen voor de backbone (Viktor 28 okt): bronnen, opslag, supermarkt
// en datacenter zijn geen dragers van een lus. 'start' = er hangt nog niets aan de toren (geen lus getekend).
export function countsForBackbone(id, cfg = DEFAULT_CONFIG) {
  const b = cfg.buildings[id];
  return !!b && !b.fixed && !b.source && ((b.heating || 0) + (b.cooling || 0) + (b.dhw || 0)) > 0;
}

export function networkStage(state, cfg = DEFAULT_CONFIG) {
  const fixed = Object.keys(cfg.buildings).find((id) => cfg.buildings[id].fixed) || 'woontoren';
  const attached = state.buildings.filter((id) => id !== fixed).length + (state.storage ? 1 : 0);
  const connections = state.buildings.filter((id) => countsForBackbone(id, cfg)).length;
  const threshold = cfg.network.backboneAfterConnections;
  const stage = attached === 0 ? 'start' : connections < threshold ? 'organic' : 'backbone';
  return { stage, attached, connections, threshold, remaining: Math.max(0, threshold - connections) };
}

// Cijfers voor het getoonde seizoen. De opslagstromen komen uit de jaarsimulatie (zelfde seizoen),
// zodat ontladen begrensd is door wat er in de rest van het jaar is geladen.
export function compute(state, cfg = DEFAULT_CONFIG) {
  const season = state.season || 'winter';
  const t = totals(season, state, cfg);
  const year = annual(state, cfg);
  const seasonSteps = year.steps.filter((s) => s.season === season);
  const avg = (key) => seasonSteps.reduce((a, s) => a + s[key], 0) / Math.max(1, seasonSteps.length);
  const charge = avg('charge'), discharge = avg('discharge');
  const { flex, topUp } = fillGap(t.net, discharge, t.flexCapacity);   // tekort: opslag, dan datacenter, dan QA-50
  const brought = t.brought + flex;
  const dumped = Math.max(0, -t.net - charge);
  const used = brought - dumped;
  const utilisation = brought > 0 ? used / brought : null;
  // flexibele bronnen krijgen hun werkelijke bijdrage (naar rato van capaciteit) in de gebouwentabel
  const perBuilding = t.perBuilding.map((p) => p.flexKw > 0 && t.flexCapacity > 0
    ? { ...p, brought: flex * p.flexKw / t.flexCapacity, net: -(flex * p.flexKw / t.flexCapacity), capacityKw: p.flexKw } : p);
  const roof = roofCapacity(state, cfg);
  const spec = storageSpec(state, cfg);
  const dcMode = state.buildings.includes('datacenter') ? (state.datacenterMode || cfg.buildings.datacenter.defaultMode) : null;
  const goals = evaluateGoals(year, state, cfg);
  const base = baselineKw(cfg);
  const network = networkStage(state, cfg);
  const messages = [];
  if (roof.kind !== 'qa50' && topUp > 0) {
    messages.push({ id: 'loopUnbalanced', params: { shortfallKw: topUp } });
  } else if (topUp > roof.capacityKw * cfg.thresholds.roofOverload && roof.capacityKw > 0) {
    messages.push({ id: 'overCapacity', params: { topUp, capacityKw: roof.capacityKw, unitsNeeded: Math.ceil(topUp / roof.kwEach) } });
  }
  if (state.buildings.length > 1 && topUp > 0 && topUp < cfg.goals.g2.topUpMaxFractionOfBaseline * base) {
    messages.push({ id: 'lowTopUp', params: { topUp, baselineKw: base } });
  }
  if (dcMode === cfg.thresholds.hyperscaleMode) {
    messages.push({ id: 'hyperscale', params: { takenMw: used / 1000, dumpedMw: dumped / 1000 } });
  } else if (dumped > 0) {
    messages.push({ id: spec ? 'rejectedWithStorage' : 'rejectedNoStorage', params: { dumped, powerKw: spec ? spec.powerKw : 0 } });
  }
  if (utilisation !== null && utilisation < cfg.thresholds.lowUtilisation && dcMode !== cfg.thresholds.hyperscaleMode) {
    messages.push({ id: 'lowUtilisation', params: { utilisation } });
  }
  if (spec && year.idle && year.offeredIn > 0) {
    messages.push({ id: 'storageIdle', params: {} });
  } else if (spec && year.imbalance > cfg.thresholds.storageUnbalanced) {
    messages.push({ id: 'storageUnbalanced', params: { imbalance: year.imbalance } });
  }
  if (state.storage === 'wko') messages.push({ id: 'wkoPermit', params: {} });
  return {
    season,
    perBuilding,
    taken: t.taken, brought, net: t.taken - brought, netFixed: t.net, flex, flexCapacityKw: t.flexCapacity,
    storage: spec ? { kind: state.storage, charge, discharge, levelFraction: avg('levelFraction'), powerKw: spec.powerKw } : null,
    topUp, dumped, used, utilisation,
    roof,
    roofCapacityKw: roof.capacityKw,
    roofFraction: roof.capacityKw > 0 ? topUp / roof.capacityKw : (topUp > 0 ? Infinity : 0),
    overCapacity: roof.capacityKw > 0 && topUp > roof.capacityKw,
    unitsNeeded: roof.kwEach > 0 ? Math.ceil(topUp / roof.kwEach) : 0,
    temperatures: temperatures(t.taken - discharge + charge, brought, cfg),
    baseline: base,
    annual: year,
    goals,
    network,
    messages,
  };
}

// Doel 1 en 2 in het seizoen cfg.goals.evaluateIn (winter), doel 3 op de jaarbalans van de opslag.
// Bron-check (feedback 28 okt): een lus begint niet zonder bron. Mag deze afnemer erbij? Toetsseizoen uit
// cfg.sourceCheck. Geeft wat hij nodig heeft, wat lus en opslag dekken, de QA-50-ruimte en het tekort.
export function sourceCheck(state, id, cfg = DEFAULT_CONFIG) {
  const sc = cfg.sourceCheck || {};
  const b = cfg.buildings[id];
  if (!b || sc.enabled === false) return { load: false, ok: true, needKw: 0 };
  const season = sc.season || 'winter';
  const next = { ...state, season, buildings: [...(state.buildings || []), id] };
  const needKw = Math.max(0, exchangeFor(id, season, next, cfg).net);
  if (needKw < 0.5) return { load: false, ok: true, needKw: 0 };
  const before = compute({ ...state, season }, cfg);
  const after = compute(next, cfg);
  const topUpKw = Math.max(0, after.topUp - before.topUp);
  const headroomKw = Math.max(0, after.roofCapacityKw - before.topUp);
  const shortKw = Math.max(0, after.topUp - after.roofCapacityKw);
  return { load: true, ok: shortKw <= 0.5, needKw, loopKw: Math.max(0, needKw - topUpKw), topUpKw, headroomKw, shortKw, capacityKw: after.roofCapacityKw };
}

export function evaluateGoals(year, state, cfg = DEFAULT_CONFIG) {
  const g = cfg.goals;
  const base = baselineKw(cfg);
  const steps = year.steps.filter((s) => s.season === g.evaluateIn);
  const avg = (key) => steps.reduce((a, s) => a + s[key], 0) / Math.max(1, steps.length);
  const topUp = avg('topUp'), brought = avg('brought'), used = avg('used');
  const utilisation = brought > 0 ? used / brought : null;
  const g1 = topUp < g.g1.topUpMaxFractionOfBaseline * base;
  const g2 = topUp < g.g2.topUpMaxFractionOfBaseline * base && utilisation !== null && utilisation > g.g2.utilisationMin;
  // doel 3 alleen als de opslag echt gebruikt wordt (laadt en ontlaadt); bij jaarrond overschot blijft het open
  const g3 = !!state.storage && !year.idle && year.inKwh > 0 && year.outKwh > 0 && year.imbalance <= g.g3.storageBalanceTolerance;
  return { g1, g2, g3, season: g.evaluateIn, baselineKw: base, topUpKw: topUp, utilisation };
}

// Flexlaag (uit spel-v1): elektriciteit per uur (kW) zonder en met buffer. De buffer (kWh van de aangesloten
// gebouwen) verschuift het blok cfg.flex.peakWindow naar het windvenster of naar het gekozen venster
// (windowStart = uur, "Overschot van het net").
export function flexDay(state, cfg = DEFAULT_CONFIG, windowStart = null) {
  const season = state.season || 'winter';
  const fs = cfg.seasons[season];
  const e = cfg.efficiency;
  const fx = cfg.flex;
  let base = 0, bufferKwh = 0;
  for (const id of state.buildings) {
    const L = loadsFor(id, state, cfg, season);
    base += L.heating * fs.heating / e.copHeating + L.dhw / e.copDhw;
    bufferKwh += cfg.buildings[id].bufferKwh || 0;
  }
  const without = fx.profile.map((v) => base * v);
  const withBuf = without.slice();
  let shifted = 0;
  const [p0, p1] = fx.peakWindow;
  for (let h = p0; h < p1; h++) {
    const cut = Math.min(withBuf[h], (bufferKwh - shifted) / (p1 - h));
    withBuf[h] -= cut; shifted += cut;
  }
  const len = fx.windWindow[1] - fx.windWindow[0];
  const w0 = windowStart ?? fx.windWindow[0];
  for (let i = 0; i < len; i++) withBuf[(w0 + i) % 24] += shifted / len;
  const peakWithout = Math.max(...without), peakWith = Math.max(...withBuf);
  const evening = (arr) => Math.max(...arr.slice(p0, p1));
  return { without, withBuf, shiftedKwh: shifted, bufferKwh, window: [w0, (w0 + len) % 24], windowLen: len, baseKw: base,
           peakWithout, peakWith, peakReduction: peakWithout > 0 ? 1 - peakWith / peakWithout : 0,
           eveningPeakWithout: evening(without), eveningPeakWith: evening(withBuf), peakWindow: [p0, p1] };
}

// Flexlaag: ontgrendelt na cfg.behaviour.flexUnlocksAfterBuildings gebouwen met vraag (brief: "na 3 gebouwen").
export function flexUnlocked(state, cfg = DEFAULT_CONFIG) {
  const count = state.buildings.filter((id) => countsForBackbone(id, cfg)).length;
  const need = cfg.behaviour.flexUnlocksAfterBuildings;
  return { unlocked: count >= need, count, need, remaining: Math.max(0, need - count) };
}

// Ligt dit uur in het venster [w0, w0 + len)? (rondom middernacht)
export function inWindow(hour, w0, len) {
  return ((Math.floor(hour) - w0 + 24) % 24) < len;
}

// Rotorsnelheid (fractie van vol) voor het windpark: vol in het windvenster, anders stationair.
export function windFactor(hour, fd, cfg = DEFAULT_CONFIG) {
  return inWindow(hour, fd.window[0], fd.windowLen) ? 1 : cfg.flex.idleTurbineFactor;
}

// Afronding zoals in het dashboard en in de unit tests: hele kW, hele procenten.
export const roundKw = (x) => Math.round(x);
export const roundPct = (x) => (x === null ? null : Math.round(x * 100));
