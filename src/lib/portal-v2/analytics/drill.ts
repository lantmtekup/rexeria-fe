import { pulseFactsForCampaign } from '@/lib/portal-v2/analytics/facts';
import type {
  JourneyPhaseGroup,
  PulseFactRow,
} from '@/lib/portal-v2/analytics/types';
import { MOCK_JOURNEYS } from '@/lib/portal-v2/journeys/mock';

export const journeyPhasesForSubject = (
  campaignId: string,
  subjectName: string
): JourneyPhaseGroup[] => {
  const rows = pulseFactsForCampaign(campaignId).filter(
    row => row.subjectName === subjectName
  );
  const fork = MOCK_JOURNEYS.find(
    journey => !journey.template && journey.campaign === campaignId
  );

  if (!fork) {
    return rows.length
      ? [
          {
            label: subjectName,
            hint: '',
            kind: 'flow',
            rows,
          },
        ]
      : [];
  }

  const experienceNodes = fork.nodes.filter(
    node => node.kind === 'experience' && node.x
  );
  const matched = new Set<string>();
  const phases: JourneyPhaseGroup[] = experienceNodes.map(node => {
    matched.add(node.x!);
    return {
      label: node.name,
      hint: node.d,
      kind: 'flow',
      rows: rows.filter(row => row.originId === node.x),
    };
  });

  const offRows = rows.filter(row => !matched.has(row.originId));
  if (offRows.length) {
    phases.push({
      label: 'Off the journey',
      hint: 'Not placed on the journey map',
      kind: 'off',
      rows: offRows,
    });
  }

  return phases;
};

export const findFactRow = (
  campaignId: string,
  experienceId: string
): PulseFactRow | null =>
  pulseFactsForCampaign(campaignId).find(
    row => row.experienceId === experienceId
  ) ?? null;

export const campaignsWithData = (campaignIds: string[]): string[] =>
  campaignIds.filter(id => pulseFactsForCampaign(id).length > 0);
