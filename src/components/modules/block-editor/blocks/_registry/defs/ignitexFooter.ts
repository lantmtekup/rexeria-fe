/** BlockDef `ignitex_footer`. */
import { Link2, Mail, Type } from 'lucide-react';
import { IgnitexFooter } from '../../IgnitexFooter';
import type { IgnitexFooterContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: IgnitexFooterContent = {
  brand: 'IGNITEX',
  email: 'hello@ignitex.studio',
  links: ['Home', 'About us', 'Projects', 'Contact'],
  copyright: '© 2026 Ignitex creative agency',
};
const EN: IgnitexFooterContent = { ...VI };
export const ignitexFooterDef: BlockDef<IgnitexFooterContent> = {
  type: 'ignitex_footer',
  meta: {
    type: 'ignitex_footer',
    label: 'Footer - Wordmark',
    accent: '#111111',
    adminLabel: 'Footer - Wordmark',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Footer - Wordmark',
    aiLabelVi: 'wordmark + email + link + legal nen toi',
    aiLabelEn: 'wordmark + email + links + legal on dark',
  },
  component: IgnitexFooter,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'brand', label: 'Wordmark', icon: Type, fieldType: 'text' },
    { key: 'email', label: 'Email', icon: Mail, fieldType: 'text' },
    { key: 'links', label: 'Link', icon: Link2 },
  ],
};
