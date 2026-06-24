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
import type { Lead } from '@/services/rexer/types';

import type { DateRange, FunnelAnalytics } from './funnel-types';

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

    // Degrade từng call + FALLBACK. `/analytics/funnel|timeseries|sources` có
    // thể 404 (reverse proxy prod chưa forward `/v1/analytics/*`) → khi đó
    // dựng số phễu từ `summary` + `breakdown(event_type)` (path-param
    // `/v1/pages/:id/analytics/*` — luôn được proxy forward, giống tab Tổng
    // quan). Nhờ vậy Phễu vẫn có visits/engaged/cta/leads thật thay vì rỗng.
    Promise.all([
      rexerApi.pages.analytics.funnel(pageId, { range }).catch(() => null),
      rexerApi.pages.analytics.summary(pageId, { range }).catch(() => null),
      rexerApi.pages.analytics
        .breakdown(pageId, { group_by: 'event_type', range })
        .then(r => r.items ?? [])
        .catch(() => []),
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
      .then(([funnelRes, sum, evt, sources, blocksRes, ts]) => {
        if (!alive) return;
        const pv = evt.find(r => r.key === 'page_view');
        const scroll = evt.find(r => r.key === 'scroll_depth');

        // Ưu tiên endpoint funnel; thiếu (404) → suy từ summary + breakdown.
        const visits = funnelRes?.visits || sum?.page_views || 0;
        const ctaClicks = funnelRes?.cta_clicks || sum?.clicks || 0;
        const leads = funnelRes?.leads || sum?.conversions || 0;
        // engaged ≈ số session có scroll (proxy khi không có funnel thật).
        const engaged =
          funnelRes?.engaged || scroll?.metrics.unique_session || 0;
        const sql = funnelRes?.sql ?? 0;
        const deals = funnelRes?.deals ?? 0;

        // visitsByDay: timeseries nếu có, không thì views_by_day của page_view.
        const visitsByDay =
          ts.points.length > 0
            ? ts.points.map(p => p.value)
            : (pv?.views_by_day ?? []);

        const prev = funnelRes?.visits_prev_period ?? 0;
        const visitsDeltaPct =
          prev > 0 ? Math.round(((visits - prev) / prev) * 100) : 0;

        const mapped: FunnelAnalytics = {
          funnel: { visits, engaged, ctaClicks, leads, sql, deals },
          sources: sources.items.map(s => ({
            source: s.utm_source,
            visits: s.visits,
            leads: s.leads,
          })),
          blocks: blocksRes.items.map(b => ({
            // Tên đẹp (section_label site gửi kèm) khi BE trả `label`; chưa có
            // thì fallback `block_key` thô. Đồng bộ với overlay trên site.
            block: b.label ?? b.block_key,
            views: b.views,
            clicks: b.clicks,
            // BE `/blocks` trả `avg_dwell_ms` (per-view, ms) — KHÔNG có
            // `total_dwell_ms` (đó là field của /breakdown). Tổng dwell =
            // avg_dwell_ms × views → giây. (Trước đọc nhầm field → luôn 0s.)
            dwellSec: Math.round(((b.avg_dwell_ms ?? 0) * b.views) / 1000),
          })),
          visitsByDay,
          visitsDeltaPct,
          avgSessionSec: funnelRes?.avg_session_sec ?? 0,
          sqlThreshold: funnelRes?.sql_threshold ?? 65,
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
      .catch(() => {
        // `/v1/leads` có thể 403 "Internal-only" với portal user (hoặc chưa
        // forward qua proxy). Graceful: bảng rỗng + empty state "Chưa có lead",
        // KHÔNG đổ chuỗi lỗi ra "Danh sách ưu tiên" — đồng nhất các tab khác.
        if (alive) {
          setLeads([]);
          setError(null);
        }
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
