import { Image as ImageIcon } from 'lucide-react';

import { FramerRealEstate02Map } from '../../FramerRealEstate02Map';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerRealEstate02MapContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: FramerRealEstate02MapContent = {
  mapImageUrl: '/realestate02/map.svg',
};

const ELEMENTS: LayerElement[] = [
  {
    key: 'mapImageUrl',
    label: 'ảnh bản đồ',
    icon: ImageIcon,
    fieldType: 'image',
  },
];

export const framerRealEstate02MapDef: BlockDef<FramerRealEstate02MapContent> =
  {
    type: 'framer_realestate02_map',
    meta: {
      type: 'framer_realestate02_map',
      category: 'location',
      style: 'modern',
      tags: ['clone', 'framer', 'real-estate', 'location', 'map'],
      status: 'ready',
      responsive: true,
      updatedAt: '2026-07-21',
      label: 'RealEstate02 - Location Map',
      accent: '#c49f8a',
      adminLabel: 'RealEstate02 - Location Map',
      gradient: 'from-amber-100 to-orange-200',
      defaultName: 'Location Map',
      aiLabelVi:
        'block "location map" nền #e9e4dc: mobile card 375×359 — 1 ảnh minh hoạ bản đồ tĩnh full-bleed (đường + công viên + 4 pin phụ vẽ sẵn trong ảnh) cùng 1 marker "R" lớn overlay màu #565440 bập bênh liên tục lên xuống ~5px; wide (≥672) card 1440×720, ảnh cover full card, marker % giữ nguyên',
      aiLabelEn:
        '"location map" block on #e9e4dc: mobile 375×359 card — one full-bleed static map illustration (roads + parks + 4 secondary pins baked into the image) with one large overlay "R" marker in #565440 continuously bobbing ~5px; wide (≥672) expands to 1440×720, map cover-fills card, marker % unchanged',
    },
    component: FramerRealEstate02Map,
    defaultContent: { vi: CONTENT, en: CONTENT },
    elements: ELEMENTS,
  };
