import type { LegacyBlockSchema } from '../types';

/**
 * Projects - VS Collins: 12-col scattered grid clone từ vs-collins.framer.website.
 *
 * Mỗi item gồm:
 *  - image, year, name, href
 *  - spacerBefore: số cột trống (0-12) chèn trước item để tạo scatter pattern
 */
export const framerVsCollinsProjectsSchema: LegacyBlockSchema = {
  id: 'framer.vscollins.projects.v1',
  name: 'Projects - VS Collins',
  category: 'Showcase',
  description:
    'Portfolio scattered grid clone từ vs-collins.framer.website: 12-col + Spacers tạo staggered layout.',
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Projects',
      minItems: 1,
      maxItems: 24,
      itemLabel: 'project',
      defaultItem: {
        image: null,
        year: '2024',
        name: 'New Project',
        href: '#',
        spacerBefore: 0,
      },
      itemSchema: [
        {
          name: 'image',
          type: 'image',
          label: 'Ảnh',
          aspectRatio: '3:4',
        },
        {
          name: 'year',
          type: 'text',
          label: 'Năm (caption)',
          default: '2024',
          maxLength: 8,
        },
        {
          name: 'name',
          type: 'text',
          label: 'Tên project',
          default: 'Project',
          maxLength: 60,
        },
        {
          name: 'href',
          type: 'text',
          label: 'Link URL',
          default: '#',
          maxLength: 200,
        },
        {
          name: 'spacerBefore',
          type: 'number',
          label: 'Spacer cols TRƯỚC project (0-12 — tạo scatter)',
          default: 0,
        },
      ],
    },
    {
      name: 'bgColor',
      type: 'color',
      label: 'Background',
      default: '#ffffff',
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      bgColor: '#ffffff',
      items: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200&q=80',
            alt: 'Fields',
          },
          year: '2024',
          name: 'Fields',
          href: '#fields',
          spacerBefore: 0,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
            alt: 'Plates & Palettes',
          },
          year: '2023',
          name: 'Plates & Palettes',
          href: '#plates-palettes',
          spacerBefore: 0,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80',
            alt: 'Net Play',
          },
          year: '2022',
          name: 'Net Play',
          href: '#net-play',
          spacerBefore: 6,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80',
            alt: 'Celestial',
          },
          year: '2019',
          name: 'Celestial',
          href: '#celestial',
          spacerBefore: 4,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80',
            alt: 'Quiet Forms',
          },
          year: '2022',
          name: 'Quiet Forms',
          href: '#quiet-forms',
          spacerBefore: 0,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1200&q=80',
            alt: 'Prime',
          },
          year: '2021',
          name: 'Prime',
          href: '#prime',
          spacerBefore: 2,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=1200&q=80',
            alt: 'St Petersburg',
          },
          year: '2021',
          name: 'St Petersburg',
          href: '#st-petersburg',
          spacerBefore: 0,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
            alt: 'Melody',
          },
          year: '2019',
          name: 'Melody',
          href: '#melody',
          spacerBefore: 0,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=1200&q=80',
            alt: 'Alfresco',
          },
          year: '2019',
          name: 'Alfresco',
          href: '#alfresco',
          spacerBefore: 2,
        },
      ],
    },
  },
};
