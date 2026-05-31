import type { LegacyBlockSchema } from '../types';

export const heroOverlaySchema: LegacyBlockSchema = {
  id: 'hero.overlay.v1',
  name: 'Hero Overlay',
  category: 'Hero',
  description:
    'Hero toàn màn hình với frosted glass overlay + CTA + scroll hint.',
  fields: [
    { name: 'tag', type: 'text', label: 'Tag nhỏ', maxLength: 60 },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      required: true,
      maxLength: 120,
    },
    { name: 'subtitle', type: 'richtext', label: 'Phụ đề' },
    { name: 'ctaText', type: 'text', label: 'Nút CTA', maxLength: 40 },
    { name: 'scrollHint', type: 'text', label: 'Gợi ý cuộn', maxLength: 30 },
    {
      name: 'backgroundImage',
      type: 'image',
      label: 'Hình nền',
      aspectRatio: '16:9',
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      tag: 'Epictower Residences',
      title: 'Bản Trường Ca\nTrường Tồn',
      subtitle:
        'Nơi kiến trúc đương đại hòa quyện cùng thiên nhiên, kiến tạo trải nghiệm sống đỉnh cao giữa lòng thành phố.',
      ctaText: 'Khám Phá Ngay',
      scrollHint: 'Cuộn xuống',
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80',
        alt: 'Hero background',
      },
    },
    en: {
      tag: 'Epictower Residences',
      title: 'A Timeless\nMasterpiece',
      subtitle:
        'Where contemporary architecture blends with nature, crafting a pinnacle living experience in the heart of the city.',
      ctaText: 'Explore Now',
      scrollHint: 'Scroll down',
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80',
        alt: 'Hero background',
      },
    },
  },
};
