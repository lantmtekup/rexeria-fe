import type { LegacyBlockSchema } from '../types';

export const faqSchema: LegacyBlockSchema = {
  id: 'faq.v1',
  name: 'FAQ',
  category: 'Landing',
  description: 'Accordion câu hỏi thường gặp: nhấn mở/đóng từng câu.',
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow', maxLength: 60 },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      required: true,
      maxLength: 120,
    },
    {
      name: 'items',
      type: 'array',
      label: 'Câu hỏi',
      minItems: 1,
      maxItems: 20,
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
      eyebrow: 'FAQ',
      title: 'Câu Hỏi\nThường Gặp',
      items: [
        {
          question: 'Dự án bao giờ bàn giao?',
          answer: 'Dự kiến bàn giao vào Quý 4/2027.',
        },
        {
          question: 'Phương thức thanh toán như thế nào?',
          answer:
            'Thanh toán theo tiến độ xây dựng, hỗ trợ vay ngân hàng lên đến 70%.',
        },
        {
          question: 'Có chính sách ưu đãi cho người mua sớm không?',
          answer:
            'Có, khách hàng đặt cọc sớm được chiết khấu lên đến 8% và nhiều quà tặng.',
        },
      ],
    },
    en: {
      eyebrow: 'FAQ',
      title: 'Frequently\nAsked Questions',
      items: [
        {
          question: 'When is the expected handover?',
          answer: 'Expected handover in Q4 2027.',
        },
        {
          question: 'What are the payment terms?',
          answer: 'Progress-based payments with bank loans up to 70%.',
        },
        {
          question: 'Are there early-bird promotions?',
          answer:
            'Yes, early deposit customers receive up to 8% discount and gifts.',
        },
      ],
    },
  },
};
