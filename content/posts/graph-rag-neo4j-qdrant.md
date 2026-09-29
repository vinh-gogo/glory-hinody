---
title: "GraphRAG: Kết Hợp Neo4j và Qdrant Để Giảm Hallucination"
date: 2026-09-29T12:00:00+07:00
draft: false
tags: ["agentic-rag", "du-an", "rag"]
description: "Vượt qua giới hạn của Semantic RAG thuần túy bằng cách kết hợp Knowledge Graph (Neo4j) và Vector Search (Qdrant), đạt 95% Hit@1 trên 3.200 câu truy vấn thực tế."
---

## Vấn đề với RAG thông thường

Retrieval-Augmented Generation (RAG) đã trở thành giải pháp phổ biến để giảm hallucination cho LLM. Tuy nhiên, **Semantic RAG thuần túy** vẫn còn những điểm yếu cơ bản:

- **Mất ngữ cảnh quan hệ**: Vector search chỉ tìm đoạn văn gần nghĩa nhất, không nắm được *mối quan hệ* giữa các thực thể (ví dụ: "Sản phẩm A thuộc danh mục B, được bảo hành bởi chính sách C").
- **Retrieval rời rạc**: Các chunk độc lập không liên kết dẫn đến câu trả lời thiếu nhất quán.
- **Hallucination vẫn xảy ra** khi câu hỏi đòi hỏi lý luận nhiều bước qua nhiều tài liệu.

## Giải pháp: GraphRAG

**GraphRAG** là kiến trúc kết hợp hai lớp retrieval:

### 1. Knowledge Graph với Neo4j

Neo4j lưu trữ các thực thể và mối quan hệ của miền kiến thức dưới dạng đồ thị có hướng. Ví dụ:

```
(SanPhamX)-[:THUOC_DANH_MUC]->(DanhMucA)
(SanPhamX)-[:CO_CHINH_SACH]->(BaoHanh12Thang)
(BaoHanh12Thang)-[:AP_DUNG_CHO]->(KhachHangB2B)
```

Khi người dùng hỏi về chính sách bảo hành sản phẩm X cho khách B2B, graph traversal tìm được đường đi chính xác chỉ trong vài millisecond, điều mà vector search không thể làm được.

### 2. Vector Search với Qdrant

**Qdrant** đảm nhiệm tìm kiếm ngữ nghĩa cho các đoạn văn bản mô tả chi tiết. Mỗi node trong graph cũng được embedding và index vào Qdrant, tạo ra lớp retrieval hybrid.

### 3. Fusion & Reranking

Kết quả từ Neo4j (graph paths) và Qdrant (semantic chunks) được **fusion** theo điểm số kết hợp, sau đó **rerank** trước khi đưa vào LLM để sinh câu trả lời.

## Kiến trúc hệ thống

```
User Query
    │
    ├─► Entity Extraction → Neo4j Graph Traversal
    │                              │
    └─► Embedding → Qdrant Search  │
                          │        │
                          └─ Fusion & Rerank ─► LLM ─► Answer
```

## Kết quả thực nghiệm

Hệ thống được đánh giá trên **3.200 câu truy vấn** từ domain CSKH thực tế:

| Metric   | Semantic RAG | GraphRAG |
|----------|-------------|----------|
| Hit@1    | 78%         | **95%**  |
| Hit@5    | 89%         | **99%**  |
| Latency  | ~180ms      | ~210ms   |

Cải thiện Hit@1 từ 78% lên **95%** – tức là 9/10 câu hỏi được trả lời đúng ngay ở lần lấy đầu tiên mà không cần fallback.

## Bài học rút ra

- Graph và vector search **bổ sung nhau**, không thay thế nhau.
- Việc xây dựng schema graph cần đầu tư ban đầu nhưng mang lại ROI rất lớn ở bước retrieval.
- **FAISS** được dùng cho local testing trước khi scale lên Qdrant ở production.

GraphRAG hiện đang là nền tảng cho hệ thống **Multi-Agent AI Agentic** mà tôi phát triển tại WETEC.
