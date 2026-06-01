import type { LegacyBlockSchema } from '../types';

/** Services - 01 (Velora): numbered rows (01/02/03/04) — title + description + image right. */
export const framerVeloraServicesSchema: LegacyBlockSchema = {
  id: 'framer.velora.services.v1',
  name: 'Services - 01 (Velora)',
  category: 'Features',
  description:
    'List dịch vụ đánh số dọc, mỗi item gồm số nhỏ + tiêu đề + mô tả + ảnh phải. Static-stack simplified port từ velora-template.framer.website.',
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Danh sách dịch vụ',
      minItems: 1,
      maxItems: 12,
      itemLabel: 'dịch vụ',
      defaultItem: {
        title: 'New Service',
        description: 'Mô tả ngắn về dịch vụ.',
        image: null,
      },
      itemSchema: [
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề',
          required: true,
          maxLength: 80,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Mô tả',
          maxLength: 240,
        },
        {
          name: 'image',
          type: 'image',
          label: 'Ảnh phải',
          aspectRatio: '16:10',
        },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      items: [
        {
          title: 'Graphic Design',
          description:
            'Creating visually compelling designs that elevate your brand and captivate your audience.',
          image: {
            url: 'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=1600&q=80',
            alt: 'Floral arrangement',
          },
        },
        {
          title: 'Lifestyle Photography',
          description:
            'Capturing authentic moments that bring your brand to life.',
          image: {
            url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1600&q=80',
            alt: 'Lamp and clock',
          },
        },
        {
          title: 'Digital Design',
          description:
            'Intuitive and aesthetically pleasing digital experiences.',
          image: {
            url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1600&q=80',
            alt: 'Green leaf in vase',
          },
        },
        {
          title: 'Social Media Design',
          description: 'Engaging visuals that strengthen your online presence.',
          image: {
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80',
            alt: 'Poster artwork',
          },
        },
      ],
    },
  },
};
