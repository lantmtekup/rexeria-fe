import type {
  AutomationExperience,
  AutomationProduct,
  EvidenceTier,
  FunnelRole,
  Readiness,
} from '@/lib/portal-v2/automation/types';
import type {
  RxAutomationCandidate,
  RxAutoSlots,
} from '@/services/rexer-v2/types/automation';
import type { RxExperience } from '@/services/rexer-v2/types/experience';

/**
 * Shape của API v2 → shape UI đang vẽ.
 *
 * Chỉ đổi tên và gom lại, KHÔNG tính toán gì. Điểm sẵn sàng do `core.AutoSlots`
 * bên BE chấm — chép luật đó sang FE chính là cách hai bên lệch nhau, đúng như
 * đã xảy ra với luật nhận diện video.
 */

const ROLE_ORDER: FunnelRole[] = ['ATT', 'EXP', 'EDU', 'TRU', 'CON'];

/** Nhãn ô phễu → khoá i18n mô tả thứ còn thiếu, dùng chung với bản cũ. */
const NEED_KEY: Record<string, string> = {
  ATT: 'needCover',
  EXP: 'needImagery',
  EDU: 'needCopy',
  TRU: 'needClaim',
  CON: 'needSku',
};

const VEHICLE_KEY: Record<string, string> = {
  curated: 'vehicleCurated',
  ads: 'vehicleAds',
  showcase: 'vehicleShowcase',
  microsite: 'vehicleMicrosite',
};

const OBJECTIVE_KEY: Record<string, string> = {
  insight: 'objInsight',
  lead: 'objLead',
  cta: 'objCta',
  convert: 'objConvert',
};

const GRADIENTS = [
  'linear-gradient(135deg,#6C4CF1,#9B7DF8)',
  'linear-gradient(135deg,#2A2140,#4A3F66)',
  'linear-gradient(135deg,#E86A8E,#F2A0B5)',
  'linear-gradient(135deg,#1FA8C6,#66D0E0)',
  'linear-gradient(135deg,#D9902B,#F0C070)',
] as const;

/** Dải màu ổn định theo id để thẻ không đổi màu giữa các lần render. */
const gradientFor = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length]!;
};

export const v2ExperienceToAutomation = (
  x: RxExperience
): AutomationExperience => ({
  id: x.id,
  name: x.name,
  categoryKey: VEHICLE_KEY[x.vehicle ?? ''] ?? 'vehicleCurated',
  objectiveKey: OBJECTIVE_KEY[x.objective ?? ''] ?? 'objLead',
  // Hub chỉ trả template ĐÃ Proven, nên cờ này luôn đúng — giữ lại để bộ lọc
  // phía UI không phải biết điều đó.
  proven: true,
  // `funnel_coverage` là danh sách vai mà thiết kế PHỦ được — đó là thứ v2 trả
  // về, không có mảng layer chi tiết. Đủ cho readiness vì `core.AutoSlots` chỉ
  // cần biết thiết kế dùng những vai nào.
  layers: (x.funnel_coverage ?? []).map(role => ({
    role: role as FunnelRole,
    name: role,
  })),
  // v2 hub KHÔNG trả lift/evidence. Để null và 'unmeasured' thay vì bịa số 0 —
  // 0% đọc như "chạy rồi mà thua", trong khi sự thật là "chưa đo được ở đây".
  lift: null,
  evidence: 'unmeasured' as EvidenceTier,
  gradient: gradientFor(x.id),
});

/** `{filled: [...], gaps: [...]}` của BE → hàng chip mà UI đang vẽ. */
export const v2SlotsToReadiness = (s: RxAutoSlots): Readiness => {
  const filled = new Set(s.filled ?? []);
  const used = new Set([...(s.filled ?? []), ...(s.gaps ?? [])]);
  const slots = ROLE_ORDER.filter(r => used.has(r)).map(role => ({
    role,
    needKey: NEED_KEY[role] ?? 'needCover',
    ok: filled.has(role),
  }));
  return {
    slots,
    filled: slots.filter(x => x.ok).length,
    total: slots.length,
    gaps: slots.filter(x => !x.ok),
  };
};

export const v2CandidateToProduct = (
  c: RxAutomationCandidate
): AutomationProduct & { readiness: Readiness } => ({
  id: c.product.id,
  title: c.product.name,
  // Dòng phụ dưới tên thẻ. Dùng SKU chứ không dùng status: thẻ nào cũng
  // "active" thì dòng đó chẳng phân biệt được sản phẩm nào với sản phẩm nào.
  type: c.product.sku ?? '',
  category: '',
  status:
    c.product.status === 'active' || c.product.status === 'archived'
      ? c.product.status
      : 'draft',
  hasCover: (c.readiness.filled ?? []).includes('ATT'),
  imageCount: 0,
  body: c.product.description ?? '',
  benefits: [],
  features: [],
  claims: [],
  competitors: [],
  disclaimers: [],
  priceText: null,
  provenClaims: 0,
  variantCount: 0,
  gradient: gradientFor(c.product.id),
  readiness: v2SlotsToReadiness(c.readiness),
});
