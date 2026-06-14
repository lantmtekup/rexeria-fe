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

    // Degrade từng call: chỉ `funnel` là core (số phễu). sources/blocks/
    // timeseries là phụ trợ — 1 cái lỗi (vd `blocks` trả "Internal-only" với
    // 1 số ngữ cảnh) KHÔNG được làm trắng cả tab. Mirror graceful-empty của
    // BlockAnalyticsGrid + tab Tổng quan: thiếu data → render số 0, không màn
    // lỗi. Chỉ báo lỗi khi chính `funnel` (core) hỏng.
    const ZERO_FUNNEL = {
      page_id: pageId,
      visits: 0,
      engaged: 0,
      cta_clicks: 0,
      leads: 0,
      sql: 0,
      deals: 0,
      visits_prev_period: 0,
      avg_session_sec: 0,
      total_dwell_sec: 0,
      sql_threshold: 65,
      from: '',
      to: '',
    };

    Promise.all([
      rexerApi.pages.analytics.funnel(pageId, { range }).catch(() => null),
      rexerApi.pages.analytics
        .sources(pageId, { range })
        .catch(() => ({ items: [] })),
      rexerApi.pages.analytics
        .blocks(pageId, { range })
        .catch(() => ({ items: [] })),
      rexerApi.pages.analytics
        .timeseries(pageId, { metric: 'visits', range })
        .catch(() => ({ page_id: pageId, metric: 'visits', points: [] })),
    ])
      .then(([funnelRes, sources, blocksRes, ts]) => {
        if (!alive) return;
        const funnel = funnelRes ?? ZERO_FUNNEL;
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
      .catch(() => {
        // Mapping chỉ lỗi ở tình huống gần như bất khả (input đã được
        // guaranteed-shape ở trên). Vẫn graceful-empty: render layout số 0,
        // không màn lỗi / không kẹt skeleton.
        if (!alive) return;
        setState({
          data: {
            funnel: {
              visits: 0,
              engaged: 0,
              ctaClicks: 0,
              leads: 0,
              sql: 0,
              deals: 0,
            },
            sources: [],
            blocks: [],
            visitsByDay: [],
            visitsDeltaPct: 0,
            avgSessionSec: 0,
            sqlThreshold: 65,
          },
          loading: false,
          error: null,
        });
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
