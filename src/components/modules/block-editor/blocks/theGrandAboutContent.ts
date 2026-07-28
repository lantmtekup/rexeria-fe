import type { TheGrandAboutContent, TheGrandAboutPartner } from '../types';

/**
 * Normalize `partners[]` của The Grand · About — dùng CHUNG bởi canvas render và
 * LayersPanel `elementsForType` để số đối tác không lệch nhau (pattern
 * `theGrandLocationContent.ts` / `theGrandServiceContent.ts`).
 */
export const resolveTheGrandAboutPartners = (
  content: TheGrandAboutContent | undefined | null
): TheGrandAboutPartner[] => {
  const raw = content?.partners as unknown;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(v => v && typeof v === 'object')
    .map(v => {
      const partner = v as Partial<TheGrandAboutPartner>;
      return {
        name: typeof partner.name === 'string' ? partner.name : '',
        logo: typeof partner.logo === 'string' ? partner.logo : '',
        role: typeof partner.role === 'string' ? partner.role : '',
      };
    });
};
