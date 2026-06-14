'use client';

/**
 * Building blocks cho dashboard Analytics v2 theo style mockup 2026-06-12:
 * số to font đậm, phụ chú mono, tag góc phải mono uppercase tracking rộng,
 * card trắng rounded-2xl. Dùng chung cho MarketingView / SalesView.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/** Tag mono uppercase ở góc phải card ("14 NGÀY", "CHANNEL", "TỐI ƯU TRANG"). */
export function CornerTag({ children }: { children: ReactNode }) {
  return (
    <span className='text-muted-foreground text-2xs font-mono tracking-widest uppercase'>
      {children}
    </span>
  );
}

export function Card({
  title,
  tag,
  children,
  className,
}: {
  title?: string;
  tag?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'border-border bg-card rounded-2xl border p-5 shadow-sm',
        className
      )}
    >
      {(title || tag) && (
        <div className='mb-4 flex items-baseline justify-between gap-3'>
          {title && (
            <h3 className='text-foreground text-base font-bold tracking-tight'>
              {title}
            </h3>
          )}
          {tag && <CornerTag>{tag}</CornerTag>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Metric card: icon màu + label · số to · hint mono (xanh nếu positive). */
export function MetricTile({
  icon: Icon,
  label,
  value,
  hint,
  hintTone = 'muted',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  hintTone?: 'muted' | 'positive';
}) {
  return (
    <div className='border-border bg-card rounded-2xl border p-5 shadow-sm'>
      <div className='flex items-center gap-2.5'>
        <Icon className='size-4 text-indigo-600' />
        <span className='text-foreground text-sm font-medium'>{label}</span>
      </div>
      <p className='text-foreground mt-2 text-4xl font-bold tracking-tight'>
        {value}
      </p>
      {hint && (
        <p
          className={cn(
            'mt-1.5 font-mono text-xs',
            hintTone === 'positive' ? 'text-emerald-600' : 'text-content-muted'
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

/* ── Area chart (visits theo ngày) — SVG thuần, không thêm dependency ───── */

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1: [number, number] = [
      p1[0] + (p2[0] - p0[0]) / 6,
      p1[1] + (p2[1] - p0[1]) / 6,
    ];
    const c2: [number, number] = [
      p2[0] - (p3[0] - p1[0]) / 6,
      p2[1] - (p3[1] - p1[1]) / 6,
    ];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const W = 620;
const H = 250;
const PAD = { l: 44, r: 10, t: 10, b: 24 };

export function AreaChart({ series }: { series: number[] }) {
  const max = Math.max(...series, 1);
  // Trần trục y "đẹp": bội của 1/2/5×10^k đủ chứa max.
  const mag = 10 ** Math.floor(Math.log10(max));
  const yMax = [1, 2, 2.5, 5, 10].map(m => m * mag).find(v => v >= max) ?? max;

  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const x = (i: number) =>
    PAD.l + (series.length === 1 ? iw / 2 : (i / (series.length - 1)) * iw);
  const y = (v: number) => PAD.t + ih - (v / yMax) * ih;
  const pts = series.map((v, i) => [x(i), y(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = `${line} L ${x(series.length - 1)} ${PAD.t + ih} L ${x(0)} ${PAD.t + ih} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(yMax * f));
  const every = Math.max(1, Math.ceil(series.length / 14));
  const fmtDay = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className='w-full' role='img'>
      <defs>
        <linearGradient id='areaFill' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='#4f46e5' stopOpacity='0.25' />
          <stop offset='100%' stopColor='#4f46e5' stopOpacity='0.02' />
        </linearGradient>
      </defs>
      {yTicks.map(t => (
        <g key={t}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={y(t)}
            y2={y(t)}
            stroke='currentColor'
            className='text-border'
            strokeDasharray='4 4'
            strokeWidth='1'
          />
          <text
            x={PAD.l - 6}
            y={y(t) + 3}
            textAnchor='end'
            className='fill-muted-foreground text-3xs font-mono'
          >
            {t.toLocaleString('vi-VN')}
          </text>
        </g>
      ))}
      <path d={area} fill='url(#areaFill)' />
      <path
        d={line}
        fill='none'
        stroke='#4f46e5'
        strokeWidth='3'
        strokeLinecap='round'
      />
      {series.map((_, i) =>
        i % every === 0 || i === series.length - 1 ? (
          <text
            key={i}
            x={x(i)}
            y={H - 6}
            textAnchor='middle'
            className='fill-muted-foreground text-3xs font-mono'
          >
            {fmtDay(i)}
          </text>
        ) : null
      )}
    </svg>
  );
}
