'use client';

/**
 * Admin — quản lý số liệu quảng cáo. Hệ thống CHƯA đấu API các bên (Meta/
 * Google/TikTok) nên nhân viên Rexer nhập tay số liệu theo khoảng ngày để
 * khách hàng thấy hiệu quả. Wire BE (be-spec-ad-metrics.md §A):
 *   list  GET /portal/ads/campaigns (platform admin → mọi brand)
 *   write PUT /admin/campaigns/{id}/metrics (idempotent theo ngày).
 * Lưu ý gap BE: list campaign chưa lọc theo brand_id & item chưa có brand_name
 * → map brand qua /brands. Xem docs/be-tasks-2026-06-05.md.
 */

import { BarChart3, Loader2, Megaphone, Pencil, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  PortalAdCampaign,
  PortalAdMetricsResponse,
} from '@/services/rexer/types';

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

const STATUS_CHIP: Record<Status, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-muted text-content-muted',
  draft: 'bg-blue-100 text-blue-700',
};

const CHANNEL_LABEL: Record<string, string> = {
  meta: 'Meta',
  facebook: 'Facebook',
  instagram: 'Instagram',
  google: 'Google',
  tiktok: 'TikTok',
};

function toStatus(s: string): Status {
  return s === 'active' || s === 'paused' || s === 'completed' ? s : 'draft';
}

function channelOf(c: PortalAdCampaign): string {
  const ch = (c.channels ?? [])[0] ?? '';
  return CHANNEL_LABEL[ch] ?? (ch ? ch : '—');
}

function metricsFromSummary(m: PortalAdMetricsResponse): {
  metrics: MetricValues;
  from?: string;
  to?: string;
} {
  return {
    metrics: {
      impressions: m.summary.impressions,
      reach: m.summary.reach,
      clicks: m.summary.clicks,
      spend: m.summary.spent_amount,
      conversions: m.summary.conversions,
    },
    from: m.from,
    to: m.to,
  };
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return String(n);
}
function fmtVnd(n: number): string {
  return n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M₫' : fmt(n) + '₫';
}

export function AdminAdMetricsPage() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminCampaign | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [list, brandsRes] = await Promise.all([
          rexerApi.portalAds.listCampaigns({ limit: 100 }),
          rexerApi.brands.list({ limit: 200 }).catch(() => ({ items: [] })),
        ]);
        if (cancelled) return;
        const nameById = new Map(
          (brandsRes.items ?? []).map(b => [b.id, b.name])
        );
        const rows: AdminCampaign[] = (list.items ?? []).map(c => ({
          id: c.id,
          name: c.name,
          brand_name: (c.brand_id && nameById.get(c.brand_id)) || '—',
          status: toStatus(String(c.status)),
          channel: channelOf(c),
          metrics: {
            impressions: c.impressions ?? 0,
            reach: 0, // filled from per-campaign metrics below
            clicks: c.clicks ?? 0,
            spend: c.spent_amount ?? 0,
            conversions: c.conversions ?? 0,
          },
        }));
        setCampaigns(rows);
        setLoading(false);
        // Enrich reach + period from each campaign's metrics summary.
        const enriched = await Promise.all(
          rows.map(async row => {
            try {
              const m = await rexerApi.portalAds.getMetrics(row.id);
              const { metrics, from, to } = metricsFromSummary(m);
              return { ...row, metrics, period_from: from, period_to: to };
            } catch {
              return row;
            }
          })
        );
        if (!cancelled) setCampaigns(enriched);
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleSave = async (id: string, u: MetricsUpdate) => {
    try {
      const res = await rexerApi.portalAds.upsertMetrics(id, {
        from: u.from,
        to: u.to,
        mode: u.mode,
        daily: u.daily,
      });
      const { metrics, from, to } = metricsFromSummary(res);
      setCampaigns(prev =>
        prev.map(c =>
          c.id === id ? { ...c, period_from: from, period_to: to, metrics } : c
        )
      );
      toast.success('Đã lưu số liệu');
    } catch {
      toast.error('Lưu số liệu thất bại');
    }
  };

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

      <div className='mt-3 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-2 text-xs text-sky-800'>
        <span className='mt-0.5 inline-block size-2 shrink-0 rounded-full bg-sky-500' />
        Số liệu nhập tay lưu qua BE (PUT
        /admin/campaigns/&#123;id&#125;/metrics) và hiển thị cho brand ở
        /portal/ads.
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
            {loading ? (
              <tr>
                <td colSpan={8} className='px-4 py-10 text-center'>
                  <span className='text-content-muted inline-flex items-center gap-2 text-xs'>
                    <Loader2 className='size-4 animate-spin' /> Đang tải
                    campaign…
                  </span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className='text-content-muted px-4 py-10 text-center text-xs'
                >
                  Chưa có campaign nào.
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
        Số liệu nhập tay hiển thị cho brand ở /portal/ads (cùng nguồn dữ liệu).
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
