import { Image as ImageIcon, Pilcrow } from 'lucide-react';

import { FramerRealEstate02Gallery } from '../../FramerRealEstate02Gallery';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerRealEstate02GalleryContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: FramerRealEstate02GalleryContent = {
  heading: 'Infras\nTructure',
  image1Url: '/realestate02/gallery-1.png',
  image2Url: '/realestate02/gallery-2.png',
  image3Url: '/realestate02/gallery-3.png',
  image4Url: '/realestate02/gallery-4.png',
};

const ELEMENTS: LayerElement[] = [
  {
    key: 'heading',
    label: 'tiêu đề (2 dòng)',
    icon: Pilcrow,
    fieldType: 'textarea',
  },
  {
    key: 'image1Url',
    label: 'ảnh 1',
    icon: ImageIcon,
    fieldType: 'image',
    groupId: 'images',
    groupLabel: 'Ảnh tiện ích',
  },
  {
    key: 'image2Url',
    label: 'ảnh 2',
    icon: ImageIcon,
    fieldType: 'image',
    groupId: 'images',
  },
  {
    key: 'image3Url',
    label: 'ảnh 3',
    icon: ImageIcon,
    fieldType: 'image',
    groupId: 'images',
  },
  {
    key: 'image4Url',
    label: 'ảnh 4',
    icon: ImageIcon,
    fieldType: 'image',
    groupId: 'images',
  },
];

export const framerRealEstate02GalleryDef: BlockDef<FramerRealEstate02GalleryContent> =
  {
    type: 'framer_realestate02_gallery',
    meta: {
      type: 'framer_realestate02_gallery',
      label: 'RealEstate02 - Infrastructure Gallery',
      accent: '#c49f8a',
      adminLabel: 'RealEstate02 - Infrastructure Gallery',
      gradient: 'from-amber-100 to-orange-200',
      defaultName: 'Infrastructure Gallery',
      aiLabelVi:
        'block "gallery tiện ích" 2 tier: mobile card 375×704 giữ pixel Framer; desktop (≥672) card 1440×900 — tiêu đề 2 dòng "INFRAS/TRUCTURE" #c49f8a neo trên-trái (không đè ảnh), slider 4 ảnh vuông (hé lộ ảnh kế, nút prev/next dùng được), bộ đếm "N/4" #e9e4dc',
      aiLabelEn:
        '"infrastructure gallery" 2-tier block: mobile 375×704 Framer-exact; desktop (≥672) 1440×900 card — 2-line "INFRAS/TRUCTURE" #c49f8a top-left (clear of images), 4-image square slider with working prev/next, "N/4" counter #e9e4dc',
    },
    component: FramerRealEstate02Gallery,
    defaultContent: { vi: CONTENT, en: CONTENT },
    elements: ELEMENTS,
  };
