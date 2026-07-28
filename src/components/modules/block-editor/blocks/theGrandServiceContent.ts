import type { TheGrandServiceContent, TheGrandServiceItem } from '../types';

/**
 * Normalize `items[]` + mỗi field của The Grand · Service — dùng CHUNG bởi
 * canvas render và LayersPanel `elementsForType` để số item không lệch nhau
 * (pattern `theGrandLocationContent.ts`).
 */
export const resolveTheGrandServiceItems = (
  content: TheGrandServiceContent | undefined | null
): TheGrandServiceItem[] => {
  const raw = content?.items as unknown;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(v => v && typeof v === 'object')
    .map(v => {
      const item = v as Partial<TheGrandServiceItem>;
      return {
        label: typeof item.label === 'string' ? item.label : '',
        imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
        imageAlt: typeof item.imageAlt === 'string' ? item.imageAlt : undefined,
        description:
          typeof item.description === 'string' ? item.description : '',
      };
    });
};
