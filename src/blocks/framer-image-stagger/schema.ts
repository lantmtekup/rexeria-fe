import type { LegacyBlockSchema } from '../types';

/** Framer image stagger — asymmetric grid with parallax-like offsets. */
export const framerImageStaggerSchema: LegacyBlockSchema = {
  id: 'framer.image.stagger.v1',
  name: 'Framer Image Stagger',
  category: 'Gallery',
  description: 'Gallery ảnh xếp lệch, mỗi ảnh fade-in stagger theo viewport.',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      default: 'GALLERY',
      maxLength: 60,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      default: 'Interior details',
      required: true,
      maxLength: 160,
    },
    {
      name: 'images',
      type: 'array',
      label: 'Ảnh',
      minItems: 3,
      maxItems: 8,
      defaultItem: { src: null, alt: '' },
      itemLabel: 'ảnh',
      itemSchema: [
        { name: 'src', type: 'image', label: 'Ảnh', required: true },
        { name: 'alt', type: 'text', label: 'Alt text', maxLength: 160 },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'GALLERY',
      title: 'Interior details',
      images: [
        {
          src: {
            url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400&q=80',
            alt: '',
          },
          alt: '',
        },
        {
          src: {
            url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1400&q=80',
            alt: '',
          },
          alt: '',
        },
        {
          src: {
            url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1400&q=80',
            alt: '',
          },
          alt: '',
        },
        {
          src: {
            url: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1400&q=80',
            alt: '',
          },
          alt: '',
        },
        {
          src: {
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&q=80',
            alt: '',
          },
          alt: '',
        },
      ],
    },
  },
};
