'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { formatMoney } from '@/lib/portal-v2/format';
import {
  grade,
  scoreColor,
  scoreSoft,
  scoreTone,
} from '@/lib/portal-v2/journey-audit/helpers';
import { ScoreRing } from '@/components/organisms/portal-v2/journey-audit/ScoreRing';

export type AuditSummaryStats = {
  productName: string;
  score: number | null;
  critical: number;
  warnings: number;
  strengths: number;
  brokenHandoffs: number;
  auditedCount: number;
  stageCount: number;
  offCount: number;
  totalRisk: number;
};

type AuditSummaryProps = {
  stats: AuditSummaryStats;
  onOpenSources: () => void;
  onOpenDropoff: () => void;
  compact: boolean;
};

const gradeWordKey = (score: number): string => {
  const tone = scoreTone(score);
  if (tone === 'good') return 'gradeHealthy';
  if (tone === 'warn') return 'gradeAttention';
  return 'gradeAtRisk';
};

type KpiProps = {
  value: number;
  label: string;
  note: string;
  color: string;
};

const Kpi = ({ value, label, note, color }: KpiProps) => (
  <div className='flex min-w-0 flex-1 flex-col justify-center gap-0.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3'>
    <span
      className='font-[family-name:var(--pv2-disp)] text-[22px] font-semibold tracking-[-0.02em]'
      style={{ color }}
    >
      {value}
    </span>
    <span className='text-2xs font-medium text-[var(--pv2-faint)]'>
      {label}
    </span>
    <span className='text-3xs font-semibold' style={{ color }}>
      {note}
    </span>
  </div>
);

/** Header summary: hero card (score ring + grade) + 4 KPI; compact = 1 dòng. */
export const AuditSummary = ({
  stats,
  onOpenSources,
  onOpenDropoff,
  compact,
}: AuditSummaryProps) => {
  const t = useTranslations('portalV2.journeyAudit');
  const score = stats.score ?? 0;
  const scoreText = stats.score == null ? '—' : String(stats.score);

  if (compact) {
    return (
      <div className='mx-5 mt-3.5 flex flex-wrap items-center gap-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-2.5'>
        <span
          className='rounded-[var(--pv2-r-sm)] px-2.5 py-1 text-[13px] font-semibold'
          style={{ color: scoreColor(score), background: scoreSoft(score) }}
        >
          {scoreText}
        </span>
        <strong className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold text-[var(--pv2-ink)]'>
          {stats.productName}
        </strong>
        <span
          className='text-2xs font-bold'
          style={{ color: scoreColor(score) }}
        >
          {t('gradeLabel', { grade: grade(score) })}
        </span>
        <span className='h-4 w-px bg-[var(--pv2-hair)]' aria-hidden />
        <span className='text-xs text-[var(--pv2-faint)]'>
          <b className='text-[var(--pv2-error)]'>{stats.critical}</b>{' '}
          {t('compactCritical')}
        </span>
        <span className='text-xs text-[var(--pv2-faint)]'>
          <b className='text-[var(--pv2-warning)]'>{stats.warnings}</b>{' '}
          {t('compactWarnings')}
        </span>
        <span className='text-xs text-[var(--pv2-faint)]'>
          <b
            className={cn(
              stats.brokenHandoffs
                ? 'text-[var(--pv2-error)]'
                : 'text-[var(--pv2-success)]'
            )}
          >
            {stats.brokenHandoffs}
          </b>{' '}
          {t('compactHandoffs')}
        </span>
        {stats.totalRisk ? (
          <button
            type='button'
            onClick={onOpenDropoff}
            className='ml-auto rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-error)_28%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_8%,var(--pv2-paper))] px-3 py-1.5 text-xs font-bold text-[var(--pv2-error)] hover:bg-[color-mix(in_srgb,var(--pv2-error)_14%,var(--pv2-paper))]'
          >
            {t('compactRisk', { amount: formatMoney(stats.totalRisk) })}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className='flex flex-wrap items-stretch gap-3.5 px-5 pt-4'>
      <div className='flex shrink-0 items-center gap-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-4'>
        <ScoreRing
          score={score}
          size={74}
          stroke={7}
          numberClassName='text-[20px]'
        />
        <div>
          <h1 className='max-w-[340px] font-[family-name:var(--pv2-disp)] text-[19px] leading-tight font-bold tracking-[-0.01em] text-[var(--pv2-ink)]'>
            {stats.productName}
          </h1>
          <p className='mt-0.5 text-xs text-[var(--pv2-faint)]'>
            {t('auditedAcross', {
              count: stats.auditedCount,
              stages: stats.stageCount,
            })}
            {stats.offCount ? (
              <>
                {' · '}
                <button
                  type='button'
                  onClick={onOpenSources}
                  className='font-semibold text-[var(--pv2-electric)] hover:underline'
                >
                  {t('awaitingSource', { count: stats.offCount })}
                </button>
              </>
            ) : null}
          </p>
          <span
            className='text-2xs mt-1.5 inline-block rounded-[var(--pv2-r-sm)] px-2 py-0.5 font-bold tracking-[0.04em]'
            style={{ color: scoreColor(score), background: scoreSoft(score) }}
          >
            {t('gradeLabel', { grade: grade(score) })} ·{' '}
            {t(gradeWordKey(score))}
          </span>
        </div>
      </div>
      <div className='flex min-w-[320px] flex-1 gap-3.5'>
        <Kpi
          value={stats.critical}
          label={t('kpiCritical')}
          note={t('kpiCriticalNote')}
          color='var(--pv2-error)'
        />
        <Kpi
          value={stats.warnings}
          label={t('kpiWarnings')}
          note={t('kpiWarningsNote')}
          color='var(--pv2-warning)'
        />
        <Kpi
          value={stats.brokenHandoffs}
          label={t('kpiHandoffs')}
          note={t('kpiHandoffsNote')}
          color={
            stats.brokenHandoffs ? 'var(--pv2-error)' : 'var(--pv2-success)'
          }
        />
        <Kpi
          value={stats.strengths}
          label={t('kpiStrengths')}
          note={t('kpiStrengthsNote')}
          color='var(--pv2-success)'
        />
      </div>
    </div>
  );
};
