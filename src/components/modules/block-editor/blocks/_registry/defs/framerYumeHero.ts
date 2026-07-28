/**
 * BlockDef cho `framer_yume_hero` — nguồn sự thật duy nhất.
 *
 * PoC: component vẫn nằm ở `blocks/FramerYumeHero.tsx` (không di chuyển để
 * khỏi đụng import cũ). Khi migrate đầy đủ, component + content + def sẽ gom
 * chung 1 folder `blocks/framer-yume-hero/`.
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { FramerYumeHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: FramerYumeHeroContent = {
  firstName: 'YUME',
  lastName: 'YASKUMI',
  avatarUrl:
    'https://framerusercontent.com/images/j1OWdec3GtorzmtyEO583X355k.png',
  email: 'hello@yume.com',
  bio: "Hello, I'm a freelancer specializing in minimal design with 10 years of expertise — based in Tokyo, working remote. Let's create!",
};

export const framerYumeHeroDef: BlockDef<FramerYumeHeroContent> = {
  type: 'framer_yume_hero',
  meta: {
    type: 'framer_yume_hero',
    label: 'Hero - Yume',
    accent: '#000000',
    adminLabel: 'Hero - Yume',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Hero - Yume',
    aiLabelVi: 'block hero tối giản (tên lớn + avatar)',
    aiLabelEn: 'minimal hero block (big name + avatar)',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../FramerYumeHero').then(m => m.FramerYumeHero)
  ),
  defaultContent: { vi: VI, en: { ...VI } },
  elements: [
    { key: 'firstName', label: 'Tên (dòng 1)', icon: Type, fieldType: 'text' },
    { key: 'lastName', label: 'Họ (dòng 2)', icon: Type, fieldType: 'text' },
    {
      key: 'avatarUrl',
      label: 'Ảnh avatar',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'email', label: 'Email', icon: Type, fieldType: 'text' },
    { key: 'bio', label: 'Bio', icon: Pilcrow, fieldType: 'textarea' },
  ],
};
