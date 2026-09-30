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
**AI Engineer | Software Engineer**

- **Email:** [lea26462@gmail.com](mailto:lea26462@gmail.com)
- **GitHub:** [github.com/Vinh-Gogo](https://github.com/Vinh-Gogo)
- **LinkedIn:** [linkedin.com/in/quangvinh2302](https://linkedin.com/in/quangvinh2302)
- **Education:** B.S. in Computer Science — Industrial University of Ho Chi Minh City (IUH, 2021–2025)
- **Languages:** English (B1), Vietnamese (Native)

---

## 1. Professional Summary

AI & Software Engineer (B.S. in Computer Science — IUH) with a pragmatic, production-first engineering mindset, grounded in model inference optimization and real-world system delivery. As a Junior engineer, my core mission is to collaborate closely with experienced technical teams, deliver measurable product impact, and continuously earn trust and capability to take on larger, mission-critical challenges.

---

## 2. Work Experience

### WETEC — Water Environment & Technology Energy Corporation
**AI Engineer Intern** *(10/2025 – 12/2025)*  
**Source Code:** [`github.com/Vinh-Gogo/pdf-rag`](https://github.com/Vinh-Gogo/pdf-rag)

- Engineered an automated data collection and preprocessing pipeline using **Firecrawl AI**.
- Deployed a Semantic RAG & Knowledge Base architecture handling complex PDF technical documentation (>200 pages), fusing **Neo4j** and **Qdrant** to cut retrieval latencies to **<2 seconds** while eliminating hallucination risks.
- **Tech Stack:** GraphRAG (Neo4j, Qdrant), LangGraph, FastAPI, Docker.

---

## 3. Flagship Projects & Live Proofs

### 1. Open Video Lab — Multimodal Video Generation *(2026)*
- **Repository:** [`github.com/vinh-gogo/open-video-lab`](https://github.com/vinh-gogo/open-video-lab)
- **Demo Video (LTX):** [`vt.tiktok.com/ZSbk6H2FT/`](https://vt.tiktok.com/ZSbk6H2FT/)
- **Demo Video (MiniMax):** [`vt.tiktok.com/ZSbkMLwVv/`](https://vt.tiktok.com/ZSbkMLwVv/)
- **Environment:** Web UI (Gradio), Google Colab, Local GPUs.
- **Engineering:** Built an end-to-end multimodal video generation pipeline (Text/Image-to-Video First/Last Frame, Audio-to-Video) with character consistency (MSR). Optimized inference with int8/fp4 Quantization running stably on 16GB GPUs (<60s/scene), automated shot stitching, and 48/96fps frame interpolation (RIFE).
- **Tech Stack:** PyTorch, Diffusion Transformers (DiT), Quantization (int8/fp4), TurboLoRA.

### 2. AI Lingua — Cross-Platform Language Learning *(2026)*
- **Repository:** [`github.com/Vinh-Gogo/ai-english`](https://github.com/Vinh-Gogo/ai-english)
- **Demo Video:** [`vt.tiktok.com/ZSbkSYhjv/`](https://vt.tiktok.com/ZSbkSYhjv/)
- **Target:** Desktop & Mobile (iOS & Android).
- **Engineering:** Implemented KMP & MVI (Unidirectional Data Flow) with strict Vertical Slicing to maximize UI and logic sharing. Integrated On-Device Neural AI (ONNX) for offline handwriting recognition, cutting cloud API expenses to zero; adopted the FSRS spaced repetition algorithm to optimize retention (-23% reviews compared to SM-2). Architected an LLM Fallback Chain for automatic failover during outages, guaranteeing 24/7 responsiveness.
- **Tech Stack:** On-Device AI (ONNX Runtime), Kotlin Multiplatform (KMP), Compose Multiplatform, FSRS Spaced Repetition.

### 3. Agentic AI Automation System *(Freelance, 06/2025 – 10/2025)*
- **Demo Video (YouTube):** [`youtu.be/R_IvnHsHmTw`](https://youtu.be/R_IvnHsHmTw)
- **Demo Video (LinkedIn):** [`lnkd.in/p/ejjivmDG`](https://lnkd.in/p/ejjivmDG)
- **Engineering:** Constructed a multi-agent automation workflow for customer support and automated invoicing; developed a hybrid retrieval pipeline (Semantic + BM25) with specialized Vietnamese text normalization. Attained 95% Hit@1 and 99% Hit@5 across 3,200 benchmark test queries; configured vLLM on an A100 GPU for parallel processing.
- **Tech Stack:** FastMCP (Model Context Protocol), LangGraph, vLLM (Serving A100), Hybrid Search (Semantic + BM25).

---

## 4. Academic Research & Publications

- **Thesis: Monocular Depth Estimation Based on Deep CNNs**  
  *Published at SSRC Scientific Conference* — Repository: [`github.com/Vinh-Gogo/depth-estimation`](https://github.com/Vinh-Gogo/depth-estimation). Benchmarked and enhanced U-Net, ResNet, and DenseNet architectures alongside 3D point-cloud reconstruction. Awarded a perfect 4.0/4.0 thesis grade.
- **Single Image-to-3D Reconstruction Pipeline:**  
  Engineered an automated pipeline reconstructing 3D meshes (Mesh/GLB/OBJ) from single 2D images, optimizing surface generation and rendering for graphics workflows.

---

## 5. Technical Competencies

| Domain | Core Technologies |
|---|---|
| **Generative AI & Multimodal** | Diffusion Transformers (DiT), Multi-Subject Consistency, Quantization (int8/fp4), TurboLoRA, RIFE AI. |
| **Agentic AI & RAG** | Multi-Agent Workflows, FastMCP, LangGraph, GraphRAG (Neo4j, Qdrant), vLLM, On-Device AI (ONNX Runtime). |
| **Architecture & Platform** | Kotlin Multiplatform (KMP), Compose Multiplatform, Clean Architecture, Strict Vertical Slicing, MVI. |
| **Languages & Tools** | Python, Kotlin, PyTorch, FastAPI, Docker Compose, Linux, Git. |
