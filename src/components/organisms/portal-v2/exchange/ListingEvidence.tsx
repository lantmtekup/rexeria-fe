'use client';

import { useTranslations } from 'next-intl';

import { formatLift } from '@/lib/portal-v2/exchange/helpers';
import { tierChipStyle } from '@/lib/portal-v2/exchange/objectiveStyles';
import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';
import { cn } from '@/lib/cn';

type ListingEvidenceProps = {
  listing: ExchangeListingView;
};

export const ListingEvidence = ({ listing }: ListingEvidenceProps) => {
  const t = useTranslations('portalV2.exchange');
  const { meta } = listing;

  if (!listing.proven || !meta.evidence) {
    return (
      <span
        title={t('unprovenTitle')}
        className='inline-flex w-fit self-start rounded-full bg-[var(--pv2-canvas)] px-2 py-[2.5px] text-[10px] font-bold tracking-[0.04em] text-[var(--pv2-faint)] uppercase'
      >
        {t('unproven')}
      </span>
    );
  }

  const liftUp = meta.evidence.lift >= 0;
  const tierStyle = meta.evidence.tier
    ? tierChipStyle(meta.evidence.tier)
    : null;

  return (
    <div className='mt-0.5 flex flex-wrap items-center gap-[7px]'>
      {tierStyle ? (
        <span
          title={meta.evidence.tier}
          className='inline-flex cursor-help rounded-full px-2 py-[2.5px] text-[9px] font-extrabold tracking-[0.05em] uppercase'
          style={{ color: tierStyle.fg, background: tierStyle.bg }}
        >
          {meta.evidence.tier}
        </span>
      ) : null}
      <span
        title={t('liftTitle')}
        className={cn(
          'text-[11.5px] font-bold',
          liftUp ? 'text-[#0e9d6e]' : 'text-[#9a2436]'
        )}
      >
        {formatLift(meta.evidence.lift)}
      </span>
    </div>
  );
};
