/** BlockDef `lumea_footer`. */
import { Link2, Pilcrow, Type } from 'lucide-react';
import { LumeaFooter } from '../../LumeaFooter';
import type { LumeaFooterContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: LumeaFooterContent = {
  brand: 'Lumea',
  tagline: 'A once-in-a-lifetime address at the crown of the city.',
  links: [
    'About',
    'Residences',
    'Amenities',
    'Availability',
    'Neighborhood',
    'Contact',
  ],
  copyright: '© 2026 Lumea Residences. All rights reserved.',
};
const EN: LumeaFooterContent = { ...VI };
export const lumeaFooterDef: BlockDef<LumeaFooterContent> = {
  type: 'lumea_footer',
  meta: {
    type: 'lumea_footer',
    label: 'Footer - Serif Brand',
    accent: '#a68a5b',
    adminLabel: 'Footer - Serif Brand',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Footer - Serif Brand',
    aiLabelVi: 'footer nâu đậm: brand serif lớn + tagline + link + legal',
    aiLabelEn: 'dark footer: big serif brand + tagline + links + legal',
  },
  component: LumeaFooter,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'brand', label: 'Brand', icon: Type, fieldType: 'text' },
    { key: 'tagline', label: 'Tagline', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'links', label: 'Link', icon: Link2 },
  ],
};
