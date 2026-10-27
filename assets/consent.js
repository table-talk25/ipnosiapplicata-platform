/* Consenso cookie per ipnosiapplicata.it (Google Consent Mode v2 + Meta Pixel), senza librerie.
 *
 * Va caricato come PRIMO script dell'<head>, prima del blocco gtag e del Pixel.
 *  - Consent Mode v2: default tutto "denied" (wait_for_update 500); se c'e' una scelta
 *    salvata (cookie tecnico `cookie_consent`, 6 mesi) viene applicata subito con 'update'.
 *  - GA4 (G-MHK1RYYDXY): lo script gtag.js viene caricato SOLO con il consenso
 *    "statistici". Prima della scelta config ed eventi restano in coda nel dataLayer
 *    e non esce nessuna richiesta verso Google.
 *  - Meta Pixel (solo /grazie-reset/): fbq('consent','revoke') prima di fbq('init');
 *    fbevents.js viene caricato SOLO con il consenso "marketing".
 *  - Banner: "Accetta tutto", "Rifiuta tutto", "Personalizza" con lo stesso peso; nessuna
 *    casella preselezionata; nessun consenso implicito. Non blocca la pagina (login,
 *    area riservata, pagamento restano usabili) e si riapre dai link [data-cl-consent-open].
 *
 * Cookie tecnico `cookie_consent`: v1|a<0|1>|m<0|1>|<timestamp in secondi>
 */
(function () {
  var COOKIE = 'cookie_consent';
  var MAX_AGE = 60 * 60 * 24 * 182; // circa 6 mesi
  var GA_IDS = ['G-MHK1RYYDXY'];
  var GA_SRC = 'https://www.googletagmanager.com/gtag/js?id=' + GA_IDS[0];
  var FB_SRC = 'https://connect.facebook.net/en_US/fbevents.js';
  var COOKIE_POLICY = '/cookie/';
  var PRIVACY_POLICY = '/privacy/';

  // --- Consent Mode v2: default negato, prima di qualsiasi altro tag ---
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  // --- Meta Pixel: coda senza script finche' non c'e' il consenso marketing ---
  // Lo snippet della pagina trova fbq gia' definito e non scarica fbevents.js.
  if (!window.fbq) {
    var n = window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
  }
  window.fbq('consent', 'revoke');

  var gaLoaded = false, fbLoaded = false;
  var pendingUpdate = null; // update del consenso messo in coda prima che gtag.js sia caricato
  var state = null; // { analytics: bool, marketing: bool, ts: secondi }

  function loadScript(src) {
    var s = document.createElement('script');
    s.async = true; s.src = src;
    var first = document.getElementsByTagName('script')[0];
    if (first && first.parentNode) first.parentNode.insertBefore(s, first);
    else (document.head || document.documentElement).appendChild(s);
  }

  function args() { return arguments; }

  function deleteCookies(test) {
    var host = location.hostname;
    var domains = ['', host, '.' + host];
    var parts = host.split('.');
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  function apply(c) {
    var a = !!c.analytics, m = !!c.marketing;
    var update = {
      analytics_storage: a ? 'granted' : 'denied',
      ad_storage: m ? 'granted' : 'denied',
      ad_user_data: m ? 'granted' : 'denied',
      ad_personalization: m ? 'granted' : 'denied'
    };
    if (!gaLoaded) {
      // gtag.js non e' ancora caricato: nessun dato e' uscito. L'update va subito dopo il
      // default, prima di config ed eventi in coda, cosi' gtag.js li elabora gia' con la
      // scelta fatta. Una scelta precedente ancora in coda viene sostituita.
      var dl = window.dataLayer, at = -1;
      if (pendingUpdate) {
        var old = dl.indexOf(pendingUpdate);
        if (old !== -1) dl.splice(old, 1);
      }
      for (var i = 0; i < dl.length; i++) {
        if (dl[i] && dl[i][0] === 'consent' && dl[i][1] === 'default') { at = i; break; }
      }
      pendingUpdate = args('consent', 'update', update);
      if (at === -1) dl.push(pendingUpdate);
      else dl.splice(at + 1, 0, pendingUpdate);
    } else {
      gtag('consent', 'update', update);
    }

    // GA4
    GA_IDS.forEach(function (id) { window['ga-disable-' + id] = !a; });
    if (a && !gaLoaded) { gaLoaded = true; loadScript(GA_SRC); }
    if (!a) deleteCookies(function (name) { return name === '_ga' || name.indexOf('_ga_') === 0; });

    // Meta Pixel
    var q = window.fbq;
    if (m) {
      if (!fbLoaded) {
        // Script mai caricato: si toglie la revoca iniziale dalla coda e si mette il
        // consenso in testa, cosi' gli eventi di questa pagina partono una sola volta.
        if (q && q.queue) {
          q.queue = Array.prototype.filter.call(q.queue, function (x) {
            return !(x && x[0] === 'consent' && x[1] === 'revoke');
          });
          q.queue.unshift(args('consent', 'grant'));
        }
        fbLoaded = true;
        loadScript(FB_SRC);
      } else {
        q('consent', 'grant');
      }
    } else {
      if (fbLoaded) q('consent', 'revoke');
      deleteCookies(function (name) { return name === '_fbp' || name === '_fbc'; });
    }

    try { document.dispatchEvent(new CustomEvent('cl:consent', { detail: { analytics: a, marketing: m } })); } catch (e) {}
  }

  function read() {
    try {
      var parts = ('; ' + document.cookie).split('; ' + COOKIE + '=');
      if (parts.length !== 2) return null;
      var v = decodeURIComponent(parts.pop().split(';').shift()).split('|');
      if (v.length !== 4 || v[0] !== 'v1' || !/^a[01]$/.test(v[1]) || !/^m[01]$/.test(v[2]) || !/^\d+$/.test(v[3])) return null;
      var ts = Number(v[3]);
      if (Date.now() / 1000 - ts > MAX_AGE) return null; // scaduta: si richiede
      return { analytics: v[1] === 'a1', marketing: v[2] === 'm1', ts: ts };
    } catch (e) { return null; }
  }

  function save(c) {
    var ts = Math.floor(Date.now() / 1000);
    var value = ['v1', 'a' + (c.analytics ? 1 : 0), 'm' + (c.marketing ? 1 : 0), ts].join('|');
    document.cookie = COOKIE + '=' + encodeURIComponent(value) + '; Max-Age=' + MAX_AGE +
      '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    state = { analytics: !!c.analytics, marketing: !!c.marketing, ts: ts };
  }

  function choose(c) {
    save(c);
    apply(c);
    hideBanner();
  }

  // --- Banner ---
  var CSS = '' +
    '.clc-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:10001;max-width:760px;margin:0 auto;padding:24px;border-radius:20px;' +
    'background:rgba(16,20,22,.97);border:1px solid #3d4944;box-shadow:0 25px 50px -12px rgba(0,0,0,.6);color:#F5F7FA;font-family:Inter,sans-serif;' +
    'max-height:calc(100vh - 32px);overflow-y:auto;text-align:left}' +
    '.clc-banner[hidden]{display:none}' +
    '.clc-title{margin:0 0 8px;font-family:Manrope,sans-serif;font-size:18px;font-weight:700;color:#F5F7FA}' +
    '.clc-text{margin:0;font-size:14px;line-height:1.6;color:#bccac3}' +
    '.clc-text a{color:#49C7A5;text-decoration:underline;text-underline-offset:2px}' +
    '.clc-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}' +
    '.clc-btn{padding:12px 14px;border-radius:12px;border:1px solid #49C7A5;background:transparent;color:#F5F7FA;' +
    'font-family:Inter,sans-serif;font-size:14px;font-weight:600;line-height:1.3;cursor:pointer;transition:background .2s ease}' +
    '.clc-btn:hover{background:rgba(73,199,165,.12)}' +
    '.clc-btn:focus-visible,.clc-check input:focus-visible,.clc-text a:focus-visible{outline:2px solid #49C7A5;outline-offset:2px}' +
    '.clc-panel{margin-top:16px;padding-top:16px;border-top:1px solid rgba(61,73,68,.6)}' +
    '.clc-panel[hidden]{display:none}' +
    '.clc-check{display:flex;gap:12px;align-items:flex-start;padding:10px 0;font-size:14px;line-height:1.5;color:#bccac3;cursor:pointer}' +
    '.clc-check input{width:18px;height:18px;margin-top:2px;flex-shrink:0;accent-color:#49C7A5;cursor:pointer}' +
    '.clc-check strong{display:block;color:#F5F7FA;font-weight:600}' +
    '.clc-check input:disabled{cursor:not-allowed}' +
    '.clc-save{margin-top:8px;width:100%}' +
    // Mobile: banner compatto (meno spazio sopra login e moduli); i tre pulsanti restano
    // affiancati e identici.
    '@media (max-width:560px){.clc-banner{left:8px;right:8px;bottom:8px;padding:16px;border-radius:16px}' +
    '.clc-title{font-size:16px;margin-bottom:6px}.clc-text{font-size:13px;line-height:1.5}' +
    '.clc-actions{gap:6px;margin-top:12px}.clc-btn{padding:10px 4px;font-size:13px}}';

  var HTML = '' +
    '<h2 class="clc-title" id="clc-title">Cookie e privacy</h2>' +
    '<p class="clc-text" id="clc-desc">Usiamo cookie tecnici e memoria locale del browser, sempre attivi, necessari al ' +
    'funzionamento del sito: accesso all\u2019area riservata, progressi dei corsi e questa scelta. Solo con il tuo consenso ' +
    'usiamo anche cookie statistici (Google Analytics), per capire come viene usato il sito, e di marketing (Meta Pixel), ' +
    'per misurare le campagne pubblicitarie. Puoi cambiare scelta quando vuoi da \u201cGestisci cookie\u201d in fondo alla pagina. ' +
    '<a href="' + COOKIE_POLICY + '">Cookie Policy</a> \u00b7 <a href="' + PRIVACY_POLICY + '">Privacy Policy</a></p>' +
    '<div class="clc-actions">' +
      '<button type="button" class="clc-btn" data-clc="accept">Accetta tutto</button>' +
      '<button type="button" class="clc-btn" data-clc="reject">Rifiuta tutto</button>' +
      '<button type="button" class="clc-btn" data-clc="custom" aria-expanded="false" aria-controls="clc-panel">Personalizza</button>' +
    '</div>' +
    '<div class="clc-panel" id="clc-panel" hidden>' +
      '<label class="clc-check"><input type="checkbox" checked disabled>' +
        '<span><strong>Tecnici (sempre attivi)</strong>Necessari per accedere all\u2019area riservata, salvare i progressi e ricordare questa scelta.</span></label>' +
      '<label class="clc-check"><input type="checkbox" data-clc-cat="analytics">' +
        '<span><strong>Statistici</strong>Google Analytics 4: statistiche sull\u2019uso del sito.</span></label>' +
      '<label class="clc-check"><input type="checkbox" data-clc-cat="marketing">' +
        '<span><strong>Marketing (terze parti)</strong>Meta Pixel: misurazione delle campagne pubblicitarie.</span></label>' +
      '<button type="button" class="clc-btn clc-save" data-clc="save">Salva le mie scelte</button>' +
    '</div>';

  var banner = null;
  var opener = null; // link "Gestisci cookie" che ha riaperto il banner: ci torna il focus

  function build() {
    if (banner) return banner;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    banner = document.createElement('div');
    banner.className = 'clc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-label', 'Preferenze cookie');
    banner.setAttribute('aria-describedby', 'clc-desc');
    banner.hidden = true;
    banner.innerHTML = HTML;
    // Primo elemento del body: con la tastiera si raggiunge per primo, senza togliere
    // il focus a chi sta gia' compilando un campo (es. il login).
    document.body.insertBefore(banner, document.body.firstChild);
    banner.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-clc]') : null;
      if (!b) return;
      var action = b.getAttribute('data-clc');
      if (action === 'accept') choose({ analytics: true, marketing: true });
      else if (action === 'reject') choose({ analytics: false, marketing: false });
      else if (action === 'custom') togglePanel();
      else if (action === 'save') {
        choose({
          analytics: banner.querySelector('[data-clc-cat="analytics"]').checked,
          marketing: banner.querySelector('[data-clc-cat="marketing"]').checked
        });
      }
    });
    // Esc chiude il banner solo se una scelta c'e' gia' (riaperto da "Gestisci cookie"):
    // chiuderlo non vale mai come consenso.
    banner.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && state) hideBanner();
    });
    return banner;
  }

  function togglePanel(forceOpen) {
    var panel = banner.querySelector('#clc-panel');
    var open = forceOpen === true ? true : panel.hidden;
    panel.hidden = !open;
    banner.querySelector('[data-clc="custom"]').setAttribute('aria-expanded', String(open));
    if (open) { var first = panel.querySelector('[data-clc-cat]'); if (first && banner.contains(document.activeElement)) first.focus(); }
    if (!banner.hidden) reserveSpace();
  }

  function showBanner(focus) {
    build();
    var c = state || { analytics: false, marketing: false };
    banner.querySelector('[data-clc-cat="analytics"]').checked = !!c.analytics;
    banner.querySelector('[data-clc-cat="marketing"]').checked = !!c.marketing;
    banner.querySelector('#clc-panel').hidden = true;
    banner.querySelector('[data-clc="custom"]').setAttribute('aria-expanded', 'false');
    banner.hidden = false;
    reserveSpace();
    if (focus) banner.querySelector('[data-clc="accept"]').focus();
  }

  function hideBanner() {
    if (!banner) return;
    var hadFocus = banner.contains(document.activeElement);
    banner.hidden = true;
    releaseSpace();
    if (hadFocus && opener && document.contains(opener)) opener.focus();
    opener = null;
  }

  // Il banner non blocca il sito: si aggiunge spazio in fondo alla pagina, cosi'
  // anche l'ultimo contenuto (footer compreso) resta raggiungibile scorrendo.
  var savedPadding = null;
  function reserveSpace() {
    if (savedPadding === null) savedPadding = document.body.style.paddingBottom;
    document.body.style.paddingBottom = (banner.offsetHeight + 32) + 'px';
  }
  function releaseSpace() {
    if (savedPadding === null) return;
    document.body.style.paddingBottom = savedPadding;
    savedPadding = null;
  }

  // Link "Gestisci cookie": <a href="#gestisci-cookie" role="button" data-cl-consent-open>
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('[data-cl-consent-open]') : null;
    if (!a) return;
    e.preventDefault();
    opener = a;
    showBanner(true);
  });

  window.CLConsent = {
    analytics: function () { return !!(state && state.analytics); },
    marketing: function () { return !!(state && state.marketing); },
    // Momento della scelta (ISO 8601) o null se l'utente non ha ancora scelto.
    timestamp: function () { return state ? new Date(state.ts * 1000).toISOString() : null; },
    open: function () { showBanner(true); }
  };

  state = read();
  if (state) apply(state);
  var start = function () { if (!state) showBanner(false); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
