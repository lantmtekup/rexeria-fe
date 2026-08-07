import { Image as ImageIcon, Type } from 'lucide-react';

import { FramerRealEstate02Location } from '../../FramerRealEstate02Location';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerRealEstate02LocationContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: FramerRealEstate02LocationContent = {
  heading: 'LOCATION',
  photo1Url: '/realestate02/location-1.jpg',
  photo2Url: '/realestate02/location-2.jpg',
  photo3Url: '/realestate02/location-3.jpg',
};

const ELEMENTS: LayerElement[] = [
  { key: 'heading', label: 'tiêu đề', icon: Type, fieldType: 'text' },
  {
    key: 'photo1Url',
    label: 'ảnh 1 (dưới-trái)',
    icon: ImageIcon,
    fieldType: 'image',
  },
  {
    key: 'photo2Url',
    label: 'ảnh 2 (trên-phải)',
    icon: ImageIcon,
    fieldType: 'image',
  },
  {
    key: 'photo3Url',
    label: 'ảnh 3 (giữa-phải)',
    icon: ImageIcon,
    fieldType: 'image',
  },
];

export const framerRealEstate02LocationDef: BlockDef<FramerRealEstate02LocationContent> =
  {
    type: 'framer_realestate02_location',
    meta: {
      type: 'framer_realestate02_location',
      label: 'RealEstate02 - Location Collage',
      accent: '#c49f8a',
      adminLabel: 'RealEstate02 - Location Collage',
      gradient: 'from-amber-100 to-orange-200',
      defaultName: 'Location Collage',
      aiLabelVi:
        'block "location collage" nền #e9e4dc: mobile card cố định 375×585 với 3 ảnh 178×237 xếp collage dọc (1 dưới-trái, 2 chồng bên phải), wide card 1440×660 đổi thành staircase ngang — heading chiếm ~26% trái, ảnh 1 dính đáy, ảnh 2 dính đỉnh, ảnh 3 dính mép phải ở cao độ giữa; 3 ảnh position-absolute tràn mép cố ý, mỗi ảnh trôi dọc liên tục theo tiến trình cuộn của block, heading "LOCATION" Inter 300 màu #565440 trượt ngang vào từ mép trái 1 lần mỗi khi cuộn vào viewport',
      aiLabelEn:
        '"location collage" block on #e9e4dc background: fixed 375×585 mobile card with 3 178×237 photos in a vertical collage (one lower-left, two stacked right); wide 1440×660 card turns it into a horizontal staircase — heading takes the left ~26%, photo 1 flush to the bottom, photo 2 flush to the top, photo 3 flush to the right edge at mid height; the 3 position-absolute photos deliberately bleed past the edges and drift vertically with the block\'s scroll progress, "LOCATION" heading in Inter 300 #565440 slides in horizontally from the left edge each time it re-enters the viewport',
    },
    component: FramerRealEstate02Location,
    defaultContent: { vi: CONTENT, en: CONTENT },
    elements: ELEMENTS,
  };
