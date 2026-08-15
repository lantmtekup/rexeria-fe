'use client';

import { useTranslations } from 'next-intl';

import { formatCount } from '@/lib/portal-v2/experiences/helpers';
import type { Journey, JourneyBenchmark } from '@/lib/portal-v2/journeys/types';
import { cn } from '@/lib/cn';

type JourneyVerdictBannerProps = {
  journey: Journey;
  stats: { sessions: number; completed: number; rate: number } | null;
  /**
   * Blueprint: "the standard" gộp từ chính các bản copy của nó. Copy: chuẩn
   * của blueprint gốc (đã loại chính nó ra) để so verdict.
   */
  benchmark: JourneyBenchmark | null;
};

/**
 * Verdict thật vs kế hoạch/chuẩn — không có `target`/benchmark thì ẩn hẳn
 * phần tương ứng, không vẽ ô trống. "Chưa đo" khác "đo bằng 0".
 */
export const JourneyVerdictBanner = ({
  journey,
  stats,
  benchmark,
}: JourneyVerdictBannerProps) => {
  const t = useTranslations('portalV2.journeys');

  const cvr = stats ? stats.rate * 100 : null;
  const targetPct =
    typeof journey.target === 'number' ? journey.target * 100 : null;
  const hasPlanLine = !journey.template && cvr !== null && targetPct !== null;
  const hasBenchmarkLine = benchmark !== null;

  if (!hasPlanLine && !hasBenchmarkLine) return null;

  const pctOfPlan =
    hasPlanLine && targetPct
      ? Math.round(((cvr as number) / targetPct) * 100)
      : null;
  const pctOfStandard =
    hasBenchmarkLine && cvr !== null && benchmark.cvr
      ? Math.round((cvr / benchmark.cvr) * 100)
      : null;

  return (
    <div className='mb-4 flex flex-col gap-2.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-3.5'>
      {hasPlanLine ? (
        <div>
          <span
            className={cn(
              'font-[family-name:var(--pv2-disp)] text-[15px] font-bold tabular-nums',
              (pctOfPlan ?? 0) >= 100
                ? 'text-[#0e9d6e]'
                : 'text-[var(--pv2-warning)]'
            )}
          >
            {t('verdictVsPlan', {
              cvr: cvr.toFixed(1),
              target: (targetPct as number).toFixed(1),
            })}
          </span>
          <p className='mt-0.5 text-[11.5px] text-[var(--pv2-mut)] tabular-nums'>
            {t('verdictSessions', { count: formatCount(stats!.sessions) })}
            {pctOfPlan !== null
              ? ` · ${t('verdictPctOfPlan', { pct: pctOfPlan })}`
              : ''}
          </p>
        </div>
      ) : null}

      {hasBenchmarkLine ? (
        <div
          className={
            hasPlanLine ? 'border-t border-[var(--pv2-hair)] pt-2.5' : ''
          }
        >
          <p className='text-[10.5px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'>
            {t('theStandard')}
          </p>
          <p className='mt-0.5 text-[12.5px] leading-relaxed text-[var(--pv2-ink)]'>
            {journey.template
              ? t('standardEarned', {
                  cvr: benchmark.cvr.toFixed(1),
                  runs: benchmark.runs,
                  sessions: formatCount(benchmark.sessions),
                })
              : cvr !== null
                ? pctOfStandard !== null && pctOfStandard >= 100
                  ? t('standardBeat', {
                      pct: pctOfStandard,
                      benchCvr: benchmark.cvr.toFixed(1),
                    })
                  : t('standardBehind', {
                      pct: pctOfStandard ?? 0,
                      benchCvr: benchmark.cvr.toFixed(1),
                    })
                : t('standardEarned', {
                    cvr: benchmark.cvr.toFixed(1),
                    runs: benchmark.runs,
                    sessions: formatCount(benchmark.sessions),
                  })}
          </p>
          <span
            className={cn(
              'mt-1 inline-flex rounded-full px-2 py-[2px] text-[9px] font-extrabold tracking-[0.05em] uppercase',
              benchmark.maturity === 'established'
                ? 'bg-[color-mix(in_srgb,var(--pv2-success)_14%,transparent)] text-[#0e9d6e]'
                : 'bg-[var(--pv2-canvas)] text-[var(--pv2-faint)]'
            )}
          >
            {t(
              benchmark.maturity === 'established'
                ? 'maturityEstablished'
                : 'maturityEarly'
            )}
          </span>
        </div>
      ) : null}
    </div>
  );
};
