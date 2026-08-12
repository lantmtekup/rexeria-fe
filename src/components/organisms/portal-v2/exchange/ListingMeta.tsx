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
  // Người bán chưa khai mục tiêu ⇒ KHÔNG vẽ pill. Một nhãn mặc định ở đây là
  // lời khẳng định do màn hình bịa ra, không phải điều ai đó đăng.
  const pill = meta.objective ? objectivePillStyle(meta.objective) : null;
  const coverage = meta.coverage;

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {meta.objective && pill ? (
        <span
          className='inline-flex items-center rounded-full px-2 py-[3px] text-[9.5px] font-bold tracking-[0.05em] uppercase'
          style={{ background: pill.bg, color: pill.fg }}
        >
          {t(objectiveLabelKey(meta.objective))}
        </span>
      ) : null}
      {/* Vắng độ phủ ⇒ im lặng. "0% instrumented" là một phép đo, và ở đây
          chưa ai đo gì cả. */}
      {coverage ? (
        <span
          title={
            coverage.objCovered
              ? t('coverageOkTitle', { pct: coverage.pct })
              : t('coverageGapTitle', { pct: coverage.pct })
          }
          className={cn(
            'cursor-help rounded-full border px-2 py-0.5 text-[11px]',
            coverage.objCovered
              ? 'border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]'
              : 'border-transparent bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] text-[#9a2436]'
          )}
        >
          {t('instrumented', { pct: coverage.pct })}
        </span>
      ) : null}
    </div>
  );
};
