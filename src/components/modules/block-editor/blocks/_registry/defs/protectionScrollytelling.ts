/** BlockDef `protection_scrollytelling` — hero frame-sequence pin của
 *  en.protection.gr. Frame trỏ CDN gốc (240 ảnh, hotlink OK). */
import { Layers, ListChecks, Palette, Pilcrow, Type } from 'lucide-react';
import { ProtectionScrollytelling } from '../../ProtectionScrollytelling';
import type { ProtectionScrollytellingContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: ProtectionScrollytellingContent = {
  tagline1: 'engineered to shade',
  tagline2: 'designed to inspire',
  subtitle:
    'Technical shade fabrics engineered for design, performance and presence.',
  framePattern:
    'https://en.protection.gr/wp-content/uploads/2026/03/FABRIC-ANIMATION-HQmmrasd4_{i}.jpg',
  frameCount: 240,
  accent: '#FCC200',
  sections: [
    { title: 'fabrics', more: 'PRINTS, S-LINE, CLASSIC, S-BLOCK, SOLIDS' },
    { title: 'applications', more: 'AWNINGS, PERGOLAS, BLINDS, INTERIORS' },
    { title: 'technology', more: 'BIOTECTION, PROBLOCK, COATINGS' },
    { title: 'about', more: 'COMPANY, NETWORK, SUSTAINABILITY' },
    { title: 'contact', more: 'GET IN TOUCH, FIND A DEALER' },
  ],
};
const EN: ProtectionScrollytellingContent = { ...VI };
export const protectionScrollytellingDef: BlockDef<ProtectionScrollytellingContent> =
  {
    type: 'protection_scrollytelling',
    meta: {
      type: 'protection_scrollytelling',
      label: 'Hero - Frame Scrollytelling',
      accent: '#FCC200',
      adminLabel: 'Hero - Frame Scrollytelling',
      gradient: 'from-amber-100 to-neutral-200',
      defaultName: 'Hero - Frame Scrollytelling',
      aiLabelVi:
        'hero pin canvas 240 frame theo scroll: tagline truot len roi section title cycle, cham cuoi vang',
      aiLabelEn:
        'pinned 240-frame canvas scrollytelling hero: tagline slides up then section titles cycle',
    },
    component: ProtectionScrollytelling,
    defaultContent: { vi: VI, en: EN },
    elements: [
      {
        key: 'tagline',
        label: 'Tagline',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      {
        key: 'framePattern',
        label: 'Frame URL ({i})',
        icon: Layers,
        fieldType: 'text',
      },
      { key: 'subtitle', label: 'Phụ đề', icon: Type, fieldType: 'textarea' },
      { key: 'sections', label: 'Section cycle', icon: ListChecks },
      { key: 'accent', label: 'Màu nhấn', icon: Palette, fieldType: 'text' },
    ],
  };
