import type { LegacyBlockSchema } from '../types';

/** Framer signature experience — eyebrow + title + image + bullet list. */
export const framerSignatureFeatureSchema: LegacyBlockSchema = {
  id: 'framer.signature.feature.v1',
  name: 'Framer Signature Feature',
  category: 'Content',
  description:
    'Section: eyebrow nhỏ + tiêu đề serif lớn + ảnh + list bullet (simplified static).',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      default: 'SIGNATURE EXPERIENCES',
      maxLength: 80,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      default: 'Onsen & Wellness Pavilion',
      required: true,
      maxLength: 200,
    },
    { name: 'image', type: 'image', label: 'Ảnh', aspectRatio: '3:2' },
    {
      name: 'bullets',
      type: 'array',
      label: 'Điểm nổi bật',
      minItems: 1,
      maxItems: 8,
      defaultItem: { text: 'Bullet point' },
      itemLabel: 'bullet',
      itemSchema: [
        { name: 'text', type: 'richtext', label: 'Nội dung', required: true },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'SIGNATURE EXPERIENCES',
      title: 'Onsen & Wellness Pavilion',
      image: {
        url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80',
        alt: '',
      },
      bullets: [
        { text: '13 hồ ngâm khoáng nóng do chuyên gia sức khỏe thiết kế.' },
        { text: 'Đa dạng nhiệt độ & liệu pháp — khớp, tuần hoàn, làn da.' },
        { text: 'Khu onsen trong nhà riêng tư / ngoài trời bán riêng tư.' },
      ],
    },
    en: {
      eyebrow: 'SIGNATURE EXPERIENCES',
      title: 'Onsen & Wellness Pavilion',
      image: {
        url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80',
        alt: '',
      },
      bullets: [
        { text: '13 Soaking pools designed by health consultants.' },
        {
          text: 'Different ambient temperatures and therapies (joints, circulation, skin).',
        },
        { text: 'Private indoor and semi-private outdoor onsen zones.' },
      ],
    },
  },
};
