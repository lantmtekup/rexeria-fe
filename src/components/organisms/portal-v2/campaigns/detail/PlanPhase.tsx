'use client';

import { CampaignBriefAside } from '@/components/organisms/portal-v2/campaigns/CampaignBriefAside';
import { CampaignJourneyCard } from '@/components/organisms/portal-v2/campaigns/CampaignJourneyCard';
import { PlanGate } from '@/components/organisms/portal-v2/campaigns/PlanGate';
import type {
  CampaignDraft,
  CampaignExperience,
  CampaignGap,
  CampaignReadiness,
  CampaignTeamMember,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type PlanPhaseProps = {
  campaign: CampaignView;
  draft: CampaignDraft;
  editing: boolean;
  team: CampaignTeamMember[];
  readiness: CampaignReadiness;
  /** Drives the gate's voice — a demand while planning, a record once closed. */
  finished: boolean;
  experiences: CampaignExperience[];
  journeys: Journey[];
  journey: Journey | null;
  blueprint: Journey | null;
  onDraftChange: (patch: Partial<CampaignDraft>) => void;
  onFixGap: (gap: CampaignGap) => void;
  onRoute: () => void;
  onCarryRoute: () => void;
};

/**
 * Plan — the gate, the route, and the brief.
 *
 * The gate leads because it is the only thing on this screen that says whether
 * building is a good idea yet. The brief sits alongside rather than above it: it
 * is reference material during Build and Run, not a one-time form.
 */
export const PlanPhase = ({
  campaign,
  draft,
  editing,
  team,
  readiness,
  finished,
  experiences,
  journeys,
  journey,
  blueprint,
  onDraftChange,
  onFixGap,
  onRoute,
  onCarryRoute,
}: PlanPhaseProps) => (
  <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]'>
    <div className='flex min-w-0 flex-col gap-5'>
      <PlanGate readiness={readiness} finished={finished} onFix={onFixGap} />
      <CampaignJourneyCard
        campaign={campaign}
        journey={journey}
        blueprint={blueprint}
        experiences={experiences}
        journeys={journeys}
        onRoute={onRoute}
        onCarryRoute={onCarryRoute}
      />
    </div>

    <CampaignBriefAside
      draft={draft}
      editing={editing}
      team={team}
      onChange={onDraftChange}
    />
  </div>
);
