import type { LegacyBlockSchema } from '../types';

/** Framer horizontal scroll (simplified port) — header + horizontally-scrollable
 *  card row. Original used sticky-pinned section + scroll-driven translateX; this
 *  port keeps the editorial intent (card row of 4:5 images with label + caption). */
export const framerHorizontalScrollSchema: LegacyBlockSchema = {
  id: 'framer.horizontal.scroll.v1',
  name: 'Framer Horizontal Scroll',
  category: 'Gallery',
  description:
    'Hàng card scroll ngang: eyebrow + tiêu đề serif italic + row ảnh 4:5 với label + caption.',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      default: 'SHOWCASE',
      maxLength: 60,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      default: 'Spaces',
      required: true,
      maxLength: 160,
    },
    {
      name: 'items',
      type: 'array',
      label: 'Items',
      minItems: 2,
      maxItems: 8,
      defaultItem: { image: null, label: '', caption: '' },
      itemLabel: 'item',
      itemSchema: [
        {
          name: 'image',
          type: 'image',
          label: 'Ảnh',
          aspectRatio: '4:5',
          required: true,
        },
        { name: 'label', type: 'text', label: 'Label', maxLength: 60 },
        { name: 'caption', type: 'text', label: 'Caption', maxLength: 120 },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'SHOWCASE',
      title: 'Spaces',
      items: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
            alt: 'Living room',
          },
          label: 'Living',
          caption: 'Phòng khách ấm áp',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
            alt: 'Kitchen',
          },
          label: 'Kitchen',
          caption: 'Không gian nấu ăn sáng',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
            alt: 'Bedroom',
          },
          label: 'Bedroom',
          caption: 'Phòng ngủ yên tĩnh',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80',
            alt: 'Bathroom',
          },
          label: 'Bath',
          caption: 'Phòng tắm thư giãn',
        },
      ],
    },
    en: {
      eyebrow: 'SHOWCASE',
      title: 'Spaces',
      items: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
            alt: 'Living room',
          },
          label: 'Living',
          caption: 'Warm sitting room',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
            alt: 'Kitchen',
          },
          label: 'Kitchen',
          caption: 'Bright cooking space',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
            alt: 'Bedroom',
          },
          label: 'Bedroom',
          caption: 'Quiet sleeping room',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80',
            alt: 'Bathroom',
          },
          label: 'Bath',
          caption: 'Relaxing bathroom',
        },
      ],
    },
  },
};
