import type { PnjVariantContent, PnjVariantItem } from '../types';

/** Heal highlights joined without separator (inline edit on `<ul>`). */
const JOINED_HIGHLIGHT_SPLIT =
  /(?<=[\p{Ll}àáảãạăằẳẵặâầẩẫậèéẻẽẹêềểễệìíỉĩịòóỏõọôồổỗộơờởỡợùúủũụưừửữựỳýỷỹỵđ])(?=[\p{Lu}ĐĂÂÊÔƠƯA-Z])/u;

const splitJoinedHighlights = (raw: string): string[] => {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  if (trimmed.includes('\n')) {
    return trimmed
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
  }
  const parts = trimmed
    .split(JOINED_HIGHLIGHT_SPLIT)
    .map(s => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [trimmed];
};

/** Normalize highlights — string (legacy inline edit) or string[]. */
export const resolvePnjVariantHighlights = (raw: unknown): string[] => {
  if (typeof raw === 'string') return splitJoinedHighlights(raw);
  if (Array.isArray(raw)) {
    return raw
      .flatMap(item =>
        typeof item === 'string' ? resolvePnjVariantHighlights(item) : []
      )
      .filter(Boolean);
  }
  return [];
};

const emptyVariant = (index: number): PnjVariantItem => ({
  key: `v_${index}`,
  label: '',
  desc: '',
  image: '',
  highlights: [],
});

/** Normalize variants list + each item field (incl. mishaped highlights). */
export const resolvePnjVariants = (
  content: PnjVariantContent
): PnjVariantItem[] => {
  const raw = content.variants as unknown;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(v => v && typeof v === 'object')
    .map((v, i) => {
      const item = v as PnjVariantItem;
      return {
        key:
          typeof item.key === 'string' && item.key.trim() ? item.key : `v_${i}`,
        label: typeof item.label === 'string' ? item.label : '',
        desc: typeof item.desc === 'string' ? item.desc : '',
        image: typeof item.image === 'string' ? item.image : '',
        highlights: resolvePnjVariantHighlights(item.highlights),
      };
    });
};

/**
 * Ghi highlights theo index — luôn preserve toàn bộ variants list.
 * @deprecated Prefer per-item keys `variants[n].highlights[i]`.
 */
export const setPnjVariantHighlightsAt = (
  content: PnjVariantContent,
  variantIndex: number,
  multilineText: string
): PnjVariantContent => {
  const variants = [...resolvePnjVariants(content)];
  while (variants.length <= variantIndex) {
    variants.push(emptyVariant(variants.length));
  }
  variants[variantIndex] = {
    ...variants[variantIndex],
    highlights: resolvePnjVariantHighlights(multilineText),
  };
  return { ...content, variants };
};

/** Ghi 1 highlight item — preserve toàn bộ list. */
export const setPnjVariantHighlightItemAt = (
  content: PnjVariantContent,
  variantIndex: number,
  highlightIndex: number,
  value: string
): PnjVariantContent => {
  const variants = [...resolvePnjVariants(content)];
  while (variants.length <= variantIndex) {
    variants.push(emptyVariant(variants.length));
  }
  const highlights = [...variants[variantIndex].highlights];
  while (highlights.length <= highlightIndex) highlights.push('');
  highlights[highlightIndex] = value;
  variants[variantIndex] = {
    ...variants[variantIndex],
    highlights,
  };
  return { ...content, variants };
};

export const PNJ_VARIANT_HIGHLIGHTS_KEY_RE = /^variants\[(\d+)\]\.highlights$/;
export const PNJ_VARIANT_HIGHLIGHT_ITEM_KEY_RE =
  /^variants\[(\d+)\]\.highlights\[(\d+)\]$/;
