import type { LegacyBlockSchema } from '../types';

export const featureSectionSchema: LegacyBlockSchema = {
  id: 'feature.section.v1',
  name: 'Feature Section',
  category: 'Landing',
  description:
    'Section chia đôi: media bên trái + nội dung bên phải, hỗ trợ đảo chiều.',
  fields: [
    { name: 'tag', type: 'text', label: 'Tag', maxLength: 60 },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      required: true,
      maxLength: 120,
    },
    { name: 'body', type: 'richtext', label: 'Nội dung' },
    {
      name: 'mediaImage',
      type: 'image',
      label: 'Hình ảnh',
      aspectRatio: '1:1',
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      tag: 'Tiện ích',
      title: 'Không Gian Sống\nĐẳng Cấp',
      body: 'Trải nghiệm cuộc sống thượng lưu với các tiện ích hàng đầu, được thiết kế tỉ mỉ cho từng chi tiết.',
      mediaImage: {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80',
        alt: 'Living space',
      },
      reversed: false,
    },
    en: {
      tag: 'Amenities',
      title: 'Premium Living Space',
      body: 'Experience luxury living with top-tier amenities, meticulously designed in every detail.',
      mediaImage: {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80',
        alt: 'Living space',
      },
      reversed: false,
    },
  },
};
