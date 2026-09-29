# System Patterns — Glory Hinody

## Architecture
```
Hugo Static Site
├── Content (Markdown)
├── Theme: PaperMod (git submodule — READ ONLY)
├── layouts/ (local overrides — EDIT HERE)
│   ├── partials/
│   │   ├── extend_head.html     ← security meta, KaTeX CSS + SRI
│   │   ├── extend_footer.html   ← security-guard, translate, mermaid, katex
│   │   ├── extend_post_content.html
│   │   ├── header.html          ← lang switcher buttons
│   │   └── templates/
│   │       └── opengraph.html   ← override theme (fix LanguageCode deprecation)
│   └── rss.xml                  ← override theme (fix LanguageCode deprecation)
├── static/
│   ├── _headers                 ← Cloudflare Pages HTTP headers
│   ├── _redirects               ← Cloudflare Pages attack path blocks
│   ├── js/
│   │   ├── security-guard.js    ← client-side DOM integrity guard v3
│   │   └── blog-stats.js        ← likes/comments/shares via localStorage
│   ├── .well-known/security.txt ← RFC 9116 responsible disclosure
│   └── robots.txt
└── assets/css/extended/custom.css ← all custom styles
```

## Key Technical Decisions

### 1. Theme Override Pattern
**NEVER edit** `themes/PaperMod/`. Always override in `layouts/`.
Hugo lookup order: `layouts/` → `themes/PaperMod/layouts/`
- Partials: `layouts/partials/<name>.html`
- Templates (with underscore prefix): `layouts/partials/templates/<name>.html`
- Top-level templates: `layouts/<name>.xml`

### 2. Language Switching: Cookie + Reload
**Decision:** Dùng `googtrans` cookie + `location.reload()` thay vì poll `.goog-te-combo`

**Lý do (đã học qua bug):**
- Poll `.goog-te-combo` → fail khi MutationObserver che iframe → reload loop vô hạn
- Cookie approach: Google Translate tự đọc cookie khi load → 100% reliable
- `watchBodyTop()` MutationObserver chỉ fix `body.top`, KHÔNG gọi `suppressBanner`

```javascript
// ✅ ĐÚNG
window.switchLanguage = function(lang) {
  if (lang === 'en') { setGoogCookie('/vi/en'); location.reload(); }
  else               { clearGoogCookie(); location.reload(); }
};

// ❌ SAI — gây infinite reload
function applyEnglish() {
  setInterval(() => { if (!select) location.reload(); }, 100); // BUG!
}
```

### 3. Security Guard: Per-Page Counter
**Decision:** CSP violation count là in-memory (`_pageCSPCount`), reset khi navigate.
**Lý do:** sessionStorage tích luỹ cross-page → false alarm banner sau 15+ pages.
Banner chỉ trigger từ DOM injection thật (script lạ, eval/atob, IP resource).

### 4. Google Translate Whitelist
**Hosts tin cậy:** `translate.google.com`, `translate.googleapis.com`, `www.gstatic.com`, `ssl.gstatic.com`
**Element markers:** `goog-te-*`, `skiptranslate`, `VIpgJd-*`
- CSP violations từ translate hosts → bỏ qua (không đếm)
- DOM elements từ translate → bỏ qua (không flag)
- `suppressBanner()` dùng JS inline style để ẩn, CSS dùng selector pattern

### 5. CSP: unsafe-inline Required
`'unsafe-inline'` trong `script-src` là bắt buộc vì Google Translate dùng inline `onclick`.
Không thể xoá mà không refactor toàn bộ translate integration.

### 6. SRI (Subresource Integrity)
Tất cả CDN resources có `integrity=sha384-...` và `crossorigin="anonymous"`:
- KaTeX CSS, JS, auto-render (v0.16.11)
- Mermaid (v11)

## Component Relationships
```
extend_head.html
  └── loads KaTeX CSS (SRI)
  └── security meta tags
  └── robots meta (noindex cho 404/search)

extend_footer.html
  ├── security-guard.js (sync, FIRST)
  ├── blog-stats.js (defer)
  ├── Mermaid (conditional, SRI)
  ├── KaTeX JS + auto-render (conditional, SRI)
  └── Google Translate widget + switchLanguage()

static/_headers → Cloudflare Edge (CSP, HSTS, etc.)
static/_redirects → Cloudflare Edge (block attack paths)
static/js/security-guard.js → Browser runtime
```

## Design Patterns
- **Override not fork:** Mọi thay đổi theme qua `layouts/`, không bao giờ sửa `themes/`
- **Security defense-in-depth:** Edge (Cloudflare) → HTML headers → JS runtime → CSS
- **Fail safe:** suppressBanner không throw, try/catch mọi DOM operation
- **Progressive enhancement:** Features degrade gracefully nếu JS disable
