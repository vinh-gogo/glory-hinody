# Active Context — Glory Hinody

> Last updated: 2026-09-30

## Current State
- **Hoàn thành chuyển đổi kiến trúc i18n theo chuẩn Payload CMS / Static Multilingual**:
  - Gỡ bỏ hoàn toàn Google Translate widget, xóa bỏ mọi CSS/JS hack ẩn banner, MutationObserver và cookie `googtrans`.
  - Thiết lập Hugo native multilingual: Tiếng Việt tại root `/`, Tiếng Anh tại `/en/`.
  - Tạo toàn bộ nội dung Tiếng Anh song ngữ cho 8 bài viết, trang Giới thiệu, Tìm kiếm và 404.
  - Bộ nút chuyển VI / EN trên Header hoạt động bằng pure HTML `<a>` link trực tiếp đến trang tương ứng, 0ms latency, không dùng JavaScript.
  - Build: **56 trang VI + 55 trang EN (Tổng 111 pages), 0 warnings, 0 errors** ✅

## Recent Changes (Session này)
1. **Kiến trúc Payload CMS i18n:**
   - Cấu hình `languages: vi, en` trong `hugo.yaml` (dùng chuẩn mới `locale` & `label` thay deprecated `languageCode`/`languageName`).
   - Cập nhật `layouts/partials/header.html` với logic routing đa ngôn ngữ tự động qua `.Translations`.
   - Dọn sạch `layouts/partials/extend_footer.html` (xoá bỏ hơn 200 dòng JS Google Translate, polling và MutationObserver).
   - Dọn sạch `assets/css/extended/custom.css` (xoá bỏ toàn bộ selectors ẩn banner, fix body.top, toast notification).
   - Thắt chặt `static/_headers`: loại bỏ hoàn toàn các domain `translate.google.com` và `translate.googleapis.com` khỏi CSP.
   - Thêm 11 file Markdown tiếng Anh (`.en.md`) cho toàn bộ site.
- `localStorage('user_lang')` persist indefinitely (sync với cookie state)
