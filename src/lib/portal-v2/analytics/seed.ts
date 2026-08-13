import {
  BLOCK_TEMPLATES,
  COMPONENT_EVENTS,
  COMPONENT_KINDS,
  COMPONENT_TYPES,
} from '@/lib/portal-v2/analytics/constants';
import type {
  PulseBlock,
  PulseComponent,
} from '@/lib/portal-v2/analytics/types';

/** Deterministic string hash — prototype `ihash`. */
export const ihash = (input: string): number => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
};

/** Deterministic float in [min, max] — prototype `irnd`. */
export const irnd = (seed: string, min: number, max: number): number => {
  const unit = (ihash(seed) % 10_000) / 10_000;
  return min + unit * (max - min);
};

export const seedBlocks = (
  seedKey: string,
  sessions: number,
  coveragePct: number
): PulseBlock[] => {
  const blockCount = 3 + (ihash(`${seedKey}:n`) % 2);
  const trackedRatio = Math.max(0, Math.min(1, coveragePct));

  return BLOCK_TEMPLATES.slice(0, blockCount).map((template, index) => {
    const key = `${seedKey}:${index}`;
    const views = Math.min(
      sessions,
      Math.round(sessions * irnd(`${key}:v`, 0.55, 0.98) * (1 - index * 0.06))
    );
    const inter = Math.round(views * irnd(`${key}:i`, 0.12, 0.72));
    const exits = Math.round(views * irnd(`${key}:x`, 0.05, 0.32));
    const done = Math.round(views * irnd(`${key}:c`, 0.35, 0.88));
    const dwell = Math.round(irnd(`${key}:d`, 8, 140));
    const compCount = trackedRatio > 0.15 ? 1 + (ihash(`${key}:cc`) % 3) : 0;

    const comps: PulseComponent[] = Array.from(
      { length: compCount },
      (_, compIndex) => {
        const compKey = `${key}:${compIndex}`;
        const kind =
          COMPONENT_KINDS[ihash(`${compKey}:k`) % COMPONENT_KINDS.length]!;
        const event =
          COMPONENT_EVENTS[ihash(`${compKey}:e`) % COMPONENT_EVENTS.length]!;
        const type =
          COMPONENT_TYPES[ihash(`${compKey}:t`) % COMPONENT_TYPES.length]!;
        return {
          el: `c${index}-${compIndex}`,
          kind,
          type,
          event,
          meaning: `${template.role} signal`,
          signals: Math.round(views * irnd(`${compKey}:s`, 0.2, 0.9)),
          assist: irnd(`${compKey}:a`, -0.06, 0.34),
          conf: Math.round(irnd(`${compKey}:k`, 62, 99)),
          strength: 1 + (ihash(`${compKey}:st`) % 5),
        };
      }
    );

    return {
      index,
      name: template.name,
      role: template.role,
      views,
      inter,
      exits,
      done,
      dwell,
      interRate: views ? inter / views : 0,
      exitRate: views ? exits / views : 0,
      doneRate: views ? done / views : 0,
      comps,
    };
  });
};
