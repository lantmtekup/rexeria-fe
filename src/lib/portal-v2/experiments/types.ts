/**
 * Types của module Experiments — đổi tên từ Mining* khi gỡ module Mining;
 * hành vi giữ nguyên (ship gate 95, stop/conclude).
 */

export type ExperimentStatus = 'running' | 'draft' | 'won' | 'lost' | 'stopped';

export type ExperimentArm = {
  sess: number;
  conv: number;
};

export type Experiment = {
  id: string;
  /** Option id trong opportunity nguồn (mock demo; live: ''). */
  opt: string;
  name: string;
  /** Opportunity (mock) / leak id (live) mà thử nghiệm sinh ra từ đó. */
  from: string;
  status: ExperimentStatus;
  days: number;
  metric: string;
  sig: number;
  hypothesis: string;
  a: ExperimentArm;
  b: ExperimentArm;
  /**
   * Cặp số theo ngày. Mock: CVR % của control/variant; live: SỐ conversion
   * (BE trả a_conversions/b_conversions, không có sessions theo ngày để
   * tính CVR — không bịa).
   */
  daily: [number, number][];
  dailyKind?: 'cvr' | 'conversions';
  learning?: string;
  stopped?: {
    day: number;
    sig: number;
  };
  /** Live: leak nguồn (FR-E4) + product để deep-link về Drop-off. */
  leakId?: string | null;
  productId?: string;
  startedAt?: string | null;
  endedAt?: string | null;
};

/** Phần tối thiểu của một playbook option mà màn Experiments cần vẽ. */
export type ExperimentOptionRef = {
  id: string;
  name: string;
  angle: string;
  rec: string;
  leans: string;
};

/** Phần tối thiểu của opportunity nguồn — đủ cho nhãn "from leak" và công
 *  thức recovered (leakAfter trỏ vào stage đích). */
export type ExperimentOpportunityRef = {
  id: string;
  title: string;
  stage: string;
  leakAfter: number;
  options: ExperimentOptionRef[];
};

export type ExperimentStageRef = {
  id: string;
  label: string;
  count: number;
};

export type ExperimentsData = {
  stages: ExperimentStageRef[];
  opps: ExperimentOpportunityRef[];
  aov: number;
  experiments: Experiment[];
};
