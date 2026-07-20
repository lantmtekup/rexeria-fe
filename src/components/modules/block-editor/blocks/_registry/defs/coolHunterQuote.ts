/**
 * BlockDef cho `cool_hunter_quote` — quote Cool Hunter: câu trích dẫn giữa +
 * ảnh kéo từ phải phủ màn (veil nhạt dần). Port từ apps/cool-hunter
 * QuoteSection.tsx. Path A registry.
 */
import { Image as ImageIcon, Tag, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CoolHunterQuoteContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: CoolHunterQuoteContent = {
  quote:
    '“Modern without being cold, rooted without being backward-looking, and entirely alive to the extraordinary setting it inhabits.”',
  imageUrl: '/cool-hunter/section-6.png',
  imageAlt:
    'A stone patio with charred-wood chairs, a round table and a built-in bench',
  label: '04 - Interior Design',
};

const EN: CoolHunterQuoteContent = {
  ...VI,
};

export const coolHunterQuoteDef: BlockDef<CoolHunterQuoteContent> = {
  type: 'cool_hunter_quote',
  meta: {
    type: 'cool_hunter_quote',
    label: 'Cool Hunter · Quote',
    accent: '#e8e3d8',
    adminLabel: 'Cool Hunter Quote',
    gradient: 'from-stone-300 to-neutral-700',
    defaultName: 'Cool Hunter Quote',
    aiLabelVi:
      'quote Cool Hunter: câu trích dẫn giữa + ảnh kéo từ phải phủ màn (veil nhạt dần)',
    aiLabelEn:
      'Cool Hunter quote: centered pull-quote covered by image wipe from the right (veil fades)',
  },
  component: dynamic(() =>
    import('../../CoolHunterQuote').then(m => m.CoolHunterQuote)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'quote',
      label: 'Quote',
      icon: Type,
      fieldType: 'textarea',
      groupId: 'copy',
      groupLabel: 'Nội dung',
    },
    {
      key: 'imageUrl',
      label: 'Ảnh phủ',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'media',
      groupLabel: 'Ảnh',
    },
    {
      key: 'label',
      label: 'Nhãn dọc',
      icon: Tag,
      fieldType: 'text',
    },
  ],
};
