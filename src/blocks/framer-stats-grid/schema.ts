import type { LegacyBlockSchema } from '../types';

/** Framer stats: big white serif numbers overlaid on landscape bg image. */
export const framerStatsGridSchema: LegacyBlockSchema = {
  id: 'framer.stats.grid.v1',
  name: 'Framer Stats Grid',
  category: 'Landing',
  description:
    'Grid 4 cột chỉ số với background ảnh (Framer style): số serif trắng + label trắng nhỏ, fade-in count-up.',
  fields: [
    {
      name: 'backgroundImage',
      type: 'image',
      label: 'Ảnh nền (tùy chọn)',
      aspectRatio: '16:9',
    },
    {
      name: 'stats',
      type: 'array',
      label: 'Chỉ số',
      minItems: 1,
      maxItems: 6,
      defaultItem: { value: '500 ha', label: 'The scale behind the project' },
      itemLabel: 'stat',
      itemSchema: [
        {
          name: 'value',
          type: 'text',
          label: 'Giá trị (text)',
          required: true,
          maxLength: 40,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Nhãn',
          required: true,
          maxLength: 100,
        },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=80',
        alt: '',
      },
      stats: [
        { value: '500 ha', label: 'Quy mô dự án' },
        { value: '20 %+', label: 'Mặt nước & cây xanh' },
        { value: '13', label: 'Hồ ngâm trị liệu' },
        { value: '8.2+ B USD', label: 'Vốn đầu tư' },
      ],
    },
    en: {
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=80',
        alt: '',
      },
      stats: [
        { value: '500 ha', label: 'The scale behind the project' },
        { value: '20 %+', label: 'Land devoted to water and greenery' },
        { value: '13', label: 'Therapeutic soaking pools' },
        { value: '8.2+ B USD', label: 'Financial investment for project' },
      ],
    },
  },
};
