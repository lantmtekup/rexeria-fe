/** BlockDef `readymag_footer`. */
import { Link2, Type } from 'lucide-react';
import { ReadymagFooter } from '../../ReadymagFooter';
import type { ReadymagFooterContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: ReadymagFooterContent = {
  brand: 'RADIUS',
  links: ['Index', 'Collection', 'Contact', 'Menu'],
  copyright: '© 2026 Radius Studio',
};
const EN: ReadymagFooterContent = { ...VI };
export const readymagFooterDef: BlockDef<ReadymagFooterContent> = {
  type: 'readymag_footer',
  meta: {
    type: 'readymag_footer',
    label: 'Footer - Big Wordmark',
    accent: '#000000',
    adminLabel: 'Footer - Big Wordmark',
    gradient: 'from-neutral-100 to-neutral-300',
    defaultName: 'Footer - Big Wordmark',
    aiLabelVi: 'wordmark khong lo + link nen trang vien den',
    aiLabelEn: 'giant wordmark + links white with black border',
  },
  component: ReadymagFooter,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'brand', label: 'Wordmark', icon: Type, fieldType: 'text' },
    { key: 'links', label: 'Link', icon: Link2 },
  ],
};
