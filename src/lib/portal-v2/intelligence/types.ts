import type { InsightType } from '@/lib/portal-v2/analytics/types';
import type { ExperienceObjective } from '@/lib/portal-v2/experiences/types';

export type IntelAction = 'scale' | 'fix' | 'instrument' | 'refresh';

export type IntelFocus = IntelAction | 'all';

export type IntelViewState = {
  focus: IntelFocus;
};

export type IntelFindingLink = {
  type: InsightType | 'experiences';
  id: string;
  labelKey:
    'seeRecord' | 'seeTrackRecord' | 'seeLeak' | 'seeCoverage' | 'seeTrend';
};

export type IntelFinding = {
  act: IntelAction;
  title: string;
  what: string;
  why: string;
  impact: number;
  conf: 'high' | 'moderate';
  link: IntelFindingLink;
  experienceId?: string;
  objective?: ExperienceObjective;
  lift?: number | null;
};

export type IntelStandard = {
  objective: ExperienceObjective;
  objectiveName: string;
  experienceId: string;
  name: string;
  lift: number;
};

export type TrustIssue = {
  severity: 'warn' | 'ok';
  title: string;
  detail: string;
  fix: string;
};

export type IntelTrust = {
  score: number;
  coverage: number;
  consent: number;
  freshness: string;
  schema: string;
  issues: TrustIssue[];
};
