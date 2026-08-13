import { COVERAGE_THRESHOLDS } from '@/lib/portal-v2/experiences/constants';
import type {
  EvidenceTier,
  ExperienceObjective,
} from '@/lib/portal-v2/experiences/types';

export type PillStyle = { bg: string; fg: string };

/**
 * Objective pill colours.
 *
 * These used to be derived — `ROLE_STYLE[OBJECTIVE_ROLE[objective]]` — so an
 * objective was painted in the colour of the funnel role it served. The funnel
 * role is gone, so the table is direct now. The hexes are unchanged from what
 * each objective resolved to before, on purpose: dropping the indirection is
 * not meant to repaint the UI.
 *
 * Do NOT reach for `@/lib/portal-v2/exchange/objectiveStyles` instead — that
 * table maps the same four ids to unrelated colours and the mismatch produces
 * no type error.
 */
const OBJECTIVE_STYLE: Record<ExperienceObjective, PillStyle> = {
  insight: {
    bg: 'color-mix(in srgb, var(--pv2-warning) 18%, transparent)',
    fg: '#b45309',
  },
  lead: {
    bg: 'color-mix(in srgb, var(--pv2-electric) 12%, transparent)',
    fg: 'var(--pv2-blue-500)',
  },
  cta: {
    bg: 'color-mix(in srgb, var(--pv2-violet) 12%, transparent)',
    fg: 'var(--pv2-violet)',
  },
  convert: {
    bg: 'color-mix(in srgb, var(--pv2-success) 14%, transparent)',
    fg: '#0e9d6e',
  },
};

export const objectivePillStyle = (objective: ExperienceObjective): PillStyle =>
  OBJECTIVE_STYLE[objective];

/**
 * Typed on `EvidenceTier` rather than substring-matching a label, which is what
 * the exchange module's `tierChipStyle` has to do.
 */
export const EVIDENCE_TIER_STYLE: Record<EvidenceTier, PillStyle> = {
  high: {
    fg: '#0e9d6e',
    bg: 'color-mix(in srgb, var(--pv2-success) 14%, transparent)',
  },
  directional: {
    fg: '#b45309',
    bg: 'color-mix(in srgb, var(--pv2-warning) 18%, transparent)',
  },
  early: { fg: 'var(--pv2-faint)', bg: 'var(--pv2-canvas)' },
  unmeasured: { fg: 'var(--pv2-faint)', bg: 'var(--pv2-canvas)' },
};

export type CoverageTone = 'ok' | 'warn' | 'bad';

export const coverageTone = (pct: number): CoverageTone => {
  if (pct >= COVERAGE_THRESHOLDS.ok) return 'ok';
  if (pct >= COVERAGE_THRESHOLDS.warn) return 'warn';
  return 'bad';
};

export const COVERAGE_TONE_STYLE: Record<CoverageTone, PillStyle> = {
  ok: {
    fg: '#0e9d6e',
    bg: 'var(--pv2-success)',
  },
  warn: {
    fg: '#b45309',
    bg: 'var(--pv2-warning)',
  },
  bad: {
    fg: '#9a2436',
    bg: 'var(--pv2-error)',
  },
};
