---
title: "Quantization Int8/FP4: Chạy Model AI Lớn Trên GPU Tài Nguyên Giới Hạn"
date: 2026-09-29T12:00:00+07:00
draft: false
tags: ["generative-ai", "on-device-ai", "optimization"]
description: "Kỹ thuật quantization int8 và fp4 giúp chạy các Diffusion Transformer lớn trên GPU 16GB – phân tích trade-off chất lượng vs tốc độ từ thực nghiệm với LTX-2.5."
---

## Bài toán: Model AI quá lớn để chạy

Các mô hình Video Diffusion Transformer thế hệ mới (LTX-2.5, Wan, CogVideo) có kích thước 10–30B tham số. Ở độ chính xác **fp16**, mỗi tham số chiếm 2 bytes → model 13B cần **~26GB VRAM** chỉ để load.

Đây là rào cản lớn với hầu hết developer vì GPU consumer phổ biến nhất hiện nay (RTX 4080/4090) chỉ có 16–24GB VRAM.

## Quantization là gì?

**Quantization** là kỹ thuật giảm số bit biểu diễn trọng số model, đánh đổi một phần độ chính xác để tiết kiệm bộ nhớ và tăng tốc độ suy luận.

### FP16 (baseline)
- 16 bit/tham số
- Độ chính xác đầy đủ
- VRAM: 2 bytes × N params

### Int8 (8-bit quantization)
- 8 bit/tham số
- **Giảm 50% VRAM** so với fp16
- Mất mát chất lượng: ~2–3% FID score
- Phù hợp cho **production** khi cần cân bằng chất lượng và hiệu suất

### FP4 (4-bit quantization)
- 4 bit/tham số
- **Giảm 75% VRAM** so với fp16
- Mất mát chất lượng: ~8–12% FID score
- Phù hợp khi **tốc độ và bộ nhớ là ưu tiên tuyệt đối**

## Thực nghiệm với LTX-2.5 trên RTX 4080 (16GB)

| Cấu hình   | VRAM dùng | Thời gian/frame | FID Score |
|------------|-----------|-----------------|-----------|
| FP16       | 26GB ❌   | N/A (OOM)       | baseline  |
| Int8       | 13GB ✅   | 2.8s            | +2.4%     |
| FP4        | 7GB ✅    | 1.6s            | +9.8%     |
| FP4 + cache | 7.5GB ✅  | 1.1s            | +9.8%     |

**FP4 + attention cache** là cấu hình tôi sử dụng trong OpenVideoLab khi cần render nhanh (preview), còn int8 được dùng cho bản output final.

## Kỹ thuật bổ trợ: Attention Slicing & Sequential Offload

Ngoài quantization, có thể giảm thêm VRAM bằng:

- **Attention Slicing**: Chia nhỏ attention computation, giảm peak VRAM ~15–20% (chậm hơn ~10%)
- **Sequential CPU Offload**: Khi không cần module nào, offload sang RAM CPU. Cho phép chạy model rất lớn nhưng cực kỳ chậm.

Trong thực tế, tôi chỉ dùng attention slicing kết hợp int8 để giữ tốc độ chấp nhận được.

## Công cụ sử dụng

- **`bitsandbytes`**: Quantization int8/int4 cho PyTorch, tích hợp tốt với HuggingFace Diffusers
- **`torchao`**: FP4/FP8 quantization tối ưu cho GPU Ampere/Ada (RTX 30xx/40xx)
- **`quanto`**: HuggingFace native quantization, hỗ trợ calibration dataset

## Kết luận

Quantization không phải giải pháp "miễn phí" – luôn có trade-off. Nguyên tắc tôi áp dụng:

> **Int8 cho chất lượng, FP4 cho tốc độ, FP16 khi có đủ VRAM.**

Với sự phát triển của **FP8 training** và các kỹ thuật **quantization-aware training**, khoảng cách chất lượng giữa quantized và full-precision model đang thu hẹp nhanh chóng.
