import type { LegacyBlockSchema } from '../types';

export const heroSplitSchema: LegacyBlockSchema = {
  id: 'hero.split.v1',
  name: 'Hero Split',
  category: 'Hero',
  description:
    'Hero section chia đôi: content bên trái + ảnh lớn bên phải, kèm stats.',
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow', maxLength: 60 },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      required: true,
      maxLength: 120,
    },
    { name: 'body', type: 'richtext', label: 'Mô tả' },
    {
      name: 'heroImage',
      type: 'image',
      label: 'Ảnh hero',
      aspectRatio: '3:4',
      required: true,
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Thống kê',
      minItems: 1,
      maxItems: 4,
      itemLabel: 'stat',
      itemSchema: [
        { name: 'value', type: 'text', label: 'Giá trị', required: true },
        { name: 'label', type: 'text', label: 'Nhãn', required: true },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'SWAN LAKE RESIDENCES',
      title: 'Your Sanctuary\nIn The Clouds',
      body: 'Vươn mình trên thành phố, khám phá chuẩn mực mới của cuộc sống — nơi sự thanh lịch hiện đại hòa quyện cùng thiên nhiên tĩnh lặng.',
      heroImage: {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80',
        alt: 'Hero',
      },
      stats: [
        { value: '500+', label: 'Residential Units' },
        { value: '45', label: 'Floors' },
        { value: '40%', label: 'Green Space' },
      ],
      ctaText: 'Khám Phá',
    },
    en: {
      eyebrow: 'SWAN LAKE RESIDENCES',
      title: 'Your Sanctuary\nIn The Clouds',
      body: 'Rise above the city and discover a new standard of living where modern elegance meets natural tranquility.',
      heroImage: {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80',
        alt: 'Hero',
      },
      stats: [
        { value: '500+', label: 'Residential Units' },
        { value: '45', label: 'Floors' },
        { value: '40%', label: 'Green Space' },
      ],
      ctaText: 'Explore Residences',
    },
  },
};
