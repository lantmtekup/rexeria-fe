/**
 * Campaign v2 — shape THẬT của `/v1/campaigns` trên nhánh `feature/v2-migration`.
 *
 * Khác hẳn `services/rexer/types.ts`: client v1 bọc trong `{campaign: ...}` và
 * dùng `PATCH`, còn server trả object trần và chỉ nhận `PUT` (PATCH → 404).
 * Vì thế đây là bộ type riêng chứ không sửa bộ cũ — màn `/portal` cũ vẫn dùng
 * client kia.
 */

/**
 * Trạng thái do BE SUY RA (`core.DeriveCampaignStage`), không phải do FE đặt:
 * có item `live` ⇒ live; có item rời `todo` ⇒ building; còn lại ⇒ planning.
 * `done` là lần chốt tay duy nhất, qua `PATCH /campaigns/{id}/status`.
 *
 * KHÔNG có `paused` — thứ mà `CampaignStatus` phía UI đang khai.
 */
export type RxCampaignStatus = 'planning' | 'building' | 'live' | 'done';

export type RxCampaignType =
  'launch' | 'seasonal' | 'sale' | 'always' | 'retention';

export type RxCampaignBudget = {
  amount: number | null;
  currency: string;
};

export type RxCampaignBrief = {
  objective?: string;
  audience?: string;
  message?: string;
  offer?: string;
};

export type RxCampaignItem = {
  id: string;
  campaign_id: string;
  kind: 'product' | 'topic';
  product_id: string | null;
  topic_name: string | null;
  status: 'todo' | 'building' | 'review' | 'ready' | 'live';
  step: number;
  owner_id: string | null;
  due_date: string | null;
  note: string | null;
  /** Bản copy trải nghiệm gắn vào hạng mục; BE trả sẵn, không phải gọi thêm. */
  experiences?: { id: string; name?: string }[];
};

export type RxCampaign = {
  id: string;
  name: string;
  type: RxCampaignType | null;
  status: RxCampaignStatus;
  start_date: string | null;
  end_date: string | null;
  owner_id: string | null;
  budget: RxCampaignBudget;
  channels: string[];
  brief: RxCampaignBrief;
  items_count: number;
  /** Chỉ có ở `GET /campaigns/{id}`, không có ở danh sách. */
  items?: RxCampaignItem[];
  created_at: string;
  updated_at: string;
};

export type RxCampaignListResponse = { items: RxCampaign[]; total: number };

export type RxCreateCampaignRequest = {
  name: string;
  /** BẮT BUỘC ở BE (`validate:"required,oneof=..."`). */
  type: RxCampaignType;
  brief?: RxCampaignBrief;
  start_date?: string | null;
  end_date?: string | null;
  owner_id?: string | null;
  budget?: RxCampaignBudget;
  channels?: string[];
};

/** PUT — mọi trường tuỳ chọn, nhưng gửi `brief` thì phải có `objective`. */
export type RxUpdateCampaignRequest = Partial<
  Omit<RxCreateCampaignRequest, 'type'>
>;

export type RxCampaignItemsResponse = {
  items: RxCampaignItem[];
  total: number;
};
