import type { RxExperiment } from '@/services/rexer-v2/types/experiments';

import type { Experiment } from './types';

/** Hợp đồng Rx (snake_case) → view model của màn Experiments. */
export const experimentFromRx = (rx: RxExperiment): Experiment => ({
  id: rx.id,
  opt: '',
  name: rx.name,
  from: rx.leak_id ?? '',
  status: rx.status,
  days: rx.days,
  metric: rx.metric,
  sig: rx.sig,
  hypothesis: rx.hypothesis,
  a: { sess: rx.arms.a.sessions, conv: rx.arms.a.conversions },
  b: { sess: rx.arms.b.sessions, conv: rx.arms.b.conversions },
  daily: rx.daily.map(day => [day.a_conversions, day.b_conversions]),
  dailyKind: 'conversions',
  learning: rx.learning ?? undefined,
  stopped: rx.status === 'stopped' ? { day: rx.days, sig: rx.sig } : undefined,
  leakId: rx.leak_id,
  productId: rx.product_id,
  startedAt: rx.started_at,
  endedAt: rx.ended_at,
});
