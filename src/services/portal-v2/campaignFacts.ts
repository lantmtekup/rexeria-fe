/**
 * Số đo verdict/ROI/lift của Campaigns ← `/v1/intel/*`. Thay `MOCK_FACT_ROWS`
 * (bảng fact giả lọc theo `campaign.id` thật — gần như luôn rỗng vì id không
 * khớp bản ghi mock nào, xem `lib/portal-v2/campaigns/verdict.ts`).
 *
 * Danh sách dùng bản GỘP (`/intel/campaigns`, không `expand`, không
 * `campaign_id`) — MỘT lần gọi cho cả bảng, tránh N+1 khi vẽ health badge cho
 * từng dòng. ĐÂY LÀ NGUỒN DUY NHẤT ĐÁNG TIN cho `lift`/`vs_control` cấp chiến
 * dịch, kể cả ở màn chi tiết — xem lý do ngay dưới.
 *
 * Chi tiết một chiến dịch gọi thêm hai đường: `expand=subjects` lọc theo
 * `campaign_id` (hạng mục tốt nhất/kém nhất) và `/intel/overview` cùng lọc
 * (leads/CAC — không có ở `/intel/campaigns`).
 *
 * KHÔNG dùng `lift`/`vs_control` cấp chiến dịch từ lời gọi `campaign_id`-lọc:
 * BE tính lift bằng cách gộp CVR của chiến dịch này rồi so với CVR gộp của
 * "phần còn lại của TẬP KẾT QUẢ đang trả về" (pooled-rest, §1.3 —
 * `intelUsecase.Campaigns`, be-ReXeR.ai `internal/usecase/intel.go:253`).
 * Lọc theo `campaign_id` trước khi gộp khiến tập kết quả CHỈ CÒN đúng chiến
 * dịch đó — "phần còn lại" luôn rỗng ⇒ `factmath.Lift` nhận baseline CVR = 0
 * ⇒ trả `(0, false)` ⇒ BE bỏ trống `lift` (không gán). Gọi
 * `campaign_id`-lọc để lấy lift cấp chiến dịch sẽ luôn ra `null`, không phải
 * vì chưa đo được mà vì chính cách lọc xoá mất chiến dịch anh em làm baseline.
 * Lift cấp HẠNG MỤC (`subjects[]`) không dính lỗi này: nó so một hạng mục với
 * các hạng mục anh em TRONG CÙNG chiến dịch (`subjectRows`, cùng file
 * `internal/usecase/intel.go:424`) — nhóm anh em đó vẫn còn nguyên dù đã lọc
 * theo `campaign_id`, vì lọc chỉ xoá chiến dịch khác, không xoá hạng mục khác
 * trong chính chiến dịch này.
 *
 * `trust` (độ phủ tín hiệu) LUÔN là `null` ở cả hai tầng — KHÔNG gọi
 * `/intel/trust`. Handler nhận `campaign_id` nhưng usecase
 * (`intelUsecase.Trust`, be-ReXeR.ai `internal/usecase/intel_intelligence.go:683`)
 * chỉ dùng `q.BrandID`, bỏ qua `q.CampaignID` — gọi kèm campaign_id vẫn trả về
 * độ phủ tín hiệu của CẢ BRAND, không phải của riêng chiến dịch đó. Vẽ số đó
 * dưới nhãn "độ tin cậy của chiến dịch này" là đúng loại lỗi lệch tầng gộp mà
 * `JOURNEY_SEGMENTS` từng mắc. Chừng nào BE gộp `signal_coverage` vào
 * `experiences[]` của `/intel/campaigns` (docs/be-analytics-gaps-2026-08-13.md
 * mục 2.2) thì mới có trust đúng grain — tới lúc đó cứ để `null`.
 */
import {
  campaignCardOf,
  type PulseCampaignCard,
  type PulseSubjectRow,
} from '@/lib/portal-v2/analytics/pulseView';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type { RxIntelQuery } from '@/services/rexer-v2/types/intel';

const message = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

const scoped = (brandId?: string | null): RxIntelQuery =>
  brandId ? { brand_id: brandId } : {};

const money = (cents: number | null | undefined): number =>
  cents == null ? 0 : cents / 100;

/* ── bảng (danh sách) ─────────────────────────────────────────────────── */

export type CampaignFactBoard = {
  /** `campaign_id → card`. Thiếu key nghĩa là chiến dịch đó chưa có phiên nào đo được. */
  facts: Record<string, PulseCampaignCard>;
  /** Lift trung bình toàn brand — cái ngưỡng "mạng lưới đã chứng minh". null = chưa đo được. */
  earnedBar: number | null;
  error: string | null;
};

export const fetchCampaignFactBoard = async (
  brandId?: string | null
): Promise<CampaignFactBoard> => {
  const [campaigns, overview] = await Promise.allSettled([
    rexerV2Api.intel.campaigns(scoped(brandId)),
    rexerV2Api.intel.overview(scoped(brandId)),
  ]);

  if (campaigns.status === 'rejected') {
    return {
      facts: {},
      earnedBar: null,
      error: message(campaigns.reason, 'Không đọc được số đo chiến dịch'),
    };
  }

  const facts: Record<string, PulseCampaignCard> = {};
  for (const row of campaigns.value.items) {
    facts[row.campaign_id] = campaignCardOf(row);
  }

  return {
    facts,
    earnedBar:
      overview.status === 'fulfilled'
        ? (overview.value.totals.lift ?? null)
        : null,
    error: null,
  };
};

/* ── chi tiết một chiến dịch ──────────────────────────────────────────── */

export type CampaignFactDetail = {
  /** Hạng mục tốt nhất/kém nhất — từ lời gọi lọc `campaign_id` + `expand=subjects`. */
  subjects: PulseSubjectRow[];
  leads: number;
  cac: number;
  /** null = chưa đo được — khác 0%. */
  trust: number | null;
  error: string | null;
};

const EMPTY_DETAIL: CampaignFactDetail = {
  subjects: [],
  leads: 0,
  cac: 0,
  trust: null,
  error: null,
};

export const fetchCampaignFactDetail = async (
  campaignId: string,
  brandId?: string | null
): Promise<CampaignFactDetail> => {
  const slice: RxIntelQuery = { ...scoped(brandId), campaign_id: campaignId };

  const [campaigns, overview] = await Promise.allSettled([
    rexerV2Api.intel.campaigns(slice, true),
    rexerV2Api.intel.overview(slice),
  ]);

  if (campaigns.status === 'rejected') {
    return {
      ...EMPTY_DETAIL,
      error: message(campaigns.reason, 'Không đọc được số đo của chiến dịch'),
    };
  }

  const row = campaigns.value.items.find(x => x.campaign_id === campaignId);

  return {
    // Chỉ lấy `subjects[]` từ dòng này — `row`'s own lift/vs_control bỏ qua,
    // xem ghi chú đầu file.
    subjects: row ? campaignCardOf(row).subjects : [],
    leads: overview.status === 'fulfilled' ? overview.value.totals.leads : 0,
    cac:
      overview.status === 'fulfilled'
        ? money(overview.value.totals.cac_cents)
        : 0,
    trust: null,
    error: null,
  };
};
