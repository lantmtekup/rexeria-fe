import type { ExperienceObjective } from '@/lib/portal-v2/experiences/types';

import type { IntelAction } from '@/lib/portal-v2/intelligence/types';

export const INTEL_GROUPS: IntelAction[] = [
  'scale',
  'fix',
  'instrument',
  'refresh',
];

export const INTEL_ACTION_META: Record<
  IntelAction,
  {
    labelKey: string;
    descKey: string;
    tone: 'scale' | 'fix' | 'instrument' | 'refresh';
  }
> = {
  scale: {
    labelKey: 'actions.scale.label',
    descKey: 'actions.scale.desc',
    tone: 'scale',
  },
  fix: {
    labelKey: 'actions.fix.label',
    descKey: 'actions.fix.desc',
    tone: 'fix',
  },
  instrument: {
    labelKey: 'actions.instrument.label',
    descKey: 'actions.instrument.desc',
    tone: 'instrument',
  },
  refresh: {
    labelKey: 'actions.refresh.label',
    descKey: 'actions.refresh.desc',
    tone: 'refresh',
  },
};

export const OBJECTIVE_LABEL: Record<ExperienceObjective, string> = {
  insight: 'Insight',
  lead: 'Lead Capture',
  cta: 'CTA',
  convert: 'Conversion',
};

/** Template master id → objective (prototype `obj` on `DATA.experiences`). */
export const TEMPLATE_OBJECTIVE: Record<string, ExperienceObjective> = {
  e1: 'lead',
  e2: 'convert',
  e3: 'convert',
  e4: 'insight',
  e5: 'lead',
  e6: 'cta',
  e7: 'insight',
  e8: 'insight',
  e9: 'convert',
};

export const FOCUS_PARAM = 'focus';
