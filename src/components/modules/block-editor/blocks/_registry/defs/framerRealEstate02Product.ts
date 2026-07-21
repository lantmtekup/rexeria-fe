import { Image as ImageIcon, Pilcrow } from 'lucide-react';

import { FramerRealEstate02Product } from '../../FramerRealEstate02Product';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerRealEstate02ProductContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: FramerRealEstate02ProductContent = {
  bodyText:
    "The landscape at here is anything but ostentatious, and the greenery is not confined by rigid boundaries. Here, bushes aren't trimmed with measuring sticks. Ferns are not banned from brushing against people's feet as they pass. Across the porches and courtyards of Eniteo, the landscaping has been recreated to feel effortlessly natural — and this is how they express their genuine respect for nature.",
  photoUrl:
    'https://framerusercontent.com/images/H9o7sklDyJQKV6saynxfX2NXeQ.jpg',
};

const ELEMENTS: LayerElement[] = [
  {
    key: 'photoUrl',
    label: 'ảnh',
    icon: ImageIcon,
    fieldType: 'image',
  },
  {
    key: 'bodyText',
    label: 'mô tả',
    icon: Pilcrow,
    fieldType: 'textarea',
  },
];

export const framerRealEstate02ProductDef: BlockDef<FramerRealEstate02ProductContent> =
  {
    type: 'framer_realestate02_product',
    meta: {
      type: 'framer_realestate02_product',
      label: 'RealEstate02 - Landscape Editorial',
      accent: '#c49f8a',
      adminLabel: 'RealEstate02 - Landscape Editorial',
      gradient: 'from-amber-100 to-orange-200',
      defaultName: 'Landscape Editorial',
      aiLabelVi:
        'block editorial "landscape" card cố định 375×443 nền #c49f8a: ảnh mask-reveal 281×187 sát góc trên-phải (trượt lên 112px khi vào viewport), đoạn mô tả uppercase #2c2926 11px bên dưới cách 32px, gutter trái 94px để trống',
      aiLabelEn:
        'fixed 375×443 "landscape" editorial card on #c49f8a background: 281×187 mask-reveal photo flush to the top-right (slides up 112px on scroll-into-view), uppercase #2c2926 11px description below with a 32px gap, 94px empty left gutter',
    },
    component: FramerRealEstate02Product,
    defaultContent: { vi: CONTENT, en: CONTENT },
    elements: ELEMENTS,
  };
