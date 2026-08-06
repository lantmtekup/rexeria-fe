/** Query param that keeps an open campaign shareable: `?id={campaignId}`. */
export const CAMPAIGN_ID_PARAM = 'id';

export const readCampaignIdParam = (
  searchParams: Record<string, string | string[] | undefined>
): string | null => {
  const raw = searchParams[CAMPAIGN_ID_PARAM];
  const id = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return id || null;
};

/**
 * Keeps the address bar in step with the open campaign. `replaceState` instead
 * of `router.replace` so the server page never re-runs — the list and the detail
 * share one state tree, and re-running the page would throw away every edit made
 * since the visit started.
 */
export const writeCampaignIdParam = (campaignId: string | null): void => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const current = url.searchParams.get(CAMPAIGN_ID_PARAM);
  if (current === campaignId) return;

  if (campaignId) {
    url.searchParams.set(CAMPAIGN_ID_PARAM, campaignId);
  } else {
    url.searchParams.delete(CAMPAIGN_ID_PARAM);
  }

  window.history.replaceState(window.history.state, '', url.toString());
};
