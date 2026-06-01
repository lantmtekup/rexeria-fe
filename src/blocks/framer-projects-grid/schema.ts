import type { LegacyBlockSchema } from '../types';

/** Framer-style projects grid — eyebrow + title + 3-col grid with stagger reveal. */
export const framerProjectsGridSchema: LegacyBlockSchema = {
  id: 'framer.projects.grid.v1',
  name: 'Framer Projects Grid',
  category: 'Feature',
  description:
    'Grid các dự án với ảnh + tên + danh mục, hover zoom, stagger reveal theo viewport.',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      default: 'FEATURED WORK',
      maxLength: 60,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      default: 'Projects',
      required: true,
      maxLength: 120,
    },
    {
      name: 'projects',
      type: 'array',
      label: 'Dự án',
      minItems: 1,
      maxItems: 9,
      defaultItem: {
        image: null,
        name: 'New Project',
        category: 'Category',
        href: '',
      },
      itemLabel: 'dự án',
      itemSchema: [
        {
          name: 'image',
          type: 'image',
          label: 'Ảnh',
          aspectRatio: '4:5',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          label: 'Tên dự án',
          required: true,
          maxLength: 80,
        },
        { name: 'category', type: 'text', label: 'Danh mục', maxLength: 60 },
        { name: 'href', type: 'text', label: 'URL chi tiết', maxLength: 300 },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'FEATURED WORK',
      title: 'Projects',
      projects: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
            alt: 'Haus Loma',
          },
          name: 'Haus Loma',
          category: 'Vision',
          href: '',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80',
            alt: 'Haus Vanta',
          },
          name: 'Haus Vanta',
          category: 'Architecture',
          href: '',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1200&q=80',
            alt: 'Kōa Café',
          },
          name: 'Kōa Café',
          category: 'Interior Experience',
          href: '',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200&q=80',
            alt: 'Stillspace',
          },
          name: 'Stillspace',
          category: 'Amenities',
          href: '',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
            alt: 'Nami Retreat',
          },
          name: 'Nami Retreat',
          category: 'Retreat',
          href: '',
        },
      ],
    },
  },
};
