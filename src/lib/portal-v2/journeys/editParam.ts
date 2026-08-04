/** Query param that keeps the journey editor shareable: `?edit={journeyId}`. */
export const JOURNEY_EDIT_PARAM = 'edit';

export const readJourneyEditParam = (
  searchParams: Record<string, string | string[] | undefined>
): string | null => {
  const raw = searchParams[JOURNEY_EDIT_PARAM];
  const id = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return id || null;
};

/**
 * Keeps the address bar in step with the open editor. `replaceState` instead of
 * `router.replace` so the server page never re-runs, and so open/close never
 * piles up history entries — reload still restores the editor.
 */
export const writeJourneyEditParam = (journeyId: string | null): void => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const current = url.searchParams.get(JOURNEY_EDIT_PARAM);
  if (current === journeyId) return;

  if (journeyId) {
    url.searchParams.set(JOURNEY_EDIT_PARAM, journeyId);
  } else {
    url.searchParams.delete(JOURNEY_EDIT_PARAM);
  }

  window.history.replaceState(window.history.state, '', url.toString());
};
