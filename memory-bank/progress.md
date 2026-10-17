# Progress — Glory Hinody

> Last updated: 2026-10-17

## ✅ What Works

### Core Site
- [x] Hugo build: 173 pages (87 VI + 86 EN), 0 warnings, 0 errors
- [x] Cloudflare Pages deployment từ `main`
- [x] PaperMod theme với local overrides
- [x] Dark/light mode toggle
- [x] KaTeX math rendering (SRI protected)
- [x] Mermaid diagrams (securityLevel: antiscript, SRI protected)
- [x] Tương tác Stat Tags: Click Like (thả tim real-time, animation), Click Comments (cuộn mượt + highlight), Click Shares (mở popup chia sẻ đa nền tảng + copy link)
- [x] Giscus comments & reactions (callout thông báo đưa lên phía trên bên trái bài viết + quick jump link)
- [x] RSS feed (fixed deprecated LanguageCode)
- [x] OpenGraph (fixed deprecated LanguageCode)
- [x] Tổng cộng **16 bài viết kỹ thuật song ngữ (VI + EN)** bao phủ toàn bộ các dự án trong ổ `D:\`:
  - `glory-vocab-hugo-fsrs-cloudflare-d1` (`GLORY-TIKTOK` / `gloryvocab.com`)
  - `aidoodle-cli-deterministic-saga-epub-engine-go` (`ainovel-cli` / `aidoodle-cli`)
  - `claw-cli-voice-terminal-agent-silero-vad-sandbox` (`claw-cli`)
  - `doodle-explainer-modular-video-factory-pipeline` (`doodle_explainer`)
  - `mainichi-kanji-local-first-kmp-harmony-architecture` (`mainichi-app-v2` & `mainichi-kanji-app`)
  - `chatwoot-realtime-api-channel-websocket-fastapi` (`chatwoot_api_channel` & `chatwoot-ws`)
  - `shinobi-ai-video-studio-node-graph-kmp` (`ai-video`)
  - cùng 10 bài viết gốc (`skills-kmp`, `ai-video-generation-minimax-h3-ltx25`, `quantization-int8-fp4-inference`, `pdf-rag-enterprise-dual-collection`, `openvideolab-video-diffusion`, `on-device-ai-onnx-kotlin`, `multi-agent-workflow-langraph`, `graph-rag-neo4j-qdrant`, `depth-estimation-cnn-ssrc`, `bai-viet-dau-tien`)
- [x] Cập nhật đồng bộ trang Hồ sơ năng lực (`content/about.md` & `content/about.en.md`)

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

## 📊 Build Metrics
```
Pages:            173 (87 VI + 86 EN)
Paginator pages:  6 (3 VI + 3 EN)
Static files:     37 VI / 37 EN
Aliases:          31 VI / 30 EN
Warnings:         0
Errors:           0
```
