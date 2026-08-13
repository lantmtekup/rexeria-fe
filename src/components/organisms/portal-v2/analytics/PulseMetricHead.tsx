import {
  fmtCount,
  fmtMoney,
  fmtPct,
  fmtRoas,
} from '@/lib/portal-v2/analytics/helpers';
import type { PulseRollup } from '@/lib/portal-v2/analytics/types';

type PulseMetricHeadProps = {
  rollup: PulseRollup;
  coveragePct: number;
  labels: {
    sessions: string;
    conversion: string;
    revenue: string;
    roas: string;
    coverage: string;
  };
};

export const PulseMetricHead = ({
  rollup,
  coveragePct,
  labels,
}: PulseMetricHeadProps) => {
  const metrics = [
    { label: labels.sessions, value: fmtCount(rollup.sessions) },
    { label: labels.conversion, value: fmtPct(rollup.cvr) },
    { label: labels.revenue, value: fmtMoney(rollup.revenue) },
    { label: labels.roas, value: fmtRoas(rollup.revenue, rollup.spend) },
    { label: labels.coverage, value: `${coveragePct}%` },
  ];

  return (
    <div className='grid grid-cols-2 gap-px overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] sm:grid-cols-3 lg:grid-cols-5'>
      {metrics.map(metric => (
        <div
          key={metric.label}
          className='bg-[var(--pv2-paper)] px-4 py-4 md:px-5'
        >
          <p className='text-[10px] font-bold tracking-[0.11em] text-[var(--pv2-faint)] uppercase'>
            {metric.label}
          </p>
          <strong className='mt-1 block font-[family-name:var(--pv2-disp)] text-2xl tracking-[-0.04em] text-[var(--pv2-ink)]'>
            {metric.value}
          </strong>
        </div>
      ))}
    </div>
  );
};
