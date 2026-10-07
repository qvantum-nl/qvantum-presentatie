// Meting voor de openbare webversie (niet voor de kiosk). Wordt door
// tools/publish-web.sh aan Beurspresentatie.dc.html en Mobiel.dc.html toegevoegd.
//
// Google Analytics 4 zonder cookies. Het standaardscript van Google (gtag.js)
// zet altijd _ga-cookies, dus sturen we de meetpunten zelf naar GA4. Er wordt
// niets in de browser opgeslagen: het bezoekersnummer bestaat alleen zolang de
// pagina open is. Elk bezoek telt daardoor als een nieuwe bezoeker.
//
// Wat gemeten wordt: elke geopende sectie als paginaweergave, taalwissels en
// klikken op een telefoonnummer of e-mailadres (alleen het soort, niet het adres)
// en klikken op een knop met data-cta (bijvoorbeeld het HubSpot-formulier).
(function () {
  var GA_ID = 'G-B7LNLKF32X';
  var ENDPOINT = 'https://region1.google-analytics.com/g/collect';
  var MOBILE = /Mobiel/i.test(decodeURIComponent(location.pathname));
  var KIND = MOBILE ? 'mobiel' : 'presentatie';
  var BASE = location.origin + location.pathname.replace(/[^/]*$/, '');

  var startedAt = Math.floor(Date.now() / 1000);
  var clientId = Math.floor(Math.random() * 2147483647) + '.' + startedAt;
  var pageId = Math.floor(Math.random() * 2147483647);
  var hits = 0;
  var lastHit = Date.now();
  var lastLocation = BASE + KIND + '/home';
  var lastTitle = KIND;

  function send(name, params, pageLocation, pageTitle) {
    hits++;
    if (pageLocation) { lastLocation = pageLocation; lastTitle = pageTitle; }
    var q = new URLSearchParams({
      v: '2', tid: GA_ID, cid: clientId, sid: String(startedAt), sct: '1', seg: '1',
      _p: String(pageId), _s: String(hits), en: name,
      dl: lastLocation, dt: lastTitle,
      ul: (navigator.language || '').toLowerCase(),
      sr: screen.width + 'x' + screen.height
    });
    if (document.referrer) q.set('dr', document.referrer);
    if (hits === 1) { q.set('_ss', '1'); q.set('_fv', '1'); }
    var now = Date.now();
    q.set('_et', String(now - lastHit));
    lastHit = now;
    for (var key in params) if (params[key] !== '' && params[key] != null) q.set('ep.' + key, String(params[key]));
    var url = ENDPOINT + '?' + q.toString();
    try {
      if (!(navigator.sendBeacon && navigator.sendBeacon(url))) {
        fetch(url, { method: 'POST', mode: 'no-cors', keepalive: true });
      }
    } catch (e) {}
  }

  function stored(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (e) { return {}; }
  }
  function current() {
    if (MOBILE) {
      var m = stored('qv-mobiel');
      var hash = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
      return { route: hash || m.route || 'home', lang: m.lang || '' };
    }
    var s = stored('qv-beurs');
    return { route: s.route || 'home', lang: s.lang || '' };
  }

  // De presentaties wisselen van sectie zonder de pagina te herladen, dus kijken
  // we zelf of de sectie is veranderd en melden die dan als paginaweergave,
  // bijvoorbeeld /qvantum-presentatie/mobiel/product/qg.
  var lastRoute = null;
  var lastLang = null;
  function check() {
    var now = current();
    if (now.route !== lastRoute) {
      var path = KIND + '/' + String(now.route).replace(/:/g, '/');
      send('page_view', { presentation: KIND, presentation_lang: now.lang },
        BASE + path + (lastRoute === null ? location.search : ''), KIND + ': ' + now.route);
      lastRoute = now.route;
    }
    if (now.lang !== lastLang) {
      if (lastLang !== null && now.lang) send('language_change', { presentation: KIND, presentation_lang: now.lang });
      lastLang = now.lang;
    }
  }
  // Even wachten tot de presentatie haar beginstand heeft gezet.
  setTimeout(function () { check(); setInterval(check, 500); }, 1500);

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"],a[href^="mailto:"]') : null;
    if (a) send('contact_click', { method: a.getAttribute('href').split(':')[0], presentation: KIND });
    // Knoppen met data-cta, zoals de link naar het HubSpot-formulier.
    var cta = e.target && e.target.closest ? e.target.closest('[data-cta]') : null;
    if (cta) send('cta_click', { cta: cta.getAttribute('data-cta'), presentation: KIND, presentation_lang: current().lang });
  }, true);

  // Bij het verlaten de resterende kijktijd melden.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && hits) send('user_engagement', { presentation: KIND });
    else lastHit = Date.now();
  });
})();
