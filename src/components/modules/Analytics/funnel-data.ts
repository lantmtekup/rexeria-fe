'use client';

/**
 * Fetch + map dữ liệu thật cho panel "Phễu & Lead"
 * (be-spec-analytics-funnel-leads). Thay `buildDemoAnalytics` cũ.
 *
 * - `useFunnelAnalytics`: gọi song song funnel + sources + blocks + timeseries
 *   rồi map snake_case → `FunnelAnalytics` (camelCase) cho 2 view.
 * - `useLeads`: bảng Sales (paginated, sort score desc) + refetch sau mutate.
 */

import { useCallback, useEffect, useState } from 'react';

import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Lead } from '@/services/rexer/types';

import type { DateRange, FunnelAnalytics } from './funnel-types';

function errMessage(e: unknown): string {
  if (e instanceof RxApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Không tải được dữ liệu analytics';
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFunnelAnalytics(pageId: string, range: DateRange) {
  const [state, setState] = useState<AsyncState<FunnelAnalytics>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    setState(s => ({ ...s, loading: true, error: null }));

    Promise.all([
      rexerApi.pages.analytics.funnel(pageId, { range }),
      rexerApi.pages.analytics.sources(pageId, { range }),
      rexerApi.pages.analytics.blocks(pageId, { range }),
      rexerApi.pages.analytics.timeseries(pageId, { metric: 'visits', range }),
    ])
      .then(([funnel, sources, blocksRes, ts]) => {
        if (!alive) return;
        const prev = funnel.visits_prev_period;
        const visitsDeltaPct =
          prev > 0 ? Math.round(((funnel.visits - prev) / prev) * 100) : 0;

        const mapped: FunnelAnalytics = {
          funnel: {
            visits: funnel.visits,
            engaged: funnel.engaged,
            ctaClicks: funnel.cta_clicks,
            leads: funnel.leads,
            sql: funnel.sql,
            deals: funnel.deals,
          },
          sources: sources.items.map(s => ({
            source: s.utm_source,
            visits: s.visits,
            leads: s.leads,
          })),
          blocks: blocksRes.items.map(b => ({
            block: b.block_key,
            views: b.views,
            clicks: b.clicks,
            dwellSec: Math.round((b.total_dwell_ms ?? 0) / 1000),
          })),
          visitsByDay: ts.points.map(p => p.value),
          visitsDeltaPct,
          avgSessionSec: funnel.avg_session_sec,
          sqlThreshold: funnel.sql_threshold,
        };
        setState({ data: mapped, loading: false, error: null });
      })
      .catch(e => {
        if (!alive) return;
        setState({ data: null, loading: false, error: errMessage(e) });
      });

    return () => {
      alive = false;
    };
  }, [pageId, range]);

  return state;
}

export function useLeads(pageId: string, range: DateRange) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    // 200 dòng đủ cho bảng ưu tiên; số tổng/SQL lấy từ funnel (authoritative).
    rexerApi.leads
      .list({
        page_id: pageId,
        range,
        sort_by: 'score',
        sort_order: 'desc',
        limit: 200,
      })
      .then(res => {
        if (alive) setLeads(res.items);
      })
      .catch(e => {
        if (alive) setError(errMessage(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [pageId, range]);

  useEffect(() => load(), [load]);

  return { leads, loading, error, refetch: load, setLeads };
}
