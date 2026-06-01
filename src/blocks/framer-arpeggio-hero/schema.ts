import type { LegacyBlockSchema } from '../types';

/** Hero - 03 (Arpeggio): clone of arpeggio.framer.website hero. */
export const framerArpeggioHeroSchema: LegacyBlockSchema = {
  id: 'framer.arpeggio.hero.v1',
  name: 'Hero - 03 (Arpeggio)',
  category: 'Hero',
  description:
    'Hero clone từ arpeggio.framer.website: portrait BG, headline trái + Agency Label phải, wordmark đỏ to dưới cùng.',
  fields: [
    {
      name: 'backgroundImage',
      type: 'image',
      label: 'Ảnh nền (portrait)',
      aspectRatio: '16:9',
    },
    {
      name: 'headline',
      type: 'text',
      label: 'Tiêu đề chính (2 dòng)',
      default: 'One subscription,\nunlimited design iterations.',
      required: true,
      maxLength: 200,
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle (có bullet)',
      default: 'Freedom beyond the traditional project scope',
      maxLength: 200,
    },
    {
      name: 'topRightLabel',
      type: 'text',
      label: 'Nhãn góc phải trên',
      default: 'The Creative Agency—',
      maxLength: 80,
    },
    {
      name: 'wordmark',
      type: 'text',
      label: 'Wordmark (chữ to dưới)',
      default: 'Arpeggio',
      maxLength: 40,
    },
    {
      name: 'wordmarkSuffix',
      type: 'text',
      label: 'Ký hiệu sau wordmark',
      default: '®',
      maxLength: 6,
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      headline: 'One subscription,\nunlimited design iterations.',
      subtitle: 'Freedom beyond the traditional project scope',
      topRightLabel: 'The Creative Agency—',
      wordmark: 'Arpeggio',
      wordmarkSuffix: '®',
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1600&q=80',
        alt: 'Portrait',
      },
    },
    en: {
      headline: 'One subscription,\nunlimited design iterations.',
      subtitle: 'Freedom beyond the traditional project scope',
      topRightLabel: 'The Creative Agency—',
      wordmark: 'Arpeggio',
      wordmarkSuffix: '®',
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1600&q=80',
        alt: 'Portrait',
      },
    },
  },
};
