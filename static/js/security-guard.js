/**
 * glory-hinody — Security & Integrity Guard v3
 * Fix: CSP violation counter reset mỗi page load — không tích luỹ cross-page.
 * Banner chỉ trigger khi phát hiện DOM injection thật sự, không phải CSP count.
 */
(function SecurityGuard() {
  'use strict';

  /* ══════════════════════════════════════════════════════════
   * 1. CONSTANTS
   * ════════════════════════════════════════════════════════ */
  var TRUSTED_HOSTS = [
    'glory-hinody.pages.dev',
    'cdn.jsdelivr.net',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'giscus.app',
    'static.cloudflareinsights.com',
    'cloudflareinsights.com',
    'www.googletagmanager.com',
    'www.google-analytics.com',
    'analytics.google.com',
    'translate.google.com',
    'translate.googleapis.com',
    'www.gstatic.com',
    'ssl.gstatic.com',
    'apis.google.com'
  ];

  var TRANSLATE_HOSTS = [
    'translate.google.com',
    'translate.googleapis.com',
    'www.gstatic.com',
    'ssl.gstatic.com'
  ];

  var TRANSLATE_MARKERS = ['goog-te-', 'skiptranslate', 'goog-', 'VIpgJd-'];

  /* Key riêng cho page hiện tại — reset mỗi page load */
  var PAGE_KEY  = '__sg_page';
  /* Key cho log session dài hạn (chỉ để xem, không trigger banner) */
  var LOG_KEY   = '__sg_log';

  /* ── Đếm CSP violation trong page hiện tại (in-memory, reset khi navigate) */
  var _pageCSPCount = 0;
  /* Ngưỡng CSP violation trên 1 page để hiện banner */
  var CSP_PAGE_THRESHOLD = 8;

  /* ══════════════════════════════════════════════════════════
   * 2. HELPERS
   * ════════════════════════════════════════════════════════ */
  function isHostTrusted(url) {
    if (!url) return true;
    if (/^(chrome-extension|moz-extension|safari-extension):\/\//.test(url)) return true;
    try {
      var host = new URL(url, location.origin).hostname;
      for (var i = 0; i < TRUSTED_HOSTS.length; i++) {
        if (host === TRUSTED_HOSTS[i] || host.endsWith('.' + TRUSTED_HOSTS[i])) return true;
      }
      return false;
    } catch(e) { return true; }
  }

  function isTranslateHost(url) {
    if (!url || url === 'inline' || url === 'eval' || url === 'data' || url === '') return true;
    try {
      var host = new URL(url, location.origin).hostname;
      for (var i = 0; i < TRANSLATE_HOSTS.length; i++) {
        if (host === TRANSLATE_HOSTS[i] || host.endsWith('.' + TRANSLATE_HOSTS[i])) return true;
      }
      return false;
    } catch(e) { return false; }
  }

  function isTranslateElement(node) {
    if (!node) return false;
    var id  = node.id || '';
    var cls = (node.className && typeof node.className === 'string') ? node.className : '';
    for (var i = 0; i < TRANSLATE_MARKERS.length; i++) {
      if (id.indexOf(TRANSLATE_MARKERS[i])  !== -1) return true;
      if (cls.indexOf(TRANSLATE_MARKERS[i]) !== -1) return true;
    }
    try {
      if (node.closest && (node.closest('#google_translate_element') || node.closest('.skiptranslate'))) return true;
    } catch(e) {}
    return false;
  }

  /* ══════════════════════════════════════════════════════════
   * 3. LOGGING — chỉ để debug, không trigger banner
   * ════════════════════════════════════════════════════════ */
  function logOnly(type, detail) {
    try {
      var log = JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]');
      log.push({ type: type, detail: detail, ts: Date.now(), url: location.pathname });
      if (log.length > 100) log = log.slice(-100);
      sessionStorage.setItem(LOG_KEY, JSON.stringify(log));
    } catch(e) {}
    if (typeof console !== 'undefined' && console.info) {
      console.info('[SecurityGuard]', type, '|', detail);
    }
  }

  /* ══════════════════════════════════════════════════════════
   * 4. BANNER (VÔ HIỆU HÓA HOÀN TOÀN)
   *    Lý do: Không bao giờ hiển thị banner cảnh báo làm gián đoạn
   *    trải nghiệm độc giả trên blog tĩnh. Mọi phát hiện chỉ log nội bộ.
   * ════════════════════════════════════════════════════════ */
  function showSecurityBanner(reason) {
    return;
  }

  /* ══════════════════════════════════════════════════════════
   * 5. DOM INTEGRITY MONITOR
   *    Bỏ qua Google Translate. Banner khi phát hiện inject thật.
   * ════════════════════════════════════════════════════════ */
  function startDOMMonitor() {
    if (typeof MutationObserver === 'undefined') return;
    new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes && m.addedNodes.forEach(function(node) {
          if (!node || node.nodeType !== 1) return;
          if (isTranslateElement(node)) return;

          /* Script từ domain lạ → NGUY HIỂM THẬT → banner */
          if (node.tagName === 'SCRIPT') {
            var src = node.src || '';
            if (src && !isHostTrusted(src)) {
              logOnly('UNTRUSTED_SCRIPT', src);
              showSecurityBanner('script-injection');
              return;
            }
            /* Inline script có dấu hiệu tấn công rõ ràng */
            if (!src && node.textContent) {
              if (/eval\s*\(|atob\s*\(|document\.write\s*\(|unescape\s*\(/.test(node.textContent)) {
                logOnly('MALICIOUS_INLINE_SCRIPT', node.textContent.substring(0, 80));
                showSecurityBanner('malicious-inline-script');
              }
            }
          }

          /* Iframe từ domain lạ */
          if (node.tagName === 'IFRAME') {
            var iframeSrc = node.src || '';
            if (iframeSrc && !isHostTrusted(iframeSrc)) {
              logOnly('UNTRUSTED_IFRAME', iframeSrc);
            }
          }

          /* Script/style từ IP address */
          var resourceUrl = node.src || node.href || '';
          if (resourceUrl && /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(resourceUrl)) {
            logOnly('IP_BASED_RESOURCE', resourceUrl.substring(0, 100));
            showSecurityBanner('ip-resource-detected');
          }
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ══════════════════════════════════════════════════════════
   * 6. CLICKJACKING DETECT
   * ════════════════════════════════════════════════════════ */
  function checkFraming() {
    try {
      if (window.self !== window.top) {
        var parentHost = '';
        try { parentHost = window.parent.location.hostname; } catch(e) {}
        if (!parentHost || !isHostTrusted('https://' + parentHost)) {
          logOnly('CLICKJACKING_ATTEMPT', parentHost || 'cross-origin frame');
          window.top.location = window.self.location;
        }
      }
    } catch(e) {
      /* Cross-origin — có thể là Google Translate frame, chỉ log */
      logOnly('FRAMED_CROSS_ORIGIN', 'cross-origin parent');
    }
  }

  /* ══════════════════════════════════════════════════════════
   * 7. CSP VIOLATION LISTENER
   *    - Bỏ qua hoàn toàn: translate hosts, inline, eval, data
   *    - Đếm trong bộ nhớ (in-memory, reset khi navigate)
   *    - Banner chỉ khi >= CSP_PAGE_THRESHOLD trên CÙNG 1 PAGE
   *    - KHÔNG tích luỹ qua sessionStorage nữa
   * ════════════════════════════════════════════════════════ */
  function listenCSPViolations() {
    document.addEventListener('securitypolicyviolation', function(e) {
      var blocked   = e.blockedURI   || '';
      var directive = e.violatedDirective || '';
      var source    = e.sourceFile   || '';

      /* Bỏ qua: translate domains, inline, eval, data, chrome-extension, about, rỗng */
      if (isTranslateHost(blocked)) return;
      if (!blocked || blocked === '' || blocked === 'about') return;
      if (/^(chrome-extension|moz-extension|safari-extension):\/\//.test(blocked)) return;
      if (source && isTranslateHost(source)) return;

      /* ── Chỉ LOG, KHÔNG bao giờ hiển thị banner từ CSP violations ──
       * Lý do: CSP đã block content ở browser level rồi.
       * Banner từ CSP chỉ gây false alarm cho user bình thường.
       * Violations từ Giscus, Fonts, Translate vẫn slip qua filter
       * dù đã whitelist → banner unreliable, hại nhiều hơn lợi.
       * Tấn công thật được phát hiện qua DOM monitor (script inject).
       * ────────────────────────────────────────────────────────── */
      _pageCSPCount++;
      logOnly('CSP_VIOLATION', blocked + ' [' + directive + '] src=' + source);
      /* Không gọi showSecurityBanner() từ đây */
    });
  }


  /* ══════════════════════════════════════════════════════════
   * 8. HTML INTEGRITY CHECK
   * ════════════════════════════════════════════════════════ */
  function checkHTMLIntegrity() {
    var checks = [
      { sel: 'header.header',           label: 'header' },
      { sel: 'footer',                  label: 'footer' },
      { sel: 'main#main-content, main', label: 'main-content' }
    ];
    checks.forEach(function(c) {
      if (!document.querySelector(c.sel)) {
        logOnly('DOM_INTEGRITY', 'Missing: ' + c.label);
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
   * 9. CONSOLE OVERRIDE GUARD
   * ════════════════════════════════════════════════════════ */
  function monitorConsoleOverride() {
    var origWarn  = console.warn;
    var origError = console.error;
    Object.defineProperty(console, 'warn',  {
      get: function() { return origWarn; },
      set: function() { logOnly('CONSOLE_OVERRIDE', 'console.warn replaced'); },
      configurable: true
    });
    Object.defineProperty(console, 'error', {
      get: function() { return origError; },
      set: function() { logOnly('CONSOLE_OVERRIDE', 'console.error replaced'); },
      configurable: true
    });
  }

  /* ══════════════════════════════════════════════════════════
   * 10. OPEN REDIRECT GUARD (log only)
   * ════════════════════════════════════════════════════════ */
  function guardNavigation() {
    document.addEventListener('click', function(e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('/') || href.startsWith('mailto:')) return;
      try {
        var destHost = new URL(href).hostname;
        if (!isHostTrusted('https://' + destHost)) {
          logOnly('EXTERNAL_NAV', href.substring(0, 200));
        }
      } catch(ex) {}
    }, true);
  }

  /* ══════════════════════════════════════════════════════════
   * INIT
   * ════════════════════════════════════════════════════════ */
  /* Xoá session storage cũ (nếu có từ v1/v2) để tránh false alarm */
  try {
    sessionStorage.removeItem('__sg_v1');
    sessionStorage.removeItem('__sg_v2');
    sessionStorage.removeItem('__sg_page');
  } catch(e) {}

  checkFraming();
  listenCSPViolations();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      startDOMMonitor();
      guardNavigation();
      checkHTMLIntegrity();
    });
  } else {
    startDOMMonitor();
    guardNavigation();
    checkHTMLIntegrity();
  }

  window.addEventListener('load', monitorConsoleOverride);

})();
