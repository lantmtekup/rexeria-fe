import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type {
  RxAutomationCandidate,
  RxAutomationHubResponse,
} from '@/services/rexer-v2/types/automation';

/**
 * Automation qua API v2 — thay cho bản ghép tay bằng endpoint v1.
 *
 * Bản trước phải tự nối `insights.create` → poll → `handoff` → `pages.create`,
 * tự chấm điểm sẵn sàng, tự đóng master thành template. Nhánh
 * `feature/v2-migration` đã có sẵn cả bốn việc đó ở BE:
 *
 *   GET  /automations                  hub (template proven + automation đang có)
 *   POST /automations                  bước 1 — BE tự dựng master draft
 *   GET  /automations/{id}/candidates  bước 2 — sản phẩm + readiness BE chấm
 *   POST /automations/{id}/run         nhân bản
 *
 * Giữ luật chấm điểm ở BE là điều quan trọng nhất: chép nó sang FE chính là
 * cách hai bên lệch nhau, đúng như chuyện đã xảy ra với luật nhận diện video.
 */

export type AutomationHubResult = {
  data: RxAutomationHubResponse | null;
  error: string | null;
  /** 403 CAPABILITY_REQUIRED — gói tài khoản không có quyền, KHÔNG phải lỗi. */
  locked: boolean;
};

const message = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

/** 403 ở đây mang nghĩa "tính năng trả phí", phải tách khỏi lỗi thật. */
const isCapability = (err: unknown): boolean =>
  typeof err === 'object' &&
  err !== null &&
  'status' in err &&
  (err as { status?: number }).status === 403;

/**
 * Hub. `brandId` chỉ dùng được bởi platform admin — BE ép người dùng thường về
 * brand của chính họ qua `effectiveListBrandID`.
 *
 * Không truyền với admin thì hub LUÔN RỖNG: admin cố ý không thuộc brand nào,
 * và BE lấy brand từ phiên đăng nhập.
 */
export const fetchAutomationHub = async (
  brandId?: string | null
): Promise<AutomationHubResult> => {
  try {
    return {
      data: await rexerV2Api.automations.hub(brandId ?? undefined),
      error: null,
      locked: false,
    };
  } catch (err) {
    if (isCapability(err)) return { data: null, error: null, locked: true };
    return {
      data: null,
      error: message(err, 'Failed to load automations'),
      locked: false,
    };
  }
};

export const createAutomation = async (body: {
  sourceExperienceId: string;
  setupProductId: string;
  campaignId: string;
}) => {
  const res = await rexerV2Api.automations.create({
    source_experience_id: body.sourceExperienceId,
    setup_product_id: body.setupProductId,
    campaign_id: body.campaignId,
  });
  return res.automation;
};

export const fetchCandidates = async (
  automationId: string
): Promise<RxAutomationCandidate[]> => {
  const res = await rexerV2Api.automations.candidates(automationId);
  return res.items ?? [];
};

export const runAutomationV2 = (automationId: string, productIds: string[]) =>
  rexerV2Api.automations.run(automationId, { product_ids: productIds });

/** Canvas mở master theo id page mà BE trả về khi tạo automation. */
export const masterCanvasHrefById = (pageId: string): string =>
  `/portal-v2/${encodeURIComponent(pageId)}/canvas`;
