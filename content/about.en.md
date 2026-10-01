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
**Junior AI Engineer | Software Engineer**

- **Location:** Ho Chi Minh City, Vietnam
- **Email:** [lea26462@gmail.com](mailto:lea26462@gmail.com)
- **Phone:** [+84 985 189 541](tel:+84985189541)
- **GitHub:** [github.com/Vinh-Gogo](https://github.com/Vinh-Gogo)
- **LinkedIn:** [linkedin.com/in/quangvinh2302](https://linkedin.com/in/quangvinh2302)
- **Website:** [glory-hinody.pages.dev](https://glory-hinody.pages.dev)
- **Printable CV (LaTeX):** [cv.latex](/cv.latex)
- **Education:** B.S. in Computer Science — Industrial University of Ho Chi Minh City (IUH, 2021–2025)
- **Languages:** Technical Reading Proficiency (B1 / CEFR), Vietnamese (Native)

---

## 1. Professional Summary

AI Engineer (B.S. in Computer Science, IUH) specializing in RAG, Agentic AI, and model inference optimization. Built GraphRAG systems handling >200-page complex technical PDFs (<2s latency), a multi-agent customer support system achieving **95% Hit@1** and **99% Hit@5** across 3,200 real-world benchmark queries, and a multimodal video generation pipeline running smoothly on 16GB GPUs via quantization (int8/fp4). Seeking a Junior AI/LLM Engineer role to deploy enterprise-grade RAG and Agent systems into production environments.

---

## 2. Work Experience

### WETEC — Water Environment & Technology Energy Corporation
**AI Engineer Intern** *(10/2025 – 12/2025)*  
**Source Code:** [`github.com/Vinh-Gogo/pdf-rag`](https://github.com/Vinh-Gogo/pdf-rag)

- Engineered an automated data collection and preprocessing pipeline for complex technical water standards (>200 pages) using **Firecrawl AI**.
- Architected a **Semantic GraphRAG** system fusing Knowledge Graph (**Neo4j**) and Vector Search (**Qdrant**), reducing query retrieval latency to **<2 seconds** while eliminating hallucination and clause citation inaccuracies compared to baseline RAG.
- Packaged and deployed RESTful APIs with **FastAPI** and **Docker** for internal engineering standard lookups.
- **Core Tech Stack:** GraphRAG (Neo4j, Qdrant), LangGraph, FastAPI, Docker.

---

## 3. Flagship Projects & Live Proofs

### 1. Multi-Agent Customer Support & Automated Invoicing *(Freelance, 06/2025 – 10/2025)*
- **Role:** Lead AI Engineer (3-member team)
- **Demo Videos (YouTube):**
  - 📺 [LangGraph Core AI Agent & State Machine](https://www.youtube.com/watch?v=RHZPNONKj3Q)
  - 💬 [Live Facebook Messenger Integration](https://www.youtube.com/watch?v=fmhQLR4_IHE)
- **Technical Report:** [Multi-Agent Workflow Architecture with LangGraph](/posts/multi-agent-workflow-langraph/)
- **Engineering & Contributions:**
  - Integrated a multi-agent architecture with **Semantic Router** automating customer service and ordering: intent classification, menu querying, real-time inventory reconciliation, and auto-invoicing for F&B chains; extended to real estate consulting.
  - Supercharged RAG using **Hybrid Search (Semantic + BM25)**: achieved **95% Hit@1** and **99% Hit@5** across 3,200 labeled queries from real customer dialogue logs.
  - Designed an end-to-end digitization pipeline from raw `.xlsx` enterprise data (embedded images, unmerging text structures, and multi-sink synchronization).
- **Core Tech Stack:** FastMCP, LangGraph, vLLM (Serving A100), Hybrid Search (Neo4j, BM25), FastAPI, Facebook Messenger Webhook.

### 2. Open Video Lab — Multimodal AI Video Generation *(2026)*
- **Repository:** [`github.com/vinh-gogo/open-video-lab`](https://github.com/vinh-gogo/open-video-lab)
- **Technical Report:** [Mastering Video Diffusion with Open Video Lab](/posts/openvideolab-video-diffusion/)
- **Engineering & Contributions:**
  - Built an end-to-end orchestration pipeline for multimodal video synthesis (Text/Image/Audio-to-Video) leveraging Diffusion Transformers (LTX-2.5, MiniMax, Wan).
  - Implemented **Multi-Subject Reference (MSR)** cross-attention intervention to maintain subject consistency across sequential shots.
  - Optimized inference with **Quantization (int8/fp4)**, reducing VRAM footprint from 24GB to **<14GB** to run reliably on 16GB GPUs (<60s/scene), with integrated **RIFE** 48/96fps frame interpolation.
- **Core Tech Stack:** PyTorch, Diffusion Transformers (DiT), Quantization (int8/fp4), TurboLoRA, RIFE.

### 3. AI Lingua — Cross-Platform Language Learning Platform *(2026)*
- **Repository:** [`github.com/Vinh-Gogo/ai-english`](https://github.com/Vinh-Gogo/ai-english)
- **Technical Report:** [Offline-First Language Learning Architecture with KMP & AI](/posts/on-device-ai-onnx-kotlin/)
- **Engineering & Contributions:**
  - Developed cross-platform applications (Desktop Windows/macOS/Linux & Mobile Android) using **Kotlin Multiplatform (KMP)**, Vertical Slicing, and 5-tier Clean Architecture with MVI, sharing **85%** of business logic and Compose UI code.
  - Built an offline Handwriting Pad utilizing a local geometric engine (**GeometricRecognizer**) coupled with prefix tree dictionaries (**VietnameseDictionaryTrie / EnglishDictionaryTrie**), cutting cloud vision API costs to zero.
  - Architected an Offline-First system powered by a **normalized 3NF SQLDelight SQLite** database, integrated the **FSRS** spaced repetition algorithm (-23% reviews compared to SM-2), and engineered an **LLM Fallback Chain** (Gemini + Novita AI) via Ktor Client for automated failover during outages.
- **Core Tech Stack:** Kotlin Multiplatform (KMP), Compose Multiplatform, SQLDelight SQLite, Ktor, FSRS Spaced Repetition.

---

## 4. Academic Research & Thesis

### Monocular Depth Estimation Based on Deep CNNs *(SSRC 2024)*
- **Publication:** Student Scientific Research Conference (SSRC 2024)
- **Repository:** [`github.com/Vinh-Gogo/depth-estimation`](https://github.com/Vinh-Gogo/depth-estimation)
- **Thesis Grade:** 4.0/4.0 (Excellent)
- **Engineering & Contributions:**
  - Proposed a hybrid ResNet-DenseNet architecture with enhanced U-Net Skip-Connections for Monocular Depth Estimation evaluated on the standard **NYU Depth v2** benchmark.
  - Achieved **RMSE 0.485** and a threshold accuracy ratio of **$\delta < 1.25$ of 86.2%** (a 12% improvement over baseline U-Net).
  - Generated real-time 3D Point Clouds for downstream computer vision and spatial tasks.

---

## 5. Technical Competencies

| Domain | Key Skills & Technologies |
|---|---|
| **AI Agentic & RAG** | Multi-Agent Workflows, FastMCP, LangGraph, GraphRAG (Neo4j, Qdrant), vLLM Serving, Prompt Engineering |
| **Generative AI & Vision** | Diffusion Transformers (DiT), Multi-Subject Consistency, Quantization (int8/fp4), LoRA Fine-tuning, CNNs |
| **Software Engineering & Platforms** | Kotlin Multiplatform (KMP), Compose Multiplatform, Clean Architecture, RESTful API, On-Device AI (ONNX) |
| **Languages & Tools** | Python, Kotlin, PyTorch, FastAPI, Docker, Git/GitHub, Linux, PostgreSQL, SQL |
