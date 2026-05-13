# AuthorDesk — Product Requirements Document (PRD)
**Version 1.0 | May 2026**

## Executive Summary

AuthorDesk là một Writing Operating System mã nguồn mở, local-first, cloud-optional, hỗ trợ cả sáng tác sáng tạo lẫn tài liệu chuyên môn. Điểm đặc biệt là **Multimode Grounding Dial** cho phép trộn fiction sáng tạo với kiến thức khoa học thực chứng theo từng đoạn văn.

UI hỗ trợ **tiếng Anh và tiếng Việt**, chuyển đổi ngay từ header không cần reload.

---

## 1. Vision

**Tagline:** *"Structure the epic. Ground the real. Write in any language."*

**Triết lý:**
- Structured memory over model memory
- Human-in-the-loop by default
- Creative when free, grounded when needed
- Local-first, cloud-optional
- One workspace for fiction and professional documents
- Multilingual at core

**Mô hình cạnh tranh:**

| Sản phẩm | Điểm mạnh | Điểm yếu |
|---|---|---|
| 302_novel_writing | UI editor, dark mode, multilingual | Không có continuity engine, không có grounding |
| AIStoryWriter | Local Ollama, model routing, hỗ trợ dài | CLI-only, không có story bible, không có UI |
| autonovel | Pipeline end-to-end | Không có human-in-the-loop, không có document mode |
| Sudowrite | UX tốt | Cloud-only, đắt tiền, không có grounding |
| **AuthorDesk** | **Local+Cloud, Canon Memory, Grounding Dial, Copilot 10 agents, UI song ngữ** | — |

---

## 2. Người dùng mục tiêu

### Persona A — Tác giả fiction dài kỳ
- Viết web novel, tiểu thuyết nhiều chương, wuxia, huyền huyễn, sci-fi
- Cần quản lý nhân vật, timeline, cài cắm không bị quên
- Muốn AI hỗ trợ nhưng không muốn AI "viết thay"

### Persona B — Tác giả hard sci-fi / historical fiction
- Cần kết hợp kiến thức khoa học, lịch sử, y khoa vào truyện
- Muốn fact thực chứng nhưng prose vẫn sáng tạo
- Không muốn hallucination trong bản thảo

### Persona C — Chuyên gia tài liệu
- Viết handbook, SOP, training material, whitepaper, policy
- Cần source grounding, citation, terminology consistency
- Cần đổi ngôn ngữ output linh hoạt (Việt/Anh)

### Persona D — Content creator đa thể loại
- Viết cả truyện lẫn tài liệu từ cùng một workspace
- Cần template, style pack theo genre
- Cần UI tiếng Việt

---

## 3. Multimode Grounding System

Người dùng có **Grounding Dial** từ 0–3, áp dụng theo cấp: Project → Chapter → Paragraph.

### Mức 0 — Free Creative
- AI tham chiếu duy nhất Story Bible nội bộ
- Không ràng buộc nguồn ngoài
- Phù hợp: fantasy, wuxia, worldbuilding thuần sáng tạo

### Mức 1 — Assisted
- AI có thể kéo thêm tài liệu từ Source Vault
- Gợi ý nguồn nhưng không bắt buộc gắn citation
- Phù hợp: soft sci-fi, historical romance, thriller

### Mức 2 — Verified
- Mệnh đề khoa học/kỹ thuật/lịch sử phải truy được về Source Vault
- Câu không có nguồn: gắn cờ [unsupported] màu vàng
- Phù hợp: hard sci-fi, medical thriller, legal drama, military fiction

### Mức 3 — Strict Grounded
- Claim chưa có source không được vào bản final
- Fallback: AI viết placeholder [NEEDS SOURCE: mô tả]
- Phù hợp: handbook, whitepaper, training manual, policy

### Ví dụ thực tế trong một tiểu thuyết sci-fi
- Scene hành động, cảm xúc, dialogue → Mức 0
- Mô tả cơ học tên lửa, sinh hoá học, vật lý → Mức 2
- Appendix kỹ thuật cuối sách → Mức 3

**Tác giả tham chiếu:** Andy Weir (The Martian), Michael Crichton (Jurassic Park), Liu Cixin (Three-Body Problem) — đều là "Mức 2" theo mô hình này.

---

## 4. Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                   AuthorDesk UI                     │
│  Next.js 14 · TypeScript · TailwindCSS · Radix UI   │
│  next-intl (EN/VI) · next-themes · Jotai            │
└──────────────────────┬──────────────────────────────┘
                       │ REST API + SSE streaming
┌──────────────────────▼──────────────────────────────┐
│            Orchestrator Service (Python)             │
│  Canon Store │ Source Vault RAG │ Copilot Router     │
│  Generation Pipeline (9 bước)                       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  Model Router                        │
│  Local: Ollama (llama3, qwen, mistral, phi, gemma)  │
│  Cloud: Gemini · OpenAI · Anthropic · OpenRouter    │
└─────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
authordesk/
├── apps/
│   └── web/                  # Next.js 14 UI
├── services/
│   ├── orchestrator/         # Python FastAPI + pipeline
│   ├── retrieval/            # RAG, vector store
│   └── model-router/         # Provider adapter
├── packages/
│   ├── domain/               # Shared schema
│   ├── prompt-kit/           # Prompt templates, genre packs
│   ├── bible-engine/         # Story + Document Bible logic
│   └── i18n/                 # EN/VI language packs
├── storage/
│   ├── sqlite/               # Local single-user
│   └── migrations/           # PostgreSQL migrations
└── docker-compose.yml
```

---

## 5. Canon & Bible System

### Story Bible (Fiction)

| Module | Nội dung | Mục đích |
|---|---|---|
| Character Registry | Ngoại hình, tuổi, giọng nói, thói quen, bí mật, quan hệ | Bắt lỗi inconsistency nhân vật |
| World Rules | Luật thế giới, phép thuật, công nghệ, địa lý | Giữ plausibility nội bộ |
| Timeline Graph | Sự kiện theo ngày/chương/arc | Bắt lỗi timeline |
| Foreshadow Ledger | Chi tiết đã cài → pending / paid-off / dropped | Không bỏ quên setup |
| Relationship Map | Graph nhân vật thay đổi theo arc | Visual tổng quan |
| Voice Sheets | Cách nói, diction, nhịp câu, từ cấm từng nhân vật | Giữ voice consistency |
| Canon Facts | Sự kiện đã lock không thể thay đổi | Bảo vệ continuity |
| Scene Health | Exposition ratio, dialogue ratio, cliffhanger score | Pacing QA |

### Document Bible (Professional)

| Module | Nội dung | Mục đích |
|---|---|---|
| Audience Profile | Người đọc, mức chuyên môn | Định hướng tone, depth |
| Tone Policy | Formal / Technical / Educational / Persuasive | Consistency văn phong |
| Terminology Base | Thuật ngữ chuẩn, cấm, song ngữ | Dùng từ nhất quán |
| Source Vault | Nguồn tham khảo, metadata, excerpt | Nền tảng grounding |
| Claim Policy | Câu nào phải có nguồn, câu nào được synthesis | Kiểm soát hallucination |
| Citation Style | APA / MLA / IEEE / Footnote / Inline | Xuất bản đúng chuẩn |

---

## 6. Copilot System — 10 Agents

| Agent | Nhiệm vụ | Ví dụ prompt |
|---|---|---|
| Idea Copilot | Premise, concept, angle, hook | "Tạo 5 premise cho hard sci-fi về AI consciousness" |
| Character Copilot | Tính cách, mâu thuẫn, cách nói, arc | "Thiết kế voice cho nhân vật phản diện chương 12" |
| Voice Copilot | Diction, register, nhịp câu, style drift | "Rewrite đoạn này theo giọng trầm, tiết chế hơn" |
| Plot Copilot | Arc, subplot, foreshadow, twist, payoff | "Đề xuất 3 plot twist hợp logic từ chapter 18" |
| Pacing Copilot | Tension curve, scene balance | "Phần này quá chậm, gợi ý cách tăng tension" |
| Worldbuilding Copilot | Luật thế giới, tổ chức, địa lý | "Thiết kế hệ thống năng lượng cho sci-fi world" |
| Research Copilot | Kiến thức chuyên ngành, thu nguồn, citation | "Nghiên cứu CRISPR để viết cảnh lab chương 7" |
| Terminology Copilot | Nhất quán thuật ngữ đa ngôn ngữ | "Kiểm tra thuật ngữ nhân sự trong tài liệu này" |
| Continuity Copilot | Timeline, character state, unresolved threads | "Rà soát lỗi continuity từ chapter 1 đến 45" |
| Editor Copilot | Rewrite, compress, expand, polish | "Rút ngắn đoạn này 30% giữ nguyên meaning" |

### Inline Actions (context menu trong editor)

Bôi chọn đoạn văn → menu hiện ra:
- Make vivid → Voice/Editor Copilot
- Ground with sources → Research Copilot Mức 2
- Check scientific plausibility → Verified mode check
- Rewrite preserving facts → Editor Copilot + Evidence lock
- Lock to canon → ghi vào Canon Facts
- Flag as foreshadow → thêm vào Foreshadow Ledger

---

## 7. Generation Pipeline (9 bước)

```
[1] Project Intake       → title, premise, genre, grounding default, language
[2] Bible Setup          → character, world rules, source vault import
[3] Outline Ladder       → novel arc → act arcs → chapter cards (3 tầng)
[4] Chapter Queue        → goal, conflict, reveal, evidence packets
[5] Draft Generation     → load context → scene-by-scene → merge
[6] Continuity Pass      → character state, timeline, foreshadow scan
[7] Style Pass           → repetition, pacing, voice drift, terminology
[8] Human Review Gate    → diff view, approve/reject/rewrite, lock canon
[9] Export & Publish     → DOCX, Markdown, ePub, PDF, Bible bundle
```

### Model Router Logic

| Task | Local default | Cloud khi nào |
|---|---|---|
| Brainstorm, recap, tagging | phi / gemma (fast) | Không cần |
| Outline, chapter draft | llama3 / qwen (quality) | Khi user muốn quality cao |
| Deep research, citation | — | Cloud: Gemini / GPT / Claude |
| Translation, polish | — | Cloud: khi ngôn ngữ ít phổ biến |
| Continuity / style review | Local | Thường đủ |

---

## 8. Language System — 5 Lớp

| Lớp | Ý nghĩa | Ví dụ |
|---|---|---|
| UI Language | Ngôn ngữ giao diện | Tiếng Việt / English |
| Project Language | Ngôn ngữ chính tác phẩm | Tiếng Việt |
| Dialogue Language | Ngôn ngữ hội thoại | Có thể khác project |
| Research Language | Ngôn ngữ nguồn tham khảo | Tiếng Anh (academic) |
| Export Language | Ngôn ngữ bản xuất | Tiếng Anh bản quốc tế |

**UI Language Switch:** Header phải, icon cờ + text VI/EN, chuyển ngay không reload, dùng next-intl.

---

## 9. Dashboard — 6 màn hình + 7 widgets

**Màn hình:**
1. Workspace Home — danh sách project, stats, model status
2. Outline Board — kanban acts → chapters → scene cards
3. Character & World Bible — cards, graph, timeline, foreshadow ledger
4. Draft Review — diff view, approve/reject, evidence panel
5. Generation Console — queue, model usage, cost, retry
6. Export Center — manuscript, bible bundle, cover, translation

**Widgets:**
- Project Progress: planned / drafted / reviewed / locked
- Consistency Alerts: timeline lệch, vật phẩm sai, tuổi đổi
- Style Drift Meter: lệch voice guide bao nhiêu %
- Foreshadow Health: pending threads chưa pay-off
- Source Coverage: % đoạn Mức 2+ đã có anchor source
- Model Router: local vs cloud usage
- Review Inbox: chapters chờ human duyệt

---

## 10. Tech Stack

**Frontend:** Next.js 14 · TypeScript · TailwindCSS v4 · Radix UI · Jotai · TanStack Query · TipTap editor · vis-network · Recharts · next-intl · next-themes · React Hook Form + Zod · Lucide · Satoshi font

**Backend:** Python 3.11+ · FastAPI · SSE streaming · Redis Queue · LangChain / LlamaIndex · ChromaDB (local) / Qdrant (scale) · nomic-embed (local) / OpenAI embeddings

**Storage:** SQLite (local) · PostgreSQL + pgvector (team) · Local filesystem

**Model Providers:** Ollama · Google Gemini · OpenAI · Anthropic Claude · OpenRouter

**DevOps:** docker-compose · Apache-2.0 license · GitHub Actions

---

## 11. Roadmap

### MVP — Local Foundation
- Project intake + story bible
- 3-tầng outline generator
- Chapter draft (Ollama local)
- 3-pane editor (TipTap)
- Grounding Dial Mức 0 và 1
- Manual Review Gate + Lock canon
- UI language switch EN/VI
- Dark/Light mode
- Export Markdown + DOCX
- docker-compose local setup

### V2 — Canon & Grounding
- Multi-agent orchestration
- Continuity + Style passes
- Source Vault + RAG pipeline
- Grounding Mức 2 và 3
- Evidence Panel trong editor
- 10 Copilot agents đầy đủ
- Relationship graph
- Foreshadow Ledger UI
- Document Bible mode
- Cloud provider integration
- Diff-based Draft Review
- Generation Console

### V3 — Scale & Publish
- Collaborative mode (multi-user)
- Cover generation pipeline
- Audio narration (TTS)
- ePub / PDF (Pandoc)
- Translation workflow
- Model benchmark suite
- Series management
- Plugin system
- Mobile companion app

---

## 12. Nguyên tắc UX

1. Manuscript là trung tâm — sidebar và copilot phục vụ editor
2. Context-aware actions — inline action hiểu grounding level, chapter position, voice sheet
3. Lock trước khi tiến — không viết chương tiếp nếu chưa review (có thể tắt)
4. Drift alerts không gián đoạn — hiện nhẹ ở góc, không popup
5. Model status luôn visible — biết đang dùng local hay cloud
6. Grounding Dial màu trực quan — xanh lá / xanh dương / cam / đỏ
7. UI Copilot theo ngôn ngữ đang chọn — prompts, labels, tooltips render bằng UI language
