/**
 * Experiments (`/v1/experiments*`) — hợp đồng vòng 5, BE đang xây song song
 * y hệt trên nhánh feature/journey-audit-experiments (JSON snake_case).
 *
 * Luật gate (khớp UX ship gate 95 của FE):
 * - `POST /:id/stop` BỊ TỪ CHỐI khi `sig >= 95` — lỗi code `GATE_OPEN`.
 * - `POST /:id/conclude` CHỈ khi `sig >= 95` — lỗi code `GATE_CLOSED` nếu
 *   chưa; body `{learning?}`; won/lost do BE tự dẫn xuất từ arms.
 * - `DELETE /:id` chỉ với draft.
 */

export type RxExperimentStatus =
  | 'draft'
  | 'running'
  | 'won'
  | 'lost'
  | 'stopped';

export type RxExperimentArm = {
  sessions: number;
  conversions: number;
};

export type RxExperimentDaily = {
  day: number;
  a_conversions: number;
  b_conversions: number;
};

export type RxExperiment = {
  id: string;
  product_id: string;
  leak_id: string | null;
  name: string;
  hypothesis: string;
  metric: string;
  status: RxExperimentStatus;
  arms: {
    a: RxExperimentArm;
    b: RxExperimentArm;
  };
  daily: RxExperimentDaily[];
  sig: number;
  days: number;
  learning: string | null;
  started_at: string | null;
  ended_at: string | null;
};

export type RxExperimentListResponse = { items: RxExperiment[] };

/** `leak_id` có mặt thì BE prefill name/hypothesis/metric từ leak (FR-E4). */
export type RxCreateExperimentRequest = {
  leak_id?: string;
  product_id: string;
  name?: string;
  hypothesis?: string;
  metric?: string;
};

export type RxConcludeExperimentRequest = {
  learning?: string;
};
