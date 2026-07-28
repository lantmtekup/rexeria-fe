import type { PnjHeroContent, PnjHeroFramesConfig } from '../types';

/** Default PNJ frame sequence under public/pnj. */
export const PNJ_HERO_FRAMES_DEFAULT: PnjHeroFramesConfig = {
  desktop: { total: 76, prefix: '/pnj/frames/frame-' },
  mobile: { total: 32, prefix: '/pnj/frames-mobile/frame-' },
  ext: '.webp',
};

/** Mint CDN example — paste in Frame sequence JSON editor. */
export const MINT_FRAMES_EXAMPLE: PnjHeroFramesConfig = {
  desktop: {
    total: 96,
    prefix: 'https://d10zufojjcedud.cloudfront.net/coin-nextjs/frames/frame-',
  },
  mobile: {
    total: 32,
    prefix:
      'https://d10zufojjcedud.cloudfront.net/coin-nextjs/frames-mobile/frame-',
  },
  ext: '.webp',
};

const isSequence = (
  value: unknown
): value is { total: number; prefix: string } => {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.total === 'number' &&
    Number.isFinite(s.total) &&
    s.total > 0 &&
    typeof s.prefix === 'string' &&
    s.prefix.trim().length > 0
  );
};

/** Validate raw JSON before writing to content.frames. */
export const isPnjHeroFramesConfig = (
  value: unknown
): value is PnjHeroFramesConfig => {
  if (!value || typeof value !== 'object') return false;
  const c = value as Record<string, unknown>;
  if (!isSequence(c.desktop) || !isSequence(c.mobile)) return false;
  if (c.ext !== undefined && typeof c.ext !== 'string') return false;
  return true;
};

/**
 * Resolve effective frame config: content.frames merged over PNJ defaults.
 * Invalid / partial sequences fall back per-device to defaults.
 */
export const resolvePnjHeroFrames = (
  content: Pick<PnjHeroContent, 'frames'> | undefined
): Required<PnjHeroFramesConfig> => {
  const raw = content?.frames;
  const desktop = isSequence(raw?.desktop)
    ? {
        total: Math.floor(raw.desktop.total),
        prefix: raw.desktop.prefix.trim(),
      }
    : PNJ_HERO_FRAMES_DEFAULT.desktop;
  const mobile = isSequence(raw?.mobile)
    ? { total: Math.floor(raw.mobile.total), prefix: raw.mobile.prefix.trim() }
    : PNJ_HERO_FRAMES_DEFAULT.mobile;
  const ext =
    typeof raw?.ext === 'string' && raw.ext.trim().length > 0
      ? raw.ext.trim()
      : (PNJ_HERO_FRAMES_DEFAULT.ext ?? '.webp');

  return { desktop, mobile, ext };
};
