'use client';

/**
 * Tab "Quảng cáo" trong màn quản lý khách hàng. Mirror /portal/ads nhưng
 * staff-facing & scope theo brand đang xem. Nhân viên Rexer nhập tay metrics
 * campaign (chưa đấu API Meta/Google/TikTok) qua PUT /admin/campaigns/{id}/
 * metrics — tái dùng UpdateMetricsDialog.
 *
 * ⚠️ Gap BE: GET /portal/ads/campaigns chưa nhận ?brand_id (platform admin lấy
 * mọi brand) nên ở đây phải lọc client-side theo brand_id === clientId. Tạo
 * campaign cho brand khác cũng chưa có endpoint staff → chỉ sửa metrics.
 * Xem docs/be-tasks-2026-06-05.md.
 */

import * as React from 'react';
import { Loader2, Megaphone, Pencil } from 'lucide-react';
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

function toCampaign(c: PortalAdCampaign): Campaign {
  return {
    id: c.id,
    name: c.name,
    status: toStatus(String(c.status)),
    channel: channelOf(c),
    metrics: {
      impressions: c.impressions ?? 0,
      reach: 0,
      clicks: c.clicks ?? 0,
      spend: c.spent_amount ?? 0,
      conversions: c.conversions ?? 0,
    },
  };
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

export function AdsTab({
  clientId,
  onCount,
}: {
  clientId: string;
  onCount: (n: number) => void;
}) {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Campaign | null>(null);

  const onCountRef = React.useRef(onCount);
  onCountRef.current = onCount;
  React.useEffect(() => {
    onCountRef.current(campaigns.length);
  }, [campaigns.length]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await rexerApi.portalAds.listCampaigns({ limit: 100 });
        // BE gap: no ?brand_id filter → scope client-side to this brand.
        const mine = (list.items ?? []).filter(c => c.brand_id === clientId);
        if (cancelled) return;
        const rows = mine.map(toCampaign);
        setCampaigns(rows);
        setLoading(false);
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
  }, [clientId]);

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
    <div>
      <div className='border-border border-b px-4 py-3'>
        <div className='text-content-muted text-xs'>
          Chưa đấu API quảng cáo — nhân viên Rexer nhập tay metrics theo khoảng
          ngày cho khách thấy hiệu quả. Campaign do brand tạo ở portal; staff
          cập nhật số liệu.
        </div>
      </div>

      {loading ? (
        <div className='text-content-muted flex items-center justify-center gap-2 px-4 py-10 text-sm'>
          <Loader2 className='size-4 animate-spin' /> Đang tải campaign…
        </div>
      ) : campaigns.length === 0 ? (
        <div className='text-content-muted px-4 py-10 text-center text-sm'>
          Brand này chưa có campaign nào.
        </div>
      ) : (
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
      )}

      <div className='text-content-muted text-3xs flex items-center gap-1.5 px-4 py-3'>
        <Megaphone className='size-3' />
        Số liệu nhập tay hiển thị cho brand ở /portal/ads (cùng nguồn dữ liệu).
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
