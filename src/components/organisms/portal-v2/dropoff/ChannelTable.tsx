'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import type { AuditDropoff } from '@/lib/portal-v2/journey-audit/types';

type ChannelTableProps = {
  dropoff: AuditDropoff;
};

/**
 * Bảng kênh: share of visits · buyers/1000 · so trung bình site (±25%).
 * Hợp đồng thật không mang liên kết kênh → leak (khác prototype), nên bảng
 * này thuần số đo; avg = 0 (chưa có converted) thì cột delta hiện "—".
 */
export const ChannelTable = ({ dropoff }: ChannelTableProps) => {
  const t = useTranslations('portalV2.dropoff');
  const max = Math.max(...dropoff.channels.map(row => row.buyersPer1000), 1);
  const totalSessions = dropoff.channels.reduce(
    (total, row) => total + row.sessions,
    0
  );
  const totalBuyers = dropoff.channels.reduce(
    (total, row) => total + (row.buyersPer1000 * row.sessions) / 1000,
    0
  );
  const avg = totalSessions
    ? Math.round((1000 * totalBuyers) / totalSessions)
    : 0;

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
              : null;
            const cls =
              delta == null
                ? 'text-[var(--pv2-faint)]'
                : delta <= -25
                  ? 'text-[var(--pv2-error)]'
                  : delta >= 25
                    ? 'text-[var(--pv2-success)]'
                    : 'text-[var(--pv2-faint)]';
            const barCls =
              delta != null && delta <= -25
                ? 'bg-[var(--pv2-error)]'
                : delta != null && delta >= 25
                  ? 'bg-[var(--pv2-success)]'
                  : 'bg-[var(--pv2-faint)]';
            return (
              <div key={row.name} className={rowClass}>
                <span className='font-semibold text-[var(--pv2-ink)] capitalize'>
                  {row.name}
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
                  {delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta}%`}
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
