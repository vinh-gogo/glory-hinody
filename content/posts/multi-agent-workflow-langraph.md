---
title: "Multi-Agent Workflow: Tự Động Hóa CSKH Với LangGraph và FastMCP"
date: 2026-09-29T12:00:00+07:00
draft: false
tags: ["agentic-rag", "du-an"]
description: "Kiến trúc Multi-Agent tự động hóa hệ thống chăm sóc khách hàng với LangGraph state machine, FastMCP tool calling, đạt 99% Hit@5 trên 3.200 queries thực tế."
---

## Bài toán: CSKH truyền thống không đủ scale

Hệ thống chăm sóc khách hàng (CSKH) truyền thống dựa trên rule-based chatbot hoặc FAQ tĩnh gặp nhiều hạn chế: không xử lý được câu hỏi phức tạp, không nhớ ngữ cảnh hội thoại, và cần cập nhật thủ công liên tục.

Giải pháp: xây dựng **Agentic AI System** với nhiều agent chuyên biệt, phối hợp tự động để xử lý mọi loại truy vấn khách hàng.

## Kiến trúc Multi-Agent

Hệ thống gồm các agent chuyên biệt:

```
User Query
     │
     ▼
 Router Agent ──────────────────────────┐
     │                                  │
     ├──► FAQ Agent (GraphRAG)          │
     │         └──► Neo4j + Qdrant      │
     │                                  │
     ├──► Order Agent (Tool Use)        │
     │         └──► FastMCP → APIs      │
     │                                  │
     └──► Escalation Agent             │
               └──► Human handoff ◄────┘
                         │
                    Final Response
```

- **Router Agent**: Phân loại ý định và điều phối tới agent phù hợp
- **FAQ Agent**: Trả lời câu hỏi kiến thức bằng GraphRAG (Neo4j + Qdrant)
- **Order Agent**: Thực hiện hành động (tra cứu đơn hàng, cập nhật thông tin) qua tool calling
- **Escalation Agent**: Chuyển tiếp câu hỏi phức tạp tới nhân viên thật

## LangGraph – State Machine cho Multi-Agent

**LangGraph** mô hình hóa luồng agent dưới dạng đồ thị có trạng thái, mỗi node là một agent/tool, mỗi cạnh là điều kiện chuyển trạng thái:

```python
workflow = StateGraph(AgentState)

workflow.add_node("router", router_agent)
workflow.add_node("faq", faq_agent)
workflow.add_node("order", order_agent)

workflow.add_conditional_edges(
    "router",
    route_query,
    {"faq": "faq", "order": "order", "escalate": END}
)
```

LangGraph đảm bảo **memory persistence** qua các turn hội thoại, retry logic khi agent thất bại, và khả năng **human-in-the-loop** khi cần.

## FastMCP – Tool Calling chuẩn hóa

**FastMCP (Model Context Protocol)** cho phép các agent gọi external tools (API, database, file system) theo một giao thức chuẩn. Mỗi tool được định nghĩa như một function với schema rõ ràng:

```python
@mcp.tool()
async def get_order_status(order_id: str) -> OrderStatus:
    """Tra cứu trạng thái đơn hàng theo mã"""
    return await order_service.get_status(order_id)
```

LLM tự động biết khi nào cần gọi tool nào dựa trên description và schema – không cần hardcode logic.

## Hybrid Search: Semantic + BM25

Để tối ưu retrieval cho FAQ Agent:

- **Semantic Search (Qdrant)**: Tìm đoạn văn gần nghĩa với câu hỏi
- **BM25 (keyword)**: Tìm chính xác từ khóa quan trọng
- **RRF (Reciprocal Rank Fusion)**: Kết hợp kết quả theo điểm tổng hợp

Hybrid search giải quyết điểm yếu của từng phương pháp đơn lẻ, đặc biệt hiệu quả với **tiếng Việt** vì BM25 xử lý tốt các từ kỹ thuật đặc thù.

## Xử lý tiếng Việt

Tiền xử lý text tiếng Việt gồm:
- **Underthesea** cho tokenization và POS tagging
- Chuẩn hóa tone marks (unicode normalization)
- Xây dựng từ điển domain-specific cho CSKH

## Kết quả

Đánh giá trên **3.200 câu truy vấn thực tế**:

| Metric | Kết quả |
|--------|---------|
| Hit@1  | 95%     |
| Hit@5  | **99%** |
| Avg Response Time | 320ms |
| Tool Call Success Rate | 97.8% |

## Kết luận

Kiến trúc Multi-Agent với LangGraph + FastMCP + GraphRAG là sự kết hợp mạnh mẽ cho bài toán CSKH phức tạp. Điểm quan trọng nhất là **phân tách trách nhiệm** – mỗi agent làm tốt một việc, thay vì một agent "biết tất cả".
