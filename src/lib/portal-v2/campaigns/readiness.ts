import { ITEM_STATUS } from '@/lib/portal-v2/campaigns/constants';
import { routeCoverage } from '@/lib/portal-v2/campaigns/journeyLink';
import type {
  CampaignExperience,
  CampaignGap,
  CampaignReadiness,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import type { Journey } from '@/lib/portal-v2/journeys/types';

/**
 * The plan gate (prototype `campReadiness`, rexer-demo-v3.html :20636).
 *
 * Eight questions a campaign has to answer before anybody starts building. Each
 * unanswered one is a gap that names itself and points at the screen that fixes
 * it — the gate is a to-do list, not a scolding.
 */

type Check = {
  id: string;
  ok: boolean;
  gap: Omit<CampaignGap, 'id'>;
};

export const campReadiness = (
  campaign: CampaignView,
  experiences: CampaignExperience[],
  journeys: Journey[]
): CampaignReadiness => {
  const route = routeCoverage(campaign, experiences, journeys);

  const nakedIndex = campaign.items.findIndex(item => !item.expIds.length);
  const undatedIndex = campaign.items.findIndex(
    item => item.due === null && item.status !== 'live'
  );

  const checks: Check[] = [
    {
      id: 'objective',
      ok: Boolean(campaign.brief.objective.trim()),
      gap: { messageKey: 'gapObjective', fix: { kind: 'brief' } },
    },
    {
      id: 'audience',
      ok: Boolean(campaign.brief.audience.trim()),
      gap: { messageKey: 'gapAudience', fix: { kind: 'brief' } },
    },
    {
      id: 'start',
      ok: Boolean(campaign.startDate),
      gap: { messageKey: 'gapStart', fix: { kind: 'brief' } },
    },
    {
      id: 'journey',
      ok: Boolean(campaign.journeyId),
      gap: { messageKey: 'gapJourney', fix: { kind: 'journey' } },
    },
    {
      id: 'route',
      ok: route.need.length === 0,
      gap: {
        messageKey: 'gapRoute',
        values: { count: route.need.length },
        fix: { kind: 'journey' },
      },
    },
    {
      id: 'items',
      ok: campaign.items.length > 0,
      gap: { messageKey: 'gapNoSubjects', fix: { kind: 'addItem' } },
    },
    {
      id: 'built',
      ok: nakedIndex === -1,
      gap: {
        messageKey: 'gapNaked',
        fix: { kind: 'item', index: Math.max(nakedIndex, 0) },
      },
    },
    {
      id: 'dated',
      ok: undatedIndex === -1,
      gap: {
        messageKey: 'gapUndated',
        fix: { kind: 'item', index: Math.max(undatedIndex, 0) },
      },
    },
  ];

  const ok = checks.filter(check => check.ok).length;
  const gaps: CampaignGap[] = checks
    .filter(check => !check.ok)
    .map(check => ({ id: check.id, ...check.gap }));

  return {
    score: Math.round((ok / checks.length) * 100),
    ok,
    total: checks.length,
    gaps,
  };
};

/** Subjects whose deadline passed before they reached Ready. */
export const lateItems = (campaign: CampaignView, today: string): number =>
  campaign.items.filter(
    item =>
      item.due !== null &&
      item.due < today &&
      ITEM_STATUS[item.status].step < ITEM_STATUS.ready.step
  ).length;
