import type { LegacyBlockSchema } from '../types';

/**
 * Clarity Services — clone of services grid from claritycare.framer.website.
 * 3-column on desktop — left & right columns each hold 2 cards stacked,
 * middle column is a tall portrait image spanning both rows.
 */
export const framerClarityServicesSchema: LegacyBlockSchema = {
  id: 'framer.clarity.services.v1',
  name: 'Services Grid (Clarity)',
  category: 'Features',
  description:
    'Lưới dịch vụ 4 thẻ + ảnh dọc ở giữa. Mỗi thẻ có icon trong vòng tròn + tiêu đề + mô tả. Nền kem nhạt.',
  fields: [
    {
      name: 'centerImage',
      type: 'image',
      label: 'Ảnh giữa (dọc, 4:5 hoặc 5:7)',
      aspectRatio: '4:5',
      required: true,
    },
    {
      name: 'bgColor',
      type: 'text',
      label: 'Màu nền section (CSS color)',
      default: '#f8faf2',
      maxLength: 32,
    },
    {
      name: 'cardBg',
      type: 'text',
      label: 'Màu nền thẻ',
      default: '#f3f6e6',
      maxLength: 32,
    },
    {
      name: 'services',
      type: 'array',
      label: 'Dịch vụ (đề xuất 4 thẻ — 2 trái 2 phải)',
      minItems: 2,
      maxItems: 8,
      itemLabel: 'dịch vụ',
      defaultItem: {
        icon: null,
        title: 'Service title',
        description: 'Short description of the service.',
      },
      itemSchema: [
        {
          name: 'icon',
          type: 'image',
          label: 'Icon (SVG/PNG vuông)',
          aspectRatio: '1:1',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề',
          default: 'Service title',
          required: true,
          maxLength: 80,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Mô tả ngắn',
          default: 'Short description of the service.',
          maxLength: 200,
        },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      bgColor: '#f8faf2',
      cardBg: '#f3f6e6',
      centerImage: {
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=80',
        alt: 'Smiling person behind a fern leaf',
      },
      services: [
        {
          icon: {
            url: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=200&q=80',
            alt: 'Individual therapy icon',
          },
          title: 'Individual Therapy',
          description:
            'Personalized, one-on-one sessions focused on helping you overcome challenges.',
        },
        {
          icon: {
            url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200&q=80',
            alt: 'Couples therapy icon',
          },
          title: 'Couples Therapy',
          description:
            'Supportive guidance for partners looking to improve communication.',
        },
        {
          icon: {
            url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&q=80',
            alt: 'Family therapy icon',
          },
          title: 'Family Therapy',
          description:
            'Helping families navigate dynamics and build healthier relationships.',
        },
        {
          icon: {
            url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80',
            alt: 'Physical therapy icon',
          },
          title: 'Physical Therapy',
          description:
            'Personalized, one-on-one sessions focused on helping you overcome challenges.',
        },
      ],
    },
    en: {
      bgColor: '#f8faf2',
      cardBg: '#f3f6e6',
      centerImage: {
        url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=80',
        alt: 'Smiling person behind a fern leaf',
      },
      services: [
        {
          icon: {
            url: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=200&q=80',
            alt: 'Individual therapy icon',
          },
          title: 'Individual Therapy',
          description:
            'Personalized, one-on-one sessions focused on helping you overcome challenges.',
        },
        {
          icon: {
            url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200&q=80',
            alt: 'Couples therapy icon',
          },
          title: 'Couples Therapy',
          description:
            'Supportive guidance for partners looking to improve communication.',
        },
        {
          icon: {
            url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&q=80',
            alt: 'Family therapy icon',
          },
          title: 'Family Therapy',
          description:
            'Helping families navigate dynamics and build healthier relationships.',
        },
        {
          icon: {
            url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80',
            alt: 'Physical therapy icon',
          },
          title: 'Physical Therapy',
          description:
            'Personalized, one-on-one sessions focused on helping you overcome challenges.',
        },
      ],
    },
  },
};
