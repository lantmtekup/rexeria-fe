import { LiftPill } from '@/components/organisms/portal-v2/campaigns/detail/VerdictStats';
import { fmtCount, fmtPct } from '@/lib/portal-v2/analytics/helpers';
import type { ChannelMixRow } from '@/lib/portal-v2/analytics/types';

type ChannelMixChartProps = {
  rows: ChannelMixRow[];
};

export const ChannelMixChart = ({ rows }: ChannelMixChartProps) => {
  if (!rows.length) return null;
  const maximum = rows[0]?.sessions || 1;

  return (
    <div className='flex flex-col gap-2.5'>
      {rows.map(row => (
        <div
          key={row.channel}
          className='grid grid-cols-[minmax(88px,1fr)_minmax(120px,2fr)_auto_auto] items-center gap-3'
        >
          <span className='truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
            {row.channel}
          </span>
          <span className='h-2 overflow-hidden rounded-full bg-[var(--pv2-canvas)]'>
            <span
              className='block h-full rounded-full bg-[var(--pv2-electric)]'
              style={{
                width: `${Math.max(3, Math.round((row.sessions / maximum) * 100))}%`,
              }}
            />
          </span>
          <span className='text-[12px] text-[var(--pv2-mut)] tabular-nums'>
            {fmtCount(row.sessions)}
          </span>
          <span className='flex items-center gap-2 text-[12px] text-[var(--pv2-mut)]'>
            {fmtPct(row.cvr)} cvr
            <LiftPill lift={row.lift} />
          </span>
        </div>
      ))}
    </div>
  );
};
