---
date: '2026-09-29T18:39:42+07:00'
draft: false
title: 'HÆ°á»›ng Dáº«n XÃ¢y Dá»±ng Blog Vá»›i Hugo + PaperMod + Cloudflare Pages'
description: 'HÆ°á»›ng dáº«n chi tiáº¿t tá»«ng bÆ°á»›c xÃ¢y dá»±ng blog cÃ¡ nhÃ¢n miá»…n phÃ­ vá»›i Hugo, theme PaperMod, Cloudflare Pages vÃ  bÃ¬nh luáº­n Giscus. Thá»i gian Æ°á»›c tÃ­nh 2â€“3 giá».'
summary: 'HÆ°á»›ng dáº«n chi tiáº¿t tá»«ng bÆ°á»›c xÃ¢y dá»±ng blog cÃ¡ nhÃ¢n miá»…n phÃ­ vá»›i Hugo, theme PaperMod, Cloudflare Pages vÃ  bÃ¬nh luáº­n Giscus. Thá»i gian Æ°á»›c tÃ­nh 2â€“3 giá».'
tags: ["hugo", "blog", "cloudflare", "giscus", "hÆ°á»›ng-dáº«n"]
ShowToc: true
TocOpen: true
---

> Thá»i gian Æ°á»›c tÃ­nh láº§n Ä‘áº§u: **2â€“3 giá»** | Cáº­p nháº­t: 2026-09

BÃ i viáº¿t nÃ y Ä‘Ãºc káº¿t toÃ n bá»™ quy trÃ¬nh thiáº¿t láº­p blog tÄ©nh vá»›i chi phÃ­ $0, tá»± Ä‘á»™ng hÃ³a build qua Cloudflare Pages vÃ  nhÃºng bÃ¬nh luáº­n báº£o máº­t qua GitHub Discussions.

## 1. Minh Chá»©ng & Trang Thá»­ Nghiá»‡m Sá»‘ng (Evidence & Live Demo)

| Háº¡ng má»¥c | Minh chá»©ng thá»±c táº¿ | Chi tiáº¿t ká»¹ thuáº­t |
|---|---|---|
| **Website thá»±c táº¿ (Live Demo)** | [`glory-hinody.pages.dev`](https://glory-hinody.pages.dev/) | Trang web báº¡n Ä‘ang truy cáº­p, thá»i gian táº£i trang < 500ms |
| **MÃ£ nguá»“n (GitHub)** | [`github.com/vinh-gogo/glory-hinody`](https://github.com/vinh-gogo/glory-hinody) | MÃ£ nguá»“n má»Ÿ hoÃ n toÃ n, quáº£n lÃ½ qua Git submodule (PaperMod) |
| **Há»‡ thá»‘ng bÃ¬nh luáº­n (Discussions)** | [`github.com/vinh-gogo/glory-hinody/discussions`](https://github.com/vinh-gogo/glory-hinody/discussions) | Äá»“ng bá»™ 2 chiá»u qua Giscus API, chá»‘ng spam tá»± Ä‘á»™ng |
| **Tá»± Ä‘á»™ng hÃ³a CI/CD** | Cloudflare Pages Git Integration | Tá»± Ä‘á»™ng kÃ­ch hoáº¡t build `hugo --gc --minify` khi cÃ³ `git push` |

---

## 2. Tá»•ng quan quy trÃ¬nh

Anh viáº¿t bÃ i Markdown trÃªn mÃ¡y, `git push` lÃªn GitHub, Cloudflare tá»± build vÃ  Ä‘Äƒng lÃªn web. BÃ¬nh luáº­n vÃ  like náº±m trong GitHub Discussions cá»§a chÃ­nh repo Ä‘Ã³.

```mermaid
flowchart LR
    A["Viáº¿t bÃ i (.md)"] --> B["git push"]
    B --> C["GitHub"]
    C --> D["Cloudflare Pages (auto build)"]
    D --> E["Blog Online"]
    E --> F["BÃ¬nh luáº­n / Like (Giscus)"]
```

## Giai Ä‘oáº¡n 0: Chuáº©n bá»‹ (15 phÃºt)

1. Táº¡o tÃ i khoáº£n **GitHub** vÃ  **Cloudflare** (Ä‘á»u miá»…n phÃ­).
2. CÃ i **Git**, vÃ  cÃ i **Hugo báº£n "extended"** (Windows: `winget install Hugo.Hugo.Extended`; macOS: `brew install hugo`).
3. CÃ i má»™t trÃ¬nh soáº¡n tháº£o, vÃ­ dá»¥ VS Code.
4. Kiá»ƒm tra: gÃµ `hugo version` vÃ  `git --version` trong terminal pháº£i ra sá»‘ phiÃªn báº£n. Anh nhá»› sá»‘ phiÃªn báº£n Hugo nÃ y, lÃ¡t ná»¯a cáº§n dÃ¹ng.

## Giai Ä‘oáº¡n 1: Dá»±ng blog trÃªn mÃ¡y (30 phÃºt)

```bash
hugo new site myblog
cd myblog
git init
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

Táº¡o file `hugo.yaml` á»Ÿ thÆ° má»¥c gá»‘c (xÃ³a file `hugo.toml` máº·c Ä‘á»‹nh náº¿u cÃ³):

```yaml
baseURL: "https://myblog.pages.dev/"   # sáº½ Ä‘á»•i khi cÃ³ tÃªn miá»n riÃªng
locale: vi
defaultContentLanguage: vi
title: "TÃªn blog cá»§a anh"
theme: PaperMod

params:
  description: "MÃ´ táº£ ngáº¯n vá» blog"
  defaultTheme: auto        # tá»± theo sÃ¡ng/tá»‘i cá»§a thiáº¿t bá»‹
  ShowReadingTime: true
  ShowShareButtons: true    # nÃºt chia sáº»
  comments: true            # báº­t khung bÃ¬nh luáº­n
  ShareButtons: ["facebook", "twitter", "telegram", "whatsapp", "linkedin"]

menu:
  main:
    - { name: "BÃ i viáº¿t", url: "/posts/", weight: 1 }
    - { name: "Giá»›i thiá»‡u", url: "/about/", weight: 2 }
```

Viáº¿t bÃ i Ä‘áº§u tiÃªn vÃ  cháº¡y thá»­:

```bash
hugo new posts/bai-viet-dau-tien.md
# má»Ÿ file, sá»­a ná»™i dung, Ä‘á»•i draft: true thÃ nh draft: false
hugo server
```

Má»Ÿ `http://localhost:1313` Ä‘á»ƒ xem.

## Giai Ä‘oáº¡n 2: ÄÆ°a code lÃªn GitHub (10 phÃºt)

1. TrÃªn GitHub, táº¡o repo **public** (báº¯t buá»™c Ä‘á»ƒ Giscus hoáº¡t Ä‘á»™ng), vÃ­ dá»¥ `myblog`.
2. Táº¡o file `.gitignore` á»Ÿ thÆ° má»¥c gá»‘c vá»›i ná»™i dung:

```gitignore
public/
resources/_gen/
.hugo_build.lock
```

3. Äáº©y code:

```bash
git add .
git commit -m "Khá»Ÿi táº¡o blog"
git branch -M main
git remote add origin https://github.com/TENCUAANH/myblog.git
git push -u origin main
```

> **LÆ°u Ã½ khi clone láº¡i repo trÃªn mÃ¡y khÃ¡c:** Theme PaperMod lÃ  submodule, cáº§n thÃªm flag `--recurse-submodules`:
>
> ```bash
> # Khi clone repo vá» mÃ¡y khÃ¡c:
> git clone --recurse-submodules https://github.com/TENCUAANH/myblog.git
> # Hoáº·c náº¿u Ä‘Ã£ clone rá»“i mÃ  chÆ°a cÃ³ theme:
> git submodule update --init --recursive
> ```

## Giai Ä‘oáº¡n 3: CÃ i Giscus (20 phÃºt)

1. VÃ o repo â†’ **Settings â†’ General â†’ Features** â†’ tÃ­ch **Discussions**.
2. CÃ i app Giscus táº¡i `github.com/apps/giscus`, chá»n cho Ä‘Ãºng repo `myblog`.
3. Trong tab **Discussions** cá»§a repo, vÃ o pháº§n quáº£n lÃ½ category, táº¡o (hoáº·c dÃ¹ng) má»™t category loáº¡i **Announcements**. Loáº¡i nÃ y chá»‰ cho phÃ©p Giscus vÃ  ngÆ°á»i quáº£n trá»‹ táº¡o chá»§ Ä‘á» má»›i, giÃºp trÃ¡nh rÃ¡c.
4. VÃ o `giscus.app`, Ä‘iá»n tÃªn repo, chá»n:
   - Mapping: **pathname** (má»—i bÃ i má»™t chá»§ Ä‘á» riÃªng)
   - Category: Announcements
   - TÃ­ch **Enable reactions** (Ä‘Ã¢y chÃ­nh lÃ  chá»©c nÄƒng like)
   - Language: Tiáº¿ng Viá»‡t
5. Trang sáº½ sinh ra má»™t Ä‘oáº¡n `<script>`. ChÃ©p láº¡i hai giÃ¡ trá»‹ `data-repo-id` vÃ  `data-category-id`.
6. Táº¡o file `layouts/partials/comments.html`:

```html
<script src="https://giscus.app/client.js"
  data-repo="TENCUAANH/myblog"
  data-repo-id="DAN_GIA_TRI_VAO_DAY"
  data-category="Announcements"
  data-category-id="DAN_GIA_TRI_VAO_DAY"
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="top"
  data-theme="preferred_color_scheme"
  data-lang="vi"
  crossorigin="anonymous"
  async>
</script>
```

> **LÆ°u Ã½:** Khung bÃ¬nh luáº­n Giscus sáº½ **khÃ´ng hiá»‡n trÃªn localhost**. Anh cáº§n push lÃªn Cloudflare Pages vÃ  má»Ÿ trang tháº­t Ä‘á»ƒ kiá»ƒm tra. Sau khi deploy xong, má»Ÿ má»™t bÃ i viáº¿t, cuá»‘i bÃ i sáº½ tháº¥y khung bÃ¬nh luáº­n â€” Ä‘Äƒng thá»­ má»™t bÃ¬nh luáº­n báº±ng tÃ i khoáº£n GitHub Ä‘á»ƒ kiá»ƒm tra.

## Giai Ä‘oáº¡n 4: ÄÄƒng lÃªn Cloudflare Pages (20 phÃºt)

1. Trong Cloudflare: **Workers & Pages â†’ Create â†’ Pages â†’ Connect to Git**, chá»n repo `myblog`. Giao diá»‡n Cloudflare hay thay Ä‘á»•i, náº¿u khÃ´ng tháº¥y Ä‘Ãºng tÃªn nÃºt thÃ¬ tÃ¬m má»¥c káº¿t ná»‘i Git Ä‘á»ƒ deploy site tÄ©nh.
2. Cáº¥u hÃ¬nh build:
   - Build command: `hugo --gc --minify`
   - Output directory: `public`
3. ThÃªm biáº¿n mÃ´i trÆ°á»ng `HUGO_VERSION` vá»›i giÃ¡ trá»‹ Ä‘Ãºng sá»‘ phiÃªn báº£n anh Ä‘Ã£ ghi á»Ÿ Giai Ä‘oáº¡n 0 (vÃ­ dá»¥ `0.167.0`). BÆ°á»›c nÃ y quan trá»ng, vÃ¬ náº¿u khÃ´ng Cloudflare cÃ³ thá»ƒ dÃ¹ng báº£n Hugo cÅ© vÃ  build lá»—i vá»›i theme.

   > **Cáº£nh bÃ¡o:** Äáº£m báº£o file `.gitmodules` Ä‘Ã£ Ä‘Æ°á»£c commit vÃ o repo. Náº¿u thiáº¿u, Cloudflare sáº½ khÃ´ng pull Ä‘Æ°á»£c theme PaperMod vÃ  trang bá»‹ tráº¯ng hoÃ n toÃ n sau khi deploy.

4. Nháº¥n deploy. VÃ i phÃºt sau anh cÃ³ Ä‘á»‹a chá»‰ dáº¡ng `myblog.pages.dev`.
5. Quay láº¡i `hugo.yaml`, sá»­a `baseURL` thÃ nh Ä‘á»‹a chá»‰ tháº­t, rá»“i push láº¡i.

## Giai Ä‘oáº¡n 5: TÃªn miá»n riÃªng (tÃ¹y chá»n, 15 phÃºt)

1. Mua tÃªn miá»n á»Ÿ nhÃ  Ä‘Äƒng kÃ½ báº¥t ká»³ (khoáº£ng vÃ i trÄƒm nghÃ¬n Ä‘á»“ng má»—i nÄƒm vá»›i `.com`). Náº¿u chÆ°a muá»‘n tá»‘n tiá»n, cá»© dÃ¹ng `.pages.dev`, hoÃ n toÃ n dÃ¹ng Ä‘Æ°á»£c.
2. Trong dá»± Ã¡n Pages chá»n **Custom domains** â†’ thÃªm tÃªn miá»n â†’ lÃ m theo hÆ°á»›ng dáº«n trá» DNS. Chá»©ng chá»‰ HTTPS Ä‘Æ°á»£c cáº¥p tá»± Ä‘á»™ng.
3. Cáº­p nháº­t `baseURL` trong `hugo.yaml`.
4. Náº¿u muá»‘n giá»›i háº¡n chá»‰ tÃªn miá»n cá»§a anh Ä‘Æ°á»£c nhÃºng Giscus, táº¡o file `giscus.json` á»Ÿ gá»‘c repo vá»›i trÆ°á»ng `origins`, xem hÆ°á»›ng dáº«n "advanced usage" cá»§a Giscus.

## Giai Ä‘oáº¡n 6: HoÃ n thiá»‡n (30 phÃºt)

- **Trang Giá»›i thiá»‡u:** `hugo new about.md`.
- **RSS vÃ  sitemap:** Hugo táº¡o sáºµn, khÃ´ng cáº§n lÃ m gÃ¬.
- **áº¢nh bÃ¬a vÃ  áº£nh bÃ i viáº¿t:** Ä‘áº·t trong thÆ° má»¥c `static/` hoáº·c cáº¡nh bÃ i viáº¿t. NÃªn nÃ©n áº£nh dÆ°á»›i khoáº£ng 200 KB.
- **Thá»‘ng kÃª truy cáº­p:** báº­t **Cloudflare Web Analytics** trong dashboard, miá»…n phÃ­ vÃ  khÃ´ng dÃ¹ng cookie.
- **NÃºt share cho Ä‘iá»‡n thoáº¡i:** PaperMod Ä‘Ã£ cÃ³ Facebook, Telegram, WhatsApp... Náº¿u muá»‘n thÃªm Zalo vÃ  cÃ¡c app khÃ¡c, cÃ³ thá»ƒ bá»• sung nÃºt dÃ¹ng Web Share API cá»§a trÃ¬nh duyá»‡t (trÃªn Ä‘iá»‡n thoáº¡i sáº½ hiá»‡n danh sÃ¡ch app Ä‘Ã£ cÃ i).

## Quy trÃ¬nh viáº¿t bÃ i háº±ng ngÃ y

```bash
hugo new posts/ten-bai.md    # viáº¿t ná»™i dung, draft: false
git add . && git commit -m "BÃ i má»›i: ..." && git push
```

Khoáº£ng 1 Ä‘áº¿n 2 phÃºt sau bÃ i Ä‘Ã£ lÃªn web.

## Váº­n hÃ nh vÃ  kiá»ƒm duyá»‡t

- BÃ¬nh luáº­n náº±m trong tab **Discussions** cá»§a repo. Anh cÃ³ thá»ƒ xÃ³a, áº©n, khÃ³a chá»§ Ä‘á» á»Ÿ Ä‘Ã³, vÃ  báº­t thÃ´ng bÃ¡o email cá»§a GitHub Ä‘á»ƒ biáº¿t khi cÃ³ bÃ¬nh luáº­n má»›i.
- Sao lÆ°u: toÃ n bá»™ ná»™i dung Ä‘Ã£ náº±m trong Git. NÃªn clone thÃªm má»™t báº£n vá» mÃ¡y hoáº·c Ä‘áº©y sang má»™t nÆ¡i thá»© hai.
- Cáº­p nháº­t theme Ä‘á»‹nh ká»³: `git submodule update --remote --merge`.

## Lá»—i hay gáº·p

| Triá»‡u chá»©ng | NguyÃªn nhÃ¢n thÆ°á»ng gáº·p |
|---|---|
| Trang tráº¯ng hoáº·c máº¥t giao diá»‡n sau deploy | Thiáº¿u `HUGO_VERSION`, hoáº·c quÃªn kÃ©o submodule cá»§a theme |
| KhÃ´ng hiá»‡n khung bÃ¬nh luáº­n | Repo chÆ°a public, chÆ°a cÃ i app Giscus, hoáº·c dÃ¡n sai `repo-id` / `category-id` |
| BÃ¬nh luáº­n sai bÃ i | `data-mapping` khÃ´ng pháº£i `pathname`, hoáº·c Ä‘á»•i Ä‘Æ°á»ng dáº«n bÃ i (Ä‘á»•i URL sáº½ máº¥t liÃªn káº¿t vá»›i chá»§ Ä‘á» cÅ©) |
| BÃ i má»›i khÃ´ng lÃªn | CÃ²n `draft: true`, hoáº·c ngÃ y Ä‘Äƒng (`date`) á»Ÿ tÆ°Æ¡ng lai |

Anh cáº§n nhá»› má»™t háº¡n cháº¿: ngÆ°á»i bÃ¬nh luáº­n pháº£i cÃ³ tÃ i khoáº£n GitHub. Náº¿u sau nÃ y tháº¥y Ä‘Ã¢y lÃ  rÃ o cáº£n, anh cÃ³ thá»ƒ chuyá»ƒn sang Waline mÃ  khÃ´ng pháº£i lÃ m láº¡i blog, vÃ¬ chá»‰ cáº§n thay file `comments.html`.

---

## TÃ i Liá»‡u Tham Kháº£o (References)

```
[01] Hugo Team. (2024). The World's Fastest Framework for Building Websites. 
     Hugo Official Documentation (gohugo.io).
[02] Aditya Telange. (2024). PaperMod Theme Documentation and Feature Specifications. 
     GitHub Wiki (github.com/adityatelange/hugo-PaperMod).
[03] Cloudflare. (2024). Cloudflare Pages: Fast, Secure and Free JAMstack Hosting. 
     Cloudflare Developer Docs (developers.cloudflare.com/pages).
[04] Giscus Project. (2024). A Comment System Powered by GitHub Discussions. 
     Official Documentation (giscus.app).
```

---

## BÃ i Viáº¿t LiÃªn Quan (Related Logs)

- [OpenVideoLab: Táº¡o Sinh Video AI Äa PhÆ°Æ¡ng Thá»©c TrÃªn GPU 16GB](/posts/openvideolab-video-diffusion/)  
  *KhÃ¡m phÃ¡ cÃ¡ch tá»‘i Æ°u hÃ³a pipeline táº¡o sinh video AI cháº¡y trÃªn mÃ¡y tráº¡m cÃ¡ nhÃ¢n.*
- [GraphRAG: Káº¿t Há»£p Neo4j vÃ  Qdrant Äá»ƒ Giáº£m Hallucination](/posts/graph-rag-neo4j-qdrant/)  
  *Kiáº¿n trÃºc RAG nÃ¢ng cao káº¿t há»£p Ä‘á»“ thá»‹ tri thá»©c vÃ  vector search trÃªn tÃ i liá»‡u ká»¹ thuáº­t phá»©c táº¡p.*
