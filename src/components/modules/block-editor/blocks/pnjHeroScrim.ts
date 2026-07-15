import type {
  PnjHeroContent,
  PnjHeroScrimConfig,
  PnjHeroScrimLayer,
  PnjHeroScrimPresetId,
} from '../types';

/** PNJ default — matches previous hardcoded Tailwind overlays. */
export const PNJ_HERO_SCRIM_PNJ_LAYERS: PnjHeroScrimLayer[] = [
  {
    background:
      'linear-gradient(to top, rgba(0, 52, 104, 0.14), rgba(255, 255, 255, 0.25), transparent)',
  },
  {
    background:
      'radial-gradient(ellipse at bottom left, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.28) 42%, transparent 72%)',
    top: 'auto',
    right: '0',
    bottom: '0',
    left: '0',
    height: '55%',
  },
];

export const PNJ_HERO_SCRIM_PRESETS: Record<
  PnjHeroScrimPresetId,
  PnjHeroScrimLayer[]
> = {
  pnj: PNJ_HERO_SCRIM_PNJ_LAYERS,
  none: [],
  softLight: [
    {
      background:
        'linear-gradient(to top, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.12) 45%, transparent 75%)',
    },
  ],
  softDark: [
    {
      background:
        'linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.18) 42%, transparent 78%)',
    },
  ],
  mint: [
    {
      background:
        'linear-gradient(to top, rgba(15, 23, 42, 0.22) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 72%)',
    },
    {
      background:
        'radial-gradient(ellipse at bottom center, rgba(255, 255, 255, 0.45) 0%, transparent 65%)',
      top: 'auto',
      right: '0',
      bottom: '0',
      left: '0',
      height: '50%',
    },
  ],
  navyFade: [
    {
      background:
        'linear-gradient(to top, rgba(0, 52, 104, 0.28), rgba(0, 52, 104, 0.08), transparent)',
    },
  ],
};

export const PNJ_HERO_SCRIM_PRESET_LABELS: Record<
  PnjHeroScrimPresetId,
  string
> = {
  pnj: 'PNJ',
  none: 'None',
  softLight: 'Soft light',
  softDark: 'Soft dark',
  mint: 'Mint',
  navyFade: 'Navy fade',
};

export const PNJ_HERO_SCRIM_PRESET_IDS = Object.keys(
  PNJ_HERO_SCRIM_PRESETS
) as PnjHeroScrimPresetId[];

const isScrimLayer = (value: unknown): value is PnjHeroScrimLayer => {
  if (!value || typeof value !== 'object') return false;
  const l = value as Record<string, unknown>;
  if (typeof l.background !== 'string' || l.background.trim().length === 0) {
    return false;
  }
  for (const key of [
    'top',
    'right',
    'bottom',
    'left',
    'height',
    'width',
  ] as const) {
    if (l[key] !== undefined && typeof l[key] !== 'string') return false;
  }
  if (l.opacity !== undefined) {
    if (typeof l.opacity !== 'number' || !Number.isFinite(l.opacity)) {
      return false;
    }
  }
  return true;
};

export const isPnjHeroScrimPresetId = (
  value: unknown
): value is PnjHeroScrimPresetId =>
  typeof value === 'string' && value in PNJ_HERO_SCRIM_PRESETS;

/** Validate raw JSON before writing to content.scrim. */
export const isPnjHeroScrimConfig = (
  value: unknown
): value is PnjHeroScrimConfig => {
  if (!value || typeof value !== 'object') return false;
  const c = value as Record<string, unknown>;
  if (c.preset !== undefined && !isPnjHeroScrimPresetId(c.preset)) return false;
  if (c.layers !== undefined) {
    if (!Array.isArray(c.layers) || !c.layers.every(isScrimLayer)) return false;
  }
  return true;
};

export interface ResolvedPnjHeroScrim {
  presetId: PnjHeroScrimPresetId;
  layers: PnjHeroScrimLayer[];
  /** True when content.layers overrides the named preset. */
  isCustom: boolean;
}

/**
 * Resolve effective scrim layers.
 * - Non-empty `layers` → custom (presetId kept for UI, defaults to `pnj`)
 * - Else use named preset (default `pnj` when omit)
 */
export const resolvePnjHeroScrim = (
  content: Pick<PnjHeroContent, 'scrim'> | undefined
): ResolvedPnjHeroScrim => {
  const raw = content?.scrim;
  const customLayers =
    Array.isArray(raw?.layers) && raw.layers.length > 0
      ? raw.layers.filter(isScrimLayer)
      : null;

  if (customLayers && customLayers.length > 0) {
    return {
      presetId: isPnjHeroScrimPresetId(raw?.preset) ? raw.preset : 'pnj',
      layers: customLayers,
      isCustom: true,
    };
  }

  // Explicit empty layers → no overlay (same as preset none).
  if (Array.isArray(raw?.layers) && raw.layers.length === 0) {
    return {
      presetId: 'none',
      layers: [],
      isCustom: false,
    };
  }

  const presetId = isPnjHeroScrimPresetId(raw?.preset) ? raw.preset : 'pnj';
  return {
    presetId,
    layers: PNJ_HERO_SCRIM_PRESETS[presetId],
    isCustom: false,
  };
};
