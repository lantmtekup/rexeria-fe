'use client';

import { useTranslations } from 'next-intl';

import { formatCount, formatMoney } from '@/lib/portal-v2/deploy/helpers';
import type { DeployTotals } from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type DeployKpisProps = {
  totals: DeployTotals;
  /** Issues is a button: it is the one number you act on. */
  onOpenIssues?: () => void;
};

type Cell = {
  id: string;
  labelKey: string;
  dot: string;
  value: string;
  sub: string;
  bad?: boolean;
};

/**
 * Five operational numbers — the ones you check before you push, and the
 * morning after you did. Nothing analytical: no funnel, no attribution, no
 * lift. Those live on the AI route and would only disagree with these.
 */
export const DeployKpis = ({ totals, onOpenIssues }: DeployKpisProps) => {
  const t = useTranslations('portalV2.deploy');

  const cells: Cell[] = [
    {
      id: 'live',
      labelKey: 'kpiLive',
      dot: 'var(--pv2-success)',
      value: formatCount(totals.live),
      sub: t('kpiLiveSub', { count: totals.ready }),
    },
    {
      id: 'sessions',
      labelKey: 'kpiSessions',
      dot: 'var(--pv2-violet)',
      value: formatCount(totals.sessions),
      sub: t('kpiSessionsSub', { count: totals.channels }),
    },
    {
      id: 'cvr',
      labelKey: 'kpiCvr',
      dot: 'var(--pv2-blue-500)',
      value: totals.cvr,
      sub: t('kpiCvrSub'),
    },
    {
      id: 'revenue',
      labelKey: 'kpiRevenue',
      dot: 'var(--pv2-warning)',
      value: formatMoney(totals.revenue),
      sub: t('kpiRevenueSub'),
    },
    {
      id: 'issues',
      labelKey: 'kpiIssues',
      dot: totals.issues ? 'var(--pv2-error)' : 'var(--pv2-success)',
      value: formatCount(totals.issues),
      sub: totals.issues ? t('kpiIssuesSubBad') : t('kpiIssuesSubOk'),
      bad: totals.issues > 0,
    },
  ];

  return (
    <section
      className={cn(
        'overflow-hidden rounded-[var(--pv2-r)] border bg-[var(--pv2-paper)]',
        totals.issues
          ? 'border-[color-mix(in_srgb,var(--pv2-error)_28%,var(--pv2-hair))]'
          : 'border-[var(--pv2-hair)]'
      )}
      aria-label={t('kpiAria')}
    >
      <div
        className={cn(
          'grid divide-[var(--pv2-hair)]',
          'grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0',
          'lg:grid-cols-5'
        )}
      >
        {cells.map(cell => {
          const inner = (
            <>
              <div className='flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--pv2-mut)]'>
                <span
                  className='size-1.5 shrink-0 rounded-full'
                  style={{ background: cell.dot }}
                  aria-hidden
                />
                {t(cell.labelKey)}
              </div>
              <div
                className={cn(
                  'mt-2 font-[family-name:var(--pv2-disp)] text-[1.5rem] leading-none font-bold',
                  'tracking-[-0.03em] tabular-nums',
                  cell.bad ? 'text-[var(--pv2-error)]' : 'text-[var(--pv2-ink)]'
                )}
              >
                {cell.value}
              </div>
              <p className='mt-1.5 text-[12.5px] leading-relaxed text-[var(--pv2-faint)]'>
                {cell.sub}
              </p>
            </>
          );

          const className = 'block min-w-0 px-4 py-4 text-left sm:px-5';

          if (cell.id === 'issues' && cell.bad && onOpenIssues) {
            return (
              <button
                key={cell.id}
                type='button'
                onClick={onOpenIssues}
                aria-label={`${t(cell.labelKey)}: ${cell.value}`}
                className={cn(
                  className,
                  'cursor-pointer transition-colors hover:bg-[var(--pv2-canvas)]',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                )}
              >
                {inner}
              </button>
            );
          }

          return (
            <div key={cell.id} className={className}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
};
