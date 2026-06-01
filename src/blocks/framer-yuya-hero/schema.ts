import type { LegacyBlockSchema } from '../types';

/** Hero - Yuya v2: two-tier responsive (174/76px) clone of yuya.framer.website. */
export const framerYuyaHeroSchema: LegacyBlockSchema = {
  id: 'framer.yuya.hero.v2',
  name: 'Hero - Yuya (v2)',
  category: 'Hero',
  description:
    'Hero clone yuya.framer.website (recon v2): two-tier 174/76px Inter title + circular avatar + email/bio. Breakpoint 810px discrete.',
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
      label: 'Avatar (tròn)',
      aspectRatio: '1:1',
    },
    {
      name: 'email',
      type: 'text',
      label: 'Email',
      default: 'hello@yume.com',
      maxLength: 80,
    },
    {
      name: 'bio',
      type: 'text',
      label: 'Bio',
      default:
        "Hello, I'm a freelancer specializing in minimal design with 10 years of expertise — based in Tokyo, working remote. Let's create!",
      maxLength: 320,
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
      firstName: 'YUME',
      lastName: 'YASKUMI',
      avatar: {
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
        alt: 'Avatar',
      },
      email: 'hello@yume.com',
      bio: "Hello, I'm a freelancer specializing in minimal design with 10 years of expertise — based in Tokyo, working remote. Let's create!",
      bgColor: '#ffffff',
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
      bgColor: '#ffffff',
    },
  },
};
