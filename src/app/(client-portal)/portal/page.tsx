'use client';

import {
  BarChart3,
  Bell,
  Eye,
  LayoutTemplate,
  MessageSquare,
  Send,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import { useEffect, useState } from 'react';

import {
  FAKE_ACTIVITY,
  FAKE_BRAND,
  FAKE_STATS,
  FAKE_TREND_7D,
  fmtFull,
  fmtNum,
  type ActivityItem,
  type DashboardStats,
} from './_data';
import { ApiStatusLabel, loadDashboardStats } from './_remote';
import { PortalShell } from './_shell';

const ACTIVITY_META: Record<
  ActivityItem['kind'],
  { icon: LucideIcon; color: string; label: string }
> = {
  template_published: { icon: Send, color: 'bg-emerald-500', label: 'Publish' },
  template_updated: { icon: Sparkles, color: 'bg-violet-500', label: 'Update' },
  comment_new: { icon: MessageSquare, color: 'bg-amber-500', label: 'Comment' },
  comment_resolved: {
    icon: MessageSquare,
    color: 'bg-zinc-500',
    label: 'Resolved',
  },
  asset_uploaded: { icon: UploadCloud, color: 'bg-blue-500', label: 'Upload' },
  workspace_invited: { icon: Users, color: 'bg-indigo-500', label: 'Invite' },
};

export default function PortalDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(FAKE_STATS);
  const [source, setSource] = useState<'live' | 'fake'>('fake');
  const [loadError, setLoadError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadDashboardStats().then(res => {
      if (cancelled) return;
      setStats(res.data);
      setSource(res.source);
      setLoadError(res.error);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ctr =
    stats.total_visitors_30d > 0
      ? (stats.total_clicks_30d / stats.total_visitors_30d) * 100
      : 0;
  return (
    <PortalShell>
      {/* Hero */}
      <section className='relative mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm'>
        <div className='absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-amber-50 opacity-70' />
        <div
          className='absolute -top-8 -right-8 size-36 rounded-full bg-rose-200 blur-3xl'
          aria-hidden
        />
        <div className='relative'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
              <Sparkles className='size-3' /> Brand Dashboard · 30 ngày qua
            </div>
            {source === 'live' && (
              <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-700'>
                <span className='size-1.5 animate-pulse rounded-full bg-emerald-500' />
                LIVE BE · dashboard.summary
              </span>
            )}
          </div>
          <h1 className='mt-2 text-3xl font-bold tracking-tight'>
            Xin chào,{' '}
            <span className='bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent'>
              {FAKE_BRAND.name}
            </span>
          </h1>
          <p className='mt-1 max-w-2xl text-[13px] leading-relaxed text-zinc-600'>
            Rexer đang quản lý <strong>{stats.templates_published}</strong>{' '}
            landing page public cho brand. Bạn có{' '}
            <strong>{stats.open_comments}</strong> comment đang chờ xử lý và{' '}
            <strong>{stats.unread_notifications}</strong> thông báo mới.
          </p>
        </div>
      </section>

      <ApiStatusLabel source={source} error={loadError} />

      {/* Stats grid */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <StatCard
          icon={LayoutTemplate}
          label='Landing pages'
          value={stats.templates_count}
          hint={`${stats.templates_published} đang public`}
          accent='indigo'
        />
        <StatCard
          icon={Eye}
          label='Tổng views'
          value={stats.total_views_30d}
          hint='30 ngày qua'
          accent='blue'
        />
        <StatCard
          icon={Users}
          label='Visitors'
          value={stats.total_visitors_30d}
          hint='Unique trong 30d'
          accent='emerald'
        />
        <StatCard
          icon={Zap}
          label='Clicks'
          value={stats.total_clicks_30d}
          hint={`CTR ${ctr.toFixed(1)}%`}
          accent='amber'
        />
        <StatCard
          icon={Send}
          label='Leads thu được'
          value={stats.total_leads_30d}
          hint='Form submit thành công'
          accent='rose'
        />
        <StatCard
          icon={UploadCloud}
          label='Assets'
          value={stats.assets_count}
          hint='File trong thư viện'
          accent='cyan'
        />
        <StatCard
          icon={MessageSquare}
          label='Open comments'
          value={stats.open_comments}
          hint='Đang chờ Rexer xử lý'
          accent='orange'
        />
        <StatCard
          icon={Bell}
          label='Thông báo'
          value={stats.unread_notifications}
          hint='Chưa đọc'
          accent='violet'
        />
      </div>

      {/* Trend chart */}
      <section className='mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]'>
        <div className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex size-7 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm'>
                <TrendingUp className='size-4' />
              </div>
              <div>
                <h3 className='text-sm font-semibold'>Lượt xem 7 ngày qua</h3>
                <p className='text-[11px] text-zinc-500'>
                  Tổng cộng tất cả landing page
                </p>
              </div>
            </div>
            <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700'>
              ↗ +18.2%
            </span>
          </div>
          <BarChart values={FAKE_TREND_7D} />
        </div>

        {/* Quick actions */}
        <div className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-violet-500 text-white shadow-sm'>
              <Sparkles className='size-4' />
            </div>
            <h3 className='text-sm font-semibold'>Quick actions</h3>
          </div>
          <div className='space-y-2'>
            <QuickAction
              href='/portal/media'
              icon={UploadCloud}
              title='Upload media mới'
              desc='Cung cấp ảnh / video / tài liệu cho Rexer'
              accent='cyan'
            />
            <QuickAction
              href='/portal/landing-pages'
              icon={LayoutTemplate}
              title='Xem landing pages'
              desc='Browse 12 landing page Rexer đã làm'
              accent='indigo'
            />
            <QuickAction
              href='/portal/comments'
              icon={MessageSquare}
              title='Comment / Request'
              desc='Yêu cầu sửa hoặc đặt câu hỏi'
              accent='orange'
            />
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section className='mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm'>
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm'>
              <BarChart3 className='size-4' />
            </div>
            <h3 className='text-sm font-semibold'>Hoạt động gần đây</h3>
          </div>
          <button className='text-[11px] text-zinc-500 hover:text-zinc-900'>
            Xem tất cả →
          </button>
        </div>
        <div className='relative'>
          <div
            className='absolute top-3 bottom-3 left-[15px] w-0.5 bg-zinc-100'
            aria-hidden
          />
          <ul className='space-y-3'>
            {FAKE_ACTIVITY.map(a => {
              const meta = ACTIVITY_META[a.kind];
              const Icon = meta.icon;
              return (
                <li key={a.id} className='relative flex items-start gap-3'>
                  <span
                    className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${meta.color} text-white shadow-sm ring-4 ring-white`}
                  >
                    <Icon className='size-3.5' />
                  </span>
                  <div className='min-w-0 flex-1 pb-1'>
                    <div className='flex flex-wrap items-baseline gap-x-2 text-[13px]'>
                      <span className='font-semibold'>{a.actor}</span>
                      <span className='text-zinc-500'>
                        {meta.label.toLowerCase()}
                      </span>
                      <span className='font-mono text-zinc-700'>
                        {a.subject}
                      </span>
                      <span className='ml-auto font-mono text-[10px] text-zinc-400'>
                        {a.at}
                      </span>
                    </div>
                    {a.excerpt && (
                      <p className='mt-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-[12px] leading-snug text-zinc-700 italic'>
                        &ldquo;{a.excerpt}&rdquo;
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </PortalShell>
  );
}

/* ---------- subcomponents ---------- */

const ACCENT_MAP: Record<
  string,
  { bg: string; gradient: string; text: string; chip: string }
> = {
  indigo: {
    bg: 'bg-indigo-500',
    gradient: 'from-indigo-50',
    text: 'text-indigo-600',
    chip: 'bg-indigo-100 text-indigo-700',
  },
  blue: {
    bg: 'bg-blue-500',
    gradient: 'from-blue-50',
    text: 'text-blue-600',
    chip: 'bg-blue-100 text-blue-700',
  },
  emerald: {
    bg: 'bg-emerald-500',
    gradient: 'from-emerald-50',
    text: 'text-emerald-600',
    chip: 'bg-emerald-100 text-emerald-700',
  },
  amber: {
    bg: 'bg-amber-500',
    gradient: 'from-amber-50',
    text: 'text-amber-600',
    chip: 'bg-amber-100 text-amber-700',
  },
  rose: {
    bg: 'bg-rose-500',
    gradient: 'from-rose-50',
    text: 'text-rose-600',
    chip: 'bg-rose-100 text-rose-700',
  },
  cyan: {
    bg: 'bg-cyan-500',
    gradient: 'from-cyan-50',
    text: 'text-cyan-600',
    chip: 'bg-cyan-100 text-cyan-700',
  },
  orange: {
    bg: 'bg-orange-500',
    gradient: 'from-orange-50',
    text: 'text-orange-600',
    chip: 'bg-orange-100 text-orange-700',
  },
  violet: {
    bg: 'bg-violet-500',
    gradient: 'from-violet-50',
    text: 'text-violet-600',
    chip: 'bg-violet-100 text-violet-700',
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint?: string;
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
        {fmtNum(value)}
      </div>
      {value >= 1000 && (
        <div className='font-mono text-[10px] text-zinc-400'>
          ({fmtFull(value)})
        </div>
      )}
      {hint && (
        <div className='mt-1 text-[10.5px] leading-snug text-zinc-500'>
          {hint}
        </div>
      )}
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  desc,
  accent,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
}) {
  const c = ACCENT_MAP[accent];
  return (
    <Link
      href={href}
      className='group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition-all hover:border-zinc-300 hover:shadow-sm'
    >
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${c.bg} text-white shadow-sm transition-transform group-hover:scale-110`}
      >
        <Icon className='size-4' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-[13px] font-semibold'>{title}</div>
        <div className='truncate text-[10.5px] text-zinc-500'>{desc}</div>
      </div>
      <span className={`text-[12px] font-bold ${c.text}`}>→</span>
    </Link>
  );
}

function BarChart({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  return (
    <div className='flex h-32 items-end gap-1.5'>
      {values.map((v, i) => {
        const h = (v / max) * 100;
        return (
          <div
            key={i}
            className='group flex flex-1 flex-col items-center gap-1'
          >
            <span className='font-mono text-[10px] font-semibold text-zinc-700 opacity-0 transition-opacity group-hover:opacity-100'>
              {fmtNum(v)}
            </span>
            <div
              className='w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-300 transition-all group-hover:from-blue-600 group-hover:to-blue-400'
              style={{ height: `${h}%`, minHeight: 8 }}
            />
            <span className='font-mono text-[10px] text-zinc-500'>
              {days[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
