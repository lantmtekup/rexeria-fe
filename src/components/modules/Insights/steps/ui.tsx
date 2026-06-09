'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/cn';

/** Gradient xanh đặc trưng cho toàn bộ chrome AI-Insights (orb, CTA, progress). */
export const AI_GRADIENT =
  'linear-gradient(135deg,#2563eb 0%,#60a5fa 55%,#a3d4fc 100%)';

/**
 * Orb gradient mang "chất AI": vòng tròn gradient đặc + lớp glow mờ phía sau.
 * Dùng ở header wizard (tĩnh) và màn generating (bật `pulse` để thở khi đang chạy).
 */
export function AiOrb({
  size = 44,
  pulse = false,
  icon,
  className,
}: {
  size?: number;
  pulse?: boolean;
  icon?: ReactNode;
  className?: string;
}) {
  const inner = Math.round(size * 0.5);
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden
        className={cn(
          'bg-ai-gradient absolute inset-0 rounded-full opacity-70 blur-md',
          pulse && 'animate-pulse'
        )}
      />
      <span
        className='relative inline-flex items-center justify-center rounded-full text-white shadow-sm'
        style={{ width: size, height: size, background: AI_GRADIENT }}
      >
        {icon ?? (
          <Sparkles aria-hidden style={{ width: inner, height: inner }} />
        )}
      </span>
    </span>
  );
}

/** Bảng màu accent cho từng section blueprint — giữ mỗi section một sắc thái riêng. */
const ACCENTS = {
  blue: 'bg-primary/10 text-primary',
  violet: 'bg-violet-100 text-violet-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-warning-bg text-warning',
} as const;

export type SectionAccent = keyof typeof ACCENTS;

/**
 * Khung card cho một section của blueprint: icon-chip có accent, tiêu đề, số thứ
 * tự, và hiệu ứng xuất hiện có độ trễ (`delayMs`) để các section trồi lên lần lượt.
 */
export function SectionCard({
  icon,
  title,
  index,
  accent = 'blue',
  delayMs = 0,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  index?: number;
  accent?: SectionAccent;
  delayMs?: number;
  children: ReactNode;
  className?: string;
}) {
  const style: CSSProperties = {
    animationDelay: `${delayMs}ms`,
    animationFillMode: 'backwards',
  };
  return (
    <section
      style={style}
      className={cn(
        'border-border bg-card rounded-2xl border p-5 shadow-sm transition hover:shadow-md',
        'animate-in fade-in slide-in-from-bottom-2 duration-500',
        className
      )}
    >
      <div className='mb-4 flex items-center gap-3'>
        <span
          className={cn(
            'inline-flex size-9 items-center justify-center rounded-xl [&_svg]:size-[18px]',
            ACCENTS[accent]
          )}
        >
          {icon}
        </span>
        <h2 className='text-content-main text-base font-semibold'>{title}</h2>
        {index != null && (
          <span className='text-content-muted ml-auto text-xs font-semibold tabular-nums'>
            {String(index).padStart(2, '0')}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * Vòng tròn tiến độ thể hiện độ tin cậy (0–100%) bằng SVG stroke gradient, có
 * animate khi mount. % hiển thị ở tâm.
 */
export function ConfidenceRing({
  pct,
  size = 72,
}: {
  pct: number;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);
  const center = size / 2;
  return (
    <span
      className='relative inline-flex items-center justify-center'
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className='-rotate-90'>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill='none'
          stroke='var(--muted)'
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill='none'
          stroke='url(#conf-grad)'
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={c}
          strokeDashoffset={offset}
          className='transition-[stroke-dashoffset] duration-1000 ease-out'
        />
        <defs>
          <linearGradient id='conf-grad' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='#2563eb' />
            <stop offset='100%' stopColor='#60a5fa' />
          </linearGradient>
        </defs>
      </svg>
      <span className='text-content-main absolute text-base font-bold tabular-nums'>
        {clamped}
        <span className='text-content-muted text-[11px] font-semibold'>%</span>
      </span>
    </span>
  );
}

/**
 * Nút CTA gradient dùng chung (Chạy phân tích / Tùy chỉnh trải nghiệm). Tự xử lý
 * trạng thái disabled; `leading` để truyền spinner/icon ở đầu nút.
 */
export function GradientButton({
  children,
  leading,
  disabled,
  onClick,
  className,
}: {
  children: ReactNode;
  leading?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      style={{ background: AI_GRADIENT }}
      className={cn(
        'group rounded-pill inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-semibold text-white',
        'shadow-[0_12px_30px_-12px_rgba(37,99,235,0.65)] transition hover:brightness-110',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:brightness-100',
        className
      )}
    >
      {leading}
      {children}
    </button>
  );
}
