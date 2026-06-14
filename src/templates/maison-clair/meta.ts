import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  code: 'maison-clair',
  name: 'Éternel Clair — Minimal Jewellery',
  description:
    'Landing jewelry sáng, tối giản gallery (Marcellus + Manrope, ice-blue). Hero canh giữa, horizontal pinned gallery, scroll word-reveal, GSAP + Lenis.',
  thumbnailUrl:
    'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=600',
  contentSchema: {
    fields: [
      {
        key: 'brandName',
        label: 'Tên thương hiệu',
        type: 'text',
        default: 'Maison Éclat',
        group: 'Hero',
      },
      {
        key: 'heroEyebrow',
        label: 'Eyebrow',
        type: 'text',
        default: 'Bridal & Engagement · Paris',
        group: 'Hero',
      },
      {
        key: 'heroTitle',
        label: 'Tiêu đề hero',
        type: 'text',
        required: true,
        default: 'Éternel',
        group: 'Hero',
      },
      {
        key: 'heroSubtitle',
        label: 'Mô tả hero',
        type: 'longText',
        default:
          'Modern, conscious fine jewellery, lab-grown or natural, always certified.',
        group: 'Hero',
      },
      {
        key: 'heroImage',
        label: 'Ảnh hero (canh giữa)',
        type: 'image',
        default:
          'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=1200',
        group: 'Hero',
      },
      {
        key: 'ctaText',
        label: 'CTA · text',
        type: 'text',
        default: 'Book a private viewing',
        group: 'CTA',
      },
      {
        key: 'ctaUrl',
        label: 'CTA · URL',
        type: 'url',
        default: '#book',
        group: 'CTA',
      },
    ],
  },
  tracking: {
    sections: [
      { id: 'hero', label: 'Hero' },
      { id: 'fours', label: 'The Four Cs' },
      { id: 'coll', label: 'Collection' },
      { id: 'book', label: 'Booking' },
    ],
  },
};

export default meta;
