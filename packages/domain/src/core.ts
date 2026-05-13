export type ProjectType = 'fiction' | 'document' | 'hybrid';
export type GroundingLevel = 0 | 1 | 2 | 3;
export type UILanguage = 'en' | 'vi';
export type ProjectStatus = 'active' | 'archived';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;

  // Language system
  uiLanguage: UILanguage;
  projectLanguage: string;
  dialogueLanguage?: string;
  researchLanguage?: string;
  exportLanguage?: string;

  groundingDefault: GroundingLevel;
  genre: string[];
  targetLength?: { unit: 'chapters' | 'words' | 'pages'; value: number };
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export type ChapterStatus = 'planned' | 'drafted' | 'reviewed' | 'locked';

export interface Chapter {
  id: string;
  projectId: string;
  number?: number;
  title: string;
  arcId?: string;
  volumeId?: string;

  goal: string;
  conflict: string;
  reveal?: string;

  summary: string;
  groundingLevel: GroundingLevel;
  status: ChapterStatus;

  wordCount: number;
  sceneIds: string[];
  continuityDepIds: string[];
  evidencePacketIds: string[];
  lockedCanonDeltaIds: string[];

  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  chapterId: string;
  order: number;

  intent: string;
  conflict: string;
  resolution?: string;

  povCharacterId?: string;
  location?: string;
  timeRef?: string;

  continuityDeps: string[];
  evidencePacketIds: string[];

  prose: string;
  lockedAt?: string;

  wordCount: number;
  dialogueRatio?: number;
  expositionRatio?: number;
}
