'use client';

import * as React from 'react';

export interface RxState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Tiny fetch hook — calls the provided `fn` once on mount and exposes
 * `{ data, loading, error }`. Not as feature-complete as SWR/React Query,
 * but enough to wire list pages to the REXER backend without adding a dep.
 */
export function useRexer<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [state, setState] = React.useState<RxState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let alive = true;
    setState(s => ({ ...s, loading: true, error: null }));
    fn()
      .then(data => {
        if (alive) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (alive) setState({ data: null, loading: false, error: err });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
