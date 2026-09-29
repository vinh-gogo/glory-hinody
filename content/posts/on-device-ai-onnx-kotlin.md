---
title: "On-Device AI: Chạy Neural Network Offline Với ONNX Trên Mobile"
date: 2026-09-29T12:00:00+07:00
draft: false
tags: ["on-device-ai", "du-an", "kotlin-multiplatform"]
description: "AI Lingua – ứng dụng học ngoại ngữ chạy AI hoàn toàn offline nhờ ONNX Runtime trên iOS và Android với Kotlin Multiplatform, kết hợp thuật toán FSRS tối ưu ghi nhớ từ vựng."
---

## AI Lingua – Học ngoại ngữ thông minh không cần internet

**AI Lingua** là ứng dụng học ngoại ngữ đa nền tảng mà tôi xây dựng với mục tiêu mang trải nghiệm AI cá nhân hóa đến mọi người dùng – kể cả khi không có kết nối internet.

## Tại sao chọn On-Device AI thay vì Cloud API?

Đây là câu hỏi đầu tiên khi thiết kế kiến trúc. Ba lý do chính dẫn đến quyết định **On-Device**:

### 1. Chi phí = 0

Cloud API như OpenAI hay Google AI tính phí theo token. Với hàng nghìn người dùng thực hành từ vựng mỗi ngày, chi phí API sẽ trở nên khổng lồ. On-device loại bỏ hoàn toàn chi phí inference.

### 2. Offline hoàn toàn

Người dùng học ngoại ngữ trên tàu điện, máy bay, vùng sóng yếu. On-device đảm bảo ứng dụng hoạt động ổn định **100% không cần internet** sau khi download model một lần.

### 3. Privacy tuyệt đối

Dữ liệu học tập (lịch sử từ vựng, điểm yếu của người dùng) không bao giờ rời khỏi thiết bị – một lợi thế cạnh tranh quan trọng so với các app cloud-based.

## ONNX Runtime trên iOS và Android

**ONNX (Open Neural Network Exchange)** là định dạng model trung gian cho phép export từ PyTorch/TensorFlow và chạy trên nhiều runtime khác nhau.

Workflow của AI Lingua:

```
PyTorch Model (training)
        │
        ▼
   ONNX Export
        │
   ┌────┴────┐
   │         │
Android    iOS
(ONNX RT  (ONNX RT
 Java/KMP)  Swift/KMP)
```

Nhờ **Kotlin Multiplatform (KMP)**, phần logic xử lý ONNX được viết một lần và compile sang cả Android lẫn iOS, giảm ~60% code trùng lặp so với phát triển native riêng biệt.

## Thuật toán FSRS – Ghi nhớ khoa học

AI Lingua tích hợp **FSRS (Free Spaced Repetition Scheduler)** – thuật toán spaced repetition thế hệ mới, cải tiến từ SM-2 (thuật toán của Anki).

FSRS dự đoán **xác suất nhớ được** một từ tại thời điểm ôn tập dựa trên:
- Lịch sử đánh giá của người dùng với từ đó
- Độ khó của từ
- Khoảng cách từ lần ôn cuối

Kết quả: số lần ôn tập cần thiết giảm ~23% so với SM-2, trong khi tỉ lệ nhớ lâu dài tương đương.

## LLM Fallback Chain

Khi người dùng hỏi câu phức tạp vượt quá khả năng của model on-device, AI Lingua kích hoạt **LLM Fallback Chain**:

1. **Local model (ONNX)** → xử lý trước
2. Nếu confidence thấp → **LLM nhỏ via API** (Gemini Flash)
3. Nếu vẫn không đủ → **LLM lớn** (Gemini Pro)

Chiến lược này cân bằng giữa chi phí, tốc độ và chất lượng câu trả lời.

## Compose Multiplatform UI

Giao diện được xây dựng bằng **Compose Multiplatform** – chia sẻ UI code giữa Android và iOS, với **Clean Architecture + MVI** pattern để đảm bảo testability và maintainability.

## Kết luận

AI Lingua chứng minh rằng On-Device AI không chỉ là giải pháp "backup" mà có thể là lựa chọn **ưu tiên** cho các ứng dụng cần chi phí thấp, offline và bảo mật cao.
