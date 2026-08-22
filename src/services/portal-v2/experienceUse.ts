import { v2ToExperienceView } from '@/lib/portal-v2/experiences/fromV2';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { errorMessage } from '@/services/portal-v2/_error';
import { rexerApi } from '@/services/rexer/endpoints';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * "Dùng trải nghiệm này" — `POST /v1/experiences/{id}/use`.
 *
 * Fork một trải nghiệm gốc (hoặc block) thành BẢN COPY nằm trong một hạng mục chiến
 * dịch. Đây là đường duy nhất làm một mục hiện ra ở tab "Bản copy": `ListCopies`
 * lọc `pages.campaign_item_id IS NOT NULL`, và chỉ fork mới ghi cột đó.
 *
 * Vì sao cần chọn chiến dịch + hạng mục chứ không bấm một phát là xong: BE bắt
 * buộc cả hai (`UseExperienceRequest`, `validate:"required,uuid"`). Prototype
 * cũng vậy — nút `xuse` của nó không fork, nó chuyển sang màn Campaigns kèm câu
 * "Open a campaign, pick a subject, then add this experience".
 *
 * Trùng chức năng với `POST /campaigns/{cid}/items/{iid}/experiences`
 * (`campaignExperiences.ts`): `AttachToItem` gọi thẳng `u.Use(...)` bên trong.
 * Hai cửa vào, một thao tác — cửa này dành cho người đang đứng ở thư viện, cửa
 * kia cho người đang đứng trong chiến dịch.
 */

/** Số sản phẩm nạp để dịch `product_id` của hạng mục thành tên đọc được. */
const PRODUCT_LOOKUP_LIMIT = 100;
const CAMPAIGN_LIMIT = 100;

export type UseTargetItem = {
  id: string;
  kind: 'product' | 'topic';
  /** Nhãn hiện trên màn: tên chủ đề, hoặc tên sản phẩm nếu tra được. */
  label: string;
  status: string;
  /**
   * Id các trải nghiệm ĐÃ gắn vào hạng mục này.
   *
   * Dùng để nói trước "hạng mục này đã có bản copy của trải nghiệm gốc đó" thay vì để
   * người dùng bấm rồi nhận về một bản ghi cũ mà tưởng là bản mới — fork
   * idempotent theo `(origin, item)`.
   */
  originIds: string[];
};

export type UseTargetCampaign = {
  id: string;
  name: string;
  itemsCount: number;
};

export type UseTargetsResult = {
  campaigns: UseTargetCampaign[];
  error: string | null;
};

/** Danh sách chiến dịch để chọn. Hạng mục nạp riêng khi chọn xong. */
export const fetchUseCampaigns = async (
  brandId: string | null
): Promise<UseTargetsResult> => {
  try {
    const res = await rexerV2Api.campaigns.list({
      limit: CAMPAIGN_LIMIT,
      ...(brandId ? { brand_id: brandId } : {}),
    });
    return {
      campaigns: (res.items ?? []).map(c => ({
        id: c.id,
        name: c.name || c.id,
        itemsCount: c.items_count ?? 0,
      })),
      error: null,
    };
  } catch (err) {
    return {
      campaigns: [],
      error: errorMessage(err, 'Failed to load campaigns'),
    };
  }
};

export type UseItemsResult = {
  items: UseTargetItem[];
  error: string | null;
};

/**
 * Hạng mục của một chiến dịch, kèm nhãn đọc được.
 *
 * `GET /campaigns/{id}/items` chỉ trả `product_id`, không trả tên sản phẩm, nên
 * phải tra thêm một lượt. Tra hỏng thì vẫn hiện hạng mục, chỉ là nhãn lùi về
 * id rút gọn — mất tên còn hơn mất cả hạng mục.
 */
export const fetchUseItems = async (
  campaignId: string,
  brandId: string | null
): Promise<UseItemsResult> => {
  try {
    const [itemsRes, productsRes] = await Promise.allSettled([
      rexerV2Api.campaigns.items(campaignId),
      rexerApi.products.list({
        is_template: false,
        limit: PRODUCT_LOOKUP_LIMIT,
        ...(brandId ? { brand_id: brandId } : {}),
      }),
    ]);

    if (itemsRes.status === 'rejected') {
      return {
        items: [],
        error: errorMessage(itemsRes.reason, 'Failed to load campaign items'),
      };
    }

    const names = new Map<string, string>();
    if (productsRes.status === 'fulfilled') {
      (productsRes.value.items ?? []).forEach(p => {
        if (p.id) names.set(p.id, p.name ?? p.id);
      });
    }

    return {
      items: (itemsRes.value.items ?? []).map(it => ({
        id: it.id,
        kind: it.kind,
        label:
          it.kind === 'topic'
            ? (it.topic_name ?? '')
            : (names.get(it.product_id ?? '') ??
              `#${(it.product_id ?? '').slice(0, 8)}`),
        status: it.status,
        // BE trả nguyên object trải nghiệm ở đây, không chỉ `{id, name}` như
        // `RxCampaignItem` khai — `origin_id` là thứ cần để so với trải
        // nghiệm gốc đang mở.
        originIds: (it.experiences ?? [])
          .map(e => (e as { origin_id?: string | null }).origin_id ?? e.id)
          .filter((v): v is string => Boolean(v)),
      })),
      error: null,
    };
  } catch (err) {
    return { items: [], error: errorMessage(err, 'Failed to load items') };
  }
};

/** Đích của một lần fork; `null` = lấy một bản của mình, chưa gán chiến dịch. */
export type ForkTarget = { campaignId: string; itemId: string } | null;

/**
 * Fork thật.
 *
 * `target === null` là đường THƯỜNG: lấy một bản về sửa, chưa quyết dùng ở đâu.
 * Gửi kèm hạng mục chỉ là đường tắt cho người đang đứng trong một chiến dịch.
 *
 * Ném lỗi ra ngoài thay vì nuốt: đây là đường GHI, và "không có gì xảy ra" là
 * câu tệ nhất một nút có thể nói.
 *
 * KHÔNG đặt tên `useExperience`: quy tắc của `react-hooks` nhận mọi hàm bắt đầu
 * bằng `use` là hook, nên gọi nó trong một handler là lỗi lint (đã dính một lần).
 */
export const forkExperience = async (
  experienceId: string,
  target: ForkTarget = null,
  brandId: string | null = null
): Promise<ExperienceView> =>
  v2ToExperienceView(
    await rexerV2Api.experiences.use(
      experienceId,
      // Gửi một trong hai là 400 ở BE — nên hoặc cả cặp, hoặc không trường nào.
      //
      // Đường không chiến dịch phải kèm `brand_id`, nếu không platform admin
      // luôn ăn 400: họ không thuộc brand nào nên BE không suy ra được chủ của
      // bản copy. Người dùng thuộc brand gửi kèm cũng vô hại — BE bỏ qua khi
      // trùng brand của phiên.
      target
        ? { campaign_id: target.campaignId, item_id: target.itemId }
        : brandId
          ? { brand_id: brandId }
          : {}
    )
  );
