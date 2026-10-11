# UI/UX Redesign Plan — Glory Hinody

> Mục tiêu: nâng cấp giao diện đẹp hơn, dễ dùng hơn trên **mobile lẫn desktop**, học theo cách tổ chức UI của https://glory-tiktok.pages.dev/ nhưng **giữ bản sắc riêng** của Glory Hinody (technical logbook, accent indigo, song ngữ VI/EN).
>
> **Trạng thái:** các quyết định thiết kế đã chốt — xem §9 (comments dưới bài, accent indigo, bỏ phong cách terminal, tab bar 4 mục, tính năng tuỳ chọn để sau).
>
> Phạm vi: chỉ override trong `layouts/`, `assets/css/extended/`, `static/js/`, `hugo.yaml`, `i18n/`. **Không sửa `themes/PaperMod`.**

---

## 1. Học được gì từ glory-tiktok.pages.dev

Site tham khảo cũng là Hugo + PaperMod, nhưng được thiết kế **mobile-first** (người dùng vào từ TikTok trên điện thoại). Phân tích HTML/CSS của trang chủ, trang `/words/attorney/` và `/glossary/`:

| # | Pattern | Cách site tham khảo làm | Giá trị UX |
|---|---|---|---|
| 1 | **Bottom tab bar trên mobile** | `<nav class="tabbar">` cố định đáy, 4–5 tab (icon 20px + label 0.72rem), `aria-current="page"` tô màu accent. Ẩn hoàn toàn từ `min-width:768px`. Header menu ngang bị ẩn trên mobile. | Điều hướng bằng ngón cái, luôn thấy, không phải cuộn menu ngang |
| 2 | **Design tokens rõ ràng** | `--tap:44px`, `--r:12px`, `--tabbar-h:58px`, `--accent`, `--accent-soft`, bộ màu semantic theo cấp độ (`--band-*`) | Nhất quán, dễ đổi theme |
| 3 | **Tap target ≥ 44px** | `.btn`, input, `summary`, `.crumb a` đều `min-height:var(--tap)`; chip nhỏ nhất 36px | Bấm không trượt trên mobile |
| 4 | **Hero hướng hành động** | Tiêu đề 1 câu + mô tả + **ô tìm kiếm pill lớn** ngay đầu trang | Người dùng làm được việc chính trong 1 thao tác |
| 5 | **"Pillars" — lối vào chính** | Lưới 2 cột (mobile) → 4 cột (≥768px), mỗi ô: icon + tên + số lượng ("4090 từ") | Hiểu nội dung site trong 2 giây |
| 6 | **Chips làm bộ lọc / nhãn** | Pill bo tròn, trạng thái chọn = `aria-current/pressed` + nền `accent-soft` + chữ đậm; kèm số đếm | Lọc dễ, nhìn gọn, không cần chữ mono viết hoa |
| 7 | **Card danh sách đơn giản** | Viền 1px + bo 12px, hover đổi viền sang accent, 1 cột → 2 cột ≥768px | Quét nhanh, không nặng trang trí |
| 8 | **Phân cấp chữ cho nội dung học** | `word-lemma` 2rem → 2.4rem, IPA font riêng, section `h2` 1.1rem, ví dụ có `border-left` accent + nền `accent-soft` | Trang đọc có nhịp, dễ quét |
| 9 | **Progressive disclosure** | `<details class="fold">` cho bộ lọc, `summary` cao 44px | Giảm rối trên màn nhỏ |
| 10 | **Safe-area & viewport hiện đại** | `env(safe-area-inset-bottom)`, `100dvh`, `viewport-fit=cover`, padding đáy chừa chỗ cho tab bar, nút "lên đầu trang" đẩy lên trên tab bar | Không bị che bởi notch / thanh điều hướng iOS |
| 11 | **Prev/Next ở cuối trang** | `.word-nav` 2 nút pill 48%/48% | Đọc liên tục |
| 12 | **A11y cơ bản** | `:focus-visible` outline 3px accent, `prefers-reduced-motion`, `aria-label` cho nav, `enterkeyhint=search` | Dùng được bằng bàn phím & trợ năng |
| 13 | **Chống FOUC theme** | Script inline đặt `data-theme` trước khi render | Không nháy sáng/tối |
| 14 | **Hiệu năng** | Font hệ thống, không web-font, JS tối thiểu (`ui.min.js`, `search.min.js`) | Tải nhanh trên 4G |

> **Lưu ý:** mình chỉ đọc được HTML/CSS (chưa xem render thực tế). Trước khi code nên mở site tham khảo trên điện thoại + desktop để đối chiếu cảm giác (spacing, animation).

---

## 2. Audit giao diện hiện tại (Glory Hinody)

Dựa trên [`custom.css`](file:///D:/glory-hinody/assets/css/extended/custom.css) (2275 dòng), [`header.html`](file:///D:/glory-hinody/layouts/partials/header.html), [`list.html`](file:///D:/glory-hinody/layouts/list.html), [`single.html`](file:///D:/glory-hinody/layouts/_default/single.html), [`footer.html`](file:///D:/glory-hinody/layouts/partials/footer.html), [`home_info.html`](file:///D:/glory-hinody/layouts/partials/home_info.html).

### 2.1 Vấn đề UX / mobile

| ID | Vấn đề | Vị trí | Mức |
|---|---|---|---|
| M1 | Header mobile **xếp 2 hàng** (brand+controls rồi menu cuộn ngang), sticky nên chiếm ~100px màn hình; menu ngang dễ bị bỏ sót mục cuối | `custom.css` ~L292-321, `header.html` | Cao |
| M2 | Bộ lọc chủ đề: chữ mono 0.76rem, padding `4px 8px` → cao ~26px, **dưới chuẩn 44px** | `custom.css` L503-552 | Cao |
| M3 | Nút Like / Comment / Share trong card: icon 13px, chữ 0.72rem, nằm trong pill nhỏ; đồng thời có `.entry-link` phủ toàn card → dễ bấm nhầm | `list.html` L105-114, `custom.css` L649-700 | Cao |
| M4 | Rất nhiều chữ **mono + UPPERCASE + ký hiệu `//`, `[ ]`** ở nav, meta, nút, footer → khó đọc với người mới, khó dịch (Google Translate không còn dùng nhưng EN/VI vẫn phải sửa 2 nơi) | toàn site | Trung bình |
| M5 | Cỡ chữ nhỏ: 0.68–0.76rem xuất hiện nhiều (≈11–12px) | meta, stats, footer | Trung bình |
| M6 | Không có điều hướng đáy; người dùng phải cuộn lên đầu mới đổi mục | — | Trung bình |
| M7 | Nút "lên đầu trang" (`.top-link`) cố định `bottom` không tính tab bar/safe-area | `footer.html` L68-74 | Thấp (sẽ thành cao khi thêm tab bar) |
| M8 | Comments (Giscus) nằm **dưới cùng** trên mobile → phải cuộn rất xa; không có nút nhảy nhanh | `single.html`, `custom.css` L1162-1188 | Trung bình |
| M9 | Không thấy tín hiệu tiến độ đọc / mục lục thu gọn cho bài dài (nhiều bài có Mermaid, bảng, code) | `single.html` | Trung bình |

### 2.2 Vấn đề desktop

| ID | Vấn đề | Mức |
|---|---|---|
| D1 | `--max-width: 860px` cho cả header, list lẫn bài → màn 1440px+ để trống 2 bên; danh sách bài chỉ 1 cột dài | Trung bình |
| D2 | Trang bài có comments: sidebar trái 350px **sticky** đẩy nội dung bài sang phải; mắt đọc bị kéo sang trái trước khi tới bài. Chiều rộng bài còn ≤860px nhưng toàn bố cục rộng 1320px, cân đối kém | Trung bình |
| D3 | Không có mục lục dạng rail cố định cho bài dài (TOC của PaperMod nằm inline đầu bài) | Trung bình |
| D4 | Hero trang chủ là "hồ sơ cá nhân" (tên, role, chip công nghệ) — không có lối vào nội dung (search / chủ đề / bài mới) | Trung bình |
| D5 | Không có hover/focus states nhất quán cho keyboard (`:focus-visible` chưa thấy được định nghĩa toàn cục) | Trung bình |

### 2.3 Vấn đề kỹ thuật / bảo trì

| ID | Vấn đề |
|---|---|
| T1 | `list.html` **hardcode** các tag & đường dẫn `/posts/`, `/tags/...` → bản EN (`/en/...`) bị link sai ngôn ngữ; nhãn "Lọc chuyên mục", "ĐỌC BÀI VIẾT" hardcode tiếng Việt |
| T2 | `custom.css` 1 file 2275 dòng, ~50 `!important`, có khối "Backward Compatibility", mục trùng (`Homepage Hero` + `Editorial Hero`) → khó sửa, dễ regress |
| T3 | Màu light/dark định nghĩa cả `:root` lẫn `:root[data-theme]` + 2 khối `prefers-color-scheme` cho icon theme → logic trùng |
| T4 | Footer có "SYSTEM: OPERATIONAL / CLOUDFLARE PAGES" (trang trí, không phải thông tin hữu ích), 3 cột link → nặng trên mobile |
| T5 | 3 font Google (Space Grotesk + Plus Jakarta Sans + JetBrains Mono) × nhiều weight → tải chậm; cần xác nhận subset `vietnamese` |
| T6 | Nhiều chuỗi i18n nằm rải trong template thay vì `i18n/*.yaml` |

---

## 3. Định hướng thiết kế

**Nguyên tắc:** *Editorial, sạch, ưu tiên đọc & thao tác.* Giữ nền tối/sáng hiện có, font display Space Grotesk và logo "VH"; **đổi accent sang indigo** và **bỏ hẳn phong cách terminal** (`~/`, `//`, `[ ]`, UPPERCASE, "SYSTEM: OPERATIONAL"…).

| Quyết định | Chọn | Lý do |
|---|---|---|
| Màu thương hiệu | **Đổi** acid-lime → indigo (dark `#a5b4fc` / light `#4f46e5`, xem §3.3) | Theo yêu cầu; hợp blog công nghệ AI, khác site tham khảo (cyan) |
| Điều hướng mobile | **Bottom tab bar 4 tab** (Trang chủ · Bài viết · Tìm kiếm · Tác giả); header chỉ còn logo + theme + ngôn ngữ (1 hàng, 56px) | Học pattern #1; Chủ đề chuyển thành chip lọc |
| Điều hướng desktop | Header menu dạng **pill** (Bài viết · Chủ đề · Tìm · Tác giả) có trạng thái active rõ, ẩn tab bar từ `≥768px` | Giống site tham khảo, quen thuộc |
| Chữ mono | **Chỉ dùng** cho code và (nếu cần) con số kỹ thuật; **không** dùng cho nav, nút, tag, eyebrow. Mọi nhãn dùng font body, sentence-case | Dễ đọc, dễ dịch, bỏ chất terminal |
| Bo góc | Card 12px, chip/nút pill 999px, ô nhập pill | Đồng bộ pattern #2, #6 |
| Cỡ chữ tối thiểu | **13px** cho meta, 12px chỉ cho badge cực ngắn | Giảm M5 |
| Tap target | **≥44px** cho mọi nút/link chính; chip ≥36px có khoảng cách ≥8px | M2, M3 |
| Bố cục bài viết | Cột đọc **~720px** (65–75 ký tự/dòng), nền sáng/tối tương phản AA | Dễ đọc |

### 3.1 Design tokens (đề xuất thêm vào `00-tokens.css`)

```css
:root {
  /* Kích thước thao tác */
  --tap: 44px;
  --tap-sm: 36px;

  /* Bo góc */
  --r: 12px;
  --r-sm: 8px;
  --r-pill: 999px;

  /* Layout */
  --container: 1120px;        /* header, home, list (desktop) */
  --reading: 720px;           /* cột nội dung bài */
  --header-h: 56px;           /* mobile; desktop 64px */
  --tabbar-h: 60px;
  --safe-b: env(safe-area-inset-bottom, 0px);

  /* Thang chữ (mobile → desktop dùng clamp) */
  --fs-xs: 0.8125rem;   /* 13px meta */
  --fs-sm: 0.875rem;
  --fs-base: 1rem;
  --fs-lg: 1.125rem;
  --fs-h1: clamp(1.75rem, 1.3rem + 2vw, 2.75rem);
  --fs-h2: clamp(1.3rem, 1.1rem + 1vw, 1.75rem);

  /* Khoảng cách (4pt) */
  --s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px; --s5: 24px; --s6: 32px; --s7: 48px;

  /* Chuyển động */
  --ease: cubic-bezier(.16, 1, .3, 1);
  --dur: .18s;
}

@media (min-width: 768px) { :root { --header-h: 64px; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
}
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; border-radius: 4px; }
```

Tên biến màu hiện có (`--accent`, `--panel`, `--line`, …) giữ nguyên để không vỡ code cũ; chỉ đổi giá trị accent (xem §3.3) và thêm `--accent-soft` (= `--accent-dim`), `--accent-hover`.

### 3.2 Breakpoints

| Tên | Khoảng | Hành vi chính |
|---|---|---|
| Phone | `< 480px` | 1 cột, tab bar, hero gọn, stats chỉ icon + số |
| Phone lớn | `480–767px` | 1 cột, tab bar |
| Tablet | `768–1099px` | Ẩn tab bar, header menu pill, list 2 cột |
| Desktop | `≥ 1100px` | Container 1120px, bài viết + TOC rail phải |
| Wide | `≥ 1400px` | Giữ container, tăng khoảng thở (không kéo giãn nội dung) |

### 3.3 Bảng màu mới — Indigo/Violet (thay acid-lime)

| Biến | Dark | Light | Ghi chú |
|---|---|---|---|
| `--accent` | `#a5b4fc` | `#4f46e5` | Link, active, viền hover, chip active |
| `--accent-hover` (mới) | `#c7d2fe` | `#4338ca` | Hover nút/link |
| `--accent-contrast` | `#0b0d1a` | `#ffffff` | Chữ trên nền accent (nút "Tìm", CTA) |
| `--accent-dim` (= `--accent-soft`) | `rgba(165,180,252,.14)` | `rgba(79,70,229,.08)` | Nền chip active, blockquote, ví dụ |
| Lưới nền `body::before` | `rgba(165,180,252,.03)` | (không dùng) | Thay cho lime `rgba(200,240,73,.018)` |

Nền/chữ/viền (`--bg`, `--panel`, `--text`, `--muted`, `--line`) **giữ nguyên** để thay đổi tập trung ở accent. Tỉ lệ tương phản ước tính: `#a5b4fc` trên `#090b0e` ≈ 10:1; `#4f46e5` trên `#fafaf8` ≈ 6:1 — đều đạt AA, vẫn phải đo lại bằng công cụ ở Phase 5.1.

**Việc phải làm khi đổi màu:**
- Thay mọi giá trị cứng của lime/green: `#c8f049`, `#15803d`, `rgba(200, 240, 73, …)`, `rgba(21, 128, 61, …)` trong `custom.css` (các khối hero, filter, stat-count, share, footer…), SVG và JS (`blog-stats.js` nếu có màu inline) → dùng `var(--accent)`/`var(--accent-dim)`.
- Màu Like (đỏ `#ef4444`) và icon mặt trời `#fbbf24` giữ nguyên (ý nghĩa ngữ nghĩa); icon mặt trăng light mode hiện `#4f46e5` đã trùng indigo — giữ.
- `<meta name="theme-color">` (hiện lấy từ PaperMod) → đặt đúng `--bg` cho dark/light.
- Logo "VH" (viền + nền accent) tự đổi theo biến; kiểm tra favicon/OG image (`og-default.png` được tham chiếu trong `extend_head.html`) nếu có màu lime thì tạo lại.
- Cập nhật `memory-bank/` (`productContext.md`, `systemPatterns.md`) cho khớp nhận diện mới sau khi hoàn tất.

---

## 4. Wireframe (ASCII)

### 4.1 Mobile (<768px)

```
┌───────────────────────────────┐
│ [VH] Glory Hinody   ☀  VI|EN │  ← header 1 hàng, 56px, sticky
├───────────────────────────────┤
│ Technical logbook về AI       │
│ Generative AI · On-device ·   │
│ Agentic RAG                   │
│ ┌───────────────────────┐ ┌─┐ │
│ │ 🔍 Tìm bài, chủ đề…   │ │Tìm│ │  ← search pill 44px
│ └───────────────────────┘ └─┘ │
│ ┌──────────┐ ┌──────────┐     │
│ │ ▤ Bài viết│ │ # Chủ đề │     │  ← "pillars" 2 cột + số lượng
│ │  12 bài   │ │  18 thẻ  │     │
│ └──────────┘ └──────────┘     │
│ Chủ đề  ‹ Tất cả │ GenAI │ …› │  ← chips cuộn ngang, 36–40px
│ ┌─────────────────────────┐   │
│ │ 30/09/2026 · 8 phút đọc │   │
│ │ Tiêu đề bài (2–3 dòng)  │   │
│ │ Mô tả 2 dòng…           │   │
│ │ (genai) (rag)    ♡ 💬 ↗ │   │  ← actions 44px
│ └─────────────────────────┘   │
│            …                  │
├───────────────────────────────┤
│   ⌂        ▤        🔍     👤  │  ← tab bar 4 mục, 60px + safe-area
│ Trang chủ Bài viết Tìm  Tác giả│
└───────────────────────────────┘
```

### 4.2 Desktop (≥1100px) — trang bài viết

```
┌──────────────────────────────────────────────────────────────┐
│ [VH] Glory Hinody   (Bài viết)(Chủ đề)(Tìm)(Tác giả)  ☀ VI|EN│
├──────────────────────────────────────────────────────────────┤
│ Trang chủ › Bài viết › …                                     │
│ ┌──────────────── 720px ────────────────┐ ┌── 260px ────────┐│
│ │ Tiêu đề lớn                           │ │ Mục lục (sticky)││
│ │ meta · tags                           │ │ ▸ 1. Giới thiệu ││
│ │ [♡ 12] [💬 3] [↗ Chia sẻ]             │ │ ▸ 2. Kiến trúc  ││
│ │ ───────────────────────────────       │ │ ▸ 3. Kết quả    ││
│ │ nội dung…                             │ │ ▓▓▓▓░░ 42%      ││
│ │ ‹ Bài trước      Bài sau ›            │ └─────────────────┘│
│ │ ── Thảo luận (Giscus) ──              │                    │
│ └───────────────────────────────────────┘                    │
└──────────────────────────────────────────────────────────────┘
```

> Đã chốt: comments nằm **dưới bài**, cột phải dành cho mục lục (xem §9).

---

## 5. Kế hoạch chi tiết theo hạng mục

Ký hiệu: 🔴 ưu tiên cao · 🟡 trung bình · 🟢 thấp. Ước lượng theo giờ làm việc (tham khảo).

### Phase 0 — Chuẩn bị & nền tảng (≈ 3h) 🔴

| Task | File | Chi tiết |
|---|---|---|
| 0.1 Tạo nhánh | git | `git switch -c feat/ui-ux-redesign` (từ `dev`) |
| 0.2 Chụp baseline | — | Screenshot 6 trang × 3 viewport (390, 768, 1440) × 2 theme để so sánh trước/sau; lưu vào `docs/ui-baseline/` (không commit nếu nặng) |
| 0.3 **Tách `custom.css`** thành module | `assets/css/extended/` | PaperMod tự gộp mọi file trong `extended/` theo thứ tự tên. Đề xuất: `00-tokens.css`, `10-base.css`, `20-header-nav.css`, `30-home.css`, `40-list-cards.css`, `50-post.css`, `60-comments-share.css`, `70-search-tags.css`, `80-footer.css`, `90-pages.css` (about/404), `99-utilities.css`. Chỉ **di chuyển** code ở bước này, không đổi hành vi → build, so sánh Pages count = baseline |
| 0.4 Dọn CSS | `custom.css` → modules | Xoá khối "Backward Compatibility", gộp "Hero" trùng, giảm `!important` (chỉ giữ khi đè theme thực sự cần) |
| 0.5 Thêm tokens + focus + reduced-motion | `00-tokens.css` | Theo §3.1 |
| 0.6 i18n hoá chuỗi | `i18n/vi.yaml`, thêm `i18n/en.yaml` | Chuyển các chuỗi hardcode (nav, filter, "Đọc bài viết", footer, tab bar labels, aria-labels) sang `{{ i18n "key" }}`. Kiểm tra `i18n/en.yaml` đã có chưa (hiện chỉ thấy `vi.yaml`) |

**Nghiệm thu Phase 0:** `hugo --minify` = 0 warning/0 error, số trang không đổi (so với baseline), giao diện không đổi về mắt.

### Phase 1 — App shell: header + tab bar + footer (≈ 6h) 🔴

**1.1 Header gọn 1 hàng (M1)** — sửa `layouts/partials/header.html`, `20-header-nav.css`
- Mobile: chỉ `logo | (spacer) | theme | VI/EN`; **ẩn `.menu`** (`display:none`), chiều cao `--header-h` 56px.
- Desktop (`≥768px`): hiện `.menu` dạng pill: `min-height:40px; padding:0 14px; border-radius:999px`; active = nền `--accent-dim` + chữ `--accent` + `font-weight:700` (thay cho gạch chân). Font **body**, 0.95rem, sentence-case.
- Giữ nguyên: logic `.Translations`, `accesskey`, capsule theme/lang (chỉ chỉnh kích thước nút lên 40px trên mobile).
- Thêm `backdrop-filter: saturate(1.2) blur(10px)` + nền `color-mix(in srgb, var(--bg) 85%, transparent)` cho header sticky; viền dưới 1px.

**1.2 Bottom tab bar (M6)** — tạo `layouts/partials/tabbar.html`, gọi trong `baseof.html` sau `<main>`
- **4 mục**: Trang chủ (`/`), Bài viết (`/posts/`), Tìm kiếm (`/search/`), Tác giả (`/about/`) — dùng `relLangURL` + nhãn từ `i18n`. "Chủ đề" không có tab (truy cập qua chip lọc ở Bài viết); menu desktop vẫn giữ mục Chủ đề. Icon SVG inline (Lucide, stroke 2, 20px) — dùng lại phong cách icon đã có ở header. Mỗi tab rộng 25%, mục tiêu bấm ≥ 64×48px.
- `aria-label`, mỗi mục `aria-current="page"` khi active (so sánh `.RelPermalink`/section).
- CSS: fixed bottom, `height: calc(var(--tabbar-h) + var(--safe-b))`, `padding-bottom: var(--safe-b)`, nền `var(--bg)` + viền trên, label `0.72rem` (≥ 11.5px; chấp nhận cho label tab), tab active màu accent + icon đậm nét.
- `@media (min-width:768px){ .tabbar{display:none} }`.
- `.main`: `padding-bottom: calc(var(--tabbar-h) + var(--safe-b) + 24px)` trên mobile.
- `.top-link`: `bottom: calc(var(--tabbar-h) + var(--safe-b) + 12px)` (mobile), `bottom:24px` (desktop). Kích thước 44×44.
- `head.html` (qua `extend_head.html`): đảm bảo `viewport-fit=cover` (PaperMod đã có trong site tham khảo — kiểm tra bản local).

**1.3 Footer tinh gọn (T4)** — sửa `layouts/partials/footer.html`, `80-footer.css`
- Bỏ `footer-status-pill` ("SYSTEM: OPERATIONAL"), badge `[ENGINEERING LOG]`, tiền tố `//` và UPPERCASE ở tiêu đề cột; gộp 3 cột → 2 cột desktop (Điều hướng · Kết nối), mobile: 1 cột dạng danh sách link cao 44px hoặc accordion `<details>`.
- Giữ: brand, mô tả ngắn, © năm, RSS, GitHub, LinkedIn, Email, Source repo.
- Mobile: chừa đáy cho tab bar.

**Nghiệm thu Phase 1:** trên 390px — header ≤ 56px, tab bar hiển thị đúng ở mọi trang, không che nội dung cuối trang, "lên đầu" không đè tab bar; trên ≥768px — không còn tab bar, menu pill hoạt động; chuyển VI↔EN giữ đúng trang tương ứng.

### Phase 2 — Trang chủ & danh sách bài (≈ 7h) 🔴

**2.1 Hero trang chủ hướng hành động (D4)** — `layouts/partials/home_info.html`, `30-home.css`
- Giữ danh tính (tên Lê Quang Vinh, vai trò "AI Engineer") nhưng rút gọn: eyebrow chữ thường dạng nhãn ngắn ("Nhật ký kỹ thuật", không `~/`, không ngoặc `[ ]`) → H1 1–2 dòng (ví dụ: "Technical logbook về AI thực chiến", sentence-case, không UPPERCASE) → mô tả 2 dòng → **ô tìm kiếm pill** (form GET tới `/search/?q=`) → hàng chip công nghệ (`tech-chip` bo pill, 1 hàng cuộn ngang trên mobile).
- Nút phụ "Hồ sơ năng lực" chuyển thành link text/ghost button, không chiếm vai trò CTA chính.
- Văn bản lấy từ `hugo.yaml` (`homeInfoParams`) / i18n, không hardcode trong template.
- Cần nối search: kiểm tra `layouts/search.html`/`fastsearch.js` của PaperMod có đọc tham số `?q=` không; nếu không, thêm script nhỏ trong `static/js/search-prefill.js` (CSP-safe, không inline).

**2.2 "Pillars" — lối vào nhanh** — `home_info.html` hoặc partial mới `home_pillars.html`
- Lưới 2×2 (mobile) → 4 cột (≥768px): **Bài viết (N)**, **Chủ đề (N thẻ)**, **Tìm kiếm**, **Tác giả**. Số lượng lấy từ `len site.RegularPages`, `len site.Taxonomies.tags`.
- Style theo site tham khảo: icon accent 24px, tên đậm, sub 0.85rem, viền 1px + `border-radius: var(--r)`, hover viền accent.

**2.3 Chips chủ đề động (M2, T1)** — `layouts/list.html`, `70-search-tags.css`
- Tạo từ taxonomy thật: lấy top tag theo `.Site.Taxonomies.tags.ByCount` (giới hạn 6–8) thay vì hardcode; link bằng `relLangURL`; nhãn "Tất cả" qua i18n. Chip cuối **"Tất cả chủ đề →"** dẫn tới `/tags/` (vì "Chủ đề" không còn tab riêng ở thanh dưới).
- Chip: `min-height:36px`, padding `0 14px`, `border-radius:999px`, font body 0.9rem; active = `aria-current="true"` + nền `--accent-dim` + viền accent. Kèm số bài (`chip-n`).
- Mobile: một hàng cuộn ngang `scroll-snap-type:x proximity`, có gradient mờ 2 mép để gợi ý còn nội dung; desktop: wrap.

**2.4 Card bài viết (M3, M4, M5)** — `list.html`, `40-list-cards.css`
- Bố cục: meta (ngày · phút đọc) → tiêu đề (`h2` 1.2–1.35rem, tối đa 3 dòng) → mô tả (2–3 dòng, `line-clamp`) → hàng tag (chip nhỏ, tối đa 3 + "+N") → footer actions.
- Bỏ số thứ tự `#01`, dấu `//`, `[tag]`, `MIN READ` viết hoa. Meta dùng dấu chấm giữa: `30/09/2026 · 8 phút đọc` (font body 13px, màu muted). Tag là chip pill thường (không ngoặc vuông).
- **Actions (Like / Comment / Share):** nút icon 20px, vùng bấm 44×44, chỉ hiển thị **icon + số** (ẩn nhãn "REACTION:" …); đặt `z-index` trên `.entry-link`; khoảng cách ≥8px giữa các nút. Giữ nguyên logic `blog-stats.js` (class `stat-btn`, `stat-likes`, `data-url`…) để không phá tương tác.
- Hover/active: nâng `translateY(-2px)` + viền accent (đã có) — thêm `:active{transform:scale(.99)}`; tắt khi `prefers-reduced-motion`.
- Layout: mobile 1 cột; `≥768px` **2 cột** (grid `repeat(2, 1fr)`, gap 16px); bài đầu tiên (mới nhất) **featured** trải 2 cột, tiêu đề lớn hơn (`≥900px`).
- Nút đọc tiếp: "Đọc bài" (i18n, sentence-case) kèm mũi tên `→`.

**2.5 Phân trang** — nút `.pagination a` cao 44px, pill, hiển thị "Trang 2/5".

**Nghiệm thu Phase 2:** không còn tap target < 44px ở trang chủ (kiểm bằng DevTools); bản EN link đúng `/en/...`; chips phản ánh tag thật; Lighthouse Accessibility ≥ 95 trên `/` mobile.

### Phase 3 — Trang bài viết: trải nghiệm đọc (≈ 8h) 🔴

**3.1 Header bài** — `single.html`, `post_meta.html`, `50-post.css`
- Breadcrumb: link cao 44px (mobile) hoặc rút thành nút "‹ Bài viết" như `.crumb` của site tham khảo.
- Tiêu đề `--fs-h1`, mô tả 1.05rem màu muted; meta (ngày · phút đọc · tags) dạng chips nhỏ; bỏ nhãn `// LOG`.
- **Thanh hành động** (Like · Bình luận · Chia sẻ · Ngôn ngữ) gom thành một hàng dưới meta, nút 44px, dùng chung markup/JS với card để tái sử dụng.

**3.2 Typography nội dung (`.post-content`)**
- Cột đọc `max-width: var(--reading)`; body 1.0625rem (17px) mobile → 1.125rem (18px) desktop, `line-height:1.75`.
- Heading `h2/h3` có `scroll-margin-top: calc(var(--header-h) + 16px)`, anchor hiện khi hover/focus (và hiện thường trực trên touch).
- Danh sách, blockquote (border-left accent + nền `accent-soft`, giống `.example` của site tham khảo), inline `code` (nền `--code-bg`, bo 6px).
- Ảnh: `border-radius: var(--r)`, `max-width:100%`, `loading="lazy"`, có figcaption nếu có.

**3.3 Code / bảng / công thức / Mermaid (bài kỹ thuật nặng)**
- Code block: nền `--code-block`, bo `var(--r)`, thanh đầu hiển thị ngôn ngữ + nút copy (PaperMod `ShowCodeCopyButtons` đã bật) — **luôn hiện** nút copy trên touch (hiện chỉ hiện khi hover), kích thước 36×36. Cho phép cuộn ngang với bóng mờ mép.
- Bảng: bọc trong container cuộn ngang (`overflow-x:auto`, `-webkit-overflow-scrolling:touch`), `th` sticky ngang tuỳ chọn; header bảng nền `--panel`. (Render hook `render-table.html` hoặc bọc bằng CSS `display:block; overflow-x:auto` — chọn cách ít rủi ro với KaTeX).
- KaTeX: giữ `overflow-x:auto` cho `.katex-display` (đã có); đảm bảo không đẩy layout ngang trên 390px.
- Mermaid: giữ container hiện có (L1864); thêm hint "Vuốt ngang để xem" khi `scrollWidth > clientWidth` (CSS gradient mép). Zoom khi chạm: hoãn.
- **Không đổi** `unsafe: true`, SRI hash, CSP (xem `.clinerules`).

**3.4 Mục lục (D3, M9)**
- Mobile: TOC dạng `<details class="fold">` thu gọn mặc định dưới meta, `summary` cao 44px, nhãn "Mục lục".
- Desktop `≥1100px`: **TOC rail phải** sticky (`top: calc(var(--header-h)+24px)`, rộng 240–260px) với scroll-spy (IntersectionObserver ~25 dòng JS) tô đậm mục đang đọc.
- Thanh tiến độ đọc: `position:fixed; top:var(--header-h); height:3px; background:var(--accent)`, cập nhật bằng `requestAnimationFrame` (file `static/js/reading-progress.js`, tải `defer`, tôn trọng `prefers-reduced-motion`).
- Triển khai: PaperMod đã render `toc.html`; override `layouts/partials/toc.html` (không sửa theme) để thêm class/markup cần thiết.

**3.5 Cuối bài**
- Prev/Next: 2 nút card/pill (48% mỗi bên) giống `.word-nav`, hiển thị tiêu đề cắt 2 dòng — override `post_nav_links.html` bằng `layouts/partials/post_nav_links.html`.
- "Bài liên quan" (Related Logs Box có sẵn L1599) — giữ, đổi sang card nhỏ 1→2→3 cột.
- Tags cuối bài: chips thống nhất với Phase 2.
- Nút "Báo lỗi / Góp ý" (học theo `Báo lỗi` ở site tham khảo): link tới GitHub issue của repo với `page_url` được điền sẵn (🟡).

**3.6 Bình luận (M8, D2)** — `comments.html`, `60-comments-share.css`, `single.html`
- Mobile: Giscus ở cuối bài, nhưng nút **"💬 Bình luận (N)"** trong thanh hành động cuộn thẳng tới `#comments` (đã có logic + `highlight-flash`).
- Desktop (**đã chốt Phương án A**): bỏ sidebar trái; Giscus nằm dưới bài trong khung cùng cột đọc (720px); cột phải dành cho TOC rail. Xoá `.post-sidebar-left`, `.has-sidebar`, `body.has-comments-sidebar` (custom.css L1020-1188) và markup `<aside>` trong `single.html`; container `.main` trở về `--container`/`--reading` thay vì 1320–1400px.
- Giữ nguyên iframe `giscus-frame` `width:100%`.

**3.7 Chia sẻ (Share modal)** — `60-comments-share.css`, `blog-stats.js`
- Mobile: biến modal thành **bottom sheet** (trượt từ đáy, bo góc trên 16px, có handle kéo, đóng khi chạm nền/ESC, `padding-bottom: var(--safe-b)`); ưu tiên **Web Share API** (đã có) làm nút đầu tiên.
- Desktop: giữ modal giữa màn hình, focus trap, trả focus về nút gọi khi đóng.
- Các nút mạng xã hội cao 44px, lưới 2 cột mobile / 4 cột desktop.

**Nghiệm thu Phase 3:** đọc bài dài trên 390px không có cuộn ngang toàn trang; bảng/code/Mermaid cuộn trong khung; TOC hoạt động (mobile thu gọn, desktop rail + scroll-spy); progress bar mượt; comment jump đúng; share dùng được bằng bàn phím.

### Phase 4 — Tìm kiếm, Chủ đề, About, 404 (≈ 5h) 🟡

**4.1 Trang tìm kiếm** — `search.md` + layout PaperMod (`search.html`) → override `layouts/search.html`; `70-search-tags.css`
- Ô nhập pill `min-height:48px`, icon kính lúp, nút xoá (×); `enterkeyhint="search"`, `autocomplete="off"`, tự động focus trên desktop (không auto-focus trên mobile để khỏi bật bàn phím đột ngột).
- Phím tắt `/` focus ô tìm (đã có `accesskey=/`), hiển thị hint `/` ở desktop.
- Kết quả dạng card (tiêu đề + đoạn trích + tag), bôi đậm từ khớp, điều hướng ↑/↓ + Enter.
- Trạng thái rỗng: gợi ý chip chủ đề phổ biến; trạng thái không có kết quả: thông báo + gợi ý.
- Đọc `?q=` để điền sẵn (liên quan 2.1).

**4.2 Trang Chủ đề (`/tags/`)** — override `layouts/taxonomy.html`/`terms` (kiểm tra thứ tự lookup của Hugo giữa project & theme)
- Lưới chip/card: tên tag + số bài, sắp xếp theo số bài, ô lọc nhanh nhập-để-lọc client-side (JS nhỏ).

**4.3 About** — `layouts/about.html`, `90-pages.css`
- Mobile: avatar + tên + role, các khối (Kỹ năng, Kinh nghiệm, Công bố) dạng card/`details`; nút "Tải CV" nổi bật; chips kỹ năng cuộn.
- Desktop: 2 cột (hồ sơ cố định trái, nội dung phải).

**4.4 404** — `layouts/404.html`
- Số 404 lớn nhẹ nhàng + ô tìm kiếm + 3 bài mới nhất + nút "Về trang chủ".

### Phase 5 — Hoàn thiện: a11y, hiệu năng, dark/light (≈ 5h) 🟡

| Task | Chi tiết |
|---|---|
| 5.1 Contrast | Kiểm tra WCAG AA cho text muted (`#8b949e` trên `#090b0e`, `#5e6875` trên `#fafaf8`), accent indigo (`#a5b4fc` trên nền tối, `#4f46e5` trên nền sáng) và chữ trên nút accent (`--accent-contrast`); tăng `--muted` nếu < 4.5:1 |
| 5.2 Keyboard | Tab-order logic, skip-link "Bỏ qua tới nội dung" (đầu `<body>`), focus-visible nhất quán, đóng modal bằng ESC |
| 5.3 Screen reader | `aria-label` cho nav chính/tab bar/pagination; `aria-live="polite"` cho toast; `aria-pressed` cho nút Like |
| 5.4 ~~Màu theo chủ đề~~ | **Hoãn** (ngoài phạm vi đợt này) |
| 5.5 Font (T5) | Giảm weight không dùng (xác định bằng grep), cân nhắc bỏ 1 trong 3 family; xác nhận `subset=vietnamese` hiển thị đúng dấu; giữ `preconnect` + `display=swap` + cập nhật CSP nếu đổi domain font |
| 5.6 Theme logic (T3) | Gom logic icon theme về `[data-theme]` + 1 fallback `prefers-color-scheme` duy nhất; script đặt theme chạy sớm trong `<head>` để tránh nháy (đã có ở PaperMod) |
| 5.7 Hiệu năng | `loading="lazy"` + `width/height` cho ảnh bài; `decoding="async"`; CSS tổng sau minify mục tiêu < 40KB gzip; JS mới mỗi file < 2KB gzip, `defer`, **không inline** (CSP) |
| 5.8 ~~Print~~ | **Hoãn** (ngoài phạm vi đợt này) |

---

## 6. Danh sách file dự kiến thay đổi

| Loại | File | Hành động |
|---|---|---|
| CSS | `assets/css/extended/custom.css` | **Tách** thành `00-…99-*.css` (xoá file gốc sau khi tách) |
| Layout | `layouts/baseof.html` | Thêm skip-link, gọi `tabbar.html` |
| Partial | `layouts/partials/tabbar.html` | **Mới** |
| Partial | `layouts/partials/header.html` | Gọn 1 hàng, menu pill |
| Partial | `layouts/partials/footer.html` | Tinh gọn |
| Partial | `layouts/partials/home_info.html` | Hero mới + search |
| Partial | `layouts/partials/home_pillars.html` | **Mới** |
| Partial | `layouts/partials/post_meta.html` | Meta chips + thanh hành động |
| Partial | `layouts/partials/toc.html` | Override để hỗ trợ rail/scroll-spy |
| Partial | `layouts/partials/post_nav_links.html` | Override prev/next |
| Layout | `layouts/list.html` | Chips động, card mới, i18n, relLangURL |
| Layout | `layouts/_default/single.html` | Bố cục cột đọc + rail TOC, comments dưới bài (theo quyết định) |
| Layout | `layouts/search.html`, `layouts/taxonomy.html` (hoặc terms) | Override |
| Layout | `layouts/about.html`, `layouts/404.html` | Làm lại bố cục |
| JS | `static/js/reading-progress.js`, `static/js/toc-spy.js`, `static/js/search-prefill.js` | **Mới**, nhỏ, `defer` |
| JS | `static/js/blog-stats.js` | Chỉnh nhẹ: share → bottom sheet, selector nút mới (giữ API cũ) |
| i18n | `i18n/vi.yaml`, `i18n/en.yaml` | Thêm key (kiểm tra `en.yaml` hiện chưa có) |
| Config | `hugo.yaml` | (Nếu cần) thêm mục menu "Trang chủ"; không đổi `unsafe: true` |
| Header | `static/_headers` | Kiểm tra CSP nếu thêm script/font mới |

Không động tới: `themes/PaperMod/**`, `markup.goldmark.renderer.unsafe`, SRI hash KaTeX/Mermaid, `security-guard*.js`.

---

## 7. Ma trận kiểm thử

| Trục | Giá trị |
|---|---|
| Viewport | 360×740 (Android nhỏ), 390×844 (iPhone), 768×1024 (iPad dọc), 1280×800, 1440×900, 1920×1080 |
| Theme | Light · Dark · Auto (đổi theo OS) |
| Ngôn ngữ | VI (`/`) · EN (`/en/`) — kiểm tra mọi link/nhãn |
| Trang | Home · Posts list · Term (`/tags/x/`) · Tags index · Bài ngắn · Bài dài (depth-estimation, nhiều ảnh/bảng) · Bài Mermaid · Bài KaTeX · Search · About · 404 |
| Trình duyệt | Chrome, Safari iOS, Firefox, Edge |
| Hành vi | Like/Comment/Share, đổi theme/ngôn ngữ, chuyển tab, TOC, copy code, bàn phím-only, `prefers-reduced-motion`, 200% zoom |

**Công cụ & ngưỡng:**
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- axe DevTools: 0 lỗi serious/critical.
- Không có cuộn ngang toàn trang ở 360px.
- Core Web Vitals (lab): LCP < 2.5s, CLS < 0.05, INP < 200ms.
- Build: `hugo --minify 2>&1` → Warnings 0, Errors 0 (số trang hiện tại 125 theo `memory-bank/activeContext.md`; cần đối chiếu trước/sau).

---

## 8. Quy trình triển khai & rủi ro

**Quy trình (theo `DEV.GUIDE.md` + `.clinerules`):**
1. Làm trên nhánh `feat/ui-ux-redesign`; commit cục bộ theo từng phase (granular), nhưng **chỉ push 1 lần** khi hoàn tất — tránh tốn quota build Cloudflare Pages.
2. Test bằng `hugo server` (đa thiết bị qua DevTools + thử trên điện thoại thật qua IP LAN); `_headers`/`_redirects` chỉ có tác dụng trên production nên kiểm CSP bằng bản preview của Cloudflare.
3. `hugo --gc --minify` → 0 lỗi → mở PR `dev → main` bằng `--body-file`.
4. Mọi file chứa tiếng Việt phải ghi bằng công cụ UTF-8 an toàn (không dùng `Set-Content`/`Out-File` — xem cảnh báo encoding trong `DEV.GUIDE.md`).

**Rủi ro & giảm thiểu:**

| Rủi ro | Giảm thiểu |
|---|---|
| Tách CSS làm đổi thứ tự cascade → vỡ giao diện | Phase 0 chỉ di chuyển, so sánh screenshot trước/sau; đặt tên file có số thứ tự |
| Tab bar che nội dung / nút "lên đầu" | Padding đáy theo `--tabbar-h` + `--safe-b`; test trên iOS Safari |
| Đổi markup nút Like/Share làm hỏng `blog-stats.js` | Giữ nguyên class/data-attribute cũ, chỉ đổi CSS/nhãn; test tương tác sau mỗi thay đổi |
| Script mới vi phạm CSP | File tĩnh `defer`, không inline, cùng origin; không thêm domain ngoài |
| Override taxonomy/search sai thứ tự lookup của Hugo | Kiểm bằng `hugo --templateMetrics` / thử file; xem `Known Gotchas #3` trong `.clinerules` |
| Chip tag động làm chậm build | Giới hạn 6–8 tag, dùng `ByCount`; cache trong partial |
| Đổi accent sang indigo làm vỡ tương phản ở chỗ dùng màu cứng | Grep `#c8f049`, `#15803d`, `rgba(200, 240, 73`, `rgba(21, 128, 61` trong CSS/JS/SVG/OG image và thay bằng biến; kiểm contrast AA ở cả 2 theme |
| Bỏ phong cách terminal làm thay đổi nhiều chuỗi/markup | Gom về i18n (Phase 0.6); rà `//`, `[ ]`, `~/`, UPPERCASE bằng grep trước khi đóng Phase 2 |

---

## 9. Quyết định đã chốt

| # | Câu hỏi | Quyết định |
|---|---|---|
| 1 | Comments desktop | **Phương án A** — Giscus nằm dưới bài trong cột đọc; cột phải = TOC rail. Bỏ sidebar trái |
| 2 | Màu thương hiệu | **Đổi sang Indigo/Violet** — dark `#a5b4fc`, light `#4f46e5` (chi tiết §3.3) |
| 3 | Phong cách terminal | **Bỏ hẳn** — không còn `~/`, `//`, `[ ]`, `#01`, UPPERCASE ở nav/nút/meta/tag/footer |
| 4 | Tab bar mobile | **4 mục** — Trang chủ · Bài viết · Tìm kiếm · Tác giả. "Chủ đề" thành chip lọc trong trang Bài viết (vẫn truy cập `/tags/` qua chip "Tất cả chủ đề") |
| 5 | Tính năng tuỳ chọn (bài đã đọc, màu theo chủ đề, print, zoom Mermaid) | **Để sau**, ngoài phạm vi đợt này |

---

## 10. Thứ tự & ước lượng tổng

| Phase | Nội dung | Ước lượng | Ưu tiên |
|---|---|---|---|
| 0 | Nền tảng, tách CSS, tokens, i18n | ≈ 3h | 🔴 |
| 1 | Header, tab bar, footer | ≈ 6h | 🔴 |
| 2 | Home, chips, cards | ≈ 7h | 🔴 |
| 3 | Trang bài viết (đọc, TOC, comments, share) | ≈ 8h | 🔴 |
| 4 | Search, Tags, About, 404 | ≈ 5h | 🟡 |
| 5 | A11y, hiệu năng, hoàn thiện | ≈ 5h | 🟡 |
| — | **Tổng** | **≈ 34h** | |

**Đề xuất chia 2 đợt PR** để dễ review: **Đợt 1 = Phase 0–2** (khung điều hướng + trang chủ/danh sách — tác động mobile lớn nhất), **Đợt 2 = Phase 3–5**.

---

### Phụ lục: Checklist nghiệm thu cuối

- [ ] Không còn màu lime cũ (`grep -ri "c8f049\|15803d\|200, 240, 73\|21, 128, 61"` trong `assets/ layouts/ static/js` = 0 kết quả); accent indigo đạt AA ở cả 2 theme
- [ ] Không còn ký hiệu terminal trong giao diện (`~/`, `//`, `[ ]`, `#01`) và không có UPPERCASE ở nav/nút/meta/tag/footer
- [ ] Tab bar mobile có đúng 4 mục; bấm "Chủ đề" qua chip lọc vẫn vào được `/tags/`
- [ ] Không còn sidebar bình luận bên trái; Giscus nằm dưới bài, TOC ở cột phải (≥1100px)
- [ ] Mọi nút/link chính ≥ 44px trên mobile (chip ≥ 36px, cách nhau ≥ 8px)
- [ ] Không chữ nào < 12px; meta ≥ 13px
- [ ] Header mobile 1 hàng ≤ 56px; tab bar hiển thị đúng và không che nội dung
- [ ] Không cuộn ngang toàn trang ở 360px (kể cả bài có bảng/code/Mermaid/KaTeX)
- [ ] VI/EN: tất cả nhãn, link, tab bar đúng ngôn ngữ
- [ ] Light/Dark/Auto đều đạt AA; không nháy theme khi tải
- [ ] Like/Comment/Share hoạt động trên card và trang bài
- [ ] TOC (mobile thu gọn / desktop rail), progress bar hoạt động
- [ ] Bàn phím: skip-link, focus-visible, ESC đóng modal
- [ ] `prefers-reduced-motion` tắt hiệu ứng
- [ ] Lighthouse mobile đạt ngưỡng §7; `hugo --minify` 0 warning/0 error
- [ ] `themes/PaperMod` không bị sửa; `unsafe: true`, SRI, CSP giữ nguyên
