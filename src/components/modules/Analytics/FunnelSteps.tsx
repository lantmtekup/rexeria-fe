'use client';

/**
 * Phễu 6 bậc dùng chung (spec §2) theo style mockup 2026-06-12:
 * - 3 bậc Marketing: bar indigo đậm, value mono trắng trong bar.
 * - Lead = ĐIỂM BÀN GIAO: bar cam viền đứt (nổi bật thay vì kẻ divider).
 * - SQL + Deal (Sales): bar mint.
 * Không làm mờ theo role — quyền sở hữu thể hiện bằng màu + tag góc phải
 * ở component cha ("bạn sở hữu nửa trên/dưới").
 */

import { cn } from '@/lib/cn';

import type { FunnelCounts } from './funnel-demo';

export type FunnelFocus = 'marketing' | 'sales' | 'all';

type StageStyle = 'marketing' | 'handoff' | 'sales';

const STAGES: {
  key: keyof FunnelCounts;
  label: string;
  sub: string;
  style: StageStyle;
}[] = [
  { key: 'visits', label: 'Lượt truy cập', sub: 'visits', style: 'marketing' },
  {
    key: 'engaged',
    label: 'Tương tác (scroll 50%)',
    sub: 'engaged',
    style: 'marketing',
  },
  {
    key: 'ctaClicks',
    label: 'Click CTA',
    sub: 'cta click',
    style: 'marketing',
  },
  {
    key: 'leads',
    label: 'Lead (form/ví/whitelist)',
    sub: 'form submit · bàn giao',
    style: 'handoff',
  },
  {
    key: 'sql',
    label: 'Lead đạt chuẩn (SQL)',
    sub: 'qualified',
    style: 'sales',
  },
  { key: 'deals', label: 'Chốt · Mua coin', sub: 'deal', style: 'sales' },
];

const BAR_CLASS: Record<StageStyle, string> = {
  marketing: 'bg-indigo-600 text-white',
  handoff:
    'bg-amber-400 text-amber-950 border-2 border-dashed border-amber-600',
  sales: 'bg-emerald-200 text-emerald-900',
};

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function FunnelSteps({ counts }: { counts: FunnelCounts }) {
  const max = counts.visits || 1;
  return (
    <ol className='flex flex-col gap-3'>
      {STAGES.map(stage => {
        const value = counts[stage.key];
        const pct = (value / max) * 100;
        return (
          <li key={stage.key} className='flex items-center gap-4'>
            <div className='w-48 shrink-0'>
              <p className='text-foreground text-sm font-semibold'>
                {stage.label}
              </p>
              <p className='text-muted-foreground font-mono text-xs'>
                {stage.sub}
              </p>
            </div>
            <div className='flex flex-1 items-center gap-3'>
              <div
                className={cn(
                  'flex h-11 items-center rounded-xl px-4',
                  BAR_CLASS[stage.style]
                )}
                style={{ width: `${Math.max(pct, 9)}%` }}
              >
                <span className='font-mono text-sm font-semibold whitespace-nowrap'>
                  {fmt(value)}
                </span>
              </div>
              <span className='text-content-muted font-mono text-xs'>
                {pct >= 10 ? Math.round(pct) : pct.toFixed(1)}%
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
