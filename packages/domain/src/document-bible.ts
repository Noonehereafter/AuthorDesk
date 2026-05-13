import { GroundingLevel } from './core';

export type TonePolicy =
  | 'formal' | 'executive' | 'technical'
  | 'educational' | 'persuasive' | 'conversational';

export type CitationStyle = 'APA' | 'MLA' | 'IEEE' | 'footnote' | 'inline-link' | 'none';

export interface DocumentBible {
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
