import type { LegacyBlockSchema } from '../types';

/** Framer paradigm title — 2 text lines split + reveal image + overlay text. */
export const framerParadigmTitleSchema: LegacyBlockSchema = {
  id: 'framer.paradigm.title.v1',
  name: 'Framer Paradigm Title',
  category: 'Content',
  description:
    '2 dòng chữ trên/dưới + ảnh lớn ở giữa + text overlay (Framer style, simplified static).',
  fields: [
    {
      name: 'titleTop',
      type: 'text',
      label: 'Dòng chữ trên',
      default: 'Explore a new paradigm',
      required: true,
      maxLength: 200,
    },
    {
      name: 'titleBottom',
      type: 'text',
      label: 'Dòng chữ dưới',
      default: 'In Residential Wellness',
      required: true,
      maxLength: 200,
    },
    {
      name: 'image',
      type: 'image',
      label: 'Ảnh giữa',
      aspectRatio: '16:9',
    },
    {
      name: 'overlayText',
      type: 'text',
      label: 'Text overlay trên ảnh',
      default: 'Signature Experiences',
      maxLength: 200,
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      titleTop: 'Khám phá chuẩn mực mới',
      titleBottom: 'Trong Wellness Cư Dân',
      image: {
        url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80',
        alt: '',
      },
      overlayText: 'Signature Experiences',
    },
    en: {
      titleTop: 'Explore a new paradigm',
      titleBottom: 'In Residential Wellness',
      image: {
        url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80',
        alt: '',
      },
      overlayText: 'Signature Experiences',
    },
  },
};
