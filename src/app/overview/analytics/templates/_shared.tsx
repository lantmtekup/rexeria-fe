'use client';

import { ArrowLeft, LineChart, Sparkles, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

/* ---------- formatters ---------- */

export const fmtNum = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
      : String(n);

export const fmtFull = (n: number) => n.toLocaleString('vi-VN');

export const fmtDwell = (ms: number | null) => {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rest = Math.round(s - m * 60);
  return `${m}:${String(rest).padStart(2, '0')}`;
};

export const ctr = (clicks: number, views: number) =>
  views > 0 ? `${((clicks / views) * 100).toFixed(1)}%` : '—';

/* ---------- accents ---------- */

export type Accent =
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'indigo'
  | 'violet'
  | 'fuchsia';

export const ACCENT_MAP: Record<
  Accent,
  { bg: string; text: string; ring: string; gradient: string }
> = {
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    ring: 'ring-blue-100',
    gradient: 'from-blue-50',
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600',
    ring: 'ring-emerald-100',
    gradient: 'from-emerald-50',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-600',
    ring: 'ring-amber-100',
    gradient: 'from-amber-50',
  },
  indigo: {
    bg: 'bg-indigo-500',
    text: 'text-indigo-600',
    ring: 'ring-indigo-100',
    gradient: 'from-indigo-50',
  },
  violet: {
    bg: 'bg-violet-500',
    text: 'text-violet-600',
    ring: 'ring-violet-100',
    gradient: 'from-violet-50',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500',
    text: 'text-fuchsia-600',
    ring: 'ring-fuchsia-100',
    gradient: 'from-fuchsia-50',
  },
};

/* ---------- header ---------- */

export function PageHeader({
  back,
  backLabel = 'Overview',
  title,
  subtitle,
  rightBadge,
}: {
  back: string;
  backLabel?: string;
  title: string;
  subtitle?: React.ReactNode;
  rightBadge?: React.ReactNode;
}) {
  return (
    <header className='sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-6 py-3 backdrop-blur'>
      <div className='flex min-w-0 items-center gap-3'>
        <Link
          href={back}
          className='flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100'
        >
          <ArrowLeft className='size-3.5' /> {backLabel}
        </Link>
        <div className='flex min-w-0 items-center gap-2'>
          <div className='flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-sm'>
            <LineChart className='size-3.5' />
          </div>
          <span className='truncate text-sm font-semibold tracking-tight'>
            {title}
            {subtitle && (
              <span className='font-normal text-zinc-400'> · {subtitle}</span>
            )}
          </span>
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-2'>{rightBadge}</div>
    </header>
  );
}

export function FakeBadge() {
  return (
    <span className='text-3xs rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 font-bold tracking-wider text-amber-700 uppercase'>
      UI Demo · Fake data
    </span>
  );
}

export function FakeBanner() {
  return (
    <div className='mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-800'>
      <Sparkles className='mt-0.5 size-3.5 shrink-0 text-amber-600' />
      <div>
        <span className='font-semibold'>Trang demo</span> — dữ liệu hiển thị là{' '}
        <em>fake/mock</em>. UI đang chờ BE implement endpoint (xem khối{' '}
        <strong>Hợp đồng API</strong> cuối trang).
      </div>
    </div>
  );
}

/* ---------- StatCard ---------- */

export function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  accent: Accent;
  hint?: string;
}) {
  const c = ACCENT_MAP[accent];
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br ${c.gradient} to-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className='flex items-start justify-between'>
        <div
          className={`flex size-10 items-center justify-center rounded-xl ${c.bg} text-white shadow-sm transition-transform group-hover:scale-110`}
        >
          <Icon className='size-5' />
        </div>
      </div>
      <div className='text-2xs mt-3 font-semibold tracking-wider text-zinc-500 uppercase'>
        {label}
      </div>
      <div className='mt-0.5 flex items-baseline gap-1.5'>
        <span className='font-mono text-2xl font-bold text-zinc-900'>
          {fmtNum(value)}
        </span>
        {value >= 1000 && (
          <span className='text-2xs text-zinc-400'>({fmtFull(value)})</span>
        )}
      </div>
      {hint && <div className='text-3xs mt-1 text-zinc-500'>{hint}</div>}
    </div>
  );
}

/* ---------- BlockTypeChip + CtrBadge ---------- */

export const BLOCK_TYPE_COLOR: Record<string, string> = {
  HeroOverlay: 'bg-violet-100 text-violet-700',
  HeroSplit: 'bg-violet-100 text-violet-700',
  FeatureSection: 'bg-blue-100 text-blue-700',
  CtaSection: 'bg-emerald-100 text-emerald-700',
  PhotoGallery: 'bg-amber-100 text-amber-700',
  ImageCarousel: 'bg-amber-100 text-amber-700',
  BookingForm: 'bg-fuchsia-100 text-fuchsia-700',
  Hotspot: 'bg-cyan-100 text-cyan-700',
};

export function BlockTypeChip({ type }: { type: string | null }) {
  if (!type) return <span className='text-2xs font-mono text-zinc-400'>—</span>;
  const tone = BLOCK_TYPE_COLOR[type] ?? 'bg-zinc-100 text-zinc-700';
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${tone}`}
    >
      {type}
    </span>
  );
}

export function CtrBadge({ ctr: c }: { ctr: number }) {
  if (!isFinite(c)) return <span className='text-zinc-400'>—</span>;
  const tone =
    c >= 10
      ? 'bg-emerald-100 text-emerald-700'
      : c >= 5
        ? 'bg-amber-100 text-amber-700'
        : 'bg-zinc-100 text-zinc-600';
  return (
    <span className={`text-2xs rounded-md px-1.5 py-0.5 font-mono ${tone}`}>
      {c.toFixed(1)}%
    </span>
  );
}

/* ---------- Skeleton ---------- */

export function Skeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className='space-y-2 p-5'>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className='flex animate-pulse gap-3'>
          {Array.from({ length: cols }).map((__, j) => (
            <div
              key={j}
              className='h-5 flex-1 rounded bg-zinc-100'
              style={{ opacity: 0.5 + (cols - j) * 0.05 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- Preset switcher ---------- */

import type { RangePreset } from './_fake-data';
import { PRESET_LABEL } from './_fake-data';
import { RefreshCw } from 'lucide-react';

export function PresetBar({
  preset,
  onPresetChange,
  onRefresh,
}: {
  preset: RangePreset;
  onPresetChange: (p: RangePreset) => void;
  onRefresh: () => void;
}) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='inline-flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 shadow-sm'>
        {(['7d', '30d', '90d', 'all'] as const).map(p => (
          <button
            key={p}
            onClick={() => onPresetChange(p)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              preset === p
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {PRESET_LABEL[p]}
          </button>
        ))}
      </div>
      <button
        onClick={onRefresh}
        className='flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-100'
      >
        <RefreshCw className='size-3.5' /> Làm mới
      </button>
    </div>
  );
}
