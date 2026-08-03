import { EXCHANGE_KINDS } from '@/lib/portal-v2/exchange/constants';
import type { ExchangeKind } from '@/lib/portal-v2/exchange/types';

/** Query param for the active kind tab: `?tab=page|block` (omit when `all`). */
export const EXCHANGE_TAB_PARAM = 'tab';

const VALID_KINDS = new Set<string>(EXCHANGE_KINDS.map(k => k.id));

export const readExchangeTabParam = (
  searchParams: Record<string, string | string[] | undefined>
): ExchangeKind | null => {
  const raw = searchParams[EXCHANGE_TAB_PARAM];
  const tab = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  if (!tab || !VALID_KINDS.has(tab)) return null;
  return tab as ExchangeKind;
};

/**
 * Keeps the address bar in step with the kind tab. `replaceState` avoids
 * re-running the server page and keeps preview/history behavior predictable.
 */
export const writeExchangeTabParam = (kind: ExchangeKind): void => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  const current = url.searchParams.get(EXCHANGE_TAB_PARAM);
  const next = kind === 'all' ? null : kind;

  if (current === next || (current === null && next === null)) return;

  if (next) {
    url.searchParams.set(EXCHANGE_TAB_PARAM, next);
  } else {
    url.searchParams.delete(EXCHANGE_TAB_PARAM);
  }

  window.history.replaceState(window.history.state, '', url.toString());
};
