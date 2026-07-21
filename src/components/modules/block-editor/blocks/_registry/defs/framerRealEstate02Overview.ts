import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import { FramerRealEstate02Overview } from '../../FramerRealEstate02Overview';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerRealEstate02OverviewContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: FramerRealEstate02OverviewContent = {
  title1: 'Over',
  title2: 'View',
  description:
    'Unique high-rise viewing terraces for residents on the usable roof of the 39th floor of each section.',
  subheadingLine1: 'Breathtaking city',
  subheadingLine2: 'panoramas from',
  subheadingLine3: 'every angle',
  towerImageUrl: '/realestate02/overview-tower.jpg',
  personImageUrl: '/realestate02/overview-person.jpg',
  panoramaImageUrl: '/realestate02/overview-panorama.jpg',
};

const ELEMENTS: LayerElement[] = [
  {
    key: 'towerImageUrl',
    label: 'ảnh tòa tháp',
    icon: ImageIcon,
    fieldType: 'image',
  },
  {
    key: 'personImageUrl',
    label: 'ảnh người',
    icon: ImageIcon,
    fieldType: 'image',
  },
  { key: 'title1', label: 'tiêu đề dòng 1', icon: Type, fieldType: 'text' },
  { key: 'title2', label: 'tiêu đề dòng 2', icon: Type, fieldType: 'text' },
  {
    key: 'description',
    label: 'mô tả',
    icon: Pilcrow,
    fieldType: 'textarea',
  },
  {
    key: 'subheadingLine1',
    label: 'heading phụ dòng 1',
    icon: Type,
    fieldType: 'text',
  },
  {
    key: 'subheadingLine2',
    label: 'heading phụ dòng 2',
    icon: Type,
    fieldType: 'text',
  },
  {
    key: 'subheadingLine3',
    label: 'heading phụ dòng 3',
    icon: Type,
    fieldType: 'text',
  },
  {
    key: 'panoramaImageUrl',
    label: 'ảnh panorama',
    icon: ImageIcon,
    fieldType: 'image',
  },
];

export const framerRealEstate02OverviewDef: BlockDef<FramerRealEstate02OverviewContent> =
  {
    type: 'framer_realestate02_overview',
    meta: {
      type: 'framer_realestate02_overview',
      label: 'RealEstate02 - Overview Panorama',
      accent: '#c49f8a',
      adminLabel: 'RealEstate02 - Overview Panorama',
      gradient: 'from-amber-100 to-orange-200',
      defaultName: 'Overview Panorama',
      aiLabelVi:
        'block "overview panorama" card cố định 375×948 nền olive #565440: 2 ảnh top (tháp + người, parallax ngược chiều), heading lớn "Over/View" 64.6px màu #c49f8a, mô tả nhỏ 11px uppercase màu #e9e4dc, heading phụ 3 dòng xếp lệch cố ý tràn 2 mép card, ảnh panorama full-bleed cuối block',
      aiLabelEn:
        '"overview panorama" block: fixed 375×948 card on #565440 olive background — 2 top photos (tower + person, opposite-direction parallax), large 64.6px #c49f8a "Over/View" heading, small 11px uppercase #e9e4dc description, 3-line staggered subheading intentionally bleeding past both card edges, full-bleed panorama photo at the bottom',
    },
    component: FramerRealEstate02Overview,
    defaultContent: { vi: CONTENT, en: CONTENT },
    elements: ELEMENTS,
  };
