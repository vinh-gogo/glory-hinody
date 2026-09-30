# Progress — Glory Hinody

> Last updated: 2026-09-30

## ✅ What Works

### Core Site
- [x] Hugo build: 125 pages (63 VI + 62 EN), 0 warnings, 0 errors
- [x] Cloudflare Pages deployment từ `main`
- [x] PaperMod theme với local overrides
- [x] Dark/light mode toggle
- [x] KaTeX math rendering (SRI protected)
- [x] Mermaid diagrams (securityLevel: antiscript, SRI protected)
- [x] Tương tác Stat Tags: Click Like (thả tim real-time, animation), Click Comments (cuộn mượt + highlight), Click Shares (mở popup chia sẻ đa nền tảng + copy link)
- [x] Giscus comments & reactions (callout thông báo đưa lên phía trên bên trái bài viết + quick jump link)
- [x] RSS feed (fixed deprecated LanguageCode)
- [x] OpenGraph (fixed deprecated LanguageCode)
- [x] Bài viết mới: `skills-kmp` kiến trúc KMP, 22 Design Patterns & Refactoring (VI + EN)

### Security System
- [x] HTTP security headers via `_headers` (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- [x] Attack path blocking via `_redirects` (20+ paths)
- [x] Client-side DOM guard `security-guard.js` v3 (đã trung hòa alert banner thừa)
- [x] SRI hashes cho tất cả CDN resources
- [x] `security.txt` RFC 9116
- [x] `robots.txt`

### Language Switching (Native Hugo / Payload CMS Pattern)
- [x] Routing đa ngôn ngữ chuẩn static: Tiếng Việt tại `/`, Tiếng Anh tại `/en/`
- [x] Pure HTML navigation không phụ thuộc JavaScript hay cookies
- [x] Hỗ trợ song ngữ 100% tất cả các bài viết và trang hệ thống
- [x] Cập nhật `<link rel="alternate">` phục vụ SEO tối ưu

## ⏳ Pending (Cần Merge)
- [ ] Merge branch `dev` vào `main` để kích hoạt Cloudflare Pages build bài viết mới

## 🚧 Known Issues / Limitations
1. **`unsafe: true` goldmark** — bắt buộc cho KaTeX math formulas.
2. **Cloudflare _headers chỉ apply trên production** — local `hugo server` không apply security headers.

## 📋 Backlog (Optional Improvements)
- [ ] Self-host KaTeX fonts (xoá dependency CDN hoàn toàn)
- [ ] CSP `report-uri` endpoint qua Cloudflare Workers (violation telemetry)
- [ ] Mozilla Observatory scan (target: 80+/100)

## 📊 Build Metrics
```
Pages:            125 (63 VI + 62 EN)
Static files:     34
Aliases:          23 VI / 22 EN
Build time:       ~770ms
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
