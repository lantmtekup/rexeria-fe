import { insItems } from '@/lib/portal-v2/analytics/insights';
import type { ExperienceInsightItem } from '@/lib/portal-v2/analytics/types';
import { MOCK_CAMPAIGN_EXPERIENCES } from '@/lib/portal-v2/campaigns/mock';
import {
  OBJECTIVE_LABEL,
  TEMPLATE_OBJECTIVE,
} from '@/lib/portal-v2/intelligence/constants';
import type { ExperienceObjective } from '@/lib/portal-v2/experiences/types';
import type { IntelStandard } from '@/lib/portal-v2/intelligence/types';

export type StandardsMap = Partial<Record<ExperienceObjective, string>>;

export const readStandard = (
  standards: StandardsMap,
  objective: ExperienceObjective
): IntelStandard | null => {
  const experienceId = standards[objective];
  if (!experienceId) return null;

  const experience =
    MOCK_CAMPAIGN_EXPERIENCES.find(item => item.id === experienceId) ??
    MOCK_CAMPAIGN_EXPERIENCES.find(item => item.origin === experienceId);

  const insight = (insItems('experiences') as ExperienceInsightItem[]).find(
    item => item.id === experienceId
  );

  if (!experience || !insight || insight.rollup.lift == null) return null;

  return {
    objective,
    objectiveName: OBJECTIVE_LABEL[objective],
    experienceId,
    name: experience.name.split(' — ')[0] ?? experience.name,
    lift: insight.rollup.lift,
  };
};

export const readAllStandards = (standards: StandardsMap): IntelStandard[] =>
  (Object.keys(standards) as ExperienceObjective[])
    .map(objective => readStandard(standards, objective))
    .filter((item): item is IntelStandard => item !== null);

export const gapToStandard = (
  standards: StandardsMap,
  objective: ExperienceObjective,
  lift: number | null | undefined
): number | null => {
  const bar = readStandard(standards, objective);
  if (!bar || lift == null) return null;
  return Math.round((lift - bar.lift) * 100);
};

export const promoteStandard = (
  standards: StandardsMap,
  experienceId: string,
  objective: ExperienceObjective
): StandardsMap => ({
  ...standards,
  [objective]: experienceId,
});

export const retireStandard = (
  standards: StandardsMap,
  objective: ExperienceObjective
): StandardsMap => {
  const next = { ...standards };
  delete next[objective];
  return next;
};

export const objectiveForExperience = (
  experienceId: string
): ExperienceObjective | undefined => TEMPLATE_OBJECTIVE[experienceId];
