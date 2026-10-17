---
date: '2026-09-29T18:39:42+07:00'
draft: false
title: 'Author // Portfolio & Credentials'
description: 'Le Quang Vinh — AI Engineer & Software Engineer. Specializing in Generative AI, AI Agents, On-Device AI, and Scalable Software Architecture.'
layout: about
ShowToc: true
TocOpen: true
hideMeta: true
comments: false
---

# LE QUANG VINH
**AI & Software Engineer — Deterministic Agentic Systems · Hybrid RAG · Cross-Platform Architecture**

- **Location:** Ho Chi Minh City, Vietnam
- **Email:** [lea26462@gmail.com](mailto:lea26462@gmail.com)
- **Phone:** [+84 985 189 541](tel:+84985189541)
- **GitHub:** [github.com/Vinh-Gogo](https://github.com/Vinh-Gogo)
- **LinkedIn:** [linkedin.com/in/quangvinh2302](https://linkedin.com/in/quangvinh2302)
- **Website:** [glory-hinody.pages.dev](https://glory-hinody.pages.dev)
- **Education:** B.S. in Computer Science — Industrial University of Ho Chi Minh City (IUH, 2021–2025) | **Graduation Thesis: 4.0/4.0 (Excellent)**, published at **SSRC 2024**
- **Languages:** Technical English (In-depth reading of AI/CS research papers & formal specifications, bilingual system architecture authoring, and technical communication); Vietnamese (Native)

---

## 1. Professional Summary

AI & Software Engineer (B.S. in Computer Science, IUH) focused on **Deterministic & Verifiable Agentic Systems**, **Hybrid GraphRAG**, and **Type-Safe Software Architecture**:

- **Runtime Invariants & Trustworthy LLM Engineering:** Architected ReAct state machines on LangGraph enforcing pre/post-execution hooks (`pre_model_hook` / `post_model_hook`), physical decoder stop sequences (`stop_sequences`), runtime schema & catalog invariants via **Pydantic v2** / **BAML**, bounded self-correction rollback loops, **Human-in-the-Loop (`interrupt`)**, a **Deterministic Saga Engine** in **Go** (`aidoodle-cli`), and a **4-Tier Safety Policy Sandbox** (`claw-cli`).
- **Production-Grade Knowledge Retrieval (RAG):** Built a **Dual-Collection Qdrant + Neo4j GraphRAG** system processing multi-table technical & ESG reports (168-page BIWASE corpus, `<2s` retrieval latency), and a **Hybrid Search pipeline (BM25 + Dense Vector + Cross-Encoder Reranker `bge-reranker-v2-m3`)** achieving **86.88%–88.13% Hit@1 (99.69%–100% Hit@20)** on a 320-product ablation benchmark and **95% Hit@1 / 99% Hit@5** across 3,200 multi-domain F&B and retail queries.
- **Type-Driven Software Engineering & Algorithmic Foundations:** Developed cross-platform **Kotlin Multiplatform (KMP)** applications leveraging **Algebraic Data Types (ADT — `sealed interface` Sum Types & `data class` Product Types)**, compile-time domain invariants (`@JvmInline value class`), functional error handling (`Arrow Either<AppError, T>`), and pure-domain algorithmic implementations (`DictionaryTrie`, `$1 GeometricRecognizer`, and `FSRS` memory state modeling).

---

## 2. Work Experience

### WETEC — Water Environment & Technology Energy Corporation
**AI Engineer Intern** *(10/2025 – 12/2025)*  
**Source Code:** [`github.com/Vinh-Gogo/pdf-rag`](https://github.com/Vinh-Gogo/pdf-rag) | **Technical Reports:** [Dual-Collection PDF-RAG Architecture](/en/posts/pdf-rag-enterprise-dual-collection/) · [Neo4j & Qdrant GraphRAG Architecture](/en/posts/graph-rag-neo4j-qdrant/)

- **Table-Preserving Ingestion & Semantic Sanitization:** Engineered an automated extraction and sanitization pipeline for **168 pages** of water treatment, waste management, ESG, and operational reports from **BIWASE (Ticker: BWE)** (part of a >200-page water engineering corpus) using **Firecrawl AI** and custom RegEx sanitizers. Benchmarked 3 embedding models (`DangVanTuan/vietnamese-embedding`, `Qwen3-Embedding-0.6B`, `BKAI HaLong-Embedding`) across 159/168 valid pages, achieving a mean Cosine Similarity of **0.9966 – 0.9968** (`Qwen3-0.6B` lowest Std Dev `0.0069`) between raw and sanitized text—proving zero semantic degradation during OCR noise removal.
- **Quantitative Retrieval Benchmarking & Resolving Cross-Month Table Ambiguity:** Built an automated evaluation suite across **660 factual Vietnamese queries** (`tests/data/halong_evaluation_results.json`) and **315 queries** (`tests/data/qwen_evaluation_results.json`). Identified why naive single-stage chunk retrieval struggles on recurring monthly reports with identical table headers: `HaLong-Embedding` scored `29.39% Hit@1 / 57.42% Hit@5 / MRR 0.4177`, while upgrading to `Qwen3-Embedding-0.6B` boosted single-stage accuracy to **38.41% Hit@1 (+9.02%) / 68.25% Hit@5 (+10.83%) / 80.00% Hit@10 / 90.16% Hit@50 (MRR 0.5198)**.
- **Dual-Collection Qdrant & Semantic GraphRAG:** Architected a two-tier retrieval workflow in **Qdrant**—searching micro-chunks in `esg_sequences` (1,132 500-char segments) and aggregating scores to fetch complete macro-pages from `esg_pages`—combined with temporal metadata filters and **Neo4j** entity linking, eliminating cross-period figure misattribution while maintaining **<2 second** response latency via **FastAPI** and **Docker**.
- **Core Tech Stack:** Python, Qdrant (Dual-Collection), Neo4j, `Qwen3-Embedding-0.6B`, `HaLong-Embedding`, Firecrawl AI, FastAPI, Docker.

---

## 3. Flagship Projects & Live Proofs

### 1. Constrained Multi-Agent Customer Support & Automated Ordering *(Freelance R&D, 06/2025 – 10/2025)*
- **Role:** Lead AI Engineer — Agent State Machine, Runtime Invariants & Hybrid RAG (3-member team)
- **Source Code (Shared team repositories hosted under teammate Thanh Huynh's GitHub):**
  - Core ReAct Agent & Hooks: [`github.com/thanhhuynhk17/langgraph_re_act_agent`](https://github.com/thanhhuynhk17/langgraph_re_act_agent)
  - Hybrid Search & Ablation Eval: [`github.com/thanhhuynhk17/graph_rag`](https://github.com/thanhhuynhk17/graph_rag)
- **Demo Videos (YouTube):**
  - 📺 [LangGraph Core AI Agent & State Machine](https://www.youtube.com/watch?v=RHZPNONKj3Q)
  - 💬 [Live Facebook Messenger Integration](https://www.youtube.com/watch?v=fmhQLR4_IHE)
- **Technical Report:** [Multi-Agent Workflow & Runtime Invariant Enforcement with LangGraph](/en/posts/multi-agent-workflow-langraph/)
- **Direct Engineering Contributions by Le Quang Vinh:**
  - **ReAct State Machine & Pre/Post-Model Hooks (`src/agent.py`, `src/utils/helpers.py`):** Designed the LangGraph workflow (`get_graph`) enforcing `stop_sequences=["<react_observation"]` at the token decoder level to physically prevent fabricated tool outputs; implemented `use_pre_hook` for XML message normalization and `use_post_hook` + `_detect_tool` to strip `<think>...</think>` traces, validate tool names against `all_tools`, and trigger deterministic state rollback via `Command(goto="pre_model_hook")` upon syntax violations.
  - **Runtime Invariant Verification & Human-in-the-Loop (`src/utils/schemas.py`, `src/utils/tools.py`, `src/utils/interrupt_any_tool.py`):** Implemented Pydantic v2 `@model_validator(mode="after")` on `Dish` and `TakeOrderInput` to enforce catalog referential integrity `(id, name_of_food)` against `comque_new.csv` and temporal ordering invariants `booking_time >= pendulum.now('Asia/Ho_Chi_Minh')`; integrated LangGraph `interrupt()` to freeze graph execution for human approval before committing state-mutating orders (`TakeOrder`, `DeleteOrderTool`, `UpdateOrderTool`).
  - **Hybrid Search & Ablation Benchmarks (`graph_rag/src/utils/hybridsearch.py`, `search_hit_k_eval.py`):** Engineered `HybridRetrieverPipeline` combining `BM25Retriever` + `Neo4jVector` (`EnsembleRetriever`) with a Cross-Encoder Reranker (`BAAI/bge-reranker-v2-m3`). Ablation evaluation across 320 product records (`hoanghamobile_with_summary.csv` $\times$ 5 Vietnamese query templates) demonstrated: Pure Embedding (`Qwen3-0.6B`) achieved `65.31% Hit@1` $\rightarrow$ adding `bge-reranker-v2-m3` jumped to **85.63% Hit@1 / 97.81% Hit@5** $\rightarrow$ **Hybrid BM25 + Embedding + Reranker** reached **86.88% Hit@1 / 99.69% Hit@20** (and **88.13% Hit@1 / 98.13% Hit@5 / 100% Hit@20** with `Qwen3-8B`). Combined with structured category/taste pre-filtering across 3,200 F&B and retail queries, the system achieved **95% Hit@1** and **99% Hit@5**.
  - **Semantic Intent Router (`semantic-router`):** Built a 3-class dialogue intent classifier (`binh_thuong`, `crawl_data`, `tao_lao`) evaluated via Top-2 Cosine Similarity cumulative probability matrices.
- **Core Tech Stack:** Python, LangGraph, FastMCP, Pydantic v2, BAML, vLLM, Neo4j, BM25, `BAAI/bge-reranker-v2-m3`, FastAPI, Facebook Messenger Webhook.

### 2. AI-Doodle (`aidoodle-cli`) & Claw-CLI — Deterministic Saga Engine & Safety Policy Sandbox *(2026)*
- **Repositories:** [`github.com/vinh-gogo/aidoodle-cli`](https://github.com/vinh-gogo/aidoodle-cli) (Go) · [`github.com/vinh-gogo/claw-cli`](https://github.com/vinh-gogo/claw-cli) (Python + ONNX)
- **Engineering & Contributions:**
  - **`aidoodle-cli` (Go 1.25):** Built a CLI orchestration engine for long-form fiction generation and pure-Go **W3C EPUB 3.3** compilation. Engineered a **Deterministic Saga Engine** (`internal/orchestrator/saga.go`) persisting transactional state (`SagaLog`: `completed_steps`, `compensation_log`), enabling exact step-level resumption after crashes without re-invoking completed LLM calls.
  - **Mechanical Output Validators (`internal/orchestrator/validators.go`):** Implemented deterministic post-generation validators (minimum word thresholds, duplicate paragraph loop detection, `[Note:`/`[TODO:` meta-talk leak rejection, and protagonist entity verification) with a bounded single-retry self-correction loop.
  - **`claw-cli` (Voice & Text Terminal Agent):** Integrated **Silero VAD v5 (ONNX Runtime)** for real-time CPU voice activity detection and a **4-Tier Safety Policy Sandbox** classifying every system tool into 4 risk levels (`read`, `write`, `exec`, `dangerous`), enforcing explicit user confirmation before file mutations or shell execution.
- **Core Tech Stack:** Go (Golang), Python, ONNX Runtime (Silero VAD v5), Saga Pattern, Mechanical Validators, W3C EPUB 3.3.

### 3. AI Lingua & Skills-KMP — Type-Driven Cross-Platform Architecture *(2026)*
- **Repositories:** [`github.com/Vinh-Gogo/ai-english`](https://github.com/Vinh-Gogo/ai-english) · [`github.com/vinh-gogo/skills-kmp`](https://github.com/vinh-gogo/skills-kmp)
- **Technical Reports:** [Offline-First Language Learning Architecture with KMP & AI](/en/posts/on-device-ai-onnx-kotlin/) · [Modern Software Architecture with KMP](/en/posts/skills-kmp-architecture-design-patterns/)
- **Engineering & Contributions:**
  - **Type-Driven Design & Algebraic Data Types:** Built cross-platform applications (Desktop JVM & Android) using **5-Tier Clean Architecture** and **MVI**, sharing **85%** of code. Modeled all UI states (`UiState`), user intents (`UiIntent`), and domain errors (`AppError`) as **Algebraic Data Types (ADT: `sealed interface` Sum Types & `data class` Product Types)**, enforcing compiler-checked exhaustiveness across state transitions.
  - **Compile-Time Domain Invariants & Functional Error Handling:** Enforced domain invariants without heap allocation overhead using `@JvmInline value class` (`EmailAddress`, `NoteId`) coupled with **Arrow Core** `Either<AppError, T>` (Railway-Oriented Programming), keeping `:shared:domain` 100% pure and free of unchecked runtime exceptions or I/O side effects.
  - **On-Device Algorithms & Data Structures:** Implemented custom **Prefix Trees (`VietnameseDictionaryTrie` / `EnglishDictionaryTrie`)** for $O(L)$ prefix lookup, a **$1 Unistroke `GeometricRecognizer`** (64-point equidistant resampling, centroid translation, and 250px bounding-box scaling), and the **FSRS** spaced repetition memory model ($D, S, R$ state transitions persisted in **3NF SQLDelight SQLite**, reducing review load by 23% vs. SM-2).
- **Core Tech Stack:** Kotlin Multiplatform (KMP), Compose Multiplatform, Arrow Core (`Either`), SQLDelight (3NF), Ktor Client, FSRS, Prefix Trie, Geometric Recognizer.

### 4. Open Video Lab — Multimodal AI Video Generation *(2026)*
- **Repository:** [`github.com/vinh-gogo/open-video-lab`](https://github.com/vinh-gogo/open-video-lab)
- **Technical Report:** [Mastering Video Diffusion with Open Video Lab](/en/posts/openvideolab-video-diffusion/)
- **Engineering & Contributions:**
  - Built an end-to-end orchestration pipeline for multimodal video synthesis (Text/Image/Audio-to-Video) leveraging Diffusion Transformers (LTX-2.5, MiniMax, Wan).
  - Implemented **Multi-Subject Reference (MSR)** cross-attention intervention to maintain subject consistency across sequential shots.
  - Optimized inference with **Quantization (int8/fp4)**, reducing VRAM footprint from 24GB to **<14GB** to run reliably on 16GB GPUs (<60s/scene), with integrated **RIFE** 48/96fps frame interpolation.
- **Core Tech Stack:** PyTorch, Diffusion Transformers (DiT), Quantization (int8/fp4), TurboLoRA, RIFE.

---

## 4. Academic Research & Graduation Thesis

### Monocular Depth Estimation Based on Deep Convolutional Neural Networks *(SSRC 2024)*
- **Publication:** Student Scientific Research Conference (SSRC 2024) — Faculty of Information Technology, Industrial University of Ho Chi Minh City (IUH)
- **Repository:** [`github.com/Vinh-Gogo/depth-estimation`](https://github.com/Vinh-Gogo/depth-estimation)
- **Full Thesis Manuscript (English PDF):** [Report_GRADUATION_THESIS.pdf](/posts/depth-estimation-cnn-ssrc/Report_GRADUATION_THESIS.pdf) | **Technical Report:** [Thesis Architecture & Experimental Analysis](/en/posts/depth-estimation-cnn-ssrc/)
- **Thesis Grade:** **4.0/4.0 (Excellent)**
- **Engineering & Contributions:**
  - **Hybrid ResNet–DenseNet U-Net Architecture:** Conducted controlled comparative experiments across 3 deep CNN architectures for Monocular Depth Estimation on the **LineMOD RGB-D Dataset** (~4,800 training images and **1,200 hold-out test images** at $192 \times 256$ resolution captured by a PrimeSense Carmine sensor): (1) **CAE ResNet** (64 layers, 7.09M params), (2) **U-Net ResNet** (68 layers, 7.80M params), and (3) **Enhanced U-Net with Hybrid ResNet–DenseNet Backbone** (105 layers, **7.51M params**—3.7% lighter than standard U-Net via Dense Block feature reuse; extended with a 3M-parameter lightweight variant and a 13M-parameter **Squeeze-and-Excitation (SE) Attention** variant).
  - **Multi-Component Loss Function:** Formulated a composite objective combining pixel-wise $\mathcal{L}_1$, structural similarity ($\mathcal{L}_{SSIM}$), and spatial image gradients ($\mathcal{L}_{grad}$) to eliminate boundary blurring inherent to standard $\mathcal{L}_2$ regression.
  - **Quantitative Results on 1,200 Hold-out Test Images (LineMOD):** Achieved **RMSE `0.0370`** (improved from `0.0410` in CAE ResNet), **MAE `0.0175`**, **MSE `0.0016`**, **Cosine Similarity `0.974`**, **Pixel Accuracy `0.819`**, a **32.4% reduction in Wasserstein Distance** (`14.20` down to `9.603`), **Hausdorff Distance `10.65`**, and **92.5% (1,123/1,214 test images)** satisfying the strict maximum depth deviation threshold $< 0.1$.

---

## 5. Technical Competencies

| Domain | Key Skills & Technologies |
|---|---|
| **LLM Reliability, Applied Type Systems & Algorithms** | Runtime Invariants (`pre/post_model_hook`, Stop Sequences, Pydantic v2, BAML AST), Algebraic Data Types (Kotlin `sealed interface`, `@JvmInline value class`), Functional Error Handling (Arrow `Either<L, R>`), Deterministic Saga State Machines, Prefix Tree (`Trie`), `$1` Geometric Recognizer, FSRS Memory Modeling |
| **AI Agentic & RAG Systems** | LangGraph, FastMCP, Semantic Router, Hybrid Search (BM25 + Dense Vector + Cross-Encoder `bge-reranker-v2-m3`), Dual-Collection Qdrant, GraphRAG (Neo4j), vLLM Serving |
| **Generative AI & Computer Vision** | Diffusion Transformers (DiT), Multi-Subject Consistency, Quantization (`int8`/`fp4`), LoRA Fine-tuning, Deep CNNs (ResNet, DenseNet, U-Net, SE-Attention), ONNX Runtime (Silero VAD v5) |
| **Software Engineering & Cross-Platform** | Kotlin Multiplatform (KMP), Compose Multiplatform, Clean Architecture (5-Tier + Vertical Slicing), MVI, SQLDelight (3NF), RESTful API (FastAPI, Ktor), W3C EPUB 3.3 Engine |
| **Languages & Infrastructure** | **Python**, **Kotlin**, **Go (Golang)**, **SQL** (PostgreSQL, SQLite), C# (.NET), TypeScript, PyTorch, Docker, Git/GitHub, Linux |

