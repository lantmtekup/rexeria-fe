import type { LegacyBlockSchema } from '../types';

/** Hero - 01: clone of perform.framer.website hero — full-bleed motion-blur bg, eyebrow + headline + subtitle + pill CTA + star reviews */
export const framerPerformHeroSchema: LegacyBlockSchema = {
  id: 'framer.perform.hero.v1',
  name: 'Hero - 01',
  category: 'Hero',
  description:
    'Hero full-bleed clone từ perform.framer.website: tagline trên, tiêu đề 2 dòng, subtitle, CTA pill, 5-star review.',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Tagline trên',
      default: 'Experienced triathlon coach',
      maxLength: 80,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề chính (2 dòng)',
      default: 'Level Up Your\nPerformance',
      required: true,
      maxLength: 120,
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Mô tả',
      default:
        'Improve your triathlon performance with personalized training plans guided by an experienced coach committed to your success.',
      maxLength: 280,
    },
    {
      name: 'ctaLabel',
      type: 'text',
      label: 'Nhãn CTA',
      default: 'Start now',
      maxLength: 40,
    },
    {
      name: 'ctaHref',
      type: 'text',
      label: 'URL CTA',
      default: '#start',
      maxLength: 500,
    },
    {
      name: 'backgroundImage',
      type: 'image',
      label: 'Ảnh nền',
      aspectRatio: '16:9',
    },
    {
      name: 'reviewStars',
      type: 'number',
      label: 'Số sao review',
      default: 5,
    },
    {
      name: 'reviewCount',
      type: 'text',
      label: 'Caption review',
      default: '100+ Positive Client Reviews',
      maxLength: 80,
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'Experienced triathlon coach',
      title: 'Level Up Your\nPerformance',
      subtitle:
        'Improve your triathlon performance with personalized training plans guided by an experienced coach committed to your success.',
      ctaLabel: 'Start now',
      ctaHref: '#start',
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80',
        alt: 'Triathlon action shot',
      },
      reviewStars: 5,
      reviewCount: '100+ Positive Client Reviews',
    },
    en: {
      eyebrow: 'Experienced triathlon coach',
      title: 'Level Up Your\nPerformance',
      subtitle:
        'Improve your triathlon performance with personalized training plans guided by an experienced coach committed to your success.',
      ctaLabel: 'Start now',
      ctaHref: '#start',
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80',
        alt: 'Triathlon action shot',
      },
      reviewStars: 5,
      reviewCount: '100+ Positive Client Reviews',
    },
  },
};
