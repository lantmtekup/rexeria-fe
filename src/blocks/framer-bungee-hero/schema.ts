import type { LegacyBlockSchema } from '../types';

/** Hero - 05 (Bungee): wordmark center + subtitle + timer/links + auto-scroll image strip. */
export const framerBungeeHeroSchema: LegacyBlockSchema = {
  id: 'framer.bungee.hero.v1',
  name: 'Hero - 05 (Bungee)',
  category: 'Hero',
  description:
    'Hero clone từ bungee.framer.website: wordmark to ở giữa, subtitle, timer dọc trái, BE/DR/X phải, dải ảnh bo góc xen kẽ auto-scroll vô hạn ở dưới.',
  fields: [
    {
      name: 'wordmarkImage',
      type: 'image',
      label: 'Wordmark SVG/PNG (vd "Bungee®")',
      aspectRatio: '16:9',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle (dưới wordmark)',
      default: 'Creative studio based in Gotham.',
      maxLength: 120,
    },
    {
      name: 'timerLabel',
      type: 'text',
      label: 'Timer label (vd "NY")',
      default: 'NY',
      maxLength: 12,
    },
    {
      name: 'link1Label',
      type: 'text',
      label: 'Link 1 nhãn',
      default: 'BE',
      maxLength: 12,
    },
    {
      name: 'link1Url',
      type: 'text',
      label: 'Link 1 URL',
      default: 'https://www.behance.net/',
      maxLength: 200,
    },
    {
      name: 'link2Label',
      type: 'text',
      label: 'Link 2 nhãn',
      default: 'DR',
      maxLength: 12,
    },
    {
      name: 'link2Url',
      type: 'text',
      label: 'Link 2 URL',
      default: 'https://dribbble.com/',
      maxLength: 200,
    },
    {
      name: 'link3Label',
      type: 'text',
      label: 'Link 3 nhãn',
      default: 'X',
      maxLength: 12,
    },
    {
      name: 'link3Url',
      type: 'text',
      label: 'Link 3 URL',
      default: 'https://x.com/',
      maxLength: 200,
    },
    {
      name: 'marqueeSpeed',
      type: 'number',
      label: 'Tốc độ marquee (giây/vòng)',
      default: 40,
    },
    {
      name: 'cardImages',
      type: 'array',
      label: 'Dải ảnh (auto-scroll marquee)',
      minItems: 1,
      maxItems: 20,
      itemLabel: 'item',
      defaultItem: { image: null },
      itemSchema: [
        {
          name: 'image',
          type: 'image',
          label: 'Ảnh (1:1)',
          aspectRatio: '1:1',
        },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      wordmarkImage: null,
      subtitle: 'Creative studio based in Gotham.',
      timerLabel: 'NY',
      link1Label: 'BE',
      link1Url: 'https://www.behance.net/',
      link2Label: 'DR',
      link2Url: 'https://dribbble.com/',
      link3Label: 'X',
      link3Url: 'https://x.com/',
      marqueeSpeed: 40,
      cardImages: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
            alt: '',
          },
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
            alt: '',
          },
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
            alt: '',
          },
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
            alt: '',
          },
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
            alt: '',
          },
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
            alt: '',
          },
        },
      ],
    },
    en: {
      wordmarkImage: null,
      subtitle: 'Creative studio based in Gotham.',
      timerLabel: 'NY',
      link1Label: 'BE',
      link1Url: 'https://www.behance.net/',
      link2Label: 'DR',
      link2Url: 'https://dribbble.com/',
      link3Label: 'X',
      link3Url: 'https://x.com/',
      marqueeSpeed: 40,
      cardImages: [],
    },
  },
};
