import { CANVAS_KIND_PARAM } from '@/lib/portal-v2/experiences/tabParam';
import type {
  ExperienceFilters,
  ExperienceTab,
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
 * Does this record belong under `tab`?
 *
 * `all` is the whole library, pages and blocks together. `block` is the block
 * half. The three ownership values are page lineage, so they exclude blocks by
 * construction — a block carries `state: null` and can never match one.
 */
export const matchesTab = (e: ExperienceView, tab: ExperienceTab): boolean => {
  if (tab === 'all') return true;
  if (tab === 'block') return e.kind === 'block';
  return e.kind === 'page' && e.state === tab;
};

/**
 * The filtered set. The query is applied server-side (`?q=`); the tab row and
 * every chip axis narrow client-side. Each axis follows the prototype's "unset
 * means ANY" rule.
 *
 * The chip axes are read per tab, matching `refineFacetsFor`: the Blocks tab
 * narrows on real block fields, every other tab on the shared seeded axes.
 * Applying a facet the drawer is not currently showing would silently hide rows
 * the user has no visible control to release.
 */
export const filterExperiences = (
  list: ExperienceView[],
  filters: ExperienceFilters
): ExperienceView[] =>
  list.filter(e => {
    if (!matchesTab(e, filters.tab)) return false;

    if (filters.tab === 'block') {
      if (filters.blockCat !== 'all' && e.blockCategory !== filters.blockCat)
        return false;
      // No declared surface means the block was saved before surfaces existed;
      // treat it as unrestricted rather than hiding it from every surface.
      if (
        filters.surface !== 'all' &&
        (e.supportedSurfaces?.length ?? 0) > 0 &&
        !e.supportedSurfaces!.includes(filters.surface)
      )
        return false;
      return true;
    }

    if (filters.vehicle !== 'all' && e.vehicle !== filters.vehicle)
      return false;
    if (filters.objective !== 'all' && e.objective !== filters.objective)
      return false;
    if (filters.ev !== 'all' && e.evidence.tier !== filters.ev) return false;
    return true;
  });

/** Badge counts for the tab row — prototype `tabs[].n` (~L16076). */
export const countByTab = (
  list: ExperienceView[],
  tab: ExperienceTab
): number => list.filter(e => matchesTab(e, tab)).length;

export const findById = (
  list: ExperienceView[],
  id: string | null
): ExperienceView | null => (id ? (list.find(e => e.id === id) ?? null) : null);

/**
 * Where the canvas editor lives for this record.
 *
 * Both kinds go through the SAME route. A page resolves by `slug || id` because
 * a page created without a slug still has to be openable, and the route
 * resolves both shapes. A block appends `?kind=block`, which is what tells
 * `CanvasEditor` to skip page resolution and hand the id to `BlockEditorV2` in
 * its block-direct mode (load `blocks.get(id).settings`, save via
 * `blocks.update`). The editor header then labels itself "Block", so the user
 * can tell which of the two they are in.
 */
export const canvasEditorHref = (experience: ExperienceView): string => {
  if (experience.kind === 'block') {
    return `/portal-v2/${encodeURIComponent(experience.id)}/canvas?${CANVAS_KIND_PARAM}=block`;
  }
  return `/portal-v2/${encodeURIComponent(experience.slug || experience.id)}/canvas`;
};

/** An external landing has no canvas of ours to open. A block always does. */
export const canEditCanvas = (experience: ExperienceView): boolean =>
  experience.kind === 'block' || !experience.externalUrl;

/**
 * A page previews at `/p/{slug}`, so no slug means no preview. A block previews
 * at `/embed/block/{id}` and always has an id.
 */
export const canPreview = (experience: ExperienceView): boolean =>
  experience.kind === 'block' ||
  (Boolean(experience.slug) && !experience.externalUrl);
