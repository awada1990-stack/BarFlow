/* BarFlow launch offer FEWCM - one shared file for every page.
   Until 15 Nov 2026 23:59 Amman time (UTC+3): banner on top, struck-through prices + "-30% - FEWCM" badge on the two discounted plans,
   FEWCM added to their checkout (buy.html), GoatCounter events. After that moment nothing is shown and nothing is added:
   the page looks exactly as without the offer (no banner, no strikethrough). Change the three constants below for a new offer. */
(function () {
  var CODE = 'FEWCM';
  var END = Date.parse('2026-11-15T23:59:59+03:00');
  var PLANS = { bundle: { old: '$55', now: '$38.50' }, starter: { old: '$35', now: '$24.50' } };   // the ONLY two plans the code works for
  var active = Date.now() < END;
  window.BF_PROMO = { active: active, code: CODE, end: END, plans: PLANS };
  if (!active) return;

  function lang() { return ((document.documentElement.lang || 'en').slice(0, 2) === 'ar') ? 'ar' : 'en'; }
  function ev(name, tries) {
    try { if (window.goatcounter && window.goatcounter.count) { window.goatcounter.count({ event: true, path: name, title: name }); return; } } catch (e) {}
    if ((tries || 0) < 40) setTimeout(function () { ev(name, (tries || 0) + 1); }, 250);     // count.js loads async: retry for ~10 s
  }
  var TXT = {
    en: 'Launch offer: 30% off the bundles with code <b class="bfp-code">' + CODE + '</b> &mdash; until 15 Nov',
    ar: 'عرض الإطلاق: خصم 30% على الباقات بالكود <b class="bfp-code">' + CODE + '</b> &mdash; حتى 15 نوفمبر'
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
      var badge = document.createElement('span'); badge.className = 'bfp-badge'; badge.setAttribute('dir', 'ltr'); badge.textContent = '-30% · ' + CODE;     // dir=ltr keeps "-30% - FEWCM" in this order on the Arabic page
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
    if (left > 0 && left < 2147483000) setTimeout(function () { location.reload(); }, left + 500);   // a page left open past the deadline drops the offer by itself
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
