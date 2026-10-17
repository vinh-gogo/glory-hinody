---
date: '2026-09-29T18:39:42+07:00'
draft: false
title: 'Author // About'
description: 'Le Quang Vinh — AI & Software Engineer. Focusing on AI Agents, Hybrid GraphRAG, Generative Video/Audio, and Cross-Platform Architecture.'
layout: about
ShowToc: true
TocOpen: false
hideMeta: true
comments: false
---

# LE QUANG VINH
**AI Engineer | Software Engineer**

- **Location:** Ho Chi Minh City, Vietnam
- **GitHub:** [github.com/vinh-gogo](https://github.com/vinh-gogo)
- **LinkedIn:** [linkedin.com/in/quangvinh2302](https://linkedin.com/in/quangvinh2302)
- **Email:** [lea26462@gmail.com](mailto:lea26462@gmail.com)
- **Education:** B.S. in Computer Science — Industrial University of Ho Chi Minh City (IUH, 2021–2025)

---

## 1. Overview

AI & Software Engineer with a B.S. in Computer Science (IUH, 4.0/4.0 Graduation Thesis published at SSRC). Focused on building **constrained AI Agent systems (LangGraph, Deterministic Saga)**, **Hybrid GraphRAG (Neo4j, Qdrant)**, **multimodal Video/Audio generation pipelines**, and **Offline-First cross-platform applications (Kotlin Multiplatform, Go, FastAPI)**.

**Glory Hinody** is my technical logbook documenting system architectures, empirical benchmarks, and engineering lessons from real-world projects.

---

## 2. Work Experience

### WETEC — Water Environment & Technology Energy Corporation
**AI Engineer Intern** *(10/2025 – 12/2025)* · Repo: [`vinh-gogo/pdf-rag`](https://github.com/Vinh-Gogo/pdf-rag) · Articles: [Dual-Collection PDF-RAG](/en/posts/pdf-rag-enterprise-dual-collection/) · [Neo4j & Qdrant GraphRAG](/en/posts/graph-rag-neo4j-qdrant/)

- Built an automated extraction and sanitization pipeline for 168 pages of water engineering & ESG reports (BIWASE) using **Firecrawl AI** (`0.9968` Cosine semantic preservation).
- Architected a **Dual-Collection Qdrant + Neo4j GraphRAG** system resolving cross-month table ambiguity while maintaining **<2s** retrieval latency via **FastAPI & Docker**.

---

## 3. Featured Projects

### 1. Glory Vocab (`gloryvocab.com`) — Mobile-First TOEIC Dictionary & FSRS Platform *(2026)*
- **Live:** [`gloryvocab.com`](https://gloryvocab.com) · **Repo:** [`vinh-gogo/GLORY-TIKTOK`](https://github.com/vinh-gogo/GLORY-TIKTOK) · **Article:** [Glory Vocab Architecture](/en/posts/glory-vocab-hugo-fsrs-cloudflare-d1/)
- Compiles a JSON-Schema-validated YAML corpus (4,090 headwords, 379 synonym sets, 30 ETS-style passages) into **8,406 bilingual static pages** with Hugo Extended, achieving **100/100 Lighthouse Performance**.
- Features a client-side **Offline-First FSRS** scheduler on IndexedDB v2 + Service Worker v7 and **Zero-PII** bidirectional delta sync via **Cloudflare Pages Functions & D1**.

### 2. AI-Doodle CLI & Claw-CLI — Deterministic Authoring Engine & Voice Terminal Agent *(2026)*
- **Repo:** [`vinh-gogo/aidoodle-cli`](https://github.com/vinh-gogo/aidoodle-cli) · [`vinh-gogo/claw-cli`](https://github.com/vinh-gogo/claw-cli) · **Articles:** [AI-Doodle CLI (Go)](/en/posts/aidoodle-cli-deterministic-saga-epub-engine-go/) · [Claw-CLI (Voice Agent)](/en/posts/claw-cli-voice-terminal-agent-silero-vad-sandbox/)
- **`aidoodle-cli` (Go 1.25+):** Autonomous 7-mode content engine with a **Deterministic Saga Engine**, **Mechanical Output Validators**, Retro Web UI, and zero-dependency pure-Go **W3C EPUB 3.3 / DOCX** compilers.
- **`claw-cli` (Python + ONNX):** Bilingual voice- and text-controlled terminal assistant powered by **Silero VAD v5 ONNX** (`0.6s` auto-end-of-utterance), a Unified Colab Gateway (`Gemma 4`), and a **4-Tier Safety Policy Sandbox**.

### 3. Constrained Multi-Agent Support & Real-Time Chatwoot Bridge *(2025–2026)*
- **Repo:** [`langgraph_re_act_agent`](https://github.com/thanhhuynhk17/langgraph_re_act_agent) · [`graph_rag`](https://github.com/thanhhuynhk17/graph_rag) · **Demo:** [YouTube 1](https://www.youtube.com/watch?v=RHZPNONKj3Q) · [YouTube 2](https://www.youtube.com/watch?v=fmhQLR4_IHE) · **Articles:** [ReAct Agent & LangGraph Hooks](/en/posts/multi-agent-workflow-langraph/) · [Chatwoot ActionCable & FastAPI](/en/posts/chatwoot-realtime-api-channel-websocket-fastapi/)
- Engineered a **LangGraph** ReAct state machine (Pre/Post Hooks, Pydantic v2 runtime invariants, Human-in-the-Loop) and a **Hybrid Search** pipeline (BM25 + Vector + `bge-reranker-v2-m3`) achieving **95% Hit@1 / 99% Hit@5** across 3,200 F&B and retail queries.
- Built a resilient **FastAPI + ActionCable WebSocket** bridge (`chatwoot_api_channel`) featuring a finite state machine, heartbeat watchdog, and circuit breaker.

### 4. Open Video Lab, Video Factory & Shinobi Studio — AI Video Ecosystem *(2026)*
- **Repo:** [`vinh-gogo/open-video-lab`](https://github.com/vinh-gogo/open-video-lab) · **Articles:** [OpenVideoLab](/en/posts/openvideolab-video-diffusion/) · [MiniMax H3 & LTX-2.5](/en/posts/ai-video-generation-minimax-h3-ltx25/) · [Int8/FP4 Quantization](/en/posts/quantization-int8-fp4-inference/) · [Video Factory](/en/posts/doodle-explainer-modular-video-factory-pipeline/) · [Shinobi Studio](/en/posts/shinobi-ai-video-studio-node-graph-kmp/)
- **Open Video Lab:** Optimizes Diffusion Transformers (LTX-2.5, MiniMax) with **int8/fp4 quantization**, reducing VRAM below **14GB** for 16GB GPUs with **RIFE** 48/96fps interpolation.
- **Video Factory & Shinobi Studio:** A 6-stage 2D stick-figure animation pipeline with **SHA-256 Content-Addressed Caching** (surgical single-scene rebuilds) and a cross-platform **Node-Graph** video editor built with KMP.

### 5. AI Lingua, Mainichi Kanji & Skills-KMP — Cross-Platform Language Learning Apps *(2026)*
- **Repo:** [`Vinh-Gogo/ai-english`](https://github.com/Vinh-Gogo/ai-english) · [`vinh-gogo/skills-kmp`](https://github.com/vinh-gogo/skills-kmp) · **Articles:** [AI Lingua](/en/posts/on-device-ai-onnx-kotlin/) · [Mainichi Kanji](/en/posts/mainichi-kanji-local-first-kmp-harmony-architecture/) · [Skills-KMP](/en/posts/skills-kmp-architecture-design-patterns/)
- Built Desktop & Android applications using **Kotlin Multiplatform + Compose Multiplatform** with **5-Tier Clean Architecture & MVI** (85% shared code), **3NF SQLDelight**, **FSRS**, offline handwriting recognition (`GeometricRecognizer` + `Trie`), and interactive **`TokenizedSentenceChips`**.

---

## 4. Academic Research

### Monocular Depth Estimation with Deep CNNs *(SSRC 2024 — 4.0/4.0 Thesis)*
- **Repo:** [`Vinh-Gogo/depth-estimation`](https://github.com/Vinh-Gogo/depth-estimation) · **Article:** [Monocular Depth Estimation with CNNs](/en/posts/depth-estimation-cnn-ssrc/)
- Proposed an **Enhanced U-Net (Hybrid ResNet–DenseNet)** trained with a composite loss ($\mathcal{L}_1 + \mathcal{L}_{SSIM} + \mathcal{L}_{grad}$), achieving **RMSE `0.0370`** and **Cosine Similarity `0.974`** across 1,200 hold-out test images on the LineMOD RGB-D benchmark.

---

## 5. Technical Stack

| Domain | Core Technologies |
|---|---|
| **AI Agentic & RAG** | LangGraph, FastMCP, Semantic Router, Hybrid Search (BM25 + Dense Vector + `bge-reranker-v2-m3`), Dual-Collection Qdrant, Neo4j GraphRAG, vLLM |
| **Generative AI & Vision** | Diffusion Transformers (LTX-2.5, MiniMax, FLUX.1), Quantization (`int8`/`fp4`), Deep CNNs (ResNet, DenseNet, U-Net), ONNX Runtime (Silero VAD v5), FFmpeg |
| **Software & Web/App** | Kotlin Multiplatform (KMP), Compose Multiplatform, Clean Architecture, MVI, Hugo Extended, Cloudflare Pages & D1, FastAPI, ActionCable WebSocket, W3C EPUB 3.3 |
| **Languages & Infra** | **Python**, **Kotlin**, **Go (Golang)**, **SQL** (PostgreSQL, SQLite/SQLDelight), C# (.NET), JavaScript/TypeScript, PyTorch, Docker, Git, Linux |
