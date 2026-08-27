'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import type { AuditDropoff } from '@/lib/portal-v2/journey-audit/types';

type ChannelTableProps = {
  dropoff: AuditDropoff;
  onSelectLeak: (leakId: string) => void;
};

/** Bảng kênh: share of visits · buyers/1000 · so với trung bình site (±25%). */
export const ChannelTable = ({ dropoff, onSelectLeak }: ChannelTableProps) => {
  const t = useTranslations('portalV2.dropoff');
  const steps = dropoff.steps;
  const avg = Math.round(
    (1000 * (steps[steps.length - 1]?.count ?? 0)) / (steps[0]?.count || 1)
  );
  const max = Math.max(...dropoff.channels.map(row => row.buyersPer1000), 1);

  const rowClass =
    'grid grid-cols-[1.5fr_1.6fr_1.6fr_1.1fr] items-center gap-3.5 border-b border-[var(--pv2-hair)] px-3.5 py-2.5 text-xs last:border-b-0';

  return (
    <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 pt-4 pb-3'>
      <h4 className='font-[family-name:var(--pv2-disp)] text-sm font-bold text-[var(--pv2-ink)]'>
        {t('chanTitle')}
      </h4>
      <p className='mt-0.5 mb-2.5 text-xs text-[var(--pv2-faint)]'>
        {t('chanSub')}
      </p>
      <div className='overflow-x-auto'>
        <div className='min-w-[640px] overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]'>
          <div
            className={cn(
              rowClass,
              'text-3xs bg-[var(--pv2-canvas)] font-bold tracking-[0.08em] text-[var(--pv2-faint)] uppercase'
            )}
          >
            <span>{t('chanSource')}</span>
            <span>{t('chanShare')}</span>
            <span>{t('chanRate')}</span>
            <span>{t('chanVs')}</span>
          </div>
          {dropoff.channels.map(row => {
            const delta = avg
              ? Math.round((100 * (row.buyersPer1000 - avg)) / avg)
              : 0;
            const cls =
              delta <= -25
                ? 'text-[var(--pv2-error)]'
                : delta >= 25
                  ? 'text-[var(--pv2-success)]'
                  : 'text-[var(--pv2-faint)]';
            const barCls =
              delta <= -25
                ? 'bg-[var(--pv2-error)]'
                : delta >= 25
                  ? 'bg-[var(--pv2-success)]'
                  : 'bg-[var(--pv2-faint)]';
            return (
              <div
                key={row.name}
                className={cn(
                  rowClass,
                  row.leakId &&
                    'bg-[color-mix(in_srgb,var(--pv2-error)_3%,var(--pv2-paper))]'
                )}
              >
                <span className='flex flex-wrap items-center gap-1.5 font-semibold text-[var(--pv2-ink)]'>
                  {row.name}
                  {row.leakId ? (
                    <span className='rounded-[5px] bg-[color-mix(in_srgb,var(--pv2-error)_10%,var(--pv2-paper))] px-1.5 py-px text-[9.5px] font-bold tracking-[0.03em] text-[var(--pv2-error)]'>
                      {t('leakFound')}
                    </span>
                  ) : null}
                </span>
                <span className='flex items-center gap-2'>
                  <i
                    className='block h-[7px] min-w-1 rounded-full bg-[var(--pv2-electric)] opacity-35'
                    style={{ width: `${row.sharePct * 2.6}%` }}
                  />
                  <b className='shrink-0 font-semibold text-[var(--pv2-ink)]'>
                    {row.sharePct}%
                  </b>
                </span>
                <span className='flex items-center gap-2'>
                  <i
                    className={cn('block h-[7px] min-w-1 rounded-full', barCls)}
                    style={{
                      width: `${Math.round((100 * row.buyersPer1000) / max)}%`,
                    }}
                  />
                  <b className='shrink-0 font-semibold text-[var(--pv2-ink)]'>
                    {row.buyersPer1000}
                  </b>
                </span>
                <span className={cn('font-semibold', cls)}>
                  {delta > 0 ? '+' : ''}
                  {delta}%
                  {row.leakId ? (
                    <>
                      {' · '}
                      <button
                        type='button'
                        onClick={() => onSelectLeak(row.leakId!)}
                        className='font-semibold text-[var(--pv2-electric)] hover:underline'
                      >
                        {t('seeWhy')}
                      </button>
                    </>
                  ) : null}
                </span>
              </div>
            );
          })}
          <p className='text-2xs bg-[var(--pv2-canvas)] px-3.5 py-2.5 leading-relaxed text-[var(--pv2-mut)]'>
            {t('chanFoot', { avg })}
          </p>
        </div>
      </div>
    </div>
  );
};
