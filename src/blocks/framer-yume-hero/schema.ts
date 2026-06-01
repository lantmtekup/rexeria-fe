import type { LegacyBlockSchema } from '../types';

/** Hero - Yume: clone of yuya.framer.website hero — massive Inter title + circular avatar + email + bio. */
export const framerYumeHeroSchema: LegacyBlockSchema = {
  id: 'framer.yume.hero.v1',
  name: 'Hero - Yume',
  category: 'Hero',
  description:
    'Hero clone từ yuya.framer.website: 2 dòng tên cực to (Inter 174/600/-0.09em), avatar tròn top-right, email + bio bottom row.',
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: 'Tên (dòng 1)',
      default: 'YUME',
      required: true,
      maxLength: 40,
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Họ (dòng 2)',
      default: 'YASKUMI',
      required: true,
      maxLength: 40,
    },
    {
      name: 'avatar',
      type: 'image',
      label: 'Ảnh avatar (tròn, top-right)',
      aspectRatio: '1:1',
    },
    {
      name: 'email',
      type: 'text',
      label: 'Email (bottom-left)',
      default: 'hello@yume.com',
      maxLength: 80,
    },
    {
      name: 'bio',
      type: 'text',
      label: 'Bio (bottom-right)',
      default:
        "Hello, I'm a freelancer specializing in minimal design with 10 years of expertise — based in Tokyo, working remote. Let's create!",
      maxLength: 320,
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      firstName: 'YUME',
      lastName: 'YASKUMI',
      avatar: {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
        alt: 'Avatar',
      },
      email: 'hello@yume.com',
      bio: "Hello, I'm a freelancer specializing in minimal design with 10 years of expertise — based in Tokyo, working remote. Let's create!",
    },
    en: {
      firstName: 'YUME',
      lastName: 'YASKUMI',
      avatar: {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
        alt: 'Avatar',
      },
      email: 'hello@yume.com',
      bio: "Hello, I'm a freelancer specializing in minimal design with 10 years of expertise — based in Tokyo, working remote. Let's create!",
    },
  },
};
