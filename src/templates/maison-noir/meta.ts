import type { TemplateMeta } from '../types';

export const meta: TemplateMeta = {
  code: 'maison-noir',
  name: 'Maison Noir — Dark Jewellery',
  description:
    'Landing jewelry tối điện ảnh (De Beers / Cartier). Hero kim cương full-bleed + light-sweep, pinned craftsmanship, horizontal gallery, GSAP + Lenis.',
  thumbnailUrl:
    'https://images.pexels.com/photos/2735981/pexels-photo-2735981.jpeg?auto=compress&cs=tinysrgb&w=600',
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
          'An engagement ring is the one object you will wear every day, for the rest of your life.',
        group: 'Hero',
      },
      {
        key: 'heroImage',
        label: 'Ảnh hero (full-bleed)',
        type: 'image',
        default:
          'https://images.pexels.com/photos/2735981/pexels-photo-2735981.jpeg?auto=compress&cs=tinysrgb&w=2000',
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
      { id: 'coll', label: 'Collection' },
      { id: 'book', label: 'Booking' },
    ],
    ctas: [
      { id: 'hero-book', label: 'Hero — Book viewing', section: 'hero' },
      { id: 'closer-design', label: 'Closer — Design ring', section: 'book' },
    ],
  },
};

export default meta;
