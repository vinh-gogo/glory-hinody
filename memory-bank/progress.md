# Progress — Glory Hinody

> Last updated: 2026-09-30

## ✅ What Works

### Core Site
- [x] Hugo build: 55 pages, 0 warnings, 0 errors
- [x] Cloudflare Pages deployment từ `main`
- [x] PaperMod theme với local overrides
- [x] Dark/light mode toggle
- [x] KaTeX math rendering (SRI protected)
- [x] Mermaid diagrams (securityLevel: antiscript, SRI protected)
- [x] Giscus comments
- [x] RSS feed (fixed deprecated LanguageCode)
- [x] OpenGraph (fixed deprecated LanguageCode)

### Security System
- [x] HTTP security headers via `_headers` (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- [x] Attack path blocking via `_redirects` (20+ paths)
- [x] Client-side DOM guard `security-guard.js` v3
  - Per-page CSP counter (không tích luỹ cross-page)
  - Google Translate whitelist (không false alarm)
  - Script injection detection
  - Clickjacking protection
- [x] SRI hashes cho tất cả CDN resources
- [x] `security.txt` RFC 9116
- [x] `robots.txt`

### Language Switching
- [x] Cookie + reload mechanism (PR #7, pending merge)
- [x] Google Translate banner hoàn toàn ẩn (CSS + JS)
- [x] Body.top reset qua MutationObserver
- [x] State persist: cookie (30 ngày) + localStorage
- [x] Button active state cập nhật đúng
- [x] Toast notification khi switch

## ⏳ Pending (Cần Merge)
- [ ] **PR #7** — Language switcher cookie+reload fix (OPEN, chưa merge)

## 🚧 Known Issues / Limitations
1. **`'unsafe-inline'` trong CSP** — bắt buộc vì Google Translate dùng inline handlers. Không thể xoá nếu muốn giữ translate.
2. **`unsafe: true` goldmark** — bắt buộc cho KaTeX. Chấp nhận được vì solo blog.
3. **Google Translate font/style CDN** — không có SRI (Google không cung cấp hash ổn định). Đã whitelist trong CSP.
4. **Cloudflare _headers chỉ apply trên production** — local `hugo server` không apply security headers.

## 📋 Backlog (Optional Improvements)
- [ ] Self-host KaTeX fonts (xoá dependency CDN hoàn toàn)
- [ ] CSP `report-uri` endpoint qua Cloudflare Workers (violation telemetry)
- [ ] Refactor Google Translate integration để xoá `'unsafe-inline'` khỏi CSP
- [ ] A/B test SecurityHeaders.com sau deploy PR #7 (target: A grade)
- [ ] Mozilla Observatory scan (target: 80+/100)

## 📊 Build Metrics
```
Pages:            55
Static files:     33
Aliases:          19
Build time:       ~120ms
Warnings:         0
Errors:           0
```

## 🔀 PR History
| PR | Status | Content |
|---|---|---|
| #4 | MERGED | Security layer 1+2: _headers, _redirects, security-guard v1, SRI, Mermaid XSS fix, robots, security.txt |
| #5 | MERGED | Fix Google Translate CSP conflict + translate banner suppress |
| #6 | MERGED | security-guard v3: per-page counter, fix false alarm |
| #7 | OPEN | Language switcher rewrite: cookie+reload, fix infinite reload bug |
