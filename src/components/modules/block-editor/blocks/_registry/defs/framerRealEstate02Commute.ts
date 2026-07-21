import { Hash, Image as ImageIcon, MapPin, Type } from 'lucide-react';

import { FramerRealEstate02Commute } from '../../FramerRealEstate02Commute';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerRealEstate02CommuteContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: FramerRealEstate02CommuteContent = {
  eyebrow: 'MINUTES FOR WALK',
  heading: 'TO THE RIVERBAL ENTERTAINMENT AREA',
  walkMinutes: '15',
  carHeading: 'BY CAR',
  row1Value: '10',
  row1Label: 'TO\nGARDEN',
  row2Value: '15',
  row2Label: 'TO\nUNIVERSITY',
  row3Value: '20',
  row3Label: 'TO\nPARK',
  carPhotoUrl:
    'https://framerusercontent.com/images/cVLAGC5qo3OZO2hI331QKLNkFoo.png',
};

const rowElements = (n: 1 | 2 | 3): LayerElement[] => {
  const groupId = `row${n}`;
  return [
    {
      key: `row${n}Value`,
      label: 'số phút',
      groupId,
      groupLabel: `Dòng ${n}`,
      icon: Hash,
      fieldType: 'text',
    },
    {
      key: `row${n}Label`,
      label: 'địa điểm',
      groupId,
      icon: MapPin,
      fieldType: 'text',
    },
  ];
};

const ELEMENTS: LayerElement[] = [
  { key: 'eyebrow', label: 'eyebrow', icon: Type, fieldType: 'text' },
  { key: 'heading', label: 'tiêu đề', icon: Type, fieldType: 'text' },
  { key: 'walkMinutes', label: 'số phút đi bộ', icon: Hash, fieldType: 'text' },
  {
    key: 'carHeading',
    label: 'heading "by car"',
    icon: Type,
    fieldType: 'text',
  },
  ...rowElements(1),
  ...rowElements(2),
  ...rowElements(3),
  {
    key: 'carPhotoUrl',
    label: 'ảnh xe',
    icon: ImageIcon,
    fieldType: 'image',
  },
];

export const framerRealEstate02CommuteDef: BlockDef<FramerRealEstate02CommuteContent> =
  {
    type: 'framer_realestate02_commute',
    meta: {
      type: 'framer_realestate02_commute',
      label: 'RealEstate02 - Commute Stats',
      accent: '#c49f8a',
      adminLabel: 'RealEstate02 - Commute Stats',
      gradient: 'from-amber-100 to-orange-200',
      defaultName: 'Commute Stats',
      aiLabelVi:
        'block "commute stats" card cố định 375×1038 nền #e9e4dc: vòng tròn tiến trình + số đếm lớn 80px chạy 0→N phút đi bộ (đếm lại mỗi lần cuộn vào viewport), heading mô tả điểm đến, section "BY CAR" màu #c49f8a với ảnh xe top-down + list 3 dòng số phút/tên địa điểm có đường kẻ chia, mọi chữ hiện theo từng ký tự khi cuộn tới',
      aiLabelEn:
        '"commute stats" block: fixed 375×1038 card on #e9e4dc background — radial progress ring + large 80px count-up (0→N walk minutes, replays every time it re-enters the viewport), destination heading, #c49f8a "BY CAR" section with a top-down car photo + a 3-row minutes/destination list with divider lines, every text label revealing character-by-character on scroll',
    },
    component: FramerRealEstate02Commute,
    defaultContent: { vi: CONTENT, en: { ...CONTENT } },
    elements: ELEMENTS,
  };
