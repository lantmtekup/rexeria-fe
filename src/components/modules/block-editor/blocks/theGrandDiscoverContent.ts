import type { TheGrandDiscoverContent, TheGrandDiscoverItem } from '../types';

/**
 * Normalize `items[]` + mỗi field của The Grand · Discover — dùng CHUNG bởi
 * canvas render và LayersPanel `elementsForType` để số item không lệch nhau
 * (pattern `theGrandServiceContent.ts`).
 */
export const resolveTheGrandDiscoverItems = (
  content: TheGrandDiscoverContent | undefined | null
): TheGrandDiscoverItem[] => {
  const raw = content?.items as unknown;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(v => v && typeof v === 'object')
    .map(v => {
      const item = v as Partial<TheGrandDiscoverItem>;
      return {
        label: typeof item.label === 'string' ? item.label : '',
        imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
        imageAlt: typeof item.imageAlt === 'string' ? item.imageAlt : undefined,
      };
    });
};
