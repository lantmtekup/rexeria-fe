'use client';

import { useTranslations } from 'next-intl';

import { ProgressBar } from '@/components/molecules/portal-v2/campaigns-form';
import { EmptyState } from '@/components/molecules/portal-v2/product-form';
import { Button } from '@/components/molecules/portal-v2/Button';
import { CampaignWorkTable } from '@/components/organisms/portal-v2/campaigns/CampaignWorkTable';
import { JourneyCellLegend } from '@/components/organisms/portal-v2/campaigns/JourneyCell';
import { campProgress } from '@/lib/portal-v2/campaigns/helpers';
import { itemShipGate } from '@/lib/portal-v2/campaigns/shipGate';
import type {
  CampaignExperience,
  CampaignTeamMember,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type BuildPhaseProps = {
  campaign: CampaignView;
  experiences: CampaignExperience[];
  journeys: Journey[];
  productNames: Record<string, string>;
  team: CampaignTeamMember[];
  journeyName: string | null;
  today: string;
  editing: boolean;
  onOpenItem: (index: number) => void;
  onOpenSubjectJourney: (index: number, nodeId?: string) => void;
  onDeleteItem: (index: number) => void;
  onAddItem: () => void;
};

/**
 * Build — the work, one row per subject.
 *
 * The header counts what is ready and what the ship gate is holding, because
 * "three of eight ready" and "three of eight ready, two blocked" are different
 * days and the difference should not need clicking to find.
 */
export const BuildPhase = ({
  campaign,
  experiences,
  journeys,
  productNames,
  team,
  journeyName,
  today,
  editing,
  onOpenItem,
  onOpenSubjectJourney,
  onDeleteItem,
  onAddItem,
}: BuildPhaseProps) => {
  const t = useTranslations('portalV2.campaigns');

  if (!campaign.items.length) {
    return (
      <EmptyState
        title={t('buildEmptyTitle')}
        action={
          <Button variant='primary' onClick={onAddItem}>
            {t('addSubject')}
          </Button>
        }
      >
        {t('buildEmptyBody')}
      </EmptyState>
    );
  }

  const progress = campProgress(campaign);
  const blocked = campaign.items.filter(
    item => !itemShipGate(item, experiences).ok
  ).length;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5'>
        <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
            {t('buildTitle')}
          </h3>
          {blocked ? (
            <span className='rounded-full bg-[color-mix(in_srgb,var(--pv2-warning)_16%,transparent)] px-2.5 py-1 text-[11px] font-bold text-[color-mix(in_srgb,var(--pv2-warning)_78%,var(--pv2-ink))]'>
              {t('buildBlocked', { count: blocked })}
            </span>
          ) : null}
          <JourneyCellLegend journeyName={journeyName} />
        </div>

        <ProgressBar
          className='max-w-[280px] min-w-[200px] flex-1'
          done={progress.done}
          total={progress.total}
          pct={progress.pct}
          thick
        />
      </div>

      <CampaignWorkTable
        campaign={campaign}
        items={campaign.items}
        productNames={productNames}
        experiences={experiences}
        journeys={journeys}
        team={team}
        today={today}
        editing={editing}
        onOpenItem={onOpenItem}
        onOpenSubjectJourney={onOpenSubjectJourney}
        onDeleteItem={onDeleteItem}
        onAddItem={onAddItem}
      />
    </div>
  );
};
