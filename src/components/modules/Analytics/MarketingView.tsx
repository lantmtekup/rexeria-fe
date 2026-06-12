'use client';

/**
 * View Marketing (spec §4) theo style mockup 2026-06-12: 4 metric tile có
 * icon + hint mono, chart visits theo ngày (area indigo), nguồn traffic dạng
 * progress bar màu theo kênh, CTR theo block dạng bar chart (top-2 đậm).
 */

import { Eye, Sparkles, Timer, Wallet } from 'lucide-react';

import { cn } from '@/lib/cn';

import { AreaChart, Card, MetricTile } from './dashboard-bits';
import type { DateRange, DemoAnalytics } from './funnel-demo';

const fmt = (n: number) => n.toLocaleString('vi-VN');

/** 41560s → "11h 33m" · 95s → "1m 35s" · 48s → "48s". */
function fmtDuration(sec: number): string {
  if (sec >= 3600) {
    const h = Math.floor(sec / 3600);
    return `${h}h ${Math.round((sec % 3600) / 60)}m`;
  }
  if (sec >= 60) return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
  return `${Math.round(sec)}s`;
}

const RANGE_LABEL: Record<DateRange, string> = {
  '7d': '7 ngày',
  '30d': '30 ngày',
  '90d': '90 ngày',
};

// Palette bar nguồn traffic theo thứ hạng (đậm → nhạt như mockup).
const SOURCE_COLORS = [
  'bg-orange-500',
  'bg-indigo-600',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-zinc-400',
];

export function MarketingView({
  data,
  range,
}: {
  data: DemoAnalytics;
  range: DateRange;
}) {
  const {
    funnel,
    sources,
    blocks,
    visitsByDay,
    visitsDeltaPct,
    leadsAB,
    avgSessionSec,
  } = data;

  return (
    <div className='flex flex-col gap-4'>
      <div className='grid grid-cols-2 gap-4 xl:grid-cols-4'>
        <MetricTile
          icon={Eye}
          label='Lượt truy cập'
          value={fmt(funnel.visits)}
          hint={`${visitsDeltaPct >= 0 ? '+' : ''}${visitsDeltaPct}% so với kỳ trước`}
          hintTone={visitsDeltaPct >= 0 ? 'positive' : 'muted'}
        />
        <MetricTile
          icon={Sparkles}
          label='Tỷ lệ chuyển đổi'
          value={
            funnel.visits > 0
              ? `${((funnel.leads / funnel.visits) * 100).toFixed(1)}%`
              : '—'
          }
          hint='visit → lead'
        />
        <MetricTile
          icon={Wallet}
          label='Lead tạo ra'
          value={fmt(funnel.leads)}
          hint={`A: ${fmt(leadsAB.a)} · B: ${fmt(leadsAB.b)}`}
        />
        <MetricTile
          icon={Timer}
          label='Thời gian TB / phiên'
          value={fmtDuration(avgSessionSec)}
          hint={`Σ ${fmtDuration(avgSessionSec * funnel.visits)} toàn trang`}
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-3'>
        <Card
          title='Lượt truy cập theo ngày'
          tag={RANGE_LABEL[range]}
          className='xl:col-span-2'
        >
          <AreaChart series={visitsByDay} />
        </Card>
        <Card title='Nguồn traffic' tag='channel'>
          <SourceBars sources={sources} totalVisits={funnel.visits} />
        </Card>
      </div>

      <Card title='Block nào kéo click? (CTR theo block)' tag='tối ưu trang'>
        <CtrBars blocks={blocks} />
      </Card>
    </div>
  );
}

function SourceBars({
  sources,
  totalVisits,
}: {
  sources: DemoAnalytics['sources'];
  totalVisits: number;
}) {
  const sorted = [...sources].sort((a, b) => b.visits - a.visits);
  return (
    <ul className='flex flex-col gap-4'>
      {sorted.map((s, i) => {
        const share = totalVisits > 0 ? (s.visits / totalVisits) * 100 : 0;
        return (
          <li key={s.source}>
            <div className='mb-1.5 flex items-baseline justify-between'>
              <span className='text-foreground text-sm font-medium'>
                {s.source}
              </span>
              <span className='text-content-muted font-mono text-xs'>
                {fmt(s.visits)} · {Math.round(share)}%
              </span>
            </div>
            <div className='bg-muted h-2 overflow-hidden rounded-full'>
              <div
                className={cn('h-full rounded-full', SOURCE_COLORS[i])}
                style={{ width: `${Math.max(share, 2)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CtrBars({ blocks }: { blocks: DemoAnalytics['blocks'] }) {
  const rows = blocks
    .map(b => ({ ...b, ctr: b.views > 0 ? (b.clicks / b.views) * 100 : 0 }))
    .sort((a, b) => b.ctr - a.ctr);
  const maxCtr = Math.max(...rows.map(r => r.ctr), 1);
  return (
    <div className='grid auto-cols-fr grid-flow-col items-end gap-4 px-2 pt-2'>
      {rows.map((r, i) => (
        <div key={r.block} className='flex flex-col items-center gap-2'>
          <span className='text-content-muted font-mono text-xs'>
            {r.ctr.toFixed(1)}%
          </span>
          <div
            className={cn(
              'w-full max-w-24 rounded-t-lg',
              i < 2 ? 'bg-indigo-600' : 'bg-indigo-200'
            )}
            style={{ height: `${Math.max((r.ctr / maxCtr) * 160, 8)}px` }}
          />
          <div className='text-center'>
            <p className='text-foreground text-xs font-medium'>{r.block}</p>
            {/* Tổng dwell time của block + trung bình mỗi lượt xem */}
            <p className='text-muted-foreground text-2xs font-mono'>
              Σ {fmtDuration(r.dwellSec)} ·{' '}
              {r.views > 0 ? fmtDuration(r.dwellSec / r.views) : '—'}/view
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
