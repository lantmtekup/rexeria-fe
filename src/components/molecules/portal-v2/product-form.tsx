'use client';

import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import { ProductImage } from '@/components/molecules/portal-v2/product-image';
import { cn } from '@/lib/cn';
import { PRODUCT_STATUS } from '@/lib/portal-v2/product/constants';
import { readinessColor } from '@/lib/portal-v2/product/helpers';
import type { ProductStatus } from '@/lib/portal-v2/product/types';

/** `.stp` + `.sd` — the status pill shared by the table, the grid, and the modal. */
export const StatusPill = ({ status }: { status: ProductStatus }) => {
  const s = PRODUCT_STATUS[status];
  return (
    <span
      className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap'
      style={{ background: s.bg, color: s.fg }}
    >
      <span
        className='size-1.5 shrink-0 rounded-full'
        style={{ background: s.dot }}
      />
      {s.name}
    </span>
  );
};

/** A neutral pill for anything that is not a product status (channel counts…). */
export const TonePill = ({
  children,
  bg,
  fg,
}: {
  children: ReactNode;
  bg: string;
  fg: string;
}) => (
  <span
    className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap'
    style={{ background: bg, color: fg }}
  >
    {children}
  </span>
);

/** `.rdy/.rb/.rv` — the ReXeR column. */
export const ReadinessBar = ({
  score,
  className,
}: {
  score: number;
  className?: string;
}) => {
  const color = readinessColor(score);
  return (
    <span className={cn('flex min-w-[96px] items-center gap-2', className)}>
      <span className='h-[5px] flex-1 overflow-hidden rounded-full bg-[var(--pv2-hair)]'>
        <span
          className='block h-full rounded-full'
          style={{ width: `${score}%`, background: color }}
        />
      </span>
      <span
        className='w-[30px] shrink-0 text-right text-[11.5px] font-bold tabular-nums'
        style={{ color }}
      >
        {score}%
      </span>
    </span>
  );
};

/** `.cbx` — a square 16px checkbox that is a real button, not an input. */
export const SelectBox = ({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) => (
  <button
    type='button'
    role='checkbox'
    aria-checked={checked}
    aria-label={label}
    onClick={e => {
      e.stopPropagation();
      onToggle();
    }}
    className={cn(
      'grid size-4 shrink-0 cursor-pointer place-items-center rounded-[4px] border transition-colors',
      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-1 focus-visible:outline-none',
      checked
        ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric)] text-[var(--pv2-paper)]'
        : 'border-[var(--pv2-slate-300)] bg-[var(--pv2-paper)] text-transparent hover:border-[var(--pv2-electric)]'
    )}
  >
    <Check className='size-2.5' strokeWidth={3.4} aria-hidden />
  </button>
);

/** `.chan span` — the first four sales channels as on/off initials. */
export const ChannelDots = ({
  channels,
  all,
}: {
  channels: string[];
  all: readonly string[];
}) => (
  <span className='flex gap-1'>
    {all.slice(0, 4).map(ch => {
      const on = channels.includes(ch);
      return (
        <span
          key={ch}
          title={ch}
          className={cn(
            'grid size-5 place-items-center rounded-[5px] text-[10px] font-bold',
            on
              ? 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
              : 'bg-[var(--pv2-canvas)] text-[var(--pv2-faint)]'
          )}
        >
          {ch[0]}
        </span>
      );
    })}
  </span>
);

/** `.box` — a bordered panel inside the modal (distinct from BrandCard's hairline rhythm). */
export const SectionBox = ({
  title,
  action,
  children,
  className,
  style,
}: {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <section
    className={cn(
      'rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-[18px] py-4',
      className
    )}
    style={style}
  >
    <h4 className='mb-3 flex items-center gap-2 text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
      <span className='min-w-0 flex-1'>{title}</span>
      {action}
    </h4>
    {children}
  </section>
);

/** `.kv` — a read-mode key/value row. */
export const KvRow = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: ReactNode;
  valueColor?: string;
}) => (
  <div className='flex justify-between gap-3 border-b border-[var(--pv2-hair)] py-[7px] text-[12.5px] last:border-b-0'>
    <span className='text-[var(--pv2-mut)]'>{label}</span>
    <span
      className='text-right font-semibold text-[var(--pv2-ink)]'
      style={valueColor ? { color: valueColor } : undefined}
    >
      {value}
    </span>
  </div>
);

/**
 * The product's photo when one is on file, otherwise a quiet letter mark — same
 * soft field as card covers, no per-product gradient. Stays `aria-hidden` even
 * with an image: every call site puts the title right beside it.
 */
export const ProductThumb = ({
  letter,
  src,
  size = 38,
  radius = 8,
  className,
}: {
  letter: string;
  src?: string | null;
  size?: number;
  radius?: number;
  className?: string;
}) => (
  <span
    aria-hidden
    className={cn(
      'relative grid shrink-0 place-items-center overflow-hidden bg-(--pv2-electric-soft)',
      'font-[family-name:var(--pv2-disp)] font-semibold text-(--pv2-electric)/45',
      className
    )}
    style={{
      width: size,
      height: size,
      borderRadius: radius,
      fontSize: Math.round(size * 0.42),
    }}
  >
    <ProductImage src={src} className='object-cover'>
      {letter}
    </ProductImage>
  </span>
);

/** `.hint2` — the explanatory line under a section heading. */
export const Hint = ({ children }: { children: ReactNode }) => (
  <p className='mb-3 max-w-[70ch] text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
    {children}
  </p>
);

/** `.warn` — a destructive/blocking notice with its bang badge. */
export const WarnBox = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) => (
  <div className='mb-4 flex items-start gap-2.5 rounded-[var(--pv2-r)] border border-[color-mix(in_srgb,var(--pv2-error)_35%,transparent)] bg-[color-mix(in_srgb,var(--pv2-error)_8%,transparent)] px-4 py-3'>
    <span className='grid size-[18px] shrink-0 place-items-center rounded-full bg-[var(--pv2-error)] text-[11px] font-bold text-[var(--pv2-paper)]'>
      !
    </span>
    <span className='min-w-0'>
      <span className='block text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
        {title}
      </span>
      {children ? (
        <span className='mt-0.5 block text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
          {children}
        </span>
      ) : null}
    </span>
  </div>
);

/** Empty-state used by the catalogue and the related-entity panes. */
export const EmptyState = ({
  icon,
  title,
  children,
  action,
  dashed = true,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  dashed?: boolean;
}) => (
  <div
    className={cn(
      'flex flex-col items-center gap-2 rounded-[var(--pv2-r)] px-6 py-11 text-center',
      dashed && 'border border-dashed border-[var(--pv2-hair)]'
    )}
  >
    {icon ? <span className='text-[var(--pv2-faint)]'>{icon}</span> : null}
    <b className='font-[family-name:var(--pv2-disp)] text-[14px] font-semibold text-[var(--pv2-ink)]'>
      {title}
    </b>
    {children ? (
      <span className='max-w-[340px] text-[12.5px] leading-relaxed text-[var(--pv2-faint)]'>
        {children}
      </span>
    ) : null}
    {action ? <span className='mt-1.5'>{action}</span> : null}
  </div>
);
