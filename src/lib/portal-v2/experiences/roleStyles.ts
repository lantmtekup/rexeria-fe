import {
  COVERAGE_THRESHOLDS,
  OBJECTIVE_ROLE,
} from '@/lib/portal-v2/experiences/constants';
import type {
  EvidenceTier,
  ExperienceObjective,
  FunnelRole,
} from '@/lib/portal-v2/experiences/types';

export type PillStyle = { bg: string; fg: string };

/**
 * The five funnel roles — prototype `ROLES` (~L5382), remapped onto the Studio
 * palette. `bar` is the solid fill used by the funnel stack and the cover.
 *
 * The `fg` hexes are the accessible text variants of the semantic tokens; the
 * repo already uses these exact values (see
 * `@/lib/portal-v2/exchange/objectiveStyles`) because there is no
 * `--pv2-success-fg` family in `tokens.css`.
 */
export const ROLE_STYLE: Record<
  FunnelRole,
  PillStyle & { labelKey: string; bar: string }
> = {
  ATT: {
    labelKey: 'roleAtt',
    bg: 'color-mix(in srgb, var(--pv2-warning) 18%, transparent)',
    fg: '#b45309',
    bar: 'var(--pv2-warning)',
  },
  EDU: {
    labelKey: 'roleEdu',
    bg: 'color-mix(in srgb, var(--pv2-violet) 12%, transparent)',
    fg: 'var(--pv2-violet)',
    bar: 'var(--pv2-violet)',
  },
  EXP: {
    labelKey: 'roleExp',
    bg: 'color-mix(in srgb, var(--pv2-electric) 12%, transparent)',
    fg: 'var(--pv2-blue-500)',
    bar: 'var(--pv2-electric)',
  },
  TRU: {
    labelKey: 'roleTru',
    bg: 'color-mix(in srgb, var(--pv2-error) 12%, transparent)',
    fg: '#9a2436',
    bar: 'var(--pv2-error)',
  },
  CON: {
    labelKey: 'roleCon',
    bg: 'color-mix(in srgb, var(--pv2-success) 14%, transparent)',
    fg: '#0e9d6e',
    bar: 'var(--pv2-success)',
  },
};

/**
 * Derived from `ROLE_STYLE`, never a second table — prototype `objPill`
 * (~L15522) colours an objective by the funnel role it serves.
 */
export const objectivePillStyle = (objective: ExperienceObjective): PillStyle =>
  ROLE_STYLE[OBJECTIVE_ROLE[objective]];

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
