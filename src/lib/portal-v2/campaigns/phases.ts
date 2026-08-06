import { CAMP_PHASE_ORDER } from '@/lib/portal-v2/campaigns/constants';
import { deriveStage } from '@/lib/portal-v2/campaigns/helpers';
import { campReadiness } from '@/lib/portal-v2/campaigns/readiness';
import type {
  CampaignExperience,
  CampaignPhase,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';

/**
 * Where the campaign's work is (prototype `campPhase`, rexer-demo-v3.html
 * :20626). Derived, never set: a campaign in Build got there by having work in
 * flight, and clicking back to Plan does not un-build it.
 */
import type { Journey } from '@/lib/portal-v2/journeys/types';

export const campPhase = (
  campaign: CampaignView,
  experiences: CampaignExperience[],
  journeys: Journey[]
): CampaignPhase => {
  const stage = deriveStage(campaign);
  if (stage === 'done') return 'learn';
  if (stage === 'live') return 'run';
  if (stage === 'building') return 'build';
  return campReadiness(campaign, experiences, journeys).score === 100
    ? 'build'
    : 'plan';
};

export const phaseIndex = (phase: CampaignPhase): number =>
  CAMP_PHASE_ORDER.indexOf(phase);

/** A phase the campaign has already been through — shown as settled, not muted. */
export const isPastPhase = (
  phase: CampaignPhase,
  current: CampaignPhase
): boolean => phaseIndex(phase) < phaseIndex(current);
