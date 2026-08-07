import { formatUpdated } from '@/lib/portal-v2/experiences/helpers';
import type {
  EvidenceTier,
  ExperienceCategory,
  ExperienceInteraction,
  ExperienceObjective,
  ExperienceState,
  ExperienceVehicle,
  ExperienceView,
  FunnelRole,
  PageStatusView,
  SignalCoverage,
} from '@/lib/portal-v2/experiences/types';
import type {
  RxExperience,
  RxExperienceCoverage,
} from '@/services/rexer-v2/types/experience';

/**
 * `GET /v1/experiences` → shape mà UI đang vẽ.
 *
 * Thay cho `mapPage.ts` + `seed.ts`, vốn suy trải nghiệm từ `/pages` rồi BỊA
 * nửa còn lại bằng hàm băm id: bậc bằng chứng, số phiên, độ phủ, cả trục sở
 * hữu template/product/topic. Các số đó ổn định theo id nên trông như thật —
 * đó mới là chỗ nguy hiểm, vì `+45% HIGH CONFIDENCE` đọc như một phép đo.
 *
 * Quy tắc ở đây: KHÔNG suy ra cái gì không có trong phản hồi. Thiếu thì để
 * null và để UI nói "chưa đo".
 */

const VEHICLES: ExperienceVehicle[] = [
  'curated',
  'ads',
  'showcase',
  'microsite',
];
const OBJECTIVES: ExperienceObjective[] = ['insight', 'lead', 'cta', 'convert'];
const TIERS: EvidenceTier[] = ['high', 'directional', 'early', 'unmeasured'];
const ROLES: FunnelRole[] = ['ATT', 'EDU', 'EXP', 'TRU', 'CON'];
const INTERACTIONS: ExperienceInteraction[] = [
  'hotspot',
  'swipe',
  'pan',
  '360',
  'vr',
];

/** Vai phễu mà mỗi mục tiêu phục vụ — giữ nguyên bảng của bản cũ. */
const OBJECTIVE_ROLE: Record<ExperienceObjective, FunnelRole> = {
  insight: 'EXP',
  lead: 'CON',
  cta: 'CON',
  convert: 'TRU',
};

const pick = <T extends string>(
  v: string | null | undefined,
  all: T[]
): T | null => (v && (all as string[]).includes(v) ? (v as T) : null);

/**
 * Trục sở hữu — nay là DỮ LIỆU THẬT.
 *
 * `kind` phân biệt template với bản copy, và `subject.kind` cho biết bản copy
 * nói về sản phẩm hay chủ đề. Bản cũ bốc ngẫu nhiên bằng `ipick(id+'state')`,
 * nên ba tab đếm ra 1/1/1 dù cả ba mục đều là page.
 */
const stateOf = (x: RxExperience): ExperienceState => {
  if (x.kind === 'block') return 'block';
  if (x.kind === 'template' || x.is_template) return 'template';
  return x.subject?.kind === 'topic' ? 'topic' : 'product';
};

const STATUS: PageStatusView[] = ['draft', 'published', 'archived'];

export const v2ToExperienceView = (x: RxExperience): ExperienceView => {
  const objective = pick(x.objective, OBJECTIVES) ?? 'lead';
  const roles = (x.funnel_coverage ?? []).filter((r): r is FunnelRole =>
    (ROLES as string[]).includes(r)
  );

  return {
    id: x.id,
    name: x.name,
    slug: x.slug ?? null,
    // v2 không trả version id, và màn này không dùng tới — luồng fork đi qua
    // `POST /experiences/{id}/use` chứ không tự dựng từ version.
    templateVersionId: null,
    thumbnailUrl: x.thumbnail_url ?? null,
    // Không có khái niệm "trang ngoài" ở v2: mọi mục trong thư viện đều có
    // canvas. Để null nghĩa là Edit không bị chặn.
    externalUrl: null,
    status: (STATUS as string[]).includes(x.status)
      ? (x.status as PageStatusView)
      : 'draft',
    summary: x.summary ?? '',
    updatedLabel: formatUpdated(x.updated_at),

    state: stateOf(x),
    category: (x.category === 'blocks'
      ? 'blocks'
      : 'collection') as ExperienceCategory,
    vehicle: pick(x.vehicle, VEHICLES) ?? 'curated',
    objective,
    role: pick(x.role, ROLES) ?? OBJECTIVE_ROLE[objective],
    interactions: (x.interactions ?? []).filter(
      (i): i is ExperienceInteraction => (INTERACTIONS as string[]).includes(i)
    ),
    proven: x.proven,
    tagline: x.tagline ?? '',

    // `funnel_coverage` chỉ cho biết CÓ những vai nào, không có mô tả từng
    // block. Đủ để vẽ dải phễu; phần mô tả thì bản cũ cũng bịa nốt.
    layers: roles.map(role => ({
      role,
      name: role,
      description: '',
      mediaRef: null,
      cta: null,
      tracked: false,
      components: [],
      trackedComponents: [],
    })),
    // Template model có Features/Benefits nhưng `Experience` không trả ra.
    features: [],
    benefits: [],

    // BỎ QUA ⇒ chưa đo. Đây là chủ ý của BE, không phải thiếu sót, nên đừng
    // quy về 0%.
    coverage:
      typeof x.signal_coverage === 'number'
        ? {
            blocks: 0,
            trackedBlocks: 0,
            components: 0,
            trackedComponents: 0,
            pct: Math.round(x.signal_coverage * 100),
          }
        : null,

    // Số đo nằm ở `GET /experiences/{id}/stats`, nạp khi mở chi tiết. Danh
    // sách 110 mục mà mỗi thẻ một lời gọi là 110 request cho một lần mở màn.
    stats: null,
    evidence: {
      tier: pick(x.ev, TIERS) ?? 'unmeasured',
      lineage: null,
    },

    searchText: [x.name, x.slug ?? '', x.summary ?? '', x.tagline ?? '']
      .join(' ')
      .toLowerCase(),
  };
};

/** `GET /experiences/{id}/coverage` → khối độ phủ đầy đủ cho màn chi tiết. */
export const v2ToSignalCoverage = (
  c: RxExperienceCoverage
): SignalCoverage => ({
  blocks: c.signal_coverage.blocks_total,
  trackedBlocks: c.signal_coverage.blocks_reporting,
  components: c.signal_coverage.components_total,
  trackedComponents: c.signal_coverage.components_tracked,
  pct: Math.round(c.signal_coverage.pct * 100),
});
