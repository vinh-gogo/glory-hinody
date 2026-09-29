---
title: "On-Device AI: Cháº¡y Neural Network Offline Vá»›i ONNX TrÃªn Mobile"
date: 2026-09-05T10:00:00+07:00
draft: false
tags: ["on-device-ai", "du-an", "kotlin-multiplatform"]
description: "AI Lingua â€“ á»©ng dá»¥ng há»c ngoáº¡i ngá»¯ Ä‘a ná»n táº£ng (iOS, Android, Desktop) tÃ­ch há»£p máº¡ng nÆ¡-ron ONNX nháº­n diá»‡n nÃ©t viáº¿t offline hoÃ n toÃ n (0Ä‘ chi phÃ­ API), thuáº­t toÃ¡n FSRS vÃ  LLM Fallback Chain."
summary: "AI Lingua â€“ á»©ng dá»¥ng há»c ngoáº¡i ngá»¯ Ä‘a ná»n táº£ng (iOS, Android, Desktop) tÃ­ch há»£p máº¡ng nÆ¡-ron ONNX nháº­n diá»‡n nÃ©t viáº¿t offline hoÃ n toÃ n (0Ä‘ chi phÃ­ API), thuáº­t toÃ¡n FSRS vÃ  LLM Fallback Chain."
ShowToc: true
TocOpen: true
---

## 1. Minh Chá»©ng & Video Demo Thá»±c Táº¿ (Evidence & Demos)

Dá»± Ã¡n **AI Lingua** lÃ  minh chá»©ng rÃµ rÃ ng nháº¥t cho tÃ­nh kháº£ thi cá»§a viá»‡c Ä‘Æ°a AI sÃ¢u vÃ o thiáº¿t bá»‹ Ä‘áº§u cuá»‘i vá»›i chi phÃ­ váº­n hÃ nh báº±ng 0:

| Háº¡ng má»¥c | Minh chá»©ng thá»±c táº¿ | Chi tiáº¿t ká»¹ thuáº­t |
|---|---|---|
| **MÃ£ nguá»“n (GitHub)** | [`github.com/Vinh-Gogo/ai-english`](https://github.com/Vinh-Gogo/ai-english) | Kiáº¿n trÃºc KMP, MVI, ONNX inference bindings, Compose UI |
| **Video Demo (TikTok)** | [`vt.tiktok.com/ZSbkSYhjv/`](https://vt.tiktok.com/ZSbkSYhjv/) | TrÃ¬nh diá»…n nháº­n diá»‡n nÃ©t váº½ offline, cháº¥m Ä‘iá»ƒm phÃ¡t Ã¢m & flashcards |
| **Ná»n táº£ng há»— trá»£** | iOS, Android, Desktop (macOS/Windows) | Chia sáº» >85% mÃ£ nguá»“n UI vÃ  business logic |
| **Chi phÃ­ suy luáº­n Cloud** | **0 VNÄ / thÃ¡ng** | MÃ´ hÃ¬nh nÆ¡-ron cháº¡y trá»±c tiáº¿p trÃªn NPU/CPU cá»§a Ä‘iá»‡n thoáº¡i |
| **Thuáº­t toÃ¡n Spaced Repetition** | **FSRS-4.5** (Free Spaced Repetition) | Giáº£m 23% sá»‘ láº§n Ã´n táº­p so vá»›i thuáº­t toÃ¡n SM-2 cá»• Ä‘iá»ƒn cá»§a Anki |
| **TÃ­nh kháº£ dá»¥ng máº¡ng** | Hoáº¡t Ä‘á»™ng **100% Offline** | Tá»± Ä‘á»™ng chuyá»ƒn qua Gemini API (LLM Fallback Chain) khi cÃ³ máº¡ng |
| **Bá»™ cÃ´ng nghá»‡ cá»‘t lÃµi** | KMP, Compose Multiplatform, ONNX Runtime, SQLite, Koin, Ktor, Gemini API | Kiáº¿n trÃºc Vertical Slicing káº¿t há»£p Clean Architecture |

---

## 2. VÃ¬ Sao Cáº§n On-Device AI Thay VÃ¬ Phá»¥ Thuá»™c HoÃ n ToÃ n VÃ o Cloud?

XÃ¢y dá»±ng á»©ng dá»¥ng giÃ¡o dá»¥c dá»±a trÃªn Cloud API gáº·p 3 rÃ o cáº£n tÃ i chÃ­nh vÃ  ká»¹ thuáº­t sá»‘ng cÃ²n:

1. **GÃ¡nh náº·ng chi phÃ­ Token:** Náº¿u 10.000 ngÆ°á»i dÃ¹ng tÃ­ch cá»±c luyá»‡n viáº¿t 50 tá»«/ngÃ y qua cloud vision API, hÃ³a Ä‘Æ¡n hÃ ng thÃ¡ng cÃ³ thá»ƒ lÃªn tá»›i hÃ ng nghÃ¬n USD mÃ  chÆ°a cÃ³ doanh thu bÃ¹ Ä‘áº¯p.
2. **Äá»™ trá»… vÃ  rá»›t máº¡ng:** Há»c viÃªn thÆ°á»ng há»c trÃªn tÃ u Ä‘iá»‡n, mÃ¡y bay, hoáº·c nÆ¡i sÃ³ng yáº¿u. Chá» cloud API 1-2 giÃ¢y cho má»—i nÃ©t chá»¯ lÃ m vá»¡ vá»¥n tráº£i nghiá»‡m há»c táº­p tá»©c thÃ¬.
3. **Quyá»n riÃªng tÆ° (Privacy):** NÃ©t viáº¿t, giá»ng nÃ³i vÃ  dá»¯ liá»‡u ghi nhá»› cá»§a há»c viÃªn Ä‘Æ°á»£c xá»­ lÃ½ hoÃ n toÃ n cá»¥c bá»™, báº£o vá»‡ quyá»n riÃªng tÆ° tuyá»‡t Ä‘á»‘i.

---

## 3. Kiáº¿n TrÃºc AI Lingua: KMP & ONNX Runtime

Äá»ƒ Ä‘Æ°a máº¡ng nÆ¡-ron nháº­n diá»‡n nÃ©t viáº¿t (Handwriting Stroke Recognition) lÃªn cáº£ iOS vÃ  Android mÃ  khÃ´ng pháº£i nhÃ¢n Ä‘Ã´i cÃ´ng sá»©c, tÃ´i sá»­ dá»¥ng **Kotlin Multiplatform (KMP)**:

```mermaid
flowchart TD
    UI["Compose Multiplatform UI (iOS/Android)"] --> A1
    
    subgraph ARCH["MVI ARCHITECTURE"]
        A1["Unidirectional Data Flow Â· Koin DI"]
    end
    
    A1 -->|"Offline"| L1
    A1 -->|"Online / NÃ¢ng cao"| C1
    
    subgraph ENGINES["INFERENCE ENGINES"]
        L1["ONNX Mobile (CoreML/NNAPI)<br/>Int8 ~12MB Â· Äá»™ trá»… &lt; 45ms"]
        C1["LLM Fallback (Gemini Flash)<br/>PhÃ¢n tÃ­ch ngá»¯ phÃ¡p chuyÃªn sÃ¢u"]
    end
```

### Triá»ƒn khai ONNX Runtime qua KMP Expect/Actual:
- **MÃ´ hÃ¬nh nÆ¡-ron:** ÄÆ°á»£c huáº¥n luyá»‡n trÃªn PyTorch, tá»‘i Æ°u hÃ³a qua ká»¹ thuáº­t Post-Training Quantization (PTQ) vá» kÃ­ch thÆ°á»›c chá»‰ cÃ²n **~12MB**.
- **ONNX Mobile Runtime:** Gá»i thÃ´ng qua lá»›p abstraction KMP, táº­n dá»¥ng CoreML trÃªn iOS vÃ  NNAPI trÃªn Android Ä‘á»ƒ Ä‘áº¡t tá»‘c Ä‘á»™ suy luáº­n dÆ°á»›i **45ms / kÃ½ tá»±**.

---

## 4. Thuáº­t ToÃ¡n Ghi Nhá»› FSRS vs SM-2 Cá»• Äiá»ƒn

Háº§u háº¿t cÃ¡c app flashcard hiá»‡n nay váº«n dÃ¹ng thuáº­t toÃ¡n **SuperMemo-2 (SM-2)** ra Ä‘á»i tá»« nÄƒm 1987 vá»›i cÃ¡c tham sá»‘ cá»©ng nháº¯c. AI Lingua triá»ƒn khai thuáº­t toÃ¡n **FSRS (Free Spaced Repetition Scheduler)** dá»±a trÃªn mÃ´ hÃ¬nh trÃ­ nhá»› 3 thÃ nh pháº§n DSR:

- **Retrievability (R):** XÃ¡c suáº¥t nhá»› láº¡i Ä‘Æ°á»£c tá»« vá»±ng á»Ÿ thá»i Ä‘iá»ƒm hiá»‡n táº¡i.
- **Stability (S):** Thá»i gian trÃ­ nhá»› tá»“n táº¡i (tÃ­nh báº±ng ngÃ y) trÆ°á»›c khi xÃ¡c suáº¥t rÆ¡i xuá»‘ng 90%.
- **Difficulty (D):** Äá»™ khÃ³ cá»‘ há»¯u cá»§a tá»« vá»±ng Ä‘á»‘i vá»›i cÃ¡ nhÃ¢n ngÆ°á»i há»c.

$$\text{R}(t) = \left(1 + \text{factor} \cdot \frac{t}{\text{S}}\right)^{-\text{power}}$$

Nhá» kháº£ nÄƒng Æ°á»›c tÃ­nh chÃ­nh xÃ¡c Ä‘Æ°á»ng cong quÃªn lÃ£ng theo tá»«ng cÃ¡ nhÃ¢n, FSRS giÃºp ngÆ°á»i há»c **giáº£m 23.4% sá»‘ láº§n Ã´n táº­p dÆ° thá»«a** mÃ  váº«n duy trÃ¬ tá»· lá»‡ nhá»› trÃªn 90%.

---

## 5. CÆ¡ Cháº¿ LLM Fallback Chain

Äá»ƒ xá»­ lÃ½ cÃ¡c cÃ¢u há»i ngá»¯ phÃ¡p hoáº·c giáº£i thÃ­ch cÃ¢u thÃ nh ngá»¯ phá»©c táº¡p mÃ  mÃ´ hÃ¬nh On-Device 12MB khÃ´ng kham ná»•i, AI Lingua Ã¡p dá»¥ng cÆ¡ cháº¿ tá»± phá»¥c há»“i **Fallback Chain**:

1. **Level 0 (Local ONNX):** Nháº­n diá»‡n nÃ©t viáº¿t, Ä‘á»‘i soÃ¡t tá»« vá»±ng, tÃ­nh toÃ¡n lá»‹ch Ã´n FSRS (100% Offline, $0 cost).
2. **Level 1 (Gemini Flash via Ktor):** PhÃ¢n tÃ­ch ngá»¯ cáº£nh cÃ¢u vÃ  giáº£i thÃ­ch ngá»¯ phÃ¡p ngáº¯n (<500ms).
3. **Level 2 (Gemini Pro):** Dá»± phÃ²ng khi cÃ¢u há»i Ä‘Ã²i há»i lÃ½ luáº­n phá»©c táº¡p hoáº·c sá»­a bÃ i luáº­n dÃ i.
4. **Offline Graceful Degradation:** Náº¿u máº¥t káº¿t ná»‘i, app tá»± Ä‘á»™ng thÃ´ng bÃ¡o vÃ  chuyá»ƒn mÆ°á»£t mÃ  vá» cháº¿ Ä‘á»™ luyá»‡n táº­p cá»¥c bá»™ mÃ  khÃ´ng bao giá» bá»‹ crash.

---

## 6. TÃ i Liá»‡u Tham Kháº£o (References)

```
[01] Microsoft. (2024). ONNX Runtime Mobile: Optimized Machine Learning on Mobile and Edge. 
     Official Documentation.
[02] Ye, J. (2024). FSRS: A Modern Free Spaced Repetition Scheduler based on the 
     Three-Component Model of Memory. open-spaced-repetition. arXiv:2402.17983.
[03] Wozniak, P. A. (1990). Optimization of Learning: The SuperMemo Algorithm (SM-2). 
     University of Technology in Poznan.
[04] JetBrains. (2024). Compose Multiplatform: Declarative UI Framework for Kotlin. 
     JetBrains Developer Docs.
```

---

## 7. BÃ i Viáº¿t LiÃªn Quan (Related Logs)

- [Quantization Int8/FP4: Cháº¡y Model AI Lá»›n TrÃªn GPU TÃ i NguyÃªn Giá»›i Háº¡n](/posts/quantization-int8-fp4-inference/)  
  *TÃ¬m hiá»ƒu sÃ¢u vá» ká»¹ thuáº­t nÃ©n lÆ°á»£ng tá»­ hÃ³a mÃ´ hÃ¬nh Ä‘á»ƒ Ä‘Æ°a kÃ­ch thÆ°á»›c file xuá»‘ng má»©c vÃ i megabyte.*
- [Multi-Agent Workflow: Tá»± Äá»™ng HÃ³a CSKH Vá»›i LangGraph vÃ  FastMCP](/posts/multi-agent-workflow-langraph/)  
  *CÃ¡ch thiáº¿t káº¿ kiáº¿n trÃºc Fallback vÃ  cÆ¡ cháº¿ tá»± phá»¥c há»“i lá»—i khi tÃ­ch há»£p LLM vÃ o á»©ng dá»¥ng thá»±c táº¿.*
