import { Type } from 'lucide-react';

import { BrutalistText } from '../../BrutalistText';
import type { BrutalistTextContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: BrutalistTextContent = {
  heading: 'BRUTALISM',
  echoCount: 3,
  layerStep: 0.09,
  textColor: '#FFFFFF',
  bgColor: '#000000',
};

const EN: BrutalistTextContent = {
  ...VI,
};

export const brutalistTextDef: BlockDef<BrutalistTextContent> = {
  type: 'brutalist_text',
  meta: {
    type: 'brutalist_text',
    label: 'Brutalist Text',
    accent: '#000000',
    adminLabel: 'Brutalist Text',
    gradient: 'from-neutral-900 to-black',
    defaultName: 'Brutalist Text',
    aiLabelVi:
      'tiêu đề brutalist uppercase đậm, trail echo opacity xếp chồng trên nền đen',
    aiLabelEn:
      'bold uppercase brutalist heading with stacked opacity echo trail on black',
  },
  component: BrutalistText,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
  ],
};
