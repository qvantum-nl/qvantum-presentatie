// Build your own ambient loop: alle getallen van het spel staan hier, nergens anders.
// Bron belastingen: brief Qvantum UK (woonwijk en WKO zijn aannames, zie docs/fase1-plan.md, "Te verifiëren").
// Vermogens in kW, energie in kWh, temperaturen in graden Celsius, afstanden in gridcellen.

export const CONFIG = {
  version: '0.1.0-fase1',

  // Voertaal Engels (Brits): het spel is voor Qvantum UK. De taal komt uit de presentatie (?lang=uk|nl|de);
  // het spel toont zelf geen taalknoppen. Onbekende taal valt terug op Engels.
  languages: ['en', 'nl', 'de'],
  languageAliases: { uk: 'en', gb: 'en', en_gb: 'en' },
  defaultLanguage: 'en',
  showLanguageToggle: false,

  // Stage 1920 x 1080, geschaald zoals de presentatie (transform: scale). Iso-stad links, dashboard rechts.
  stage: {
    width: 1920, height: 1080,
    city: { x: 0, width: 1280 },
    dashboard: { x: 1300, width: 580, y: 40, height: 1000 },
    minTouchTarget: 60,
  },

  // Isometrisch raster, rechthoekig (besluit 28 okt: geen vierkant, beeldbreedte benutten): 18 cellen langs u
  // (naar rechtsonder) x 12 langs v (naar linksonder), 1 cel = 48 px (144 plaat-eenheden x schaal 1/3).
  grid: {
    sizeU: 18,
    sizeV: 12,
    cellPx: 48,
    unitsPerCell: 144,           // plaat-eenheden per cel (woontoren = 224 eenheden = 2 cellen met marge)
    assetScale: 1 / 3,           // schermpixels per plaat-eenheid
    origin: { x: 516, y: 280 },  // bovenste hoek van de ruit op de stage
    ring: { u: [2, 15], v: [3, 8] },   // ringweg (straat) op deze cel-indexen, 1 cel breed; binnenring 12 x 4, buitenband 3 diep
    water: { u: 17, v: 0, w: 1, h: 12 },   // kanaal langs de rechter voorrand; aquathermie en damwand sluiten erop aan
    maxLaneLength: 3,            // max. aantal cellen tussen gebouw en ringweg (rechte aftakking)
    laneFrontBias: 0,            // 0 = kortste aftakking wint (Viktor 28 okt: kantoor aan de noordzijde, geen omweg); bij gelijke lengte wint de zichtbare voorkant
    laneWidthCells: 1,
    kerbPx: 1,                   // stoeprand langs ringweg, toegangswegen en straatjes (opruimronde 29 okt); 0 = geen
    roadJoinOverlapCells: 0.2,   // hoever een zijweg/straatje de ringweg in loopt, zodat de stoeprand bij de aansluiting onderbroken is
    // Toegangswegen van de ringweg naar de rand van het plangebied (feedback 28 okt: de wijk staat niet op zichzelf).
    // Cellen zijn weg: niets op te plaatsen, aftakkingen lopen er niet doorheen. De lus komt binnen onder de zuidelijke weg.
    accessRoads: [
      { id: 'west',  u: 0, v: 3, w: 2, h: 1 },   // de achterste weg loopt linksboven het gebied uit
      { id: 'north', u: 9, v: 0, w: 1, h: 3 },   // naast het datacenter naar de achterrand
      { id: 'south', u: 3, v: 9, w: 1, h: 3 },   // naar de voorrand; reserved.loopEntry ligt onder deze weg
    ],
  },

  // Bestaande wijk (besluit 28 okt, ronde 4): de bestaande gebouwen staan er vanaf het begin op vaste plekken,
  // gedempt en niet aangesloten; de speler sluit ze aan. Nieuwbouw, bronnen en opslag worden vrij geplaatst.
  // Cel-coördinaten u, v (achterhoek), w langs u, h langs v.
  // Hoogbouw achteraan, laagbouw vooraan, zodat het leidingnet en de aansluitingen altijd zichtbaar blijven
  // (feedback 28 okt): toren en kantoor in de achterste rij van de binnenring, ziekenhuis rechts-achter,
  // datacenter in de band achter de ringweg, woonwijk en supermarkt in de band vóór de ringweg.
  existingLayout: {
    woontoren:  { u: 3, v: 4 },     // 2 x 2, start van de lus, aangesloten vanaf het begin
    kantoor:    { u: 6, v: 4 },     // 2 x 2
    ziekenhuis: { u: 12, v: 4 },    // 3 x 3
    datacenter: { u: 6, v: 0 },     // 3 x 3, buitenband achter de ringweg
    woonwijk:   { u: 12, v: 9 },   // 4 x 3, rechtsvoor aan de kade (Viktor 28 okt: de energiedamwand bedient vooral de woonwijk), tegenover het ziekenhuis     // 4 x 3, buitenband vóór de ringweg
    supermarkt: { u: 5, v: 9 },     // 2 x 1, buitenband vóór de ringweg
  },

  // Vast: windparkrand (flexlaag), water, en het punt waar de backbone het plangebied binnenkomt vanuit het
  // zuidwesten (linksonder, buiten beeld); dat verschijnt pas bij de backbone-gebeurtenis.
  reserved: {
    windpark: { u: 0, v: 4, w: 2, h: 5 },     // v 4-8: cel (0-1, 3) is de westelijke toegangsweg
    loopEntry: { u: 3.5, fromRingV: 8.5, toEdgeV: 12, side: 'southwest' },
  },

  // Zonering (besluit Viktor 29 okt: "hoog achter, laag voor; kadestrook alleen voor waterbronnen"), zodat een vol veld
  // overzichtelijk blijft. Per functie staat in buildings[id].zones in welke zones hij mag; alle cellen van de footprint
  // moeten in een toegestane zone liggen. Decor en overlays (damwand) kennen geen zonering.
  zones: {
    achter:     { u: 0, v: 0, w: 16, h: 3 },     // achterband, achter de ringweg
    kernAchter: { u: 3, v: 4, w: 12, h: 2 },     // achterste rij binnen de ring (toren, kantoor, ziekenhuis)
    kernVoor:   { u: 3, v: 6, w: 12, h: 2 },     // voorste rij binnen de ring
    voor:       { u: 0, v: 9, w: 16, h: 3 },     // voorband, vóór de ringweg
    kade:       { u: 16, v: 0, w: 1, h: 12 },    // kadestrook langs het water: alleen aquathermie en de damwand
  },
  zoneSets: {
    hoog: ['achter', 'kernAchter'],              // hoogbouw: achteraan, verbergt de ring en de voorkant niet
    laag: ['achter', 'kernVoor', 'voor'],        // platte bronnen en opslag: in de banden en de voorste rij
    water: ['kade'],
  },

  // Groei van het net (besluit 28 okt, ronde 4). Stadia: 'start' (alleen de toren met een stuk leiding in de
  // straat), 'organic' (elke aansluiting legt leiding langs de ringweg vanaf het bestaande net naar het gebouw),
  // 'backbone' (na backboneAfterConnections aansluitingen na de toren wijst de gemeente een warmtenetzone aan:
  // de ring wordt in één keer gesloten en de wijk wordt aangesloten op het grotere net).
  network: {
    stages: ['start', 'organic', 'backbone'],
    backboneAfterConnections: 3,  // telt alleen gebouwen met warmte-/koudevraag (Viktor 28 okt): bronnen en opslag dragen geen lus
    pipeMetresPerCell: 8.6,       // 144 plaat-eenheden x 0,06 m: alleen ter informatie, geen score
    showPipeMetres: true,
  },

  // Palet: elke functie is één keer aan te sluiten of te plaatsen. Belastingen in kW.
  // heatPump (wens Viktor 29 okt): welke warmtepomp het gebouw gebruikt, als sleutel naar i18n heatPumps (qg7Flats /
  // qg7Homes tellen met `homes`; central = centrale water-waterwarmtepomp; refrigeration en exchanger = geen warmtepomp).
  // heating = ruimteverwarming (winter), dhw = tapwater (jaarrond), cooling = koeling (zomer),
  // direct = directe warmte-input in de lus (jaarrond of per seizoen).
  // existing: true = staat al in de wijk (vaste plek in existingLayout), actie "aansluiten";
  // existing: false = nieuwbouw, bron of opslag, actie "plaatsen" op het raster.
  buildings: {
    // Dakunits: QA-50 (standaard, UK) of drycoolers (optie). QA-50: 13,6–50 kW bij A7/W35, 31 kW bij ontwerpconditie
    // (specs uit de presentatie), dus 6 x 30 kW = 180 kW dakcapaciteit in de winter. "QA-50 toevoegen (+30 kW)" blijft
    // mogelijk (spel-v1), ook al is de boodschap "meer bronnen aansluiten".
    woontoren:       { footprint: [2, 2], heatPump: 'qg7Flats', heating: 130, dhw: 50, cooling: 250, direct: 0, fixed: true, existing: true,
                       homes: 100, roofCapacityKw: 180,
                       roofUnits: { kind: 'qa50', kinds: ['qa50', 'drycooler'], count: 6, kwEach: 30, nominalKw: 50, extraAllowed: true, max: 12 },
                       bufferKwh: 400 },
    appartementen:   { footprint: [2, 2], heatPump: 'qg7Flats', zones: 'hoog', zoneReason: 'zoneBack', heating: 130, dhw: 50, cooling: 250, direct: 0, existing: false },
    kantoor:         { footprint: [2, 2], heatPump: 'central', heating: 120, dhw: 0, cooling: 200, direct: 0, existing: true },
    'kantoor-sport': { footprint: [2, 2], heatPump: 'central', zones: 'hoog', zoneReason: 'zoneBack', heating: 120, dhw: 60, cooling: 300, direct: 0, existing: false },
    ziekenhuis:      { footprint: [3, 3], heatPump: 'central', heating: 500, dhw: 400, cooling: 1000, direct: 0, existing: true },
    supermarkt:      { footprint: [2, 1], heatPump: 'refrigeration', heating: 0, dhw: 0, cooling: 0, direct: 150, existing: true },
    // Alleen 1 MW (besluit 28 okt 2026: 10 MW voorlopig weg; asset datacenter-10mw blijft beschikbaar).
    datacenter:      { footprint: [3, 3], heatPump: 'exchanger', heating: 0, dhw: 0, cooling: 0, direct: 0, existing: true,
                       // flexible (Viktor 28 okt): het datacenter levert alleen wat de lus na de opslag nog tekortkomt, tot 1 MW,
                       // in beide seizoenen; de rest van zijn warmte gaat via de eigen drycoolers de lucht in. Zo overspoelt het de lus niet.
                       modes: { '1MW': { direct: 1000, flexible: true, asset: 'datacenter-1mw' } },
                       defaultMode: '1MW' },
    woonwijk:        { footprint: [4, 3], heatPump: 'qg7Homes', heating: 160, dhw: 20, cooling: 80, direct: 0, assumed: true, existing: true,
                       homes: 40, bufferKwh: 160 },

    // Bronnen (toegevoegd 28 okt, naar scène 7 van de interactieve plaat). direct per seizoen: wat de bron in de lus
    // brengt (kW). Alle cijfers zijn aannames, te valideren met MESIDO (§8 van het plan).
    // MESIDO-validatie 28 okt (docs/validatie-mesido.md par. 7, akkoord Viktor): 1.000 m2 x 0,45 x instraling Londen = 458 MWh/jaar
    'pvt-veld':      { footprint: [3, 2], zones: 'laag', zoneReason: 'zoneFront', heating: 0, dhw: 0, cooling: 0, direct: { winter: 25, summer: 80 }, source: true, assumed: true, existing: false,
                       note: 'ca. 1.000 m2 PVT; levert vooral in de zomer, regenereert de bodem/WKO' },
    // MESIDO-validatie 28 okt: het water is in oktober en november nog warm genoeg (1105 h winter, 3878 h zomer boven 8-12 graden)
    aquathermie:     { footprint: [1, 2], zones: 'water', zoneReason: 'needsWater', heating: 0, dhw: 0, cooling: 0, direct: { winter: 75, summer: 265 }, source: true, assumed: true, existing: false,
                       requiresWater: true, note: 'TEO: vooral in de zomer; in de winter nog 75 kW zolang het water warm genoeg is' },
    // De hele kade (besluit Viktor 28 okt): 12 cellen x 8,6 m = ca. 103 m damwand. Eerste testgegevens De Zweth:
    // 1-1,5 kW per strekkende meter -> 103-155 kW in de winter; zomer (regeneratie) is een aanname. MESIDO-validatie loopt.
    energiedamwand:  { footprint: [1, 12], heating: 0, dhw: 0, cooling: 0, direct: { winter: 125, summer: 150 }, source: true, assumed: true, existing: false,
                       requiresWater: true, fixedAt: { u: 16, v: 0 }, overlay: true, icon: 'energiedamwand-icon', metresPerKwMin: 1 / 1.5, metresPerKwMax: 1,
                       note: 'de hele kade; ligt in de kademuur, andere functies (aquathermie) mogen op de kade blijven staan' },
    // Kunstgrasveld (Viktor 28 okt, naar het voorbeeld van Eindhoven): collectorslangen onder de mat van een voetbal- of
    // hockeyveld (ca. 7.000 m2). De mat wordt in de zomer heet; onbeglaasde collector, dus minder per m2 dan PVT (0,05 kW/m2
    // zomergemiddelde). Aanname, te toetsen (MESIDO of leverancier).
    kunstgrasveld:   { footprint: [4, 3], zones: 'laag', zoneReason: 'zoneFront', heating: 0, dhw: 0, cooling: 0, direct: { winter: 0, summer: 350 }, source: true, assumed: true, existing: false,
                       note: 'kunstgrasveld met collectorslangen, ca. 7.000 m2; zomer' },
    // Ruimte voor later (legenda scène 7); enabled: false houdt ze uit het palet tot de cijfers er zijn.
    riothermie:      { footprint: [1, 2], zones: 'laag', zoneReason: 'zoneFront', heating: 0, dhw: 0, cooling: 0, direct: { winter: 150, summer: 150 }, source: true, assumed: true, existing: false,
                       enabled: false, note: 'warmte uit het riool, jaarrond; cijfers nog te bepalen' },
    'restwarmte-kantoren': { footprint: [2, 2], zones: 'laag', zoneReason: 'zoneFront', heating: 0, dhw: 0, cooling: 0, direct: { winter: 0, summer: 200 }, source: true, assumed: true, existing: false,
                       enabled: false, note: 'serverruimtes en koeling van bestaande kantoren; cijfers nog te bepalen' },
  },

  // Rendement-aannames: wat een QG uit de lus neemt is de warmtevraag minus het elektrische deel.
  // Genomen = verwarming x (1 - 1/copHeating) + tapwater x (1 - 1/copDhw)
  // Gebracht = koeling x (1 + 1/eerCooling) + directe warmte-input
  efficiency: { copHeating: 4, copDhw: 3, eerCooling: 5 },

  // Twee seizoenen, zoals de andere platen (besluit 28 okt 2026): winter = verwarming, zomer = koeling.
  // Tapwater, supermarkt en datacenter altijd 1. Uren voor de jaarbalans van de opslag: elk een half jaar
  // (aanname): wat de zomer laadt, moet de winter kunnen gebruiken.
  seasons: {
    winter: { heating: 1, cooling: 0, hours: 4380 },
    summer: { heating: 0, cooling: 1, hours: 4380 },
  },
  seasonOrder: ['winter', 'summer'],
  yearCycle: ['summer', 'winter'],   // volgorde van de jaarsimulatie

  // Seizoensopslag: plaatsbare functie van 2 x 3 cellen met schakelaar gesloten/WKO. Capaciteit en WKO-vermogen zijn aannames.
  storage: {
    footprint: [2, 3], zones: 'laag', zoneReason: 'zoneFront', existing: false,
    closed: { label: 'closed', powerKw: 500, capacityKwh: 1000000, assumed: false },   // 1000 MWh zoals in spel-v1
    wko:    { label: 'wko', powerKw: 2000, capacityKwh: 3000000, assumed: true, requiresPermit: true },
    balanceTolerance: 0.30,     // waarschuwing als laden en ontladen per jaar meer dan 30% verschillen
  },

  // Leidingtemperaturen (indicatief): koud = base + nettoRatio x span, warm = koud + deltaT, begrensd.
  // nettoRatio = (gebracht - genomen) / max(genomen, gebracht), van -1 (alles tekort) tot +1 (alles overschot).
  temperatures: { coldBase: 12, ratioSpan: 6, deltaT: 6, min: 8, max: 25 },

  // Doelen (afvinkbaar). Basislijn zoals in spel-v1: de toren alleen, in de winter (131 kW bijverwarming).
  // Doel 1 en 2 worden in de winter beoordeeld (de zwaarste situatie), onafhankelijk van het getoonde seizoen;
  // doel 3 op de jaarbalans van de opslag.
  goals: {
    baseline: 'tower-winter',
    evaluateIn: 'winter',
    g1: { topUpMaxFractionOfBaseline: 0.50 },
    g2: { topUpMaxFractionOfBaseline: 0.25, utilisationMin: 0.80 },
    g3: { storageBalanceTolerance: 0.30 },
  },

  // Meldingen: drempels (configureerbaar). Teksten staan in i18n/<taal>.js.
  thresholds: {
    hyperscaleMode: '10MW',     // niet meer in het palet; melding blijft beschikbaar als 10 MW terugkomt
    lowUtilisation: 0.30,       // melding "veel warmte gaat naar buiten" onder deze benutting
    roofOverload: 1.0,          // melding als bijverwarming boven de dakcapaciteit komt
    storageUnbalanced: 0.30,
  },

  // Flexlaag (fase 2, stap 5), overgenomen uit spel-v1 (flexDay): elektriciteit = verwarming/copHeating +
  // tapwater/copDhw, verdeeld over een 24-uursprofiel (fracties van het gemiddelde, gemiddelde = 1).
  // De buffer verschuift het blok 17–21 uur naar het windvenster; "Overschot van het net" kiest een eigen venster.
  flex: {
    profile: [0.7, 0.65, 0.6, 0.6, 0.65, 0.8, 1.1, 1.3, 1.2, 1, 0.95, 0.9, 0.9, 0.9, 0.95, 1.05, 1.2, 1.45, 1.5, 1.4, 1.25, 1.05, 0.9, 0.75],
    peakWindow: [17, 21],       // uren die de buffer verschuift
    windWindow: [1, 5],         // standaard windpiek (nacht)
    windparkTurbines: 4,
    startHour: 18,              // de klok begint in de avondpiek
    clockSecondsPerDay: 48,     // afspelen: een etmaal in 48 s (een uur per 2 s)
    rotorSecondsPerTurn: 4,     // rotor bij volle wind
    idleTurbineFactor: 0.2,     // rotorsnelheid buiten het windvenster (fractie van vol)
  },

  // Schermen en gedrag
  behaviour: {
    attractIdleSeconds: 0,       // 0 = uit (besluit 28 okt): de kiosk-overlay zet na 240 s zelf terug naar Home; een eigen reset zou de webtest hinderen
    resetConfirm: true,
    placementUnlocksStorageAfterBuildings: 1,   // opslag beschikbaar zodra de toren staat
    flexUnlocksAfterBuildings: 3,
    backToPresentation: '../Beurspresentatie.dc.html',
  },

  // Lus-weergave
  // Lus-weergave: dunne leidingen die elkaar niet overlappen (feedback 28 okt); offset = afstand tussen warm en
  // koud in cellen, gemeten in het grondvlak.
  // Stroming: witte streepjes (dash + gap = één periode); de animatie verschuift precies één periode per cyclus en
  // loopt op de documenttijdlijn, dus naadloos door (feedback 28 okt: langer, langzamer, geen verspringing).
  // Aftakkingen (opruimronde 29 okt): dunner dan de ring en zonder eigen stroomanimatie, zodat de ring de blikvanger
  // blijft en een vol veld niet uit 24 even dikke lijnen bestaat. branchFlow: true zet de streepjes ook op de aftakkingen.
  loop: { strokePx: 4, slotPx: 12, offsetCells: 0.17, flowDashPx: 14, flowGapPx: 42, flowSpeedPxPerSecondMin: 6, flowSpeedPxPerSecondMax: 24,
          branchStrokePx: 2.5, branchFlow: false },

  // Bron-check (feedback 28 okt): een lus begint niet zonder bron. Een afnemer mag pas aangesloten of geplaatst
  // worden als de bijverwarming in het toetsseizoen daarna binnen de dakcapaciteit blijft (met drycoolers: als de
  // lus en de opslag hem helemaal dekken). Bronnen en opslag mogen altijd.
  sourceCheck: { enabled: true, season: 'winter' },

  // Decor (feedback 28 okt, "voor de lol"): vrij te plaatsen en te verwijderen, meerdere stuks, geen rol in het
  // rekenmodel. passable: aftakkingen (straatjes) mogen eronderdoor.
  decor: {
    boom:     { footprint: [1, 1], asset: 'boom', passable: false },
    park:     { footprint: [2, 2], asset: 'park', passable: false },
    weg:      { footprint: [1, 1], asset: 'weg', passable: true },
    parkeren: { footprint: [2, 1], asset: 'parkeren', passable: true },
  },
  // Decor dat er bij de start al staat (het parkje binnen de ring); gewoon te verwijderen als je de ruimte nodig hebt.
  initialDecor: [{ type: 'park', u: 4, v: 6 }],
};

export default CONFIG;
