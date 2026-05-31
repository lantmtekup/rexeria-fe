import type { LegacyBlockSchema } from '../types';

export const rexerProductSchema: LegacyBlockSchema = {
  id: 'rexer.product.v1',
  name: 'Rexer — Product',
  category: 'Landing',
  description:
    'Grid 4 loại căn hộ dạng thẻ ảnh + tag + diện tích (Maison du Parc).',
  fields: [
    { name: 'eyebrowLabel', type: 'text', label: 'Eyebrow', maxLength: 60 },
    { name: 'heading', type: 'text', label: 'Heading', maxLength: 200 },
    {
      name: 'items',
      type: 'array',
      label: 'Loại căn hộ',
      minItems: 1,
      maxItems: 8,
      itemLabel: 'loại',
      itemSchema: [
        {
          name: 'tag',
          type: 'text',
          label: 'Tag (1 BR / 2 BR…)',
          required: true,
          maxLength: 20,
        },
        { name: 'area', type: 'text', label: 'Diện tích', maxLength: 40 },
        { name: 'image', type: 'image', label: 'Ảnh', aspectRatio: '4:5' },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrowLabel: '02 · Căn hộ',
      heading: 'Bốn định dạng,\nmột ngôn ngữ kiến trúc.',
      items: [
        {
          tag: '1 BR',
          area: '45–58 m²',
          image: {
            url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
            alt: '1 BR',
          },
        },
        {
          tag: '2 BR',
          area: '72–96 m²',
          image: {
            url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
            alt: '2 BR',
          },
        },
        {
          tag: '3 BR',
          area: '118–145 m²',
          image: {
            url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
            alt: '3 BR',
          },
        },
        {
          tag: 'PH',
          area: '186–248 m²',
          image: {
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            alt: 'Penthouse',
          },
        },
      ],
    },
    en: {
      eyebrowLabel: '02 · Apartments',
      heading: 'Four formats,\none architectural language.',
      items: [],
    },
  },
};
