import type {
  EvidenceTier,
  ExperienceCategory,
  ExperienceDetailTab,
  ExperienceFilters,
  ExperienceInteraction,
  ExperienceObjective,
  ExperienceState,
  ExperienceVehicle,
} from '@/lib/portal-v2/experiences/types';

/**
 * Lỗi `POST /v1/experiences/{id}/use` → khoá i18n, cùng khuôn với
 * `DEPLOY_REASON_KEY` (`lib/portal-v2/deploy/constants.ts`).
 *
 * BE trả `message` bằng tiếng Anh, viết cho người đọc log chứ không cho người
 * dùng: `cannot fork a copy; only a template can be used` dùng từ "fork",
 * "copy", "template" — ba từ không xuất hiện ở đâu trên giao diện. Trước đây
 * câu đó hiện nguyên văn giữa một màn tiếng Việt, và không nói bước tiếp theo
 * là gì.
 *
 * Khớp theo tiền tố, không khớp tuyệt đối: BE có thể nối thêm ngữ cảnh vào
 * cuối. Không khớp thì rơi về chính `message` của BE — thà hiện câu thô còn
 * hơn nuốt mất một lỗi chưa biết.
 *
 * THỨ TỰ có ý nghĩa: `forkReasonKey` trả về khoá của entry KHỚP ĐẦU TIÊN.
 * `"cannot fork a copy with no origin template"` (trang external-URL, không
 * có gì để chain origin) chứa nguyên cụm `"cannot fork a copy"` bên trong nó,
 * nên nếu entry ngắn đứng trước, mọi lỗi "không có origin" sẽ bị đọc nhầm
 * thành "đã thuộc một hạng mục chiến dịch" — sai hẳn nguyên nhân. Entry dài
 * + cụ thể hơn phải luôn đứng TRƯỚC entry ngắn mà nó chứa.
 */
export const USE_EXPERIENCE_REASON_KEY: Record<string, string> = {
  'cannot fork a copy with no origin template': 'useErrNoOrigin',
  'cannot fork a copy': 'useErrAlreadyInCampaign',
  'taking a copy of an experience requires a brand scope': 'useErrNeedsBrand',
  'campaign_id and item_id must be provided together': 'useErrNeedsBothTargets',
};

/** Tra khoá i18n cho một `message` của BE; `null` ⇒ chưa có bản dịch. */
export const forkReasonKey = (message: string): string | null => {
  const low = message.toLowerCase();
  for (const [prefix, key] of Object.entries(USE_EXPERIENCE_REASON_KEY)) {
    if (low.includes(prefix)) return key;
  }
  return null;
};

/**
 * Prototype `XSTATES` + All (~L16071) — the page's primary navigation.
 * Ownership (source experience vs copy) is orthogonal to Category / Type / Objective.
 */
export const EXPERIENCE_STATES: {
  id: ExperienceState | 'all';
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'stateAll' },
  // Bản của brand chưa dùng cho chiến dịch nào.
  { id: 'unassigned', labelKey: 'stateUnassigned' },
  { id: 'product', labelKey: 'stateProduct' },
  { id: 'topic', labelKey: 'stateTopic' },
  // Trải nghiệm gốc CỦA CHÍNH BRAND. Nhân bản một bản copy cho ra một trải
  // nghiệm gốc nháp (`promotePage`), và nó không hiện ở Exchange vì màn đó
  // lọc `active` — nên không có tab này thì bấm Nhân bản xong thứ vừa tạo
  // biến mất khỏi mọi màn.
  //
  // Tab cũ bị bỏ vì nó nạp `state: 'templates'` nguyên xi, tức là gộp cả kho hệ
  // thống. Nay `experienceLibrary` lọc theo `brand_id` trước khi trả về, nên ở
  // đây chỉ còn hàng của brand — đo thật: 3, không phải 79.
  { id: 'template', labelKey: 'stateTemplate' },
  // Block CỦA CHÍNH BRAND — bản fork qua Exchange (`exchange.add`) sống ở đây.
  // `experienceLibrary` lọc theo brand giống hệt nhánh trải nghiệm gốc ở trên,
  // nên tab này chỉ đếm block của brand, không kéo theo ~146 block hệ thống.
  { id: 'block', labelKey: 'stateBlock' },
];

/** `DATA.expCategories` (~L5480) — what KIND of artifact this is. */
export const EXPERIENCE_CATEGORIES: {
  id: ExperienceCategory | 'all';
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'catAny' },
  { id: 'blocks', labelKey: 'catBlocks' },
  { id: 'collection', labelKey: 'catCollection' },
];

/** `DATA.expCats` (~L5497) — the vehicle. */
export const EXPERIENCE_VEHICLES: {
  id: ExperienceVehicle | 'all';
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'vehicleAny' },
  { id: 'curated', labelKey: 'vehicleCurated' },
  { id: 'ads', labelKey: 'vehicleAds' },
  { id: 'showcase', labelKey: 'vehicleShowcase' },
  { id: 'microsite', labelKey: 'vehicleMicrosite' },
];

export const EXPERIENCE_OBJECTIVES: {
  id: ExperienceObjective | 'all';
  labelKey: string;
}[] = [
  { id: 'all', labelKey: 'objAny' },
  { id: 'insight', labelKey: 'objInsight' },
  { id: 'lead', labelKey: 'objLead' },
  { id: 'cta', labelKey: 'objCta' },
  { id: 'convert', labelKey: 'objConvert' },
];

/** `EV_OPTS` (~L15273). */
export const EXPERIENCE_EVIDENCE: {
  id: EvidenceTier | 'all';
  labelKey: string;
  titleKey?: string;
}[] = [
  { id: 'all', labelKey: 'evAny' },
  { id: 'high', labelKey: 'evHigh', titleKey: 'evHighTitle' },
  {
    id: 'directional',
    labelKey: 'evDirectional',
    titleKey: 'evDirectionalTitle',
  },
  { id: 'early', labelKey: 'evEarly', titleKey: 'evEarlyTitle' },
  { id: 'unmeasured', labelKey: 'evUnmeasured', titleKey: 'evUnmeasuredTitle' },
];

/** `DATA.expInteractions` (~L5521) — what the shopper's hands actually do. */
export const EXPERIENCE_INTERACTIONS: {
  id: ExperienceInteraction;
  labelKey: string;
  descKey: string;
}[] = [
  { id: 'hotspot', labelKey: 'intHotspot', descKey: 'intHotspotDesc' },
  { id: 'swipe', labelKey: 'intSwipe', descKey: 'intSwipeDesc' },
  { id: 'pan', labelKey: 'intPan', descKey: 'intPanDesc' },
  { id: '360', labelKey: 'int360', descKey: 'int360Desc' },
  { id: 'vr', labelKey: 'intVr', descKey: 'intVrDesc' },
];

/**
 * `CONF_TIERS` (~L13409). Confidence is a rule, not a vibe. Ordered high →
 * low; the first entry whose floor is met wins.
 *
 * `requiresControl` is carried for fidelity: the prototype's shelf read always
 * passes `hasControl: true` (~L15268) because every fact row is measured
 * against the product page it replaced.
 */
export const CONFIDENCE_TIERS: {
  id: Exclude<EvidenceTier, 'unmeasured'>;
  min: number;
  requiresControl: boolean;
}[] = [
  { id: 'high', min: 5000, requiresControl: true },
  { id: 'directional', min: 1000, requiresControl: false },
  { id: 'early', min: 0, requiresControl: false },
];

/** `XGRADS` (~L7911). Carried on the record; not painted as the card cover. */
export const EXPERIENCE_GRADIENTS: { css: string; nameKey: string }[] = [
  { css: 'linear-gradient(135deg,#6C4CF1,#9B7DF8)', nameKey: 'gradViolet' },
  { css: 'linear-gradient(135deg,#3B82D6,#6FA8E5)', nameKey: 'gradBlue' },
  { css: 'linear-gradient(135deg,#13B57F,#3ED2A0)', nameKey: 'gradMint' },
  { css: 'linear-gradient(135deg,#E89A3C,#F2BE7C)', nameKey: 'gradAmber' },
  { css: 'linear-gradient(135deg,#E0629B,#F08FBC)', nameKey: 'gradRose' },
  { css: 'linear-gradient(135deg,#1E1930,#3D3950)', nameKey: 'gradInk' },
];

/** `XTABS` (~L22096), reduced to the three P0 panes. */
export const EXPERIENCE_DETAIL_TABS: {
  id: ExperienceDetailTab;
  labelKey: string;
  questionKey: string;
}[] = [
  { id: 'details', labelKey: 'tabDetails', questionKey: 'tabDetailsQ' },
  { id: 'signals', labelKey: 'tabSignals', questionKey: 'tabSignalsQ' },
  { id: 'perf', labelKey: 'tabPerf', questionKey: 'tabPerfQ' },
];

/**
 * `COMP_NAME` (~L12401), mở rộng cho `component_kind` thật của canvas.
 *
 * Bảng TRA, không phải enum: `kind` từ BE là chuỗi tự do. Không khớp thì in
 * nguyên chuỗi — một loại block mới phải hiện ra khó đọc, chứ không được biến
 * mất khỏi danh sách.
 */
export const COMPONENT_KIND_LABEL_KEY: Record<string, string> = {
  n: 'componentTitle',
  title: 'componentTitle',
  h: 'componentHeadline',
  headline: 'componentHeadline',
  b: 'componentBody',
  body: 'componentBody',
  text: 'componentBody',
  media: 'componentMedia',
  product: 'componentProduct',
  cta: 'componentCta',
  button: 'componentCta',
};

/** `block_signal.signals` — tín hiệu mức block. Cùng luật tra như trên. */
export const BLOCK_SIGNAL_LABEL_KEY: Record<string, string> = {
  dwell: 'sigDwell',
  scroll: 'sigScroll',
  tap: 'sigTap',
  complete: 'sigComplete',
  exit: 'sigExit',
};

/** `component.signal.event` — cái component ấy BÁO VỀ. */
export const COMPONENT_EVENT_LABEL_KEY: Record<string, string> = {
  view: 'evtView',
  play: 'evtPlay',
  spin: 'evtSpin',
  tap: 'evtTap',
  complete: 'evtComplete',
};

/** Prototype `xCoverCell` (~L15726) — mint ≥80, amber ≥50, else rose. */
export const COVERAGE_THRESHOLDS = { ok: 80, warn: 50 } as const;

export const EXPERIENCE_DEFAULT_FILTERS: ExperienceFilters = {
  q: '',
  state: 'all',
  category: 'all',
  vehicle: 'all',
  objective: 'all',
  ev: 'all',
};
