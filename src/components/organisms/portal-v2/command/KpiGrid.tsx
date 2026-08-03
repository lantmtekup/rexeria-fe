'use client';

import Link from 'next/link';

import { KPI_ACCENT } from '@/lib/portal-v2/command/constants';
import type { CommandKpi, CommandTabId } from '@/lib/portal-v2/command/types';
import { cn } from '@/lib/cn';

type KpiGridProps = {
  items: CommandKpi[];
  t: (key: string, values?: Record<string, string | number>) => string;
  onKpiClick?: (tabId: CommandTabId) => void;
};

type KpiCellProps = {
  item: CommandKpi;
  t: KpiGridProps['t'];
  onKpiClick?: KpiGridProps['onKpiClick'];
  prominent?: boolean;
};

const KpiCell = ({ item, t, onKpiClick, prominent }: KpiCellProps) => {
  const accent = KPI_ACCENT[item.accent];
  const sub = item.subValues ? t(item.subKey, item.subValues) : t(item.subKey);

  const inner = (
    <>
      <div className='flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--pv2-mut)]'>
        <span
          className='size-1.5 shrink-0 rounded-full'
          style={{ background: accent.dot }}
          aria-hidden
        />
        {t(item.labelKey)}
      </div>
      <div
        className={cn(
          'mt-2 font-[family-name:var(--pv2-disp)] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] tabular-nums',
          prominent ? 'text-[2rem] leading-none' : 'text-[1.5rem] leading-none'
        )}
      >
        {item.value}
      </div>
      <p className='mt-1.5 text-[12.5px] leading-relaxed text-[var(--pv2-faint)]'>
        {sub}
      </p>
    </>
  );

  const className = cn(
    'block min-w-0 px-4 py-4 text-left sm:px-5 sm:py-5',
    'transition-colors hover:bg-[var(--pv2-canvas)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none'
  );

  if (item.tabId) {
    return (
      <button
        type='button'
        className={className}
        onClick={() => onKpiClick?.(item.tabId!)}
        aria-label={`${t(item.labelKey)}: ${item.value}`}
      >
        {inner}
      </button>
    );
  }

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={className}
        aria-label={`${t(item.labelKey)}: ${item.value}`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
};

type KpiBandProps = {
  title: string;
  items: CommandKpi[];
  t: KpiGridProps['t'];
  onKpiClick?: KpiGridProps['onKpiClick'];
  cols: 3 | 4;
};

const KpiBand = ({ title, items, t, onKpiClick, cols }: KpiBandProps) => {
  if (!items.length) return null;

  return (
    <section className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <div className='border-b border-[var(--pv2-hair)] px-4 py-2.5 sm:px-5'>
        <h3 className='text-[12px] font-semibold text-[var(--pv2-mut)]'>
          {title}
        </h3>
      </div>
      <div
        className={cn(
          'grid divide-[var(--pv2-hair)]',
          cols === 4
            ? 'grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4'
            : 'grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0'
        )}
      >
        {items.map(item => (
          <KpiCell key={item.id} item={item} t={t} onKpiClick={onKpiClick} />
        ))}
      </div>
    </section>
  );
};

export const KpiGrid = ({ items, t, onKpiClick }: KpiGridProps) => {
  const running = items.filter(x => x.group === 'running');
  const producing = items.filter(x => x.group === 'producing');
  const attention = items.find(x => x.group === 'attention');
  const hasIssues =
    attention &&
    attention.accent === 'rose' &&
    typeof attention.value === 'number' &&
    attention.value > 0;

  return (
    <div className='space-y-3'>
      <KpiBand
        title={t('kpiGroupRunning')}
        items={running}
        t={t}
        onKpiClick={onKpiClick}
        cols={4}
      />

      <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]'>
        <KpiBand
          title={t('kpiGroupProducing')}
          items={producing}
          t={t}
          onKpiClick={onKpiClick}
          cols={3}
        />

        {attention ? (
          <section
            className={cn(
              'overflow-hidden rounded-[var(--pv2-r)] border bg-[var(--pv2-paper)]',
              hasIssues
                ? 'border-[color-mix(in_srgb,var(--pv2-error)_35%,var(--pv2-hair))]'
                : 'border-[var(--pv2-hair)]'
            )}
          >
            <div className='border-b border-[var(--pv2-hair)] px-4 py-2.5 sm:px-5'>
              <h3 className='text-[12px] font-semibold text-[var(--pv2-mut)]'>
                {t('kpiGroupAttention')}
              </h3>
            </div>
            <KpiCell
              item={attention}
              t={t}
              onKpiClick={onKpiClick}
              prominent={Boolean(hasIssues)}
            />
          </section>
        ) : null}
      </div>
    </div>
  );
};
