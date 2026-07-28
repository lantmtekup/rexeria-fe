import type {
  TheGrandFooterContent,
  TheGrandFooterPolicy,
  TheGrandFooterSocial,
  TheGrandFooterSocialPlatform,
} from '../types';

/**
 * Normalize 2 mảng động của The Grand · Footer — dùng CHUNG bởi canvas render và
 * LayersPanel `elementsForType` để số item không lệch nhau (pattern
 * `theGrandAboutContent.ts` / `theGrandServiceContent.ts`).
 */

/** Platform hợp lệ — khớp `SOCIAL_ICON_MAP` trong `theGrandFooterSocialIcons.tsx`. */
const SOCIAL_PLATFORMS: readonly TheGrandFooterSocialPlatform[] = [
  'facebook',
  'instagram',
  'linkedin',
  'tripadvisor',
  'youtube',
  'tiktok',
];

export const resolveTheGrandFooterPolicies = (
  content: TheGrandFooterContent | undefined | null
): TheGrandFooterPolicy[] => {
  const raw = content?.policies as unknown;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(v => v && typeof v === 'object')
    .map(v => {
      const policy = v as Partial<TheGrandFooterPolicy>;
      return {
        label: typeof policy.label === 'string' ? policy.label : '',
        href: typeof policy.href === 'string' ? policy.href : '#',
      };
    });
};

export const resolveTheGrandFooterSocials = (
  content: TheGrandFooterContent | undefined | null
): TheGrandFooterSocial[] => {
  const raw = content?.socials as unknown;
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(v => v && typeof v === 'object')
    .map(v => {
      const social = v as Partial<TheGrandFooterSocial>;
      // Platform lạ (content cũ / import sai) → fallback để tra icon không vỡ.
      const platform = SOCIAL_PLATFORMS.includes(
        social.platform as TheGrandFooterSocialPlatform
      )
        ? (social.platform as TheGrandFooterSocialPlatform)
        : 'facebook';
      return {
        platform,
        href: typeof social.href === 'string' ? social.href : '#',
        label: typeof social.label === 'string' ? social.label : undefined,
      };
    });
};
