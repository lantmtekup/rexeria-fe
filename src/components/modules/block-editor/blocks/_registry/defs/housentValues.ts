/** BlockDef `housent_values` — principle stack. */
import { ListChecks, Sparkles, Type } from 'lucide-react';

import { HousentValues } from '../../HousentValues';
import type { HousentValuesContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentValuesContent = {
  eyebrow: 'Our Principles',
  title: 'The Principles That Guide Our Expertise',
  items: [
    {
      title: 'Integrity first',
      description:
        'We only recommend what we would choose for our own families.',
    },
    {
      title: 'Radical transparency',
      description: 'Every number, every clause, explained in plain language.',
    },
    {
      title: 'Long-term value',
      description:
        'We optimise for the home you love years from now, not just today.',
    },
    {
      title: 'Relentless service',
      description: 'Available whenever a decision needs to be made.',
    },
  ],
};
const EN: HousentValuesContent = { ...VI };

export const housentValuesDef: BlockDef<HousentValuesContent> = {
  type: 'housent_values',
  meta: {
    type: 'housent_values',
    label: 'Values - Principle Stack',
    accent: '#e8622c',
    adminLabel: 'Values - Principle Stack',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Values - Principle Stack',
    aiLabelVi: 'stack nguyên tắc: số thứ tự + tiêu đề + mô tả, hàng phân cách',
    aiLabelEn: 'principle stack: index + title + description in divided rows',
  },
  component: HousentValues,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Nguyên tắc', icon: ListChecks },
  ],
};
