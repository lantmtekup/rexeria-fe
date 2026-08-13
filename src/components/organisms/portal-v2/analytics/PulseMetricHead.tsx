import {
  fmtCount,
  fmtMoney,
  fmtPct,
  fmtRoas,
} from '@/lib/portal-v2/analytics/helpers';
import type { PulseRollup } from '@/lib/portal-v2/analytics/types';

type PulseMetricHeadProps = {
  rollup: PulseRollup;
  /** `null` = chưa đọc được độ phủ; ô hiện "—" chứ không phải 0%. */
  coveragePct: number | null;
  /**
   * Lát cắt không có đối tượng nào chốt trên nền tảng (mode lead/booking) ⇒
   * doanh thu CHƯA TỪNG ĐO. Khác "bán được 0đ", nên ô hiện "—" và ROAS tắt
   * theo — một tỷ số có tử số bịa thì mẫu số đúng cũng vô nghĩa.
   */
  revenueUnmeasured?: boolean;
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
  revenueUnmeasured = false,
  labels,
}: PulseMetricHeadProps) => {
  const metrics = [
    { label: labels.sessions, value: fmtCount(rollup.sessions) },
    { label: labels.conversion, value: fmtPct(rollup.cvr) },
    {
      label: labels.revenue,
      value: revenueUnmeasured ? '—' : fmtMoney(rollup.revenue),
    },
    {
      label: labels.roas,
      value: revenueUnmeasured ? '—' : fmtRoas(rollup.revenue, rollup.spend),
    },
    {
      label: labels.coverage,
      value: coveragePct == null ? '—' : `${coveragePct}%`,
    },
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
