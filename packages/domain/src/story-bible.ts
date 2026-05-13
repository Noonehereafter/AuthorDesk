export type CharacterStatus = 'active' | 'deceased' | 'unknown' | 'absent';

export interface CharacterProfile {
  id: string;
  projectId: string;
  name: string;
  aliases: string[];

  age?: number;
  appearance: string;
  distinctiveMarks?: string[];

  motivations: string[];
  fears: string[];
  secrets: string[];
  stressResponse?: string;

  arc?: string;
  currentStatus: CharacterStatus;
  introductionChapterId?: string;

  relationshipIds: string[];
  voiceSheetId?: string;

  canonState: {
    lastSeenChapterId?: string;
    lastSeenLocation?: string;
    injuries?: string[];
    knownFacts?: string[];
    [key: string]: unknown;
  };

  createdAt: string;
  updatedAt: string;
}

export type RelationshipType =
  | 'ally' | 'enemy' | 'romantic' | 'family'
  | 'mentor' | 'rival' | 'neutral' | 'unknown';

export interface CharacterRelationship {
  id: string;
  projectId: string;
  characterAId: string;
  characterBId: string;
  type: RelationshipType;
  description: string;
  evolvedInChapterIds: string[];
  currentTension?: number;
}

export type Register = 'formal' | 'neutral' | 'colloquial' | 'poetic' | 'archaic';

export interface VoiceSheet {
  id: string;
  projectId: string;
  entityType: 'character' | 'narrator' | 'document-tone';
  entityId: string;

  register: Register;
  rhythmNotes: string[];
  signaturePhrases: string[];
  forbiddenWords: string[];
  vocabularyLevel: 'simple' | 'average' | 'elevated' | 'technical';
  exampleLines: string[];

  tonePolicy?: 'formal' | 'executive' | 'technical' | 'educational' | 'persuasive';
}

export type WorldRuleCategory =
  | 'magic' | 'technology' | 'politics' | 'geography'
  | 'biology' | 'economics' | 'religion' | 'physics';

export interface WorldRule {
  id: string;
  projectId: string;
  category: WorldRuleCategory;
  title: string;
  description: string;
  exceptions?: string[];
  establishedInChapterId?: string;
  isLocked: boolean;
}

export interface TimelineEvent {
  id: string;
  projectId: string;
  title: string;
  description: string;
  inWorldDate?: string;
  chapterId?: string;
  sceneId?: string;
  involvedCharacterIds: string[];
  type: 'plot' | 'backstory' | 'world-event' | 'character-arc';
}

export type CanonFactScope = 'project' | 'arc' | 'chapter' | 'character';
export type CanonFactStatus = 'locked' | 'deprecated';
export type CanonFactSource = 'human' | 'approved-draft';

export interface CanonFact {
  id: string;
  projectId: string;
  scope: CanonFactScope;
  scopeId: string;
  statement: string;
  status: CanonFactStatus;
  source: CanonFactSource;
  lockedByReviewId?: string;
  createdAt: string;
}

export type ForeshadowStatus = 'pending' | 'paid-off' | 'dropped';

export interface ForeshadowItem {
  id: string;
  projectId: string;
  setupChapterId: string;
  setupSceneId?: string;
  description: string;
  payoffChapterId?: string;
  payoffSceneId?: string;
  status: ForeshadowStatus;
  notes?: string;
  createdAt: string;
}
