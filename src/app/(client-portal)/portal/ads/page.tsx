'use client';

import {
  Activity,
  CircleDollarSign,
  Eye,
  Facebook,
  Globe2,
  Instagram,
  Megaphone,
  MousePointerClick,
  Plus,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { rexerApi } from '@/services/rexer/endpoints';
import type { PortalAdCampaign } from '@/services/rexer/types';

import { fmtFull, fmtNum } from '../_data';
import { PortalShell } from '../_shell';
import { CreateCampaignDialog } from './_CreateCampaignDialog';

const CHANNEL_TO_PLATFORM: Record<string, Platform> = {
  meta: 'facebook',
  facebook: 'facebook',
  instagram: 'instagram',
  google: 'google',
  tiktok: 'tiktok',
};

function beCampaignToLocal(c: PortalAdCampaign): Campaign {
  const platform =
    CHANNEL_TO_PLATFORM[(c.channels ?? [])[0] ?? ''] ?? 'facebook';
  const status: Campaign['status'] =
    c.status === 'active'
      ? 'active'
      : c.status === 'paused'
        ? 'paused'
        : c.status === 'completed'
          ? 'ended'
          : 'draft';
  return {
    id: c.id,
    name: c.name,
    platform,
    objective: c.objective ?? '—',
    status,
    impressions: c.impressions ?? 0,
    reach: 0,
    clicks: c.clicks ?? 0,
    spend_vnd: c.spent_amount ?? 0,
    conversions: c.conversions ?? 0,
    trend: [],
    template_id: c.landing_template_id,
  };
}

/* ---------- fake data ---------- */

type Platform = 'facebook' | 'instagram' | 'google' | 'tiktok';

const PLATFORM_META: Record<
  Platform,
  { label: string; color: string; icon: LucideIcon }
> = {
  facebook: { label: 'Facebook', color: 'bg-blue-600', icon: Facebook },
  instagram: { label: 'Instagram', color: 'bg-pink-500', icon: Instagram },
  google: { label: 'Google Ads', color: 'bg-emerald-600', icon: Globe2 },
  tiktok: { label: 'TikTok', color: 'bg-zinc-900', icon: Activity },
};

type Campaign = {
  id: string;
  name: string;
  platform: Platform;
  objective: string;
  status: 'active' | 'paused' | 'ended' | 'draft';
  impressions: number;
  reach: number;
  clicks: number;
  spend_vnd: number;
  conversions: number;
  trend: number[]; // 14d daily spend
  template_id?: string;
};

const STATUS_META: Record<
  Campaign['status'],
  { label: string; chip: string; dot: string }
> = {
  active: {
    label: 'Active',
    chip: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  paused: {
    label: 'Paused',
    chip: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  ended: {
    label: 'Ended',
    chip: 'bg-zinc-100 text-zinc-600',
    dot: 'bg-zinc-400',
  },
  draft: {
    label: 'Draft',
    chip: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
  },
};

const FAKE_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp_tet_fb',
    name: 'Coca-Cola Tết 2026 — Brand awareness',
    platform: 'facebook',
    objective: 'Awareness',
    status: 'active',
    impressions: 1_245_820,
    reach: 482_140,
    clicks: 24_812,
    spend_vnd: 184_500_000,
    conversions: 1_240,
    trend: [12, 14, 18, 22, 19, 26, 31, 28, 34, 38, 42, 36, 40, 45],
    template_id: 'tpl_01',
  },
  {
    id: 'cmp_tet_ig',
    name: 'Coca-Cola Tết 2026 — Reels',
    platform: 'instagram',
    objective: 'Engagement',
    status: 'active',
    impressions: 884_120,
    reach: 320_400,
    clicks: 18_240,
    spend_vnd: 132_800_000,
    conversions: 980,
    trend: [8, 10, 14, 18, 22, 24, 28, 31, 34, 38, 36, 32, 38, 42],
    template_id: 'tpl_01',
  },
  {
    id: 'cmp_zero_fb',
    name: 'Coca-Cola Zero Sugar — Sport',
    platform: 'facebook',
    objective: 'Conversion',
    status: 'active',
    impressions: 612_400,
    reach: 248_120,
    clicks: 18_402,
    spend_vnd: 98_400_000,
    conversions: 1_840,
    trend: [14, 18, 22, 24, 28, 26, 30, 32, 28, 24, 26, 30, 28, 32],
    template_id: 'tpl_02',
  },
  {
    id: 'cmp_fanta_tiktok',
    name: 'Fanta Watermelon — Summer challenge',
    platform: 'tiktok',
    objective: 'Engagement',
    status: 'active',
    impressions: 2_140_000,
    reach: 920_400,
    clicks: 42_184,
    spend_vnd: 78_200_000,
    conversions: 2_410,
    trend: [22, 26, 32, 38, 44, 52, 58, 62, 68, 74, 72, 68, 70, 74],
    template_id: 'tpl_03',
  },
  {
    id: 'cmp_sprite_google',
    name: 'Sprite Lemon — Search retargeting',
    platform: 'google',
    objective: 'Traffic',
    status: 'paused',
    impressions: 284_120,
    reach: 198_200,
    clicks: 12_400,
    spend_vnd: 42_180_000,
    conversions: 624,
    trend: [18, 22, 24, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8],
    template_id: 'tpl_04',
  },
  {
    id: 'cmp_olympic',
    name: 'Olympic 2026 Edition — Teaser',
    platform: 'instagram',
    objective: 'Awareness',
    status: 'draft',
    impressions: 0,
    reach: 0,
    clicks: 0,
    spend_vnd: 0,
    conversions: 0,
    trend: Array(14).fill(0),
    template_id: 'tpl_05',
  },
  {
    id: 'cmp_mochau_done',
    name: 'Mộc Châu Festival — Done',
    platform: 'facebook',
    objective: 'Conversion',
    status: 'ended',
    impressions: 421_800,
    reach: 184_200,
    clicks: 14_812,
    spend_vnd: 52_400_000,
    conversions: 1_410,
    trend: [42, 44, 38, 32, 28, 22, 18, 14, 10, 8, 6, 4, 2, 0],
  },
];

/* ---------- page ---------- */

type StatusFilter = 'all' | Campaign['status'];
type PlatformFilter = 'all' | Platform;

export default function PortalAdsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [campaigns, setCampaigns] = useState<Campaign[]>(FAKE_CAMPAIGNS);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    rexerApi.portalAds
      .listCampaigns({ limit: 50 })
      .then(res => {
        if (cancelled) return;
        if (res.items && res.items.length > 0) {
          setCampaigns(res.items.map(beCampaignToLocal));
        }
      })
      .catch(() => {
        // keep FAKE fallback silently when BE rejects (e.g. admin no scope)
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = campaigns.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
    return true;
  });

  const totals = useMemo(() => {
    const active = filtered.filter(c => c.status === 'active');
    const sum = filtered.reduce(
      (acc, c) => ({
        impressions: acc.impressions + c.impressions,
        reach: acc.reach + c.reach,
        clicks: acc.clicks + c.clicks,
        spend: acc.spend + c.spend_vnd,
        conversions: acc.conversions + c.conversions,
      }),
      { impressions: 0, reach: 0, clicks: 0, spend: 0, conversions: 0 }
    );
    const ctr = sum.impressions ? (sum.clicks / sum.impressions) * 100 : 0;
    const cpc = sum.clicks ? sum.spend / sum.clicks : 0;
    const cpm = sum.impressions ? (sum.spend / sum.impressions) * 1000 : 0;
    const roas = sum.spend ? (sum.conversions * 250_000) / sum.spend : 0; // assume 250k VND per conversion
    return { ...sum, ctr, cpc, cpm, roas, active_count: active.length };
  }, [filtered]);

  // 14-day aggregate spend (sum trend)
  const trend = useMemo(() => {
    const t = Array(14).fill(0);
    for (const c of filtered) {
      c.trend.forEach((v, i) => {
        t[i] += v;
      });
    }
    return t;
  }, [filtered]);

  return (
    <PortalShell>
      {/* Header */}
      <section className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
            <Megaphone className='size-3' /> Quảng cáo · 14 ngày qua
          </div>
          <h1 className='mt-1 text-2xl font-bold tracking-tight'>
            Performance quảng cáo
          </h1>
          <p className='mt-1 text-[13px] text-zinc-500'>
            {totals.active_count} campaign đang chạy trên 4 nền tảng. Spend{' '}
            <strong>{(totals.spend / 1_000_000).toFixed(1)}M VND</strong> trong
            14 ngày.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button className='flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100'>
            <RefreshCw className='size-3.5' /> Sync FB Ads
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className='flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700'
          >
            <Plus className='size-3.5' /> Tạo campaign
          </button>
        </div>
      </section>

      <CreateCampaignDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={c => setCampaigns(prev => [beCampaignToLocal(c), ...prev])}
      />

      <div className='mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-[12px] text-amber-800'>
        <span className='mt-0.5 inline-block size-2 shrink-0 rounded-full bg-amber-500' />
        <div>
          <span className='font-semibold'>UI Demo · Fake data</span>
          <span className='ml-2 text-amber-700'>
            — Cần tích hợp Meta Marketing API + Google Ads API + TikTok Ads API
            (BE chưa có).
          </span>
        </div>
      </div>

      {/* KPI grid 8 cards */}
      <div className='mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <KpiCard
          icon={CircleDollarSign}
          label='Chi tiêu'
          value={`${(totals.spend / 1_000_000).toFixed(1)}M`}
          subValue={`${fmtFull(totals.spend)}₫`}
          accent='rose'
        />
        <KpiCard
          icon={Eye}
          label='Impressions'
          value={fmtNum(totals.impressions)}
          subValue={fmtFull(totals.impressions)}
          accent='blue'
        />
        <KpiCard
          icon={Users}
          label='Reach'
          value={fmtNum(totals.reach)}
          subValue={fmtFull(totals.reach)}
          accent='emerald'
        />
        <KpiCard
          icon={MousePointerClick}
          label='Clicks'
          value={fmtNum(totals.clicks)}
          subValue={fmtFull(totals.clicks)}
          accent='amber'
        />
        <KpiCard
          icon={TrendingUp}
          label='CTR'
          value={`${totals.ctr.toFixed(2)}%`}
          subValue='click / impression'
          accent='violet'
        />
        <KpiCard
          icon={Zap}
          label='CPC'
          value={`${Math.round(totals.cpc).toLocaleString('vi-VN')}₫`}
          subValue='cost / click'
          accent='cyan'
        />
        <KpiCard
          icon={Target}
          label='CPM'
          value={`${Math.round(totals.cpm).toLocaleString('vi-VN')}₫`}
          subValue='cost / 1K impressions'
          accent='indigo'
        />
        <KpiCard
          icon={Activity}
          label='ROAS'
          value={`${totals.roas.toFixed(2)}x`}
          subValue={`${fmtFull(totals.conversions)} conversions`}
          accent='orange'
        />
      </div>

      {/* Spend trend chart */}
      <section className='mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm'>
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm'>
              <TrendingUp className='size-4' />
            </div>
            <div>
              <h3 className='text-sm font-semibold'>Spend 14 ngày qua</h3>
              <p className='text-[11px] text-zinc-500'>
                Tổng cộng tất cả campaign
              </p>
            </div>
          </div>
          <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700'>
            ↗ +24.8%
          </span>
        </div>
        <BarChart values={trend} />
      </section>

      {/* Filter bar */}
      <div className='mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm'>
        <span className='text-[10px] font-semibold tracking-wider text-zinc-500 uppercase'>
          Status
        </span>
        <div className='flex flex-wrap gap-1'>
          <FilterBtn
            label={`Tất cả · ${campaigns.length}`}
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          {(['active', 'paused', 'ended', 'draft'] as const).map(s => {
            const m = STATUS_META[s];
            const c = campaigns.filter(x => x.status === s).length;
            return (
              <FilterBtn
                key={s}
                label={`${m.label} · ${c}`}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                color={m.dot}
              />
            );
          })}
        </div>
        <span className='ml-3 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase'>
          Platform
        </span>
        <div className='flex flex-wrap gap-1'>
          <FilterBtn
            label='Tất cả'
            active={platformFilter === 'all'}
            onClick={() => setPlatformFilter('all')}
          />
          {(['facebook', 'instagram', 'google', 'tiktok'] as const).map(p => {
            const m = PLATFORM_META[p];
            const Icon = m.icon;
            return (
              <FilterBtn
                key={p}
                label={m.label}
                active={platformFilter === p}
                onClick={() => setPlatformFilter(p)}
                icon={Icon}
                color={m.color}
              />
            );
          })}
        </div>
      </div>

      {/* Campaigns table */}
      <div className='mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm'>
        <div className='border-b border-zinc-100 px-5 py-3'>
          <h2 className='text-sm font-semibold'>
            Campaigns ({filtered.length})
          </h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b border-zinc-100 bg-zinc-50'>
              <tr className='text-left text-[10px] font-semibold tracking-wider text-zinc-500 uppercase'>
                <th className='px-4 py-2.5'>Campaign</th>
                <th className='px-3 py-2.5 text-right'>Imp</th>
                <th className='px-3 py-2.5 text-right'>Reach</th>
                <th className='px-3 py-2.5 text-right'>Clicks</th>
                <th className='px-3 py-2.5 text-right'>CTR</th>
                <th className='px-3 py-2.5 text-right'>Spend</th>
                <th className='px-3 py-2.5 text-right'>Conv</th>
                <th className='px-3 py-2.5'>Trend</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className='px-5 py-10 text-center text-sm text-zinc-500'
                  >
                    Không có campaign nào khớp filter.
                  </td>
                </tr>
              ) : (
                filtered.map(c => <CampaignRow key={c.id} c={c} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}

/* ---------- subcomponents ---------- */

const ACCENT_MAP: Record<
  string,
  { bg: string; gradient: string; text: string }
> = {
  rose: { bg: 'bg-rose-500', gradient: 'from-rose-50', text: 'text-rose-600' },
  blue: { bg: 'bg-blue-500', gradient: 'from-blue-50', text: 'text-blue-600' },
  emerald: {
    bg: 'bg-emerald-500',
    gradient: 'from-emerald-50',
    text: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-500',
    gradient: 'from-amber-50',
    text: 'text-amber-600',
  },
  violet: {
    bg: 'bg-violet-500',
    gradient: 'from-violet-50',
    text: 'text-violet-600',
  },
  cyan: { bg: 'bg-cyan-500', gradient: 'from-cyan-50', text: 'text-cyan-600' },
  indigo: {
    bg: 'bg-indigo-500',
    gradient: 'from-indigo-50',
    text: 'text-indigo-600',
  },
  orange: {
    bg: 'bg-orange-500',
    gradient: 'from-orange-50',
    text: 'text-orange-600',
  },
};

function KpiCard({
  icon: Icon,
  label,
  value,
  subValue,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  accent: string;
}) {
  const c = ACCENT_MAP[accent];
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br ${c.gradient} to-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div
        className={`flex size-9 items-center justify-center rounded-xl ${c.bg} text-white shadow-sm transition-transform group-hover:scale-110`}
      >
        <Icon className='size-[18px]' />
      </div>
      <div className='mt-3 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase'>
        {label}
      </div>
      <div className='mt-0.5 font-mono text-2xl font-bold text-zinc-900'>
        {value}
      </div>
      {subValue && (
        <div className='mt-0.5 truncate font-mono text-[10px] text-zinc-400'>
          {subValue}
        </div>
      )}
    </div>
  );
}

function FilterBtn({
  label,
  active,
  onClick,
  icon: Icon,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
        active
          ? `${color ?? 'bg-zinc-900'} text-white shadow-sm`
          : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
      }`}
    >
      {Icon ? (
        <Icon className='size-3' />
      ) : color && !active ? (
        <span className={`size-1.5 rounded-full ${color}`} />
      ) : null}
      {label}
    </button>
  );
}

function CampaignRow({ c }: { c: Campaign }) {
  const status = STATUS_META[c.status];
  const platform = PLATFORM_META[c.platform];
  const PlatformIcon = platform.icon;
  const ctr = c.impressions ? (c.clicks / c.impressions) * 100 : 0;
  return (
    <tr className='border-t border-zinc-100 transition-colors hover:bg-zinc-50/60'>
      <td className='px-4 py-3'>
        <div className='flex items-start gap-2.5'>
          <div className='flex flex-col items-center gap-1'>
            <span className={`size-2 rounded-full ${status.dot}`} />
            <div
              className={`flex size-7 items-center justify-center rounded-lg ${platform.color} text-white shadow-sm`}
            >
              <PlatformIcon className='size-3.5' />
            </div>
          </div>
          <div className='min-w-0 flex-1'>
            <div className='line-clamp-1 text-[13px] font-semibold'>
              {c.name}
            </div>
            <div className='mt-0.5 flex items-center gap-1.5 text-[10.5px] text-zinc-500'>
              <span
                className={`rounded-md px-1.5 py-0.5 font-bold ${status.chip}`}
              >
                {status.label}
              </span>
              <span>·</span>
              <span>{c.objective}</span>
              {c.template_id && (
                <>
                  <span>·</span>
                  <span className='font-mono'>{c.template_id}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className='px-3 py-3 text-right font-mono'>
        {fmtFull(c.impressions)}
      </td>
      <td className='px-3 py-3 text-right font-mono text-zinc-500'>
        {fmtFull(c.reach)}
      </td>
      <td className='px-3 py-3 text-right font-mono'>{fmtFull(c.clicks)}</td>
      <td className='px-3 py-3 text-right'>
        <CtrBadge ctr={ctr} />
      </td>
      <td className='px-3 py-3 text-right font-mono font-semibold'>
        {(c.spend_vnd / 1_000_000).toFixed(1)}M
      </td>
      <td className='px-3 py-3 text-right font-mono'>
        {fmtFull(c.conversions)}
      </td>
      <td className='px-3 py-3'>
        <Sparkline values={c.trend} status={c.status} />
      </td>
    </tr>
  );
}

function CtrBadge({ ctr: c }: { ctr: number }) {
  const tone =
    c >= 2
      ? 'bg-emerald-100 text-emerald-700'
      : c >= 1
        ? 'bg-amber-100 text-amber-700'
        : 'bg-zinc-100 text-zinc-600';
  return (
    <span className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] ${tone}`}>
      {c.toFixed(2)}%
    </span>
  );
}

function Sparkline({
  values,
  status,
}: {
  values: number[];
  status: Campaign['status'];
}) {
  const max = Math.max(...values, 1);
  const color =
    status === 'active'
      ? 'fill-emerald-500'
      : status === 'paused'
        ? 'fill-amber-500'
        : 'fill-zinc-400';
  return (
    <svg
      viewBox={`0 0 ${values.length * 6} 24`}
      width={values.length * 6}
      height={24}
      className='overflow-visible'
    >
      {values.map((v, i) => {
        const h = (v / max) * 22;
        return (
          <rect
            key={i}
            x={i * 6}
            y={24 - h}
            width={4}
            height={Math.max(h, 1)}
            rx={1}
            className={`${color} opacity-70 transition-opacity hover:opacity-100`}
          />
        );
      })}
    </svg>
  );
}

function BarChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className='flex h-32 items-end gap-1'>
      {values.map((v, i) => {
        const h = (v / max) * 100;
        const day = i - 13;
        const label =
          day === 0 ? 'today' : day === -7 ? '7d' : day === -13 ? '14d' : '';
        return (
          <div
            key={i}
            className='group relative flex flex-1 flex-col items-center gap-1'
          >
            <span className='font-mono text-[10px] font-semibold text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100'>
              {v}M
            </span>
            <div
              className='w-full rounded-t-md bg-gradient-to-t from-rose-500 to-rose-300 transition-all group-hover:from-rose-600 group-hover:to-rose-400'
              style={{ height: `${h}%`, minHeight: 8 }}
            />
            {label && (
              <span className='font-mono text-[10px] text-zinc-500'>
                {label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
