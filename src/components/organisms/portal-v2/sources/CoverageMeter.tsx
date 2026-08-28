'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import type {
  CoverageHint,
  StageCoverage,
} from '@/lib/portal-v2/journey-audit/helpers';

type CoverageMeterProps = {
  coverage: StageCoverage[];
  hint: CoverageHint;
};

const STATE_CLASS: Record<StageCoverage['state'], string> = {
  ok: 'border-[color-mix(in_srgb,var(--pv2-success)_28%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-success)_8%,var(--pv2-paper))] text-[var(--pv2-success)]',
  weak: 'border-[color-mix(in_srgb,var(--pv2-warning)_35%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_10%,var(--pv2-paper))] text-[color-mix(in_srgb,var(--pv2-warning)_80%,var(--pv2-ink))]',
  gap: 'border-[color-mix(in_srgb,var(--pv2-error)_28%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_8%,var(--pv2-paper))] text-[var(--pv2-error)]',
};

const STATE_MARK: Record<StageCoverage['state'], string> = {
  ok: '✓',
  weak: '!',
  gap: '✕',
};

/**
 * Coverage strip 5 stage ✓/!/✕ — trước là `mining/CoverageMeter` (2 trạng
 * thái); di dời về sources và nâng lên tri-state theo prototype Journey Audit.
 */
export const CoverageMeter = ({ coverage, hint }: CoverageMeterProps) => {
  const t = useTranslations('portalV2.sources');
  const covered = coverage.filter(item => item.state !== 'gap').length;

  return (
    <section
      aria-label={t('coverage')}
      className='mx-auto mb-6 w-full max-w-[1240px] rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-4'
    >
      <div className='flex flex-wrap items-center gap-3'>
        <span className='text-2xs shrink-0 font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
          {t('coverage')}
        </span>
        {coverage.map(item => (
          <span
            key={item.stage}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold',
              STATE_CLASS[item.state]
            )}
          >
            {STATE_MARK[item.state]} {item.stage}
            <span className='text-3xs opacity-75'>
              {t('srcCount', { count: item.live + item.stale })}
            </span>
          </span>
        ))}
        <span className='ml-auto shrink-0 text-xs text-[var(--pv2-mut)]'>
          {t('coverageTally', { covered, total: coverage.length })}
        </span>
      </div>
      {hint ? (
        <p className='mt-3 flex items-start gap-2.5 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-electric)_25%,var(--pv2-hair))] bg-[var(--pv2-electric-soft)] px-3.5 py-2.5 text-xs leading-relaxed text-[var(--pv2-ink)]'>
          <span aria-hidden>💡</span>
          <span>
            {hint.kind === 'gap'
              ? t('hintGap', {
                  stage: hint.stage,
                  sources: hint.recommended.join(` ${t('or')} `),
                })
              : hint.kind === 'strengthenAwareness'
                ? t('hintStrengthen')
                : t('hintAttention', {
                    name: hint.sourceName,
                    stages: hint.stages,
                  })}
          </span>
        </p>
      ) : null}
    </section>
  );
};
