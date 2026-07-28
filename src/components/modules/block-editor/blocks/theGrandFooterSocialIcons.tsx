import * as React from 'react';

import type { TheGrandFooterSocialPlatform } from '../types';

/**
 * Map `platform` → glyph SVG cho The Grand · Footer.
 *
 * `socials[]` là mảng ĐỘNG do author quản lý nên icon không thể hard-code theo
 * vị trí như bản prototype `apps/the-grand/app/components/Footer.tsx` — pattern
 * map string → node lấy theo `FeatureSection.tsx` (`ICON_MAP` +
 * `FEATURE_ICON_OPTIONS`). Lucide không có glyph TripAdvisor nên toàn bộ vẽ tay,
 * giữ nguyên `viewBox='0 0 24 24'` + `currentColor` của prototype.
 */
interface SocialIcon {
  /** aria-label mặc định khi content không khai `label`. */
  label: string;
  /** Nội dung bên trong `<svg>` — block tự bọc thẻ svg 18×18. */
  glyph: React.ReactNode;
  /** Icon vẽ bằng fill (path đặc) hay stroke (nét). */
  mode: 'fill' | 'stroke';
}

export const SOCIAL_ICON_MAP: Record<TheGrandFooterSocialPlatform, SocialIcon> =
  {
    facebook: {
      label: 'Facebook',
      mode: 'fill',
      glyph: (
        <path d='M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.9 3.77-3.9 1.09 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z' />
      ),
    },
    instagram: {
      label: 'Instagram',
      mode: 'stroke',
      glyph: (
        <>
          <rect x='3' y='3' width='18' height='18' rx='5' />
          <circle cx='12' cy='12' r='4' />
          <circle
            cx='17.2'
            cy='6.8'
            r='1.1'
            fill='currentColor'
            stroke='none'
          />
        </>
      ),
    },
    linkedin: {
      label: 'LinkedIn',
      mode: 'fill',
      glyph: (
        <path d='M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.83v1.64h.05c.53-1 1.84-2.06 3.79-2.06C20.5 8.58 22 10.9 22 14.4V21h-4v-5.85c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21H9z' />
      ),
    },
    tripadvisor: {
      label: 'TripAdvisor',
      mode: 'stroke',
      glyph: (
        <>
          <ellipse cx='12' cy='12' rx='11' ry='6.5' />
          <circle cx='7.3' cy='12.3' r='3' />
          <circle cx='16.7' cy='12.3' r='3' />
          <circle
            cx='7.3'
            cy='12.3'
            r='0.8'
            fill='currentColor'
            stroke='none'
          />
          <circle
            cx='16.7'
            cy='12.3'
            r='0.8'
            fill='currentColor'
            stroke='none'
          />
          <path d='M9 8.2C10 7.7 11 7.5 12 7.5s2 .2 3 .7' />
        </>
      ),
    },
    youtube: {
      label: 'YouTube',
      mode: 'fill',
      glyph: (
        <path d='M21.58 7.19a2.51 2.51 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42A2.51 2.51 0 0 0 2.42 7.2 26.2 26.2 0 0 0 2 12a26.2 26.2 0 0 0 .42 4.81 2.51 2.51 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.51 2.51 0 0 0 1.77-1.77A26.2 26.2 0 0 0 22 12a26.2 26.2 0 0 0-.42-4.81zM10 15.02V8.98L15.2 12z' />
      ),
    },
    tiktok: {
      label: 'TikTok',
      mode: 'fill',
      glyph: (
        <path d='M16.5 2h-2.9v13.1a2.6 2.6 0 1 1-2.2-2.57v-2.95a5.5 5.5 0 1 0 5.1 5.48V8.9a6.4 6.4 0 0 0 3.7 1.18V7.16a3.62 3.62 0 0 1-3.7-3.5V2z' />
      ),
    },
  };

/** Danh sách id cho dropdown chọn platform trong ElementToolbar. */
export const SOCIAL_PLATFORM_OPTIONS = Object.keys(
  SOCIAL_ICON_MAP
) as TheGrandFooterSocialPlatform[];

/** Tra icon an toàn — platform lạ rơi về Facebook thay vì crash. */
export const socialIconOf = (
  platform: TheGrandFooterSocialPlatform
): SocialIcon => SOCIAL_ICON_MAP[platform] ?? SOCIAL_ICON_MAP.facebook;
