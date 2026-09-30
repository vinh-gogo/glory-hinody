---
date: '2026-09-29T18:39:42+07:00'
draft: false
title: 'Tác Giả // Hồ Sơ Năng Lực'
description: 'Lê Quang Vinh — AI Engineer & Software Engineer. Chuyên sâu về Generative AI, AI Agentic, On-Device AI và Kiến trúc phần mềm.'
layout: about
ShowToc: true
TocOpen: true
hideMeta: true
comments: false
---

# LÊ QUANG VINH
**AI Engineer | Software Engineer**

- **Email:** [lea26462@gmail.com](mailto:lea26462@gmail.com)
- **GitHub:** [github.com/Vinh-Gogo](https://github.com/Vinh-Gogo)
- **LinkedIn:** [linkedin.com/in/quangvinh2302](https://linkedin.com/in/quangvinh2302)
- **Học vấn:** Cử nhân Khoa học Máy tính — Đại học Công nghiệp TP.HCM (IUH, 2021–2025)
- **Ngoại ngữ:** Tiếng Anh B1

---

## 1. Tóm Tắt Nghề Nghiệp

Kỹ sư AI / Phần mềm (Cử nhân KHMT — IUH) với tư duy thực chiến, có nền tảng vững về tối ưu hóa suy luận mô hình và triển khai ứng dụng thực tế. Ở vị trí Junior, mục tiêu lớn nhất của tôi là dốc sức cọ xát cùng đội ngũ kỹ thuật giàu kinh nghiệm, mang lại giá trị đo lường được cho sản phẩm và từng bước tích lũy năng lực để đảm đương những bài toán quy mô lớn hơn.

---

## 2. Kinh Nghiệm Làm Việc

### WETEC — Công ty Cổ phần Công nghệ Năng lượng & Môi trường Nước
**Thực tập sinh AI (AI Engineer Intern)** *(10/2025 – 12/2025)*  
**Mã nguồn:** [`github.com/Vinh-Gogo/pdf-rag`](https://github.com/Vinh-Gogo/pdf-rag)

- Xây dựng pipeline tự động thu thập và tiền xử lý dữ liệu với **Firecrawl AI**.
- Triển khai hệ thống Semantic RAG & Knowledge Base xử lý tài liệu kỹ thuật PDF phức tạp (>200 trang), kết hợp **Neo4j** và **Qdrant** giúp rút ngắn thời gian truy xuất xuống **<2 giây** và hạn chế tối đa ảo giác thông tin (Hallucination).
- **Công nghệ:** GraphRAG (Neo4j, Qdrant), LangGraph, FastAPI, Docker.

---

## 3. Dự Án Tiêu Biểu & Minh Chứng Thực Tế

### 1. Open Video Lab — Tạo Sinh Video Đa Phương Thức *(2026)*
- **Mã nguồn:** [`github.com/vinh-gogo/open-video-lab`](https://github.com/vinh-gogo/open-video-lab)
- **Video Demo LTX:** [`vt.tiktok.com/ZSbk6H2FT/`](https://vt.tiktok.com/ZSbk6H2FT/)
- **Video Demo MiniMax:** [`vt.tiktok.com/ZSbkMLwVv/`](https://vt.tiktok.com/ZSbkMLwVv/)
- **Nền tảng:** Web UI (Gradio), Google Colab, Local GPU.
- **Kỹ thuật:** Xây dựng pipeline sinh video đa phương thức linh hoạt (Text/Image-to-Video First/Last Frame, Audio-to-Video) và duy trì tính nhất quán nhân vật (MSR). Tối ưu hóa suy luận với Quantization (int8/fp4) chạy ổn định trên GPU 16GB (<60s/cảnh), tự động ghép nối phân cảnh và nâng mượt 48/96fps (RIFE).
- **Công nghệ:** PyTorch, Diffusion Transformers (DiT), Quantization (int8/fp4), TurboLoRA.

### 2. AI Lingua — Nền Tảng Học Ngoại Ngữ Đa Nền Tảng *(2026)*
- **Mã nguồn:** [`github.com/Vinh-Gogo/ai-english`](https://github.com/Vinh-Gogo/ai-english)
- **Video Demo:** [`vt.tiktok.com/ZSbkSYhjv/`](https://vt.tiktok.com/ZSbkSYhjv/)
- **Nền tảng:** Desktop & Mobile (iOS & Android).
- **Kỹ thuật:** Áp dụng kiến trúc KMP & MVI (Unidirectional Data Flow) kết hợp Vertical Slicing, tối đa hóa chia sẻ mã nguồn UI và logic. Tích hợp On-Device Neural AI (ONNX) nhận diện nét viết offline, loại bỏ 100% chi phí cloud API; kết hợp thuật toán lặp lại ngắt quãng FSRS tối ưu hóa ghi nhớ từ vựng (-23% lượt ôn so với SM-2). Thiết kế cơ chế LLM Fallback Chain tự động chuyển đổi mô hình dự phòng khi quá tải hoặc đứt mạng, duy trì phản hồi 24/7.
- **Công nghệ:** On-Device AI (ONNX Runtime), Kotlin Multiplatform (KMP), Compose Multiplatform, Thuật toán FSRS.

### 3. Hệ Thống AI Agentic (Automation Agent) *(Freelancer, 06/2025 – 10/2025)*
- **Video Demo YouTube:** [`youtu.be/R_IvnHsHmTw`](https://youtu.be/R_IvnHsHmTw)
- **Video Demo LinkedIn:** [`lnkd.in/p/ejjivmDG`](https://lnkd.in/p/ejjivmDG)
- **Kỹ thuật:** Xây dựng hệ thống Multi-Agent tự động hóa CSKH đa tác vụ (tra cứu thông tin, lập hóa đơn tự động); thiết kế pipeline tìm kiếm lai (Semantic + BM25) tích hợp tiền xử lý tiếng Việt chuyên sâu. Đạt độ chính xác 95% Hit@1 và 99% Hit@5 trên 3.200 truy vấn kiểm thử (2 tập dữ liệu: ẩm thực và điện thoại); cấu hình vLLM trên GPU A100 phục vụ xử lý song song.
- **Công nghệ:** FastMCP (Model Context Protocol), LangGraph, vLLM (Serving A100), Hybrid Search (Semantic + BM25).

---

## 4. Nghiên Cứu Khoa Học & Dự Án Khác

- **Luận văn: Ước lượng độ sâu ảnh đơn dựa trên CNN**  
  *Công bố tại Hội nghị Khoa học SSRC* — Mã nguồn: [`github.com/Vinh-Gogo/depth-estimation`](https://github.com/Vinh-Gogo/depth-estimation). Cải thiện hiệu suất các kiến trúc U-Net, ResNet, DenseNet và mô phỏng đám mây điểm 3D (Point Cloud). Khóa luận đạt điểm tuyệt đối 4.0/4.0.
- **Hệ thống sinh mô hình 3D từ ảnh (Image-to-3D AI):**  
  Triển khai pipeline tái tạo mô hình không gian 3D (Mesh/GLB/OBJ) từ ảnh 2D đơn lẻ, tối ưu hóa suy luận và kết xuất bề mặt phục vụ ứng dụng đồ họa.

---

## 5. Kỹ Năng Chuyên Môn

| Lĩnh vực | Công nghệ cốt lõi |
|---|---|
| **Generative AI & Multimodal** | Diffusion Transformers (DiT), Multi-Subject Consistency, Quantization (int8/fp4), TurboLoRA, RIFE AI. |
| **AI Agentic & RAG** | Multi-Agent Workflows, FastMCP, LangGraph, GraphRAG (Neo4j, Qdrant), vLLM, On-Device AI (ONNX Runtime). |
| **Kiến trúc & Nền tảng** | Kotlin Multiplatform (KMP), Compose Multiplatform, Clean Architecture, Strict Vertical Slicing, MVI. |
| **Ngôn ngữ & Công cụ** | Python, Kotlin, PyTorch, FastAPI, Docker Compose, Linux, Git. |
