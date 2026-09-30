# Active Context — Glory Hinody

> Last updated: 2026-09-30

## Current State
- **Đã hoàn thành xuất bản bài viết kỹ thuật song ngữ về `skills-kmp`**:
  - Bài viết: *"Skills KMP: Đưa Design Patterns Và Nghệ Thuật Refactoring Vào Chiến Trường Kotlin Multiplatform"* ([VI](file:///D:/glory-hinody/content/posts/skills-kmp-architecture-design-patterns.md) & [EN](file:///D:/glory-hinody/content/posts/skills-kmp-architecture-design-patterns.en.md)).
  - Tích hợp 22 Design Patterns và cẩm nang Refactoring Code Smells từ `D:\mainichi-app-v2\docs` vào repository `https://github.com/vinh-gogo/skills-kmp`.
  - Giọng văn kỹ thuật dí dỏm, thực chiến, không lý thuyết suông, đầy đủ Mermaid diagrams và code mẫu Kotlin.
  - Build: **63 trang VI + 62 trang EN (Tổng 125 pages), 0 warnings, 0 errors** ✅

1. **Điều hướng UX: Di chuyển Discussion & Reaction Callout lên phía trên bên trái:**
   - Tạo `layouts/_default/single.html` ghi đè template single của PaperMod.
   - Di chuyển khối thông báo `// DISCUSSIONS & REACTION [GITHUB-POWERED]` lên phía trên bên trái của bài viết (bên trong `header.post-header`, ngay dưới metadata).
   - Thêm nút cuộn mượt `[XUỐNG PHẦN BÌNH LUẬN ↓]` / `[JUMP TO COMMENTS ↓]` trỏ tới `#comments`.
   - Nâng cấp `stat-likes` và `stat-comments` trong `layouts/partials/post_meta.html` thành liên kết nhảy nhanh xuống Giscus container.
   - Thêm styling `post-discussion-callout` trong `custom.css` bám phong cách terminal cyberpunk.
   - Tối ưu hóa Giscus data-lang (`en` cho EN, `vi` cho VI).
2. **Bài viết kỹ thuật mới `skills-kmp`:**
   - Tạo `content/posts/skills-kmp-architecture-design-patterns.md` (Bản Tiếng Việt).
   - Tạo `content/posts/skills-kmp-architecture-design-patterns.en.md` (Bản Tiếng Anh tương thích 1:1).
   - Build 125 pages song ngữ, 0 warnings, 0 errors.
