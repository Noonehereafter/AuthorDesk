export type JobType =
  | 'outline' | 'draft' | 'continuity-pass' | 'style-pass'
  | 'review' | 'translation' | 'grounding-check' | 'export';

export type JobStatus =
  | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export type ModelProvider =
  | 'ollama' | 'gemini' | 'openai' | 'anthropic' | 'openrouter';

export interface GenerationJob {
  id: string;
  projectId: string;
  type: JobType;
  targetId: string;
  targetType: 'project' | 'chapter' | 'scene';

  provider: ModelProvider;
  model: string;
  status: JobStatus;
  step: string;

  progress: number;
  tokensGenerated?: number;
  durationMs?: number;
  costEstimateUSD?: number;

  error?: string;
  outputId?: string;

  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type ReviewAction = 'approve' | 'reject' | 'rewrite' | 'partial-accept';

export interface ReviewDecision {
  id: string;
  targetType: 'chapter' | 'scene' | 'document-section';
  targetId: string;
  action: ReviewAction;
  comment?: string;
  canonDeltasToLock?: string[];
  reviewerId: string;
  createdAt: string;
}

export type ExportFormat = 'markdown' | 'docx' | 'pdf' | 'epub' | 'txt' | 'bible-bundle';

export interface ExportJob {
  id: string;
  projectId: string;
  format: ExportFormat;
  chapterIds?: string[];
  includeAnnotations: boolean;
  includeBible: boolean;
  language?: string;
  status: JobStatus;
  outputPath?: string;
  createdAt: string;
}
