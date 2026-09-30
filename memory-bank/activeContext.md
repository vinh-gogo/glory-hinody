# Active Context — Glory Hinody

> Last updated: 2026-09-30

## Current State
- **Đã hoàn thành xuất bản bài viết kỹ thuật song ngữ về `skills-kmp`**:
  - Bài viết: *"Skills KMP: Đưa Design Patterns Và Nghệ Thuật Refactoring Vào Chiến Trường Kotlin Multiplatform"* ([VI](file:///D:/glory-hinody/content/posts/skills-kmp-architecture-design-patterns.md) & [EN](file:///D:/glory-hinody/content/posts/skills-kmp-architecture-design-patterns.en.md)).
  - Tích hợp 22 Design Patterns và cẩm nang Refactoring Code Smells từ `D:\mainichi-app-v2\docs` vào repository `https://github.com/vinh-gogo/skills-kmp`.
  - Giọng văn kỹ thuật dí dỏm, thực chiến, không lý thuyết suông, đầy đủ Mermaid diagrams và code mẫu Kotlin.
  - Build: **63 trang VI + 62 trang EN (Tổng 125 pages), 0 warnings, 0 errors** ✅

## Recent Changes (Session này)
1. **Bài viết kỹ thuật mới `skills-kmp`:**
   - Tạo `content/posts/skills-kmp-architecture-design-patterns.md` (Bản Tiếng Việt).
   - Tạo `content/posts/skills-kmp-architecture-design-patterns.en.md` (Bản Tiếng Anh tương thích 1:1).
   - Thiết lập date `2026-09-30T09:30:00+07:00` để render ngay lập tức trên Hugo.
   - Kiểm tra đường dẫn chéo VI/EN: `<link rel="alternate">` và nút chuyển ngôn ngữ hoạt động 100% không dùng JS.
2. **Kiến trúc Payload CMS i18n & Bảo mật:**
   - Hệ thống i18n native route (`/` cho VI, `/en/` cho EN) ổn định.
   - Neutralize hoàn toàn false alert từ security guard banner.
