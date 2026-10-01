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
**Junior AI Engineer | Software Engineer**

- **Địa điểm:** TP. Hồ Chí Minh, Việt Nam
- **Email:** [lea26462@gmail.com](mailto:lea26462@gmail.com)
- **Điện thoại:** [+84 985 189 541](tel:+84985189541)
- **GitHub:** [github.com/Vinh-Gogo](https://github.com/Vinh-Gogo)
- **LinkedIn:** [linkedin.com/in/quangvinh2302](https://linkedin.com/in/quangvinh2302)
- **Website:** [glory-hinody.pages.dev](https://glory-hinody.pages.dev)
- **Bản in CV (LaTeX):** [cv.latex](/cv.latex)
- **Học vấn:** Cử nhân Khoa học Máy tính — Đại học Công nghiệp TP.HCM (IUH, 2021–2025)
- **Ngoại ngữ:** Đọc hiểu tài liệu kỹ thuật chuyên sâu (B1 / CEFR)

---

## 1. Tóm Tắt Nghề Nghiệp

Kỹ sư AI (Cử nhân KHMT, IUH) chuyên sâu về RAG, AI Agent và tối ưu suy luận mô hình. Đã xây dựng hệ thống GraphRAG xử lý tài liệu kỹ thuật >200 trang (truy xuất <2s), hệ thống Multi-Agent CSKH đạt **95% Hit@1** và **99% Hit@5** trên 3.200 truy vấn kiểm thử thực tế, và pipeline sinh video đa phương thức chạy mượt trên GPU 16GB nhờ kỹ thuật Quantization (int8/fp4). Tìm kiếm vị trí Junior AI/LLM Engineer để trực tiếp đóng góp vào việc đưa các giải pháp RAG và Agent vào môi trường sản xuất (production).

---

## 2. Kinh Nghiệm Làm Việc

### WETEC — Công ty Cổ phần Công nghệ Năng lượng & Môi trường Nước
**Thực tập sinh AI (AI Engineer Intern)** *(10/2025 – 12/2025)*  
**Mã nguồn:** [`github.com/Vinh-Gogo/pdf-rag`](https://github.com/Vinh-Gogo/pdf-rag)

- Xây dựng pipeline tự động thu thập và tiền xử lý tài liệu quy chuẩn kỹ thuật nước phức tạp (>200 trang) bằng **Firecrawl AI**.
- Thiết kế kiến trúc **Semantic GraphRAG** kết hợp Knowledge Graph (**Neo4j**) và Vector Search (**Qdrant**), rút ngắn thời gian truy xuất xuống **<2 giây** và loại bỏ hiện tượng trích dẫn sai số liệu/điều khoản so với RAG truyền thống.
- Đóng gói và triển khai REST API với **FastAPI** và **Docker**, phục vụ tra cứu quy chuẩn nội bộ phòng kỹ thuật.
- **Công nghệ cốt lõi:** GraphRAG (Neo4j, Qdrant), LangGraph, FastAPI, Docker.

---

## 3. Dự Án Tiêu Biểu & Minh Chứng Thực Tế

### 1. Hệ Thống Multi-Agent CSKH & Đặt Hàng Tự Động *(Freelance, 06/2025 – 10/2025)*
- **Vai trò:** Kỹ sư AI chính (Nhóm 3 thành viên)
- **Video Demo YouTube:**
  - 📺 [Demo AI Agent LangGraph (Core & State Machine)](https://www.youtube.com/watch?v=RHZPNONKj3Q)
  - 💬 [Demo Trực Tiếp Facebook Messenger](https://www.youtube.com/watch?v=fmhQLR4_IHE)
- **Báo cáo kỹ thuật:** [Kiến trúc Multi-Agent Workflow với LangGraph](/posts/multi-agent-workflow-langraph/)
- **Kỹ thuật & Đóng góp:**
  - Kết hợp kiến trúc multi-agent (Semantic Router) tự động hóa CSKH và đặt hàng: nhận diện ý định, tra menu, đối soát tồn kho, xuất hóa đơn cho chuỗi F&B; mở rộng sang tư vấn bất động sản.
  - Cải thiện RAG bằng Hybrid Search (Semantic + BM25): **95% Hit@1**, **99% Hit@5** trên 3.200 truy vấn gán nhãn từ log hội thoại.
  - Chuyển đổi số hóa từ dữ liệu xlsx để phục vụ cho hệ thống (Ảnh, văn bản, chuẩn hóa cấu trúc).
- **Công nghệ cốt lõi:** FastMCP, LangGraph, vLLM (Serving A100), Hybrid Search (Neo4j, BM25), FastAPI, Facebook Messenger Webhook.

### 2. Open Video Lab — Pipeline Tạo Sinh Video AI Đa Phương Thức *(2026)*
- **Mã nguồn:** [`github.com/vinh-gogo/open-video-lab`](https://github.com/vinh-gogo/open-video-lab)
- **Báo cáo kỹ thuật:** [Làm chủ Video Diffusion với Open Video Lab](/posts/openvideolab-video-diffusion/)
- **Kỹ thuật & Đóng góp:**
  - Xây dựng pipeline điều phối (orchestration) sinh video đa phương thức (Text/Image/Audio-to-Video) dựa trên các mô hình Diffusion Transformers (LTX-2.5, MiniMax, Wan).
  - Triển khai kỹ thuật **Multi-Subject Reference (MSR)** can thiệp vào Cross-Attention nhằm duy trì tính nhất quán nhân vật qua nhiều cảnh nối tiếp.
  - Tối ưu hóa suy luận với **Quantization (int8/fp4)**, giảm mức VRAM từ 24GB xuống **<14GB** giúp chạy ổn định trên GPU 16GB (<60s/cảnh), tích hợp **RIFE** nội suy chuyển động 48/96fps.
- **Công nghệ cốt lõi:** PyTorch, Diffusion Transformers (DiT), Quantization (int8/fp4), TurboLoRA, RIFE.

### 3. AI Lingua — Nền Tảng Học Ngoại Ngữ Đa Nền Tảng *(2026)*
- **Mã nguồn:** [`github.com/Vinh-Gogo/ai-english`](https://github.com/Vinh-Gogo/ai-english)
- **Báo cáo kỹ thuật:** [Kiến Trúc Học Ngoại Ngữ Offline-First Với KMP & AI](/posts/on-device-ai-onnx-kotlin/)
- **Kỹ thuật & Đóng góp:**
  - Phát triển ứng dụng đa nền tảng (Desktop Windows/macOS/Linux & Mobile Android) theo kiến trúc **Kotlin Multiplatform (KMP)**, Vertical Slicing và Clean Architecture 5 lớp kết hợp MVI, chia sẻ **85%** mã nguồn logic và giao diện Compose.
  - Xây dựng Handwriting Pad nhận diện nét viết tay cục bộ với bộ nhận diện hình học (**GeometricRecognizer**) kết hợp cấu trúc Trie từ điển (**VietnameseDictionaryTrie / EnglishDictionaryTrie**), loại bỏ 100% chi phí cloud API.
  - Thiết kế kiến trúc Offline-First với cơ sở dữ liệu **SQLDelight SQLite chuẩn hóa 3NF**, tích hợp thuật toán lặp lại ngắt quãng **FSRS** (-23% lượt ôn so với SM-2) và cơ chế **LLM Fallback Chain** (Gemini + Novita AI) qua Ktor Client tự động chuyển đổi khi quá tải hoặc đứt mạng.
- **Công nghệ cốt lõi:** Kotlin Multiplatform (KMP), Compose Multiplatform, SQLDelight SQLite, Ktor, Thuật toán FSRS.

---

## 4. Nghiên Cứu Khoa Học & Khóa Luận

### Ước Lượng Độ Sâu Ảnh Đơn Dựa Trên Mạng Nơ-ron Tích Chập (CNN) *(SSRC 2024)*
- **Công bố:** Hội nghị Khoa học Sinh viên (SSRC 2024)
- **Mã nguồn:** [`github.com/Vinh-Gogo/depth-estimation`](https://github.com/Vinh-Gogo/depth-estimation)
- **Điểm khóa luận:** 4.0/4.0 (Xuất sắc)
- **Kỹ thuật & Đóng góp:**
  - Đề xuất kiến trúc lai ghép ResNet-DenseNet kết hợp Skip-Connection cải tiến của U-Net trong bài toán Monocular Depth Estimation trên tập dữ liệu chuẩn **NYU Depth v2**.
  - Đạt sai số **RMSE 0.485** và tỷ lệ ngưỡng độ chính xác **$\delta < 1.25$ đạt 86.2%** (cải thiện 12% so với baseline U-Net tiêu chuẩn).
  - Tái tạo đám mây điểm 3D (Point Cloud) thời gian thực phục vụ ứng dụng thị giác máy tính.

---

## 5. Kỹ Năng Chuyên Môn

| Lĩnh vực | Kỹ năng & Công nghệ cốt lõi |
|---|---|
| **AI Agentic & RAG** | Multi-Agent Workflows, FastMCP, LangGraph, GraphRAG (Neo4j, Qdrant), vLLM Serving, Prompt Engineering |
| **Generative AI & Vision** | Diffusion Transformers (DiT), Multi-Subject Consistency, Quantization (int8/fp4), LoRA Fine-tuning, CNNs |
| **Kỹ thuật Phần mềm & Nền tảng** | Kotlin Multiplatform (KMP), Compose Multiplatform, Clean Architecture, RESTful API, On-Device AI (ONNX) |
| **Ngôn ngữ & Công cụ** | Python, Kotlin, PyTorch, FastAPI, Docker, Git/GitHub, Linux, PostgreSQL, SQL |
