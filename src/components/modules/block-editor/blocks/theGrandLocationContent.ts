import type { TheGrandLocationContent, TheGrandLocationItem } from '../types';

/**
 * Normalize `items[]` + mỗi field của The Grand · Location — dùng CHUNG bởi
 * canvas render và LayersPanel `elementsForType` để số item không lệch nhau
 * (pattern `pnjVariantContent.ts`).
 */
export const resolveTheGrandLocationItems = (
  content: TheGrandLocationContent | undefined | null
): TheGrandLocationItem[] => {
  const raw = content?.items as unknown;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(v => v && typeof v === 'object')
    .map(v => {
      const item = v as Partial<TheGrandLocationItem>;
      return {
        label: typeof item.label === 'string' ? item.label : '',
        imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
        imageAlt: typeof item.imageAlt === 'string' ? item.imageAlt : undefined,
        description:
          typeof item.description === 'string' ? item.description : '',
        statValue: typeof item.statValue === 'string' ? item.statValue : '',
        statUnit: typeof item.statUnit === 'string' ? item.statUnit : '',
      };
    });
};
