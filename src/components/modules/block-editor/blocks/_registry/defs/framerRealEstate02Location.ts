import { Image as ImageIcon, Type } from 'lucide-react';

import { FramerRealEstate02Location } from '../../FramerRealEstate02Location';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerRealEstate02LocationContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: FramerRealEstate02LocationContent = {
  heading: 'LOCATION',
  photo1Url:
    'https://framerusercontent.com/images/vpATnKpHXX2VVDvSiNXqq1Brqw.jpg',
  photo2Url:
    'https://framerusercontent.com/images/PYtNBawJs0Dt1NGlkZLZWLNng.jpg',
  photo3Url:
    'https://framerusercontent.com/images/BbtoS0cV5jvSvM4oCt8dAHQsh4.jpg',
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
        'block "location collage" card cố định 375×585 nền #e9e4dc: 3 ảnh position-absolute tràn mép trái/phải cố ý, mỗi ảnh trôi liên tục theo scrollY tuyệt đối (ảnh dưới-trái hệ số -0.1, 2 ảnh phải hệ số +0.1), heading "LOCATION" Inter 300 72px màu #565440 tràn mép trái, trượt ngang 1 lần mỗi khi cuộn vào viewport',
      aiLabelEn:
        '"location collage" block: fixed 375×585 card on #e9e4dc background — 3 position-absolute photos deliberately bleeding past the left/right edges, each drifting continuously with raw absolute scrollY (lower-left photo factor -0.1, the other two +0.1), "LOCATION" heading in Inter 300 72px #565440 bleeding off the left edge, sliding in horizontally each time it re-enters the viewport',
    },
    component: FramerRealEstate02Location,
    defaultContent: { vi: CONTENT, en: CONTENT },
    elements: ELEMENTS,
  };
