import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type {
  RxAutomationBriefPayload,
  RxAutomationCandidate,
  RxAutomationHubResponse,
  RxAutomationRunItem,
  RxAutomationRunSkip,
  RxCreateAutomationResponse,
} from '@/services/rexer-v2/types/automation';

/**
 * Automation qua API v2 — thay cho bản ghép tay bằng endpoint v1.
 *
 * Bản trước phải tự nối `insights.create` → poll → `handoff` → `pages.create`,
 * tự chấm điểm sẵn sàng, tự đóng master thành trải nghiệm gốc. Nhánh
 * `feature/v2-migration` đã có sẵn cả bốn việc đó ở BE:
 *
 *   GET  /automations                  hub (trải nghiệm gốc proven + automation đang có)
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

/**
 * Bước 1 — BE tự fork master draft TRONG MỘT transaction và trả `master_page_id`,
 * nên FE không phải tạo page rồi tự đóng canvas thành trải nghiệm gốc như bản cũ.
 */
export const createAutomation = (body: {
  sourceExperienceId: string;
  setupProductId: string;
  campaignId: string;
}): Promise<RxCreateAutomationResponse> =>
  rexerV2Api.automations.create({
    source_experience_id: body.sourceExperienceId,
    setup_product_id: body.setupProductId,
    campaign_id: body.campaignId,
  });

/**
 * Ứng viên. `widen` nới lớp hàng lên nhóm cha — BE quyết bằng
 * `core.CategoryMatches`, FE chỉ bật cờ.
 *
 * Danh sách CÓ CẢ sản phẩm gốc (BE không loại nó ra); người gọi tự tách vì chỉ
 * ở đó mới biết id nào đang là master.
 */
export const fetchCandidates = async (
  automationId: string,
  widen = false
): Promise<RxAutomationCandidate[]> => {
  const res = await rexerV2Api.automations.candidates(automationId, widen);
  return res.items ?? [];
};

/**
 * Nhân bản. KHÔNG đồng bộ: BE đọc canvas mới nhất của master (bản đã chỉnh
 * tay), fork một page cho mỗi sản phẩm, ENQUEUE việc điền nội dung cho worker
 * nền rồi trả về ngay.
 *
 * Nghĩa là không có 1–3 phút giữ tab như bản ghép tay — nhưng cũng KHÔNG có
 * nội dung tại thời điểm trả về. UI phải nói "đã xếp hàng", đừng nói "đã xong".
 */
export const runAutomationV2 = async (
  automationId: string,
  productIds: string[],
  inputs?: RxAutomationBriefPayload
): Promise<{
  created: RxAutomationRunItem[];
  skipped: RxAutomationRunSkip[];
}> => {
  const res = await rexerV2Api.automations.run(automationId, {
    product_ids: productIds,
    ...(inputs ? { inputs } : {}),
  });
  return { created: res.created ?? [], skipped: res.skipped ?? [] };
};

/** Canvas mở master theo id page mà BE trả về khi tạo automation. */
export const masterCanvasHrefById = (pageId: string): string =>
  `/portal-v2/${encodeURIComponent(pageId)}/canvas`;
