import type { PnjHeroContent } from '../types';

/** Normalize title lines + legacy titleLine1/titleLine2. */
export const resolvePnjHeroTitleLines = (
  content: Pick<PnjHeroContent, 'titleLines' | 'titleLine1' | 'titleLine2'>
): string[] => {
  const raw = content.titleLines as unknown;
  if (typeof raw === 'string') {
    return raw.trim().length > 0 ? [raw] : [''];
  }
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map(line => (typeof line === 'string' ? line : ''));
  }
  const legacy = [content.titleLine1, content.titleLine2].filter(
    (line): line is string => typeof line === 'string' && line.trim().length > 0
  );
  return legacy.length > 0 ? legacy : [''];
};

/**
 * Ghi 1 dòng theo index — luôn preserve toàn bộ list (kể cả legacy titleLine1/2).
 */
export const setPnjHeroTitleLineAt = (
  content: PnjHeroContent,
  index: number,
  value: string
): PnjHeroContent => {
  const lines = [...resolvePnjHeroTitleLines(content)];
  while (lines.length <= index) lines.push('');
  lines[index] = value;
  const next = { ...content, titleLines: lines } as Record<string, unknown>;
  delete next.titleLine1;
  delete next.titleLine2;
  return next as unknown as PnjHeroContent;
};

export const PNJ_HERO_TITLE_LINE_KEY_RE = /^titleLines\[(\d+)\]$/;
