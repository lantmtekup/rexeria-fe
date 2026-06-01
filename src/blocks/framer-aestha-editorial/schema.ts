import type { LegacyBlockSchema } from '../types';

/** Framer Aestha Editorial — sticky brand column + 3 stacked scroll images + large CTA + bottom nav. */
export const framerAesthaEditorialSchema: LegacyBlockSchema = {
  id: 'framer.aestha.editorial.v1',
  name: 'Framer Aestha Editorial',
  category: 'Hero',
  description:
    'Editorial page: cột trái sticky (logo + tagline + mô tả + nav), cột phải 3 ảnh xếp lệch reveal theo scroll, CTA "Khám phá thêm" ở cuối.',
  fields: [
    {
      name: 'brand',
      type: 'text',
      label: 'Thương hiệu (logo)',
      default: 'RAMSA',
      required: true,
      maxLength: 40,
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline ngắn',
      default: 'Nơi thanh lịch cổ điển gặp gỡ tinh tế hiện đại.',
      maxLength: 160,
    },
    {
      name: 'scrollLabel',
      type: 'text',
      label: 'Nhãn pill "scroll"',
      default: 'scroll',
      maxLength: 20,
    },
    {
      name: 'description',
      type: 'richtext',
      label: 'Mô tả dài',
      default:
        'Tọa lạc giữa lòng đô thị, dự án là hiện thân cho phong cách sống đẳng cấp — nơi mỗi chi tiết đều được tinh chỉnh cho nhịp sống hiện đại, song vẫn tôn vinh di sản kiến trúc.',
    },
    {
      name: 'image1',
      type: 'image',
      label: 'Ảnh 1 — trên, dọc (4:5)',
      aspectRatio: '4:5',
    },
    {
      name: 'image2',
      type: 'image',
      label: 'Ảnh 2 — giữa, dọc lệch phải (5:6)',
      aspectRatio: '5:6',
    },
    {
      name: 'image3',
      type: 'image',
      label: 'Ảnh 3 — dưới, ngang (7:6)',
      aspectRatio: '7:6',
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'Nhãn CTA',
      default: 'KHÁM PHÁ THÊM',
      maxLength: 60,
    },
    {
      name: 'ctaHref',
      type: 'text',
      label: 'Link CTA',
      default: '/projects',
      maxLength: 300,
    },
    {
      name: 'navLinks',
      type: 'array',
      label: 'Menu dưới trái',
      itemSchema: [
        {
          name: 'label',
          type: 'text',
          label: 'Nhãn',
          required: true,
          maxLength: 40,
        },
        {
          name: 'href',
          type: 'text',
          label: 'Link',
          default: '#',
          maxLength: 300,
        },
      ],
      itemLabel: 'mục',
      minItems: 0,
      maxItems: 6,
      defaultItem: { label: 'Menu', href: '#' },
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      brand: 'RAMSA',
      tagline: 'Nơi thanh lịch cổ điển gặp gỡ tinh tế hiện đại.',
      scrollLabel: 'scroll',
      description:
        'Tọa lạc giữa lòng đô thị, dự án là hiện thân cho phong cách sống đẳng cấp — nơi mỗi chi tiết đều được tinh chỉnh cho nhịp sống hiện đại, song vẫn tôn vinh di sản kiến trúc.',
      image1: {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
        alt: 'Tòa tháp kiến trúc hoàng hôn',
      },
      image2: {
        url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80',
        alt: 'Cặp tháp đôi nhìn từ đường phố',
      },
      image3: {
        url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80',
        alt: 'Ba tòa tháp nhìn từ trên cao giữa mảng xanh',
      },
      ctaText: 'KHÁM PHÁ THÊM',
      ctaHref: '/projects',
      navLinks: [
        { label: 'Dự án', href: '/projects' },
        { label: 'Studio', href: '/studio' },
        { label: 'Liên hệ', href: '/contact' },
      ],
    },
    en: {
      brand: 'RAMSA',
      tagline: 'Where classic elegance meets modern refinement.',
      scrollLabel: 'scroll',
      description:
        'Nestled in the heart of the city, the project embodies refined urban living — every detail tuned to the demands of modern luxury while honoring architectural heritage.',
      image1: {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
        alt: 'Tower architecture at sunset',
      },
      image2: {
        url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80',
        alt: 'Twin towers from street level',
      },
      image3: {
        url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80',
        alt: 'Three towers aerial view',
      },
      ctaText: 'EXPLORE MORE',
      ctaHref: '/projects',
      navLinks: [
        { label: 'Projects', href: '/projects' },
        { label: 'Studio', href: '/studio' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  },
};
