/**
 * BlockDef cho `rolex_collection_nav` — navigation bar từ capable-seat-351062.framer.app.
 */
import { Link2, Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { RolexCollectionNavContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: RolexCollectionNavContent = {
  navHomeLabel: 'HOME',
  navHomeHref: './',
  navCollectionLabel: 'EXPLORE OUR COLLECTION',
  navCollectionHref: './work',
  navContactLabel: 'CONTACT',
  navContactHref: './contact',
};

export const rolexCollectionNavDef: BlockDef<RolexCollectionNavContent> = {
  type: 'rolex_collection_nav',
  meta: {
    type: 'rolex_collection_nav',
    label: 'Rolex Collection Nav',
    accent: '#ffffff',
    adminLabel: 'Rolex Collection Nav',
    gradient: 'from-neutral-800 to-neutral-900',
    defaultName: 'Rolex Collection Nav',
    aiLabelVi: 'nav bar glass với 3 items (home, explore collection, contact)',
    aiLabelEn: 'glass nav bar with 3 items (home, explore collection, contact)',
  },
  component: dynamic(() =>
    import('../../RolexCollectionNav').then(m => m.RolexCollectionNav)
  ),
  defaultContent: { vi: VI, en: { ...VI } },
  elements: [
    {
      key: 'navHomeLabel',
      label: 'Nav Home',
      icon: Type,
      fieldType: 'text',
      groupId: 'navHome',
      groupLabel: 'Home',
    },
    {
      key: 'navHomeHref',
      label: 'Link Home',
      icon: Link2,
      fieldType: 'text',
      groupId: 'navHome',
    },
    {
      key: 'navCollectionLabel',
      label: 'Nav Explore Collection',
      icon: Type,
      fieldType: 'text',
      groupId: 'navCollection',
      groupLabel: 'Explore Collection',
    },
    {
      key: 'navCollectionHref',
      label: 'Link Explore Collection',
      icon: Link2,
      fieldType: 'text',
      groupId: 'navCollection',
    },
    {
      key: 'navContactLabel',
      label: 'Nav Contact',
      icon: Type,
      fieldType: 'text',
      groupId: 'navContact',
      groupLabel: 'Contact',
    },
    {
      key: 'navContactHref',
      label: 'Link Contact',
      icon: Link2,
      fieldType: 'text',
      groupId: 'navContact',
    },
  ],
};
