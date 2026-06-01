import type { LegacyBlockSchema } from '../types';

/** Framer Perform Pricing — sticky stacking pricing cards. */
export const framerPerformPricingSchema: LegacyBlockSchema = {
  id: 'framer.perform.pricing.v1',
  name: 'Pricing - Stacking Cards',
  category: 'Pricing',
  description:
    'Pricing clone từ perform.framer.website: nhiều card xếp chồng theo sticky scroll, ảnh trái + giá/tiêu đề/checklist/CTA pill bên phải.',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow / nhãn trên',
      default: 'Pricing',
      maxLength: 60,
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Tiêu đề section',
      default: 'Choose your plan',
      maxLength: 120,
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Mô tả ngắn dưới tiêu đề',
      default:
        'Pick the plan that fits your training goals. Cancel or upgrade any time.',
      maxLength: 280,
    },
    {
      name: 'tiers',
      type: 'array',
      label: 'Gói (mỗi gói = 1 card stacking)',
      minItems: 1,
      maxItems: 6,
      itemLabel: 'gói',
      defaultItem: {
        price: '$0/month',
        title: 'Plan',
        features: 'Feature 1\nFeature 2',
        ctaLabel: 'Get in touch',
        ctaHref: '#contact',
        image: null,
      },
      itemSchema: [
        {
          name: 'image',
          type: 'image',
          label: 'Ảnh (1:1)',
          aspectRatio: '1:1',
          required: true,
        },
        {
          name: 'price',
          type: 'text',
          label: 'Giá',
          default: '$0/month',
          required: true,
          maxLength: 40,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Tên gói',
          default: 'Plan',
          required: true,
          maxLength: 60,
        },
        {
          name: 'features',
          type: 'text',
          label: 'Tính năng (mỗi dòng = 1 item)',
          default: 'Feature 1\nFeature 2',
          maxLength: 800,
        },
        {
          name: 'ctaLabel',
          type: 'text',
          label: 'Nhãn CTA',
          default: 'Get in touch',
          maxLength: 40,
        },
        {
          name: 'ctaHref',
          type: 'text',
          label: 'URL CTA',
          default: '#contact',
          maxLength: 500,
        },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'Pricing',
      heading: 'Choose your plan',
      subheading:
        'Pick the plan that fits your training goals. Cancel or upgrade any time.',
      tiers: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80',
            alt: 'Swimmer',
          },
          price: '$59/month',
          title: 'Basic',
          features:
            'Free initial consultation\n1x per 2 weeks training plan update\nWeekly checking',
          ctaLabel: 'Get in touch',
          ctaHref: '#contact',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1024&q=80',
            alt: 'Runner in forest',
          },
          price: '$99/month',
          title: 'Standard',
          features:
            'All of the previous\nDevelopment of a specific race strategy\nBenefits from my partners',
          ctaLabel: 'Get in touch',
          ctaHref: '#contact',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1024&q=80',
            alt: 'Premium athlete',
          },
          price: '$169/month',
          title: 'Premium',
          features:
            'All of the previous\nUnlimited plan updates and modifications\nWorking together on mindset for optimal performance',
          ctaLabel: 'Get in touch',
          ctaHref: '#contact',
        },
      ],
    },
    en: {
      eyebrow: 'Pricing',
      heading: 'Choose your plan',
      subheading:
        'Pick the plan that fits your training goals. Cancel or upgrade any time.',
      tiers: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80',
            alt: 'Swimmer',
          },
          price: '$59/month',
          title: 'Basic',
          features:
            'Free initial consultation\n1x per 2 weeks training plan update\nWeekly checking',
          ctaLabel: 'Get in touch',
          ctaHref: '#contact',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1024&q=80',
            alt: 'Runner',
          },
          price: '$99/month',
          title: 'Standard',
          features:
            'All of the previous\nDevelopment of a specific race strategy\nBenefits from my partners',
          ctaLabel: 'Get in touch',
          ctaHref: '#contact',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1024&q=80',
            alt: 'Premium athlete',
          },
          price: '$169/month',
          title: 'Premium',
          features:
            'All of the previous\nUnlimited plan updates and modifications\nWorking together on mindset for optimal performance',
          ctaLabel: 'Get in touch',
          ctaHref: '#contact',
        },
      ],
    },
  },
};
