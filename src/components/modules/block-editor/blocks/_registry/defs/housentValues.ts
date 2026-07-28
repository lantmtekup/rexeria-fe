/** BlockDef `housent_values` — nền tối, heading trái + card nguyên tắc phải. */
import { ListChecks, Pilcrow, Sparkles, Type } from 'lucide-react';

import { HousentValues } from '../../HousentValues';
import type { HousentValuesContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentValuesContent = {
  eyebrow: 'Our Strategy',
  title: 'The Principles That Guide Our Expertise',
  subtitle:
    'A systematic commitment to architectural quality, data-integrity, and long-term asset security.',
  items: [
    {
      icon: '⛨',
      title: 'Structural Integrity',
      description: '',
    },
    {
      icon: '❑',
      title: 'Absolute Transparency',
      description:
        'Trust is built on clarity. We eliminate complexity through verified documentation and full disclosure on every property transaction.',
    },
    {
      icon: '❧',
      title: 'Sustainable Build',
      description:
        'We prioritize assets that integrate eco-certified materials and climate-resilient engineering, aligning with global sustainability standards.',
    },
    {
      icon: '☺',
      title: 'Personalized Advisory',
      description:
        'Every investor is unique. We adapt our strategy to fit your specific preferences, financial objectives, and acquisition timelines.',
    },
  ],
};
const EN: HousentValuesContent = { ...VI };

export const housentValuesDef: BlockDef<HousentValuesContent> = {
  type: 'housent_values',
  meta: {
    type: 'housent_values',
    label: 'Values - Principle Cards',
    accent: '#e8622c',
    adminLabel: 'Values - Principle Cards',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Values - Principle Cards',
    aiLabelVi:
      'nền tối, 2 cột: tiêu đề lớn bên trái, các card nguyên tắc bên phải (mỗi card gom 2 mục icon + tiêu đề + mô tả)',
    aiLabelEn:
      'dark background, two columns: big heading on the left, principle cards on the right (each card groups 2 items with icon + title + description)',
  },
  component: HousentValues,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Phụ đề', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'items', label: 'Nguyên tắc', icon: ListChecks },
  ],
};
