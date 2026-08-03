'use client';

import { useTranslations } from 'next-intl';

import { objectiveLabelKey } from '@/lib/portal-v2/exchange/mapPage';
import { objectivePillStyle } from '@/lib/portal-v2/exchange/objectiveStyles';
import type { ExchangeListingMeta } from '@/lib/portal-v2/exchange/types';
import { cn } from '@/lib/cn';

type ListingMetaProps = {
  meta: ExchangeListingMeta;
};

export const ListingMeta = ({ meta }: ListingMetaProps) => {
  const t = useTranslations('portalV2.exchange');
  const pill = objectivePillStyle(meta.objective);

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <span
        className='inline-flex items-center rounded-full px-2 py-[3px] text-[9.5px] font-bold tracking-[0.05em] uppercase'
        style={{ background: pill.bg, color: pill.fg }}
      >
        {t(objectiveLabelKey(meta.objective))}
      </span>
      <span
        title={
          meta.coverage.objCovered
            ? t('coverageOkTitle', { pct: meta.coverage.pct })
            : t('coverageGapTitle', { pct: meta.coverage.pct })
        }
        className={cn(
          'cursor-help rounded-full border px-2 py-0.5 text-[11px]',
          meta.coverage.objCovered
            ? 'border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]'
            : 'border-transparent bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] text-[#9a2436]'
        )}
      >
        {t('instrumented', { pct: meta.coverage.pct })}
      </span>
    </div>
  );
};
