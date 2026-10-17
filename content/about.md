---
date: '2026-09-29T18:39:42+07:00'
draft: false
title: 'Tác Giả // Giới Thiệu'
description: 'Lê Quang Vinh — AI & Software Engineer. Chuyên sâu về AI Agentic, Hybrid GraphRAG, Generative Video/Audio và Kiến trúc đa nền tảng.'
layout: about
ShowToc: true
TocOpen: false
hideMeta: true
comments: false
---

# LÊ QUANG VINH
**AI Engineer | Software Engineer**

- **Địa điểm:** TP. Hồ Chí Minh, Việt Nam
- **GitHub:** [github.com/vinh-gogo](https://github.com/vinh-gogo)
- **LinkedIn:** [linkedin.com/in/quangvinh2302](https://linkedin.com/in/quangvinh2302)
- **Email:** [lea26462@gmail.com](mailto:lea26462@gmail.com)
- **Học vấn:** Cử nhân Khoa học Máy tính — Đại học Công nghiệp TP.HCM (IUH, 2021–2025)

---

## 1. Giới Thiệu

Kỹ sư AI & Phần mềm tốt nghiệp Khoa học Máy tính (IUH, Khóa luận 4.0/4.0, công bố tại hội nghị SSRC). Tập trung phát triển các hệ thống **AI Agent có kiểm soát (LangGraph, Deterministic Saga)**, **Hybrid GraphRAG (Neo4j, Qdrant)**, **Pipeline tạo sinh Video/Audio đa phương thức**, và **ứng dụng đa nền tảng Offline-First (Kotlin Multiplatform, Go, FastAPI)**.

**Glory Hinody** là sổ tay kỹ thuật ghi lại kiến trúc hệ thống, số liệu thực nghiệm và bài học thực chiến từ các dự án đã triển khai.

---

## 2. Kinh Nghiệm Làm Việc

### WETEC — Công ty CP Công nghệ Năng lượng & Môi trường Nước
**AI Engineer Intern** *(10/2025 – 12/2025)* · Repo: [`vinh-gogo/pdf-rag`](https://github.com/Vinh-Gogo/pdf-rag) · Bài viết: [PDF-RAG Dual-Collection](/posts/pdf-rag-enterprise-dual-collection/) · [GraphRAG Neo4j & Qdrant](/posts/graph-rag-neo4j-qdrant/)

- Xây dựng pipeline bóc tách và làm sạch 168 trang báo cáo kỹ thuật & ESG ngành nước (BIWASE) bằng **Firecrawl AI** (độ tương đồng ngữ nghĩa Cosine đạt `0.9968`).
- Thiết kế kiến trúc **Dual-Collection Qdrant + Neo4j GraphRAG**, giải quyết bài toán nhập nhằng bảng biểu định kỳ và giữ độ trễ truy xuất **<2 giây** qua **FastAPI & Docker**.

---

## 3. Dự Án Tiêu Biểu

### 1. Glory Vocab (`gloryvocab.com`) — Nền tảng Từ điển & Ôn tập TOEIC Mobile-First *(2026)*
- **Live:** [`gloryvocab.com`](https://gloryvocab.com) · **Repo:** [`vinh-gogo/GLORY-TIKTOK`](https://github.com/vinh-gogo/GLORY-TIKTOK) · **Bài viết:** [Kiến trúc Glory Vocab](/posts/glory-vocab-hugo-fsrs-cloudflare-d1/)
- Biên dịch kho dữ liệu YAML chuẩn hóa (4.090 từ vựng, 379 bộ đồng nghĩa, 30 đoạn đọc ETS) thành **8.406 trang tĩnh song ngữ** bằng Hugo Extended, đạt **100/100 Lighthouse Performance**.
- Tích hợp thuật toán **FSRS Offline-First** trên IndexedDB v2 + Service Worker v7 và đồng bộ đám mây hai chiều **Zero-PII** qua **Cloudflare Pages Functions & D1**.

### 2. AI-Doodle CLI & Claw-CLI — Động cơ Sáng tác Tất định & Trợ lý Giọng nói Terminal *(2026)*
- **Repo:** [`vinh-gogo/aidoodle-cli`](https://github.com/vinh-gogo/aidoodle-cli) · [`vinh-gogo/claw-cli`](https://github.com/vinh-gogo/claw-cli) · **Bài viết:** [AI-Doodle CLI (Go)](/posts/aidoodle-cli-deterministic-saga-epub-engine-go/) · [Claw-CLI (Voice Agent)](/posts/claw-cli-voice-terminal-agent-silero-vad-sandbox/)
- **`aidoodle-cli` (Go 1.25+):** Động cơ sáng tác tự động hóa 7 chế độ AI với **Deterministic Saga Engine**, **Mechanical Output Validators**, Retro Web UI và trình biên dịch **W3C EPUB 3.3 / DOCX** thuần Go.
- **`claw-cli` (Python + ONNX):** Trợ lý dòng lệnh điều khiển bằng giọng nói tiếng Việt pha thuật ngữ code, tích hợp **Silero VAD v5 ONNX** (`0.6s` tự chốt câu), Unified Colab Gateway (`Gemma 4`) và **Sandbox an toàn 4 tầng**.

### 3. Hệ thống Multi-Agent CSKH, Đặt hàng & Cầu nối Chatwoot Real-Time *(2025–2026)*
- **Repo:** [`langgraph_re_act_agent`](https://github.com/thanhhuynhk17/langgraph_re_act_agent) · [`graph_rag`](https://github.com/thanhhuynhk17/graph_rag) · **Demo:** [YouTube 1](https://www.youtube.com/watch?v=RHZPNONKj3Q) · [YouTube 2](https://www.youtube.com/watch?v=fmhQLR4_IHE) · **Bài viết:** [ReAct Agent & LangGraph Hooks](/posts/multi-agent-workflow-langraph/) · [Chatwoot ActionCable & FastAPI](/posts/chatwoot-realtime-api-channel-websocket-fastapi/)
- Thiết kế máy trạng thái ReAct trên **LangGraph** (Pre/Post Hooks, Runtime Invariants với Pydantic v2, Human-in-the-Loop) và **Hybrid Search** (BM25 + Vector + Reranker `bge-reranker-v2-m3`) đạt **95% Hit@1 / 99% Hit@5** trên 3.200 truy vấn F&B và bán lẻ.
- Xây dựng dịch vụ cầu nối thời gian thực **FastAPI + ActionCable WebSocket** (`chatwoot_api_channel`) với State Machine, Heartbeat Watchdog và Circuit Breaker.

### 4. Open Video Lab, Video Factory & Shinobi Studio — Hệ sinh thái Tạo sinh Video AI *(2026)*
- **Repo:** [`vinh-gogo/open-video-lab`](https://github.com/vinh-gogo/open-video-lab) · **Bài viết:** [OpenVideoLab](/posts/openvideolab-video-diffusion/) · [MiniMax H3 & LTX-2.5](/posts/ai-video-generation-minimax-h3-ltx25/) · [Quantization Int8/FP4](/posts/quantization-int8-fp4-inference/) · [Video Factory](/posts/doodle-explainer-modular-video-factory-pipeline/) · [Shinobi Studio](/posts/shinobi-ai-video-studio-node-graph-kmp/)
- **Open Video Lab:** Tối ưu các mô hình Diffusion Transformers (LTX-2.5, MiniMax) bằng **Quantization (`int8`/`fp4`)** giảm VRAM xuống **<14GB** (chạy mượt trên GPU 16GB) kèm nội suy **RIFE** 48/96fps.
- **Video Factory & Shinobi Studio:** Pipeline 6 công đoạn sản xuất hoạt hình người que 2D với **Content-Addressed Cache SHA-256** (tái dựng cục bộ từng cảnh) và trình dựng phim đồ thị nút **Node-Graph** đa nền tảng trên KMP.

### 5. AI Lingua & Skills-KMP — Ứng dụng Học Ngoại ngữ Đa nền tảng với Kotlin Multiplatform *(2026)*
- **Repo:** [`Vinh-Gogo/ai-english`](https://github.com/Vinh-Gogo/ai-english) · [`vinh-gogo/skills-kmp`](https://github.com/vinh-gogo/skills-kmp) · **Demo:** [YouTube](https://youtu.be/R_IvnHsHmTw) · **Bài viết:** [Kiến trúc AI Lingua](/posts/on-device-ai-onnx-kotlin/) · [Skills-KMP & Design Patterns](/posts/skills-kmp-architecture-design-patterns/)
- Phát triển ứng dụng Desktop (Windows, macOS, Linux) & Android bằng **Kotlin Multiplatform + Compose Multiplatform** theo **Clean Architecture 5 lớp, Vertical Slicing & MVI** (chia sẻ 85% code chung) cùng cơ sở dữ liệu cục bộ **SQLDelight chuẩn hóa 3NF**.
- Tích hợp luyện dịch tương tác Việt–Anh theo **200+ chủ đề (CEFR A1–C2 / TOEIC 300–900)**, chấm điểm ngữ pháp qua **LLM Fallback Chain (Gemini + Novita AI)**, bảng vẽ nhận diện chữ viết tay offline **Handwriting Pad (`GeometricRecognizer` + `Dictionary Trie`, `<15ms`)** và thuật toán lặp lại ngắt quãng **FSRS**.

---

## 4. Nghiên Cứu Khoa Học

### Ước lượng độ sâu ảnh đơn dựa trên Deep CNNs *(SSRC 2024 — Khóa luận 4.0/4.0)*
- **Repo:** [`Vinh-Gogo/depth-estimation`](https://github.com/Vinh-Gogo/depth-estimation) · **Bài viết:** [Ước lượng độ sâu ảnh đơn với CNN](/posts/depth-estimation-cnn-ssrc/)
- Thiết kế kiến trúc **Enhanced U-Net (Hybrid ResNet–DenseNet)** kết hợp hàm mất mát đa thành phần ($\mathcal{L}_1 + \mathcal{L}_{SSIM} + \mathcal{L}_{grad}$), đạt **RMSE `0.0370`** và **Cosine Similarity `0.974`** trên tập kiểm thử 1.200 ảnh LineMOD RGB-D.

---

## 5. Kỹ Năng & Công Nghệ

| Lĩnh vực | Công nghệ cốt lõi |
|---|---|
| **AI Agentic & RAG** | LangGraph, FastMCP, Semantic Router, Hybrid Search (BM25 + Dense Vector + `bge-reranker-v2-m3`), Dual-Collection Qdrant, Neo4j GraphRAG, vLLM |
| **Generative AI & Vision** | Diffusion Transformers (LTX-2.5, MiniMax, FLUX.1), Quantization (`int8`/`fp4`), Deep CNNs (ResNet, DenseNet, U-Net), ONNX Runtime (Silero VAD v5), FFmpeg |
| **Kỹ thuật Phần mềm & Web/App** | Kotlin Multiplatform (KMP), Compose Multiplatform, Clean Architecture, MVI, Hugo Extended, Cloudflare Pages & D1, FastAPI, ActionCable WebSocket, W3C EPUB 3.3 |
| **Ngôn ngữ & Hạ tầng** | **Python**, **Kotlin**, **Go (Golang)**, **SQL** (PostgreSQL, SQLite/SQLDelight), C# (.NET), JavaScript/TypeScript, PyTorch, Docker, Git, Linux |
