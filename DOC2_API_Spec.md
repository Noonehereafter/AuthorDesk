# AuthorDesk — API Specification (REST + SSE)
**Version 1.0 | May 2026**

---

## Tổng quan

AuthorDesk dùng chiến lược **contract-first API** với:
- **REST** cho CRUD và điều phối workflow
- **SSE (Server-Sent Events)** cho streaming generation, copilot output, job progress
- **Provider-neutral model router** — UI chỉ gọi một interface duy nhất, backend tự chọn local hay cloud

Base URL:
- REST: `/api/v1`
- SSE: `/api/v1/stream`

---

## REST Resources

### Projects

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/projects` | Tạo project mới |
| GET | `/projects` | Danh sách project |
| GET | `/projects/{projectId}` | Chi tiết project |
| PATCH | `/projects/{projectId}` | Cập nhật metadata, language, grounding |
| DELETE | `/projects/{projectId}` | Archive hoặc xoá project |

**POST /projects — Request body:**
```json
{
  "name": "Red Dust Protocol",
  "type": "fiction",
  "projectLanguage": "vi",
  "uiLanguage": "vi",
  "groundingLevel": 1,
  "genre": ["hard-sci-fi"],
  "targetLength": { "unit": "chapters", "value": 180 }
}
```

**Response:**
```json
{
  "id": "proj_abc123",
  "name": "Red Dust Protocol",
  "type": "fiction",
  "status": "active",
  "createdAt": "2026-05-13T06:30:00Z"
}
```

---

### Chapters

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/projects/{id}/chapters` | Tạo chapter mới |
| GET | `/projects/{id}/chapters` | Danh sách chapter |
| GET | `/projects/{id}/chapters/{chId}` | Chi tiết chapter |
| PATCH | `/projects/{id}/chapters/{chId}` | Cập nhật metadata |
| POST | `/projects/{id}/chapters/{chId}/generate` | Kích hoạt generation job |
| POST | `/projects/{id}/chapters/{chId}/review` | Gửi review decision |
| POST | `/projects/{id}/chapters/{chId}/lock-canon` | Lock canon deltas sau khi approve |

**POST generate — Request body:**
```json
{
  "modelPreference": "auto",
  "groundingLevel": 2,
  "recapDepth": 3,
  "includeVoiceSheets": ["char_001", "char_002"],
  "evidencePacketIds": ["ep_55", "ep_56"]
}
```

---

### Bible Entities

| Method | Endpoint | Mô tả |
|---|---|---|
| GET/POST | `/projects/{id}/bible/characters` | Danh sách hoặc tạo nhân vật |
| GET/PATCH | `/projects/{id}/bible/characters/{charId}` | Chi tiết hoặc cập nhật nhân vật |
| GET/POST | `/projects/{id}/bible/voice-sheets` | Voice sheets |
| GET | `/projects/{id}/bible/world-rules` | World rules |
| GET | `/projects/{id}/bible/timeline` | Timeline graph |
| GET/POST | `/projects/{id}/bible/foreshadow-ledger` | Foreshadow items |
| GET/POST | `/projects/{id}/bible/canon-facts` | Canon facts |
| PATCH | `/projects/{id}/bible/canon-facts/{factId}` | Lock hoặc deprecate fact |

**POST /bible/characters — Request body:**
```json
{
  "name": "Lê Thị Minh",
  "aliases": ["Minh", "The Ghost"],
  "age": 28,
  "appearance": "Tóc đen ngắn, sẹo hình lưỡi liềm trên cổ tay trái",
  "motivations": ["Tìm lại em trai", "Phá huỷ tập đoàn Helios"],
  "fears": ["Mất kiểm soát năng lực", "Bị phản bội lần nữa"],
  "secrets": ["Là thực nghiệm thất bại của Helios"],
  "voiceSheetId": null
}
```

---

### Sources & Retrieval

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/projects/{id}/sources/upload` | Upload PDF, markdown, txt, docx |
| POST | `/projects/{id}/sources/url` | Thêm nguồn từ web URL |
| GET | `/projects/{id}/sources` | Danh sách nguồn |
| DELETE | `/projects/{id}/sources/{srcId}` | Xoá nguồn |
| POST | `/projects/{id}/retrieval/query` | Truy hồi chunk có liên quan |
| POST | `/projects/{id}/grounding/check` | Kiểm tra đoạn văn với claim policy |

**POST /retrieval/query — Request body:**
```json
{
  "query": "Cơ chế CRISPR-Cas9 chỉnh sửa gene",
  "topK": 5,
  "language": "en",
  "filters": { "docType": ["pdf"] }
}
```

**Response:**
```json
{
  "chunks": [
    {
      "id": "chunk_77",
      "sourceDocumentId": "src_12",
      "text": "CRISPR-Cas9 uses guide RNA to direct...",
      "score": 0.91,
      "pageRef": "p.14",
      "sourceTitle": "Nature Reviews Genetics 2023"
    }
  ]
}
```

**POST /grounding/check — Request body:**
```json
{
  "paragraphId": "para_44",
  "text": "Quá trình phiên mã ngược diễn ra trong 48 giờ...",
  "groundingLevel": 2,
  "evidencePacketIds": ["ep_55"]
}
```

**Response:**
```json
{
  "claims": [
    {
      "text": "phiên mã ngược diễn ra trong 48 giờ",
      "supportStatus": "unsupported",
      "suggestion": "Cần nguồn xác nhận timeframe 48h"
    }
  ]
}
```

---

### Copilot

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/projects/{id}/copilot/invoke` | Gọi một Copilot agent |
| POST | `/projects/{id}/copilot/inline-action` | Inline action từ editor selection |
| GET | `/projects/{id}/copilot/history` | Lịch sử copilot session |

**POST /copilot/invoke — Request body:**
```json
{
  "agent": "plot",
  "language": "vi",
  "groundingLevel": 0,
  "context": {
    "currentChapterId": "ch_018",
    "unresolvedThreadIds": ["ft_003", "ft_007"]
  },
  "goal": "Đề xuất 3 plot twist từ chapter 18, hợp logic với foreshadow đã cài",
  "modelPreference": "auto"
}
```

**POST /copilot/inline-action — Request body:**
```json
{
  "action": "ground_with_sources",
  "selection": "Nhân vật tiêm enzyme telomerase vào tĩnh mạch...",
  "paragraphId": "para_44",
  "groundingLevel": 2
}
```

---

### Jobs

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/jobs/{jobId}` | Trạng thái job |
| POST | `/jobs/{jobId}/cancel` | Huỷ job |
| POST | `/jobs/{jobId}/retry` | Chạy lại job |
| GET | `/projects/{id}/jobs` | Tất cả job của project |

**GET /jobs/{jobId} — Response:**
```json
{
  "id": "job_123",
  "type": "draft",
  "targetId": "ch_018",
  "provider": "ollama",
  "model": "qwen3:14b",
  "status": "running",
  "step": "style_pass",
  "progress": 74,
  "tokensGenerated": 3210,
  "createdAt": "2026-05-13T07:00:00Z"
}
```

---

## SSE Streaming

SSE được chọn vì phù hợp với luồng một chiều server → client như token stream, tiến trình job và cảnh báo realtime.

### Endpoints

| Endpoint | Mô tả |
|---|---|
| `GET /stream/jobs/{jobId}` | Stream tiến trình và token của một job |
| `GET /stream/projects/{id}/copilot` | Stream copilot output realtime |
| `GET /stream/projects/{id}/alerts` | Stream canon và grounding alerts |

### Event types

| Event | Payload | Mô tả |
|---|---|---|
| `job.started` | `{jobId, type, model}` | Job bắt đầu chạy |
| `job.progress` | `{jobId, step, progress}` | Cập nhật tiến trình |
| `job.token` | `{jobId, delta}` | Token mới từ model |
| `job.warning` | `{jobId, message}` | Cảnh báo không chặn |
| `job.completed` | `{jobId, outputId}` | Job hoàn thành |
| `job.failed` | `{jobId, error}` | Job thất bại |
| `copilot.delta` | `{sessionId, delta}` | Token copilot |
| `canon.alert` | `{type, severity, message}` | Cảnh báo canon |
| `grounding.alert` | `{paragraphId, claimText}` | Claim chưa có nguồn |
| `heartbeat` | `{ts}` | Keep-alive mỗi 15 giây |

**Ví dụ SSE frames:**
```
event: job.progress
data: {"jobId":"job_123","step":"continuity_pass","progress":62}

event: job.token
data: {"jobId":"job_123","delta":"Ánh sáng xuyên qua"}

event: canon.alert
data: {"type":"timeline_conflict","severity":"medium","message":"Nhân vật xuất hiện trước khi rời khỏi địa điểm trước"}

event: heartbeat
data: {"ts":"2026-05-13T07:05:00Z"}
```

---

## Authentication

**Local mode (single-user):**
- Session cookie hoặc static token trong config

**Team mode:**
- OAuth2 / JWT
- Roles: owner, editor, reviewer, viewer
- Permission guards trên mọi mutating endpoint

---

## Error Model

```json
{
  "error": {
    "code": "GROUNDING_UNSUPPORTED_CLAIM",
    "message": "2 claims cần nguồn trước khi publish ở Mức 3",
    "details": {
      "paragraphIds": ["para_14", "para_15"]
    }
  }
}
```

**Error codes:**

| Code | HTTP | Mô tả |
|---|---|---|
| `PROJECT_NOT_FOUND` | 404 | Project không tồn tại |
| `CHAPTER_LOCKED` | 409 | Chapter đã lock, không thể sửa |
| `GROUNDING_UNSUPPORTED_CLAIM` | 422 | Claim chưa có nguồn ở Mức 3 |
| `MODEL_UNAVAILABLE` | 503 | Local model offline, cloud chưa cấu hình |
| `JOB_QUEUE_FULL` | 429 | Hàng đợi generation đầy |
| `CANON_CONFLICT` | 409 | Draft vi phạm canon đã lock |

---

## Versioning & Observability

**Versioning:**
- Semantic versioning: `/api/v1`
- Breaking changes → `/api/v2`
- Non-breaking additions: minor version bump trong changelog

**Observability:**
- Trace ID đính kèm mọi job, copilot session, retrieval request
- Structured logs cho từng pipeline step
- Metrics: token count, latency (ms), provider, cost estimate (USD)
- Dashboard widget kéo từ `/api/v1/metrics/usage`
