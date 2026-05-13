export type SourceType = 'pdf' | 'web' | 'markdown' | 'txt' | 'docx' | 'note';
export type IngestionStatus = 'pending' | 'indexed' | 'failed';

export interface SourceDocument {
  id: string;
  projectId: string;
  type: SourceType;
  title: string;
  url?: string;
  filePath?: string;
  language?: string;
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

export interface SourceChunk {
  id: string;
  sourceDocumentId: string;
  chunkIndex: number;
  text: string;
  embeddingId?: string;
  pageRef?: string;
  tokenCount: number;
  language?: string;
}

export interface EvidencePacket {
  id: string;
  projectId: string;
  query: string;
  chunkIds: string[];
  claimSummary: string[];
  confidence: number;
  createdAt: string;
}

export type SupportStatus = 'supported' | 'partial' | 'unsupported';

export interface ClaimAnnotation {
  id: string;
  paragraphId: string;
  claimText: string;
  supportStatus: SupportStatus;
  evidencePacketIds: string[];
  suggestedQuery?: string;
  flaggedAt: string;
}
