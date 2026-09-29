/**
 * glory-hinody — Security & Integrity Guard
 * Lớp tự bảo vệ client-side: phát hiện & ứng phó khi site bị xâm hại.
 * Deploy: static/js/security-guard.js
 */
(function SecurityGuard() {
  'use strict';

  /* ══════════════════════════════════════════════════════════
   * 1. CONSTANTS
   * ════════════════════════════════════════════════════════ */
  var SITE_ORIGIN   = 'https://glory-hinody.pages.dev';
  var TRUSTED_HOSTS = [
    'glory-hinody.pages.dev',
    'cdn.jsdelivr.net',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'giscus.app',
    'translate.google.com',
    'translate.googleapis.com',
    'www.gstatic.com'
  ];
  var STORAGE_KEY = '__sg_v1';
  var MAX_VIOLATIONS = 5;   // số vi phạm tối đa trước khi cảnh báo

  /* ══════════════════════════════════════════════════════════
   * 2. VIOLATION TRACKER
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

    // Console cảnh báo rõ ràng
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[SecurityGuard]', type, '|', detail);
    }
  }

  /* ══════════════════════════════════════════════════════════
   * 3. DOM INTEGRITY MONITOR
   *    Theo dõi thêm <script>/<link> ngoài whitelist sau khi load
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

  var domObserver = null;
  function startDOMMonitor() {
    if (typeof MutationObserver === 'undefined') return;
    domObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes && m.addedNodes.forEach(function(node) {
          if (!node || node.nodeType !== 1) return;

          // Script injected không có integrity
          if (node.tagName === 'SCRIPT') {
            var src = node.src || '';
            if (src && !isHostTrusted(src)) {
              logViolation('UNTRUSTED_SCRIPT', src);
              showSecurityBanner('script-injection');
            }
            // Inline script thêm sau DOMContentLoaded (heuristic)
            if (!src && node.textContent && node.textContent.length > 50) {
              logViolation('INLINE_SCRIPT_INJECTED', node.textContent.substring(0, 100));
            }
          }

          // Iframe không mong đợi
          if (node.tagName === 'IFRAME') {
            var iframeSrc = node.src || '';
            if (iframeSrc && !isHostTrusted(iframeSrc)) {
              logViolation('UNTRUSTED_IFRAME', iframeSrc);
            }
          }

          // Link/stylesheet lạ
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
   * 4. CLICKJACKING DETECT
   *    Phát hiện nếu trang bị nhúng trong iframe của bên thứ 3
   * ════════════════════════════════════════════════════════ */
  function checkFraming() {
    try {
      if (window.self !== window.top) {
        var parentHost = '';
        try { parentHost = window.parent.location.hostname; } catch(e) {}
        if (!parentHost || !isHostTrusted('https://' + parentHost)) {
          logViolation('CLICKJACKING_ATTEMPT', parentHost || 'cross-origin frame');
          // Thoát ra khỏi iframe nếu bị nhúng trái phép
          window.top.location = window.self.location;
        }
      }
    } catch(e) {
      // Cross-origin — có thể là clickjack
      logViolation('FRAMED_CROSS_ORIGIN', 'unknown parent');
      try { window.top.location.replace(window.self.location.href); } catch(ex) {}
    }
  }

  /* ══════════════════════════════════════════════════════════
   * 5. DEVTOOLS TAMPER DETECTION (heuristic nhẹ)
   *    Không block devtools (legitimate use), chỉ log bất thường
   * ════════════════════════════════════════════════════════ */
  function monitorConsoleOverride() {
    var origWarn  = console.warn;
    var origError = console.error;
    // Phát hiện nếu ai đó override console để giấu lỗi
    Object.defineProperty(console, 'warn', {
      get: function() { return origWarn; },
      set: function(v) {
        logViolation('CONSOLE_OVERRIDE', 'console.warn replaced');
      },
      configurable: true
    });
    Object.defineProperty(console, 'error', {
      get: function() { return origError; },
      set: function(v) {
        logViolation('CONSOLE_OVERRIDE', 'console.error replaced');
      },
      configurable: true
    });
  }

  /* ══════════════════════════════════════════════════════════
   * 6. OPEN REDIRECT / URL MANIPULATION GUARD
   *    Chặn window.location bị override bởi script lạ
   * ════════════════════════════════════════════════════════ */
  function guardNavigation() {
    // Bắt click ra domain lạ không mong đợi
    document.addEventListener('click', function(e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('/') || href.startsWith('mailto:')) return;

      try {
        var destHost = new URL(href).hostname;
        if (!isHostTrusted('https://' + destHost)) {
          // Chỉ log, không block (UX-safe)
          logViolation('EXTERNAL_NAV', href.substring(0, 200));
        }
      } catch(e) {}
    }, true);
  }

  /* ══════════════════════════════════════════════════════════
   * 7. SECURITY BANNER (hiển thị khi phát hiện xâm hại)
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
   * 8. CSP VIOLATION LISTENER (nếu browser hỗ trợ)
   * ════════════════════════════════════════════════════════ */
  function listenCSPViolations() {
    document.addEventListener('securitypolicyviolation', function(e) {
      logViolation('CSP_VIOLATION', e.blockedURI + ' [' + e.violatedDirective + ']');
      // Nếu quá nhiều vi phạm CSP → khả năng bị inject
      var violations = getViolations().filter(function(v) { return v.type === 'CSP_VIOLATION'; });
      if (violations.length >= 3) {
        showSecurityBanner('csp-violation×' + violations.length);
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
   * 9. INTEGRITY SELF-CHECK (kiểm tra HTML không bị thay đổi)
   * ════════════════════════════════════════════════════════ */
  function checkHTMLIntegrity() {
    // Kiểm tra xem các phần quan trọng có còn nguyên không
    var checks = [
      { sel: 'header.header',         label: 'header' },
      { sel: 'footer',                label: 'footer' },
      { sel: 'main#main-content,main', label: 'main-content' },
    ];
    checks.forEach(function(c) {
      if (!document.querySelector(c.sel)) {
        logViolation('DOM_INTEGRITY', 'Missing element: ' + c.label);
      }
    });

    // Kiểm tra xem có link/script trỏ về IP lạ không
    document.querySelectorAll('script[src],link[href]').forEach(function(el) {
      var url = el.src || el.href || '';
      // IP address pattern (không phải domain)
      if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
        logViolation('IP_BASED_RESOURCE', url.substring(0, 100));
        showSecurityBanner('ip-resource-detected');
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
   * 10. VIOLATION REPORT ENDPOINT (ghi log về Cloudflare Analytics / console)
   *     Trong tương lai có thể gửi về Workers endpoint
   * ════════════════════════════════════════════════════════ */
  function reportViolations() {
    var v = getViolations();
    if (v.length === 0) return;
    // Hiện tại: chỉ log tổng hợp vào console để dev check
    if (typeof console !== 'undefined' && console.info) {
      console.info('[SecurityGuard] Session violations:', v.length, v);
    }
  }

  /* ══════════════════════════════════════════════════════════
   * INIT
   * ════════════════════════════════════════════════════════ */
  // Chạy ngay lập tức (trước DOMContentLoaded)
  checkFraming();
  listenCSPViolations();

  // Chạy sau DOMContentLoaded
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

  // Chạy console guard sau khi mọi script đã load
  window.addEventListener('load', function() {
    monitorConsoleOverride();
    reportViolations();
  });

})();
