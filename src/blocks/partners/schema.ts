import type { LegacyBlockSchema } from '../types';

export const partnersSchema: LegacyBlockSchema = {
  id: 'partners.v1',
  name: 'Partners',
  category: 'Landing',
  description: 'Đối tác: grid card với vai trò, tên, mô tả.',
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow', maxLength: 60 },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      required: true,
      maxLength: 120,
    },
    { name: 'body', type: 'richtext', label: 'Mô tả' },
    {
      name: 'items',
      type: 'array',
      label: 'Đối tác',
      minItems: 1,
      maxItems: 8,
      itemLabel: 'đối tác',
      itemSchema: [
        { name: 'role', type: 'text', label: 'Vai trò' },
        { name: 'name', type: 'text', label: 'Tên', required: true },
        { name: 'desc', type: 'text', label: 'Mô tả' },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'Đối tác',
      title: 'Đối Tác Chiến Lược',
      body: 'Hợp tác cùng các thương hiệu hàng đầu trong ngành.',
      items: [
        {
          role: 'Chủ đầu tư',
          name: 'ECOLAND',
          desc: 'Tập đoàn phát triển bất động sản hàng đầu',
        },
        {
          role: 'Thiết kế',
          name: 'STUDIO A+',
          desc: 'Kiến trúc đẳng cấp quốc tế',
        },
        {
          role: 'Vận hành',
          name: 'CBRE',
          desc: 'Quản lý vận hành tiêu chuẩn quốc tế',
        },
      ],
    },
    en: {
      eyebrow: 'Partners',
      title: 'Strategic Partners',
      body: 'Collaborating with leading industry brands.',
      items: [
        {
          role: 'Developer',
          name: 'ECOLAND',
          desc: 'Leading real estate development group',
        },
        {
          role: 'Design',
          name: 'STUDIO A+',
          desc: 'International architecture excellence',
        },
        {
          role: 'Operations',
          name: 'CBRE',
          desc: 'International-standard property management',
        },
      ],
    },
  },
};
