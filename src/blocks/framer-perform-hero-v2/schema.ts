import type { LegacyBlockSchema } from '../types';

/** Hero - Perform v2: recon-driven discrete-breakpoint clone (72/54 + 544px paragraph constraint). */
export const framerPerformHeroV2Schema: LegacyBlockSchema = {
  id: 'framer.perform.hero.v2',
  name: 'Hero - Perform (v2)',
  category: 'Hero',
  description:
    'Hero clone perform.framer.website (recon v2): tagline + 2-line headline + subtitle 544px + CTA pill + reviews. Breakpoint 810px discrete.',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      default: 'Experienced triathlon coach',
      maxLength: 80,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      default: 'Level Up Your Performance',
      required: true,
      maxLength: 120,
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle',
      default:
        'Improve your triathlon performance with personalized training plans guided by an experienced coach committed to your success.',
      maxLength: 240,
    },
    {
      name: 'buttonText',
      type: 'text',
      label: 'CTA button text',
      default: 'Start now',
      maxLength: 40,
    },
    {
      name: 'buttonHref',
      type: 'text',
      label: 'CTA href',
      default: '#contact',
      maxLength: 200,
    },
    {
      name: 'reviewsText',
      type: 'text',
      label: 'Reviews caption',
      default: '100+ Positive Client Reviews',
      maxLength: 80,
    },
    {
      name: 'bgImage',
      type: 'image',
      label: 'Background image',
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'Experienced triathlon coach',
      title: 'Level Up Your Performance',
      subtitle:
        'Improve your triathlon performance with personalized training plans guided by an experienced coach committed to your success.',
      buttonText: 'Start now',
      buttonHref: '#contact',
      reviewsText: '100+ Positive Client Reviews',
      bgImage: {
        url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80',
        alt: 'Hero background',
      },
    },
    en: {
      eyebrow: 'Experienced triathlon coach',
      title: 'Level Up Your Performance',
      subtitle:
        'Improve your triathlon performance with personalized training plans guided by an experienced coach committed to your success.',
      buttonText: 'Start now',
      buttonHref: '#contact',
      reviewsText: '100+ Positive Client Reviews',
      bgImage: {
        url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80',
        alt: 'Hero background',
      },
    },
  },
};
