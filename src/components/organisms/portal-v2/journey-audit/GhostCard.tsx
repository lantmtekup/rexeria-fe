'use client';

import { Plug } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { formatMoney } from '@/lib/portal-v2/format';
import type {
  AuditLeak,
  AuditSource,
  AuditTouchpoint,
} from '@/lib/portal-v2/journey-audit/types';

type GhostCardProps = {
  tp: AuditTouchpoint;
  needSources: AuditSource[];
  leaks: AuditLeak[];
  onConnect: (providerId: string) => void;
};

/**
 * Touchpoint chưa được audit (state `off`): thẻ ghost nét đứt + CTA connect
 * nguồn còn thiếu + cảnh báo nếu nó nằm trong một leak của Drop-off.
 */
export const GhostCard = ({
  tp,
  needSources,
  leaks,
  onConnect,
}: GhostCardProps) => {
  const t = useTranslations('portalV2.journeyAudit');
  const first = needSources[0];
  const topLeak = leaks[0];

  return (
    <div className='flex w-full flex-col gap-2 rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] p-3'>
      <span className='flex items-center gap-2'>
        <span
          aria-hidden
          className='grid size-[30px] shrink-0 place-items-center rounded-[var(--pv2-r-sm)] bg-[var(--pv2-paper)] text-sm text-[var(--pv2-faint)]'
        >
          <Plug className='size-3.5' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-[13px] leading-tight font-semibold text-[var(--pv2-mut)]'>
            {tp.name}
          </span>
          <span className='text-3xs mt-px block text-[var(--pv2-faint)]'>
            {tp.channel}
          </span>
        </span>
      </span>
      <p className='text-2xs leading-relaxed text-[var(--pv2-faint)]'>
        {t('ghostNotAudited', {
          sources:
            needSources.map(source => source.name).join(` ${t('or')} `) ||
            t('aDataSource'),
        })}
      </p>
      {topLeak ? (
        <p className='text-2xs leading-relaxed text-[var(--pv2-error)]'>
          {t('ghostLeak', { amount: formatMoney(topLeak.usd) })}
        </p>
      ) : null}
      {first ? (
        <Button
          variant='primary'
          size='sm'
          className='self-start'
          onClick={() => onConnect(first.provider)}
        >
          {t('ghostConnect', { name: first.name })}
        </Button>
      ) : null}
    </div>
  );
};
