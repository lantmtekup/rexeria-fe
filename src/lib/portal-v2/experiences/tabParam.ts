import { EXPERIENCE_TABS } from '@/lib/portal-v2/experiences/constants';
import type { ExperienceTab } from '@/lib/portal-v2/experiences/types';

/** Query param for the active tab: `?tab=block|template|…` (omit when `all`). */
export const EXPERIENCE_TAB_PARAM = 'tab';

/** The whole library — the URL-less default. */
export const EXPERIENCE_DEFAULT_TAB: ExperienceTab = 'all';

/**
 * Marks the canvas editor as editing a BLOCK rather than a landing page:
 * `/portal-v2/{blockId}/canvas?kind=block`. Lives here beside the library's own
 * param so the two names can be seen not to collide — they appear on different
 * routes, but `canvasEditorHref` writes one while the workspace writes the
 * other.
 */
export const CANVAS_KIND_PARAM = 'kind';

const VALID_TABS = new Set<string>(EXPERIENCE_TABS.map(tab => tab.id));

/**
 * A twin of `readExchangeTabParam` rather than a reuse of it: Exchange
 * validates against its own kind list, which has no ownership values.
 */
export const readExperienceTabParam = (
  searchParams: Record<string, string | string[] | undefined>
): ExperienceTab | null => {
  const raw = searchParams[EXPERIENCE_TAB_PARAM];
  const tab = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  if (!tab || !VALID_TABS.has(tab)) return null;
  return tab as ExperienceTab;
};

/**
 * Keeps the address bar in step with the tab row. `replaceState` avoids
 * re-running the server page — the same reason `writeExchangePreviewParam`
 * uses it, and the two params have to coexist on one URL.
 */
export const writeExperienceTabParam = (tab: ExperienceTab): void => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const current = url.searchParams.get(EXPERIENCE_TAB_PARAM);
  const next = tab === EXPERIENCE_DEFAULT_TAB ? null : tab;

  if (current === next) return;

  if (next) {
    url.searchParams.set(EXPERIENCE_TAB_PARAM, next);
  } else {
    url.searchParams.delete(EXPERIENCE_TAB_PARAM);
  }

  window.history.replaceState(window.history.state, '', url.toString());
};
