import type { LegacyBlockSchema } from '../types';

/** Framer-clone hero: full-bleed landscape image, italic serif title bottom-left, minimal top nav */
export const framerHeroSchema: LegacyBlockSchema = {
  id: 'framer.hero.v1',
  name: 'Framer Hero',
  category: 'Hero',
  description:
    'Hero theo Framer template: ảnh full-bleed, tiêu đề serif italic góc dưới, nav tối giản.',
  fields: [
    {
      name: 'logo',
      type: 'text',
      label: 'Logo',
      default: 'ecopark',
      maxLength: 40,
    },
    {
      name: 'navLink',
      type: 'text',
      label: 'Nhãn nav phải',
      default: 'Contact',
      maxLength: 30,
    },
    {
      name: 'navHref',
      type: 'text',
      label: 'URL nav phải',
      default: '#contact',
      maxLength: 200,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề (2 dòng)',
      default: 'Live with Nature\nBathe in Serenity',
      required: true,
      maxLength: 200,
    },
    {
      name: 'backgroundImage',
      type: 'image',
      label: 'Ảnh nền',
      aspectRatio: '16:9',
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      logo: 'ecopark',
      navLink: 'Liên hệ',
      navHref: '#contact',
      title: 'Sống Cùng Thiên Nhiên\nĐắm Mình Trong Bình Yên',
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1600&q=80',
        alt: 'Nature landscape',
      },
    },
    en: {
      logo: 'ecopark',
      navLink: 'Contact',
      navHref: '#contact',
      title: 'Live with Nature\nBathe in Serenity',
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1600&q=80',
        alt: 'Nature landscape',
      },
    },
  },
};
