import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  code: 'maison-atelier',
  name: 'Atelier Lumière — Warm Jewellery',
  description:
    'Landing jewelry ấm, biên tập (Playfair + Source Serif). Hero split, pinned scrollytelling "150 giờ thủ công", closer bordeaux, GSAP + Lenis.',
  thumbnailUrl:
    'https://images.pexels.com/photos/35464490/pexels-photo-35464490.jpeg?auto=compress&cs=tinysrgb&w=600',
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
          'Made the way it was a century ago. Slowly, by hand, to be worn for a lifetime.',
        group: 'Hero',
      },
      {
        key: 'heroImage',
        label: 'Ảnh hero (cột phải)',
        type: 'image',
        default:
          'https://images.pexels.com/photos/35464490/pexels-photo-35464490.jpeg?auto=compress&cs=tinysrgb&w=1400',
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
      { id: 'craft', label: 'The Atelier' },
      { id: 'book', label: 'Booking' },
    ],
  },
};

export default meta;
