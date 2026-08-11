import type {
  ExperienceFilters,
  ExperienceState,
  ExperienceView,
} from '@/lib/portal-v2/experiences/types';

/**
 * Formatting is PINNED to one locale and one time zone.
 *
 * These values render on cards, and cards render on the server. A bare
 * `.toLocaleString()` / `new Date().toLocaleDateString()` resolves against
 * Node's ICU locale on the server and the browser's during hydration — a
 * mismatch waiting for the first user whose machine disagrees with the build
 * box. Same reason there is no relative "2 hours ago": that needs `Date.now()`,
 * which differs between render passes.
 */
const NUM = new Intl.NumberFormat('en-US');
const NUM_1DP = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const DATE = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatCount = (n: number): string => NUM.format(Math.round(n));

export const formatMoney = (n: number): string =>
  `$${NUM.format(Math.round(n))}`;

/** 0.123 → '12.3%' */
export const formatPct01 = (n: number): string => `${NUM_1DP.format(n * 100)}%`;

/** Signed, with a true minus sign. 0.18 → '+18%', −0.09 → '−9%'. */
export const formatLift = (lift: number): string => {
  const pct = Math.round(lift * 100);
  return pct >= 0 ? `+${pct}%` : `−${Math.abs(pct)}%`;
};

/** ISO timestamp → '14 Mar 2026'. Empty/invalid input renders as an em dash. */
export const formatUpdated = (iso: string | undefined): string => {
  if (!iso) return '—';
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? '—' : DATE.format(ms);
};

/**
 * The filtered set. The query is applied server-side (`?q=`); the chip axes
 * and the ownership tab are seeded values, so they narrow client-side. Every
 * axis follows the prototype's "unset means ANY" rule.
 */
export const filterExperiences = (
  list: ExperienceView[],
  filters: ExperienceFilters
): ExperienceView[] =>
  list.filter(e => {
    if (filters.state !== 'all' && e.state !== filters.state) return false;
    if (filters.category !== 'all' && e.category !== filters.category)
      return false;
    if (filters.vehicle !== 'all' && e.vehicle !== filters.vehicle)
      return false;
    if (filters.objective !== 'all' && e.objective !== filters.objective)
      return false;
    if (filters.ev !== 'all' && e.evidence.tier !== filters.ev) return false;
    return true;
  });

/** Tab badge counts — prototype `tabs[].n` (~L16076). */
export const countByState = (
  list: ExperienceView[],
  state: ExperienceState | 'all'
): number => {
  if (state === 'all') return list.length;
  return list.filter(e => e.state === state).length;
};

export const findById = (
  list: ExperienceView[],
  id: string | null
): ExperienceView | null => (id ? (list.find(e => e.id === id) ?? null) : null);

/**
 * Where the canvas editor lives for this page.
 *
 * `slug || id` because a page created without a slug still has to be openable,
 * and the editor route resolves both shapes.
 */
export const canvasEditorHref = (experience: ExperienceView): string =>
  `/portal-v2/${encodeURIComponent(experience.slug || experience.id)}/canvas`;

/** An external landing has no canvas of ours to open. */
export const canEditCanvas = (experience: ExperienceView): boolean =>
  !experience.externalUrl;

/** `/p/{slug}` is the only preview surface, so no slug means no preview. */
export const canPreview = (experience: ExperienceView): boolean =>
  Boolean(experience.slug) && !experience.externalUrl;

/**
 * Chỉ TEMPLATE và BLOCK fork được.
 *
 * Gương của `experienceUsecase.Use`: gặp `kind: 'copy'` nó trả
 * `cannot fork a copy; only a template can be used`. Chặn ở đây để nút không
 * gửi đi một lời gọi chắc chắn hỏng — nhưng nơi gọi PHẢI hiện lý do thành chữ,
 * một nút xám không tự giải thích được vì sao nó xám.
 */
export const canUseExperience = (experience: ExperienceView): boolean =>
  experience.state === 'template' || experience.state === 'block';
