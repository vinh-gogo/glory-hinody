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
**AI & Software Engineer — Deterministic Agentic Systems · Hybrid RAG · Cross-Platform Architecture**

- **Địa điểm:** TP. Hồ Chí Minh, Việt Nam
- **Email:** [lea26462@gmail.com](mailto:lea26462@gmail.com)
- **Điện thoại:** [+84 985 189 541](tel:+84985189541)
- **GitHub:** [github.com/Vinh-Gogo](https://github.com/Vinh-Gogo)
- **LinkedIn:** [linkedin.com/in/quangvinh2302](https://linkedin.com/in/quangvinh2302)
- **Website:** [glory-hinody.pages.dev](https://glory-hinody.pages.dev)
- **Học vấn:** Cử nhân Khoa học Máy tính — Đại học Công nghiệp TP.HCM (IUH, 2021–2025) | **Khóa luận tốt nghiệp: 4.0/4.0 (Xuất sắc)**, công bố tại **SSRC 2024**
- **Ngoại ngữ:** Tiếng Anh chuyên ngành (Đọc hiểu sâu bài báo khoa học/tài liệu đặc tả AI & CS, viết tài liệu kiến trúc hệ thống song ngữ và giao tiếp kỹ thuật); Tiếng Việt (Bản ngữ)

---

## 1. Tóm Tắt Nghề Nghiệp

Kỹ sư AI & Phần mềm (Cử nhân Khoa học Máy tính, IUH) tập trung vào **hệ thống LLM có kiểm soát (Deterministic & Verifiable Agentic Systems)**, **Hybrid GraphRAG**, và **kiến trúc phần mềm an toàn kiểu (Type-Safe Software Architecture)**:

- **Kiểm soát bất biến & Độ tin cậy cho LLM:** Thiết kế máy trạng thái ReAct trên LangGraph tích hợp cơ chế tiền/hậu kiểm (`pre_model_hook` / `post_model_hook`), chặn sinh sớm (`stop_sequences`), xác thực bất biến dữ liệu lúc chạy (Runtime Invariants) bằng **Pydantic v2** / **BAML**, cơ chế tự sửa lỗi có giới hạn (Bounded Rollback), **Human-in-the-Loop (`interrupt`)**, và **Deterministic Saga Engine** viết bằng **Go** (`aidoodle-cli`) cùng **4-Tier Safety Sandbox** (`claw-cli`).
- **Hệ thống Truy xuất Tri thức (RAG) thực chiến:** Xây dựng kiến trúc **Dual-Collection Qdrant + Neo4j GraphRAG** xử lý báo cáo kỹ thuật & ESG đa bảng biểu (168 trang BIWASE, truy xuất `<2s`), và hệ thống **Hybrid Search (BM25 + Dense Vector + Cross-Encoder Reranker `bge-reranker-v2-m3`)** đạt **86.88%–88.13% Hit@1 (99.69%–100% Hit@20)** trên tập benchmark ablation 320 sản phẩm công nghệ và **95% Hit@1 / 99% Hit@5** trên 3.200 truy vấn thực đơn F&B & bán lẻ.
- **Kỹ thuật Phần mềm & Lý thuyết Kiểu ứng dụng:** Phát triển ứng dụng đa nền tảng **Kotlin Multiplatform (KMP)** áp dụng **Kiểu dữ liệu đại số (Algebraic Data Types — `sealed interface` / `data class`)**, bất biến miền tại thời điểm biên dịch (`@JvmInline value class`), xử lý lỗi hàm thuần túy (`Arrow Either<AppError, T>`), và cài đặt trực tiếp các cấu trúc dữ liệu/thuật toán (`DictionaryTrie`, `$1 GeometricRecognizer`, mô hình toán học bộ nhớ `FSRS`) tại tầng Pure Domain.

---

## 2. Kinh Nghiệm Làm Việc

### WETEC — Công ty Cổ phần Công nghệ Năng lượng & Môi trường Nước
**Thực tập sinh Kỹ sư AI (AI Engineer Intern)** *(10/2025 – 12/2025)*  
**Mã nguồn:** [`github.com/Vinh-Gogo/pdf-rag`](https://github.com/Vinh-Gogo/pdf-rag) | **Báo cáo kỹ thuật:** [Kiến trúc PDF-RAG Dual-Collection](/posts/pdf-rag-enterprise-dual-collection/) · [Kiến trúc GraphRAG Neo4j & Qdrant](/posts/graph-rag-neo4j-qdrant/)

- **Thu thập & Làm sạch dữ liệu bảo toàn cấu trúc bảng:** Xây dựng pipeline bóc tách và tiền xử lý **168 trang** báo cáo kỹ thuật xử lý nước, chất thải, ESG và sản xuất kinh doanh của **BIWASE (Mã CK: BWE)** (thuộc bộ hồ sơ >200 trang quy chuẩn ngành nước) bằng **Firecrawl AI** kết hợp bộ lọc RegEx Sanitizer. Thực nghiệm đối sánh 3 mô hình Embedding (`DangVanTuan/vietnamese-embedding`, `Qwen3-Embedding-0.6B`, `BKAI HaLong-Embedding`) trên 159/168 trang báo cáo hợp lệ ghi nhận độ tương đồng Cosine trung bình giữa bản thô và bản làm sạch đạt **0.9966 – 0.9968** (`Qwen3-0.6B` đạt độ lệch chuẩn thấp nhất `0.0069`), chứng minh quá trình khử nhiễu OCR không làm suy suyển ngữ nghĩa chuyên ngành.
- **Đánh giá định lượng & Giải quyết bài toán nhập nhằng bảng biểu định kỳ:** Xây dựng khung kiểm thử tự động trên **660 truy vấn tiếng Việt thực tế** (`tests/data/halong_evaluation_results.json`) và **315 truy vấn** (`tests/data/qwen_evaluation_results.json`). Phát hiện điểm nghẽn của RAG chia nhỏ đoạn đơn tầng (single-stage chunking): do báo cáo BIWASE các tháng có tiêu đề bảng giống hệt nhau, tìm kiếm vector đơn thuần với `HaLong-Embedding` chỉ đạt `29.39% Hit@1 / 57.42% Hit@5 / MRR 0.4177`, và khi nâng cấp lên `Qwen3-Embedding-0.6B` đạt **38.41% Hit@1 (+9.02%) / 68.25% Hit@5 (+10.83%) / 80.00% Hit@10 / 90.16% Hit@50 (MRR 0.5198)**.
- **Kiến trúc Dual-Collection Qdrant & Semantic GraphRAG:** Thiết kế cơ chế truy xuất 2 tầng trên **Qdrant** — tìm kiếm vi mô trên `esg_sequences` (1.132 phân đoạn 500 ký tự) rồi quy nạp điểm số để lấy toàn vẹn trang văn bản gốc từ `esg_pages` — kết hợp lọc metadata thời gian và đồ thị thực thể **Neo4j**, loại bỏ hiện tượng ghép nhầm số liệu giữa các kỳ báo cáo và giữ độ trễ truy xuất **<2 giây** qua **FastAPI** và **Docker**.
- **Công nghệ cốt lõi:** Python, Qdrant (Dual-Collection), Neo4j, `Qwen3-Embedding-0.6B`, `HaLong-Embedding`, Firecrawl AI, FastAPI, Docker.

---

## 3. Dự Án Tiêu Biểu & Minh Chứng Thực Tế

### 1. Hệ Thống Multi-Agent CSKH & Đặt Hàng Có Kiểm Soát *(Freelance R&D, 06/2025 – 10/2025)*
- **Vai trò:** Kỹ sư AI chính phụ trách Kiến trúc Agent, Ràng buộc Thực thi & Hybrid RAG (Nhóm 3 thành viên)
- **Mã nguồn (Repo nhóm lưu trữ trên GitHub của thành viên Thanh Huynh):**
  - Core ReAct Agent & Hooks: [`github.com/thanhhuynhk17/langgraph_re_act_agent`](https://github.com/thanhhuynhk17/langgraph_re_act_agent)
  - Hybrid Search & Ablation Eval: [`github.com/thanhhuynhk17/graph_rag`](https://github.com/thanhhuynhk17/graph_rag)
- **Video Demo YouTube:**
  - 📺 [Demo AI Agent LangGraph (Core & State Machine)](https://www.youtube.com/watch?v=RHZPNONKj3Q)
  - 💬 [Demo Trực Tiếp Facebook Messenger](https://www.youtube.com/watch?v=fmhQLR4_IHE)
- **Báo cáo kỹ thuật:** [Kiến trúc Multi-Agent Workflow & Kiểm soát Bất biến Lúc chạy với LangGraph](/posts/multi-agent-workflow-langraph/)
- **Đóng góp kỹ thuật trực tiếp của Lê Quang Vinh:**
  - **Máy trạng thái ReAct & Chốt chặn Tiền/Hậu kiểm (`src/agent.py`, `src/utils/helpers.py`):** Thiết kế đồ thị LangGraph (`get_graph`) với `stop_sequences=["<react_observation"]` chặn vật lý hành vi LLM tự bịa kết quả hàm tại tầng giải mã token; cài đặt `use_pre_hook` chuẩn hóa lịch sử hội thoại XML và `use_post_hook` + `_detect_tool` bóc tách khối `<think>...</think>`, đối chiếu tên tool với tập `all_tools` và tự động rollback về `Command(goto="pre_model_hook")` khi phát hiện sai lệch cú pháp.
  - **Kiểm tra bất biến lúc chạy (Runtime Invariants) & Human-in-the-Loop (`src/utils/schemas.py`, `src/utils/tools.py`, `src/utils/interrupt_any_tool.py`):** Cài đặt `@model_validator(mode="after")` trên Pydantic v2 cho `Dish` và `TakeOrderInput` nhằm kiểm chứng sự tồn tại của `(id, name_of_food)` trong danh mục thực đơn (`comque_new.csv`) và ràng buộc thời gian đặt bàn `booking_time >= pendulum.now('Asia/Ho_Chi_Minh')`; tích hợp `interrupt()` đóng băng trạng thái đồ thị chờ con người phê duyệt trước khi ghi đơn hàng vào DB.
  - **Hybrid Search & Thực nghiệm Ablation (`graph_rag/src/utils/hybridsearch.py`, `search_hit_k_eval.py`):** Xây dựng `HybridRetrieverPipeline` kết hợp `BM25Retriever` + `Neo4jVector` (`EnsembleRetriever`) và Cross-Encoder Reranker (`BAAI/bge-reranker-v2-m3`). Thực nghiệm ablation trên 320 bản ghi sản phẩm (`hoanghamobile_with_summary.csv` $\times$ 5 mẫu câu hỏi tiếng Việt) chứng minh bước tiến rõ rệt: Pure Embedding (`Qwen3-0.6B`) đạt `65.31% Hit@1` $\rightarrow$ kết hợp `bge-reranker-v2-m3` tăng lên **85.63% Hit@1 / 97.81% Hit@5** $\rightarrow$ kết hợp **Hybrid BM25 + Embedding + Reranker** đạt **86.88% Hit@1 / 99.69% Hit@20** (và **88.13% Hit@1 / 98.13% Hit@5 / 100% Hit@20** với `Qwen3-8B`). Khi áp dụng lọc thuộc tính có cấu trúc trên tập 3.200 truy vấn thực đơn F&B & bán lẻ, hệ thống đạt **95% Hit@1** và **99% Hit@5**.
  - **Bộ định tuyến ngữ nghĩa (`semantic-router`):** Xây dựng bộ phân loại ý định hội thoại 3 lớp (`binh_thuong`, `crawl_data`, `tao_lao`) dựa trên ma trận xác suất tích lũy Top-2 Cosine Similarity.
- **Công nghệ cốt lõi:** Python, LangGraph, FastMCP, Pydantic v2, BAML, vLLM, Neo4j, BM25, `BAAI/bge-reranker-v2-m3`, FastAPI, Facebook Messenger Webhook.

### 2. AI-Doodle (`aidoodle-cli`) & Claw-CLI — Máy Trạng Thái Saga Xác Định & Sandbox Thực Thi An Toàn *(2026)*
- **Mã nguồn:** [`github.com/vinh-gogo/aidoodle-cli`](https://github.com/vinh-gogo/aidoodle-cli) (Go) · [`github.com/vinh-gogo/claw-cli`](https://github.com/vinh-gogo/claw-cli) (Python + ONNX)
- **Kỹ thuật & Đóng góp:**
  - **`aidoodle-cli` (Go 1.25):** Xây dựng công cụ CLI điều phối sinh tiểu thuyết dài tập và xuất bản sách điện tử chuẩn **W3C EPUB 3.3** thuần Go. Thiết kế **Deterministic Saga Engine** (`internal/orchestrator/saga.go`) ghi nhật ký giao dịch bền vững (`SagaLog`: `completed_steps`, `compensation_log`), cho phép khôi phục (resume) chính xác từ bước dừng mà không mất trạng thái.
  - **Mechanical Output Validators (`internal/orchestrator/validators.go`):** Cài đặt bộ kiểm tra cơ học hậu sinh (kiểm tra ngưỡng từ tối thiểu, phát hiện lặp đoạn văn do suy thoái giải mã, chặn rò rỉ thẻ meta-talk `[Note:`/`[TODO:`, kiểm chứng sự hiện diện của nhân vật chính) kèm vòng lặp tự sửa lỗi 1 lượt (single-retry self-correction) trước khi chấp nhận đầu ra của LLM.
  - **`claw-cli` (Voice & Text Terminal Agent):** Tích hợp mô hình **Silero VAD v5 (ONNX Runtime)** phát hiện hoạt động giọng nói thời gian thực trên CPU và kiến trúc **4-Tier Safety Policy Sandbox** phân loại mọi công cụ tác động hệ thống thành 4 mức độ (`read`, `write`, `exec`, `dangerous`), cưỡng chế xác nhận từ người dùng đối với các thao tác ghi tệp hoặc chạy lệnh shell.
- **Công nghệ cốt lõi:** Go (Golang), Python, ONNX Runtime (Silero VAD v5), Saga Pattern, Mechanical Validators, W3C EPUB 3.3.

### 3. AI Lingua & Skills-KMP — Kiến Trúc Đa Nền Tảng Đặt Nền Tảng Trên Hệ Thống Kiểu *(2026)*
- **Mã nguồn:** [`github.com/Vinh-Gogo/ai-english`](https://github.com/Vinh-Gogo/ai-english) · [`github.com/vinh-gogo/skills-kmp`](https://github.com/vinh-gogo/skills-kmp)
- **Báo cáo kỹ thuật:** [Kiến Trúc Học Ngoại Ngữ Offline-First Với KMP & AI](/posts/on-device-ai-onnx-kotlin/) · [Kiến Trúc Phần Mềm Hiện Đại Với KMP](/posts/skills-kmp-architecture-design-patterns/)
- **Kỹ thuật & Đóng góp:**
  - **Thiết kế hướng kiểu (Type-Driven Architecture) & Algebraic Data Types:** Xây dựng ứng dụng đa nền tảng (Desktop JVM & Android) theo **Clean Architecture 5 lớp** kết hợp **MVI**, chia sẻ **85%** mã nguồn. Mô hình hóa toàn bộ trạng thái (`UiState`), hành vi (`UiIntent`) và lỗi nghiệp vụ (`AppError`) bằng **Kiểu dữ liệu đại số (ADT: `sealed interface` Sum Types & `data class` Product Types)**, ép trình biên dịch Kotlin kiểm tra tính đầy đủ (exhaustiveness) tại thời điểm biên dịch.
  - **Bất biến miền & Lập trình hàm với Arrow Core:** Sử dụng `@JvmInline value class` (`EmailAddress`, `NoteId`) để kiểm tra bất biến dữ liệu đầu vào mà không phát sinh chi phí cấp phát bộ nhớ heap, kết hợp kiểu `Either<AppError, T>` của **Arrow Core** giúp biểu diễn tường minh luồng lỗi trên chữ ký hàm (Railway-Oriented Programming), giữ tầng `:shared:domain` hoàn toàn thuần khiết (Pure & Referentially Transparent).
  - **Thuật toán & Cấu trúc dữ liệu On-Device:** Cài đặt trực tiếp cây tiền tố **Prefix Tree (`VietnameseDictionaryTrie` / `EnglishDictionaryTrie`)** hỗ trợ tìm kiếm tiền tố trong $O(L)$, bộ nhận diện nét vẽ hình học **$1 Unistroke `GeometricRecognizer`** (lấy mẫu đẳng cự 64 điểm, chuẩn hóa tâm và khung tỷ lệ 250px), và thuật toán lặp lại ngắt quãng **FSRS** (mô hình hóa trạng thái trí nhớ $D, S, R$ trên CSDL **SQLDelight SQLite chuẩn 3NF**, giảm 23% lượt ôn tập so với SM-2).
- **Công nghệ cốt lõi:** Kotlin Multiplatform (KMP), Compose Multiplatform, Arrow Core (`Either`), SQLDelight (3NF), Ktor Client, FSRS, Prefix Trie, Geometric Recognizer.

### 4. Open Video Lab — Pipeline Tạo Sinh Video AI Đa Phương Thức *(2026)*
- **Mã nguồn:** [`github.com/vinh-gogo/open-video-lab`](https://github.com/vinh-gogo/open-video-lab)
- **Báo cáo kỹ thuật:** [Làm chủ Video Diffusion với Open Video Lab](/posts/openvideolab-video-diffusion/)
- **Kỹ thuật & Đóng góp:**
  - Xây dựng pipeline điều phối (orchestration) sinh video đa phương thức (Text/Image/Audio-to-Video) dựa trên các mô hình Diffusion Transformers (LTX-2.5, MiniMax, Wan).
  - Triển khai kỹ thuật **Multi-Subject Reference (MSR)** can thiệp vào Cross-Attention nhằm duy trì tính nhất quán nhân vật qua nhiều cảnh nối tiếp.
  - Tối ưu hóa suy luận với **Quantization (int8/fp4)**, giảm mức VRAM từ 24GB xuống **<14GB** giúp chạy ổn định trên GPU 16GB (<60s/cảnh), tích hợp **RIFE** nội suy chuyển động 48/96fps.
- **Công nghệ cốt lõi:** PyTorch, Diffusion Transformers (DiT), Quantization (int8/fp4), TurboLoRA, RIFE.

---

## 4. Nghiên Cứu Khoa Học & Khóa Luận Tốt Nghiệp

### Ước Lượng Độ Sâu Ảnh Đơn Dựa Trên Mạng Nơ-ron Tích Chập Sâu (Deep CNNs) *(SSRC 2024)*
- **Công bố:** Hội nghị Khoa học Sinh viên (SSRC 2024) — Khoa Công nghệ Thông tin, Đại học Công nghiệp TP.HCM (IUH)
- **Mã nguồn:** [`github.com/Vinh-Gogo/depth-estimation`](https://github.com/Vinh-Gogo/depth-estimation)
- **Toàn văn khóa luận (Tiếng Anh):** [Report_GRADUATION_THESIS.pdf](/posts/depth-estimation-cnn-ssrc/Report_GRADUATION_THESIS.pdf) | **Báo cáo kỹ thuật:** [Phân tích Kiến trúc & Thực nghiệm Khóa luận](/posts/depth-estimation-cnn-ssrc/)
- **Điểm khóa luận:** **4.0/4.0 (Xuất sắc)**
- **Kỹ thuật & Đóng góp:**
  - **Thiết kế kiến trúc lai ghép (Hybrid ResNet–DenseNet U-Net):** Nghiên cứu và thực nghiệm đối chứng 3 kiến trúc mạng học sâu cho bài toán Monocular Depth Estimation trên tập dữ liệu **LineMOD RGB-D Dataset** (~4.800 ảnh huấn luyện và **1.200 ảnh kiểm thử độc lập** độ phân giải $192 \times 256$ thu từ cảm biến PrimeSense Carmine): (1) **CAE ResNet** (64 lớp, 7.09M tham số), (2) **U-Net ResNet** (68 lớp, 7.80M tham số), và (3) **Enhanced U-Net với Hybrid ResNet–DenseNet Backbone** (105 lớp, **7.51M tham số**, nhẹ hơn U-Net chuẩn 3.7% nhờ tái sử dụng đặc trưng Dense Block; mở rộng thêm biến thể nhẹ 3M tham số và biến thể tích hợp **Squeeze-and-Excitation (SE) Attention** 13M tham số).
  - **Hàm mất mát đa thành phần (Multi-Component Loss):** Kết hợp sai số tuyệt đối mức pixel ($\mathcal{L}_1$), độ tương đồng cấu trúc ($\mathcal{L}_{SSIM}$) và đạo hàm biên không gian ($\mathcal{L}_{grad}$) nhằm triệt tiêu hiện tượng mờ biên vật thể của chuẩn $\mathcal{L}_2$ truyền thống.
  - **Kết quả định lượng trên 1.200 ảnh Hold-out Test (LineMOD):** Đạt **RMSE `0.0370`** (cải thiện từ `0.0410` của CAE ResNet), **MAE `0.0175`**, **MSE `0.0016`**, **Cosine Similarity `0.974`**, **Pixel Accuracy `0.819`**, giảm **32.4% khoảng cách phân phối Wasserstein** (`14.20` xuống `9.603`), **Hausdorff Distance `10.65`**, và đạt **92.5% (1.123/1.214 ảnh kiểm thử)** thỏa mãn ngưỡng sai lệch độ sâu cực đại nghiêm ngặt $< 0.1$.

---

## 5. Kỹ Năng Chuyên Môn

| Lĩnh vực | Kỹ năng & Công nghệ cốt lõi |
|---|---|
| **Độ tin cậy LLM, Lý thuyết Kiểu & Thuật toán** | Runtime Invariants (`pre/post_model_hook`, Stop Sequences, Pydantic v2, BAML AST), Algebraic Data Types (Kotlin `sealed interface`, `@JvmInline value class`), Functional Error Handling (Arrow `Either<L, R>`), Deterministic Saga State Machines, Prefix Tree (`Trie`), `$1` Geometric Recognizer, FSRS Memory Modeling |
| **AI Agentic & Hệ thống RAG** | LangGraph, FastMCP, Semantic Router, Hybrid Search (BM25 + Dense Vector + Cross-Encoder `bge-reranker-v2-m3`), Dual-Collection Qdrant, GraphRAG (Neo4j), vLLM Serving |
| **Generative AI & Computer Vision** | Diffusion Transformers (DiT), Multi-Subject Consistency, Quantization (`int8`/`fp4`), LoRA Fine-tuning, Deep CNNs (ResNet, DenseNet, U-Net, SE-Attention), ONNX Runtime (Silero VAD v5) |
| **Kỹ thuật Phần mềm & Đa nền tảng** | Kotlin Multiplatform (KMP), Compose Multiplatform, Clean Architecture (5-Tier + Vertical Slicing), MVI, SQLDelight (3NF), RESTful API (FastAPI, Ktor), W3C EPUB 3.3 Engine |
| **Ngôn ngữ & Hạ tầng** | **Python**, **Kotlin**, **Go (Golang)**, **SQL** (PostgreSQL, SQLite), C# (.NET), TypeScript, PyTorch, Docker, Git/GitHub, Linux |

