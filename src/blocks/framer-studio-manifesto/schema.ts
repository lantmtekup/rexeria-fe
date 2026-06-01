import type { LegacyBlockSchema } from '../types';

/** Framer studio manifesto — long-form philosophy paragraph, centered, no image. */
export const framerStudioManifestoSchema: LegacyBlockSchema = {
  id: 'framer.studio.manifesto.v1',
  name: 'Framer Studio Manifesto',
  category: 'Content',
  description:
    'Khối triết lý thương hiệu: eyebrow + title italic + đoạn body dài, full-width không ảnh.',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      default: 'PHILOSOPHY',
      maxLength: 60,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      default: 'Our approach',
      required: true,
      maxLength: 160,
    },
    {
      name: 'body',
      type: 'richtext',
      label: 'Nội dung',
      required: true,
      maxLength: 800,
    },
    {
      name: 'signature',
      type: 'text',
      label: 'Chữ ký (tùy chọn)',
      default: '',
      maxLength: 80,
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'PHILOSOPHY',
      title: 'Our approach',
      body: 'Tại studio của chúng tôi, nội thất không chỉ là không gian — đó là trải nghiệm. Mỗi dự án được hình thành từ chất liệu thật, ánh sáng tự nhiên và sự tôn trọng với con người sẽ sống trong đó. Chúng tôi tin vào sự bình thản, vào những đường nét chắt lọc, và vào vẻ đẹp của từng chi tiết được suy nghĩ kỹ lưỡng.',
      signature: '— AESTHA Studio',
    },
  },
};
