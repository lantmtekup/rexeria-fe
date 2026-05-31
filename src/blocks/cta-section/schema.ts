import type { LegacyBlockSchema } from '../types';

export const ctaSectionSchema: LegacyBlockSchema = {
  id: 'cta.section.v1',
  name: 'CTA Section',
  category: 'Landing',
  description: 'Call-to-action section: tiêu đề, mô tả, nút CTA.',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      required: true,
      maxLength: 120,
    },
    { name: 'body', type: 'richtext', label: 'Mô tả' },
    { name: 'ctaText', type: 'text', label: 'Nút CTA', maxLength: 40 },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      title: 'Bắt đầu ngay',
      body: 'Liên hệ với chúng tôi để được tư vấn chi tiết.',
      ctaText: 'Liên hệ ngay',
    },
    en: {
      title: 'Get Started',
      body: 'Contact us for detailed consultation.',
      ctaText: 'Contact Now',
    },
  },
};
