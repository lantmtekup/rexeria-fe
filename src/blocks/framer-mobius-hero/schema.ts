import type { LegacyBlockSchema } from '../types';

/** Hero - Möbius: photo stack scatter + huge wordmark + intro paragraph + nav. */
export const framerMobiusHeroSchema: LegacyBlockSchema = {
  id: 'framer.mobius.hero.v1',
  name: 'Hero - Möbius',
  category: 'Hero',
  description:
    'Hero clone mobius.framer.website: huge wordmark + photo stack scattered pile + intro paragraph + hover CTA arrow button.',
  fields: [
    {
      name: 'brand',
      type: 'text',
      label: 'Brand wordmark',
      default: 'Möbius®',
      maxLength: 20,
    },
    {
      name: 'introBody',
      type: 'text',
      label: 'Intro paragraph (after brand)',
      default:
        '— a design studio shaping brands and digital experiences through motion, clarity, and timeless craft. Based online, working globally, we help ambitious teams express who they are and what they stand for.',
      maxLength: 600,
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Top nav links',
      minItems: 1,
      maxItems: 6,
      defaultItem: { label: 'NAV', href: '#' },
      itemSchema: [
        { name: 'label', type: 'text', label: 'Label', default: 'NAV' },
        { name: 'href', type: 'text', label: 'URL', default: '#' },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Photo stack cards',
      minItems: 1,
      maxItems: 12,
      defaultItem: {
        image: null,
        href: '#',
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
      },
      itemSchema: [
        {
          name: 'image',
          type: 'image',
          label: 'Ảnh (3:4 portrait)',
          aspectRatio: '3:4',
        },
        { name: 'href', type: 'text', label: 'Link URL', default: '#' },
        {
          name: 'rotation',
          type: 'number',
          label: 'Xoay (deg)',
          default: 0,
        },
        { name: 'offsetX', type: 'number', label: 'Offset X', default: 0 },
        { name: 'offsetY', type: 'number', label: 'Offset Y', default: 0 },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright text',
      default: '© 2018-26',
      maxLength: 30,
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location footer',
      default: 'BERLIN, DE',
      maxLength: 30,
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
      brand: 'Möbius®',
      introBody:
        '— a design studio shaping brands and digital experiences through motion, clarity, and timeless craft. Based online, working globally, we help ambitious teams express who they are and what they stand for.',
      navItems: [
        { label: 'WORK', href: '#work' },
        { label: 'STUDIO', href: '#studio' },
        { label: 'FEED', href: '#feed' },
        { label: 'CONTACT', href: '#contact' },
      ],
      cards: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1492447166138-50c3889fccb1?w=600&q=80',
            alt: 'Card 1',
          },
          href: '#',
          rotation: -8,
          offsetX: -40,
          offsetY: 20,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
            alt: 'Card 2',
          },
          href: '#',
          rotation: 6,
          offsetX: 30,
          offsetY: -10,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=600&q=80',
            alt: 'Card 3',
          },
          href: '#',
          rotation: -3,
          offsetX: -20,
          offsetY: -30,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&q=80',
            alt: 'Card 4',
          },
          href: '#',
          rotation: 4,
          offsetX: 50,
          offsetY: 30,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
            alt: 'Card 5',
          },
          href: '#',
          rotation: -5,
          offsetX: 15,
          offsetY: -25,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=600&q=80',
            alt: 'Card 6',
          },
          href: '#',
          rotation: 9,
          offsetX: -55,
          offsetY: 10,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&q=80',
            alt: 'Card 7',
          },
          href: '#',
          rotation: -2,
          offsetX: 35,
          offsetY: 40,
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=600&q=80',
            alt: 'Card 8 (top)',
          },
          href: '#contact',
          rotation: 0,
          offsetX: 0,
          offsetY: 0,
        },
      ],
      copyright: '© 2018-26',
      location: 'BERLIN, DE',
      bgColor: '#ffffff',
    },
    en: {
      brand: 'Möbius®',
      introBody: '— a design studio...',
      navItems: [],
      cards: [],
      copyright: '© 2018-26',
      location: 'BERLIN, DE',
      bgColor: '#ffffff',
    },
  },
};
