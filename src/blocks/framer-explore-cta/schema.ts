import type { LegacyBlockSchema } from '../types';

/** Framer explore CTA — centered eyebrow + headline + underline link like [EXPLORE MORE]. */
export const framerExploreCtaSchema: LegacyBlockSchema = {
  id: 'framer.explore.cta.v1',
  name: 'Framer Explore CTA',
  category: 'CTA',
  description:
    'CTA đơn giản: eyebrow + headline + link kiểu [EXPLORE MORE], centered.',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      default: 'DISCOVER',
      maxLength: 60,
    },
    {
      name: 'headline',
      type: 'text',
      label: 'Câu chính',
      default: 'Explore more of our work',
      required: true,
      maxLength: 200,
    },
    {
      name: 'linkLabel',
      type: 'text',
      label: 'Nhãn link',
      default: 'EXPLORE MORE',
      maxLength: 40,
    },
    {
      name: 'linkHref',
      type: 'text',
      label: 'URL đích',
      default: '/projects',
      maxLength: 300,
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'DISCOVER',
      headline: 'Khám phá thêm công trình của chúng tôi',
      linkLabel: 'EXPLORE MORE',
      linkHref: '/projects',
    },
    en: {
      eyebrow: 'DISCOVER',
      headline: 'Explore more of our work',
      linkLabel: 'EXPLORE MORE',
      linkHref: '/projects',
    },
  },
};
