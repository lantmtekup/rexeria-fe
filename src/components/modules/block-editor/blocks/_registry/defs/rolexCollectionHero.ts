/**
 * BlockDef cho `rolex_collection_hero` — clone từ capable-seat-351062.framer.app.
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { RolexCollectionHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: RolexCollectionHeroContent = {
  backgroundUrl: '/rolex-collection/bg-hero.png',
  mainLetter: 'rolex',
  mainTitle: 'COSMOGRAPH DAYTONA',
  mainDescription:
    'Ever since its initial launch, the Oyster Perpetual Cosmograph Daytona has been synonymous with performance and victory.',
  heroImageUrl: '/rolex-collection/clock.png',
  textLinkLabel: 'Contact',
  textLinkHref: '#contact',
};

export const rolexCollectionHeroDef: BlockDef<RolexCollectionHeroContent> = {
  type: 'rolex_collection_hero',
  meta: {
    type: 'rolex_collection_hero',
    label: 'Rolex Collection Hero',
    accent: '#ffffff',
    adminLabel: 'Rolex Collection Hero',
    gradient: 'from-neutral-900 to-black',
    defaultName: 'Rolex Collection Hero',
    aiLabelVi:
      'hero section tối: chữ R lớn + COSMOGRAPH DAYTONA + Ever Oyster + ảnh đồng hồ Rolex + link Contact',
    aiLabelEn:
      'dark hero: big R letter + COSMOGRAPH DAYTONA + Ever Oyster + Rolex watch image + Contact link',
  },
  component: dynamic(() =>
    import('../../RolexCollectionHero').then(m => m.RolexCollectionHero)
  ),
  defaultContent: { vi: VI, en: { ...VI } },
  elements: [
    {
      key: 'backgroundUrl',
      label: 'Background image',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'mainLetter', label: 'Main letter', icon: Type, fieldType: 'text' },
    { key: 'mainTitle', label: 'Main title', icon: Type, fieldType: 'text' },
    {
      key: 'mainDescription',
      label: 'Description',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'heroImageUrl',
      label: 'Hero image',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'textLinkLabel', label: 'Text link', icon: Type, fieldType: 'text' },
  ],
};
