---
title: "Multi-Agent Workflow: Tá»± Äá»™ng HÃ³a CSKH Vá»›i LangGraph vÃ  FastMCP"
date: 2026-08-28T10:00:00+07:00
draft: false
tags: ["agentic-rag", "du-an"]
description: "Kiáº¿n trÃºc Multi-Agent tá»± Ä‘á»™ng hÃ³a CSKH (tra cá»©u & xuáº¥t hÃ³a Ä‘Æ¡n tá»± Ä‘á»™ng) vá»›i LangGraph state machine, FastMCP tool calling vÃ  vLLM trÃªn GPU A100, Ä‘áº¡t 95% Hit@1 vÃ  99% Hit@5 trÃªn 3.200 queries."
summary: "Kiáº¿n trÃºc Multi-Agent tá»± Ä‘á»™ng hÃ³a CSKH (tra cá»©u & xuáº¥t hÃ³a Ä‘Æ¡n tá»± Ä‘á»™ng) vá»›i LangGraph state machine, FastMCP tool calling vÃ  vLLM trÃªn GPU A100, Ä‘áº¡t 95% Hit@1 vÃ  99% Hit@5 trÃªn 3.200 queries."
ShowToc: true
TocOpen: true
---

## 1. Minh Chá»©ng & Video Demo Thá»±c Táº¿ (Evidence & Demos)

Há»‡ thá»‘ng **AI Agentic Automation** Ä‘Æ°á»£c phÃ¡t triá»ƒn vÃ  kiá»ƒm thá»­ thá»±c táº¿ trong dá»± Ã¡n tá»± Ä‘á»™ng hÃ³a quy trÃ¬nh chÄƒm sÃ³c khÃ¡ch hÃ ng vÃ  bÃ¡n hÃ ng Ä‘a kÃªnh:

| Háº¡ng má»¥c | Minh chá»©ng thá»±c táº¿ | Chi tiáº¿t ká»¹ thuáº­t |
|---|---|---|
| **Video Demo (YouTube)** | [`youtu.be/R_IvnHsHmTw`](https://youtu.be/R_IvnHsHmTw) | TrÃ¬nh diá»…n luá»“ng há»™i thoáº¡i, tool calling vÃ  xuáº¥t hÃ³a Ä‘Æ¡n tá»± Ä‘á»™ng |
| **Video Demo (LinkedIn)** | [`lnkd.in/p/ejjivmDG`](https://lnkd.in/p/ejjivmDG) | Báº£n demo ngáº¯n gá»n quy trÃ¬nh Multi-Agent xá»­ lÃ½ Ä‘á»“ng thá»i |
| **Táº­p dá»¯ liá»‡u kiá»ƒm thá»­** | `3.200 queries` trÃªn 2 domains | Domain 1: Thá»±c Ä‘Æ¡n & chuá»—i áº©m thá»±c; Domain 2: BÃ¡n láº» Ä‘iá»‡n thoáº¡i di Ä‘á»™ng |
| **Äá»™ chÃ­nh xÃ¡c (Accuracy)** | `95.0% Hit@1` vÃ  `99.0% Hit@5` | Äo lÆ°á»ng trÃªn bÃ i toÃ¡n trÃ­ch xuáº¥t thá»±c thá»ƒ vÃ  truy váº¥n thÃ´ng sá»‘ sáº£n pháº©m |
| **Tá»· lá»‡ gá»i Tool thÃ nh cÃ´ng** | `97.8% Tool Call Success` | Xá»­ lÃ½ qua giao thá»©c FastMCP cÃ³ schema validation cháº·t cháº½ |
| **Háº¡ táº§ng LLM Serving** | **vLLM** trÃªn GPU NVIDIA A100 | Phá»¥c vá»¥ suy luáº­n song song (PagedAttention), Ä‘á»™ trá»… pháº£n há»“i ~320ms |
| **CÃ´ng nghá»‡ cá»‘t lÃµi** | FastMCP, LangGraph, LangChain, FastAPI, Neo4j, FAISS, PostgreSQL, Docker | Kiáº¿n trÃºc Multi-Agent hÆ°á»›ng sá»± kiá»‡n (Event-driven) |

---

## 2. VÃ¬ Sao Chatbot ÄÆ¡n Láº» (Single-Agent) Tháº¥t Báº¡i?

CÃ¡c chatbot bÃ¡n hÃ ng truyá»n thá»‘ng dá»±a trÃªn má»™t prompt khá»•ng lá»“ ("Mega-prompt") gom táº¥t cáº£ hÆ°á»›ng dáº«n vÃ o má»™t LLM duy nháº¥t thÆ°á»ng gáº·p 3 lá»—i chÃ­ máº¡ng:

1. **Nhiá»…m báº©n ngá»¯ cáº£nh (Context Pollution):** Khi prompt chá»©a cáº£ quy táº¯c tra cá»©u, quy táº¯c tÃ­nh thuáº¿ hÃ³a Ä‘Æ¡n vÃ  xá»­ lÃ½ khiáº¿u náº¡i, LLM dá»… nháº§m láº«n chá»©c nÄƒng.
2. **áº¢o giÃ¡c khi thá»±c thi tÃ¡c vá»¥ nháº¡y cáº£m:** LLM tá»± Ã½ sinh mÃ£ hÃ³a Ä‘Æ¡n hoáº·c tÃ­nh sai tá»•ng tiá»n do khÃ´ng cÃ³ lá»›p kiá»ƒm soÃ¡t Ä‘á»™c láº­p.
3. **KhÃ´ng cÃ³ kháº£ nÄƒng phá»¥c há»“i lá»—i (Fault Tolerance):** Náº¿u má»™t bÆ°á»›c tra cá»©u bá»‹ timeout, toÃ n bá»™ phiÃªn trÃ² chuyá»‡n bá»‹ giÃ¡n Ä‘oáº¡n.

---

## 3. Kiáº¿n TrÃºc Multi-Agent PhÃ¢n TÃ¡ch TrÃ¡ch Nhiá»‡m

TÃ´i thiáº¿t káº¿ há»‡ thá»‘ng theo mÃ´ hÃ¬nh Ä‘á»“ thá»‹ tráº¡ng thÃ¡i (**StateGraph**) phÃ¢n rÃ£ há»‡ thá»‘ng thÃ nh cÃ¡c Agent chuyÃªn biá»‡t, Ä‘á»™c láº­p:

```mermaid
flowchart TD
    USER["KhÃ¡ch hÃ ng gá»­i yÃªu cáº§u"] --> R1
    
    subgraph ROUTER["ROUTER AGENT"]
        R1["PhÃ¢n loáº¡i Intent & Äiá»u phá»‘i luá»“ng"]
    end
    
    R1 -->|"Tra cá»©u"| C1
    R1 -->|"HÃ³a Ä‘Æ¡n"| I1
    R1 -->|"Há»— trá»£"| E1
    
    subgraph WORKERS["AGENTS CHUYÃŠN BIá»†T"]
        C1["Catalog Agent (Search/MCP)"]
        I1["Invoice Agent (Billing/MCP)"]
        E1["Escalation Agent (Human-in-the-loop)"]
    end
    
    C1 --> S1
    I1 --> S1
    E1 --> S1
    
    subgraph SYNTH["SYNTHESIZER AGENT"]
        S1["Tá»•ng há»£p & Äá»‹nh dáº¡ng pháº£n há»“i"]
    end
    
    S1 --> OUT["KhÃ¡ch hÃ ng nháº­n káº¿t quáº£"]
```

### CÃ¡c Agent thÃ nh pháº§n:
- **Router Agent:** PhÃ¢n tÃ­ch cÃ¢u há»i ngÆ°á»i dÃ¹ng, quyáº¿t Ä‘á»‹nh kÃ­ch hoáº¡t Agent nÃ o mÃ  khÃ´ng trá»±c tiáº¿p tráº£ lá»i.
- **Catalog Agent (Tra cá»©u):** Káº¿t há»£p GraphRAG vÃ  Hybrid Search (BM25 + Dense vector) vá»›i tiá»n xá»­ lÃ½ tiáº¿ng Viá»‡t chuyÃªn sÃ¢u Ä‘á»ƒ tÃ¬m Ä‘Ãºng sáº£n pháº©m/mÃ³n Äƒn.
- **Invoice Agent (Nghiá»‡p vá»¥ tÃ i chÃ­nh):** Chá»‰ chá»‹u trÃ¡ch nhiá»‡m tÃ­nh toÃ¡n, gá»i tool kiá»ƒm tra tá»“n kho vÃ  xuáº¥t file hÃ³a Ä‘Æ¡n chuáº©n qua API.
- **Escalation Agent:** CÆ¡ cháº¿ Human-in-the-loop tá»± Ä‘á»™ng chuyá»ƒn giao cho nhÃ¢n viÃªn khi khÃ¡ch hÃ ng cÃ³ dáº¥u hiá»‡u bá»©c xÃºc hoáº·c yÃªu cáº§u Ä‘áº·c biá»‡t.

---

## 4. LangGraph: Quáº£n LÃ½ State Machine & Bá»™ Nhá»› PhiÃªn

LangGraph cho phÃ©p biá»ƒu diá»…n toÃ n bá»™ vÃ²ng Ä‘á»i tÃ¡c vá»¥ nhÆ° má»™t State Machine xÃ¡c Ä‘á»‹nh (deterministic):

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Sequence

class AgentState(TypedDict):
    messages: Sequence[str]
    current_intent: str
    selected_items: list[dict]
    invoice_id: str | None
    requires_human: bool

workflow = StateGraph(AgentState)
workflow.add_node("router", router_node)
workflow.add_node("catalog", catalog_node)
workflow.add_node("invoice", invoice_node)
workflow.add_node("escalation", escalation_node)

workflow.add_conditional_edges(
    "router",
    intent_router,
    {
        "search": "catalog",
        "order": "invoice",
        "complain": "escalation"
    }
)
```

Æ¯u Ä‘iá»ƒm lá»›n nháº¥t lÃ  **kháº£ nÄƒng duy trÃ¬ State qua nhiá»u lÆ°á»£t há»™i thoáº¡i** vÃ  rollback tráº¡ng thÃ¡i náº¿u viá»‡c gá»i API bÃªn ngoÃ i gáº·p sá»± cá»‘ máº¡ng.

---

## 5. Tá»‘i Æ¯u Phá»¥c Vá»¥ Vá»›i FastMCP & vLLM TrÃªn A100

- **FastMCP (Model Context Protocol):** ToÃ n bá»™ cÃ¡c cÃ´ng cá»¥ (DB query, tá»“n kho, tÃ­nh giÃ¡) Ä‘Æ°á»£c Ä‘Ã³ng gÃ³i thÃ nh cÃ¡c tool cÃ³ schema type-safe báº±ng Pydantic. LLM tá»± Ä‘á»™ng trÃ­ch xuáº¥t Ä‘Ãºng tham sá»‘ vá»›i tá»· lá»‡ chÃ­nh xÃ¡c **97.8%**.
- **vLLM Inference Engine:** Cháº¡y model mÃ£ nguá»“n má»Ÿ trÃªn GPU NVIDIA A100 vá»›i thuáº­t toÃ¡n **PagedAttention**. CÆ¡ cháº¿ quáº£n lÃ½ bá»™ nhá»› KV-Cache thÃ´ng minh cho phÃ©p há»‡ thá»‘ng phá»¥c vá»¥ **Ä‘á»“ng thá»i hÆ¡n 50 phiÃªn há»™i thoáº¡i** vá»›i Ä‘á»™ trá»… má»—i token dÆ°á»›i 15ms.

---

## 6. TÃ i Liá»‡u Tham Kháº£o (References)

```
[01] LangChain AI. (2024). LangGraph: Building Language Agents as Stateful Graphs. 
     Official Architectural Guide.
[02] Anthropic. (2024). The Model Context Protocol (MCP) Specification. 
     Anthropic Standards Documentation.
[03] Kwon, W., Li, Z., Zhuang, S., Sheng, Y., Zheng, L., Yu, C. H., Gonzalez, J. E., 
     Zhang, H., & Stoica, I. (2023). Efficient Memory Management for Large Language 
     Model Serving with PagedAttention (vLLM). SOSP 2023. arXiv:2309.06180.
[04] Robertson, S., & Zaragoza, H. (2009). The Probabilistic Relevance Framework: BM25 
     and Beyond. Foundations and Trends in Information Retrieval.
[05] Cormack, G. V., Clarke, C. L., & Buettcher, S. (2009). Reciprocal Rank Fusion 
     Outperforms Condorcet and Individual Rank Learning Methods. SIGIR 2009.
```

---

## 7. BÃ i Viáº¿t LiÃªn Quan (Related Logs)

- [GraphRAG: Káº¿t Há»£p Neo4j vÃ  Qdrant Äá»ƒ Giáº£m Hallucination](/posts/graph-rag-neo4j-qdrant/)  
  *TÃ¬m hiá»ƒu sÃ¢u vá» cÃ¡ch xÃ¢y dá»±ng Knowledge Graph Ä‘á»ƒ lÃ m cÃ´ng cá»¥ tra cá»©u cho Catalog Agent.*
- [On-Device AI: Cháº¡y Neural Network Offline Vá»›i ONNX TrÃªn Mobile](/posts/on-device-ai-onnx-kotlin/)  
  *CÃ¡ch Ä‘Æ°a cÃ¡c mÃ´ hÃ¬nh AI nhá» gá»n xuá»‘ng cháº¡y trá»±c tiáº¿p trÃªn thiáº¿t bá»‹ Ä‘áº§u cuá»‘i mÃ  khÃ´ng tá»‘n chi phÃ­ server.*
