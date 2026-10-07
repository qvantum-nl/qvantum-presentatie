// Structuur van Producten en Digitaal. Tekstsleutels verwijzen naar i18n/copy.js (COPY[lang][key]).
// Elke productkaart: id, sleutels voor titel/subtitel/spec/bullets, render, en verdiepingspanelen (title-key + afbeeldingen).
// Productkaarten (Figma: Products → Frame 50). entry = eerste verdiepingspaneel uit PANELS.
// renderBox = [links/rechts, onder, hoogte] in px voor de productfoto, nagemeten op Figma; zonder renderBox onderaan 560px hoog.
export const PRODUCTS = [
  { id: 'qe', k: 'products_qe', bullets: 5, entry: 'qe_main', img: 'assets/img/p-card-qe.png', fit: [540, 250] },
  { id: 'qeng', k: 'products_qe_ng', bullets: 5, entry: 'qeng_specs', img: 'assets/img/p-card-qe.png', fit: [540, 250] },
  { id: 'qg', k: 'products_qg', bullets: 6, entry: 'qg_specs', img: 'assets/img/p-card-qg.png', fit: [665, 163] },
  { id: 'qg30', k: 'products_qg30', bullets: 5, entry: 'qg30_specs', render: 'assets/img/qg30-module-cut.png', renderBox: [120, 60, 340] },
  { id: 'qgm', k: 'products_qgm', bullets: 5, entry: 'qg_principles', img: 'assets/img/p-card-qgm.png', fit: [640, 166] },
  { id: 'qh175', k: 'products_qh_175', bullets: 5, entry: 'tb', img: 'assets/img/p-card-qh.png', fit: [665, 163] },
  { id: 'qa', k: 'products_qa', bullets: 5, entry: 'qa_specs', img: 'assets/img/p-card-qa.png', fit: [640, 190] },
  { id: 'qa50', k: 'products_qa_50', bullets: 5, entry: 'qa22', img: 'assets/img/p-card-qa50.png', fit: [665, 163] },
  { id: 'lb4', k: 'products_lb4', bullets: 4, entry: 'lb4_main', render: 'assets/img/p-render-com.png' },
];

// Verdiepingspanelen (Figma: products-* frames). type bepaalt de layout; buttons/tap/next/prev verwijzen naar andere panelen.
//  specs  = afbeelding links (992) + titel + knoppen rechts        full  = één afbeelding in breed paneel + knoppenrij
//  house  = huis-foto als achtergrond + schema rechts               dark  = donkere foto-achtergrond + render (Binnenkant)
//  row    = n afbeeldingen naast elkaar met labels                  col   = afbeeldingen onder elkaar
//  specs met spec: '<id>' = tabel uit i18n/specs.js (databladen); zonder spec valt hij terug op img
//  qgp    = Principes QG (2 schema's + 2 app-beelden)               lb4   = LB4-scherm                  table = ventilatietabel
export const PANELS = {
  qg_specs: { type: 'specs', spec: 'qg', img: 'assets/img/p-qg-specs.png', title: 'products_qg_qg_deep_specs_qg', buttons: ['qg_principles', 'qg_inside', 'tb'], tabs: [{ spec: 'qg', tab: 'products_qg_specs_tab_qg', title: 'products_qg_qg_deep_specs_qg', sub: 'products_qg_subtitle', img: 'assets/img/p-qg-specs.png', buttons: ['qg_principles', 'qg_inside', 'tb'] }, { spec: 'qgc', tab: 'products_qg_specs_tab_qgc', title: 'products_qg_qg_deep_specs_qgc', sub: 'products_qg_c_subtitle', img: 'assets/img/p-qgc-specs.png', buttons: ['qg_ambient', 'qg_inside'] }] },
  qgc_specs: { type: 'specs', spec: 'qgc', img: 'assets/img/p-qgc-specs.png', title: 'products_qg_qg_deep_specs_qgc', buttons: ['qg_principles', 'qg_inside'], defaultTab: 1, tabs: [{ spec: 'qg', tab: 'products_qg_specs_tab_qg', title: 'products_qg_qg_deep_specs_qg', sub: 'products_qg_subtitle', img: 'assets/img/p-qg-specs.png', buttons: ['qg_principles', 'qg_inside', 'tb'] }, { spec: 'qgc', tab: 'products_qg_specs_tab_qgc', title: 'products_qg_qg_deep_specs_qgc', sub: 'products_qg_c_subtitle', img: 'assets/img/p-qgc-specs.png', buttons: ['qg_ambient', 'qg_inside'] }] },
  qg_principles: { type: 'row', title: 'products_qg_qg_deep_principle', label: 'products_qg_qg_deep_principle', imgs: ['illustrations/principles/qg-woning-bodembron.svg', 'illustrations/principles/qg-appartement.svg'], labels: ['products_qg_plate_house', 'products_qg_plate_apt'], buttons: ['qg_specs', 'tb'] },
  qg_inside: { type: 'dark', render: 'assets/img/s4-kw5.png', title: 'products_qg_qg_deep_qg_inside_button', label: 'products_qg_qg_deep_qg_inside_button' },
  qg_ambient: { type: 'iso', title: 'products_qg_ambient_label', iso: [{ svg: 'illustrations/principles/qg-ambient.svg', k: 'products_iso_amb', labels: [{ k: 'pvt', x: 59.9, y: 12.7, lx: 84, ly: 12 }, { k: 'loop', x: 56.2, y: 39.8, lx: 84, ly: 36 }, { k: 'unit', x: 54.2, y: 35.8, lx: 20, ly: 26 }, { k: 'field', x: 25.8, y: 55, lx: 14, ly: 74 }] }], label: 'products_qg_ambient_label', noTitle: true, buttons: ['qg_principles', 'qg_specs', 'qgc_specs'] },
  tb: { type: 'modes', modes: [{ svg: 'illustrations/principles/tb-tapwater.svg', k: 'products_iso_tb1' }, { svg: 'illustrations/principles/tb-buffer.svg', k: 'products_iso_tb2' }, { svg: 'illustrations/principles/tb-verwarming.svg', k: 'products_iso_tb3' }, { svg: 'illustrations/principles/tb-alles.svg', k: 'products_iso_tb4' }], grid: true, imgs: ['assets/img/p-thermalbattery.png', 'assets/img/p-tb-2.png', 'assets/img/p-tb-4.png', 'assets/img/p-tb-3.png'], labels: ['products_thermalbattery_dhw', 'products_thermalbattery_buffer', 'products_thermalbattery_heating', 'products_thermalbattery_all'], title: 'products_thermalbattery', label: 'products_thermalbattery' },
  qe_main: { type: 'full', img: 'assets/img/p-qe-modular.png', pos: '60% 50%', size: '113.7% 105.5%', bgc: '#F3F3F4', buttons: ['qe_typec', 'qe_typed', 'qe_multi', 'qe_mdu', 'qe_specs'], tap: 'qe_specs' },
  qe_typec: { type: 'house', bg: 'assets/img/p-qe-typec-house.png', scheme: 'illustrations/principles/qe-woning-gevelrooster.svg', title: 'products_qe_tile_typec', label: 'products_qe_qe_deep_button_typec', next: 'qe_typed' },
  qe_typed: { type: 'house', bg: 'assets/img/p-qe-typed-house.png', scheme: 'illustrations/principles/qe-qs-woning.svg', title: 'products_qe_tile_typed', label: 'products_qe_qe_deep_button_typed', prev: 'qe_typec', next: 'qe_multi' },
  qe_multi: { type: 'house', scheme: 'illustrations/principles/qe-qs-multiducto-woning.svg', title: 'products_qe_qe_deep_title_multi', label: 'products_qe_button_airheating', prev: 'qe_typed', next: 'qe_mdu' },
  qe_mdu: { type: 'row', imgs: ['assets/img/p-qe-mdu.png', 'assets/img/p-qe-mdu-2.png'], title: 'products_qe_qe_deep_title_principle_mdu', label: 'products_qe_qe_deep_button_principle_mdu', prev: 'qe_multi' },
  qe_principles: { type: 'house', title: 'products_qe_qe_deep_principle', label: 'products_qe_qe_deep_principle', buttons: ['qe_specs', 'tb', 'qe_vent'], tabs: [
    { tab: 'products_qe_qe_deep_button_typec', scheme: 'illustrations/principles/qe-woning-gevelrooster.svg', bg: 'assets/img/p-qe-typec-house.png', title: 'products_qe_tile_typec' },
    { tab: 'products_qe_qe_deep_button_typed', scheme: 'illustrations/principles/qe-qs-woning.svg', bg: 'assets/img/p-qe-typed-house.png', title: 'products_qe_tile_typed' },
    { tab: 'products_qe_button_airheating', scheme: 'illustrations/principles/qe-qs-multiducto-woning.svg', title: 'products_qe_qe_deep_title_multi' }] },
  qe_specs: { type: 'specs', spec: 'qe', img: 'assets/img/p-qe-specs.png', title: 'products_qe_qe_deep_specs_qe', label: 'products_qe_qe_deep_specs_qe', buttons: ['qe_principles', 'qe_inside', 'tb', 'qe_vent'] },
  qe_inside: { type: 'dark', render: 'assets/img/p-qe-inside.png', big: 'assets/img/p-qe-inside-2.png', title: 'products_qe_qe_deep_button_inside_qe', label: 'products_qe_qe_deep_button_inside_qe' },
  qe_vent: { type: 'table', title: 'products_qe_qe_deep_title_vent_table', label: 'products_qe_qe_deep_title_vent_table' },
  qa_specs: { type: 'specs', spec: 'qa', img: 'assets/img/p-qa-specs.png', render: 'assets/img/p-qa-render.png', title: 'products_qa_qa_deep_specs_qa', label: 'products_qa_qa_deep_specs_qa', buttons: ['qa_principle', 'tb'] },
  qa_principle: { type: 'row', imgs: ['illustrations/principles/qa-qh-woning.svg', 'assets/img/p-qa-principle-project.png'], title: 'products_qa_qa_deep_principle', label: 'products_qa_qa_deep_principle', buttons: ['qa_specs'] },
  qa22: { type: 'specs', spec: 'qa22', img: 'assets/img/p-qa22-specs.png', title: 'products_qa22_title', label: 'products_qa22_title' },
  lb4_main: { type: 'lb4', img: 'assets/img/p-lb4-render.png', photo: 'assets/img/p-lb4-photo.jpg', title: 'products_lb4_lb4_deep_title', bullets: ['products_lb4_lb4_deep_bullet', 'products_lb4_lb4_deep_bullet2', 'products_lb4_lb4_deep_bullet3', 'products_lb4_lb4_deep_bullet4', 'products_lb4_lb4_deep_bullet5'], tap: 'lb4_mod1' },
  lb4_mod1: { type: 'full', img: 'assets/img/p-lb4-mod-1.png', noTitle: true, edge: true, cover: true, cover: true, cover: true, cover: true, next: 'lb4_mod2' },
  lb4_mod2: { type: 'full', img: 'assets/img/p-lb4-mod-2.png', noTitle: true, edge: true, cover: true, cover: true, cover: true, cover: true, prev: 'lb4_mod1', next: 'lb4_mod3' },
  lb4_mod3: { type: 'full', img: 'assets/img/p-lb4-mod-3.png', noTitle: true, edge: true, cover: true, cover: true, cover: true, cover: true, prev: 'lb4_mod2', next: 'lb4_mod4' },
  lb4_mod4: { type: 'full', img: 'assets/img/p-lb4-mod-4.png', noTitle: true, edge: true, cover: true, cover: true, cover: true, cover: true, prev: 'lb4_mod3' },
  qg30_specs: { type: 'specs', spec: 'qg30', prelim: 'products_qg30_prelim', title: 'products_qg30_specs_title', label: 'products_qg30_cta_specs', qr: 'assets/img/qg30-qr.png', buttons: ['qg30_principle', 'qg30_config', 'qg30_modularity', 'qg30_who'] },
  qg30_principle: { type: 'house', scheme: 'illustrations/principles/qg30-plantroom.svg', title: 'products_qg30_principle_title', label: 'products_qg30_principle_label', buttons: ['qg30_specs', 'qg30_schema'] },
  qg30_schema: { type: 'full', img: 'assets/img/qg30-schema.png', bgc: '#FFFFFF', title: 'products_thermalbattery', label: 'products_thermalbattery', buttons: ['qg30_principle', 'qg30_specs'] },
  qg30_modularity: { type: 'steps', kind: 'qg30', title: 'products_qg30_modularity_title', label: 'products_qg30_cta_modularity', kicker: 'products_qg30_prelim', sub: 'products_qg30_modularity_subtitle', steps: [['qg30-module.png', 'step1'], ['qg30-rack.png', 'step2'], ['qg30-group.png', 'step3'], ['qg30-plant.png', 'step4']], banner: { img: 'assets/img/qg30-qcpro-cut.png', title: 'products_qg30_modularity_qcpro_title', body: 'products_qg30_modularity_qcpro_body' }, buttons: ['qg30_specs', 'qg30_who'] },
  qg30_config: { type: 'config', prelim: 'products_qg30_prelim', title: 'products_qg30_config_title', label: 'products_qg30_config_label', kicker: 'products_qg30_config_kicker', fn: 'products_qg30_config_footnote', buttons: ['qg30_modularity', 'qg30_specs', 'qg30_who'] },
  qg30_who: { type: 'who', title: 'products_qg30_stakeholders_title', label: 'products_qg30_cta_whoareyou', sub: 'products_qg30_stakeholders_subtitle', pk: 'products_qg30_stakeholders_', roles: [['owner', '#232222'], ['installer', '#91877A'], ['utility', '#002656']], buttons: ['qg30_specs', 'qg30_modularity', 'qg30_config'] },
  qeng_specs: { type: 'specs', spec: 'qeng', prelim: 'products_qe_ng_overview_preliminary', title: 'products_qe_ng_specs_title', label: 'products_qe_ng_specs_label', buttons: ['qeng_main', 'qe_principles', 'qe_vent', 'tb'] },
  qeng_main: { type: 'steps', kind: 'qeng', title: 'products_qe_ng_overview_title', label: 'products_qe_ng_overview_title', kicker: 'products_qe_ng_overview_preliminary', sub: 'products_qe_ng_overview_subtitle', steps: [['', 'h1'], ['', 'h2'], ['', 'h3'], ['', 'h4'], ['', 'h5'], ['', 'h6']], banner: { img: 'assets/img/qeng-render.jpg', title: 'products_qe_ng_overview_fgas_title', body: 'products_qe_ng_overview_fgas_body' }, buttons: ['qeng_specs'] },
  qeng_who: { type: 'who', title: 'products_qe_ng_personas_title', label: 'products_qe_ng_personas_title', sub: 'products_qe_ng_personas_subtitle', pk: 'products_qe_ng_personas_', roles: [['installer', '#232222'], ['developer', '#91877A'], ['enduser', '#002656'], ['manufacturer', '#C41230']], panelPrefix: 'qeng_p_' },
  qeng_p_installer: { type: 'persona', pk: 'products_qe_ng_personas_installer_', hdr: 'products_qg30_stakeholders_hdr_', back: 'qeng_who', buttons: ['qeng_main'] },
  qeng_p_developer: { type: 'persona', pk: 'products_qe_ng_personas_developer_', hdr: 'products_qg30_stakeholders_hdr_', back: 'qeng_who', buttons: ['qeng_main'] },
  qeng_p_enduser: { type: 'persona', pk: 'products_qe_ng_personas_enduser_', hdr: 'products_qg30_stakeholders_hdr_', back: 'qeng_who', buttons: ['qeng_main'] },
  qeng_p_manufacturer: { type: 'persona', pk: 'products_qe_ng_personas_manufacturer_', hdr: 'products_qg30_stakeholders_hdr_', back: 'qeng_who', buttons: ['qeng_main'] },
};

// Ventilatietabel (Figma: products-qe-ventilationtable), teksten hard in het frame
// Posities van de labelvlakken in de illustratie (procent van het beeld), gemeten uit de bitmap; volgorde = legend
export const PIPE_LABELS = [[89.6, 51.6], [80.0, 60.4], [70.5, 68.4], [61.0, 77.2], [51.3, 85.1], [41.7, 93.9]];

export const VENT_TABLE = {
  t1: { head: 'VENTILATIEDEBIET EN VERWARMINGSCAPACITEIT', cols: ['', 'm³/h', 'm³/h', 'L/s', 'QE5 (kW)', 'QE7 (kW)'], rows: [['Standaard woning', '', '150', '41,7', '2,9', '3,6'], ['+ open keuken', '+75', '225', '62,5', '3,8', '5,2'], ['+ was- en droogruimte', '+50', '275', '76,4', '--', '5,7']] },
  t2: { head: 'VENTILATIEDEBIETEN VOOR CONTINUE AFZUIGSYSTEMEN', sub: 'BIJ STANDAARD WONING', cols: ['Ruimte', 'Ventilatie debiet (m3/h)'], rows: [['Keuken', '75'], ['Badkamer', '50'], ['Toilet', '25']] },
};

export const DIGITAL = [
  // layout: 'app' | 'service' | 'match' | 'planner' | 'energy' | 'learn' — volgt de Figma-frames digital-*
  { id: 'app', layout: 'app', tile: 'digital_tile_1', tag: 'digital_d1_q_app_undertag_digital', img: 'assets/img/d-tile-app.jpg', title: 'digital_d1_q_app_title', subtitle: 'digital_d1_q_app_subtitle',
    groups: [{ h: 'digital_d1_q_app_header1', b: ['digital_d1_q_app_bullets_1', 'digital_d1_q_app_bullets_2', 'digital_d1_q_app_bullets_3'] }, { h: 'digital_d1_q_app_header2', b: ['digital_d1_q_app_bullets_4', 'digital_d1_q_app_bullets_5', 'digital_d1_q_app_bullets_6'] }],
    side: { img: 'assets/img/d-app-3.jpg', route: 'acc:qt', title: 'digital_d1_q_app_display_card', sub: 'digital_d1_q_app_display_card_sub' },
    display: { img: 'assets/img/d-app-1.jpg', panel: 0, title: 'digital_d1_q_app_disp_card', sub: 'digital_d1_q_app_disp_card_sub' },
    hero: 'assets/img/d-app-hero.png', heroCover: true, heroPanel: 1,
    qr: 'assets/img/d-app-phone.png', qrTitle: 'digital_d1_q_app_qrtxt1', qrText: 'digital_d1_q_app_qrtxt2', stores: ['assets/img/d-app-qr.png', 'assets/img/d-app-stores.png'],
    panels: [
      { k: 'digital_d1_q_app_disp_card', display: true, modes: [
        { k: 'digital_disp_mode_user', title: 'disp_mode_user_title', circles: [['disp_u1', 'assets/img/disp/u1.png'], ['disp_u2', 'assets/img/disp/u2.png'], ['disp_u3', 'assets/img/disp/u3.png'], ['disp_u4', 'anim:tapwater'], ['disp_u5', 'assets/img/disp/u5.png'], ['disp_u6', 'assets/img/disp/u6.png'], ['disp_u7', 'assets/img/disp/u7.png'], ['disp_u8', 'assets/img/disp/u8.png']] },
        { k: 'digital_disp_mode_installer', title: 'disp_mode_installer_title', circles: [['disp_i1', 'assets/img/disp/i1.png'], ['disp_i2', 'assets/img/disp/i2.png'], ['disp_i3', 'assets/img/disp/i3.png'], ['disp_i4', 'assets/img/disp/i4.png'], ['disp_i5', 'assets/img/disp/i5.png'], ['disp_i6', 'assets/img/disp/i6.png'], ['disp_i7', 'assets/img/disp/i7.png'], ['disp_i8', 'assets/img/disp/i8.png']] },
        { k: 'digital_disp_mode_service', title: 'disp_mode_service_title', circles: [['disp_s1', 'assets/img/disp/s1.png'], ['disp_s2', 'assets/img/disp/s2.png'], ['disp_s3', 'assets/img/disp/s3.png'], ['disp_s4', 'assets/img/disp/s4.png'], ['disp_s5', 'assets/img/disp/s5.png'], ['disp_s6', 'assets/img/disp/s6.png'], ['disp_s7', 'assets/img/disp/s7.png'], ['disp_s8', 'assets/img/disp/s8.png']] },
      ] },
      { k: 'digital_d1_q_app_title', imgs: ['assets/img/d-app-5.png'], light: true },
    ] },
  { id: 'service', layout: 'service', tile: 'digital_tile_2', tag: 'digital_d2_q_service_undertag_digital', img: 'assets/img/d-tile-service.jpg', title: 'digital_d2_q_service_title', subtitle: 'digital_d2_q_service_subtitle',
    kw: [['digital_d2_q_service_keyword', 'digital_d2_q_service_details'], ['digital_d2_q_service_keyword_2', 'digital_d2_q_service_details_2'], ['digital_d2_q_service_keyword_3', 'digital_d2_q_service_details_3'], ['digital_d2_q_service_keyword_4', 'digital_d2_q_service_details_4'], ['digital_d2_q_service_keyword_5', 'digital_d2_q_service_details_5'], ['digital_d2_q_service_keyword_6', 'digital_d2_q_service_details_6']],
    thumbs: [{ img: 'assets/img/acc-tpl-1.png', panel: 3, pos: '50% 12%' }, { img: 'assets/img/acc-tpl-3.png', panel: 3, pos: '50% 12%' }],
    hero: 'assets/img/d-service-phone.png', heroCover: true, heroPos: '44.7% 0%', heroPanel: 0,
    panels: [
      { k: 'digital_d2_q_service_panel_1', imgs: ['assets/img/d-service-dash-1.png'], next: 1 },
      { k: 'digital_d2_q_service_panel_2', grid: [['assets/img/d-service-dash-2a.png', 'assets/img/d-service-dash-2b.png'], ['assets/img/d-service-dash-2c.png', 'assets/img/d-service-dash-2d.png']], prev: 0, next: 2 },
      { k: 'digital_d2_q_service_panel_3', imgs: ['assets/img/d-service-dash-3.png'], prev: 1 },
      { k: 'digital_d2_q_service_templates_title', imgs: ['assets/img/acc-tpl-1.png', 'assets/img/acc-tpl-2.png', 'assets/img/acc-tpl-3.png'] },
    ] },
  { id: 'match', layout: 'match', tile: 'digital_tile_3', tag: 'digital_d3_q_match_undertag_digital', img: 'assets/img/d-tile-match.jpg', title: 'digital_d3_q_match_title', subtitle: 'digital_d3_q_match_subtitle',
    groups: [{ b: ['digital_d3_q_match_bullets_1', 'digital_d3_q_match_bullets_2', 'digital_d3_q_match_bullets_3', 'digital_d3_q_match_bullets_4', 'digital_d3_q_match_bullets_5'] }],
    thumbs: [{ img: 'assets/img/d-match-3.png', panel: 0, pos: '46.7% 0%' }, { img: 'assets/img/d-match-4.png' }],
    hero: 'assets/img/d-match-1.png', heroCover: true, heroPos: '45% 18%', heroPanel: 1,
    qr: 'assets/img/d-match-qr.png', qrTitle: 'digital_d3_q_match_textqr1', qrText: 'digital_d3_q_match_textqr2',
    panels: [{ k: 'digital_d3_q_match_title', imgs: ['assets/img/d-match-3.png'] }, { k: 'digital_d3_q_match_title', imgs: ['assets/img/d-match-1.png'] }] },
  { id: 'planner', layout: 'planner', tile: 'digital_tile_4', tag: 'digital_d4_q_planner_undertag_digital', img: 'assets/img/d-tile-planner.jpg', title: 'digital_d4_q_planner_title', subtitle: 'digital_d4_q_planner_subtile',
    banner: { img: 'assets/img/d-planner-bg.jpg', h: 'digital_d4_q_planner_title_image', p: 'digital_d4_q_planner_subtitle_image', b: ['digital_d4_q_planner_bullets_1', 'digital_d4_q_planner_bullets_2', 'digital_d4_q_planner_bullets_3'] },
    tools: [{ h: 'digital_d4_q_planner_q_select_title', b: ['digital_d4_q_planner_q_select_bullet', 'digital_d4_q_planner_q_select_bullet_2'] }, { h: 'digital_d4_q_planner_q_perform_title', b: ['digital_d4_q_planner_q_perform_bullet', 'digital_d4_q_planner_q_perform_bullet_2'] }, { h: 'digital_d4_q_planner_q_simulate_title', b: ['digital_d4_q_planner_q_simulate_bullet', 'digital_d4_q_planner_q_simulate_bullet_2'] }],
    panels: [] },
  { id: 'connect', layout: 'energy', tile: 'digital_tile_5', tag: 'digital_d5_q_connect_undertag_digital', img: 'assets/img/d-tile-connect.jpg', title: 'digital_d5_q_connect_title_2', subtitle: 'digital_d5_q_connect_subtitle',
    kw: [['digital_d5_q_connect_keyword1', 'digital_d5_q_connect_details1'], ['digital_d5_q_connect_keyword2', 'digital_d5_q_connect_details2'], ['digital_d5_q_connect_keyword3', 'digital_d5_q_connect_details3'], ['digital_d5_q_connect_keyword4', 'digital_d5_q_connect_details4'], ['digital_d5_q_connect_keyword5', 'digital_d5_q_connect_details5']],
    thumbs: [{ img: 'assets/img/d-energy-1.png', contain: true, panel: 0 }, { img: 'assets/img/d-energy-2.png', contain: true, panel: 1 }],
    hero: 'assets/img/d-energy-3.png', heroCover: true, heroPanel: 1, hero2: 'assets/img/d-energy-4.jpg',
    panels: [{ k: 'digital_d5_q_connect_title', imgs: ['assets/img/d-energy-1.png'] }, { k: 'digital_d5_q_connect_title', imgs: ['assets/img/d-energy-2.png'] }, { k: 'digital_d5_q_connect_title', imgs: ['assets/img/d-energy-3.png'] }] },
  { id: 'learn', layout: 'learn', tile: 'digital_tile_6', tag: 'digital_d6_q_learn_undertag_digital', img: 'assets/img/d-tile-learn.jpg', title: 'digital_d6_q_learn_title_full', subtitle: 'digital_d6_q_learn_subtitle',
    groups: [{ b: ['digital_d6_q_learn_bullets_1', 'digital_d6_q_learn_bullets_2', 'digital_d6_q_learn_bullets_3'] }],
    hero: 'assets/img/d-learn.png', panels: [] },
];

// Accessoires (nieuw, geen Figma-frame): QT (altijd met CO₂-sensor, samengevoegd 6 okt) en QS (was producttegel 'qeqs', verplaatst 1 okt). Later uitbreidbaar met ondersteunde HEMS/koppelingen.
// round: false = render vierkant op zwart vlak (geen cirkel-crop)
// panels: title/subtitle/intro/bullets/table/caption = kopijsleutels; cols = [[{src, w, h, r (radius), frame}], ...] rechts: kolommen van beelden, uitgelijnd onder
export const ACCESSORIES = [
  { id: 'qt', tile: 'acc_qt_tile', label: 'acc_qt_label', tag: 'acc_qt_tag', img: 'assets/img/acc-qtco2-product.jpg', photo: true, panels: [
    { id: 'rooms', tab: 'acc_qt_p1_tab', title: 'acc_qt_p1_title', subtitle: 'acc_qt_p1_subtitle', bullets: ['acc_qt_p1_b1', 'acc_qt_p1_b2', 'acc_qt_p1_b3', 'acc_qt_p1_b4', 'acc_qt_p1_b5'], caption: 'acc_qt_p1_caption',
      cols: [[{ src: 'assets/img/acc-qt-app.png', w: 440, h: 866 }], [{ src: 'assets/img/acc-disp-modbus.png', w: 270, h: 270 }, { src: 'assets/img/acc-disp-qt.png', w: 270, h: 270 }, { src: 'assets/img/acc-disp-hp.png', w: 270, h: 270 }]] },
    { id: 'access', tab: 'acc_qt_p2_tab', title: 'acc_qt_p2_title', subtitle: 'acc_qt_p2_subtitle', intro: 'acc_qt_p2_intro', caption: 'acc_qt_p2_caption',
      table: [['acc_tbl_r1_f', 'acc_tbl_r1_m', 'acc_tbl_r1_b'], ['acc_tbl_r2_f', 'acc_tbl_r2_m', 'acc_tbl_r2_b'], ['acc_tbl_r3_f', 'acc_tbl_r3_m', 'acc_tbl_r3_b'], ['acc_tbl_r4_f', 'acc_tbl_r4_m', 'acc_tbl_r4_b'], ['acc_tbl_r5_f', 'acc_tbl_r5_m', 'acc_tbl_r5_b'], ['acc_tbl_r6_f', 'acc_tbl_r6_m', 'acc_tbl_r6_b'], ['acc_tbl_r7_f', 'acc_tbl_r7_m', 'acc_tbl_r7_b'], ['acc_tbl_r8_f', 'acc_tbl_r8_m', 'acc_tbl_r8_b']],
      cols: [[{ src: 'assets/img/acc-access-1.png', w: 300, h: 604, r: 30, frame: true }], [{ src: 'assets/img/acc-access-2.png', w: 300, h: 604, r: 30, frame: true }], [{ src: 'assets/img/acc-photo-settings.png', w: 220, h: 220, r: 16 }]] },
    { id: 'co2', tab: 'acc_qtco2_p1_tab', title: 'acc_qtco2_p1_title', subtitle: 'acc_qtco2_p1_subtitle', bullets: ['acc_qtco2_p1_b1', 'acc_qtco2_p1_b2', 'acc_qtco2_p1_b3', 'acc_qtco2_p1_b4'], caption: 'acc_qtco2_p1_caption',
      cols: [[{ src: 'assets/img/acc-disp-humid.png', w: 400, h: 400 }], [{ src: 'assets/img/acc-disp-co2.png', w: 400, h: 400 }]] },
  ] },
  { id: 'qs', tile: 'acc_qs_tile', label: 'acc_qs_label', tag: 'acc_qs_tag', img: 'assets/img/p-render-qs.png', round: false, panels: [
    { id: 'cool', tab: 'acc_qs_p1_tab', title: 'acc_qs_p1_title', subtitle: 'acc_qs_p1_subtitle', bullets: ['acc_qs_p1_b1', 'acc_qs_p1_b2', 'acc_qs_p1_b3', 'acc_qs_p1_b4'], caption: 'acc_qs_p1_caption',
      cols: [[{ src: 'assets/img/p-render-qs.png', w: 540, h: 540 }, { src: 'assets/img/p-qe-typed-scheme.png', w: 760, h: 412, r: 16 }]] },
  ] },
];

// Referentieprojecten (Figma: Refcases + Refcases/p1..p17). k = kopij-prefix; a = hoofdfoto (kaart + middenkolom), b = foto met quote (rechterkolom)
export const REFCASES = [
  { id: 'detol', c: 'nl', k: 'refcases_p1_detol', a: 'assets/img/rc1a.jpg', aPos: '60% 50%', b: 'assets/img/rc1b.jpg', bPos: '77% 50%', v2: true },
  { id: 'vakantiepark', c: 'nl', k: 'refcases_vakantiepark', a: 'assets/img/rc-vakantiepark.jpg', aPos: '50% 40%', b: 'assets/img/rc-vakantiepark.jpg', inset: 'assets/img/rc-vakantiepark-wko.jpg', insetPos: '40% 85%', v2: true },
  { id: 'stroom', c: 'nl', k: 'refcases_stroom', a: 'assets/img/rc-stroom.jpg', aPos: '60% 50%', b: 'assets/img/rc-stroom.jpg', v2: true },
  { id: 'vreeswijk', c: 'nl', k: 'refcases_vreeswijk', a: 'assets/img/rc-vreeswijk.jpg', aPos: '50% 60%', b: 'assets/img/rc-vreeswijk.jpg', v2: true },
  { id: 'mathilda', c: 'nl', k: 'refcases_p2_mathilda', a: 'assets/img/rc2a.jpg', b: 'assets/img/rc2b.jpg', bPos: '61% 0%', v2: true },
  { id: 'dekroon', c: 'nl', k: 'refcases_p3_dekroon', a: 'assets/img/rc3a.png', aPos: '14% 50%', b: 'assets/img/rc-qe.jpg', bPos: '75% 50%', v2: true },
  { id: 'bathmen', c: 'nl', k: 'refcases_p4_bathmen', a: 'assets/img/rc-bathmen.jpg', aPos: '50% 40%', b: 'assets/img/rc-qe.jpg', bPos: '75% 50%', v2: true },
  { id: 'austerlitz', c: 'nl', k: 'refcases_p5_austerlitz', a: 'assets/img/rc5a.jpg', aPos: '44% 50%', b: 'assets/img/rc5b.jpg', bPos: '32% 50%', v2: true },
  { id: 'vorden', c: 'nl', k: 'refcases_p6_vorden', a: 'assets/img/d-energy-1.png', aContain: true, b: 'assets/img/rc6b.png', bPos: '16% 50%', v2: true },
  { id: 'buizerd', c: 'nl', k: 'refcases_p7_buizerd', a: 'assets/img/rc7a.png', aPos: '13% 50%', b: 'assets/img/rc7a.png', v2: true },
  { id: 'beatrixhof', c: 'nl', k: 'refcases_p8_beatrixhof', a: 'assets/img/rc8a.png', b: 'assets/img/rc8b.png', v2: true },
  { id: 'kulmbach', c: 'de', k: 'refcases_p9_de_kulmbach', a: 'assets/img/rc9b.jpg', b: 'assets/img/rc9b.jpg', bPos: '23% 50%', v2: true },
  { id: 'hvh', c: 'de', k: 'refcases_p10_de_heinzvondheiden', a: 'assets/img/rc10a.png', aPos: '94% 50%', b: 'assets/img/rc10b.png', bPos: '54% 96%', v2: true },
  { id: 'ditzum', c: 'de', k: 'refcases_p11_de_ditzum', a: 'assets/img/rc11a.png', b: 'assets/img/rc11b.png', bPos: '100% 50%', v2: true },
  { id: 'kircheim', c: 'de', k: 'refcases_p12_de_kircheim', a: 'assets/img/rc12a.jpg', b: 'assets/img/rc12b.jpg', bPos: '31% 50%', v2: true },
  { id: 'gunzburg', c: 'de', k: 'refcases_p13_de_gunzburg', a: 'assets/img/rc13a.jpg', aPos: '85% 50%', b: 'assets/img/rc-qe.jpg', v2: true },
  { id: 'dreieich', c: 'de', k: 'refcases_p14_de_dreieich', a: 'assets/img/rc14a.jpg', aPos: '42% 50%', b: 'assets/img/rc-qe.jpg', v2: true },
  { id: 'lawford', c: 'uk', k: 'refcases_lawford', a: 'assets/img/rc-lawford.jpg', aPos: '50% 45%', b: 'assets/img/rc-lawford.jpg', v2: true },
  { id: 'roundway', c: 'uk', k: 'refcases_p15_uk_roundway', a: 'assets/img/rc15a.jpg', b: 'assets/img/rc15b.jpg', v2: true },
  { id: 'liverpool', c: 'uk', k: 'refcases_p16_uk_liverpool_road', a: 'assets/img/rc16a.jpg', b: 'assets/img/rc-qe.jpg', v2: true },
  { id: 'minories', c: 'uk', k: 'refcases_p17_uk_minories', a: 'assets/img/rc17a.jpg', aPos: '41% 50%', b: 'assets/img/rc-qe.jpg', v2: true },
];
// Landkaarten. DE = Figma-vector (Germany.svg); NL/UK/SE zijn in Figma opgebouwd uit losse fragmenten zonder posities in de export en daarom
// gegenereerd uit Natural Earth-data (tools/gen-maps.html) in dezelfde stijl (#91877A vlak, #00152E lijn).
// size = viewBox van het kaartbeeld; pins = [x%, y%] per case-id, berekend met tools/gen-pins.html uit de projectplaats (Mercator, zelfde fit).
export const MAPS = [
  { id: 'nl', label: 'NL', sub: 'refcases_subtitle_mapnl', img: 'assets/img/map-nl.svg', size: [657, 777],
    pins: { detol: [49.34, 63.55], vakantiepark: [44.13,68.91], stroom: [40.65,44.62], vreeswijk: [45.37,56.14], mathilda: [39.83, 69.08], dekroon: [21.98, 62.81], bathmen: [74.9, 48.7], austerlitz: [51.05, 54.35], vorden: [75.49, 53.61], buizerd: [54.84, 39.58], beatrixhof: [58.42, 68.58] } },
  { id: 'de', label: 'DE', sub: 'refcases_subtitle_mapde', img: 'assets/img/map-de.svg', size: [676, 918],
    pins: { kulmbach: [61.04, 65.65], hvh: [43.58, 35.19], ditzum: [15.48, 23.94], kircheim: [39.23, 83.57], gunzburg: [48.24, 85.91], dreieich: [30.98, 66.66] } },
  { id: 'uk', label: 'UK', sub: 'refcases_subtitle_mapuk', img: 'assets/img/map-uk.svg', size: [657, 777],
    pins: { lawford: [74.2, 82.6], roundway: [68.76, 86.04], liverpool: [68.56, 86.52], minories: [68.75, 86.76] } },
  { id: 'se', label: 'SE', sub: 'refcases_subtitle_mapse', img: 'assets/img/map-se.svg', size: [657, 777], pins: {} },
];

// Impact (Figma: Impact): 6 kaarten van 500 breed, foto 652 hoog, label in kapitalen
export const IMPACT = [
  { k: 'impact_tile_1', img: 'assets/img/imp-1.jpg' }, { k: 'impact_tile_2', img: 'assets/img/imp-2.png' }, { k: 'impact_tile_3', img: 'assets/img/imp-3.jpg' },
  { k: 'impact_tile_4', img: 'assets/img/imp-4.jpg' }, { k: 'impact_tile_5', img: 'assets/img/imp-5.png' }, { k: 'impact_tile_6', img: 'assets/img/imp-6.jpg' },
];
// Contact (Figma: Contact): Europa-kaart met fabriekspins op de posities uit het frame (950×907 beeld)
export const CONTACT_PINS = [[487, 490], [582, 654]]; // middelpunt fabriekicoon in px binnen het kaartvlak 950×907 (Åstorp, Hongarije)

// Zichtbaarheid per taal (Figma: boolean-variabelen in collectie Copy).
// refcases: projectnummers (P1 = eerste in REFCASES) die per taal getoond worden, 1-op-1 uit Figma global/RefcasesVisibility (Showproject_P1..P17).
// hideRefcases/hideProducts: ids die per taal extra verborgen worden.
export const VISIBILITY = {
  refcases: {
    nl: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 15, 16, 17], // UK-cases toegevoegd op verzoek (1 okt); wijkt af van Figma RefcasesVisibility
    uk: [1, 11, 15, 16, 17],
    de: [1, 4, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    se: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    pl: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    fr: [1, 11, 15, 16, 17],
  },
  hideRefcases: { nl: [], de: [], uk: [], se: [], pl: [], fr: [] },
  // QE-4/QE-6 overal verborgen (QE-5/QE-7 = qeng is de QE-kaart). LB4 alleen in DE. QA-50 alleen in UK, PL, SE en DE.
  hideProducts: { nl: ['qe', 'lb4', 'qa50'], de: ['qe'], uk: ['qe', 'lb4'], se: ['qe', 'lb4'], pl: ['qe', 'lb4'], fr: ['qe', 'lb4', 'qa50'] },
};

// QG-30 opbouw per vermogen (Figma: products | qg30 | configurations). Bron dry-cooler: Figma-draft 23 sep.
export const QG30_CONFIG = [
  { kw: 30, modules: 1, racks: 1, cap: [['28,0','35,1'],['27,2','34,4'],['25,2','32,2']], rackImg: 'qg30-rack.png', rackKey: 'rack_1', fans: 'fans_1', dc: 'qg30-drycooler.png', air: '13.320 m³/h', weight: '294 kg', dims: '2510 × 1541 × 1396' },
  { kw: 60, modules: 2, racks: 1, cap: [['55,9','70,2'],['54,4','68,7'],['50,3','64,5']], rackImg: 'qg30-rack.png', rackKey: 'rack_1', fans: 'fans_2', dc: 'qg30-dc2.png', air: '24.804 m³/h', weight: '419 kg', dims: '4105 × 1541 × 1342' },
  { kw: 90, modules: 3, racks: 2, cap: [['82,2','102,1'],['79,9','99,9'],['73,5','93,7']], rackImg: 'qg30-rack2.png', rackKey: 'rack_2', fans: 'fans_3', dc: 'qg30-dc3.png', air: '35.640 m³/h', weight: '545 kg', dims: '5954 × 1541 × 1342' },
  { kw: 120, modules: 4, racks: 2, cap: [['110,6','138,9'],['107,7','134,6'],['99,6','127,4']], rackImg: 'qg30-rack2.png', rackKey: 'rack_2', fans: 'fans_4', dc: 'qg30-dc4.png', air: '48.312 m³/h', weight: '730 kg', dims: '4749 × 2342 × 1534' },
  { kw: 150, modules: 5, racks: 3, cap: [['135,8','172,2'],['133,5','167,3'],['122,5','158,0']], rackImg: 'qg30-group.png', rackKey: 'rack_3', fans: 'fans_6', dc: 'qg30-dc6.png', air: '67.680 m³/h', weight: '995 kg', dims: '5982 × 2342 × 1534' },
  { kw: 180, modules: 6, racks: 3, cap: [['164,3','206,2'],['158,4','201,9'],['147,8','189,4']], rackImg: 'qg30-group.png', rackKey: 'rack_3', fans: 'fans_6', dc: 'qg30-dc6.png', air: '67.680 m³/h', weight: '1098 kg', dims: '5982 × 2342 × 1534' },
];

// Contact: klikbare landen op de Europakaart; stip op de hoofdstad. x/y in % van het kaartvlak (assets/img/map-eu.png, 950×907 in Beurspresentatie).
// status: 'sub' = dochteronderneming (donkerblauw), 'dist' = distributeur (bruin). name per taal [nl, uk, de, se, pl, fr].
// contacts/addr/web: placeholders ('…') worden ingevuld zodra de gegevens binnen zijn; lege lijst = alleen algemeen nummer.
export const COUNTRIES = [
  { id: 'nl', status: 'sub', x: 41.9, y: 62.2, name: ['Nederland','Netherlands','Niederlande','Nederländerna','Holandia','Pays-Bas'], entity: 'Qvantum Energietechnologie B.V.', addr: 'Jean Monnetpark 15, 7336 BA Apeldoorn', web: 'qvantum.com/nl', general: '+31 85 060 1760', mail: 'nederland@qvantum.com',
    contacts: [{ name: 'Koen Pape', role: 'Regional Sales Manager', tel: '+31 6 5275 8128', mail: 'koen.pape@qvantum.com' }, { name: 'Sebastiaan Rietveld', role: 'Regional Sales Manager', tel: '+31 6 4216 6470', mail: 'sebastiaan.rietveld@qvantum.com' }, { name: 'Pascal Boy', role: 'Regional Sales Manager', tel: '+31 6 1430 6345', mail: 'pascal.boy@qvantum.com' }] },
  { id: 'se', status: 'sub', x: 57.3, y: 46.3, name: ['Zweden','Sweden','Schweden','Sverige','Szwecja','Suède'], entity: 'Qvantum Energi AB', addr: 'Ji-te gatan 7, 265 38 Åstorp', web: 'qvantum.com/sv', general: '+46 10 332 00 55', mail: 'sales@qvantum.com',
    contacts: [{ name: 'Fredrik Tengström', role: 'Regional Sales · Väst/Gotland', tel: '+46 73 552 97 43', mail: 'fredrik.tengstrom@qvantum.com' }, { name: 'Fredric Hultberg', role: 'Regional Sales · Mellansverige', tel: '+46 76 697 65 51', mail: 'fredric.hultberg@qvantum.com' }, { name: 'Albin Engfors', role: 'Regional Sales · Syd', tel: '+46 76 531 23 44', mail: 'albin.engfors@qvantum.com' }, { name: 'Niklas Jakobsson', role: 'Regional Sales · Stockholm Södra', tel: '+46 76 254 89 71', mail: 'niklas.jakobsson@qvantum.com' }, { name: 'Per Mollstedt', role: 'Regional Sales · Stockholm Norra/Uppland', tel: '+46 70 349 66 17', mail: 'per.mollstedt@qvantum.com' }, { name: 'Sofia Akhlaghi', role: 'Säljchef Partner & Digital Sales', tel: '+46 70 302 71 45', mail: 'sofia.akhlaghi@qvantum.com' }, { name: 'David Möller', role: 'Säljchef Fastighetsprodukter', tel: '+46 76 535 56 84', mail: 'david.moller@qvantum.com' }, { name: 'Magnus Lindberg', role: 'KAM Nyproduktion/Projekt', tel: '+46 79 006 57 36', mail: 'magnus.lindberg@qvantum.com' }, { name: 'Richard Carlholmer', role: 'Säljchef Grossist & Husfabrikant', tel: '+46 79 585 45 65', mail: 'richard.carlholmer@qvantum.com' }] },
  { id: 'uk', status: 'sub', x: 35.7, y: 64.6, name: ['Verenigd Koninkrijk','United Kingdom','Vereinigtes Königreich','Storbritannien','Wielka Brytania','Royaume-Uni'], entity: 'Qvantum Energy Technology Ltd', addr: 'London Office: Unit 5, 3rd Floor, 25 Christopher Street, EC2A 2BS · Midlands Office: Office 10, Tugby Orchards, Leicester, LE7 9WE', web: 'qvantum.com/uk', general: '+44 330 822 6643', mail: 'salesuk@qvantum.com',
    contacts: [] },
  { id: 'de', status: 'sub', x: 50.5, y: 62, name: ['Duitsland','Germany','Deutschland','Tyskland','Niemcy','Allemagne'], entity: 'Qvantum Energietechnik GmbH', addr: 'Lichtenfelser Straße 54, 95326 Kulmbach', web: 'qvantum.com/de', general: '+49 160 3605503', mail: 'einfach@qvantum.com',
    contacts: [{ name: 'Wolfgang Herold', role: 'Geschäftsführer', tel: '+49 160 3605503', mail: 'einfach@qvantum.com' }] },
  { id: 'pl', status: 'sub', x: 59.5, y: 62, name: ['Polen','Poland','Polen','Polen','Polska','Pologne'], entity: 'Qvantum Energy Technology Sp. z o.o.', addr: 'ul. Żurawia 71, 15-540 Białystok', web: 'qvantum.com/pl', general: '', mail: 'sprzedaz@qvantum.com',
    contacts: [{ name: 'Tobiasz Turoń', role: 'Regional Sales Manager · Region I', tel: '+48 660 630 454', mail: 'tobiasz.turon@qvantum.com' }, { name: 'Patryk Jabłoński', role: 'Regional Sales Manager · Region II', tel: '+48 692 381 542', mail: 'patryk.jablonski@qvantum.com' }, { name: 'Przemysław Pisarski', role: 'Regional Sales Manager · Region III', tel: '+48 662 410 593', mail: 'przemyslaw.pisarski@qvantum.com' }, { name: 'Paweł Rostkowski', role: 'Regional Sales Manager · Region IV', tel: '+48 735 736 407', mail: 'pawel.rostkowski@qvantum.com' }, { name: 'Mateusz Szyduczyński', role: 'Sales Manager · Prefab housing', tel: '+48 660 630 465', mail: 'mateusz.szyduczynski@qvantum.com' }, { name: 'Ewa Smuczyńska', role: 'Sales Department · Białystok', tel: '+48 735 724 627', mail: 'ewa.smuczynska@qvantum.com' }, { name: 'Justyna Rybakiewicz', role: 'Sales Department · Białystok', tel: '+48 662 623 540', mail: 'justyna.rybakiewicz@qvantum.com' }] },
  { id: 'fr', status: 'sub', x: 38.5, y: 69.5, name: ['Frankrijk','France','Frankreich','Frankrike','Francja','France'], entity: 'Qvantum Energy Technology SAS', addr: '5 Rue de la Terrasse, 75017 Paris', web: 'qvantum.com/fr', general: '+33 6 71 03 32 39', mail: 'ghislain.bouillet@qvantum.com',
    contacts: [{ name: 'Ghislain Bouillet', role: 'Directeur Général', tel: '+33 6 71 03 32 39', mail: 'ghislain.bouillet@qvantum.com' }] },
  { id: 'at', status: 'dist', x: 56.9, y: 72.3, name: ['Oostenrijk','Austria','Österreich','Österrike','Austria','Autriche'], entity: 'Qvantum Energietechnik Austria GmbH', addr: 'Schallerbacher Straße 100, 4702 Wallern an der Trattnach', web: 'qvantum.com/de-at', general: '+43 676 3707057', mail: 'einfach.anders@qvantum.com',
    contacts: [{ name: 'Lars (Peter) Bierlein', role: 'Geschäftsführer', tel: '+43 676 3707057', mail: 'einfach.anders@qvantum.com' }] },
  { id: 'hu', status: 'dist', x: 60, y: 73.3, name: ['Hongarije','Hungary','Ungarn','Ungern','Węgry','Hongrie'], entity: 'Qvantum Energy Technology Kft.', addr: 'Keleti 2 utca 6, 4400 Nyíregyháza', web: 'qvantum.com/hu', general: '+46 10 332 00 50', mail: 'info@qvantum.com',
    contacts: [] },
  { id: 'fi', status: 'dist', x: 65, y: 44.2, name: ['Finland','Finland','Finnland','Finland','Finlandia','Finlande'], entity: '…', addr: '…', web: '…', general: '…', mail: '',
    contacts: [] },
  { id: 'es', status: 'dist', x: 30, y: 86.2, name: ['Spanje','Spain','Spanien','Spanien','Hiszpania','Espagne'], entity: '…', addr: '…', web: '…', general: '…', mail: '',
    contacts: [] },
  { id: 'it', status: 'dist', x: 50, y: 82.4, name: ['Italië','Italy','Italien','Italien','Włochy','Italie'], entity: '…', addr: '…', web: '…', general: '…', mail: '',
    contacts: [] },
];

// Principeplaten per product (Mobiel toont ze onder de specificaties; kiosk via PANELS)
export const PLATES = {
  qe: [{ svg: 'illustrations/principles/qe-woning-gevelrooster.svg', k: 'products_qe_tile_typec' }, { svg: 'illustrations/principles/qe-qs-woning.svg', k: 'products_qe_tile_typed' }, { svg: 'illustrations/principles/qe-qs-multiducto-woning.svg', k: 'products_qe_qe_deep_title_multi' }],
  qeng: [{ svg: 'illustrations/principles/qe-woning-gevelrooster.svg', k: 'products_qe_tile_typec' }, { svg: 'illustrations/principles/qe-qs-woning.svg', k: 'products_qe_tile_typed' }, { svg: 'illustrations/principles/qe-qs-multiducto-woning.svg', k: 'products_qe_qe_deep_title_multi' }],
  qa: [{ svg: 'illustrations/principles/qa-qh-woning.svg', k: 'products_qa_qa_deep_principle' }],
  qg: [{ svg: 'illustrations/principles/qg-woning-bodembron.svg', k: 'products_qg_plate_house' }, { svg: 'illustrations/principles/qg-appartement.svg', k: 'products_qg_plate_apt' }],
  qgm: [{ svg: 'illustrations/principles/qg-woning-bodembron.svg', k: 'products_qg_plate_house' }, { svg: 'illustrations/principles/qg-appartement.svg', k: 'products_qg_plate_apt' }],
  qg30: [{ svg: 'illustrations/principles/qg30-plantroom.svg', k: 'products_qg30_principle_title' }],
};
