// Bronsystemen voor het blok "Temperatuurniveau" in de interactieve plaat. Eén centrale plek; alle schermen lezen hieruit.
// Tabel A: brontemperatuur over het jaar (°C). Tabel B: indicatieve efficiëntie, VOORLOPIG — afgeleid van de publieke SCOP, nog te controleren door product management; vervang hier in één keer.
export const PROVISIONAL = true;
export const QG = { src: [-20, 40], out: [20, 80] }; // vaste productwaarden: bron en afgifte
export const SOURCES = {
  pvt:        { year: [-15, 35], winter: [-15, 5], winterAvg: -2, summer: [15, 35], regen: false, copW35: [4.3, 5.2], copW55: [5.0, 6.0], spf: [4.5, 4.9], cooling: 'none' },
  loop:       { year: [-3, 18],  winter: [0, 6],   winterAvg: 3,  summer: [12, 18], regen: true,  copW35: [5.0, 5.8], copW55: [4.8, 5.5], spf: [4.9, 5.4], cooling: 'passive' },
  sharedLoop: { year: [0, 18],   winter: [2, 6],   winterAvg: 4,  summer: [12, 18], regen: true,  copW35: [5.2, 5.8], copW55: [4.8, 5.5], spf: [5.0, 5.5], cooling: 'passive' },
  // ZLT-net zonder uitwisseling: zelfde watertemperatuur, maar bron (WKO + PVT) levert alleen; getallen nog aan te leveren door product management (null → n.t.b.)
  zltNet:     { year: [8, 25],   winter: [8, 15],  winterAvg: 12, summer: [15, 25], regen: false, copW35: null, copW55: null, spf: null, cooling: 'passive' },
  zlt:        { year: [8, 25],   winter: [8, 15],  winterAvg: 12, summer: [15, 25], regen: false, copW35: [6.0, 7.0], copW55: [5.2, 6.0], spf: [5.8, 6.3], cooling: 'net' },
};
// Bronsysteem per scherm (id in Interactieve plaat): src = rij uit SOURCES; extra = tweede (gestippelde) marker; bands = ZLT/LT/MT/HT-balk tonen; compact = één regel efficiëntie; chain = ketenstrip (netChain/netChainNote per fase); src mag per fase een array zijn; noSeasons = geen winter/zomer-regel; byPhase = markerlabel = fasenaam (netPhases); compactPhases = fasen met compacte weergave.
// Geen blok op 1 (losse woningen, QA/QE/QG), 4 (QE ventilatielucht), 5 (QG-30 op drycoolers), 8 (netcongestie), 9 (InEx).
export const SCREEN_SOURCE = { shared: { src: 'sharedLoop' }, ambient: { src: 'sharedLoop', extra: 'pvt' }, cool: { src: 'sharedLoop', compact: true }, net: { src: ['zltNet', 'zlt'], bands: true, byPhase: true, chain: true, compactPhases: [1], noSeasons: true } };
