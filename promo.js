/* BarFlow offers - one shared file for every page. Offers: FEWCM (launch, 30%, until 15 Nov 2026 23:59 Amman) and BFCM26
   (Black Friday / Cyber Monday, 20%, 27 Nov 00:00 - 30 Nov 2026 23:59 Amman = 26 Nov 21:00:00 - 30 Nov 20:59:59 UTC). Only one offer is active at a time;
   outside every window nothing is shown and nothing is added (list prices). Visitors' time zone is irrelevant: all limits are absolute UTC instants.
   ORIGINAL FEWCM NOTES:
   Until 15 Nov 2026 23:59 Amman time (UTC+3): banner on top, struck-through prices + "-30% - FEWCM" badge on the two discounted plans,
   FEWCM added to their checkout (buy.html), GoatCounter events. After that moment nothing is shown and nothing is added:
   the page looks exactly as without the offer (no banner, no strikethrough). Change the three constants below for a new offer. */
(function () {
  // Each offer: code, window [START, END] (UTC instants), percent, the ONLY plans the code works for, banner texts.
  var OFFERS = [
    { code: 'FEWCM', pct: 30, start: -Infinity, end: Date.parse('2026-11-15T23:59:59+03:00'),
      plans: { bundle: { old: '$55', now: '$38.50' }, starter: { old: '$35', now: '$24.50' } },
      en: 'Launch offer: 30% off the bundles with code {C} &mdash; until 15 Nov',
      ar: 'عرض الإطلاق: خصم 30% على الباقات بالكود {C} &mdash; حتى 15 نوفمبر' },
    { code: 'BFCM26', pct: 20, start: Date.parse('2026-11-26T21:00:00Z'), end: Date.parse('2026-11-30T20:59:59Z'),
      plans: { bundle: { old: '$55', now: '$44.00' }, starter: { old: '$35', now: '$28.00' } },
      en: 'Black Friday / Cyber Monday: 20% off the Complete package and the Starter bundle with code {C} &mdash; until 30 Nov',
      ar: 'عرض الجمعة السوداء وسايبر مونداي: خصم 20% على الباقة الكاملة وباقة البداية بالكود {C} &mdash; حتى 30 نوفمبر' }
  ];
  var NOW = Date.now(), SIM = false, OFFER = null, NEXT = Infinity;
  // TEST ONLY (simulated clock): ?bf_now=2026-11-28T12:00:00Z in the page address; it only changes what THIS page shows,
  // Lemon Squeezy always enforces the real dates at checkout.
  try { var sm = /[?&]bf_now=([0-9TZ:\-+.]+)(?:&|#|$)/.exec(location.search); if (sm && !isNaN(Date.parse(sm[1]))) { NOW = Date.parse(sm[1]); SIM = true; } } catch (e) {}
  OFFERS.forEach(function (o) {
    if (NOW >= o.start && NOW <= o.end && !OFFER) OFFER = o;
    else if (o.start > NOW && o.start < NEXT) NEXT = o.start;
  });
  var CODE = OFFER ? OFFER.code : 'FEWCM', END = OFFER ? OFFER.end : 0, PCT = OFFER ? OFFER.pct : 30, PLANS = OFFER ? OFFER.plans : {};
  // RECORDING MODE: open any page with ?clean=1 (for example https://barflowapp.com/?clean=1) and this browser tab shows
  // the site WITHOUT any offer (no banner, no strikethrough, normal prices, no code added at checkout) on every page you visit
  // in that tab. It lasts until the tab is closed (sessionStorage); ?clean=0 switches it off. Nobody else is affected.
  var clean = false;
  try {
    var qm = /[?&]clean=(0|1)(?:&|#|$)/.exec(location.search);
    if (qm) sessionStorage.setItem('bf_clean', qm[1]);
    clean = sessionStorage.getItem('bf_clean') === '1';
  } catch (e) {}
  var active = !clean && !!OFFER;
  window.BF_PROMO = { active: active, code: CODE, pct: PCT, end: END, plans: PLANS };
  if (!OFFER && NEXT < Infinity && !clean && NEXT - NOW > 0 && NEXT - NOW < 2147483000 && !SIM) {   // idle page: pick up the next offer when it starts
    setTimeout(function () { location.reload(); }, NEXT - NOW + 500);
  }
  if (!active) return;

  function lang() { return ((document.documentElement.lang || 'en').slice(0, 2) === 'ar') ? 'ar' : 'en'; }
  function ev(name, tries) {
    try { if (window.goatcounter && window.goatcounter.count) { window.goatcounter.count({ event: true, path: name, title: name }); return; } } catch (e) {}
    if ((tries || 0) < 40) setTimeout(function () { ev(name, (tries || 0) + 1); }, 250);     // count.js loads async: retry for ~10 s
  }
  var TXT = {
    en: OFFER.en.replace('{C}', '<b class="bfp-code">' + CODE + '</b>'),
    ar: OFFER.ar.replace('{C}', '<b class="bfp-code">' + CODE + '</b>')
  };
  var CSS = '.bfp{display:block;background:#f28c28;color:#0f2747;text-align:center;font:700 15px/1.4 "Segoe UI",Roboto,Tahoma,Arial,sans-serif;padding:9px 14px;text-decoration:none;position:relative;z-index:60}' +
    '.bfp:hover{background:#e07410;color:#0f2747}.bfp .bfp-code{background:#0f2747;color:#fff;border-radius:6px;padding:1px 8px;margin:0 3px;letter-spacing:1px;font-weight:800;white-space:nowrap}' +
    '.pl .price .bfp-old{font-size:22px;font-weight:600;color:#7a8699;text-decoration:line-through;margin-inline-end:10px}' +
    '.pl .price .bfp-new{color:#c8570a}.pl .price .bfp-new+small{display:block;margin:2px 0 0}' +
    '.pl .bfp-badge{display:inline-block;background:#0f2747;color:#fff;font-weight:700;font-size:13px;padding:3px 12px;border-radius:999px;margin:2px 0 8px;align-self:flex-start;letter-spacing:.3px}' +
    '.pl .bfp-badge+h3{margin-top:0}';

  function pricingTarget(l) {
    if (document.getElementById('pricing-' + l)) return null;                          // this page has the pricing section: just scroll
    return l === 'ar' ? '/ar/?lang=ar#pricing-ar' : '/?lang=en#pricing-en';
  }

  function build() {
    var st = document.createElement('style'); st.id = 'bfp-style'; st.textContent = CSS; document.head.appendChild(st);
    var a = document.createElement('a'); a.className = 'bfp'; a.id = 'bfp-banner';
    function paint() {
      var l = lang();
      a.innerHTML = TXT[l]; a.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr'); a.setAttribute('lang', l);
      a.href = pricingTarget(l) || ('#pricing-' + l);
    }
    paint();
    a.addEventListener('click', function (e) {
      var l = lang(); ev('promo-banner-click-' + l);
      var t = document.getElementById('pricing-' + l);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
    document.body.insertBefore(a, document.body.firstChild);
    try { new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] }); } catch (e) {}
    ev('promo-banner-view-' + lang());                                                  // once per page view
  }

  function cards() {
    document.querySelectorAll('.pl[data-plan]').forEach(function (c) {
      var p = PLANS[c.getAttribute('data-plan')]; if (!p || c.getAttribute('data-bfp')) return;
      c.setAttribute('data-bfp', '1');
      var price = c.querySelector('.price'); if (!price) return;
      var small = price.querySelector('small'), sm = small ? small.outerHTML : '';
      price.innerHTML = '<span class="bfp-old">' + p.old + '</span><span class="bfp-new">' + p.now + '</span>' + sm;
      var badge = document.createElement('span'); badge.className = 'bfp-badge'; badge.setAttribute('dir', 'ltr'); badge.textContent = '-' + PCT + '% · ' + CODE;     // dir=ltr keeps "-30% - FEWCM" in this order on the Arabic page
      c.insertBefore(badge, c.querySelector('h3'));
    });
  }

  function clicks() {
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a.buy') : null; if (!a) return;
      var m = /plan=(bundle|starter)\b/.exec(a.getAttribute('href') || ''); if (!m) return;
      ev('promo-buy-' + m[1] + '-' + lang());
    }, true);
  }

  function init() {
    build(); cards(); clicks();
    if (/^#pricing-/.test(location.hash)) setTimeout(function () { var el = document.getElementById(location.hash.slice(1)); if (el && el.offsetParent !== null) el.scrollIntoView(); }, 150);
    var left = END - Date.now();
    if (!SIM && left > 0 && left < 2147483000) setTimeout(function () { location.reload(); }, left + 500);   // a page left open past the deadline drops the offer by itself
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
