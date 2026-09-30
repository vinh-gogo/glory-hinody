# Active Context — Glory Hinody

> Last updated: 2026-09-30

## Current State
- **Đã hoàn thành xuất bản bài viết kỹ thuật song ngữ về `skills-kmp`**:
  - Bài viết: *"Skills KMP: Đưa Design Patterns Và Nghệ Thuật Refactoring Vào Chiến Trường Kotlin Multiplatform"* ([VI](file:///D:/glory-hinody/content/posts/skills-kmp-architecture-design-patterns.md) & [EN](file:///D:/glory-hinody/content/posts/skills-kmp-architecture-design-patterns.en.md)).
  - Tích hợp 22 Design Patterns và cẩm nang Refactoring Code Smells từ `D:\mainichi-app-v2\docs` vào repository `https://github.com/vinh-gogo/skills-kmp`.
  - Giọng văn kỹ thuật dí dỏm, thực chiến, không lý thuyết suông, đầy đủ Mermaid diagrams và code mẫu Kotlin.
  - Build: **63 trang VI + 62 trang EN (Tổng 125 pages), 0 warnings, 0 errors** ✅

1. **Nâng cấp toàn diện tương tác cho các tag REACTION, COMMENTS, SHARES:**
   - **REACTION (Like):** Chuyển đổi thành nút tương tác thời gian thực, lưu trạng thái thích vào `localStorage` (`glory_user_likes_v1`), kích hoạt hiệu ứng tim đập neon (`heartPop`) và cập nhật số lượng tức thì không cần đăng nhập.
   - **COMMENTS:** Nhấn để cuộn mượt mà trực tiếp xuống `#comments` và kích hoạt hiệu ứng chớp sáng viền (`highlight-flash`) định vị rõ ràng khung bình luận; trên trang danh sách sẽ dẫn thẳng đến bài viết với anchor `#comments`.
   - **SHARES:** Nhấn để kích hoạt Popup/Modal chia sẻ chuyên nghiệp (`#share-modal`): hỗ trợ Facebook, X (Twitter), LinkedIn, Telegram, Sao chép link 1-click có phản hồi toast và Web Share API trên thiết bị di động. Tự động cộng dồn lượt chia sẻ vào bộ đếm thống kê.
   - Đồng bộ hóa các tag trên cả trang danh sách (`layouts/list.html`) lẫn đầu bài viết (`layouts/partials/post_meta.html`).
2. **Điều hướng UX: Di chuyển Discussion & Reaction Callout lên phía trên bên trái:**
   - Tạo `layouts/_default/single.html` ghi đè template single của PaperMod.
   - Di chuyển khối thông báo `// DISCUSSIONS & REACTION [GITHUB-POWERED]` lên phía trên bên trái của bài viết.
3. **Bài viết kỹ thuật mới `skills-kmp`:**
   - Hoàn thành bài viết song ngữ KMP Design Patterns & Refactoring (125 pages).
