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
        'block "gallery tiện ích" card cố định 375×704, nền trong suốt: tiêu đề lớn 2 dòng "INFRAS/TRUCTURE" màu #c49f8a, slider 4 ảnh tiện ích 307×307 (gap 12px, hé lộ ảnh kế tiếp), 2 nút tròn 35×35 viền #c49f8a điều hướng trước/sau, bộ đếm "N/4" màu #e9e4dc',
      aiLabelEn:
        '"infrastructure gallery" block: fixed 375×704 card, transparent background — large 2-line "INFRAS/TRUCTURE" heading in #c49f8a, 4-image amenity slider (307×307, 12px gap, peeking next image), two 35×35 circular #c49f8a-bordered prev/next buttons, "N/4" counter in #e9e4dc',
    },
    component: FramerRealEstate02Gallery,
    defaultContent: { vi: CONTENT, en: CONTENT },
    elements: ELEMENTS,
  };
