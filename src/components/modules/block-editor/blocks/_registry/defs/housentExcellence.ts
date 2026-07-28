/** BlockDef `housent_excellence` — hàng card ảnh tòa nhà. */
import { Hash, Sparkles, Type } from 'lucide-react';

import { HousentExcellence } from '../../HousentExcellence';
import type { HousentExcellenceContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentExcellenceContent = {
  eyebrow: 'Why Housent',
  title: 'Our Excellence',
  items: [
    {
      image:
        'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9ac2b44a8b6994e559_About%20Gallery%20%281%29.webp',
      label: 'Market Authority',
      value: '15+ Yrs',
    },
    {
      image:
        'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9a3290ebbfac062548_About%20Gallery%20%283%29.webp',
      label: 'Retention Rate',
      value: '98%',
    },
    {
      image:
        'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9ac4ba3d0d8aaad504_About%20Gallery%20%284%29.webp',
      label: 'Dedicated Support',
      value: '24/7',
    },
    {
      image:
        'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9a4fca8fc4ddbcf774_About%20Gallery%20%286%29.webp',
      label: 'Assets Managed',
      value: '$500M+',
    },
  ],
};
const EN: HousentExcellenceContent = { ...VI };

export const housentExcellenceDef: BlockDef<HousentExcellenceContent> = {
  type: 'housent_excellence',
  meta: {
    type: 'housent_excellence',
    label: 'Excellence - Image Cards',
    accent: '#e8622c',
    adminLabel: 'Excellence - Image Cards',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Excellence - Image Cards',
    aiLabelVi:
      'hàng card ảnh tòa nhà bo góc trên nền tối: mỗi card có nhãn nhỏ + số liệu lớn ở đáy',
    aiLabelEn:
      'row of rounded building-image cards on dark background: each card has a small label + big metric at the bottom',
  },
  component: HousentExcellence,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Card', icon: Hash },
  ],
};
