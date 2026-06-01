import type { LegacyBlockSchema } from '../types';

/**
 * Framer Finnegan Expertise — simplified port: stacked expertise cards over
 * a hero image strip (3D scroll-pinned rolling box removed in port).
 */
export const framerFinneganExpertiseSchema: LegacyBlockSchema = {
  id: 'framer.finnegan.expertise.v1',
  name: 'Framer Finnegan Expertise',
  category: 'Feature',
  description:
    'Section danh sách expertise: tiêu đề lớn ghost + grid card mỗi expertise có ảnh + title + mô tả + màu nền tuỳ chọn.',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Tiêu đề lớn (background ghost text)',
      default: 'My Expertise',
      maxLength: 80,
    },
    {
      name: 'cardBg',
      type: 'text',
      label: 'Màu nền card mặc định',
      default: '#e85a2c',
      maxLength: 32,
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Slides (mỗi slide = 1 expertise)',
      minItems: 2,
      maxItems: 8,
      itemLabel: 'slide',
      defaultItem: {
        image: null,
        title: 'Title',
        description: 'Description',
        bgColor: '#e85a2c',
      },
      itemSchema: [
        {
          name: 'image',
          type: 'image',
          label: 'Ảnh nền (16:9)',
          aspectRatio: '16:9',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Tiêu đề card',
          required: true,
          maxLength: 80,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Mô tả card',
          required: true,
          maxLength: 400,
        },
        {
          name: 'bgColor',
          type: 'text',
          label: 'Màu card (CSS) — mỗi slide 1 màu',
          default: '#e85a2c',
          maxLength: 32,
        },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      heading: 'My Expertise',
      cardBg: '#e85a2c',
      slides: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80',
            alt: 'Real estate photography',
          },
          title: 'Real Estate Photography',
          description:
            "Highlight the best features of your property with our real estate photography services. We'll use professional lighting and composition techniques to create images that make your property stand out and attract potential buyers.",
          bgColor: '#e85a2c',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1600&q=80',
            alt: 'Product photography',
          },
          title: 'Product Photography',
          description:
            "Showcase your products in the best possible light with our professional product photography services. Whether you're selling online or in print, we'll create images that highlight the unique features of your products.",
          bgColor: '#2c7be8',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80',
            alt: 'Landscape photography',
          },
          title: 'Landscape Photography',
          description:
            "Explore the beauty of the world through our captivating landscape photography. From breathtaking vistas to hidden gems, we'll take you on a visual journey that will inspire and awe.",
          bgColor: '#1f9d55',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1600&q=80',
            alt: 'Documentary photography',
          },
          title: 'Documentary Photography',
          description:
            'Documentary photography serves to inform, educate, and inspire by providing a truthful and insightful representation of the world. It raises awareness about important issues and documents significant events.',
          bgColor: '#7c4dff',
        },
      ],
    },
    en: {
      heading: 'My Expertise',
      cardBg: '#e85a2c',
      slides: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80',
            alt: 'Real estate photography',
          },
          title: 'Real Estate Photography',
          description:
            "Highlight the best features of your property with our real estate photography services. We'll use professional lighting and composition techniques to create images that make your property stand out and attract potential buyers.",
          bgColor: '#e85a2c',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1600&q=80',
            alt: 'Product photography',
          },
          title: 'Product Photography',
          description:
            'Showcase your products in the best possible light with our professional product photography services.',
          bgColor: '#2c7be8',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80',
            alt: 'Landscape photography',
          },
          title: 'Landscape Photography',
          description:
            'Explore the beauty of the world through our captivating landscape photography.',
          bgColor: '#1f9d55',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1600&q=80',
            alt: 'Documentary photography',
          },
          title: 'Documentary Photography',
          description:
            'Documentary photography to inform, educate, and inspire.',
          bgColor: '#7c4dff',
        },
      ],
    },
  },
};
