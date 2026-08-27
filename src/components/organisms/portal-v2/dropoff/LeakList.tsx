'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/portal-v2/format';
import type { AuditLeak } from '@/lib/portal-v2/journey-audit/types';

type LeakListProps = {
  leaks: AuditLeak[];
  selectedId: string | null;
  stageNameOf: (touchpointId: string) => string | null;
  tpNameOf: (touchpointId: string) => string;
  onSelect: (leakId: string) => void;
};

/** Danh sách leak xếp hạng theo usd — cột trái của bước 2. */
export const LeakList = ({
  leaks,
  selectedId,
  stageNameOf,
  tpNameOf,
  onSelect,
}: LeakListProps) => {
  const t = useTranslations('portalV2.dropoff');
  const ranked = [...leaks].sort((a, b) => b.usd - a.usd);

  return (
    <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <h3 className='text-2xs border-b border-[var(--pv2-hair)] px-4 py-3.5 font-bold tracking-[0.13em] text-[var(--pv2-faint)] uppercase'>
        {t('ranked')}
      </h3>
      {ranked.map((leak, index) => {
        const active = leak.id === selectedId;
        const stageName = stageNameOf(leak.touchpointId);
        return (
          <button
            key={leak.id}
            type='button'
            onClick={() => onSelect(leak.id)}
            className={cn(
              'flex w-full items-center gap-3 border-b border-[var(--pv2-hair)] px-4 py-3.5 text-left transition-colors last:border-b-0',
              active
                ? 'bg-[var(--pv2-electric-soft)]'
                : 'hover:bg-[var(--pv2-canvas)]'
            )}
          >
            <span
              className={cn(
                'text-2xs grid size-[30px] shrink-0 place-items-center rounded-full font-semibold text-[var(--pv2-paper)]',
                active ? 'bg-[var(--pv2-electric)]' : 'bg-[var(--pv2-ink)]'
              )}
            >
              #{index + 1}
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block text-[13px] leading-snug font-semibold text-[var(--pv2-ink)]'>
                {leak.title}
              </span>
              <span className='text-2xs mt-0.5 block text-[var(--pv2-faint)]'>
                {stageName ? t('stageAt', { stage: stageName }) : ''}
                {tpNameOf(leak.touchpointId)}
              </span>
            </span>
            <span className='ml-auto shrink-0 text-right'>
              <span className='block text-sm font-semibold text-[var(--pv2-error)]'>
                −{formatMoney(leak.usd)}/mo
              </span>
              <span className='text-3xs text-[var(--pv2-faint)]'>
                {t('confRec', {
                  conf: leak.confidence,
                  range: leak.recoveryRange,
                })}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
