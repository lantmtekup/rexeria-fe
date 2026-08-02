export type CommandTabId = 'portfolio' | 'mywork' | 'recs';

export type CampaignStatus = 'planning' | 'building' | 'live' | 'done';

export type ItemStatus = 'todo' | 'building' | 'review' | 'ready' | 'live';

export type TaskSeverity = 'high' | 'medium' | 'low';

export type TaskKind =
  | 'unassigned'
  | 'late'
  | 'blocked'
  | 'review'
  | 'deploy'
  | 'inflight'
  | 'health';

export type DeployHealth = 'ok' | 'quiet' | 'stale' | 'broken';

export type InsightSeverity = 'high' | 'medium' | 'info';

/**
 * The four ways a finished experience can still fail to go out. Ported from the
 * plan's `#mod-command` requirement — "bị chặn deploy (media hết hạn, thiếu
 * kênh…)" — which the first pass of this module never modelled.
 */
export type BlockerReason =
  | 'media-expired'
  | 'missing-channel'
  | 'brand-approval'
  | 'no-owner';

export type CommandUser = {
  name: string;
  initials: string;
  email: string;
  role: string;
};

export type CommandOrg = {
  name: string;
  plan: string;
};

export type TeamMember = {
  name: string;
  initials: string;
  role: string;
};

export type CampaignItem = {
  id: string;
  subjectName: string;
  status: ItemStatus;
  owner: string;
  due: string | null;
  expCount: number;
};

export type CommandCampaign = {
  id: string;
  name: string;
  type: string;
  status: CampaignStatus;
  start: string | null;
  end: string | null;
  owner: string;
  items: CampaignItem[];
  sessions: number;
  lift: number;
};

export type CommandTask = {
  id: string;
  kind: TaskKind;
  severity: TaskSeverity;
  mine: boolean;
  what: string;
  why: string;
  cta: string;
  campaignId: string;
  campaignName: string;
  /** Initials of whoever holds it, or `null` when nobody does. */
  ownerInitials: string | null;
  href?: string;
};

export type UpcomingLaunch = {
  campaignId: string;
  campaignName: string;
  start: string;
  days: number;
  ready: number;
  total: number;
  isReady: boolean;
};

export type LiveExperience = {
  id: string;
  name: string;
  campaignName: string;
  channels: number;
  sessions24h: number;
  /** Yesterday's count, so the row can say which way it is moving. */
  sessionsPrev24h: number;
  health: DeployHealth;
};

/** An experience that is built but cannot ship until someone clears `reason`. */
export type DeployBlocker = {
  id: string;
  reason: BlockerReason;
  experienceName: string;
  campaignName: string;
  /** The specific thing that is wrong, in the operator's words. */
  detail: string;
  owner: string | null;
  /** How long it has been stuck, in days. */
  waitingDays: number;
  /** Where the fix actually happens — Media, Deploy or Campaigns. */
  href: string;
  fixLabelKey: string;
};

export type ReviewRequest = {
  id: string;
  experienceName: string;
  campaignName: string;
  requestedBy: string;
  reviewer: string;
  waitingDays: number;
  href: string;
};

export type JourneySummary = {
  id: string;
  name: string;
  campaignName: string | null;
  /** Library blueprint rather than something walking in market. */
  template: boolean;
  steps: number;
};

export type ActivityRow = {
  experienceName: string;
  campaignName: string;
  sessions: number;
  lift: number;
};

export type KpiGroup = 'running' | 'producing' | 'attention';

/** Period-over-period movement, already reduced to a sign and a percentage. */
export type KpiDelta = {
  pct: number;
  dir: 'up' | 'down' | 'flat';
  /** Up is not always good: a rise in blocked work is not a win. */
  good: boolean;
};

export type CommandKpi = {
  id: string;
  group: KpiGroup;
  labelKey: string;
  value: string | number;
  subKey: string;
  subValues?: Record<string, string | number>;
  accent: 'violet' | 'mint' | 'amber' | 'blue' | 'rose';
  delta?: KpiDelta;
  href?: string;
  tabId?: CommandTabId;
};

export type CommandRecommendation = {
  id: string;
  severity: InsightSeverity;
  level: string;
  tierName: string;
  tierWhy: string;
  finding: string;
  why: string;
  who: string;
  impact: string;
  evidence: string[];
  actionLabel: string;
  actionHref: string;
};

export type CommandTotals = {
  sessions: number;
  lift: number;
  revenue: number;
  leads: number;
};

export type CommandSnapshot = {
  user: CommandUser;
  org: CommandOrg;
  team: TeamMember[];
  campaigns: CommandCampaign[];
  liveExperiences: LiveExperience[];
  blockers: DeployBlocker[];
  reviews: ReviewRequest[];
  journeys: JourneySummary[];
  readyCount: number;
  totals: CommandTotals;
  /** The same totals one window back, so producing KPIs can carry a trend. */
  previousTotals: CommandTotals;
  /** Length of the comparison window, in days. */
  trendWindowDays: number;
  activity: ActivityRow[];
  recommendations: CommandRecommendation[];
};
