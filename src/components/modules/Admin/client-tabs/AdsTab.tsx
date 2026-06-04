'use client';

/**
 * Tab "Quảng cáo" trong màn quản lý khách hàng. Mirror /portal/ads nhưng
 * staff-facing & scope theo brand đang xem. Nhân viên Rexer nhập tay metrics
 * campaign (chưa đấu API Meta/Google/TikTok) — tái dùng UpdateMetricsDialog.
 * Local demo; spec ghi thật ở docs/be-spec-ad-metrics.md.
 */

import * as React from 'react';
import { Megaphone, Pencil, Plus } from 'lucide-react';

import { cn } from '@/lib/cn';

import {
  UpdateMetricsDialog,
  type MetricValues,
  type MetricsUpdate,
} from '../ads/_UpdateMetricsDialog';

type Status = 'draft' | 'active' | 'paused' | 'completed';

interface Campaign {
  id: string;
  name: string;
  status: Status;
  channel: string;
  period_from?: string;
  period_to?: string;
  metrics: MetricValues;
}

const Z: MetricValues = {
  impressions: 0,
  reach: 0,
  clicks: 0,
  spend: 0,
  conversions: 0,
};

const STATUS_CHIP: Record<Status, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-muted text-content-muted',
  draft: 'bg-blue-100 text-blue-700',
};

function seedFor(brandName: string): Campaign[] {
  return [
    {
      id: 'cmp_01',
      name: `${brandName} — Awareness`,
      status: 'active',
      channel: 'Meta',
      period_from: '2026-05-20',
      period_to: '2026-06-03',
      metrics: {
        impressions: 1_245_820,
        reach: 482_140,
        clicks: 24_812,
        spend: 184_500_000,
        conversions: 1_240,
      },
    },
    {
      id: 'cmp_02',
      name: `${brandName} — Conversion`,
      status: 'paused',
      channel: 'TikTok',
      period_from: '2026-04-01',
      period_to: '2026-04-30',
      metrics: {
        impressions: 612_400,
        reach: 248_120,
        clicks: 18_402,
        spend: 98_400_000,
        conversions: 1_840,
      },
    },
    {
      id: 'cmp_03',
      name: 'Compain 01',
      status: 'draft',
      channel: 'Meta',
      metrics: { ...Z },
    },
  ];
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return String(n);
}
function fmtVnd(n: number): string {
  return n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M₫' : fmt(n) + '₫';
}

export function AdsTab({
  brandName,
  onCount,
}: {
  brandName: string;
  onCount: (n: number) => void;
}) {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>(() =>
    seedFor(brandName)
  );
  const [editing, setEditing] = React.useState<Campaign | null>(null);

  const onCountRef = React.useRef(onCount);
  onCountRef.current = onCount;
  React.useEffect(() => {
    onCountRef.current(campaigns.length);
  }, [campaigns.length]);

  const handleSave = (id: string, u: MetricsUpdate) =>
    setCampaigns(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, period_from: u.from, period_to: u.to, metrics: u.total }
          : c
      )
    );

  const addBlank = () =>
    setCampaigns(prev => [
      ...prev,
      {
        id: `cmp_${prev.length + 1}_${prev.length}`,
        name: `Campaign ${prev.length + 1}`,
        status: 'draft',
        channel: 'Meta',
        metrics: { ...Z },
      },
    ]);

  return (
    <div>
      <div className='border-border flex items-center justify-between border-b px-4 py-3'>
        <div className='text-content-muted text-xs'>
          Chưa đấu API quảng cáo — nhân viên Rexer nhập tay metrics theo khoảng
          ngày cho khách thấy hiệu quả.
        </div>
        <button
          type='button'
          onClick={addBlank}
          className='inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700'
        >
          <Plus className='size-3.5' /> Thêm campaign
        </button>
      </div>

      <table className='w-full text-sm'>
        <thead>
          <tr className='border-border text-content-muted text-2xs border-b text-left tracking-wider uppercase'>
            <th className='px-4 py-2.5 font-semibold'>Campaign</th>
            <th className='px-3 py-2.5 font-semibold'>Khoảng</th>
            <th className='px-3 py-2.5 text-right font-semibold'>Imp</th>
            <th className='px-3 py-2.5 text-right font-semibold'>Clicks</th>
            <th className='px-3 py-2.5 text-right font-semibold'>CTR</th>
            <th className='px-3 py-2.5 text-right font-semibold'>Spend</th>
            <th className='px-3 py-2.5 text-right font-semibold'>Conv</th>
            <th className='px-3 py-2.5' />
          </tr>
        </thead>
        <tbody>
          {campaigns.map(c => {
            const m = c.metrics;
            const ctr = m.impressions
              ? ((m.clicks / m.impressions) * 100).toFixed(2)
              : '0.00';
            return (
              <tr
                key={c.id}
                className='border-border/60 hover:bg-muted/40 border-b last:border-0'
              >
                <td className='px-4 py-2.5'>
                  <div className='font-medium'>{c.name}</div>
                  <div className='text-content-muted text-3xs mt-0.5 flex items-center gap-1.5'>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 font-bold',
                        STATUS_CHIP[c.status]
                      )}
                    >
                      {c.status}
                    </span>
                    <span>· {c.channel}</span>
                  </div>
                </td>
                <td className='text-content-muted text-3xs px-3 py-2.5 font-mono'>
                  {c.period_from
                    ? `${c.period_from.slice(5)} → ${c.period_to?.slice(5)}`
                    : '—'}
                </td>
                <td className='px-3 py-2.5 text-right font-mono'>
                  {fmt(m.impressions)}
                </td>
                <td className='px-3 py-2.5 text-right font-mono'>
                  {fmt(m.clicks)}
                </td>
                <td className='text-content-muted px-3 py-2.5 text-right font-mono'>
                  {ctr}%
                </td>
                <td className='px-3 py-2.5 text-right font-mono font-semibold'>
                  {fmtVnd(m.spend)}
                </td>
                <td className='px-3 py-2.5 text-right font-mono'>
                  {fmt(m.conversions)}
                </td>
                <td className='px-3 py-2.5 text-right'>
                  <button
                    type='button'
                    onClick={() => setEditing(c)}
                    className='border-border text-content-muted hover:border-foreground hover:text-foreground inline-flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1 text-xs font-medium'
                  >
                    <Pencil className='size-3' /> Cập nhật
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className='text-content-muted text-3xs flex items-center gap-1.5 px-4 py-3'>
        <Megaphone className='size-3' />
        Số liệu nhập tay sẽ hiển thị cho brand ở /portal/ads (cùng nguồn khi BE
        wire).
      </div>

      <UpdateMetricsDialog
        open={!!editing}
        campaignName={editing?.name ?? ''}
        initial={{ from: editing?.period_from, to: editing?.period_to }}
        onOpenChange={o => !o && setEditing(null)}
        onSave={u => editing && handleSave(editing.id, u)}
      />
    </div>
  );
}
