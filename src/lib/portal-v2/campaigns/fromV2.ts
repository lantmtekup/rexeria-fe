import type {
  CampaignBrief,
  CampaignGoal,
  CampaignItem,
  CampaignItemStatus,
  CampaignStage,
  CampaignType,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import type {
  RxCampaign,
  RxCampaignItem,
} from '@/services/rexer-v2/types/campaign';

/**
 * `/v1/campaigns` → shape màn Campaigns đang vẽ.
 *
 * Chỉ đổi tên và gom lại. Trạng thái KHÔNG suy lại ở đây: `core.DeriveCampaignStage`
 * bên BE là nơi quyết, và bản trước chép luật đó sang FE.
 */

const TYPES: CampaignType[] = [
  'launch',
  'seasonal',
  'sale',
  'always',
  'retention',
];
const STAGES: CampaignStage[] = ['planning', 'building', 'live', 'done'];
const ITEM_STATUSES: CampaignItemStatus[] = [
  'todo',
  'building',
  'review',
  'ready',
  'live',
];
const GOALS: CampaignGoal[] = [
  'awareness',
  'traffic',
  'conversion',
  'retention',
];

const pick = <T extends string>(
  v: string | null | undefined,
  all: T[]
): T | null => (v && (all as string[]).includes(v) ? (v as T) : null);

/** `YYYY-MM-DD`. BE trả date thuần nhưng vẫn cắt phòng khi kèm giờ. */
const day = (v: string | null | undefined): string | null =>
  v ? v.slice(0, 10) : null;

const briefOf = (b: RxCampaign['brief']): CampaignBrief => ({
  objective: b?.objective ?? '',
  audience: b?.audience ?? '',
  message: b?.message ?? '',
  offer: b?.offer ?? '',
});

export const v2ToCampaignItem = (x: RxCampaignItem): CampaignItem => ({
  id: x.id,
  kind: x.kind === 'topic' ? 'topic' : 'product',
  ...(x.product_id ? { productId: x.product_id } : {}),
  ...(x.topic_name ? { name: x.topic_name } : {}),
  // BE trả sẵn bản copy trải nghiệm của hạng mục, không phải gọi thêm.
  expIds: (x.experiences ?? []).map(e => e.id),
  status: pick(x.status, ITEM_STATUSES) ?? 'todo',
  // UI muốn TÊN người phụ trách, API chỉ có uuid. Để trống còn hơn hiện một
  // chuỗi uuid như thể đó là tên.
  owner: '',
  due: day(x.due_date),
  note: x.note ?? '',
});

export const v2ToCampaignView = (
  x: RxCampaign,
  opts: { journeyId?: string | null } = {}
): CampaignView => ({
  id: x.id,
  name: x.name,
  status: pick(x.status, STAGES) ?? 'planning',
  type: pick(x.type, TYPES),
  // `objective` là cột riêng trên bảng campaigns nhưng `CampaignV2` KHÔNG trả
  // ra — khác với `brief.objective`, vốn là văn xuôi. Để null cho đúng.
  goal: pick(null, GOALS),
  owner: '',
  channels: x.channels ?? [],
  budgetAmount: x.budget?.amount ?? null,
  budgetCurrency: x.budget?.currency || 'VND',
  startDate: day(x.start_date),
  endDate: day(x.end_date),
  // Chiến dịch không giữ product_id ở shape v2; hạng mục mới là nơi có sản phẩm.
  productId: null,
  brief: briefOf(x.brief),
  items: (x.items ?? []).map(v2ToCampaignItem),
  // Liên kết nằm ở PHÍA journey (`journeys.campaign_id`), nên người gọi phải
  // tra `GET /journeys?campaign_id=` rồi truyền vào đây.
  journeyId: opts.journeyId ?? null,
});
