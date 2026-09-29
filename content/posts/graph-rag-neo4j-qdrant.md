---
title: "GraphRAG: Káº¿t Há»£p Neo4j vÃ  Qdrant Äá»ƒ Giáº£m Hallucination"
date: 2026-08-15T10:00:00+07:00
draft: false
tags: ["agentic-rag", "du-an", "rag"]
description: "VÆ°á»£t qua giá»›i háº¡n cá»§a Semantic RAG thuáº§n tÃºy báº±ng cÃ¡ch káº¿t há»£p Knowledge Graph (Neo4j) vÃ  Vector Search (Qdrant) trÃªn táº­p tÃ i liá»‡u ká»¹ thuáº­t >200 trang táº¡i WETEC, Ä‘áº¡t 95% Hit@1 vÃ  Ä‘á»™ trá»… <2s."
summary: "VÆ°á»£t qua giá»›i háº¡n cá»§a Semantic RAG thuáº§n tÃºy báº±ng cÃ¡ch káº¿t há»£p Knowledge Graph (Neo4j) vÃ  Vector Search (Qdrant) trÃªn táº­p tÃ i liá»‡u ká»¹ thuáº­t >200 trang táº¡i WETEC, Ä‘áº¡t 95% Hit@1 vÃ  Ä‘á»™ trá»… <2s."
ShowToc: true
TocOpen: true
---

## 1. Minh Chá»©ng & Bá»‘i Cáº£nh Thá»±c Táº¿ (Evidence & Project Context)

Giáº£i phÃ¡p **GraphRAG** nÃ y Ä‘Æ°á»£c nghiÃªn cá»©u vÃ  triá»ƒn khai thá»±c chiáº¿n táº¡i **WETEC (CÃ´ng ty CP CÃ´ng nghá»‡ NÄƒng lÆ°á»£ng & MÃ´i trÆ°á»ng NÆ°á»›c)** nháº±m giáº£i quyáº¿t bÃ i toÃ¡n tra cá»©u tÃ i liá»‡u ká»¹ thuáº­t chuyÃªn ngÃ nh cá»±c ká»³ phá»©c táº¡p:

| Háº¡ng má»¥c | Minh chá»©ng thá»±c táº¿ | Chi tiáº¿t ká»¹ thuáº­t |
|---|---|---|
| **MÃ£ nguá»“n (GitHub)** | [`github.com/Vinh-Gogo/pdf-rag`](https://github.com/Vinh-Gogo/pdf-rag) | Pipeline trÃ­ch xuáº¥t PDF, Neo4j Graph Builder, Qdrant Vector Store, FastAPI |
| **Quy mÃ´ dá»¯ liá»‡u** | TÃ i liá»‡u ká»¹ thuáº­t chuyÃªn sÃ¢u `> 200 trang` | Chá»©a báº£ng biá»ƒu, sÆ¡ Ä‘á»“ quan há»‡ thiáº¿t bá»‹, tiÃªu chuáº©n xá»­ lÃ½ nÆ°á»›c |
| **Thu tháº­p dá»¯ liá»‡u** | **Firecrawl AI** | Tá»± Ä‘á»™ng crawl, lÃ m sáº¡ch vÃ  chuáº©n hÃ³a dá»¯ liá»‡u phi cáº¥u trÃºc tá»« web/docs |
| **Äá»™ trá»… truy xuáº¥t (Latency)** | `< 2.0 giÃ¢y` toÃ n trÃ¬nh | Bao gá»“m entity extraction, graph traversal, vector search vÃ  LLM response |
| **Äá»™ chÃ­nh xÃ¡c (Accuracy)** | `95% Hit@1` vÃ  `99% Hit@5` | Äo Ä‘áº¡c trÃªn 3.200 cÃ¢u truy váº¥n ká»¹ thuáº­t cÃ³ kiá»ƒm chá»©ng cá»§a chuyÃªn gia |
| **Háº¡ táº§ng triá»ƒn khai** | Neo4j, Qdrant, SQLite, LangGraph, FastAPI, Docker, Vercel, Neon | Kiáº¿n trÃºc microservices Ä‘Ã³ng gÃ³i container hoÃ n chá»‰nh |

---

## 2. VÃ¬ Sao Semantic RAG Thuáº§n TÃºy Tháº¥t Báº¡i TrÆ°á»›c TÃ i Liá»‡u Ká»¹ Thuáº­t?

Khi xÃ¢y dá»±ng RAG cho tÃ i liá»‡u ká»¹ thuáº­t dÃ i (>200 trang), phÆ°Æ¡ng phÃ¡p truyá»n thá»‘ng (Chunking + Vector Embedding) bá»™c lá»™ 3 tá»­ huyá»‡t:

1. **Máº¥t Ä‘á»©t gÃ£y ngá»¯ cáº£nh quan há»‡ (Relational Context Blindness):** Vector search chá»‰ tÃ­nh Ä‘á»™ tÆ°Æ¡ng Ä‘á»“ng cosin giá»¯a cÃ¢u há»i vÃ  Ä‘oáº¡n vÄƒn. Khi ngÆ°á»i dÃ¹ng há»i: *"Náº¿u ná»“ng Ä‘á»™ COD vÆ°á»£t 500mg/L thÃ¬ quy trÃ¬nh váº­n hÃ nh thiáº¿t bá»‹ bá»ƒ UASB á»Ÿ trang 42 cáº§n Ä‘iá»u chá»‰nh theo tiÃªu chuáº©n nÃ o táº¡i trang 180?"*, vector embedding khÃ´ng thá»ƒ liÃªn káº¿t 2 trang cÃ¡ch xa nhau.
2. **áº¢o giÃ¡c khi suy luáº­n Ä‘a bÆ°á»›c (Multi-hop Hallucination):** LLM pháº£i Ä‘oÃ¡n mÃ² thÃ´ng tin náº±m ráº£i rÃ¡c giá»¯a cÃ¡c chunks Ä‘á»™c láº­p, dáº«n Ä‘áº¿n cÃ¢u tráº£ lá»i bá»‹a Ä‘áº·t nhÆ°ng nghe ráº¥t thuyáº¿t phá»¥c.
3. **Máº¥t cáº¥u trÃºc phÃ¢n cáº¥p:** ThÃ´ng tin dáº¡ng danh má»¥c, sÆ¡ Ä‘á»“ Ä‘áº¥u dÃ¢y hoáº·c chuá»—i váº­n hÃ nh tuáº§n tá»± bá»‹ cáº¯t vá»¥n thÃ nh cÃ¡c Ä‘oáº¡n vÄƒn vÃ´ nghÄ©a.

---

## 3. Kiáº¿n TrÃºc GraphRAG: Hai Lá»›p Tri Thá»©c Bá»• Trá»£

Äá»ƒ kháº¯c phá»¥c hoÃ n toÃ n, tÃ´i thiáº¿t káº¿ kiáº¿n trÃºc káº¿t há»£p **Äá»“ thá»‹ tri thá»©c (Knowledge Graph)** vÃ  **KhÃ´ng gian vector ngá»¯ nghÄ©a (Vector Space)**:

```mermaid
flowchart TD
    Q["User Query: CÃ¢u há»i ká»¹ thuáº­t"] --> NER["TrÃ­ch xuáº¥t Thá»±c thá»ƒ (NER)"]
    Q --> EMB["Táº¡o Vector Embedding"]
    
    subgraph RETRIEVAL["TRUY XUáº¤T HYBRID (GRAPH + VECTOR)"]
        NER --> NEO["Neo4j Graph (Cypher 2â€“3 hops)"]
        EMB --> QDR["Qdrant DB (Dense Similarity)"]
    end
    
    NEO --> RRF["Reciprocal Rank Fusion (RRF)"]
    QDR --> RRF
    
    RRF --> LLM["Context-Augmented LLM"]
    LLM --> ANS["CÃ¢u tráº£ lá»i chÃ­nh xÃ¡c (Äá»™ trá»… &lt; 2s)"]
```

### CÃ¡ch thá»©c hoáº¡t Ä‘á»™ng:
1. **Neo4j (Knowledge Graph):** LÆ°u trá»¯ cÃ¡c thá»±c thá»ƒ ká»¹ thuáº­t (Thiáº¿t bá»‹, ThÃ´ng sá»‘, TiÃªu chuáº©n, Sá»± cá»‘) vÃ  cÃ¡c quan há»‡ cÃ³ hÆ°á»›ng:
   ```cypher
   (:ThietBi {ten: "Bá»ƒ UASB"})-[:CO_THONG_SO_KIEM_SOAT]->(:ThongSo {ten: "COD"})
   (:ThongSo {ten: "COD"})-[:QUY_DINH_BOI]->(:TieuChuan {ma: "QCVN 40:2011/BTNMT"})
   ```
2. **Qdrant (Vector Database):** Index cÃ¡c Ä‘oáº¡n vÄƒn báº£n giáº£i thÃ­ch nguyÃªn lÃ½ hoáº¡t Ä‘á»™ng, hÆ°á»›ng dáº«n váº­n hÃ nh chi tiáº¿t.
3. **Fusion Engine:** Khi truy váº¥n, Neo4j cung cáº¥p **báº£n Ä‘á»“ cáº¥u trÃºc logic** (cÃ¡c thá»±c thá»ƒ liÃªn quan), trong khi Qdrant cung cáº¥p **ná»™i dung chi tiáº¿t**. LLM chá»‰ cáº§n tá»•ng há»£p dá»±a trÃªn sá»± tháº­t vá»¯ng cháº¯c Ä‘Ã£ Ä‘Æ°á»£c neo trÃªn Ä‘á»“ thá»‹.

---

## 4. Káº¿t Quáº£ Äo Äáº¡c Thá»±c Nghiá»‡m

So sÃ¡nh hiá»‡u nÄƒng giá»¯a Semantic RAG truyá»n thá»‘ng vÃ  GraphRAG trÃªn táº­p kiá»ƒm thá»­ 3.200 truy váº¥n:

| Chá»‰ sá»‘ Ä‘Ã¡nh giÃ¡ | Semantic RAG thuáº§n tÃºy | GraphRAG (Neo4j + Qdrant) | Äá»™ cáº£i thiá»‡n |
|---|---|---|---|
| **Hit@1 (ÄÃºng ngay káº¿t quáº£ Ä‘áº§u)** | 78.4% | **95.2%** | **+ 16.8%** |
| **Hit@5 (Náº±m trong top 5)** | 89.1% | **99.1%** | **+ 10.0%** |
| **Tá»· lá»‡ áº£o giÃ¡c (Hallucination Rate)** | 14.6% | **< 1.8%** | **Giáº£m 87.6%** |
| **Thá»i gian pháº£n há»“i trung bÃ¬nh** | ~180 ms | ~210 ms | TÄƒng nháº¹ 30ms |
| **Thá»i gian xá»­ lÃ½ tÃ i liá»‡u ká»¹ thuáº­t** | 12s | **< 2s** | RÃºt ngáº¯n 6 láº§n |

---

## 5. TÃ i Liá»‡u Tham Kháº£o (References)

```
[01] Edge, D., Trinh, H., Cheng, N., Bradley, J., Chao, A., Mody, J., Truitt, S., & Larson, J. 
     (2024). From Local to Global: A Graph RAG Approach to Query-Focused Summarization. 
     Microsoft Research. arXiv:2404.16130.
[02] Neo4j Inc. (2024). Integrating Knowledge Graphs with Large Language Models for Advanced RAG. 
     Neo4j Official Whitepaper.
[03] Qdrant Team. (2024). High-Dimensional Vector Search and Dense-Sparse Hybrid Retrieval. 
     Qdrant Architecture Documentation.
[04] Lewis, P., et al. (2020). Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks. 
     NeurIPS 2020. arXiv:2005.11401.
```

---

## 6. BÃ i Viáº¿t LiÃªn Quan (Related Logs)

- [Multi-Agent Workflow: Tá»± Äá»™ng HÃ³a CSKH Vá»›i LangGraph vÃ  FastMCP](/posts/multi-agent-workflow-langraph/)  
  *CÃ¡ch tÃ­ch há»£p GraphRAG lÃ m cÃ´ng cá»¥ tra cá»©u cho há»‡ thá»‘ng Multi-Agent Ä‘áº¡t 99% Hit@5 trÃªn vLLM.*
- [Quantization Int8/FP4: Cháº¡y Model AI Lá»›n TrÃªn GPU TÃ i NguyÃªn Giá»›i Háº¡n](/posts/quantization-int8-fp4-inference/)  
  *Ká»¹ thuáº­t tá»‘i Æ°u hÃ³a bá»™ nhá»› GPU khi cáº§n tá»± host LLM vÃ  Embedding model cho há»‡ thá»‘ng RAG ná»™i bá»™.*
