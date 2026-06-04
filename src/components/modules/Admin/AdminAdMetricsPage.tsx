'use client';

/**
 * Admin — quản lý số liệu quảng cáo. Hệ thống CHƯA đấu API các bên (Meta/
 * Google/TikTok) nên nhân viên Rexer nhập tay số liệu theo khoảng ngày để
 * khách hàng thấy hiệu quả. Hiện local demo; khi BE ship endpoint ghi metrics
 * (xem docs/be-spec-ad-metrics.md) sẽ wire thật.
 */

import { BarChart3, Megaphone, Pencil, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/cn';

import {
  UpdateMetricsDialog,
  type MetricValues,
  type MetricsUpdate,
} from './ads/_UpdateMetricsDialog';

type Status = 'draft' | 'active' | 'paused' | 'completed';

interface AdminCampaign {
  id: string;
  name: string;
  brand_name: string;
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

const SEED: AdminCampaign[] = [
  {
    id: 'cmp_01',
    name: 'Coca Tết 2026 — Awareness',
    brand_name: 'ACME Beverage Group',
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
    name: 'Fanta Summer — Conversion',
    brand_name: 'ACME Beverage Group',
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
    brand_name: 'ACME Beverage Group',
    status: 'draft',
    channel: 'Meta',
    metrics: { ...Z },
  },
  {
    id: 'cmp_04',
    name: 'Tekup Payroll — Launch',
    brand_name: 'Tekup JSC',
    status: 'active',
    channel: 'Google',
    period_from: '2026-05-01',
    period_to: '2026-05-31',
    metrics: {
      impressions: 284_120,
      reach: 198_200,
      clicks: 12_400,
      spend: 42_180_000,
      conversions: 624,
    },
  },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return String(n);
}
function fmtVnd(n: number): string {
  return n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M₫' : fmt(n) + '₫';
}

export function AdminAdMetricsPage() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>(SEED);
  const [brand, setBrand] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminCampaign | null>(null);

  const brands = useMemo(
    () => Array.from(new Set(campaigns.map(c => c.brand_name))),
    [campaigns]
  );

  const filtered = campaigns.filter(c => {
    if (brand !== 'all' && c.brand_name !== brand) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const handleSave = (id: string, u: MetricsUpdate) =>
    setCampaigns(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              period_from: u.from,
              period_to: u.to,
              metrics: u.total,
            }
          : c
      )
    );

  return (
    <div className='mx-auto w-full max-w-6xl px-6 py-6'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <div className='text-content-muted text-2xs flex items-center gap-2 font-semibold tracking-wider uppercase'>
            <Megaphone className='size-3' /> Quảng cáo
          </div>
          <h1 className='mt-1 text-xl font-semibold'>Số liệu quảng cáo</h1>
          <p className='text-content-muted mt-0.5 text-xs'>
            Chưa đấu API Meta/Google/TikTok — nhân viên Rexer nhập tay số liệu
            theo khoảng ngày cho khách hàng thấy hiệu quả.
          </p>
        </div>
      </div>

      <div className='mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-800'>
        <span className='mt-0.5 inline-block size-2 shrink-0 rounded-full bg-amber-500' />
        Local demo — BE chưa ship endpoint ghi metrics. Số liệu nhập chỉ tồn tại
        trong session (xem docs/be-spec-ad-metrics.md).
      </div>

      {/* Filter */}
      <div className='border-border mt-4 flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3 shadow-sm'>
        <div className='border-border bg-muted flex flex-1 items-center gap-2 rounded-lg border px-3 py-1.5 lg:max-w-xs'>
          <Search className='text-content-muted size-3.5' />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Tìm campaign…'
            className='placeholder:text-content-muted flex-1 bg-transparent text-sm outline-none'
          />
        </div>
        <select
          value={brand}
          onChange={e => setBrand(e.target.value)}
          className='border-border rounded-lg border bg-white px-3 py-1.5 text-sm outline-none'
        >
          <option value='all'>Tất cả brand</option>
          {brands.map(b => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className='border-border mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm'>
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
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className='text-content-muted px-4 py-10 text-center text-xs'
                >
                  Không có campaign nào khớp.
                </td>
              </tr>
            ) : (
              filtered.map(c => {
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
                        <span>· {c.brand_name}</span>
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
                        onClick={() => setEditing(c)}
                        className='border-border text-content-muted hover:border-foreground hover:text-foreground inline-flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1 text-xs font-medium'
                      >
                        <Pencil className='size-3' /> Cập nhật
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className='text-content-muted text-3xs mt-3 flex items-center gap-1.5'>
        <BarChart3 className='size-3' />
        Số liệu nhập tay sẽ hiển thị cho brand ở /portal/ads (cùng nguồn khi BE
        wire).
      </p>

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
