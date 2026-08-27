'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { formatCount } from '@/lib/portal-v2/format';
import type { FlowStats } from '@/lib/portal-v2/journey-audit/helpers';
import type {
  AuditSource,
  AuditTouchpoint,
} from '@/lib/portal-v2/journey-audit/types';
import { ScoreRing } from '@/components/organisms/portal-v2/journey-audit/ScoreRing';

const FLAG_CLASSES: Record<string, string> = {
  crit: 'bg-[color-mix(in_srgb,var(--pv2-error)_9%,var(--pv2-paper))] text-[var(--pv2-error)]',
  warn: 'bg-[color-mix(in_srgb,var(--pv2-warning)_12%,var(--pv2-paper))] text-[color-mix(in_srgb,var(--pv2-warning)_80%,var(--pv2-ink))]',
  good: 'bg-[color-mix(in_srgb,var(--pv2-success)_10%,var(--pv2-paper))] text-[var(--pv2-success)]',
  neutral: 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]',
};

type TouchpointCardProps = {
  tp: AuditTouchpoint;
  stale: boolean;
  selected: boolean;
  stats: FlowStats | null;
  sources: AuditSource[];
  estimated: boolean;
  onOpen: () => void;
};

/**
 * Thẻ touchpoint trên board Quality: icon + tên + vòng điểm, flags, dải
 * traffic arrive·continue·leave (số ước tính mang dấu ≈ — FR-B8) và hàng
 * src-dots trạng thái nguồn.
 */
export const TouchpointCard = ({
  tp,
  stale,
  selected,
  stats,
  sources,
  estimated,
  onOpen,
}: TouchpointCardProps) => {
  const t = useTranslations('portalV2.journeyAudit');
  const continueColor = stats
    ? stats.isEnd
      ? 'var(--pv2-faint)'
      : stats.rate >= 50
        ? 'var(--pv2-success)'
        : stats.rate >= 25
          ? 'var(--pv2-warning)'
          : 'var(--pv2-error)'
    : undefined;

  return (
    <button
      type='button'
      onClick={onOpen}
      className={cn(
        'flex w-full flex-col gap-2 rounded-[var(--pv2-r)] border p-3 text-left transition-[border-color,box-shadow,transform] duration-150',
        'bg-[var(--pv2-paper)] hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--pv2-electric)_36%,var(--pv2-hair))] hover:shadow-[var(--pv2-sh-sm)]',
        stale &&
          'border-[color-mix(in_srgb,var(--pv2-warning)_45%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_5%,var(--pv2-paper))]',
        selected
          ? 'border-[var(--pv2-electric)] ring-2 ring-[var(--pv2-electric-soft)]'
          : !stale && 'border-[var(--pv2-hair)]'
      )}
    >
      <span className='flex items-center gap-2'>
        <span
          aria-hidden
          className='grid size-[30px] shrink-0 place-items-center rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] text-sm'
        >
          {tp.icon}
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-[13px] leading-tight font-semibold text-[var(--pv2-ink)]'>
            {tp.name}
          </span>
          <span className='text-3xs mt-px block text-[var(--pv2-faint)]'>
            {tp.channel}
          </span>
        </span>
        <ScoreRing
          score={tp.score}
          size={34}
          stroke={4}
          className='shrink-0'
          numberClassName='text-3xs'
        />
      </span>

      <span className='flex flex-wrap gap-1'>
        {stale ? (
          <span
            className={cn(
              'text-3xs rounded-[5px] px-1.5 py-0.5 font-semibold',
              FLAG_CLASSES.warn
            )}
          >
            {t('staleFlag')}
          </span>
        ) : null}
        {tp.flags.map(flag => (
          <span
            key={flag.label}
            className={cn(
              'text-3xs rounded-[5px] px-1.5 py-0.5 font-semibold tracking-[0.02em]',
              FLAG_CLASSES[flag.severity]
            )}
          >
            {flag.label}
          </span>
        ))}
      </span>

      {stats && stats.arrive ? (
        <span
          className='text-3xs flex items-center gap-1 text-[var(--pv2-mut)]'
          title={estimated ? t('estimatedTitle') : undefined}
        >
          {estimated ? <span aria-label={t('estimatedTitle')}>≈</span> : null}
          <span>
            {t('trafficArrive', { count: formatCount(stats.arrive) })}
          </span>
          <span className='text-[var(--pv2-hair)]'>·</span>
          <span style={{ color: continueColor }}>
            {stats.isEnd
              ? t('trafficEndpoint')
              : t('trafficContinue', { rate: stats.rate })}
          </span>
          {stats.isEnd ? null : (
            <>
              <span className='text-[var(--pv2-hair)]'>·</span>
              <span className='text-[var(--pv2-error)]'>
                {t('trafficLeave', { count: formatCount(stats.leave) })}
              </span>
            </>
          )}
        </span>
      ) : null}

      <span className='flex items-center gap-1 pt-0.5'>
        {tp.sourceIds.map(sourceId => {
          const source = sources.find(item => item.id === sourceId);
          if (!source) return null;
          return (
            <span
              key={sourceId}
              title={t('fedBy', { name: source.name })}
              className={cn(
                'text-2xs rounded-[6px] border-b-2 bg-[var(--pv2-canvas)] px-1.5 pt-0.5 pb-1 leading-none',
                source.status === 'connected' &&
                  'border-b-[var(--pv2-success)]',
                source.status === 'attention' &&
                  'border-b-[var(--pv2-warning)]',
                source.status === 'available' &&
                  'border-b-[var(--pv2-hair)] opacity-60 grayscale'
              )}
            >
              {source.icon}
            </span>
          );
        })}
        <span className='ml-0.5 text-[9px] tracking-[0.1em] text-[var(--pv2-faint)] uppercase'>
          {t('sourcesLabel')}
        </span>
      </span>
    </button>
  );
};
