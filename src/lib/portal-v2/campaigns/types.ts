/**
 * The Campaigns model.
 *
 * A CAMPAIGN is a business moment with a brief, a budget, dates and an owner.
 * An ITEM is one SUBJECT in that campaign — a product (a SKU) or a topic (no
 * SKU behind it: a gift guide, a brand film) — plus the experiences built for
 * it. A campaign is a plan; an item is a piece of work.
 *
 * Nothing here is stored: the module reads `MOCK_CAMPAIGNS` and every mutation
 * is a pure function over the list, the same contract Journeys and Brand use.
 */

/** Prototype `CAMP_TYPES` (rexer-demo-v3.html :15610). */
export type CampaignType =
  | 'launch'
  | 'seasonal'
  | 'sale'
  | 'always'
  | 'retention';

/** The commercial intent — distinct from `brief.objective`, which is prose. */
export type CampaignGoal = 'awareness' | 'traffic' | 'conversion' | 'retention';

/** The persisted statuses. `building` is not one of them — see `CampaignStage`. */
/**
 * Trạng thái chiến dịch — do BE SUY RA và LƯU, không phải FE đặt.
 *
 * `core.DeriveCampaignStage`: có hạng mục `live` ⇒ live; có hạng mục rời `todo`
 * ⇒ building; còn lại ⇒ planning. `done` là lần chốt tay duy nhất, qua
 * `PATCH /campaigns/{id}/status` (endpoint đó chỉ nhận `'done'` hoặc `null`).
 *
 * Bản trước khai hai bộ từ vựng: `CampaignStatus = draft|active|paused|
 * completed` (được cho là "lưu") và `CampaignStage` (được cho là "suy ra").
 * Cả hai đều sai — DB chỉ chứa `planning` và `building`, và chính BE mới là
 * nơi suy. Chép luật đó sang FE là cách hai bên lệch nhau.
 *
 * KHÔNG có `paused`: taxonomy §5.1 của BE không có trạng thái này.
 */
export type CampaignStage = 'planning' | 'building' | 'live' | 'done';

/**
 * The lifecycle the campaign screen is organised around (`CAMP_PHASES`,
 * rexer-demo-v3.html :20619). Derived from the stage, overridable by the user
 * for the length of a visit.
 */
export type CampaignPhase = 'plan' | 'build' | 'run' | 'learn';

/** Plan §mod-campaigns: "Not started → In build → In review → Ready → Live". */
export type CampaignItemStatus =
  | 'todo'
  | 'building'
  | 'review'
  | 'ready'
  | 'live';

/** "hạng mục theo sản phẩm hoặc chủ đề" — a SKU or a topic with no SKU behind it. */
export type CampaignSubjectKind = 'product' | 'topic';

/**
 * A brand member the work can be assigned to — `GET /brands/{id}/users`.
 *
 * Trước đây "Owner" chọn giữa bốn cái tên bịa cứng (`CAMPAIGN_TEAM`) không
 * khớp người dùng thật nào trong brand — chọn xong thì không có gì để lưu.
 */
export type CampaignTeamMember = { id: string; name: string };

export type CampaignItem = {
  id: string;
  kind: CampaignSubjectKind;
  /** Set when `kind === 'product'`. */
  productId?: string;
  /** Set when `kind === 'topic'` — free text, no SKU behind it. */
  name?: string;
  /** Experience ids — always campaign copies, never templates (Rule R1). */
  expIds: string[];
  status: CampaignItemStatus;
  /** `owner_id` — a member's uuid, or `''` for unassigned. Resolve the display name via `ownerName`/`CampaignTeamMember[]`. */
  owner: string;
  /** `YYYY-MM-DD`, or null for "no deadline / shipped". */
  due: string | null;
  note: string;
};

/** The four things everyone building the campaign has to agree on first. */
export type CampaignBrief = {
  objective: string;
  audience: string;
  message: string;
  offer: string;
};

export type CampaignView = {
  id: string;
  name: string;
  /** Giá trị server trả về, xem `CampaignStage`. */
  status: CampaignStage;
  /**
   * null với bản ghi cũ: cột `type` cho phép NULL và 20/20 chiến dịch hiện có
   * đều rỗng. `POST /campaigns` bắt buộc trường này nên bản mới luôn có — đừng
   * mặc định thành 'launch', đó là gán nhãn cho thứ chưa ai đặt.
   */
  type: CampaignType | null;
  goal: CampaignGoal | null;
  owner: string;
  channels: string[];
  budgetAmount: number | null;
  budgetCurrency: string;
  /** `YYYY-MM-DD`. */
  startDate: string | null;
  /** `YYYY-MM-DD`, or null for an always-on campaign. */
  endDate: string | null;
  productId: string | null;
  brief: CampaignBrief;
  items: CampaignItem[];
  /**
   * The journey fork this campaign runs on — `j-{origin}-{campaignId}`. One
   * campaign, one journey; null until a blueprint is routed onto it.
   */
  journeyId: string | null;
  /** True once the campaign's journey has been promoted back to a blueprint. */
  promoted?: boolean;
};

/** The draft a create/edit form hands back — no id, no derived fields. */
export type CampaignDraft = {
  name: string;
  /**
   * null với bản ghi cũ: cột `type` cho phép NULL và 20/20 chiến dịch hiện có
   * đều rỗng. `POST /campaigns` bắt buộc trường này nên bản mới luôn có — đừng
   * mặc định thành 'launch', đó là gán nhãn cho thứ chưa ai đặt.
   */
  type: CampaignType | null;
  goal: CampaignGoal | null;
  owner: string;
  /** Giá trị server trả về, xem `CampaignStage`. */
  status: CampaignStage;
  channels: string[];
  budgetAmount: number | null;
  budgetCurrency: string;
  startDate: string | null;
  endDate: string | null;
  productId: string | null;
  brief: CampaignBrief;
  items: CampaignItem[];
  journeyId: string | null;
};

/* ── experiences ────────────────────────────────────────────────────────── */

/**
 * An experience as Campaigns needs it. The library itself is a separate module
 * with its own richer view type; the ship gate only needs to know four things:
 * what it is called, how much of it is tracked, which product its master was
 * authored for, and whether a copy has been adapted to the subject it now
 * speaks to.
 */
export type CampaignExperience = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  /** Share of blocks and components carrying a signal, 0–1. */
  coverage: number;
  /** The product this was authored for, or null for a subject-agnostic master. */
  productId: string | null;
  /** True ⇒ a library master, forked on use. */
  template: boolean;
  /** Copies only — the master this was forked from. */
  origin: string | null;
  /** Copies only — the campaign that owns it. */
  campaign: string | null;
  /**
   * Copies only — its words were rewritten for the subject it is filed under.
   *
   * KHÔNG CÓ GÌ ĐẶT TRƯỜNG NÀY LÚC NÀY. Nó từng được một nút "Adapt cho sản
   * phẩm" bật lên trong React state, nhưng không có route BE nào ghi lại, nên
   * cờ mất ngay lần tải lại trong khi hạng mục đã kịp qua cổng ship. Nút đã bỏ.
   *
   * `speaksForSubject` và `subjectLane` vẫn đọc trường này, và sẽ sống lại
   * nguyên vẹn khi BE có đường adapt. Tới lúc đó, một bản copy viết cho sản
   * phẩm khác chỉ qua cổng bằng hai lối thật: sửa lời văn, hoặc thay bằng bản
   * khác — đúng hai lối `shipWhy_words` đang chỉ.
   */
  adapted?: boolean;
};

/* ── the plan gate ──────────────────────────────────────────────────────── */

/** Where a gap sends the user to fix it. */
export type CampaignGapFix =
  | { kind: 'brief' }
  | { kind: 'journey' }
  | { kind: 'addItem' }
  | { kind: 'item'; index: number };

export type CampaignGap = {
  id: string;
  /** An i18n key under `portalV2.campaigns`. */
  messageKey: string;
  /** Values for that key — a subject name, a count. */
  values?: Record<string, string | number>;
  fix: CampaignGapFix;
};

export type CampaignReadiness = {
  /** 0–100 — how much of the plan is answered. */
  score: number;
  ok: number;
  total: number;
  gaps: CampaignGap[];
};

/* ── the ship gate ──────────────────────────────────────────────────────── */

export type ShipCheckId = 'built' | 'words' | 'tracked' | 'dated';

export type ShipCheck = {
  id: ShipCheckId;
  ok: boolean;
};

export type ShipGate = {
  ok: boolean;
  checks: ShipCheck[];
  /** The checks that failed, in order. */
  missing: ShipCheckId[];
};

/* ── what the numbers say ───────────────────────────────────────────────── */

export type CampaignVerdict = {
  sessions: number;
  converted: number;
  leads: number;
  revenue: number;
  spend: number;
  cvr: number;
  /** Conversion rate against the control, as a ratio: 0.31 ⇒ 31% above. */
  lift: number;
  roas: number;
  roi: number;
  cac: number;
  /** Session-weighted signal coverage, 0–1. null = not measured (`/intel/trust` unavailable at this grain), distinct from 0%. */
  trust: number | null;
  best: { name: string; lift: number } | null;
  worst: { name: string; lift: number } | null;
};

export type CampaignHealthState =
  | 'healthy'
  | 'valuable'
  | 'delayed'
  | 'risk'
  | 'complete';

export type CampaignHealth = {
  state: CampaignHealthState;
  /** An i18n key explaining the state in one line. */
  whyKey: string;
  values?: Record<string, string | number>;
};

/* ── the create wizard ──────────────────────────────────────────────────── */

export type CampaignWizard = {
  /** 1–4: the moment, the brief, the journey, the merchandise. */
  step: number;
  type: CampaignType | null;
  name: string;
  owner: string;
  startDate: string;
  endDate: string;
  budget: string;
  channels: string[];
  goal: CampaignGoal | null;
  objective: string;
  audience: string;
  message: string;
  offer: string;
  /** The blueprint journey to fork onto this campaign, or null when skipped. */
  journeyId: string | null;
  skipJourney: boolean;
  /** Product ids carried by this campaign. */
  subjects: string[];
  /** Free-text topics carried by this campaign. */
  topics: string[];
};

/* ── list narrowing ─────────────────────────────────────────────────────── */

export type CampaignViewMode = 'grid' | 'table';

export type CampaignFilters = {
  stage: CampaignStage | 'all';
  q: string;
  view: CampaignViewMode;
};
