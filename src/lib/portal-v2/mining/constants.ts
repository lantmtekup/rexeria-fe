import type {
  MiningJourneyPhase,
  MiningRisk,
} from '@/lib/portal-v2/mining/types';

export const EXPERIMENT_SHIP_GATE = 95;

export const MINING_PHASE_LABELS: Record<MiningJourneyPhase, string> = {
  aware: 'Aware',
  consider: 'Consider',
  decide: 'Decide',
  convert: 'Convert',
  retain: 'Retain',
};

export const MINING_RISK_LABELS: Record<MiningRisk, string> = {
  low: 'Low risk',
  med: 'Medium risk',
  high: 'High risk',
};

export const MINING_RISK_CLASSES: Record<MiningRisk, string> = {
  low: 'border-[color-mix(in_srgb,var(--pv2-success)_28%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-success)_8%,var(--pv2-paper))] text-[var(--pv2-success)]',
  med: 'border-[color-mix(in_srgb,var(--pv2-warning)_30%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_9%,var(--pv2-paper))] text-[var(--pv2-warning)]',
  high: 'border-[color-mix(in_srgb,var(--pv2-error)_28%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_8%,var(--pv2-paper))] text-[var(--pv2-error)]',
};
