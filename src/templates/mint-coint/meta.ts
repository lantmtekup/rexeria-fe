import type { TemplateMeta } from '../types';

/**
 * Mint-coint template — ported từ test-coin-nextjs standalone Next.js app
 * (Royal Canadian Mint 1 kg gold coin landing). GSAP + Lenis smooth
 * scroll + Swiper carousels + scroll-triggered pinned scenes.
 *
 * BE template entity phải có `code: "mint-coint"`. Đã setup ở dev BE.
 */
export const meta: TemplateMeta = {
  code: 'mint-coint',
  name: 'Mint Coin — Royal Canadian',
  description:
    'Premium product landing — Tom Thomson Jack Pine 1kg gold coin. ' +
    'Pinned scenes, smooth scroll (Lenis), GSAP scroll-triggered ' +
    'animations, variant picker, discover panel.',
  contentSchema: {
    fields: [
      {
        key: 'title',
        label: 'Tên sản phẩm',
        type: 'text',
        default: 'The Jack Pine by Tom Thomson',
        hint: 'Hiện ở meta title + một số chỗ heading',
      },
      {
        key: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        default: '1 Kilo Pure Gold Coin (2026)',
      },
    ],
  },
};
