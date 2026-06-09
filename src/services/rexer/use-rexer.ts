'use client';

import * as React from 'react';
import { rexerApi } from './endpoints';
import type { InsightReport, InsightStatus } from './types';

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

/** Các status terminal — khi report đạt tới đây thì ngừng poll. */
const INSIGHT_TERMINAL: ReadonlySet<InsightStatus> = new Set([
  'succeeded',
  'failed',
]);

export interface InsightReportState {
  report: InsightReport | null;
  /** true cho tới khi nhận được report lần đầu. */
  loading: boolean;
  error: Error | null;
}

/**
 * Poll 1 insight report (kèm steps) mỗi `intervalMs` cho tới khi đạt status
 * terminal (succeeded|failed), rồi dừng. Tự dọn timer khi terminal/unmount
 * hoặc khi `id` đổi. Truyền `id = null` để tạm dừng (vd: chưa enqueue job).
 * Không dùng `console.*` (no-console là lỗi lint).
 */
export function useInsightReport(
  id: string | null,
  intervalMs = 2500
): InsightReportState {
  const [report, setReport] = React.useState<InsightReport | null>(null);
  const [loading, setLoading] = React.useState<boolean>(!!id);
  const [error, setError] = React.useState<Error | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!id) {
      setReport(null);
      setLoading(false);
      setError(null);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);

    const tick = async (): Promise<void> => {
      try {
        const next = await rexerApi.insights.get(id, true);
        if (!alive) return;
        setReport(next);
        setLoading(false);
        if (!INSIGHT_TERMINAL.has(next.status)) {
          timer.current = setTimeout(() => {
            void tick();
          }, intervalMs);
        }
      } catch (err) {
        if (!alive) return;
        setError(err as Error);
        setLoading(false);
      }
    };

    void tick();

    return () => {
      alive = false;
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [id, intervalMs]);

  return { report, loading, error };
}
