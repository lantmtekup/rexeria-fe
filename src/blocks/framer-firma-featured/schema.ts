import type { LegacyBlockSchema } from '../types';

/** Featured Project — clone of firma-template.framer.website featured section.
 *  Large image left (full-bleed) + white card overlap right with eyebrow /
 *  heading / body / case-study link. */
export const framerFirmaFeaturedSchema: LegacyBlockSchema = {
  id: 'framer.firma.featured.v1',
  name: 'Featured Project - Firma',
  category: 'Project',
  description:
    'Section spotlight 1 dự án: ảnh lớn full-bleed bên trái + card chữ trắng đè chồng từ bên phải. Clone từ firma-template.framer.website.',
  fields: [
    {
      name: 'image',
      type: 'image',
      label: 'Ảnh dự án (cover trái)',
      aspectRatio: '4:5',
    },
    {
      name: 'category',
      type: 'text',
      label: 'Eyebrow / danh mục',
      default: 'STRATEGY / DIGITAL',
      maxLength: 60,
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Tên dự án',
      default: 'Common Future Co.',
      maxLength: 80,
    },
    {
      name: 'description',
      type: 'text',
      label: 'Mô tả ngắn',
      default:
        'Common Future Co. came to us with a big mission but little clarity on how to communicate it. We began by rethinking their messaging, positioning them as forward-thinking yet accessible.',
      maxLength: 400,
    },
    {
      name: 'ctaLabel',
      type: 'text',
      label: 'Nhãn link CTA',
      default: 'Case Study',
      maxLength: 40,
    },
    {
      name: 'ctaHref',
      type: 'text',
      label: 'URL CTA',
      default: '#',
      maxLength: 200,
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      image: {
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
        alt: 'Common Future Co.',
      },
      category: 'STRATEGY / DIGITAL',
      heading: 'Common Future Co.',
      description:
        'Common Future Co. came to us with a big mission but little clarity on how to communicate it. We began by rethinking their messaging, positioning them as forward-thinking yet accessible.',
      ctaLabel: 'Case Study',
      ctaHref: '#',
    },
    en: {
      image: {
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
        alt: 'Common Future Co.',
      },
      category: 'STRATEGY / DIGITAL',
      heading: 'Common Future Co.',
      description:
        'Common Future Co. came to us with a big mission but little clarity on how to communicate it. We began by rethinking their messaging, positioning them as forward-thinking yet accessible.',
      ctaLabel: 'Case Study',
      ctaHref: '#',
    },
  },
};
