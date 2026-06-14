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
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { useEffect, useState } from 'react';

import { useAppSelector } from '@/hooks/useRedux';

import {
  FAKE_ACTIVITY,
  FAKE_STATS,
  FAKE_TREND_7D,
  fmtFull,
  fmtNum,
  type ActivityItem,
  type DashboardStats,
} from './_data';
import { ApiStatusLabel, loadActivity, loadDashboardStats } from './_remote';
import { PortalShell } from './_shell';
import { useActiveWorkspace } from './_workspace';

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
  const t = useTranslations('portal');
  const activeWs = useActiveWorkspace();
  // Tên brand thật từ auth store (LoginResponse.brand.name). Fallback 'bạn'
  // khi chưa hydrate / user không gắn brand — KHÔNG dùng demo brand cứng
  // (trước đây hardcode "Flagship Cola" cho mọi account). Fallback tĩnh nên
  // SSR và first client paint khớp, không lệch hydration.
  const brandName = useAppSelector(s => s.auth.user?.brand_name);
  const [stats, setStats] = useState<DashboardStats>(FAKE_STATS);
  const [trend7d, setTrend7d] = useState<number[]>(FAKE_TREND_7D);
  const [source, setSource] = useState<'live' | 'fake'>('fake');
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [activity, setActivity] = useState<ActivityItem[]>(FAKE_ACTIVITY);

  useEffect(() => {
    let cancelled = false;
    loadDashboardStats().then(res => {
      if (cancelled) return;
      setStats(res.data);
      if (res.trend_7d && res.trend_7d.length > 0) setTrend7d(res.trend_7d);
      setSource(res.source);
      setLoadError(res.error);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadActivity(activeWs.id, 12).then(res => {
      if (cancelled) return;
      if (res.source === 'live') setActivity(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [activeWs.id]);

  const ctr =
    stats.total_visitors_30d > 0
      ? (stats.total_clicks_30d / stats.total_visitors_30d) * 100
      : 0;
  return (
    <PortalShell>
      {/* Hero */}
      <section className='border-border relative mb-6 overflow-hidden rounded-2xl border bg-white p-6 shadow-sm'>
        <div className='absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-amber-50 opacity-70' />
        <div
          className='absolute -top-8 -right-8 size-36 rounded-full bg-rose-200 blur-3xl'
          aria-hidden
        />
        <div className='relative'>
          <div className='flex items-center justify-between gap-2'>
            <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
              <Sparkles className='size-3' /> {t('dashboard.heroEyebrow')}
            </div>
          </div>
          <h1 className='mt-2 text-3xl font-bold tracking-tight'>
            {t('dashboard.greeting')}{' '}
            <span className='bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent'>
              {brandName ?? t('dashboard.greetingFallback')}
            </span>
          </h1>
          <p className='text-content-muted mt-1 max-w-2xl text-sm leading-relaxed'>
            {t.rich('dashboard.heroDesc', {
              published: stats.templates_published,
              unread: stats.unread_notifications,
              strong: chunks => <strong>{chunks}</strong>,
            })}
          </p>
        </div>
      </section>

      <ApiStatusLabel source={source} error={loadError} />

      {/* Stats grid */}
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
        <StatCard
          icon={LayoutTemplate}
          label={t('dashboard.statLandingPages')}
          value={stats.templates_count}
          hint={t('dashboard.statLandingPagesHint', {
            count: stats.templates_published,
          })}
          accent='indigo'
        />
        <StatCard
          icon={Eye}
          label={t('dashboard.statViews')}
          value={stats.total_views_30d}
          hint={t('dashboard.statViewsHint')}
          accent='blue'
        />
        <StatCard
          icon={Users}
          label={t('dashboard.statVisitors')}
          value={stats.total_visitors_30d}
          hint={t('dashboard.statVisitorsHint')}
          accent='emerald'
        />
        <StatCard
          icon={Zap}
          label={t('dashboard.statClicks')}
          value={stats.total_clicks_30d}
          hint={t('dashboard.statClicksHint', { ctr: ctr.toFixed(1) })}
          accent='amber'
        />
        <StatCard
          icon={Send}
          label={t('dashboard.statLeads')}
          value={stats.total_leads_30d}
          hint={t('dashboard.statLeadsHint')}
          accent='rose'
        />
        <StatCard
          icon={UploadCloud}
          label={t('dashboard.statAssets')}
          value={stats.assets_count}
          hint={t('dashboard.statAssetsHint')}
          accent='cyan'
        />
        <StatCard
          icon={Bell}
          label={t('dashboard.statNotifications')}
          value={stats.unread_notifications}
          hint={t('dashboard.statNotificationsHint')}
          accent='violet'
        />
      </div>

      {/* Trend chart */}
      <section className='mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]'>
        <div className='border-border rounded-2xl border bg-white p-5 shadow-sm'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex size-7 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm'>
                <TrendingUp className='size-4' />
              </div>
              <div>
                <h3 className='text-sm font-semibold'>
                  {t('dashboard.trendTitle')}
                </h3>
                <p className='text-2xs text-content-muted'>
                  {t('dashboard.trendSubtitle')}
                </p>
              </div>
            </div>
            <span className='text-3xs rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700'>
              ↗ +18.2%
            </span>
          </div>
          <BarChart values={trend7d} />
        </div>

        {/* Quick actions */}
        <div className='border-border rounded-2xl border bg-white p-5 shadow-sm'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-violet-500 text-white shadow-sm'>
              <Sparkles className='size-4' />
            </div>
            <h3 className='text-sm font-semibold'>
              {t('dashboard.quickActionsTitle')}
            </h3>
          </div>
          <div className='space-y-2'>
            <QuickAction
              href='/portal/media'
              icon={UploadCloud}
              title={t('dashboard.quickUploadTitle')}
              desc={t('dashboard.quickUploadDesc')}
              accent='cyan'
            />
            <QuickAction
              href='/portal/landing-pages'
              icon={LayoutTemplate}
              title={t('dashboard.quickPagesTitle')}
              desc={t('dashboard.quickPagesDesc')}
              accent='indigo'
            />
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section className='border-border mt-6 rounded-2xl border bg-white p-5 shadow-sm'>
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm'>
              <BarChart3 className='size-4' />
            </div>
            <h3 className='text-sm font-semibold'>
              {t('dashboard.activityTitle')}
            </h3>
          </div>
          <button className='text-2xs text-content-muted hover:text-foreground'>
            {t('dashboard.activityViewAll')}
          </button>
        </div>
        <div className='relative'>
          <div
            className='bg-muted absolute top-3 bottom-3 left-[15px] w-0.5'
            aria-hidden
          />
          <ul className='space-y-3'>
            {activity.map(a => {
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
                    <div className='flex flex-wrap items-baseline gap-x-2 text-sm'>
                      <span className='font-semibold'>{a.actor}</span>
                      <span className='text-content-muted'>
                        {meta.label.toLowerCase()}
                      </span>
                      <span className='text-content-muted font-mono'>
                        {a.subject}
                      </span>
                      <span className='text-3xs text-muted-foreground ml-auto font-mono'>
                        {a.at}
                      </span>
                    </div>
                    {a.excerpt && (
                      <p className='border-border bg-muted text-content-muted mt-1 rounded-lg border px-2.5 py-1.5 text-xs leading-snug italic'>
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
      className={`group border-border relative overflow-hidden rounded-2xl border bg-gradient-to-br ${c.gradient} to-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div
        className={`flex size-9 items-center justify-center rounded-xl ${c.bg} text-white shadow-sm transition-transform group-hover:scale-110`}
      >
        <Icon className='size-[18px]' />
      </div>
      <div className='text-3xs text-content-muted mt-3 font-semibold tracking-wider uppercase'>
        {label}
      </div>
      <div className='text-foreground mt-0.5 font-mono text-2xl font-bold'>
        {fmtNum(value)}
      </div>
      {value >= 1000 && (
        <div className='text-3xs text-muted-foreground font-mono'>
          ({fmtFull(value)})
        </div>
      )}
      {hint && (
        <div className='text-3xs text-content-muted mt-1 leading-snug'>
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
      className='group border-border hover:border-border flex items-center gap-3 rounded-xl border bg-white p-3 transition-all hover:shadow-sm'
    >
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${c.bg} text-white shadow-sm transition-transform group-hover:scale-110`}
      >
        <Icon className='size-4' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-sm font-semibold'>{title}</div>
        <div className='text-3xs text-content-muted truncate'>{desc}</div>
      </div>
      <span className={`text-xs font-bold ${c.text}`}>→</span>
    </Link>
  );
}

function BarChart({ values }: { values: number[] }) {
  const t = useTranslations('portal');
  const max = Math.max(...values);
  const days = [
    t('dashboard.dayMon'),
    t('dashboard.dayTue'),
    t('dashboard.dayWed'),
    t('dashboard.dayThu'),
    t('dashboard.dayFri'),
    t('dashboard.daySat'),
    t('dashboard.daySun'),
  ];
  return (
    <div className='flex h-32 items-end gap-1.5'>
      {values.map((v, i) => {
        const h = (v / max) * 100;
        return (
          <div
            key={i}
            className='group flex flex-1 flex-col items-center gap-1'
          >
            <span className='text-3xs text-content-muted font-mono font-semibold opacity-0 transition-opacity group-hover:opacity-100'>
              {fmtNum(v)}
            </span>
            <div
              className='w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-300 transition-all group-hover:from-blue-600 group-hover:to-blue-400'
              style={{ height: `${h}%`, minHeight: 8 }}
            />
            <span className='text-3xs text-content-muted font-mono'>
              {days[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
