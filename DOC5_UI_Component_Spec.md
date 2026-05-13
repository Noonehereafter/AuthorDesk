# AuthorDesk — UI Component Specification (EN/VI)
**Version 1.0 | May 2026**

---

## Tổng quan

AuthorDesk UI là một **writing studio dạng dashboard** với layout 3 pane, dark/light mode, và language toggle EN/VI. Stack: Next.js 14 App Router · TypeScript · TailwindCSS v4 · Radix UI · Jotai · TipTap · next-intl · next-themes · Lucide icons · Satoshi font.

Mọi component đều có hai trạng thái ngôn ngữ (EN/VI) và hai theme (light/dark).

---

## 1. Global Shell

### 1.1 Header

**Layout:** Fixed top, full width, height 56px, z-index 50.

**Vùng trái:**
- SVG logo AuthorDesk (monochrome, 24px)
- Project name (truncate, max 200px, `--text-sm`, click → project settings)

**Vùng giữa:**
- Breadcrumb: Project → Arc → Chapter (chỉ hiện khi trong editor)
- Chapter status badge: `planned` | `drafted` | `reviewed` | `locked`

**Vùng phải (thứ tự từ phải sang trái):**
1. **LanguageToggle** — `🇻🇳 VI` / `🇬🇧 EN`
2. **ThemeToggle** — icon mặt trời / mặt trăng
3. **ModelStatusIndicator** — dot xanh (local online) / cam (cloud) / đỏ (offline)
4. **NotificationBell** — số badge khi có canon alert hoặc review inbox mới
5. **UserAvatar** — dropdown: profile, settings, logout (team mode)

---

### 1.2 Sidebar

**Layout:** Fixed left, width 240px (collapsed: 56px), height 100vh - 56px.

**Navigation items:**

| Icon | Label EN | Label VI | Route |
|---|---|---|---|
| Home | Workspace | Không gian làm việc | `/` |
| LayoutList | Outline Board | Bảng phác thảo | `/outline` |
| Users | Characters & World | Nhân vật & Thế giới | `/bible` |
| GitDiff | Draft Review | Xem xét bản thảo | `/review` |
| Terminal | Generation Console | Bảng điều khiển sinh | `/console` |
| Download | Export Center | Trung tâm xuất bản | `/export` |

**Bottom của sidebar:**
- Project Settings (gear icon)
- Collapse toggle (arrow icon)

**Collapsed state:** Chỉ hiện icon, tooltip khi hover.

---

## 2. Core Editor Layout — Three-Pane Workspace

```
┌──────────┬──────────────────────────────┬────────────────┐
│          │                              │                │
│  LEFT    │       CENTER EDITOR          │  RIGHT PANEL   │
│  PANE    │       (TipTap prose)         │  (Copilot /    │
│  240px   │       flex-1                 │  Evidence /    │
│          │                              │  Canon)        │
│          │                              │  320px         │
└──────────┴──────────────────────────────┴────────────────┘
```

### 2.1 Left Pane — Structure Navigator

**Sections:**
- **Chapter List** — scroll, current chapter highlighted, drag-to-reorder
- **Scene Cards** — expand/collapse per chapter, status dot per scene
- **Quick Jump** — search box lọc chapter theo title hoặc keyword
- **Bible Quick Access** — icon shortcuts đến character cards, timeline, foreshadow ledger

**Chapter item anatomy:**
```
● Ch.18 — Vết nứt cuối trời       [drafted]
  ├ Scene 1 — Cuộc hội ngộ        ✓ locked
  ├ Scene 2 — Lời thú nhận        ✓ locked
  └ Scene 3 — Khoảng tối          ⚠ unsupported claim
```

---

### 2.2 Center Editor — TipTap Prose

**Toolbar (floating, hiện khi bôi chọn):**

| Action | Icon | Mô tả |
|---|---|---|
| Make vivid | Sparkles | Gửi đến Voice/Editor Copilot |
| Ground with sources | BookOpen | Research Copilot Mức 2 |
| Check plausibility | FlaskConical | Verified mode check |
| Rewrite | RefreshCw | Editor Copilot rewrite |
| Lock to canon | Lock | Tạo CanonFact từ selection |
| Flag foreshadow | Bookmark | Thêm vào Foreshadow Ledger |
| Add comment | MessageSquare | Inline comment |

**Inline markers hiện trong prose:**
- `[unsupported]` — màu vàng cam, underline dash
- `[NEEDS SOURCE: ...]` — màu đỏ, background nhạt
- `[UNCERTAIN: ...]` — màu tím nhạt
- Canon conflict highlight — background đỏ nhạt toàn câu
- Evidence anchor — dot xanh nhỏ cuối câu, click → EvidenceDrawer

**Word count bar:** Fixed bottom của center pane.
```
Ch.18 · Scene 2 · 847 words · ~4 min read   [Grounding: Mức 2 🟠]   [Save ✓]
```

---

### 2.3 Right Panel — Tabbed

**Tabs:**

| Tab | Icon | Nội dung |
|---|---|---|
| Copilot | Bot | CopilotPanel — chọn agent, gửi task, nhận output stream |
| Evidence | BookOpen | EvidenceDrawer — source chunks liên quan đoạn đang chọn |
| Canon | Lock | CanonAlertStack — danh sách conflicts và warnings |
| Notes | StickyNote | Scene notes, inline comments |

---

## 3. Critical Components

### 3.1 LanguageToggle

**Vị trí:** Header, vùng phải.

**Hiển thị:**
```
[🇻🇳 VI]   ←→   [🇬🇧 EN]
```

**Behaviour:**
- Click toggle → `setLocale('vi' | 'en')` từ `next-intl`
- Không reload trang — next-intl App Router dùng `useRouter().replace()` với locale prefix
- Locale được lưu trong cookie `NEXT_LOCALE` (không dùng localStorage — sandboxed)
- Tất cả label, tooltip, placeholder, copilot default prompts đổi ngay lập tức
- Prose của tác phẩm KHÔNG thay đổi — chỉ UI đổi ngôn ngữ

**i18n scope:**
- Navigation labels
- Dashboard widgets titles và descriptions
- Button labels, form placeholders, error messages
- Copilot agent names và mô tả
- Grounding level labels
- Onboarding tooltips
- Empty state messages
- Toast notifications

**Implementation:**
```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({ children, params: { locale } }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

```typescript
// components/LanguageToggle.tsx
'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = () => {
    const next = locale === 'vi' ? 'en' : 'vi';
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    router.replace(newPath);
  };

  return (
    <button onClick={toggle} aria-label="Switch language" className="lang-toggle">
      {locale === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
    </button>
  );
}
```

**i18n file structure:**
```
packages/i18n/
├── vi/
│   ├── common.json        ← navigation, buttons, errors
│   ├── editor.json        ← toolbar, markers, word count
│   ├── bible.json         ← character, world, timeline labels
│   ├── copilot.json       ← agent names, descriptions, prompts
│   ├── dashboard.json     ← widget titles, empty states
│   └── grounding.json     ← level names, alert messages
└── en/
    ├── common.json
    ├── editor.json
    ├── bible.json
    ├── copilot.json
    ├── dashboard.json
    └── grounding.json
```

**Ví dụ translation keys:**
```json
// vi/grounding.json
{
  "dial.label": "Mức độ kiểm chứng",
  "level.0.name": "Sáng tạo tự do",
  "level.0.desc": "Chỉ tham chiếu Story Bible nội bộ",
  "level.1.name": "Có hỗ trợ",
  "level.1.desc": "Gợi ý nguồn, không bắt buộc",
  "level.2.name": "Đã xác minh",
  "level.2.desc": "Fact khoa học cần có nguồn",
  "level.3.name": "Kiểm chứng nghiêm ngặt",
  "level.3.desc": "Mọi claim phải có nguồn"
}

// en/grounding.json
{
  "dial.label": "Grounding Level",
  "level.0.name": "Free Creative",
  "level.0.desc": "References Story Bible only",
  "level.1.name": "Assisted",
  "level.1.desc": "Sources suggested, not required",
  "level.2.name": "Verified",
  "level.2.desc": "Scientific facts need sources",
  "level.3.name": "Strict Grounded",
  "level.3.desc": "All claims require sources"
}
```

---

### 3.2 GroundingDial

**Vị trí:** Word count bar (center pane bottom) và Chapter Settings panel.

**Visual:**
```
Grounding  ●━━━━━━━━━━━━━━━━━━━━○  Mức 2 — Đã xác minh 🟠
           0    1    2    3
```

**Màu sắc theo mức:**
- Mức 0: `--color-success` (xanh lá) — Free Creative
- Mức 1: `--color-blue` (xanh dương) — Assisted
- Mức 2: `--color-warning` (cam) — Verified
- Mức 3: `--color-error` (đỏ) — Strict Grounded

**Scope selector:** Dropdown nhỏ bên cạnh dial.
```
[Apply to: Chapter ▾]
  ○ Project default
  ● This chapter
  ○ This scene only
```

**Tooltip khi hover từng mức:** Mô tả ngắn theo ngôn ngữ UI hiện tại.

---

### 3.3 EvidenceDrawer

**Vị trí:** Right Panel tab "Evidence", hoặc slide-in khi click evidence anchor dot trong prose.

**Layout:**
```
┌─ Evidence — Scene 2, Para 4 ──────────────────┐
│ Query used: "CRISPR half-life enzyme serum"   │
│                                               │
│ ┌─ Chunk #1 ──────────────── score: 0.91 ──┐  │
│ │ "...telomerase activity peaks at 6h..."   │  │
│ │ Nature Reviews Genetics 2023, p.14        │  │
│ │ [Use in draft] [Add to packet] [Dismiss]  │  │
│ └───────────────────────────────────────────┘  │
│                                               │
│ ┌─ Chunk #2 ──────────────── score: 0.87 ──┐  │
│ │ "...enzyme concentration decreases..."    │  │
│ │ Cell Biology Letters Vol.12, p.88         │  │
│ │ [Use in draft] [Add to packet] [Dismiss]  │  │
│ └───────────────────────────────────────────┘  │
│                                               │
│ [Run new query...]                            │
└───────────────────────────────────────────────┘
```

**Actions:**
- **Use in draft:** Chèn citation marker vào vị trí cursor trong prose
- **Add to packet:** Thêm chunk vào EvidencePacket của chapter
- **Dismiss:** Ẩn chunk này khỏi kết quả lần này
- **Run new query:** Mở query input, gửi retrieval request mới

---

### 3.4 CanonAlertStack

**Vị trí:** Right Panel tab "Canon" và floating toast nhỏ góc dưới phải.

**Alert levels:**

| Severity | Màu | Icon | Ví dụ |
|---|---|---|---|
| `critical` | Đỏ | AlertTriangle | Nhân vật xuất hiện sau khi đã chết |
| `warning` | Cam | AlertCircle | Timeline lệch 2 ngày so với chapter trước |
| `note` | Xanh dương | Info | Foreshadow chưa pay-off đến chương này |

**Alert item anatomy:**
```
⚠ [warning] Timeline conflict
  Nhân vật rời Hà Nội ngày 15/3 (Ch.14, locked)
  nhưng xuất hiện tại Hà Nội ngày 14/3 trong scene này.
  → Gợi ý: đổi ngày scene thành 16/3 hoặc sau.
  [Fix now] [Ignore] [View canon fact]
```

**Toast (non-blocking):**
- Hiện góc dưới phải, auto-dismiss sau 8 giây
- Click → mở Right Panel tab Canon
- Không hiện quá 3 toast cùng lúc

---

### 3.5 CopilotPanel

**Vị trí:** Right Panel tab "Copilot".

**Layout:**
```
┌─ Copilot ─────────────────────────────────────┐
│  Agent: [Continuity Copilot ▾]                │
│                                               │
│  Context: Chapter 18, Scene 2                 │
│  Grounding: Mức 2 🟠                          │
│                                               │
│  ┌─ Task ──────────────────────────────────┐  │
│  │ Rà soát lỗi continuity từ Ch.1–Ch.18    │  │
│  │                                         │  │
│  └─────────────────────────────────────── ─┘  │
│                                               │
│  [Run ▶]  [Clear]  [Copy output]              │
│                                               │
│  ─── Output ────────────────────────────────  │
│  ⚠ Critical: Nhân vật Minh dùng mắt trái...  │
│  ◌ Note: Foreshadow ft_007 chưa pay-off...   │
│  ✓ No timeline conflicts detected.           │
│  (streaming... █)                            │
└───────────────────────────────────────────────┘
```

**Agent dropdown (theo ngôn ngữ UI):**

| EN | VI |
|---|---|
| Idea Copilot | Copilot Ý tưởng |
| Character Copilot | Copilot Nhân vật |
| Voice Copilot | Copilot Giọng văn |
| Plot Copilot | Copilot Cốt truyện |
| Pacing Copilot | Copilot Nhịp độ |
| Worldbuilding Copilot | Copilot Thế giới |
| Research Copilot | Copilot Nghiên cứu |
| Terminology Copilot | Copilot Thuật ngữ |
| Continuity Copilot | Copilot Liên tục tính |
| Editor Copilot | Copilot Biên tập |

**Streaming:** Output render từng token qua SSE `copilot.delta` event. Có thể cancel mid-stream.

---

## 4. Dashboard Pages

### 4.1 Workspace Home (`/`)

**Layout:** 2-column grid, left 2/3 + right 1/3.

**Left column:**
- Recent Projects — card grid, thumbnail, progress bar, last modified
- Continue Writing — card highlight chapter đang dang dở, CTA "Open editor"

**Right column:**
- Model Status widget — local Ollama (up/down), cloud providers (configured/not)
- Review Inbox widget — số chapter cần duyệt, list 3 items mới nhất
- Quick actions: New Project, Import Source, Open Console

**Empty state (chưa có project):**
```
📖
Chưa có dự án nào.
Bắt đầu bằng cách tạo project đầu tiên của bạn.
[Tạo project mới]
```

---

### 4.2 Outline Board (`/outline`)

**Layout:** Kanban 3 cột: Acts → Chapters → Scenes.

**Act card:**
- Title, arc summary, chapter count, progress bar
- Collapse/expand

**Chapter card:**
- Number + title
- Status badge (planned / drafted / reviewed / locked)
- Goal snippet (1 dòng)
- Word count estimate
- Drag handle (reorder)
- Quick actions: Open editor, Generate draft, View bible dependencies

**Scene card (expand từ chapter):**
- Intent, scene health dots (dialogue / exposition / cliffhanger)
- Lock icon nếu đã locked

**Toolbar:**
- Add Act / Add Chapter / Add Scene
- Filter by status
- Bulk generate: chọn nhiều chapter → generate queue

---

### 4.3 Character & World Bible (`/bible`)

**Tabs:** Characters · World Rules · Timeline · Foreshadow Ledger · Canon Facts

**Characters tab:**
- Card grid, mỗi card: avatar placeholder, name, status badge, arc snippet
- Click → Character Detail sheet (slide-in, không navigate)
- Character Detail: tất cả fields của CharacterProfile + Voice Sheet + relationship list

**Relationship Map:**
- vis-network graph, nodes là characters, edges là relationships
- Màu edge theo RelationshipType
- Click edge → hiện description, evolution chapters

**Timeline tab:**
- Gantt-style hoặc vertical timeline
- Filter by character, event type
- Highlight conflicts (2 events mâu thuẫn cùng thời điểm)

**Foreshadow Ledger tab:**
- Table: description | setup chapter | status | payoff chapter
- Filter: pending / paid-off / dropped
- Badge đỏ khi có pending quá nhiều chapter không pay-off

---

### 4.4 Draft Review (`/review`)

**Layout:** 2 pane — left: chapter list, right: diff view.

**Diff view:**
- Side-by-side: AI draft (trái) vs. approved text (phải)
- Highlight: added (xanh lá), removed (đỏ), unchanged (xám)
- Inline comments hiện bên cạnh diff lines

**Action bar (fixed bottom):**
```
[← Prev chapter]  [Approve ✓]  [Reject ✗]  [Rewrite brief →]  [Next chapter →]
```

**Canon Deltas panel (expandable):**
- List CanonFact sẽ được lock nếu approve chapter này
- Reviewer có thể bỏ check từng fact trước khi approve

---

### 4.5 Generation Console (`/console`)

**Layout:** Full width, 3 section dọc.

**Section 1 — Job Queue:**
- Table: Job ID | Type | Target | Status | Model | Progress | Duration | Actions
- Row expand → step detail log
- Bulk cancel / retry

**Section 2 — Model Router Status:**
- Local providers: Ollama models loaded, VRAM usage bar, temperature
- Cloud providers: API key configured (✓/✗), latency last request
- Cost estimate today (USD)

**Section 3 — Recent Completions:**
- Last 20 completed jobs, chapter output link, token count, duration

---

### 4.6 Export Center (`/export`)

**Layout:** 2-column: config left, preview right.

**Config panel:**
- Chapter selection: All / Range / Custom selection
- Format: Markdown · DOCX · PDF · ePub · Bible Bundle
- Options: Include annotations, Include bible, Override export language
- Cover: upload image hoặc generate với AI

**Preview panel:**
- Manuscript preview (first 500 words)
- Estimated file size
- Export language indicator

**Action:** [Export now] → tạo ExportJob → redirect đến Console để theo dõi

---

## 5. Accessibility

- Mọi icon button phải có `aria-label` bằng ngôn ngữ UI hiện tại
- Focus trap trong modals và sheet overlays
- Keyboard navigation: Tab/Shift+Tab cho tất cả interactive elements
- `role="status"` cho streaming output area
- Grounding level thay đổi phải announce qua `aria-live="polite"`
- Color không phải indicator duy nhất — luôn kèm icon hoặc text label
- Contrast tối thiểu WCAG AA cho mọi text-on-surface combination
- `prefers-reduced-motion`: disable transitions, dùng instant state changes

---

## 6. Responsive Breakpoints

| Breakpoint | Layout thay đổi |
|---|---|
| < 768px (mobile) | Sidebar collapse thành bottom tab bar; Right panel thành bottom sheet; Editor full width |
| 768–1024px (tablet) | Sidebar icon-only (56px); Right panel toggle-able |
| 1024–1280px (laptop) | 3 pane đầy đủ, sidebar 200px |
| > 1280px (desktop) | 3 pane đầy đủ, sidebar 240px, right panel 320px |
