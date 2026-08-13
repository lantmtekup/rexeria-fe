import { MOCK_CAMPAIGN_EXPERIENCES } from '@/lib/portal-v2/campaigns/mock';
import type { CampaignExperience } from '@/lib/portal-v2/campaigns/types';
import { seedBlocks } from '@/lib/portal-v2/analytics/seed';
import type { PulseFactRow } from '@/lib/portal-v2/analytics/types';
import { MOCK_FACT_ROWS } from '@/lib/portal-v2/settings/mock';

let cachedFacts: PulseFactRow[] | null = null;

const experienceById = new Map<string, CampaignExperience>(
  MOCK_CAMPAIGN_EXPERIENCES.map(item => [item.id, item])
);

const coverageFor = (experienceId: string, originId: string): number => {
  const found =
    experienceById.get(experienceId) ?? experienceById.get(originId);
  return found?.coverage ?? 0.35;
};

const liftOf = (cvr: number, controlCvr: number | null): number => {
  if (!controlCvr) return 0;
  return controlCvr ? cvr / controlCvr - 1 : 0;
};

export const buildPulseFacts = (): PulseFactRow[] => {
  if (cachedFacts) return cachedFacts;

  cachedFacts = MOCK_FACT_ROWS.map(row => {
    const sessions = row.sessions;
    const converted = row.converted;
    const cvr = sessions ? converted / sessions : 0;
    const originId = row.origin;
    const coveragePct = coverageFor(row.experience, originId);
    const subjectName = row.subject?.ref ?? row.experienceName;

    return {
      campaignId: row.campaign,
      campaignName: row.campaignName,
      channel: row.channel,
      subjectKind: row.subject?.kind ?? 'topic',
      subjectName,
      experienceId: row.experience,
      originId,
      experienceName: row.experienceName,
      sessions,
      engaged: row.engaged,
      explored: row.explored,
      convinced: row.convinced,
      converted,
      leads: row.leads,
      revenue: row.revenue,
      spend: row.spend,
      controlCvr: row.controlCvr,
      cvr,
      lift: liftOf(cvr, row.controlCvr),
      aov: converted ? row.revenue / converted : 0,
      coveragePct,
      blocks: seedBlocks(row.experience, sessions, coveragePct),
    };
  });

  return cachedFacts;
};

export const pulseFactsForCampaign = (campaignId: string): PulseFactRow[] =>
  buildPulseFacts().filter(row => row.campaignId === campaignId);

export const campaignsWithPulseData = (): string[] => [
  ...new Set(buildPulseFacts().map(row => row.campaignId)),
];

export const experienceRows = (originOrCopyId: string): PulseFactRow[] =>
  buildPulseFacts().filter(
    row =>
      row.experienceId === originOrCopyId || row.originId === originOrCopyId
  );

export const trackingCoverage = (
  rows: PulseFactRow[]
): { pct: number; trackedComponents: number; totalComponents: number } => {
  const sessions = rows.reduce((total, row) => total + row.sessions, 0);
  if (!sessions) {
    return { pct: 0, trackedComponents: 0, totalComponents: 0 };
  }

  let weighted = 0;
  let tracked = 0;
  let total = 0;

  for (const row of rows) {
    for (const block of row.blocks) {
      total += block.comps.length || 1;
      tracked += block.comps.length;
    }
    weighted += row.coveragePct * row.sessions;
  }

  return {
    pct: Math.round(weighted / sessions),
    trackedComponents: tracked,
    totalComponents: total,
  };
};

export const signalCoverageForExperience = (
  experienceId: string
): { pct: number; comps: number; compsTracked: number } => {
  const found = experienceById.get(experienceId);
  const pct = Math.round((found?.coverage ?? 0.35) * 100);
  const blocks = seedBlocks(experienceId, 1000, found?.coverage ?? 0.35);
  const compsTracked = blocks.reduce(
    (total, block) => total + block.comps.length,
    0
  );
  return { pct, comps: blocks.length * 2, compsTracked };
};
