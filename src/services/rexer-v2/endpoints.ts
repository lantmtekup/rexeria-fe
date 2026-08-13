/**
 * v2 BE endpoints, grouped by domain — the Portal V2 counterpart of
 * `src/services/rexer/endpoints.ts`.
 *
 * Everything here goes through `rxV2()`, which targets the v2 deployment
 * (`NEXT_PUBLIC_REXER_API_V2`). Paths are still `/v1/...` upstream: the BE has
 * no `/v2` route prefix, the two services differ by host only.
 *
 * Opt-in — importing `rexerApi` (v1) elsewhere is unaffected. Only add a
 * namespace here when the endpoint exists ONLY on v2, or when a Portal V2
 * surface deliberately wants the v2 deployment.
 *
 * Types live one file per domain under `./types/` (mirroring `src/types/`), so
 * this stays readable instead of growing into another 3k-line `types.ts`. Add a
 * new domain = a new `./types/<domain>.ts` + a new namespace below.
 */
import { rxV2 } from '@/services/rexer/client';

import type {
  RxCreateExchangeListingRequest,
  RxExchangeItemDetail,
  RxExchangeListQuery,
  RxExchangeListResponse,
  RxExchangeListing,
} from './types/exchange';
import type {
  RxCampaign,
  RxCampaignItem,
  RxCampaignItemsResponse,
  RxCreateCampaignItemRequest,
  RxUpdateCampaignItemRequest,
  RxCampaignListResponse,
  RxCreateCampaignRequest,
  RxUpdateCampaignRequest,
} from './types/campaign';
import type {
  RxCreateJourneyRequest,
  RxJourney,
  RxJourneyListResponse,
  RxJourneyReadiness,
  RxJourneyStats,
  RxUpdateJourneyRequest,
} from './types/journey';
import type {
  RxIntelBlocksResponse,
  RxIntelCampaignsResponse,
  RxIntelFunnel,
  RxIntelOverview,
  RxIntelQuery,
  RxIntelSegmentsResponse,
  RxIntelTrust,
} from './types/intel';
import type {
  RxBrandMembersResponse,
  RxCapabilities,
  RxInviteMemberRequest,
  RxMembershipEnvelope,
  RxGovernance,
  RxMeProfile,
  RxPutGovernanceRequest,
} from './types/settings';
import type {
  RxCreateExperienceRequest,
  RxExperience,
  RxExperienceCoverage,
  RxExperienceDetail,
  RxExperienceListQuery,
  RxExperienceListResponse,
  RxExperienceStats,
  RxUseExperienceRequest,
  RxPromoteExperienceRequest,
} from './types/experience';
import type {
  RxBrandProfile,
  RxPutBrandProfileRequest,
} from './types/brandProfile';
import type {
  RxAutomation,
  RxAutomationCandidatesResponse,
  RxAutomationHubResponse,
  RxCreateAutomationRequest,
  RxCreateAutomationResponse,
  RxRunAutomationRequest,
  RxRunAutomationResponse,
} from './types/automation';

/**
 * Lát cắt §8 → query string. Bỏ khoá rỗng: `campaign_id=` là 400
 * INVALID_UUID ở BE, không phải "không lọc".
 */
const intelQuery = (q: RxIntelQuery): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(q)) {
    if (value) out[key] = String(value);
  }
  return out;
};

export const rexerV2Api = {
  // ── Automation — v2-only. BE tự chấm readiness và tự dựng master draft. ──
  automations: {
    /**
     * `GET /v1/automations` — hub: template đã đánh dấu Proven + các automation
     * đang có. 403 `CAPABILITY_REQUIRED` nếu gói tài khoản không có quyền
     * `automate`; đây là cổng TRẢ PHÍ, phải phân biệt với lỗi thường.
     */
    hub: (brandId?: string) =>
      rxV2<RxAutomationHubResponse>('/automations', {
        ...(brandId ? { query: { brand_id: brandId } } : {}),
      }),

    /**
     * `POST /v1/automations` — chốt bước 1. BE dựng luôn MASTER DRAFT và trả về
     * `master_page_id`, nên FE không phải tự tạo page rồi tự đóng template.
     */
    create: (body: RxCreateAutomationRequest) =>
      rxV2<RxCreateAutomationResponse>('/automations', {
        method: 'POST',
        body,
      }),

    get: (automationId: string) =>
      rxV2<RxAutomation>(`/automations/${automationId}`),

    /**
     * `GET /v1/automations/{id}/candidates` — sản phẩm đủ điều kiện, KÈM điểm
     * sẵn sàng từng ô phễu do BE chấm. Không tự chấm lại ở FE: luật nằm ở BE,
     * chép sang đây là mở đường cho hai bên lệch nhau.
     */
    candidates: (automationId: string, widen = false) =>
      rxV2<RxAutomationCandidatesResponse>(
        `/automations/${automationId}/candidates${widen ? '?widen=true' : ''}`
      ),

    /**
     * `POST /v1/automations/{id}/run` — nhân bản sang các sản phẩm đã chọn.
     * BE lo toàn bộ chuỗi report → handoff → page; FE không ghép tay nữa.
     */
    /**
     * `POST /v1/automations/{id}/run` — fork bản nháp cho từng sản phẩm rồi
     * ENQUEUE việc điền nội dung cho worker nền.
     *
     * Trả về NGAY với danh sách page đã tạo; nội dung chưa có tại thời điểm
     * này. Đừng dựng UI kiểu "chờ tới khi xong" — không có gì để chờ trong lời
     * gọi này.
     *
     * Cần quyền brand manager: nhân một thiết kế ra cả lớp sản phẩm sinh hàng
     * loạt bản nháp trong thư viện của tenant.
     */
    run: (automationId: string, body: RxRunAutomationRequest) =>
      rxV2<RxRunAutomationResponse>(`/automations/${automationId}/run`, {
        method: 'POST',
        body,
      }),
  },

  // ── Brand profile (spec §13.1) — bốn mục khớp bốn tab của màn Brand ────
  brandProfile: {
    get: (brandId: string) =>
      rxV2<RxBrandProfile>(`/brands/${brandId}/profile`),

    /**
     * PUT thay TOÀN BỘ mục nào được gửi; bỏ khoá = giữ nguyên mục đó.
     * `version` phải là số vừa đọc về — lệch thì BE từ chối, đó là cách nó
     * chặn hai tab ghi đè lẫn nhau.
     */
    put: (brandId: string, body: RxPutBrandProfileRequest) =>
      rxV2<RxBrandProfile>(`/brands/${brandId}/profile`, {
        method: 'PUT',
        body,
      }),
  },

  // ── Settings (spec §14) ──────────────────────────────────────────────────
  settings: {
    /** `brand_id` bắt buộc với platform admin — thiếu là 400. */
    governance: (brandId?: string) =>
      rxV2<RxGovernance>(
        `/org/governance${brandId ? `?brand_id=${encodeURIComponent(brandId)}` : ''}`
      ),

    /** PUT gửi TOÀN BỘ tài liệu; `version` lệch ⇒ 409 STALE_VERSION. */
    putGovernance: (body: RxPutGovernanceRequest, brandId?: string) =>
      rxV2<RxGovernance>(
        `/org/governance${brandId ? `?brand_id=${encodeURIComponent(brandId)}` : ''}`,
        { method: 'PUT', body }
      ),

    resetGovernance: (brandId?: string) =>
      rxV2<RxGovernance>(
        `/org/governance/reset${brandId ? `?brand_id=${encodeURIComponent(brandId)}` : ''}`,
        { method: 'POST' }
      ),

    capabilities: (brandId?: string) =>
      rxV2<RxCapabilities>(
        `/org/capabilities${brandId ? `?brand_id=${encodeURIComponent(brandId)}` : ''}`
      ),

    setAccountType: (accountType: string, brandId?: string) =>
      rxV2<RxCapabilities>(
        `/org/account-type${brandId ? `?brand_id=${encodeURIComponent(brandId)}` : ''}`,
        { method: 'PATCH', body: { account_type: accountType } }
      ),

    /** Thành viên của brand — nguồn của tab "Team & roles". */
    members: (brandId: string) =>
      rxV2<RxBrandMembersResponse>(`/brands/${brandId}/users`),

    inviteMember: (brandId: string, body: RxInviteMemberRequest) =>
      rxV2<RxMembershipEnvelope>(`/brands/${brandId}/users`, {
        method: 'POST',
        body,
      }),

    setMemberRole: (brandId: string, userId: string, role: string) =>
      rxV2<RxMembershipEnvelope>(`/brands/${brandId}/users/${userId}`, {
        method: 'PATCH',
        body: { role },
      }),

    removeMember: (brandId: string, userId: string) =>
      rxV2<void>(`/brands/${brandId}/users/${userId}`, { method: 'DELETE' }),

    /** Hồ sơ của CHÍNH người đăng nhập — không theo brand. */
    meProfile: () => rxV2<RxMeProfile>('/me/profile'),

    putMeProfile: (body: RxMeProfile) =>
      rxV2<RxMeProfile>('/me/profile', { method: 'PUT', body }),
  },

  // ── Intel (spec §8) ──────────────────────────────────────────────────────
  //
  // Mọi số ở đây suy từ `fact_daily` LÚC ĐỌC — không entity nào lưu sẵn, nên
  // đọc lại sau khi rollup chạy sẽ ra số khác mà không cần ghi gì.
  //
  // `experience_id` nhận cả id template lẫn id bản copy: BE tự nở template ra
  // toàn bộ copy của nó (khái niệm), nên đây chính là lát cắt "thành tích của
  // một trải nghiệm trên mọi chiến dịch".
  intel: {
    /**
     * `GET /v1/intel/segments` — phân khúc hành vi `s1..s8` kèm số ĐO ĐƯỢC.
     * `brand_id` chỉ platform admin dùng được; thiếu nó admin đọc brand rỗng
     * và mọi số về 0 bất kể màn hình đang xem brand nào.
     */
    segments: (brandId?: string) =>
      rxV2<RxIntelSegmentsResponse>(
        `/intel/segments${brandId ? `?brand_id=${encodeURIComponent(brandId)}` : ''}`
      ),

    /** `GET /v1/intel/overview` — tổng đo + bậc tin cậy + đường xu hướng. */
    overview: (query: RxIntelQuery = {}) =>
      rxV2<RxIntelOverview>('/intel/overview', { query: intelQuery(query) }),

    /** `GET /v1/intel/funnel` — năm chặng theo vai phễu + chỗ rò lớn nhất. */
    funnel: (query: RxIntelQuery = {}) =>
      rxV2<RxIntelFunnel>('/intel/funnel', { query: intelQuery(query) }),

    /**
     * `GET /v1/intel/campaigns` — đóng góp theo chiến dịch.
     *
     * `expand=subjects` mới có tầng hạng mục → trải nghiệm; danh sách trần chỉ
     * có tầng chiến dịch, nên màn drill phải gọi kèm cờ này.
     */
    campaigns: (query: RxIntelQuery = {}, expandSubjects = false) =>
      rxV2<RxIntelCampaignsResponse>('/intel/campaigns', {
        query: {
          ...intelQuery(query),
          ...(expandSubjects ? { expand: 'subjects' } : {}),
        },
      }),

    /** `GET /v1/intel/blocks` — bảng đóng góp, gộp theo `block_type_code`. */
    blocks: (query: RxIntelQuery = {}) =>
      rxV2<RxIntelBlocksResponse>('/intel/blocks', {
        query: intelQuery(query),
      }),

    /** `GET /v1/intel/blocks/rank` — top block của MỘT vai (ATT|EDU|EXP|TRU|CON). */
    blocksRank: (role: string, query: RxIntelQuery = {}) =>
      rxV2<RxIntelBlocksResponse>('/intel/blocks/rank', {
        query: { ...intelQuery(query), role },
      }),

    /**
     * `GET /v1/intel/trust` — kiểm định chất lượng dữ liệu.
     *
     * `coverage.tracked_components_pct` là nguồn DUY NHẤT cho ô "độ phủ đo" ở
     * cấp brand; đừng suy nó từ số block như bản mock từng làm.
     */
    trust: (query: RxIntelQuery = {}) =>
      rxV2<RxIntelTrust>('/intel/trust', { query: intelQuery(query) }),
  },

  // ── Journeys (spec §6) ───────────────────────────────────────────────────
  journeys: {
    list: (
      query: {
        brand_id?: string;
        campaign_id?: string;
        state?: string;
        q?: string;
        limit?: number;
      } = {}
    ) => {
      const qs = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
      });
      const suffix = qs.toString();
      return rxV2<RxJourneyListResponse>(
        `/journeys${suffix ? `?${suffix}` : ''}`
      );
    },

    get: (journeyId: string) => rxV2<RxJourney>(`/journeys/${journeyId}`),

    create: (body: RxCreateJourneyRequest) =>
      rxV2<RxJourney>('/journeys', { method: 'POST', body }),

    /** Thay toàn bộ. `version` lệch ⇒ BE từ chối, đó là cách nó chặn ghi đè. */
    update: (journeyId: string, body: RxUpdateJourneyRequest) =>
      rxV2<RxJourney>(`/journeys/${journeyId}`, { method: 'PUT', body }),

    /** Fork blueprint lên một chiến dịch — một chiến dịch, một hành trình. */
    use: (journeyId: string, campaignId: string) =>
      rxV2<RxJourney>(`/journeys/${journeyId}/use`, {
        method: 'POST',
        body: { campaign_id: campaignId },
      }),

    /** Đưa bản copy ngược thành blueprint dùng chung. */
    promote: (journeyId: string, name: string) =>
      rxV2<RxJourney>(`/journeys/${journeyId}/promote`, {
        method: 'POST',
        body: { name },
      }),

    duplicate: (journeyId: string) =>
      rxV2<RxJourney>(`/journeys/${journeyId}/duplicate`, { method: 'POST' }),

    /**
     * `GET /v1/journeys/{id}/readiness` — ba mục ở tầng cao hơn bộ kiểm đồ thị
     * mà FE tự chạy: hợp đồng có qua không, mọi node trải nghiệm đã resolve
     * thành fork chưa, và đã có điểm đo chưa.
     */
    readiness: (journeyId: string) =>
      rxV2<RxJourneyReadiness>(`/journeys/${journeyId}/readiness`),

    /** `GET /v1/journeys/{id}/stats` — số ĐO ĐƯỢC của hành trình. */
    stats: (journeyId: string) =>
      rxV2<RxJourneyStats>(`/journeys/${journeyId}/stats`),

    remove: (journeyId: string) =>
      rxV2<void>(`/journeys/${journeyId}`, { method: 'DELETE' }),
  },

  // ── Campaigns (spec §5) — shape v2, KHÁC client v1 ở services/rexer ───────
  campaigns: {
    list: (
      query: {
        brand_id?: string;
        q?: string;
        page?: number;
        limit?: number;
      } = {}
    ) => {
      const qs = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
      });
      const suffix = qs.toString();
      return rxV2<RxCampaignListResponse>(
        `/campaigns${suffix ? `?${suffix}` : ''}`
      );
    },

    /** Trả KÈM `items[]`; danh sách thì không, nên detail phải gọi riêng. */
    get: (campaignId: string) => rxV2<RxCampaign>(`/campaigns/${campaignId}`),

    create: (body: RxCreateCampaignRequest) =>
      rxV2<RxCampaign>('/campaigns', { method: 'POST', body }),

    /** PUT, không phải PATCH — server trả 404 cho PATCH. */
    update: (campaignId: string, body: RxUpdateCampaignRequest) =>
      rxV2<RxCampaign>(`/campaigns/${campaignId}`, { method: 'PUT', body }),

    /**
     * Chỉ nhận `'done'` (chốt tay) hoặc `null` (bỏ chốt, để BE suy lại). Mọi
     * giá trị khác là 400 INVALID_TRANSITION — trạng thái do
     * `core.DeriveCampaignStage` quyết, không phải do màn hình đặt.
     */
    setStatus: (campaignId: string, status: 'done' | null) =>
      rxV2<RxCampaign>(`/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        body: { status },
      }),

    duplicate: (campaignId: string) =>
      rxV2<RxCampaign>(`/campaigns/${campaignId}/duplicate`, {
        method: 'POST',
      }),

    remove: (campaignId: string) =>
      rxV2<void>(`/campaigns/${campaignId}`, { method: 'DELETE' }),

    items: (campaignId: string) =>
      rxV2<RxCampaignItemsResponse>(`/campaigns/${campaignId}/items`),

    /**
     * Hạng mục KHÔNG đi qua `PUT /campaigns` — `UpdateCampaignV2Request` không
     * có trường `items`. Thêm/sửa/xoá đều phải qua bộ endpoint riêng này.
     */
    addItem: (campaignId: string, body: RxCreateCampaignItemRequest) =>
      rxV2<RxCampaignItem>(`/campaigns/${campaignId}/items`, {
        method: 'POST',
        body,
      }),

    updateItem: (
      campaignId: string,
      itemId: string,
      body: RxUpdateCampaignItemRequest
    ) =>
      rxV2<RxCampaignItem>(`/campaigns/${campaignId}/items/${itemId}`, {
        method: 'PUT',
        body,
      }),

    setItemStatus: (campaignId: string, itemId: string, status: string) =>
      rxV2<RxCampaignItem>(`/campaigns/${campaignId}/items/${itemId}/status`, {
        method: 'PATCH',
        body: { status },
      }),

    removeItem: (campaignId: string, itemId: string) =>
      rxV2<void>(`/campaigns/${campaignId}/items/${itemId}`, {
        method: 'DELETE',
      }),
  },

  // ── Experiences — thư viện trải nghiệm THẬT, thay cho việc suy từ /pages ──
  experiences: {
    /**
     * `GET /v1/experiences` — template + copy + block, KHÔNG giới hạn
     * `status=published` như bản v1 suy từ `/pages`.
     *
     * `signal_coverage`/`funnel_coverage` bị BỎ QUA với loại không đo được;
     * thiếu nghĩa là chưa đo, không phải 0%.
     */
    list: (query: RxExperienceListQuery = {}) => {
      const qs = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
      });
      const suffix = qs.toString();
      return rxV2<RxExperienceListResponse>(
        `/experiences${suffix ? `?${suffix}` : ''}`
      );
    },

    /**
     * `GET /v1/experiences/{id}` — chi tiết, **kèm `layers[]` thật**.
     *
     * Không thay được bằng bản ghi trong danh sách: danh sách chỉ có
     * `funnel_coverage`, và đo trên dữ liệu thật thì 99/100 bản ghi trả `null`.
     */
    get: (experienceId: string) =>
      rxV2<RxExperienceDetail>(`/experiences/${experienceId}`),

    /** `measured:false` ⇒ chưa chạy lần nào; mọi số kèm theo là 0 mặc định. */
    stats: (experienceId: string) =>
      rxV2<RxExperienceStats>(`/experiences/${experienceId}/stats`),

    /**
     * `POST /v1/experiences/{id}/use` — fork một TEMPLATE (hoặc block) thành
     * bản copy nằm trong một hạng mục chiến dịch.
     *
     * `campaign_id` và `item_id` đều **bắt buộc** (`validate:"required,uuid"`):
     * không có hạng mục thì không fork được, vì bản copy được định nghĩa bằng
     * chính chỗ nó thuộc về. Đây cũng là cột `ListCopies` lọc, nên đây là
     * đường DUY NHẤT làm một mục hiện ra ở tab "Bản copy".
     *
     * Fork idempotent theo `(origin, item)`: bấm hai lần trả về đúng bản cũ
     * (201 lần đầu, 200 lần sau) — không tạo bản thứ hai. Đã kiểm bằng dữ liệu
     * thật 2026-08-07.
     *
     * KHÔNG đọc mã trạng thái ở đây: `raw: true` sẽ bỏ qua luôn tầng bắt lỗi
     * của client, nghĩa là 403/400 không còn throw. Muốn biết "đã có sẵn" thì
     * xem `item.experiences[]` — `GET /campaigns/{id}/items` trả sẵn, và biết
     * TRƯỚC khi bấm còn hữu ích hơn biết sau.
     *
     * Fork một BẢN COPY thì BE từ chối: `cannot fork a copy; only a template
     * can be used`.
     */
    use: (experienceId: string, body: RxUseExperienceRequest) =>
      rxV2<RxExperience>(`/experiences/${experienceId}/use`, {
        method: 'POST',
        body,
      }),

    /**
     * `POST /v1/experiences/{id}/proven` — bật/tắt dấu Proven.
     *
     * Đây là cột THẬT trên bảng `templates` (migration 000050/000052 của v2),
     * không phải chỗ chứa tạm. Bản v1 phải nhét vào `pages.type_metadata` vì
     * schema của main không có cột này.
     */
    setProven: (experienceId: string, proven: boolean) =>
      rxV2<RxExperience>(`/experiences/${experienceId}/proven`, {
        method: 'POST',
        body: { proven },
      }),

    /**
     * `POST /v1/experiences/{id}/promote` — biến một BẢN COPY (page) thành
     * template của chính brand đó.
     *
     * Đây là đường DUY NHẤT để một trang đã chạy vào được hub Automation: hub
     * đọc `ListProvenTemplates`, tức bảng `templates`, nên đánh dấu Proven cho
     * một page không đưa nó vào hub — page không phải template.
     *
     * `template_code` bỏ trống thì BE tự sinh; trùng code là 409.
     */
    promote: (experienceId: string, body: RxPromoteExperienceRequest) =>
      rxV2<RxExperience>(`/experiences/${experienceId}/promote`, {
        method: 'POST',
        body,
      }),

    /**
     * `POST /v1/campaigns/{cid}/items/{iid}/experiences` — gắn một trải nghiệm
     * vào hạng mục.
     *
     * Gắn một TEMPLATE thì BE tự fork ra bản copy (R1: chiến dịch không bao giờ
     * giữ template) và tự cấp id — nên đừng suy id ở FE.
     */
    attachToItem: (campaignId: string, itemId: string, experienceId: string) =>
      rxV2<RxExperience>(
        `/campaigns/${campaignId}/items/${itemId}/experiences`,
        { method: 'POST', body: { experience_id: experienceId } }
      ),

    /** Gỡ = XOÁ bản copy: một copy rời khỏi hạng mục thì không còn nghĩa gì. */
    detachFromItem: (
      campaignId: string,
      itemId: string,
      experienceId: string
    ) =>
      rxV2<void>(
        `/campaigns/${campaignId}/items/${itemId}/experiences/${experienceId}`,
        { method: 'DELETE' }
      ),

    /** `GET /v1/experiences/{id}/coverage` — độ phủ phễu ĐO ĐƯỢC, không seed. */
    coverage: (experienceId: string) =>
      rxV2<RxExperienceCoverage>(`/experiences/${experienceId}/coverage`),

    /**
     * `POST /v1/experiences` — tạo mới. 201 kèm `edit_url`.
     *
     * `category: 'collection'` dựng một **Template** ở trạng thái `draft`,
     * `'blocks'` dựng một **Block**. Không đường nào ra một bản copy, nên món
     * vừa tạo KHÔNG hiện ở thư viện Experiences. Đó là lý do màn hình phải
     * đưa người dùng thẳng vào canvas bằng `edit_url` thay vì chèn một thẻ.
     */
    create: (body: RxCreateExperienceRequest) =>
      rxV2<RxExperience>('/experiences', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    /**
     * `POST /v1/experiences/{id}/duplicate` — bản sao thuộc cùng brand.
     *
     * KHÔNG cùng loại với bản gốc: `Duplicate` (`usecase/experience.go:866`)
     * nhân bản một **copy** bằng cách PROMOTE nó thành một template mới, vì
     * hai copy cùng `origin`+`item` sẽ đếm trùng fact row (spec §4.11). Template
     * ra template. Nghĩa là nhân bản từ màn này cho ra một món nằm ở Exchange.
     */
    duplicate: (experienceId: string) =>
      rxV2<RxExperience>(`/experiences/${experienceId}/duplicate`, {
        method: 'POST',
      }),

    /** `DELETE /v1/experiences/{id}` — 204, không có thân phản hồi. */
    remove: (experienceId: string) =>
      rxV2<void>(`/experiences/${experienceId}`, { method: 'DELETE' }),
  },

  // ── Exchange (spec §15) — v2-only, absent from the v1 deployment ────────
  exchange: {
    /**
     * `GET /v1/exchange/items` — only `status: 'listed'` rows, cross-tenant.
     * Facets are applied server-side; response is `{ items, total }`.
     */
    list: (query: RxExchangeListQuery = {}) =>
      rxV2<RxExchangeListResponse>('/exchange/items', { query }),

    /**
     * `GET /v1/exchange/items/{itemId}` — adds `layers` descriptors plus
     * `features`/`benefits`. Carries no source ids and no slug by design.
     * 404 `ERR_EXCHANGE_LISTING_NOT_FOUND` when missing/delisted.
     */
    get: (itemId: string) =>
      rxV2<RxExchangeItemDetail>(`/exchange/items/${itemId}`),

    /**
     * `POST /v1/exchange/items` — publish a template/block you own. Exactly one
     * of `source_template_id` / `source_block_id`, else 400
     * `EXCHANGE_INVALID_SOURCE`. 201 → the raw listing row.
     */
    create: (body: RxCreateExchangeListingRequest) =>
      rxV2<RxExchangeListing>('/exchange/items', { method: 'POST', body }),

    /**
     * `POST /v1/exchange/items/{itemId}/add` — free items only
     * (`price_cents === 0`); forks the source into the caller's own brand and
     * returns the new Experience. Cross-tenant by design: the fork never lands
     * in the author's brand. 400 if the item is premium.
     */
    add: (itemId: string) =>
      rxV2<RxExperience>(`/exchange/items/${itemId}/add`, { method: 'POST' }),

    /**
     * `POST /v1/exchange/items/{itemId}/purchase` — 201 kèm Experience mới,
     * cùng shape với `add`.
     *
     * **CHƯA THU TIỀN.** Thanh toán là pha sau; tới lúc đó hàng trả phí được
     * giao ngay khi bấm, và cổng capability `exchange_buy` cố ý KHÔNG chạy —
     * nó nói ai được TIÊU, mà hiện chẳng ai tiêu gì. Đừng dựng UI hứa hoá đơn.
     *
     * (Trước đây endpoint này luôn hỏng: gate 403, qua được thì 501.)
     */
    purchase: (itemId: string) =>
      rxV2<RxExperience>(`/exchange/items/${itemId}/purchase`, {
        method: 'POST',
      }),

    /**
     * `DELETE /v1/exchange/items/{itemId}` — author or platform admin only
     * (403 otherwise). 204 no body → resolves to `null`.
     */
    delist: (itemId: string) =>
      rxV2<null>(`/exchange/items/${itemId}`, { method: 'DELETE' }),
  },
};
