/**
 * GĐ1 bridge Marketing → AI-Insights
 * (docs/plan-marketing-insights-bridge-2026-06-13.md §1-2).
 * Map brief Marketing (notes JSON) + SẢN PHẨM gắn campaign sang shape
 * `InsightBrief` cho `insights.create({inputs})`. `inputs` phía BE là
 * additionalProperties nên kèm thêm key ngoài interface (message_development,
 * product_details…) là hợp lệ — bước understand_context tự digest.
 *
 * Campaign buộc gắn product (BE), nên dữ liệu sản phẩm thật (mô tả, features,
 * size/màu/thành phần/chứng nhận) ĐƯỢC đưa vào AI thay vì chỉ text concept.
 */

import { serializeCanvas } from '@/components/modules/block-editor/serialize';
import type { Block } from '@/components/modules/block-editor/types';
import { rexerApi } from '@/services/rexer/endpoints';
import type { InsightBrief, Page, Product } from '@/services/rexer/types';

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

/** Map objective campaign → mô tả mục tiêu rõ nghĩa cho AI digest. */
const OBJECTIVE_MAP: Record<string, string> = {
  awareness: 'Nhận biết thương hiệu',
  traffic: 'Tăng truy cập / traffic',
  conversion: 'Chuyển đổi / mua hàng',
  retention: 'Giữ chân / tái mua',
};

export interface BridgeResult {
  inputs: Record<string, unknown>;
  coverage: { label: string; ok: boolean }[];
}

export function marketingToInsightInputs(
  brief: BriefState,
  assets: AssetsState,
  campaign: CampaignState,
  product?: Product
): BridgeResult {
  const d = brief.discovery;
  const c = brief.concept;

  const positioning = joined(d.marketingConcept);
  const message = joined(d.messageDevelopment);
  const visual = joined(d.creativeDirection);
  const contentMap = joined(d.contentMap);
  const conceptBenefits = joined(c.aboutConcept);
  const persona = joined(c.targetAudience);
  const ageRange = c.targetAudience?.primary?.trim() || undefined;
  const planBudget = c.plan?.primary?.trim() || undefined;
  const planText = joined(c.plan);
  // Plan = ngân sách (ô Budget) + mô tả kế hoạch.
  const plan =
    [planBudget && `Ngân sách: ${planBudget}`, planText]
      .filter(Boolean)
      .join('\n') || '';

  // ── Sản phẩm gắn campaign → benefits/features/specs cho AI ──────────────
  const productFeatures = (product?.features ?? [])
    .map(f => [f.label, f.description].filter(Boolean).join(' — '))
    .filter(Boolean);
  // benefits = mô tả sản phẩm (data thật) + lợi ích concept (brief tự gõ).
  const benefits =
    [product?.description, conceptBenefits].filter(Boolean).join('\n\n') ||
    undefined;
  const productDetails = [
    product?.name && `Sản phẩm: ${product.name}`,
    product?.sku && `SKU: ${product.sku}`,
    product?.sizes?.length && `Kích cỡ: ${product.sizes.join(', ')}`,
    product?.colors?.length &&
      `Màu: ${product.colors.map(col => col.name).join(', ')}`,
    product?.ingredients?.length &&
      `Thành phần: ${product.ingredients.join(', ')}`,
    product?.certifications?.length &&
      `Chứng nhận: ${product.certifications
        .map(cert => cert.name)
        .filter(Boolean)
        .join(', ')}`,
  ]
    .filter(Boolean)
    .join('\n');

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
    product: { benefits, features: productFeatures },
    objective: {
      campaign_objectives: campaign.objective
        ? [OBJECTIVE_MAP[campaign.objective] ?? campaign.objective]
        : [],
    },
    audience: {
      persona: persona || undefined,
      age_range: ageRange,
      behaviours: contentMap || undefined,
      pain_points: [],
      // Landing chủ yếu mobile-first; AI vẫn cân nhắc desktop khi cần.
      device: 'both',
    },
    market: {},
    assets: { items: assetNames },
    challenges: [],
  };

  const inputs: Record<string, unknown> = {
    ...insightBrief,
    // Ngoài schema chuẩn — understand_context đọc free-form.
    product_name: product?.name || undefined,
    product_details: productDetails || undefined,
    message_development: message || undefined,
    marketing_plan: plan || undefined,
    campaign_channels: campaign.channels.length ? campaign.channels : undefined,
    campaign_budget: campaign.budget
      ? `${campaign.budget} ${campaign.currency}`
      : undefined,
    source: 'portal_marketing_bridge',
  };

  const coverage = [
    {
      label: 'Sản phẩm gắn campaign → benefits/features',
      ok: !!product && (!!benefits || productFeatures.length > 0),
    },
    { label: 'Marketing Concept → định vị brand', ok: !!positioning },
    { label: 'Message Development → thông điệp', ok: !!message },
    { label: 'Creative Direction → visual identity', ok: !!visual },
    { label: 'Content Map → hành vi/journey', ok: !!contentMap },
    { label: 'About Concept → lợi ích bổ sung', ok: !!conceptBenefits },
    { label: 'Target audience → persona', ok: !!persona },
    { label: 'Plan → kế hoạch triển khai', ok: !!plan },
    { label: 'Objective campaign', ok: !!campaign.objective },
    { label: `Assets (${assetNames.length} file)`, ok: assetNames.length > 0 },
  ];

  return { inputs, coverage };
}

/**
 * Tạo landing page TỪ block AI chọn — gửi `canvas_blueprint` (block + transition)
 * lên `POST /portal/templates` (KHÔNG gửi source_template_id). BE tự dựng
 * template+version+page. Đúng block, preview khớp, mở BlockEditor.
 * CHỜ BE bỏ ràng buộc bắt buộc source_template_id
 * (docs/be-spec-portal-page-from-blueprint-2026-06-17.md) — tới lúc đó call này
 * 400 `source_template_id is required` → caller hiện toast lỗi.
 */
export async function createLandingFromBlueprint(
  blocks: Block[],
  name: string,
  workspaceId: string,
  transition?: string
): Promise<Page> {
  const blueprint = serializeCanvas(blocks, undefined, undefined, transition);
  const page = await rexerApi.portal.createTemplate({
    name,
    workspace_id: workspaceId,
    canvas_blueprint: blueprint,
  });
  return page as unknown as Page;
}
