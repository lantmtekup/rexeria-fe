import type { LegacyBlockSchema } from '../types';

/** Framer minimal FAQ: big serif title "Have some questions?" + small CTA + accordion */
export const framerFaqMinimalSchema: LegacyBlockSchema = {
  id: 'framer.faq.minimal.v1',
  name: 'Framer FAQ Minimal',
  category: 'Landing',
  description:
    'FAQ tối giản theo Framer: tiêu đề serif lớn + CTA + accordion thin-divider.',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      default: 'Have some questions?',
      required: true,
      maxLength: 200,
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'CTA text',
      default: 'Ask a question',
      maxLength: 60,
    },
    {
      name: 'ctaHref',
      type: 'text',
      label: 'CTA URL',
      default: '#contact',
      maxLength: 200,
    },
    {
      name: 'items',
      type: 'array',
      label: 'Câu hỏi',
      minItems: 1,
      maxItems: 15,
      defaultItem: { question: 'Question?', answer: 'Answer.' },
      itemLabel: 'câu hỏi',
      itemSchema: [
        {
          name: 'question',
          type: 'text',
          label: 'Câu hỏi',
          required: true,
          maxLength: 200,
        },
        { name: 'answer', type: 'richtext', label: 'Trả lời', required: true },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      title: 'Bạn còn thắc mắc?',
      ctaText: 'Đặt câu hỏi',
      ctaHref: '#contact',
      items: [
        {
          question: 'Epictower Onsen là gì?',
          answer:
            'Epictower Onsen là tổ hợp căn hộ tích hợp onsen đầu tiên tại Việt Nam.',
        },
      ],
    },
    en: {
      title: 'Have some questions?',
      ctaText: 'Ask a question',
      ctaHref: '#contact',
      items: [
        {
          question: 'What makes Ecopark Onsen different?',
          answer:
            "Ecopark Onsen is Vietnam's first onsen-integrated residential complex, inspired by traditional Japanese hot-spring culture and designed in harmony with Ecopark's lush, green ecosystem.",
        },
        {
          question:
            'Are the onsen pools natural hot springs or artificially heated?',
          answer: '',
        },
        { question: 'Is the onsen experience private or shared?', answer: '' },
        {
          question: 'Who can use the Onsen and Wellness facilities?',
          answer: '',
        },
      ],
    },
  },
};
