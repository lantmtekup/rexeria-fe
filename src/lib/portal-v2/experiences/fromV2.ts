import { formatUpdated } from '@/lib/portal-v2/experiences/helpers';
import type {
  EvidenceTier,
  ExperienceCategory,
  ExperienceInteraction,
  ExperienceLayer,
  ExperienceObjective,
  ExperienceState,
  ExperienceVehicle,
  ExperienceView,
  PageStatusView,
  SignalCoverage,
} from '@/lib/portal-v2/experiences/types';
import type {
  RxExperience,
  RxExperienceCoverage,
  RxExperienceDetail,
  RxExperienceLayer,
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
const INTERACTIONS: ExperienceInteraction[] = [
  'hotspot',
  'swipe',
  'pan',
  '360',
  'vr',
];

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
  // Chưa nộp vào hạng mục nào ⇒ bản của brand, chưa dùng ở đâu. Bản trước không
  // có nhánh này nên mọi bản copy không chiến dịch rơi vào 'product' — tức là
  // tab "Bản copy sản phẩm" nhận hết những thứ nó không nói về sản phẩm nào.
  if (!x.item_id) return 'unassigned';
  return x.subject?.kind === 'topic' ? 'topic' : 'product';
};

const STATUS: PageStatusView[] = ['draft', 'published', 'archived'];

export const v2ToExperienceView = (x: RxExperience): ExperienceView => {
  const objective = pick(x.objective, OBJECTIVES) ?? 'lead';

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
    interactions: (x.interactions ?? []).filter(
      (i): i is ExperienceInteraction => (INTERACTIONS as string[]).includes(i)
    ),
    proven: x.proven,
    tagline: x.tagline ?? '',

    // Block thật chỉ có ở `GET /experiences/{id}`; modal nạp khi mở.
    layers: [],
    // Template model có Features/Benefits nhưng `Experience` không trả ra.
    features: [],
    benefits: [],

    // BỎ QUA ⇒ chưa đo. Đây là chủ ý của BE, không phải thiếu sót, nên đừng
    // quy về 0%.
    coveragePct:
      typeof x.signal_coverage === 'number'
        ? Math.round(x.signal_coverage * 100)
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

/**
 * `GET /experiences/{id}/coverage` → khối độ phủ đầy đủ cho màn chi tiết.
 *
 * `components_total === 0` trả **null**, không trả 0%. Không có component nào
 * thì không có phép chia — "0%" ở đó đọc như "đã đo và trượt hết", trong khi
 * sự thật là chưa có gì để đo. Đúng quy ước BE dùng cho `signal_coverage` ở
 * danh sách: bỏ qua chứ không báo 0.
 */
export const v2ToSignalCoverage = (
  c: RxExperienceCoverage
): SignalCoverage | null => {
  const s = c.signal_coverage;
  if (!s || s.components_total <= 0) return null;
  return {
    blocks: s.blocks_total,
    trackedBlocks: s.blocks_reporting,
    components: s.components_total,
    trackedComponents: s.components_tracked,
    pct: Math.round(s.pct * 100),
  };
};

const layerName = (l: RxExperienceLayer): string => {
  if (l.name) return l.name;
  // Hình A không có `name`; tiêu đề đã soạn là thứ người dùng nhận ra nhất.
  const title = (l.content ?? l.contentVi ?? {}) as Record<string, unknown>;
  const desktop = (title.desktop ?? title) as Record<string, unknown>;
  const t = desktop.title ?? desktop.heading ?? desktop.label;
  if (typeof t === 'string' && t.trim()) return t.trim();
  return l.key ?? l.block_type ?? l.blockType ?? '—';
};

/**
 * `GET /experiences/{id}` → các block để vẽ.
 *
 * Đọc CẢ HAI hình dạng canvas (xem `RxExperienceLayer`): `block_type ??
 * blockType`.
 */
export const v2DetailToLayers = (d: RxExperienceDetail): ExperienceLayer[] =>
  (d.layers ?? []).map(l => {
    const comps = l.components ?? [];
    return {
      name: layerName(l),
      blockType: l.block_type ?? l.blockType ?? null,
      // Hình A không mang `isVisible`; vắng ⇒ đang hiện.
      visible: l.isVisible !== false,
      tracked: l.block_signal?.track === true,
      blockSignals: Object.entries(l.block_signal?.signals ?? {})
        .filter(([, on]) => on)
        .map(([name]) => name),
      components: comps.map(c => ({
        key: c.key,
        kind: c.component_kind,
        tracked: c.signal?.track === true,
        event: c.signal?.event ?? null,
      })),
    };
  });
