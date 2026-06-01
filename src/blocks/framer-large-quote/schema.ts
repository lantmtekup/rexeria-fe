import type { LegacyBlockSchema } from '../types';

/** Framer large quote — huge italic serif quote with word-by-word fade reveal. */
export const framerLargeQuoteSchema: LegacyBlockSchema = {
  id: 'framer.large.quote.v1',
  name: 'Framer Large Quote',
  category: 'Content',
  description:
    'Trích dẫn lớn italic display, fade-in theo từng từ khi scroll. Dark BG tùy chọn.',
  fields: [
    {
      name: 'quote',
      type: 'richtext',
      label: 'Trích dẫn',
      required: true,
      maxLength: 300,
    },
    {
      name: 'author',
      type: 'text',
      label: 'Tác giả',
      default: '— Elias Norwood',
      maxLength: 80,
    },
    {
      name: 'role',
      type: 'text',
      label: 'Vai trò',
      default: 'Creative Director',
      maxLength: 80,
    },
    {
      name: 'variant',
      type: 'select',
      label: 'Giao diện',
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      quote:
        'Interiors are more than spaces — they are the quiet conversations between light, material, and time.',
      author: '— Elias Norwood',
      role: 'Creative Director',
      variant: 'light',
    },
  },
};
