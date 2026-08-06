import type {
  AutomationExperience,
  EvidenceTier,
} from '@/lib/portal-v2/automation/types';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';

/**
 * `ExperienceView` (thư viện trải nghiệm) → `AutomationExperience` (hub).
 *
 * Hub chỉ cần một lát mỏng của ExperienceView, nên map sang shape riêng thay vì
 * dùng thẳng — Automation không phụ thuộc vào 20 trường mà nó không đọc tới.
 *
 * Phần THẬT: `id`, `name`, `objective`, và `proven` (đọc từ
 * `pages.type_metadata.proven`). Phần còn lại — `layers`, `stats.lift`,
 * `evidence` — hiện vẫn seed từ `page.id` trong `mapPage`, nên rubric sẵn sàng
 * đang chấm trên vai phễu giả. Khi `/v1/experiences` có thật thì đổi ở
 * `mapPage`, chỗ này không phải sửa.
 */
export const toAutomationExperience = (
  x: ExperienceView
): AutomationExperience => ({
  id: x.id,
  name: x.name,
  categoryKey: VEHICLE_KEY[x.vehicle],
  objectiveKey: OBJECTIVE_KEY[x.objective],
  proven: x.proven,
  layers: x.layers.map(l => ({ role: l.role, name: l.name })),
  // Chưa chạy lần nào ⇒ null, KHÔNG phải 0 — số 0 đọc như "chạy rồi mà thua".
  lift: x.stats ? x.stats.lift : null,
  evidence: x.evidence.tier as EvidenceTier,
  gradient: gradientFor(x.id),
});

/** Cùng bảng khoá mà `ExperienceDetailModal` dùng — giữ một nguồn từ vựng. */
const VEHICLE_KEY = {
  curated: 'vehicleCurated',
  ads: 'vehicleAds',
  showcase: 'vehicleShowcase',
  microsite: 'vehicleMicrosite',
} as const;

const OBJECTIVE_KEY = {
  insight: 'objInsight',
  lead: 'objLead',
  cta: 'objCta',
  convert: 'objConvert',
} as const;

/** Dải màu ổn định theo id để thẻ không đổi màu giữa các lần render. */
const GRADIENTS = [
  'linear-gradient(135deg,#6C4CF1,#9B7DF8)',
  'linear-gradient(135deg,#2A2140,#4A3F66)',
  'linear-gradient(135deg,#E86A8E,#F2A0B5)',
  'linear-gradient(135deg,#1FA8C6,#66D0E0)',
  'linear-gradient(135deg,#D9902B,#F0C070)',
] as const;

const gradientFor = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length]!;
};
