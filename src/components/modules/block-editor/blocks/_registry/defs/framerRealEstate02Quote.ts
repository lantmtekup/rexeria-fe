import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import { FramerRealEstate02Quote } from '../../FramerRealEstate02Quote';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerRealEstate02QuoteContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: FramerRealEstate02QuoteContent = {
  name: 'Toan Nguyen',
  role: 'Architect Partner at Kamen Studio',
  quote:
    '“The proportions and rhythm of the façades here exist not only in space, but also in time.”',
  buildingImageUrl: '/realestate02/quote-building.jpg',
  headshotImageUrl: '/realestate02/quote-headshot.png',
};

const ELEMENTS: LayerElement[] = [
  { key: 'name', label: 'tên', icon: Type, fieldType: 'text' },
  { key: 'role', label: 'chức danh', icon: Type, fieldType: 'text' },
  { key: 'quote', label: 'trích dẫn', icon: Pilcrow, fieldType: 'textarea' },
  {
    key: 'buildingImageUrl',
    label: 'ảnh building',
    icon: ImageIcon,
    fieldType: 'image',
  },
  {
    key: 'headshotImageUrl',
    label: 'ảnh chân dung',
    icon: ImageIcon,
    fieldType: 'image',
  },
];

export const framerRealEstate02QuoteDef: BlockDef<FramerRealEstate02QuoteContent> =
  {
    type: 'framer_realestate02_quote',
    meta: {
      type: 'framer_realestate02_quote',
      label: 'RealEstate02 - Architect Quote',
      accent: '#c49f8a',
      adminLabel: 'RealEstate02 - Architect Quote',
      gradient: 'from-amber-100 to-orange-200',
      defaultName: 'Architect Quote',
      aiLabelVi:
        'block "quote kiến trúc sư" testimonial: card cố định 375×567 nền #2c2926, header tên + chức danh màu #c49f8a/#66634d, trích dẫn 3 dòng màu #c49f8a, ảnh building crop 234×282 và ảnh headshot 94×129 chồng lên góc dưới-trái',
      aiLabelEn:
        '"architect quote" testimonial block: fixed 375×567 card on #2c2926 background, name + role header in #c49f8a/#66634d, 3-line quote in #c49f8a, cropped 234×282 building photo with a 94×129 headshot overlapping its bottom-left corner',
    },
    component: FramerRealEstate02Quote,
    defaultContent: { vi: CONTENT, en: CONTENT },
    elements: ELEMENTS,
  };
