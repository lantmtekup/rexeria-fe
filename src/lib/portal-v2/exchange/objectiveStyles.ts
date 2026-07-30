import type { ExchangeObjective } from '@/lib/portal-v2/exchange/types';

type PillStyle = { bg: string; fg: string };

export const objectivePillStyle = (
  objective: Exclude<ExchangeObjective, 'all'>
): PillStyle => {
  const map: Record<Exclude<ExchangeObjective, 'all'>, PillStyle> = {
    insight: {
      bg: 'color-mix(in srgb, var(--pv2-violet) 12%, transparent)',
      fg: 'var(--pv2-violet)',
    },
    lead: {
      bg: 'color-mix(in srgb, var(--pv2-warning) 18%, transparent)',
      fg: '#b45309',
    },
    cta: {
      bg: 'color-mix(in srgb, var(--pv2-electric) 12%, transparent)',
      fg: 'var(--pv2-blue-500)',
    },
    convert: {
      bg: 'color-mix(in srgb, var(--pv2-success) 14%, transparent)',
      fg: '#0e9d6e',
    },
  };
  return map[objective];
};

export const tierChipStyle = (tier: string): PillStyle => {
  const lower = tier.toLowerCase();
  if (lower.includes('strong') || lower.includes('high')) {
    return {
      fg: '#0e9d6e',
      bg: 'color-mix(in srgb, var(--pv2-success) 14%, transparent)',
    };
  }
  if (lower.includes('moderate') || lower.includes('directional')) {
    return {
      fg: '#b45309',
      bg: 'color-mix(in srgb, var(--pv2-warning) 18%, transparent)',
    };
  }
  return {
    fg: 'var(--pv2-faint)',
    bg: 'var(--pv2-canvas)',
  };
};
