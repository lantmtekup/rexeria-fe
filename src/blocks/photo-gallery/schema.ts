import type { LegacyBlockSchema } from '../types';

const SAMPLE_IMG = (n: number) =>
  `https://images.unsplash.com/photo-${
    [
      '1545324418-cc1a3fa10c00',
      '1502672260266-1c1ef2d93688',
      '1542317854-5b4b5e4e7a37',
      '1600585154340-be6161a56a0c',
      '1545239351-1141bd82e8a6',
      '1560448204-e02f11c3d0e2',
    ][n % 6]
  }?w=900&q=80`;

export const photoGallerySchema: LegacyBlockSchema = {
  id: 'photo.gallery.v1',
  name: 'Photo Gallery',
  category: 'Landing',
  description: 'Gallery ảnh: grid 3 cột với label overlay, hỗ trợ span 2 row.',
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
      label: 'Ảnh',
      minItems: 1,
      maxItems: 12,
      itemLabel: 'ảnh',
      itemSchema: [
        { name: 'src', type: 'text', label: 'URL ảnh', required: true },
        { name: 'label', type: 'text', label: 'Nhãn' },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'Gallery',
      title: 'Hình Ảnh Dự Án',
      items: [
        { src: SAMPLE_IMG(0), label: 'Lobby' },
        { src: SAMPLE_IMG(1), label: 'Phòng khách' },
        { src: SAMPLE_IMG(2), label: 'Hồ bơi' },
        { src: SAMPLE_IMG(3), label: 'Sky Garden' },
        { src: SAMPLE_IMG(4), label: 'Gym' },
        { src: SAMPLE_IMG(5), label: 'Tầm nhìn' },
      ],
    },
    en: {
      eyebrow: 'Gallery',
      title: 'Project Gallery',
      items: [
        { src: SAMPLE_IMG(0), label: 'Lobby' },
        { src: SAMPLE_IMG(1), label: 'Living Room' },
        { src: SAMPLE_IMG(2), label: 'Pool' },
        { src: SAMPLE_IMG(3), label: 'Sky Garden' },
        { src: SAMPLE_IMG(4), label: 'Gym' },
        { src: SAMPLE_IMG(5), label: 'Views' },
      ],
    },
  },
};
