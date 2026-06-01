import type { LegacyBlockSchema } from '../types';

/** Hero - 04 (Avexa): top brand left, headline right, italic tagline bottom-left, orange wordmark bottom-right. */
export const framerAvexaHeroSchema: LegacyBlockSchema = {
  id: 'framer.avexa.hero.v1',
  name: 'Hero - 04 (Avexa)',
  category: 'Hero',
  description:
    'Hero clone từ avexa.framer.media: portrait BG, brand mark trái trên, headline phải trên, tagline italic trái dưới, wordmark cam to "Avexa® Studio" phải dưới.',
  fields: [
    {
      name: 'backgroundImage',
      type: 'image',
      label: 'Ảnh nền',
      aspectRatio: '16:9',
    },
    {
      name: 'brandMark',
      type: 'text',
      label: 'Brand mark (góc trái trên)',
      default: 'AVEXA',
      maxLength: 24,
    },
    {
      name: 'topHeading',
      type: 'text',
      label: 'Headline (góc phải trên)',
      default: 'Elevate Brands Through Bold Thinking',
      maxLength: 120,
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline italic (góc trái dưới)',
      default: 'Creative strategy that drives results',
      maxLength: 100,
    },
    {
      name: 'wordmark',
      type: 'text',
      label: 'Wordmark phần 1 (màu cam)',
      default: 'Avexa',
      maxLength: 30,
    },
    {
      name: 'wordmarkSuffix',
      type: 'text',
      label: 'Ký hiệu sau wordmark',
      default: '®',
      maxLength: 6,
    },
    {
      name: 'wordmarkAfter',
      type: 'text',
      label: 'Wordmark phần 2 (màu trắng)',
      default: 'Studio',
      maxLength: 30,
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=1600&q=80',
        alt: 'Portrait',
      },
      brandMark: 'AVEXA',
      topHeading: 'Elevate Brands Through Bold Thinking',
      tagline: 'Creative strategy that drives results',
      wordmark: 'Avexa',
      wordmarkSuffix: '®',
      wordmarkAfter: 'Studio',
    },
    en: {
      backgroundImage: {
        url: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=1600&q=80',
        alt: 'Portrait',
      },
      brandMark: 'AVEXA',
      topHeading: 'Elevate Brands Through Bold Thinking',
      tagline: 'Creative strategy that drives results',
      wordmark: 'Avexa',
      wordmarkSuffix: '®',
      wordmarkAfter: 'Studio',
    },
  },
};
