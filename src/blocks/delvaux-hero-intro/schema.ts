import type { LegacyBlockSchema } from '../types';

export const delvauxHeroIntroSchema: LegacyBlockSchema = {
  id: 'delvaux.hero.intro.v1',
  name: 'Delvaux — Hero Intro',
  category: 'Product',
  description:
    'Hero scroll: storefront pinned → fade-out → product image. Tinh giản từ 96-frame canvas scrub.',
  fields: [
    {
      name: 'storefrontImage',
      type: 'image',
      label: 'Ảnh storefront',
      aspectRatio: '16:9',
    },
    {
      name: 'productImage',
      type: 'image',
      label: 'Ảnh sản phẩm',
      aspectRatio: '4:3',
    },
    { name: 'productAlt', type: 'text', label: 'Alt sản phẩm', maxLength: 100 },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      storefrontImage: {
        url: 'https://d10zufojjcedud.cloudfront.net/delvaux-nextjs/hero-storefront.webp',
        alt: 'Boutique storefront',
      },
      productImage: {
        url: 'https://d10zufojjcedud.cloudfront.net/delvaux-nextjs/manolo-pair.webp',
        alt: 'Product pair',
      },
      productAlt: 'Manolo Blahnik Ronconasli pair',
    },
    en: {
      storefrontImage: null,
      productImage: null,
      productAlt: 'Product pair',
    },
  },
};
