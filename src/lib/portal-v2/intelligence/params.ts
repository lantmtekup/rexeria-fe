import { FOCUS_PARAM } from '@/lib/portal-v2/intelligence/constants';
import type {
  IntelFocus,
  IntelViewState,
} from '@/lib/portal-v2/intelligence/types';

const parseFocus = (raw: string | undefined): IntelFocus => {
  if (
    raw === 'scale' ||
    raw === 'fix' ||
    raw === 'instrument' ||
    raw === 'refresh' ||
    raw === 'all'
  ) {
    return raw;
  }
  return 'all';
};

const readParam = (
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string | null => {
  const raw = searchParams[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return value || null;
};

export const readIntelViewState = (
  searchParams: Record<string, string | string[] | undefined>
): IntelViewState => ({
  focus: parseFocus(readParam(searchParams, FOCUS_PARAM) ?? undefined),
});

export const writeIntelViewState = (state: IntelViewState): void => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (state.focus === 'all') url.searchParams.delete(FOCUS_PARAM);
  else url.searchParams.set(FOCUS_PARAM, state.focus);
  window.history.replaceState(window.history.state, '', url.toString());
};

export const analyticsProofHref = (type: string, id: string): string =>
  `/portal-v2/analytics?lens=insights&itype=${type}&iobj=${encodeURIComponent(id)}`;
