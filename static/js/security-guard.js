/**
 * glory-hinody — Security & Integrity Guard
 * Lớp tự bảo vệ client-side: phát hiện & ứng phó khi site bị xâm hại.
 * Deploy: static/js/security-guard.js
 *
 * v2 — Fix false positive với Google Translate:
 *  - Nhận diện và bỏ qua các element do Google Translate inject
 *  - CSP violation từ translate.googleapis.com không kích hoạt banner
 *  - Inline script từ Google Translate không bị flag
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
    'translate.google.com',
    'translate.googleapis.com',
    'www.gstatic.com',
    'ssl.gstatic.com',
    'apis.google.com'
  ];

  /* Các domain của Google Translate — inject hợp lệ, không phải tấn công */
  var TRANSLATE_HOSTS = [
    'translate.google.com',
    'translate.googleapis.com',
    'www.gstatic.com',
    'ssl.gstatic.com'
  ];

  /* Nhận diện element do Google Translate tạo ra */
  var TRANSLATE_MARKERS = [
    'goog-te-', 'skiptranslate', 'goog-', 'VIpgJd-'
  ];

  var STORAGE_KEY = '__sg_v2';

  /* ══════════════════════════════════════════════════════════
   * 2. HELPERS
   * ════════════════════════════════════════════════════════ */
  function isHostTrusted(url) {
    try {
      var host = new URL(url, location.origin).hostname;
      for (var i = 0; i < TRUSTED_HOSTS.length; i++) {
        if (host === TRUSTED_HOSTS[i] || host.endsWith('.' + TRUSTED_HOSTS[i])) return true;
      }
      return false;
    } catch(e) { return true; } // relative URL → trusted
  }

  function isTranslateHost(url) {
    try {
      var host = new URL(url, location.origin).hostname;
      for (var i = 0; i < TRANSLATE_HOSTS.length; i++) {
        if (host === TRANSLATE_HOSTS[i] || host.endsWith('.' + TRANSLATE_HOSTS[i])) return true;
      }
      return false;
    } catch(e) { return false; }
  }

  /* Kiểm tra element có phải do Google Translate inject không */
  function isTranslateElement(node) {
    if (!node) return false;
    var id = node.id || '';
    var cls = (node.className && typeof node.className === 'string') ? node.className : '';

    for (var i = 0; i < TRANSLATE_MARKERS.length; i++) {
      if (id.indexOf(TRANSLATE_MARKERS[i]) !== -1) return true;
      if (cls.indexOf(TRANSLATE_MARKERS[i]) !== -1) return true;
    }
    // Element nằm trong container của Google Translate
    if (node.closest) {
      if (node.closest('#google_translate_element')) return true;
      if (node.closest('.skiptranslate')) return true;
    }
    return false;
  }

  /* ══════════════════════════════════════════════════════════
   * 3. VIOLATION TRACKER
   * ════════════════════════════════════════════════════════ */
  function getViolations() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e) { return []; }
  }
  function logViolation(type, detail) {
    try {
      var v = getViolations();
      v.push({ type: type, detail: detail, ts: Date.now(), url: location.href });
      if (v.length > 50) v = v.slice(-50);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    } catch(e) {}
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[SecurityGuard]', type, '|', detail);
    }
  }

  /* ══════════════════════════════════════════════════════════
   * 4. DOM INTEGRITY MONITOR
   *    Chỉ flag element thực sự lạ — bỏ qua Google Translate
   * ════════════════════════════════════════════════════════ */
  var domObserver = null;
  function startDOMMonitor() {
    if (typeof MutationObserver === 'undefined') return;
    domObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes && m.addedNodes.forEach(function(node) {
          if (!node || node.nodeType !== 1) return;

          // ── Bỏ qua mọi element của Google Translate ──────
          if (isTranslateElement(node)) return;

          // ── Script từ domain không tin cậy ───────────────
          if (node.tagName === 'SCRIPT') {
            var src = node.src || '';
            if (src && !isHostTrusted(src)) {
              logViolation('UNTRUSTED_SCRIPT', src);
              showSecurityBanner('script-injection');
            }
            // Inline script: CHỈ flag nếu không phải translate context
            // và có dấu hiệu độc hại rõ ràng (eval, atob, document.write...)
            if (!src && node.textContent) {
              var txt = node.textContent;
              var isMalicious = /eval\s*\(|document\.write\s*\(|atob\s*\(|unescape\s*\(/.test(txt);
              if (isMalicious) {
                logViolation('SUSPICIOUS_INLINE_SCRIPT', txt.substring(0, 120));
              }
            }
          }

          // ── Iframe từ domain lạ ───────────────────────────
          if (node.tagName === 'IFRAME') {
            var iframeSrc = node.src || '';
            // Bỏ qua iframe rỗng (Google Translate dùng) và trusted hosts
            if (iframeSrc && !isHostTrusted(iframeSrc)) {
              logViolation('UNTRUSTED_IFRAME', iframeSrc);
            }
          }

          // ── Stylesheet từ domain lạ ───────────────────────
          if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
            var href = node.href || '';
            if (href && !isHostTrusted(href)) {
              logViolation('UNTRUSTED_STYLESHEET', href);
            }
          }
        });
      });
    });
    domObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  /* ══════════════════════════════════════════════════════════
   * 5. CLICKJACKING DETECT
   * ════════════════════════════════════════════════════════ */
  function checkFraming() {
    try {
      if (window.self !== window.top) {
        var parentHost = '';
        try { parentHost = window.parent.location.hostname; } catch(e) {}
        if (!parentHost || !isHostTrusted('https://' + parentHost)) {
          logViolation('CLICKJACKING_ATTEMPT', parentHost || 'cross-origin frame');
          window.top.location = window.self.location;
        }
      }
    } catch(e) {
      // Cross-origin frame — phân biệt Google Translate frame và clickjack thật
      // Google Translate inject frame của chính nó → bỏ qua
      // (không thể đọc parent.location vì cross-origin, nhưng cũng không auto-escape)
      logViolation('FRAMED_CROSS_ORIGIN', 'unknown parent — may be translate frame');
    }
  }

  /* ══════════════════════════════════════════════════════════
   * 6. OPEN REDIRECT GUARD
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
          logViolation('EXTERNAL_NAV', href.substring(0, 200));
        }
      } catch(e) {}
    }, true);
  }

  /* ══════════════════════════════════════════════════════════
   * 7. SECURITY BANNER
   * ════════════════════════════════════════════════════════ */
  function showSecurityBanner(reason) {
    if (document.getElementById('sg-alert-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'sg-alert-banner';
    banner.setAttribute('style', [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:2147483647',
      'background:#b91c1c', 'color:#fff', 'font-family:monospace',
      'font-size:13px', 'padding:10px 16px', 'text-align:center',
      'border-bottom:2px solid #7f1d1d', 'letter-spacing:0.05em'
    ].join(';'));
    banner.innerHTML =
      '<strong>[SECURITY ALERT]</strong> Phát hiện hành vi bất thường trên trang này (' +
      reason + '). Hãy xóa cache và tải lại trang. ' +
      '<button onclick="this.parentElement.remove()" style="margin-left:12px;background:#7f1d1d;' +
      'color:#fff;border:1px solid #fff;padding:2px 8px;cursor:pointer;font-family:monospace">' +
      '[Đóng]</button>';
    document.body ? document.body.prepend(banner) :
      document.addEventListener('DOMContentLoaded', function() {
        document.body && document.body.prepend(banner);
      });
  }

  /* ══════════════════════════════════════════════════════════
   * 8. CSP VIOLATION LISTENER
   *    Lọc: vi phạm từ Google Translate không kích hoạt banner
   * ════════════════════════════════════════════════════════ */
  function listenCSPViolations() {
    document.addEventListener('securitypolicyviolation', function(e) {
      var blocked = e.blockedURI || '';
      var directive = e.violatedDirective || '';

      // Bỏ qua CSP violation từ Google Translate — đây là hành vi bình thường
      // khi translate inject stylesheet/frame từ translate.googleapis.com
      if (isTranslateHost(blocked)) {
        console.info('[SecurityGuard] CSP from translate (ignored):', blocked, directive);
        return;
      }

      // Bỏ qua "inline" violation — do các script inline hợp lệ (unsafe-inline)
      // thỉnh thoảng browser vẫn report
      if (blocked === 'inline' || blocked === 'eval') {
        return;
      }

      logViolation('CSP_VIOLATION', blocked + ' [' + directive + ']');

      // Chỉ hiển thị banner nếu có 3+ vi phạm thực sự (không phải translate)
      var realViolations = getViolations().filter(function(v) {
        return v.type === 'CSP_VIOLATION';
      });
      if (realViolations.length >= 3) {
        showSecurityBanner('csp-violation×' + realViolations.length);
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
   * 9. HTML INTEGRITY SELF-CHECK
   * ════════════════════════════════════════════════════════ */
  function checkHTMLIntegrity() {
    var checks = [
      { sel: 'header.header',          label: 'header' },
      { sel: 'footer',                 label: 'footer' },
      { sel: 'main#main-content,main', label: 'main-content' },
    ];
    checks.forEach(function(c) {
      if (!document.querySelector(c.sel)) {
        logViolation('DOM_INTEGRITY', 'Missing element: ' + c.label);
      }
    });

    // Kiểm tra script/style từ IP address (không phải domain)
    document.querySelectorAll('script[src],link[href]').forEach(function(el) {
      var url = el.src || el.href || '';
      if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
        logViolation('IP_BASED_RESOURCE', url.substring(0, 100));
        showSecurityBanner('ip-resource-detected');
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
   * 10. CONSOLE OVERRIDE GUARD
   * ════════════════════════════════════════════════════════ */
  function monitorConsoleOverride() {
    var origWarn  = console.warn;
    var origError = console.error;
    Object.defineProperty(console, 'warn', {
      get: function() { return origWarn; },
      set: function() { logViolation('CONSOLE_OVERRIDE', 'console.warn replaced'); },
      configurable: true
    });
    Object.defineProperty(console, 'error', {
      get: function() { return origError; },
      set: function() { logViolation('CONSOLE_OVERRIDE', 'console.error replaced'); },
      configurable: true
    });
  }

  /* ══════════════════════════════════════════════════════════
   * 11. VIOLATION REPORT
   * ════════════════════════════════════════════════════════ */
  function reportViolations() {
    var v = getViolations();
    if (v.length === 0) return;
    if (typeof console !== 'undefined' && console.info) {
      console.info('[SecurityGuard] Session violations:', v.length, v);
    }
  }

  /* ══════════════════════════════════════════════════════════
   * INIT
   * ════════════════════════════════════════════════════════ */
  checkFraming();
  listenCSPViolations();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      startDOMMonitor();
      guardNavigation();
      checkHTMLIntegrity();
      reportViolations();
    });
  } else {
    startDOMMonitor();
    guardNavigation();
    checkHTMLIntegrity();
    reportViolations();
  }

  window.addEventListener('load', function() {
    monitorConsoleOverride();
    reportViolations();
  });

})();
