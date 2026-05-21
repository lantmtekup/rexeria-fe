'use client';

import { rexerApi } from '@/services/rexer/endpoints';
import type {
  BlockBreakdownRow as BEBlockBreakdownRow,
  TemplateAnalyticsSummaryRow as BETemplateSummaryRow,
} from '@/services/rexer/types';

import type {
  BlockBreakdownRow,
  RangePreset,
  TemplateAnalyticsRow,
} from './_fake-data';

const PRESET_TO_DAYS: Record<RangePreset, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
};

function rangeFor(preset: RangePreset): {
  start?: string;
  end?: string;
} {
  const days = PRESET_TO_DAYS[preset];
  if (days == null) return {};
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start: start.toISOString(), end: end.toISOString() };
}

/* ---------- adapters BE → portal ---------- */

function summaryToPortal(rows: BETemplateSummaryRow[]): TemplateAnalyticsRow[] {
  return rows.map(r => ({
    template_id: r.template_id,
    template_title: r.template_title ?? null,
    views: r.views ?? 0,
    unique_visitors: r.unique_visitors ?? 0,
    blocks_viewed: r.blocks_viewed ?? 0,
    total_clicks: r.total_clicks ?? 0,
  }));
}

function breakdownToPortal(rows: BEBlockBreakdownRow[]): BlockBreakdownRow[] {
  return rows.map(r => ({
    block_id: r.block_id,
    block_type: r.block_type ?? null,
    views: r.views ?? 0,
    clicks: r.clicks ?? 0,
    unique_viewers: r.unique_viewers ?? 0,
    avg_dwell_ms: r.avg_dwell_ms ?? null,
    total_dwell_ms: r.total_dwell_ms ?? null,
    top_action: r.top_action ?? null,
    top_target: r.top_target ?? null,
    actions: (r.actions ?? []).map(a => ({
      action: a.action,
      count: a.count ?? 0,
      unique_visitors: a.unique_visitors ?? 0,
      targets: a.targets ?? [],
    })),
    funnel: r.funnel ?? undefined,
    slides: r.slides ?? undefined,
    images: r.images ?? undefined,
  }));
}

/* ---------- hybrid loaders ---------- */

export type AnalyticsLoadResult<T> = {
  data: T;
  source: 'live' | 'fake';
  error?: string;
};

export async function loadSummary(
  preset: RangePreset,
  fallback: TemplateAnalyticsRow[]
): Promise<AnalyticsLoadResult<TemplateAnalyticsRow[]>> {
  try {
    const range = rangeFor(preset);
    const rows = await rexerApi.templateAnalytics.summary({
      ...range,
      limit: 50,
      sort: 'views',
    });
    return { data: summaryToPortal(rows), source: 'live' };
  } catch (err) {
    return {
      data: fallback,
      source: 'fake',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function loadBreakdown(
  templateId: string,
  preset: RangePreset,
  fallback: BlockBreakdownRow[]
): Promise<AnalyticsLoadResult<BlockBreakdownRow[]>> {
  try {
    const range = rangeFor(preset);
    const rows = await rexerApi.templateAnalytics.breakdown(templateId, range);
    return { data: breakdownToPortal(rows), source: 'live' };
  } catch (err) {
    return {
      data: fallback,
      source: 'fake',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
