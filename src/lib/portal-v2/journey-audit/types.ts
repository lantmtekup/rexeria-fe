import type {
  RxAuditFlowEdgeType,
  RxAuditHandoffSeverity,
  RxAuditSeverity,
  RxAuditTouchpointState,
} from '@/services/rexer-v2/types/audit';

/**
 * View model của Journey Audit — bản camelCase của hợp đồng Rx, tiền đã đổi
 * cents → đơn vị tiền. Mock giữ shape Rx (services map qua `fromRx.ts`); mọi
 * component chỉ nhìn các type dưới đây.
 */

export type AuditSeverity = RxAuditSeverity;
export type AuditTouchpointState = RxAuditTouchpointState;
export type AuditHandoffSeverity = RxAuditHandoffSeverity;
export type AuditFlowEdgeType = RxAuditFlowEdgeType;
export type AuditSnapshotKind =
  | 'page'
  | 'listing'
  | 'social'
  | 'email'
  | 'reviews'
  | 'audio'
  | 'chat'
  | 'physical';
/** View: BE `off` hiển thị là `available` (chưa/không còn kết nối). */
export type AuditSourceStatus = 'connected' | 'attention' | 'available';
export type AuditSourceAuth = string;

/* ── catalog rail ────────────────────────────────────────────────────────── */

export type AuditProductRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  icon: string;
  score: number | null;
  touchpointCount: number;
  /** Khoá journey/flow/dropoff trong bundle — Phase 1 sản phẩm thật mượn
   *  journey mock, nên id dòng ≠ id dữ liệu audit. */
  auditId: string;
};

/* ── journey board ───────────────────────────────────────────────────────── */

export type AuditDims = {
  messageMatch: number;
  loadSpeed: number;
  brandConsistency: number;
  friction: number;
  accessibility: number;
};

export type AuditFlag = {
  severity: AuditSeverity | 'neutral';
  label: string;
};

export type AuditFinding = {
  severity: AuditSeverity;
  text: string;
  evidenceSource: string;
  observedAt: string;
};

export type AuditSnapshot = {
  kind: AuditSnapshotKind;
  heading: string;
  subline: string;
  cta: string;
};

export type AuditTraffic = {
  arrive: number;
  /** Phần trăm 0..100 (đã quy đổi từ phân số của BE). */
  continueRatePct: number;
  leave: number;
  estimated: boolean;
};

export type AuditTouchpoint = {
  id: string;
  name: string;
  channel: string;
  icon: string;
  /** null = ghost chưa từng được chấm. */
  score: number | null;
  dims: AuditDims | null;
  flags: AuditFlag[];
  sourceIds: string[];
  /** Trạng thái server chấm — fallback khi statuses client không phủ đủ
   *  (vd admin đọc được journey nhưng /v1/sources từ chối). */
  state: AuditTouchpointState;
  traffic: AuditTraffic | null;
  findings: AuditFinding[];
  recommendation: string;
  snapshot: AuditSnapshot;
};

export type AuditStage = {
  key: string;
  name: string;
  icon: string;
  objective: string;
  touchpoints: AuditTouchpoint[];
};

export type AuditHandoff = {
  afterStage: string;
  severity: AuditHandoffSeverity;
  label: string;
  note: string;
};

export type AuditJourney = {
  productId: string;
  stages: AuditStage[];
  handoffs: AuditHandoff[];
};

/* ── flow ────────────────────────────────────────────────────────────────── */

export type AuditFlowEdge = {
  from: string;
  to: string;
  type: AuditFlowEdgeType;
  volume: number;
  note: string | null;
};

export type AuditFlow = {
  productId: string;
  /** touchpointId → lượng khách đến thẳng (ads, search, links). */
  entry: Record<string, number>;
  edges: AuditFlowEdge[];
  estimated: boolean;
};

/* ── drop-off ────────────────────────────────────────────────────────────── */

export type AuditFunnelStep = {
  key: string;
  label: string;
  count: number;
};

export type AuditLeakEvidence = {
  sourceId: string;
  text: string;
};

export type AuditLeak = {
  id: string;
  rank: number;
  title: string;
  fromStep: number;
  toStep: number;
  touchpointId: string | null;
  usd: number;
  /** Chuỗi hiển thị: BE trả chữ ("high"), mock trả "86%". */
  confidence: string;
  /** Chuỗi hiển thị dựng từ lo/hi usd_cents ("$2,470–$4,120/mo"). */
  recoveryRange: string;
  narrative: string;
  evidence: AuditLeakEvidence[];
  fix: string;
  estimated: boolean;
};

export type AuditChannelRow = {
  name: string;
  sessions: number;
  sharePct: number;
  buyersPer1000: number;
};

export type AuditDropoff = {
  productId: string;
  steps: AuditFunnelStep[];
  /** benchmarks[i] = %-continue điển hình của lần chuyển i → i+1; null = không có. */
  benchmarks: Array<number | null>;
  leaks: AuditLeak[];
  channels: AuditChannelRow[];
  /** true = phễu là số đo thật (intel.funnel); false = traffic model ước tính. */
  measured: boolean;
};

/* ── sources ─────────────────────────────────────────────────────────────── */

export type AuditSource = {
  /** Connection id (uuid) với nguồn đã kết nối; provider key với nguồn catalog. */
  id: string;
  provider: string;
  name: string;
  icon: string;
  category: string;
  auth: AuditSourceAuth;
  status: AuditSourceStatus;
  firstParty: boolean;
  stages: string[];
  observes: string | null;
  stats: string | null;
  lastSync: string | null;
  freshness?: 'fresh' | 'stale' | 'never' | null;
  issue: string | null;
  value: string | null;
  unlocks: string | null;
};

/* ── connect wizard (FE-only demo config, theo SRC_AUTH của prototype) ───── */

export type WizardField = {
  label: string;
  value: string;
  help?: string;
  type?: 'text' | 'password';
};

export type WizardPerm = {
  title: string;
  code?: string;
  desc: string;
};

export type WizardAccount = {
  bg: string;
  initials: string;
  name: string;
  sub: string;
};

export type WizardPopup = {
  url: string;
  brandBg: string;
  brandLetter: string;
  brandName: string;
  brandSub: string;
};

export type WizardStep =
  | {
      kind: 'form';
      title: string;
      cta: string;
      lead?: string;
      guide?: { title: string; body: string };
      fields: WizardField[];
      denyNote?: string;
    }
  | {
      kind: 'oauth';
      title: string;
      cta: string;
      popup: WizardPopup;
      perms?: WizardPerm[];
      /** Bước chọn account nằm ngay trong popup (kiểu Google sign-in). */
      accounts?: { key: string; items: WizardAccount[] };
      denyNote?: string;
    }
  | {
      kind: 'picker';
      title: string;
      cta: string;
      lead: string;
      accountsKey: string;
      accounts: WizardAccount[];
      help?: string;
    }
  | {
      kind: 'mapping';
      title: string;
      cta: string;
      lead: string;
      rows: WizardPerm[];
    }
  | {
      kind: 'sync';
      title: string;
      rows: Array<[string, string?]>;
      done: { stats: string; msg: string };
    };

export type WizardConfig = {
  provider: string;
  steps: WizardStep[];
};

/* ── bundle Phase 1 (mock, cả hai sản phẩm — đổi sản phẩm không refetch) ─── */

export type JourneyAuditBundle = {
  products: AuditProductRow[];
  journeys: Record<string, AuditJourney>;
  flows: Record<string, AuditFlow>;
  sources: AuditSource[];
  /** true = dữ liệu từ `/v1/audit/*` thật; false = demo mock. */
  live: boolean;
  error: string | null;
};
