/** BlockDef `housent_excellence` — numbered excellence list. */
import { ListChecks, Sparkles, Type } from 'lucide-react';

import { HousentExcellence } from '../../HousentExcellence';
import type { HousentExcellenceContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentExcellenceContent = {
  eyebrow: 'Why Housent',
  title: 'Our Excellence',
  items: [
    {
      title: 'Verified inventory',
      description:
        'Every listing is inspected and title-checked before it reaches you.',
    },
    {
      title: 'Transparent pricing',
      description:
        'No hidden fees — you see the full picture from the first conversation.',
    },
    {
      title: 'Dedicated advisors',
      description: 'One point of contact who knows your search inside out.',
    },
    {
      title: 'Seamless closing',
      description: 'Legal, finance and paperwork handled end to end.',
    },
  ],
};
const EN: HousentExcellenceContent = { ...VI };

export const housentExcellenceDef: BlockDef<HousentExcellenceContent> = {
  type: 'housent_excellence',
  meta: {
    type: 'housent_excellence',
    label: 'Excellence - Numbered List',
    accent: '#e8622c',
    adminLabel: 'Excellence - Numbered List',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Excellence - Numbered List',
    aiLabelVi: 'danh sách ưu điểm đánh số trong vòng tròn trên nền tối',
    aiLabelEn:
      'numbered excellence list with circular indices on a dark background',
  },
  component: HousentExcellence,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Ưu điểm', icon: ListChecks },
  ],
};
