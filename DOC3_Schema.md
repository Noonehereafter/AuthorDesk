# AuthorDesk — Domain Schema (TypeScript Interfaces)
**Version 1.0 | May 2026**

---

## Tổng quan

Schema được thiết kế theo nguyên lý **structured memory over model memory** — tách biệt creative memory (Story Bible), factual grounding (Source Vault), và generation workflow để hệ thống không phụ thuộc vào trí nhớ ngẫu hứng của model.

---

## 1. Core Entities

### Project

```typescript
type ProjectType = 'fiction' | 'document' | 'hybrid';
type GroundingLevel = 0 | 1 | 2 | 3;
type UILanguage = 'en' | 'vi';
type ProjectStatus = 'active' | 'archived';

interface Project {
  id: string;
  name: string;
  type: ProjectType;

  // Language system — 5 lớp độc lập
  uiLanguage: UILanguage;
  projectLanguage: string;       // BCP 47: 'vi', 'en', 'zh-CN'
  dialogueLanguage?: string;     // Nếu khác projectLanguage
  researchLanguage?: string;     // Ngôn ngữ nguồn tham khảo
  exportLanguage?: string;       // Ngôn ngữ bản xuất

  groundingDefault: GroundingLevel;
  genre: string[];
  targetLength?: { unit: 'chapters' | 'words' | 'pages'; value: number };
  status: ProjectStatus;
  createdAt: string;             // ISO 8601
  updatedAt: string;
}
```

### Chapter

```typescript
type ChapterStatus = 'planned' | 'drafted' | 'reviewed' | 'locked';

interface Chapter {
  id: string;
  projectId: string;
  number?: number;
  title: string;
  arcId?: string;
  volumeId?: string;

  // Intent
  goal: string;                  // Mục tiêu chapter này đạt được
  conflict: string;              // Xung đột trung tâm
  reveal?: string;               // Reveal hoặc payoff nếu có

  summary: string;               // Tóm tắt sau khi draft xong
  groundingLevel: GroundingLevel;
  status: ChapterStatus;

  wordCount: number;
  sceneIds: string[];
  continuityDepIds: string[];    // Canon facts chapter này phụ thuộc
  evidencePacketIds: string[];   // Evidence packets liên quan (Mức 1+)
  lockedCanonDeltaIds: string[]; // Canon facts được lock sau review

  createdAt: string;
  updatedAt: string;
}
```

### Scene

```typescript
interface Scene {
  id: string;
  chapterId: string;
  order: number;

  intent: string;                // Scene này làm gì trong chapter
  conflict: string;
  resolution?: string;

  povCharacterId?: string;
  location?: string;
  timeRef?: string;              // Tham chiếu timeline

  continuityDeps: string[];      // IDs của CanonFact liên quan
  evidencePacketIds: string[];   // Evidence packets (Mức 2+)

  prose: string;                 // Bản thảo hiện tại
  lockedAt?: string;             // null nếu chưa lock

  // Health metrics
  wordCount: number;
  dialogueRatio?: number;        // 0.0 – 1.0
  expositionRatio?: number;
}
```

---

## 2. Story Bible Entities

### CharacterProfile

```typescript
type CharacterStatus = 'active' | 'deceased' | 'unknown' | 'absent';

interface CharacterProfile {
  id: string;
  projectId: string;
  name: string;
  aliases: string[];

  // Ngoại hình
  age?: number;
  appearance: string;
  distinctiveMarks?: string[];   // Sẹo, tattoo, đặc điểm nhận dạng

  // Tâm lý
  motivations: string[];
  fears: string[];
  secrets: string[];
  stressResponse?: string;       // Phản ứng khi stress

  // Narrative
  arc?: string;                  // Character arc tổng
  currentStatus: CharacterStatus;
  introductionChapterId?: string;

  // Quan hệ
  relationshipIds: string[];

  // Voice
  voiceSheetId?: string;

  // Canon state — snapshot trạng thái cuối cùng đã lock
  canonState: {
    lastSeenChapterId?: string;
    lastSeenLocation?: string;
    injuries?: string[];
    knownFacts?: string[];        // Những gì nhân vật này biết
    [key: string]: unknown;
  };

  createdAt: string;
  updatedAt: string;
}
```

### CharacterRelationship

```typescript
type RelationshipType =
  | 'ally' | 'enemy' | 'romantic' | 'family'
  | 'mentor' | 'rival' | 'neutral' | 'unknown';

interface CharacterRelationship {
  id: string;
  projectId: string;
  characterAId: string;
  characterBId: string;
  type: RelationshipType;
  description: string;
  evolvedInChapterIds: string[]; // Chapters mà quan hệ thay đổi
  currentTension?: number;       // 0 (hoà bình) → 10 (xung đột tột độ)
}
```

### VoiceSheet

```typescript
type Register = 'formal' | 'neutral' | 'colloquial' | 'poetic' | 'archaic';

interface VoiceSheet {
  id: string;
  projectId: string;
  entityType: 'character' | 'narrator' | 'document-tone';
  entityId: string;              // CharacterProfile.id hoặc Project.id

  register: Register;
  rhythmNotes: string[];         // Ví dụ: "Câu ngắn khi căng thẳng"
  signaturePhrases: string[];    // Cụm từ đặc trưng
  forbiddenWords: string[];      // Từ nhân vật này không bao giờ dùng
  vocabularyLevel: 'simple' | 'average' | 'elevated' | 'technical';
  exampleLines: string[];        // 3–5 câu mẫu

  // Dùng cho Document mode
  tonePolicy?: 'formal' | 'executive' | 'technical' | 'educational' | 'persuasive';
}
```

### WorldRule

```typescript
type WorldRuleCategory =
  | 'magic' | 'technology' | 'politics' | 'geography'
  | 'biology' | 'economics' | 'religion' | 'physics';

interface WorldRule {
  id: string;
  projectId: string;
  category: WorldRuleCategory;
  title: string;
  description: string;
  exceptions?: string[];
  establishedInChapterId?: string;
  isLocked: boolean;
}
```

### TimelineEvent

```typescript
interface TimelineEvent {
  id: string;
  projectId: string;
  title: string;
  description: string;
  inWorldDate?: string;          // Ngày trong thế giới truyện
  chapterId?: string;
  sceneId?: string;
  involvedCharacterIds: string[];
  type: 'plot' | 'backstory' | 'world-event' | 'character-arc';
}
```

### CanonFact

```typescript
type CanonFactScope = 'project' | 'arc' | 'chapter' | 'character';
type CanonFactStatus = 'locked' | 'deprecated';
type CanonFactSource = 'human' | 'approved-draft';

interface CanonFact {
  id: string;
  projectId: string;
  scope: CanonFactScope;
  scopeId: string;               // ID của arc, chapter, hoặc character
  statement: string;             // Phát biểu ngắn gọn, rõ ràng
  status: CanonFactStatus;
  source: CanonFactSource;
  lockedByReviewId?: string;     // ReviewDecision.id
  createdAt: string;
}
```

### ForeshadowItem

```typescript
type ForeshadowStatus = 'pending' | 'paid-off' | 'dropped';

interface ForeshadowItem {
  id: string;
  projectId: string;
  setupChapterId: string;
  setupSceneId?: string;
  description: string;           // Mô tả chi tiết đã cài
  payoffChapterId?: string;
  payoffSceneId?: string;
  status: ForeshadowStatus;
  notes?: string;
  createdAt: string;
}
```

---

## 3. Document Bible Entities

### DocumentBible

```typescript
type TonePolicy =
  | 'formal' | 'executive' | 'technical'
  | 'educational' | 'persuasive' | 'conversational';

type CitationStyle = 'APA' | 'MLA' | 'IEEE' | 'footnote' | 'inline-link' | 'none';

interface DocumentBible {
  id: string;
  projectId: string;

  audienceProfile: {
    description: string;
    expertiseLevel: 'beginner' | 'intermediate' | 'expert';
    industry?: string;
  };

  tonePolicy: TonePolicy;
  citationStyle: CitationStyle;

  terminologyBase: {
    approved: Array<{ term: string; definition: string; translation?: string }>;
    forbidden: string[];
  };

  claimPolicy: {
    requireSourceForFactual: boolean;
    allowSynthesisWithoutCitation: boolean;
    strictModeThreshold: GroundingLevel;
  };
}
```

---

## 4. Grounding Entities

### SourceDocument

```typescript
type SourceType = 'pdf' | 'web' | 'markdown' | 'txt' | 'docx' | 'note';
type IngestionStatus = 'pending' | 'indexed' | 'failed';

interface SourceDocument {
  id: string;
  projectId: string;
  type: SourceType;
  title: string;
  url?: string;
  filePath?: string;
  language?: string;             // BCP 47
  authors?: string[];
  publishedAt?: string;
  citationMeta?: {
    journal?: string;
    doi?: string;
    isbn?: string;
    publisher?: string;
  };
  ingestionStatus: IngestionStatus;
  chunkCount?: number;
  createdAt: string;
}
```

### SourceChunk

```typescript
interface SourceChunk {
  id: string;
  sourceDocumentId: string;
  chunkIndex: number;
  text: string;
  embeddingId?: string;          // ID trong vector store
  pageRef?: string;              // "p.14", "§3.2"
  tokenCount: number;
  language?: string;
}
```

### EvidencePacket

```typescript
interface EvidencePacket {
  id: string;
  projectId: string;
  query: string;                 // Query đã dùng để retrieve
  chunkIds: string[];
  claimSummary: string[];        // Danh sách fact được rút ra
  confidence: number;            // 0.0 – 1.0
  createdAt: string;
}
```

### ClaimAnnotation

```typescript
type SupportStatus = 'supported' | 'partial' | 'unsupported';

interface ClaimAnnotation {
  id: string;
  paragraphId: string;
  claimText: string;
  supportStatus: SupportStatus;
  evidencePacketIds: string[];
  suggestedQuery?: string;       // Gợi ý query để tìm thêm nguồn
  flaggedAt: string;
}
```

---

## 5. Workflow Entities

### GenerationJob

```typescript
type JobType =
  | 'outline' | 'draft' | 'continuity-pass' | 'style-pass'
  | 'review' | 'translation' | 'grounding-check' | 'export';

type JobStatus =
  | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

type ModelProvider =
  | 'ollama' | 'gemini' | 'openai' | 'anthropic' | 'openrouter';

interface GenerationJob {
  id: string;
  projectId: string;
  type: JobType;
  targetId: string;              // Chapter.id, Scene.id, hoặc Project.id
  targetType: 'project' | 'chapter' | 'scene';

  provider: ModelProvider;
  model: string;                 // Ví dụ: "qwen3:14b", "gemini-2.5-pro"
  status: JobStatus;
  step: string;                  // Bước đang chạy

  progress: number;              // 0 – 100
  tokensGenerated?: number;
  durationMs?: number;
  costEstimateUSD?: number;

  error?: string;
  outputId?: string;             // ID của output artifact

  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}
```

### ReviewDecision

```typescript
type ReviewAction = 'approve' | 'reject' | 'rewrite' | 'partial-accept';

interface ReviewDecision {
  id: string;
  targetType: 'chapter' | 'scene' | 'document-section';
  targetId: string;
  action: ReviewAction;
  comment?: string;
  canonDeltasToLock?: string[];  // CanonFact.ids sẽ lock khi approve
  reviewerId: string;
  createdAt: string;
}
```

### ExportJob

```typescript
type ExportFormat = 'markdown' | 'docx' | 'pdf' | 'epub' | 'txt' | 'bible-bundle';

interface ExportJob {
  id: string;
  projectId: string;
  format: ExportFormat;
  chapterIds?: string[];         // null = toàn bộ project
  includeAnnotations: boolean;   // Bao gồm evidence annotations không
  includeBible: boolean;
  language?: string;             // Override export language
  status: JobStatus;
  outputPath?: string;
  createdAt: string;
}
```

---

## 6. Storage Strategy

| Layer | Engine | Use case |
|---|---|---|
| Relational | SQLite (local) | Single-user, tất cả entities |
| Relational | PostgreSQL | Team mode, nhiều project, concurrent |
| Vector | ChromaDB (local) | Embedding search cho Source Vault |
| Vector | Qdrant | Scale-up khi source vault lớn |
| Embeddings | nomic-embed-text (Ollama) | Local, không cần API |
| Embeddings | OpenAI text-embedding-3-small | Cloud fallback |
| Files | Local filesystem | PDFs, exports, cover assets |

### Index chiến lược

- `projects(status, updatedAt)` — dashboard listing
- `chapters(projectId, status, number)` — chapter queue
- `canon_facts(projectId, scope, scopeId, status)` — continuity check
- `foreshadow_items(projectId, status)` — pending thread alerts
- `generation_jobs(projectId, status, createdAt)` — console queue
- `source_chunks(sourceDocumentId, chunkIndex)` — retrieval join

### Canon snapshot

Khi một chapter được lock, hệ thống tạo một **canon snapshot** — frozen JSON document chứa:
- Tất cả CanonFact.locked tính đến chapter đó
- Character state của mọi nhân vật xuất hiện
- Timeline events đã confirmed
- Foreshadow items đã pay-off

Snapshot này được nạp lại khi bắt đầu viết chapter tiếp theo, thay vì phụ thuộc vào context window của model.
