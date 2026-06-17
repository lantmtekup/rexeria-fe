/**
 * Helpers UI cho micro-sites. **Dữ liệu & type lấy từ API thật** (rexer types);
 * file này chỉ giữ meta hiển thị + gradient cover suy ra từ id (vì `MicroSite`
 * thật không có `cover_gradient`).
 *
 * Đọc/CRUD qua `rexerApi.microSites.*` (list/get/analytics/create/update/remove).
 */

import type { MicroSite, MicroSiteStatus } from '@/services/rexer/types';

export type { MicroSite, MicroSiteStatus };

export const STATUS_META: Record<
  MicroSiteStatus,
  { label: string; chip: string; dot: string }
> = {
  live: {
    label: 'Live',
    chip: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  dev: {
    label: 'Đang dev',
    chip: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  paused: {
    label: 'Tạm dừng',
    chip: 'bg-muted text-content-muted',
    dot: 'bg-muted-foreground',
  },
};

/** Status BE có thể là string lạ → fallback 'dev' để không vỡ UI. */
export function statusMeta(s: string) {
  const key: MicroSiteStatus =
    (s as MicroSiteStatus) in STATUS_META ? (s as MicroSiteStatus) : 'dev';
  return STATUS_META[key];
}

export const SITE_GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-rose-500 to-red-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
];

/** Gradient cover ổn định theo id (thay cho cover_gradient không có ở API). */
export function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return SITE_GRADIENTS[Math.abs(h) % SITE_GRADIENTS.length];
}
