export const EXPERIMENT_ID_PARAM = 'id';

export const readExperimentIdParam = (
  searchParams: Record<string, string | string[] | undefined>
): string | null => {
  const raw = searchParams[EXPERIMENT_ID_PARAM];
  const id = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return id || null;
};

export const writeExperimentIdParam = (experimentId: string | null): void => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (experimentId) {
    url.searchParams.set(EXPERIMENT_ID_PARAM, experimentId);
  } else {
    url.searchParams.delete(EXPERIMENT_ID_PARAM);
  }
  window.history.replaceState(window.history.state, '', url.toString());
};
