/**
 * Bộ SVG của block `lecool_story` — port nguyên từ apps/ecommerce-landing
 * StoryIcons.tsx (chỉ giữ những icon section này dùng).
 *
 * Không phải element sửa được: icon do `content.productSpecs[i].icon` chọn
 * trong 5 tên có sẵn, không nhận URL ngoài.
 */
import type * as React from 'react';

import type { LecoolStoryIconName } from '../types';

type IconProps = { className?: string; style?: React.CSSProperties };

export function IconExpand({ className }: IconProps) {
  return (
    <svg viewBox='0 0 16 16' fill='none' className={className} aria-hidden>
      <path d='M6.5 0.6H0.6V6.5' stroke='currentColor' strokeWidth='1.2' />
      <path d='M9.5 15.4H15.4V9.5' stroke='currentColor' strokeWidth='1.2' />
    </svg>
  );
}

export function IconCollapse({ className }: IconProps) {
  return (
    <svg viewBox='0 0 16 16' fill='none' className={className} aria-hidden>
      <path d='M0.6 6.5H6.5V0.6' stroke='currentColor' strokeWidth='1.2' />
      <path d='M15.4 9.5H9.5V15.4' stroke='currentColor' strokeWidth='1.2' />
    </svg>
  );
}

function IconRuler({ className }: IconProps) {
  return (
    <svg viewBox='0 0 16 16' fill='none' className={className} aria-hidden>
      <rect
        x='0.6'
        y='4.6'
        width='14.8'
        height='6.8'
        stroke='currentColor'
        strokeWidth='1.2'
      />
      <path
        d='M4 4.6v2.2M8 4.6v3M12 4.6v2.2'
        stroke='currentColor'
        strokeWidth='1.2'
      />
    </svg>
  );
}

export function IconBag({ className }: IconProps) {
  return (
    <svg viewBox='0 0 16 16' fill='none' className={className} aria-hidden>
      <path
        d='M2.2 5h11.6l-.85 10H3.05L2.2 5Z'
        stroke='currentColor'
        strokeWidth='1.2'
        strokeLinejoin='round'
      />
      <path
        d='M5.6 6.5V4a2.4 2.4 0 1 1 4.8 0v2.5'
        stroke='currentColor'
        strokeWidth='1.2'
        strokeLinecap='round'
      />
    </svg>
  );
}

function IconPhone({ className }: IconProps) {
  return (
    <svg viewBox='0 0 18 18' fill='none' className={className} aria-hidden>
      <path
        d='M5.2 1.6 7 4.4 5.5 6.2c.7 1.9 2.4 3.6 4.3 4.3l1.8-1.5 2.8 1.8-.5 2.6c-.2.9-1 1.4-1.9 1.2C7.2 13.8 2.9 9.5 1.9 4.2c-.2-.9.3-1.7 1.2-1.9l2.1-.7Z'
        stroke='currentColor'
        strokeWidth='1.2'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function IconCalendar({ className }: IconProps) {
  return (
    <svg viewBox='0 0 16 17' fill='none' className={className} aria-hidden>
      <rect
        x='0.6'
        y='2.6'
        width='14.8'
        height='13.8'
        stroke='currentColor'
        strokeWidth='1.2'
      />
      <path
        d='M0.6 6.5h14.8M4.5 0.6v3.4M11.5 0.6v3.4'
        stroke='currentColor'
        strokeWidth='1.2'
      />
    </svg>
  );
}

function IconPin({ className }: IconProps) {
  return (
    <svg viewBox='0 0 12 17' fill='none' className={className} aria-hidden>
      <path
        d='M6 .6C3 .6.6 3 .6 6c0 3.9 4.2 9 5.4 10.4C7.2 15 11.4 9.9 11.4 6 11.4 3 9 .6 6 .6Z'
        stroke='currentColor'
        strokeWidth='1.2'
      />
      <circle cx='6' cy='6' r='2' stroke='currentColor' strokeWidth='1.2' />
    </svg>
  );
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg viewBox='0 0 4 8' fill='none' className={className} aria-hidden>
      <path
        d='M.5.5 3.5 4 .5 7.5'
        stroke='currentColor'
        strokeWidth='1'
        strokeLinecap='round'
      />
    </svg>
  );
}

export function IconHeart({ className }: IconProps) {
  return (
    <svg viewBox='0 0 16 14' fill='none' className={className} aria-hidden>
      <path
        d='M8 13.4 6.8 12.3C2.7 8.6 0 6.2 0 3.3 0 1 1.8 0 4.1 0 5.4 0 6.7.6 8 1.6 9.3.6 10.6 0 11.9 0 14.2 0 16 1 16 3.3c0 2.9-2.7 5.3-6.8 9L8 13.4Z'
        fill='currentColor'
      />
    </svg>
  );
}

/** Tim viền — nút wishlist ở góc ảnh thẻ Collection. */
export function IconHeartOutline({ className }: IconProps) {
  return (
    <svg viewBox='0 0 16 14' fill='none' className={className} aria-hidden>
      <path
        d='M8 12.7 6.9 11.7C3.1 8.3.6 6.1.6 3.3.6 1.2 2.1 0 4.1 0 5.3 0 6.5.6 8 2 9.5.6 10.7 0 11.9 0c2 0 3.5 1.2 3.5 3.3 0 2.8-2.5 5-6.3 8.4L8 12.7Z'
        stroke='currentColor'
        strokeWidth='1.1'
      />
    </svg>
  );
}

/** Mũi tên cạnh "ALL PRODUCTS". */
export function IconArrowRight({ className }: IconProps) {
  return (
    <svg viewBox='0 0 12 6' fill='none' className={className} aria-hidden>
      <path
        d='M0 3h11M8.5.5 11 3l-2.5 2.5'
        stroke='currentColor'
        strokeWidth='1'
      />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox='0 0 6 5' fill='none' className={className} aria-hidden>
      <path
        d='M.7 2.4 2.2 4 5.3.9'
        stroke='currentColor'
        strokeWidth='1.1'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/** Gạch `—` hai bên nhãn menu đang active. */
export function IconDash({ className, style }: IconProps) {
  return (
    <svg
      viewBox='0 0 21 6'
      fill='none'
      className={className}
      style={style}
      aria-hidden
    >
      <rect y='2.5' width='21' height='1' fill='currentColor' />
    </svg>
  );
}

const ICONS: Record<
  LecoolStoryIconName,
  React.ComponentType<{ className?: string }>
> = {
  ruler: IconRuler,
  bag: IconBag,
  phone: IconPhone,
  calendar: IconCalendar,
  pin: IconPin,
};

/** Ô icon 32×32 nền xám trong panel Products. */
export function IconBox({ name }: { name?: LecoolStoryIconName }) {
  const Icon = ICONS[name ?? 'bag'] ?? IconBag;
  return (
    <span className='flex h-8 w-8 shrink-0 items-center justify-center bg-black/5 text-black'>
      <Icon className='h-4 w-4' />
    </span>
  );
}
