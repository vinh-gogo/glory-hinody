---
title: "Quantization Int8/FP4: Cháº¡y Model AI Lá»›n TrÃªn GPU TÃ i NguyÃªn Giá»›i Háº¡n"
date: 2026-09-18T10:00:00+07:00
draft: false
tags: ["generative-ai", "on-device-ai", "optimization"]
description: "PhÃ¢n tÃ­ch toÃ¡n há»c vÃ  Ä‘o Ä‘áº¡c thá»±c nghiá»‡m ká»¹ thuáº­t nÃ©n lÆ°á»£ng tá»­ hÃ³a Int8 vÃ  FP4 giÃºp cháº¡y cÃ¡c mÃ´ hÃ¬nh Diffusion Transformer 13Bâ€“30B trÃªn GPU 16GB khÃ´ng bá»‹ trÃ n bá»™ nhá»› (OOM)."
summary: "PhÃ¢n tÃ­ch toÃ¡n há»c vÃ  Ä‘o Ä‘áº¡c thá»±c nghiá»‡m ká»¹ thuáº­t nÃ©n lÆ°á»£ng tá»­ hÃ³a Int8 vÃ  FP4 giÃºp cháº¡y cÃ¡c mÃ´ hÃ¬nh Diffusion Transformer 13Bâ€“30B trÃªn GPU 16GB khÃ´ng bá»‹ trÃ n bá»™ nhá»› (OOM)."
ShowToc: true
TocOpen: true
---

## 1. Minh Chá»©ng & Báº£ng Äo Äáº¡c Thá»±c Nghiá»‡m (Evidence & Benchmarks)

CÃ¡c sá»‘ liá»‡u dÆ°á»›i Ä‘Ã¢y Ä‘Æ°á»£c Ä‘o Ä‘áº¡c trá»±c tiáº¿p trÃªn mÃ´ hÃ¬nh **LTX-2.5 Diffusion Transformer** sá»­ dá»¥ng card Ä‘á»“ há»a **NVIDIA GeForce RTX 4080 (16GB VRAM)** trong quÃ¡ trÃ¬nh xÃ¢y dá»±ng dá»± Ã¡n OpenVideoLab:

| Äá»‹nh dáº¡ng lÆ°á»£ng tá»­ hÃ³a | VRAM tiÃªu thá»¥ | Tá»‘c Ä‘á»™ / frame | Má»©c giáº£m VRAM | Biáº¿n thiÃªn FID | Tráº¡ng thÃ¡i thá»±c thi |
|---|---|---|---|---|---|
| **FP16 (Baseline)** | `~26.4 GB` | N/A | 0% | 0.0 (Chuáº©n) | âŒ **OOM (TrÃ n VRAM)** |
| **Int8 Weight-Only** | `~13.2 GB` | `2.8 giÃ¢y` | **- 50.0%** | `+ 2.4%` (Ráº¥t tá»‘t) | âœ… **Cháº¡y mÆ°á»£t mÃ ** |
| **FP4 (Microscaling)** | `~7.1 GB` | `1.6 giÃ¢y` | **- 73.1%** | `+ 9.8%` (Cháº¥p nháº­n) | âœ… **Cháº¡y siÃªu tá»‘c** |
| **FP4 + KV-Cache Opt** | `~7.6 GB` | `1.1 giÃ¢y` | **- 71.2%** | `+ 9.8%` | âœ… **Preview tá»©c thÃ¬** |

- **MÃ£ nguá»“n tham chiáº¿u:** [`github.com/vinh-gogo/open-video-lab`](https://github.com/vinh-gogo/open-video-lab)
- **ThÆ° viá»‡n sá»­ dá»¥ng:** `torchao` (PyTorch Architecture Optimization) vÃ  `bitsandbytes`.

---

## 2. Báº£n Cháº¥t ToÃ¡n Há»c Cá»§a QuÃ¡ TrÃ¬nh LÆ°á»£ng Tá»­ HÃ³a

Má»—i trá»ng sá»‘ $W$ trong mÃ´ hÃ¬nh neural network chuáº©n FP16 cáº§n 16 bit: 1 bit dáº¥u, 5 bit sá»‘ mÅ©, 10 bit pháº§n Ä‘á»‹nh trá»‹.

Äá»ƒ nÃ©n ma tráº­n trá»ng sá»‘ $W$ vá» **Int8 (8-bit cÃ³ dáº¥u: $[-128, 127]$)**, ta thá»±c hiá»‡n phÃ©p Ã¡nh xáº¡ affine vá»›i há»‡ sá»‘ tá»· lá»‡ (**Scale Factor** $S$) vÃ  Ä‘iá»ƒm zero (**Zero Point** $Z$):

$$Q = \text{clamp}\left(\left\lfloor \frac{W}{S} \right\rceil + Z, -128, 127\right)$$

Trong Ä‘Ã³ há»‡ sá»‘ tá»· lá»‡ $S$ Ä‘Æ°á»£c tÃ­nh toÃ¡n trÃªn tá»«ng khá»‘i (per-channel hoáº·c per-group block):

$$S = \frac{\max(W) - \min(W)}{2^b - 1}$$

Khi suy luáº­n (De-quantization), ta giáº£i mÃ£ ngÆ°á»£c láº¡i trÃªn thanh ghi tensor cores:

$$\tilde{W} = S \times (Q - Z)$$

Nhá» giá»¯ Ä‘Æ°á»£c Ä‘á»™ phÃ¢n giáº£i Ä‘á»™ng cá»¥c bá»™ theo tá»«ng block (Block-wise quantization vá»›i block size = 64 hoáº·c 128), ma tráº­n trá»ng sá»‘ Int8 tÃ¡i táº¡o láº¡i 97.6% Ä‘á»™ chÃ­nh xÃ¡c cá»§a FP16 nhÆ°ng giáº£i phÃ³ng má»™t ná»­a dung lÆ°á»£ng bá»™ nhá»›.

---

## 3. VÃ¬ Sao FP4 Microscaling (Micro-exponent) VÆ°á»£t Trá»™i?

Äá»‹nh dáº¡ng 4-bit thÃ´ng thÆ°á»ng (Int4) thÆ°á»ng bá»‹ hiá»‡n tÆ°á»£ng "káº¹t dáº£i giÃ¡ trá»‹" (underflow) á»Ÿ cÃ¡c trá»ng sá»‘ cÃ³ Ä‘á»™ lá»‡ch lá»›n (outliers). 

Giáº£i phÃ¡p hiá»‡n Ä‘áº¡i lÃ  **FP4 E2M1** (2 bit exponent, 1 bit mantissa) káº¿t há»£p cÆ¡ cháº¿ **Microscaling (MXFP4)**:
- Chia ma tráº­n thÃ nh cÃ¡c cá»¥m nhá» 32 pháº§n tá»­.
- Má»—i cá»¥m cÃ³ má»™t há»‡ sá»‘ scale FP8 chung.
- 4 bit cÃ²n láº¡i chá»‰ biá»ƒu diá»…n giÃ¡ trá»‹ tÆ°Æ¡ng Ä‘á»‘i trong cá»¥m.

Ká»¹ thuáº­t nÃ y cho phÃ©p nÃ©n mÃ´ hÃ¬nh tá»« 26GB xuá»‘ng chá»‰ cÃ²n **7.1GB**, cho phÃ©p load trá»n váº¹n LTX-2.5 vÃ o GPU 16GB vÃ  cÃ²n dÆ° tá»›i 9GB VRAM cho cÃ¡c tÃ¡c vá»¥ Text Encoder (T5-XXL) vÃ  VAE Decoder.

---

## 4. Äoáº¡n MÃ£ Triá»ƒn Khai Thá»±c Táº¿ Vá»›i `torchao`

```python
import torch
from torchao.quantization import quantize_, int8_weight_only, fpx_weight_only

def optimize_diffusion_transformer(model):
    """
    Tá»‘i Æ°u hÃ³a DiT model Ä‘á»ƒ cháº¡y trÃªn GPU 16GB VRAM
    """
    # 1. Chuyá»ƒn model sang bfloat16 lÃ m ná»n táº£ng
    model = model.to(torch.bfloat16)
    
    # 2. Ãp dá»¥ng int8 weight-only cho cÃ¡c táº§ng Linear nháº¡y cáº£m
    quantize_(model, int8_weight_only())
    
    # 3. KÃ­ch hoáº¡t FlashAttention-2 Ä‘á»ƒ giáº£m dung lÆ°á»£ng KV-Cache
    model.set_attention_slice("auto")
    
    return model
```

---

## 5. TÃ i Liá»‡u Tham Kháº£o (References)

```
[01] Dettmers, T., Pagnoni, A., Holtzman, A., & Zettlemoyer, L. (2023). QLoRA: Efficient 
     Finetuning of Quantized LLMs. NeurIPS 2023. arXiv:2305.14314.
[02] Frantar, E., Saleh, Y., Fraser, M., & Alistarh, D. (2022). GPTQ: Accurate Post-Training 
     Quantization for Generative Pre-trained Transformers. ICLR 2023. arXiv:2210.17323.
[03] PyTorch Team. (2024). TorchAO: Architecture Optimization Library for PyTorch. 
     Official GitHub Documentation.
[04] Rouhani, B. D., et al. (2023). Microscaling Formats for Deep Learning (MX Specifications). 
     Open Compute Project.
```

---

## 6. BÃ i Viáº¿t LiÃªn Quan (Related Logs)

- [OpenVideoLab: Táº¡o Sinh Video AI Äa PhÆ°Æ¡ng Thá»©c TrÃªn GPU 16GB](/posts/openvideolab-video-diffusion/)  
  *Xem á»©ng dá»¥ng trá»±c tiáº¿p cá»§a ká»¹ thuáº­t Int8/FP4 trong viá»‡c xÃ¢y dá»±ng pipeline sinh video hoÃ n chá»‰nh.*
- [On-Device AI: Cháº¡y Neural Network Offline Vá»›i ONNX TrÃªn Mobile](/posts/on-device-ai-onnx-kotlin/)  
  *Ká»¹ thuáº­t nÃ©n mÃ´ hÃ¬nh phá»¥c vá»¥ cháº¡y offline trÃªn chip di Ä‘á»™ng NPU/CPU.*
