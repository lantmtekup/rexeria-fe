/** BlockDef `firma_footer`. */
import { Link2, Mail, Type } from 'lucide-react';
import { FirmaFooter } from '../../FirmaFooter';
import type { FirmaFooterContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: FirmaFooterContent = {
  title: "Let's create something worth remembering.",
  email: 'hello@firma.studio',
  links: ['Work', 'Studio', 'Journal', 'Contact'],
  copyright: '© 2026 Firma Studio',
};
const EN: FirmaFooterContent = { ...VI };
export const firmaFooterDef: BlockDef<FirmaFooterContent> = {
  type: 'firma_footer',
  meta: {
    type: 'firma_footer',
    label: 'Footer - CTA Serif',
    accent: '#8a7f6a',
    adminLabel: 'Footer - CTA Serif',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Footer - CTA Serif',
    aiLabelVi: 'footer CTA serif lon + email + link',
    aiLabelEn: 'large serif CTA footer + email + links',
  },
  component: FirmaFooter,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'textarea' },
    { key: 'email', label: 'Email', icon: Mail, fieldType: 'text' },
    { key: 'links', label: 'Link', icon: Link2 },
  ],
};
