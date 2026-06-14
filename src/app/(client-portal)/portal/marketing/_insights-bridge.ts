/**
 * GĐ1 bridge Marketing → AI-Insights
 * (docs/plan-marketing-insights-bridge-2026-06-13.md §1-2).
 * Map brief Marketing (notes JSON) sang shape `InsightBrief` cho
 * `insights.create({inputs})`. `inputs` phía BE là additionalProperties nên
 * kèm thêm key ngoài interface (message_development, plan…) là hợp lệ —
 * bước understand_context sẽ tự digest.
 */

import type { InsightBrief } from '@/services/rexer/types';

import type { AssetsState } from './_assets';
import type { BriefField, BriefState, CampaignState } from './_steps';

/** Gộp text chính + các ô "Add more feature" thành 1 đoạn. */
const joined = (f?: BriefField): string =>
  f
    ? [f.text, ...f.extras]
        .map(t => t.trim())
        .filter(Boolean)
        .join('\n')
    : '';

/** Map objective campaign → chip objective của insights (logic.ts). */
const OBJECTIVE_MAP: Record<string, string> = {
  awareness: 'Nhận biết',
  traffic: 'Thu lead',
  conversion: 'Chuyển đổi',
  retention: 'Giáo dục',
};

export interface BridgeResult {
  inputs: Record<string, unknown>;
  coverage: { label: string; ok: boolean }[];
}

export function marketingToInsightInputs(
  brief: BriefState,
  assets: AssetsState,
  campaign: CampaignState
): BridgeResult {
  const d = brief.discovery;
  const c = brief.concept;

  const positioning = joined(d.marketingConcept);
  const message = joined(d.messageDevelopment);
  const visual = joined(d.creativeDirection);
  const contentMap = joined(d.contentMap);
  const benefits = joined(c.aboutConcept);
  const persona = joined(c.targetAudience);
  const plan = joined(c.plan);

  const assetNames = (['image', 'video', '3d'] as const).flatMap(k => [
    ...assets[k].items.map(i => i.name),
    ...assets[k].folders.flatMap(f => f.items.map(i => `${f.name}/${i.name}`)),
  ]);

  const insightBrief: InsightBrief = {
    brand: {
      positioning: positioning || undefined,
      visual_identity: visual || undefined,
      tone: [],
    },
    product: { benefits: benefits || undefined, features: [] },
    objective: {
      campaign_objectives: campaign.objective
        ? [OBJECTIVE_MAP[campaign.objective] ?? campaign.objective]
        : [],
    },
    audience: {
      persona: persona || undefined,
      behaviours: contentMap || undefined,
      pain_points: [],
      device: 'mobile',
    },
    market: {},
    assets: { items: assetNames },
    challenges: [],
  };

  const inputs: Record<string, unknown> = {
    ...insightBrief,
    // Ngoài schema chuẩn — understand_context đọc free-form.
    message_development: message || undefined,
    marketing_plan: plan || undefined,
    campaign_channels: campaign.channels.length ? campaign.channels : undefined,
    source: 'portal_marketing_bridge',
  };

  const coverage = [
    { label: 'Marketing Concept → định vị brand', ok: !!positioning },
    { label: 'Message Development → thông điệp', ok: !!message },
    { label: 'Creative Direction → visual identity', ok: !!visual },
    { label: 'Content Map → hành vi/journey', ok: !!contentMap },
    { label: 'About Concept → lợi ích sản phẩm', ok: !!benefits },
    { label: 'Target audience → persona', ok: !!persona },
    { label: 'Plan → kế hoạch triển khai', ok: !!plan },
    { label: 'Objective campaign', ok: !!campaign.objective },
    { label: `Assets (${assetNames.length} file)`, ok: assetNames.length > 0 },
  ];

  return { inputs, coverage };
}
