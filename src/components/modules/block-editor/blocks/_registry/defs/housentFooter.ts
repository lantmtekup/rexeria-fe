/** BlockDef `housent_footer` — footer dark columns. */
import { Columns3, Mail, Type } from 'lucide-react';

import { HousentFooter } from '../../HousentFooter';
import type { HousentFooterContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentFooterContent = {
  brand: 'housent',
  prompt: 'Need assistance? Our team is one message away.',
  email: 'hello@housent.com',
  columns: [
    { title: 'Main', links: ['Home', 'About', 'Listings', 'Contact'] },
    {
      title: 'Resources',
      links: ['Blog', 'Guides', 'FAQ', 'Privacy Policy'],
    },
  ],
  copyright: '© 2026 Housent. All rights reserved.',
};
const EN: HousentFooterContent = { ...VI };

export const housentFooterDef: BlockDef<HousentFooterContent> = {
  type: 'housent_footer',
  meta: {
    type: 'housent_footer',
    label: 'Footer - Dark Columns',
    accent: '#e8622c',
    adminLabel: 'Footer - Dark Columns',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Footer - Dark Columns',
    aiLabelVi:
      'footer nền tối: brand + prompt "cần hỗ trợ?" + nhóm cột link + hàng legal',
    aiLabelEn:
      'dark footer: brand + "need assistance?" prompt + link columns + legal row',
  },
  component: HousentFooter,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'brand', label: 'Brand', icon: Type, fieldType: 'text' },
    { key: 'prompt', label: 'Prompt', icon: Type, fieldType: 'textarea' },
    { key: 'email', label: 'Email', icon: Mail, fieldType: 'text' },
    { key: 'columns', label: 'Cột link', icon: Columns3 },
  ],
};
