/** BlockDef `nordhaven_footer`. */
import { Link2, Type } from 'lucide-react';
import { NordhavenFooter } from '../../NordhavenFooter';
import type { NordhavenFooterContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: NordhavenFooterContent = {
  brand: 'NORDHAVEN',
  links: ['Home', 'About', 'Projects', 'Contact'],
  copyright: '© 2026 Nordhaven Studio. All rights reserved.',
};
const EN: NordhavenFooterContent = { ...VI };
export const nordhavenFooterDef: BlockDef<NordhavenFooterContent> = {
  type: 'nordhaven_footer',
  meta: {
    type: 'nordhaven_footer',
    label: 'Footer - Wordmark',
    accent: '#111111',
    adminLabel: 'Footer - Wordmark',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Footer - Wordmark',
    aiLabelVi: 'footer nền đen: wordmark lớn + link + legal',
    aiLabelEn: 'dark footer: big wordmark + links + legal',
  },
  component: NordhavenFooter,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'brand', label: 'Wordmark', icon: Type, fieldType: 'text' },
    { key: 'links', label: 'Link', icon: Link2 },
  ],
};
