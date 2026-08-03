'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { COMMAND_LINKS } from '@/lib/portal-v2/command/constants';
import type { CommandRecommendation } from '@/lib/portal-v2/command/types';
import { cn } from '@/lib/cn';

type RecommendationsPanelProps = {
  recommendations: CommandRecommendation[];
  t: (key: string, values?: Record<string, string | number>) => string;
  onAction?: (rec: CommandRecommendation) => void;
};

const SEV_BADGE: Record<
  CommandRecommendation['severity'],
  { labelKey: string; className: string }
> = {
  high: {
    labelKey: 'sevActNow',
    className:
      'bg-[color-mix(in_srgb,var(--pv2-error)_12%,transparent)] text-[var(--pv2-error)]',
  },
  medium: {
    labelKey: 'sevWorthLook',
    className:
      'bg-[color-mix(in_srgb,var(--pv2-warning)_14%,transparent)] text-[var(--pv2-warning)]',
  },
  info: {
    labelKey: 'sevOpportunity',
    className: 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]',
  },
};

export const RecommendationsPanel = ({
  recommendations,
  t,
  onAction,
}: RecommendationsPanelProps) => {
  return (
    <div className='space-y-4'>
      <div className='flex gap-2.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3.5'>
        <Sparkles
          className='mt-0.5 size-3.5 shrink-0 text-[var(--pv2-violet)]'
          strokeWidth={2.2}
          aria-hidden
        />
        <p className='text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
          {t('recsNote')}
        </p>
      </div>

      {!recommendations.length ? (
        <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-6 py-10 text-center'>
          <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>
            {t('recsEmptyTitle')}
          </p>
          <p className='mt-1 text-[13px] text-[var(--pv2-faint)]'>
            {t('recsEmptyBody')}
          </p>
        </div>
      ) : (
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {recommendations.map(rec => {
            const badge = SEV_BADGE[rec.severity];
            return (
              <article
                key={rec.id}
                className={cn(
                  'flex flex-col rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4',
                  rec.severity === 'high' &&
                    'border-[color-mix(in_srgb,var(--pv2-error)_28%,var(--pv2-hair))]'
                )}
              >
                <div className='mb-3 flex flex-wrap items-center gap-2'>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-px text-[10px] font-bold tracking-wide uppercase',
                      badge.className
                    )}
                  >
                    {t(badge.labelKey)}
                  </span>
                  <span className='text-[11px] font-semibold text-[var(--pv2-faint)] uppercase'>
                    {rec.level}
                  </span>
                  <span
                    className='rounded-md bg-[var(--pv2-canvas)] px-1.5 py-px text-[10.5px] font-semibold text-[var(--pv2-violet)]'
                    title={rec.tierWhy}
                  >
                    {rec.tierName}
                  </span>
                </div>

                <h3 className='text-[14px] leading-snug font-semibold text-[var(--pv2-ink)]'>
                  {rec.finding}
                </h3>
                <p className='mt-2 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                  {rec.why}
                </p>

                <dl className='mt-3 space-y-1.5 border-t border-[var(--pv2-hair)] pt-3'>
                  <div className='grid grid-cols-[56px_1fr] gap-2 text-[11.5px]'>
                    <dt className='font-bold tracking-wide text-[var(--pv2-faint)] uppercase'>
                      {t('whoLabel')}
                    </dt>
                    <dd className='text-[var(--pv2-mut)]'>{rec.who}</dd>
                  </div>
                  <div className='grid grid-cols-[56px_1fr] gap-2 text-[11.5px]'>
                    <dt className='font-bold tracking-wide text-[var(--pv2-faint)] uppercase'>
                      {t('impactLabel')}
                    </dt>
                    <dd className='text-[var(--pv2-mut)]'>{rec.impact}</dd>
                  </div>
                </dl>

                <div className='mt-3 flex flex-wrap gap-1.5'>
                  {rec.evidence.map(ev => (
                    <span
                      key={ev}
                      className='rounded-md bg-[var(--pv2-canvas)] px-2 py-0.5 text-[11px] font-medium text-[var(--pv2-mut)]'
                    >
                      {ev}
                    </span>
                  ))}
                </div>

                <div className='mt-auto flex flex-wrap gap-2 pt-4'>
                  <Button variant='primary' size='sm' asChild>
                    <Link href={rec.actionHref} onClick={() => onAction?.(rec)}>
                      {rec.actionLabel}
                    </Link>
                  </Button>
                  <Button variant='ghost' size='sm' asChild>
                    <Link href={COMMAND_LINKS.intel}>{t('seeNumbers')}</Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
