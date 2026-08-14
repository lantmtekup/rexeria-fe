export type MiningStageId =
  | 'sessions'
  | 'pdp'
  | 'cart'
  | 'checkout'
  | 'purchase';

export type MiningJourneyPhase =
  | 'aware'
  | 'consider'
  | 'decide'
  | 'convert'
  | 'retain';

export type MiningRisk = 'low' | 'med' | 'high';
export type MiningSourceStatus = 'connected' | 'error' | 'off';
export type MiningExperimentStatus =
  | 'running'
  | 'draft'
  | 'won'
  | 'lost'
  | 'stopped';

export type MiningStage = {
  id: MiningStageId;
  label: string;
  count: number;
  phase: MiningJourneyPhase;
};

export type MiningEvidence = {
  src: string;
  from: string;
  text: string;
};

export type MiningDraftBlock = {
  n: string;
  h?: string;
  b?: string;
  leans: string;
  claims?: boolean;
};

export type MiningAgentDraft = {
  name: string;
  cat: string;
  obj: string;
  product: string | null;
  tagline: string;
  summary: string;
  blocks: MiningDraftBlock[];
  features: string[];
};

export type MiningOption = {
  id: string;
  name: string;
  angle: string;
  risk: MiningRisk;
  rec: string;
  leans: string;
  before: string[];
  after: string[];
  draft?: MiningAgentDraft;
};

export type MiningOpportunity = {
  id: string;
  rank: number;
  title: string;
  stage: string;
  leakAfter: number;
  risk: number;
  conf: number;
  recovery: string;
  summary: string;
  evidence: MiningEvidence[];
  options: MiningOption[];
  playbook: string;
};

export type MiningChannel = {
  ch: string;
  share: number;
  hint?: string;
};

export type MiningExperimentArm = {
  sess: number;
  conv: number;
};

export type MiningExperiment = {
  id: string;
  opt: string;
  name: string;
  from: string;
  status: MiningExperimentStatus;
  days: number;
  metric: string;
  sig: number;
  hypothesis: string;
  a: MiningExperimentArm;
  b: MiningExperimentArm;
  daily: [number, number][];
  learning?: string;
  stopped?: {
    day: number;
    sig: number;
  };
};

export type MiningSource = {
  id: string;
  name: string;
  auth: 'oauth' | 'apikey' | 'snippet';
  status: MiningSourceStatus;
  covers: MiningStageId[];
  entities: string;
  fresh: string;
  err?: string;
  own?: boolean;
};

export type MiningData = {
  asOf: string;
  stages: MiningStage[];
  opps: MiningOpportunity[];
  channels: MiningChannel[];
  aov: number;
  experiments: MiningExperiment[];
  sources: MiningSource[];
};
