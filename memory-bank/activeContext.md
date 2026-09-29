# Active Context — Glory Hinody

> Last updated: 2026-09-30

## Current State
- Branch `dev` có commits mới chưa merge (PR #7 open)
- Security system hoàn chỉnh, language switcher đã fix dứt điểm
- Build: **55 pages, 0 warnings, 0 errors** ✅

## Recent Changes (Session này)

### Security Hardening (PR #4 — MERGED)
- `static/_headers`: CSP, HSTS, X-Frame-Options, Permissions-Policy
- `static/_redirects`: Block 20+ attack paths
- `static/js/security-guard.js`: Runtime DOM guard
- `extend_head.html`: Security meta + SRI KaTeX CSS
- `extend_footer.html`: Load security-guard first, SRI Mermaid/KaTeX

### Security Round 2 (PR #4 — MERGED)
- Mermaid: `securityLevel: 'loose'` → `'antiscript'`
- SRI sha384 hashes thật cho cả 4 CDN resources
- `static/robots.txt`, `static/.well-known/security.txt`
- Override `opengraph.html` + `rss.xml` — fix deprecated `.Language.LanguageCode`

### Translate Conflict Fix (PR #5 — MERGED)
- CSP: thêm `translate.googleapis.com` vào `style-src` + `frame-src`
- `security-guard.js` v2: `isTranslateHost()`, `isTranslateElement()`

### Translate Banner + Page Navigation (PR #5 — MERGED)
- CSS: selector bao quát `[class*="VIpgJd-ZVi9od"]`, `body.translated-ltr`
- JS: `MutationObserver` thay `setInterval`, `suppressBanner()` tại 0/800/1500ms

### Security Guard v3 (PR #6 — MERGED)
- CSP counter: in-memory `_pageCSPCount` thay sessionStorage
- Threshold: 8 violations/page, không tích luỹ cross-page
- Xoá `__sg_v1`, `__sg_v2` cũ

### Language Switcher Rewrite (PR #7 — OPEN)
- **Cơ chế mới:** Cookie + reload (loại bỏ poll `.goog-te-combo`)
- `watchBodyTop()`: chỉ fix `body.top`, KHÔNG gọi `suppressBanner` trong MO
- Xoá `applyEnglish()`, `pollTimer`, mọi phụ thuộc vào internal Google Translate DOM

## Active Decisions
- PR #7 chưa merge → cần review và merge để deploy translate fix lên production
- `.clinerules` và `memory-bank/` vừa được tạo trong session này

## Next Steps
1. **Merge PR #7** → deploy language switcher fix
2. **Test** trên https://glory-hinody.pages.dev:
   - Đổi VI → EN → trang dịch, không có banner đỏ
   - Duyệt nhiều trang trong EN → state persist, không reload loop
   - Không có SECURITY ALERT banner
3. **Optional improvements:**
   - Self-host KaTeX/Mermaid fonts (eliminate CDN dependency)
   - CSP `report-uri` via Cloudflare Workers
   - Refactor inline `onclick=` để xoá `'unsafe-inline'`

## Considerations
- Google Translate `autoDisplay: false` đã set → không tự mở toolbar
- Cookie `googtrans` expire 30 ngày
- `localStorage('user_lang')` persist indefinitely (sync với cookie state)
