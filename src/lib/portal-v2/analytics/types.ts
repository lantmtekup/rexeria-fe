/** Workspace tab lenses — prototype `PULSE_WS_LENSES`. */
export type PulseLens = 'overview' | 'analytics' | 'insights';

/** Rankings component type — prototype `INS_TYPES`. */
export type InsightType = 'experiences' | 'products' | 'journeys' | 'blocks';

export type PulseDrillState = {
  campaignId: string | null;
  subject: string | null;
  experienceId: string | null;
  blockIndex: number | null;
  componentEl: string | null;
};

export type PulseViewState = {
  lens: PulseLens;
  drill: PulseDrillState;
  insightType: InsightType;
  insightObjectId: string | null;
};

export type PulseComponent = {
  el: string;
  kind: string;
  type: string;
  event: string;
  meaning: string;
  signals: number;
  assist: number;
  conf: number;
  strength: number;
};

export type PulseBlock = {
  index: number;
  name: string;
  role: string;
  views: number;
  inter: number;
  exits: number;
  done: number;
  dwell: number;
  interRate: number;
  exitRate: number;
  doneRate: number;
  comps: PulseComponent[];
};

/** One enriched row of the fact table — sessions grain with block/component drill. */
export type PulseFactRow = {
  campaignId: string;
  campaignName: string;
  channel: string;
  subjectKind: string;
  subjectName: string;
  experienceId: string;
  originId: string;
  experienceName: string;
  sessions: number;
  engaged: number;
  explored: number;
  convinced: number;
  converted: number;
  leads: number;
  revenue: number;
  spend: number;
  controlCvr: number | null;
  cvr: number;
  lift: number;
  aov: number;
  coveragePct: number;
  blocks: PulseBlock[];
};

export type PulseRollup = {
  sessions: number;
  engaged: number;
  explored: number;
  convinced: number;
  converted: number;
  leads: number;
  revenue: number;
  spend: number;
  cvr: number;
  controlCvr: number;
  lift: number;
  aov: number;
  rows: number;
};

export type FunnelStep = {
  label: string;
  value: number;
  lost: number;
};

export type FunnelLeak = {
  after: string;
  into: string;
  lost: number;
  risk: number;
};

export type ChannelMixRow = {
  channel: string;
  sessions: number;
  cvr: number;
  lift: number;
};

export type InsightSplit = {
  campaignId: string;
  campaignName: string;
  rollup: PulseRollup;
};

export type InsightFunnelStep = {
  name: string;
  rate: number | null;
};

export type InsightFunnel = {
  steps: InsightFunnelStep[];
  weakest: InsightFunnelStep | null;
  strongest: InsightFunnelStep | null;
};

export type InsightItemBase = {
  id: string;
  name: string;
  rows: PulseFactRow[];
  rollup: PulseRollup;
  splits: InsightSplit[];
  campaigns: number;
  variance: number | null;
};

export type ExperienceInsightItem = InsightItemBase & {
  type: 'experiences';
  funnel: InsightFunnel;
  role: string | null;
  bestChannel: { channel: string; rollup: PulseRollup } | null;
  depth: number | null;
};

export type ProductInsightItem = InsightItemBase & {
  type: 'products';
  aov: number;
  cac: number | null;
  bestExp: { name: string; rollup: PulseRollup } | null;
  bestChan: { channel: string; rollup: PulseRollup } | null;
};

export type JourneyInsightItem = InsightItemBase & {
  type: 'journeys';
  funnel: InsightFunnel;
  completion: number;
};

export type BlockInsightItem = {
  type: 'blocks';
  id: string;
  name: string;
  sub: string;
  role: string;
  blockIndex: number;
  originId: string;
  rows: PulseFactRow[];
  views: number;
  interRate: number;
  exitRate: number;
  doneRate: number;
  dwell: number;
  assist: number | null;
  tracked: number;
  campaigns: number;
};

export type InsightItem =
  | ExperienceInsightItem
  | ProductInsightItem
  | JourneyInsightItem
  | BlockInsightItem;

export type JourneyPhaseGroup = {
  label: string;
  hint: string;
  kind: 'flow' | 'convert' | 'off';
  rows: PulseFactRow[];
};
