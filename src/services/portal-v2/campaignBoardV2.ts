import {
  v2ToCampaignItem,
  v2ToCampaignView,
} from '@/lib/portal-v2/campaigns/fromV2';
import type {
  CampaignDraft,
  CampaignItem,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Bảng chiến dịch ← `/v1/campaigns` (shape v2).
 *
 * Thay `MOCK_CAMPAIGNS`. Client v1 ở `services/rexer` KHÔNG dùng được: nó bọc
 * phản hồi trong `{campaign: ...}` và gọi `PATCH`, còn server trả object trần
 * và chỉ nhận `PUT` — PATCH cho 404.
 */

const PAGE_LIMIT = 100;

export type CampaignBoardResult = {
  items: CampaignView[];
  error: string | null;
};

const message = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

/**
 * Danh sách KHÔNG kèm `items[]` — chỉ `items_count`. Chi tiết phải gọi riêng,
 * nên thẻ nào cần đếm hạng mục thì dùng `items_count`, đừng đọc `items.length`
 * rồi tưởng là 0.
 */
export const fetchCampaignBoard = async (
  query: {
    brandId?: string | null;
  } = {}
): Promise<CampaignBoardResult> => {
  try {
    const res = await rexerV2Api.campaigns.list({
      limit: PAGE_LIMIT,
      ...(query.brandId ? { brand_id: query.brandId } : {}),
    });
    return {
      items: (res.items ?? []).map(x => v2ToCampaignView(x)),
      error: null,
    };
  } catch (err) {
    return { items: [], error: message(err, 'Failed to load campaigns') };
  }
};

/** Chi tiết — đây mới là chỗ có `items[]` kèm trải nghiệm của từng hạng mục. */
export const fetchCampaignDetail = async (
  campaignId: string
): Promise<CampaignView | null> => {
  try {
    return v2ToCampaignView(await rexerV2Api.campaigns.get(campaignId));
  } catch {
    return null;
  }
};

/* ── ghi ──────────────────────────────────────────────────────────────────── */

type BudgetSource = Pick<CampaignView, 'budgetAmount' | 'budgetCurrency'>;

const toBudget = (c: BudgetSource) => ({
  amount: c.budgetAmount,
  currency: c.budgetCurrency || 'VND',
});

/**
 * `POST /campaigns` — `type` BẮT BUỘC ở BE (`oneof=launch seasonal sale always
 * retention`). Bản nháp chưa chọn kiểu thì không gửi được, nên chặn ở đây thay
 * vì để server trả 400 với thông báo khó đọc.
 */
export const createCampaign = async (
  draft: CampaignDraft,
  brandId: string | null
): Promise<CampaignView> => {
  if (!draft.type) throw new Error('CAMPAIGN_TYPE_REQUIRED');
  // Admin không thuộc brand nào, nên phải gửi kèm brand đang xem — không có
  // thì BE tạo ra một chiến dịch không màn hình nào nhìn thấy.
  if (!brandId) throw new Error('CAMPAIGN_BRAND_REQUIRED');
  const created = await rexerV2Api.campaigns.create({
    brand_id: brandId,
    name: draft.name,
    type: draft.type,
    brief: draft.brief,
    start_date: draft.startDate,
    end_date: draft.endDate,
    budget: toBudget(draft),
    channels: draft.channels,
  });
  return v2ToCampaignView(created);
};

/** PUT — không gửi `type`: BE không nhận nó ở `UpdateCampaignV2Request`. */
export const saveCampaign = async (c: CampaignView): Promise<CampaignView> => {
  const saved = await rexerV2Api.campaigns.update(c.id, {
    name: c.name,
    brief: c.brief,
    start_date: c.startDate,
    end_date: c.endDate,
    budget: toBudget(c),
    channels: c.channels,
  });
  // Trạng thái là thứ BE suy ra; nếu người dùng vừa bấm "đánh dấu xong" thì
  // phải gửi riêng qua endpoint status.
  if (c.status === 'done' && saved.status !== 'done') {
    return v2ToCampaignView(await rexerV2Api.campaigns.setStatus(c.id, 'done'));
  }
  if (c.status !== 'done' && saved.status === 'done') {
    return v2ToCampaignView(await rexerV2Api.campaigns.setStatus(c.id, null));
  }
  return v2ToCampaignView(saved);
};

export const duplicateCampaign = async (
  campaignId: string
): Promise<CampaignView> =>
  v2ToCampaignView(await rexerV2Api.campaigns.duplicate(campaignId));

/** Trả về danh sách id KHÔNG xoá được, để màn hình chỉ bỏ đi thứ đã xoá thật. */
export const deleteCampaigns = async (ids: string[]): Promise<string[]> => {
  const results = await Promise.allSettled(
    ids.map(id => rexerV2Api.campaigns.remove(id))
  );
  return ids.filter((_, i) => results[i]?.status === 'rejected');
};

/* ── hạng mục ─────────────────────────────────────────────────────────────── */

/**
 * Hạng mục KHÔNG nằm trong `PUT /campaigns`: `UpdateCampaignV2Request` không có
 * trường `items`. Thêm một hạng mục rồi lưu chiến dịch sẽ im lặng đánh rơi nó —
 * đó đúng là chuyện đang xảy ra trước khi ráp bộ này.
 */
export const addCampaignItem = async (
  campaignId: string,
  kind: 'product' | 'topic',
  value: string,
  opts: { due?: string | null } = {}
): Promise<CampaignItem> => {
  const created = await rexerV2Api.campaigns.addItem(campaignId, {
    kind,
    ...(kind === 'product' ? { product_id: value } : { topic_name: value }),
    ...(opts.due ? { due_date: opts.due } : {}),
  });
  return v2ToCampaignItem(created);
};

export const setCampaignItemStatus = async (
  campaignId: string,
  itemId: string,
  status: string
): Promise<CampaignItem> =>
  v2ToCampaignItem(
    await rexerV2Api.campaigns.setItemStatus(campaignId, itemId, status)
  );

export const removeCampaignItem = (
  campaignId: string,
  itemId: string
): Promise<void> => rexerV2Api.campaigns.removeItem(campaignId, itemId);
