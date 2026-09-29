---
title: "Æ¯á»›c LÆ°á»£ng Äá»™ SÃ¢u áº¢nh ÄÆ¡n Dá»±a TrÃªn CNN: NghiÃªn Cá»©u Táº¡i Há»™i Nghá»‹ SSRC"
date: 2026-07-20T10:00:00+07:00
draft: false
tags: ["computer-vision", "du-an", "nghien-cuu"]
description: "CÃ´ng trÃ¬nh nghiÃªn cá»©u tá»‘t nghiá»‡p (4.0/4.0) cÃ´ng bá»‘ táº¡i Há»™i nghá»‹ Khoa há»c SSRC: Cáº£i tiáº¿n kiáº¿n trÃºc U-Net, ResNet vÃ  DenseNet trong bÃ i toÃ¡n Monocular Depth Estimation vÃ  tÃ¡i táº¡o Point Cloud 3D."
summary: "CÃ´ng trÃ¬nh nghiÃªn cá»©u tá»‘t nghiá»‡p (4.0/4.0) cÃ´ng bá»‘ táº¡i Há»™i nghá»‹ Khoa há»c SSRC: Cáº£i tiáº¿n kiáº¿n trÃºc U-Net, ResNet vÃ  DenseNet trong bÃ i toÃ¡n Monocular Depth Estimation vÃ  tÃ¡i táº¡o Point Cloud 3D."
ShowToc: true
TocOpen: true
---

## 1. Minh Chá»©ng & CÃ´ng Bá»‘ Khoa Há»c (Evidence & Academic Credentials)

NghiÃªn cá»©u nÃ y lÃ  Ä‘á» tÃ i khÃ³a luáº­n tá»‘t nghiá»‡p ngÃ nh Khoa há»c MÃ¡y tÃ­nh táº¡i Äáº¡i há»c CÃ´ng nghiá»‡p TP.HCM (IUH) vÃ  Ä‘Æ°á»£c bÃ¡o cÃ¡o chÃ­nh thá»©c táº¡i Há»™i nghá»‹ Khoa há»c:

| Háº¡ng má»¥c | Minh chá»©ng thá»±c táº¿ | Chi tiáº¿t khoa há»c |
|---|---|---|
| **CÃ´ng bá»‘ khoa há»c** | **SSRC Conference** (Scientific Student Research Conference) | BÃ i bÃ¡o cÃ¡o khoa há»c vá» Monocular Depth Estimation |
| **MÃ£ nguá»“n (GitHub)** | [`github.com/Vinh-Gogo/depth-estimation`](https://github.com/Vinh-Gogo/depth-estimation) | Pipeline huáº¥n luyá»‡n PyTorch, U-Net, ResNet, DenseNet, Point Cloud Visualizer |
| **Káº¿t quáº£ khÃ³a luáº­n** | **4.0 / 4.0 (Äiá»ƒm tuyá»‡t Ä‘á»‘i)** | Äá»“ Ã¡n tá»‘t nghiá»‡p Cá»­ nhÃ¢n Khoa há»c MÃ¡y tÃ­nh (2021â€“2025) |
| **Táº­p dá»¯ liá»‡u Ä‘Ã¡nh giÃ¡** | **NYU Depth V2** & **KITTI Dataset** | Bá»™ dá»¯ liá»‡u chuáº©n má»±c tháº¿ giá»›i cho bÃ i toÃ¡n ná»™i tháº¥t vÃ  xe tá»± hÃ nh |
| **Äá»™ chÃ­nh xÃ¡c (Metrics)** | RMSE giáº£m `14.2%`, $\delta < 1.25$ Ä‘áº¡t `88.6%` | So sÃ¡nh Ä‘á»‘i sÃ¡nh trá»±c tiáº¿p vá»›i cÃ¡c baseline kiáº¿n trÃºc kinh Ä‘iá»ƒn |
| **Äáº§u ra thá»±c nghiá»‡m** | Depth Map (áº¢nh Ä‘á»™ sÃ¢u 16-bit) & **3D Point Cloud** | Xuáº¥t file Ä‘Ã¡m mÃ¢y Ä‘iá»ƒm 3D tÆ°Æ¡ng tÃ¡c (.ply, .xyz) |

---

## 2. BÃ i ToÃ¡n Monocular Depth Estimation: Nghá»‹ch LÃ½ Chiá»u Thá»© 3

Æ¯á»›c lÆ°á»£ng chiá»u sÃ¢u tá»« **má»™t áº£nh 2D RGB Ä‘Æ¡n láº» (Monocular Depth Estimation - MDE)** lÃ  má»™t bÃ i toÃ¡n nghá»‹ch lÃ½ cÆ¡ báº£n (Ill-posed problem) trong thá»‹ giÃ¡c mÃ¡y tÃ­nh:
- Má»™t Ä‘iá»ƒm áº£nh 2D cÃ³ thá»ƒ tÆ°Æ¡ng á»©ng vá»›i vÃ´ sá»‘ vá»‹ trÃ­ trong khÃ´ng gian 3D thá»±c táº¿ náº¿u khÃ´ng cÃ³ thÃ´ng tin vá» tiÃªu cá»± hoáº·c cáº£m biáº¿n LiDAR/ToF.
- Máº¡ng nÆ¡-ron tÃ­ch cháº­p (CNN) buá»™c pháº£i tá»± há»c cÃ¡c Ä‘áº·c trÆ°ng thá»‹ giÃ¡c ngáº§m Ä‘á»‹nh (Implicit visual cues): Ä‘á»™ dá»‘c phá»‘i cáº£nh (linear perspective), Ä‘á»™ che khuáº¥t (occlusion), gradient vÃ¢n bá» máº·t (texture gradients), vÃ  kÃ­ch thÆ°á»›c tÆ°Æ¡ng Ä‘á»‘i cá»§a cÃ¡c váº­t thá»ƒ Ä‘Ã£ biáº¿t.

---

## 3. Kiáº¿n TrÃºc & Cáº£i Tiáº¿n: Káº¿t Há»£p U-Net, ResNet & DenseNet

Äá»ƒ giáº£i quyáº¿t hiá»‡n tÆ°á»£ng máº¥t mÃ¡t thÃ´ng tin khÃ´ng gian chi tiáº¿t á»Ÿ cÃ¡c táº§ng sÃ¢u, tÃ´i thiáº¿t káº¿ mÃ´ hÃ¬nh theo mÃ´ hÃ¬nh Encoder-Decoder vá»›i cÃ¡c nhÃ¡nh káº¿t ná»‘i táº¯t (Skip Connections) nhiá»u má»©c:

```mermaid
flowchart TD
    IMG["áº¢nh RGB 2D Äáº§u VÃ o"] --> E1
    
    subgraph ENC["ENCODER: TRÃCH XUáº¤T Äáº¶C TRÆ¯NG"]
        E1["DenseNet-161 / ResNet-50<br/>Dense Blocks: TÃ¡i sá»­ dá»¥ng Ä‘áº·c trÆ°ng"]
    end
    
    E1 -->|"Skip Connections (Multi-Scale)"| D1
    E1 -->|"Bottleneck"| D1
    
    subgraph DEC["DECODER: KHÃ”I PHá»¤C CHIá»€U SÃ‚U"]
        D1["U-Net Up-convolution Blocks<br/>Tá»‘i Æ°u: SSIM Loss + L1 Depth Loss"]
    end
    
    D1 --> MAP["Báº£n Äá»“ Äá»™ SÃ¢u (16-bit)"]
    MAP --> PC["TÃ¡i Táº¡o Point Cloud 3D (.ply)"]
```

### HÃ m máº¥t mÃ¡t káº¿t há»£p (Custom Loss Function):
Äá»ƒ Ä‘Æ°á»ng biÃªn váº­t thá»ƒ sáº¯c nÃ©t vÃ  khÃ´ng bá»‹ nhÃ²e á»Ÿ cÃ¡c cáº¡nh bÃ n, mÃ©p tÆ°á»ng, tÃ´i Ã¡p dá»¥ng hÃ m máº¥t mÃ¡t káº¿t há»£p 3 thÃ nh pháº§n:

$$\mathcal{L}(y, \hat{y}) = \lambda_1 \mathcal{L}_{\text{depth}}(y, \hat{y}) + \lambda_2 \mathcal{L}_{\text{grad}}(y, \hat{y}) + \lambda_3 \mathcal{L}_{\text{SSIM}}(y, \hat{y})$$

- $\mathcal{L}_{\text{depth}}$: Äo sai sá»‘ tuyá»‡t Ä‘á»‘i $L_1$ theo tá»«ng pixel.
- $\mathcal{L}_{\text{grad}}$: Pháº¡t sai sá»‘ Ä‘áº¡o hÃ m khÃ´ng gian, báº£o toÃ n cÃ¡c cáº¡nh sáº¯c nhá»n.
- $\mathcal{L}_{\text{SSIM}}$: Giá»¯ cáº¥u trÃºc hÃ¬nh áº£nh tá»•ng thá»ƒ tÆ°Æ¡ng quan vá»›i máº¯t ngÆ°á»i.

---

## 4. TÃ¡i Táº¡o ÄÃ¡m MÃ¢y Äiá»ƒm 3D (Point Cloud Simulation)

Tá»« ma tráº­n Ä‘á»™ sÃ¢u dá»± Ä‘oÃ¡n $d(u, v)$ vÃ  ma tráº­n tham sá»‘ ná»™i cá»§a camera ($K$):

$$K = \begin{bmatrix} f_x & 0 & c_x \\ 0 & f_y & c_y \\ 0 & 0 & 1 \end{bmatrix}$$

Há»‡ thá»‘ng tá»± Ä‘á»™ng chiáº¿u ngÆ°á»£c tá»«ng pixel 2D $(u, v)$ vá» tá»a Ä‘á»™ khÃ´ng gian thá»±c $(X, Y, Z)$:

$$Z = d(u, v), \quad X = \frac{(u - c_x) \times Z}{f_x}, \quad Y = \frac{(v - c_y) \times Z}{f_y}$$

File Point Cloud (.ply) sinh ra cho phÃ©p xoay 3D, Ä‘o Ä‘áº¡c khoáº£ng cÃ¡ch thá»±c táº¿ giá»¯a cÃ¡c váº­t thá»ƒ, phá»¥c vá»¥ cÃ¡c á»©ng dá»¥ng AR/VR vÃ  xe tá»± hÃ nh.

---

## 5. TÃ i Liá»‡u Tham Kháº£o (References)

```
[01] Ronneberger, O., Fischer, P., & Brox, T. (2015). U-Net: Convolutional Networks 
     for Biomedical Image Segmentation. MICCAI 2015. arXiv:1505.04597.
[02] He, K., Zhang, X., Ren, S., & Sun, J. (2016). Deep Residual Learning for Image 
     Recognition (ResNet). IEEE CVPR 2016. arXiv:1512.03385.
[03] Huang, G., Liu, Z., Van Der Maaten, L., & Weinberger, K. Q. (2017). Densely Connected 
     Convolutional Networks (DenseNet). IEEE CVPR 2017. arXiv:1608.06993.
[04] Eigen, D., Puhrsch, C., & Fergus, R. (2014). Depth Map Prediction from a Single Image 
     using a Multi-Scale Deep Network. NeurIPS 2014.
[05] Nathan Silberman, Derek Hoiem, Pushmeet Kohli, and Rob Fergus. (2012). Indoor Segmentation 
     and Support Inference from RGBD Images. ECCV 2012 (NYU Depth V2 Dataset).
```

---

## 6. BÃ i Viáº¿t LiÃªn Quan (Related Logs)

- [OpenVideoLab: Táº¡o Sinh Video AI Äa PhÆ°Æ¡ng Thá»©c TrÃªn GPU 16GB](/posts/openvideolab-video-diffusion/)  
  *Tá»« hiá»ƒu biáº¿t vá» thá»‹ giÃ¡c khÃ´ng gian 3D vÃ  Æ°á»›c lÆ°á»£ng chuyá»ƒn Ä‘á»™ng Ä‘áº¿n cÃ¡c kiáº¿n trÃºc Diffusion video.*
- [On-Device AI: Cháº¡y Neural Network Offline Vá»›i ONNX TrÃªn Mobile](/posts/on-device-ai-onnx-kotlin/)  
  *CÃ¡ch Ä‘Ã³ng gÃ³i vÃ  tá»‘i Æ°u hÃ³a cÃ¡c máº¡ng nÆ¡-ron thá»‹ giÃ¡c mÃ¡y tÃ­nh cháº¡y cá»¥c bá»™ trÃªn Ä‘iá»‡n thoáº¡i.*
