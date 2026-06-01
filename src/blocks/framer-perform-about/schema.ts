import type { LegacyBlockSchema } from '../types';

/** Hero - 06 (Perform About): 3 testimonial cards stacked text+image (dark background). */
export const framerPerformAboutSchema: LegacyBlockSchema = {
  id: 'framer.perform.about.v1',
  name: 'Hero - 06 (Perform About)',
  category: 'Hero',
  description:
    'Stack testimonial — text trái + ảnh phải bo góc. Mobile: ảnh trên text dưới.',
  fields: [
    {
      name: 'testimonials',
      type: 'array',
      label: 'Testimonials',
      minItems: 1,
      maxItems: 8,
      itemLabel: 'testimonial',
      defaultItem: {
        image: null,
        textHighlight: '',
        textRest: '',
      },
      itemSchema: [
        {
          name: 'image',
          type: 'image',
          label: 'Ảnh chân dung (1:1)',
          aspectRatio: '1:1',
          required: true,
        },
        {
          name: 'textHighlight',
          type: 'text',
          label: 'Câu mở (màu trắng)',
          maxLength: 200,
          required: true,
        },
        {
          name: 'textRest',
          type: 'text',
          label: 'Câu sau (màu xám)',
          maxLength: 200,
        },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      testimonials: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1024&q=80',
            alt: 'Triathlete tập trung',
          },
          textHighlight:
            'I started my triathlon journey struggling with balance and technique.',
          textRest: 'Now, I guide others to achieve their full potential.',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80',
            alt: 'HLV hướng dẫn vận động viên',
          },
          textHighlight:
            'My coaching blends physical training and mental strategies,',
          textRest:
            'helping athletes build strength and confidence to overcome their limits.',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1024&q=80',
            alt: 'Vận động viên về đích',
          },
          textHighlight:
            'Together, we’ll break barriers and unlock your potential,',
          textRest:
            'turning every milestone into a victory through personalized coaching.',
        },
      ],
    },
    en: {
      testimonials: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1024&q=80',
            alt: 'Concentrated triathlete',
          },
          textHighlight:
            'I started my triathlon journey struggling with balance and technique.',
          textRest: 'Now, I guide others to achieve their full potential.',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80',
            alt: 'Coach with athlete',
          },
          textHighlight:
            'My coaching blends physical training and mental strategies,',
          textRest:
            'helping athletes build strength and confidence to overcome their limits.',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1024&q=80',
            alt: 'Athlete finish line',
          },
          textHighlight:
            'Together, we’ll break barriers and unlock your potential,',
          textRest:
            'turning every milestone into a victory through personalized coaching.',
        },
      ],
    },
  },
};
