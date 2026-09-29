# Product Context — Glory Hinody

## Why This Project Exists
Blog kỹ thuật cá nhân của vinh-gogo. Ghi chép hành trình học AI/ML, LangGraph, engineering.  
Phong cách: editorial confidence, không AI-generic, typographical discipline.

## Problems It Solves
- Lưu trữ và chia sẻ kiến thức kỹ thuật
- Showcase portfolio engineering
- Học bằng cách viết (learning by documenting)

## How It Should Work
1. **Đọc bài** → nhanh, sạch, không distraction
2. **Đổi ngôn ngữ** → click VI/EN → toast notification → reload → Google Translate apply
3. **Xem diagram** → Mermaid render inline, dark/light mode aware
4. **Math** → KaTeX render LaTeX inline và display
5. **Comment** → Giscus (GitHub Discussions), no login wall
6. **Security** → transparent với reader, hoàn toàn tự động

## User Experience Goals
- **Speed:** Static, CDN-cached, < 200ms TTFB
- **Visual:** Dark/light toggle, JetBrains Mono + Plus Jakarta Sans
- **Bilingual UX:** Nút VI/EN ở header, state persist qua cookie + localStorage
- **Mobile:** Responsive, header không overflow
- **No distraction:** Google Translate toolbar KHÔNG hiện (ẩn hoàn toàn qua CSS + JS)
- **Trust signals:** HTTPS, security headers (A+ grade mục tiêu)

## Author Info
- Email: lea26462@gmail.com
- Contact cho security issues: `/.well-known/security.txt` (RFC 9116)
