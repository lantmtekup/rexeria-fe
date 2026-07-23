import { Image as ImageIcon, Type } from 'lucide-react';

import { FramerRealEstate02Menu } from '../../FramerRealEstate02Menu';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerRealEstate02MenuContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: FramerRealEstate02MenuContent = {
  label: 'apartment',
  menuIconUrl: '/realestate02/menu-icon.svg',
};

const ELEMENTS: LayerElement[] = [
  {
    key: 'label',
    label: 'nhãn',
    icon: Type,
    fieldType: 'text',
  },
  {
    key: 'menuIconUrl',
    label: 'icon menu',
    icon: ImageIcon,
    fieldType: 'image',
  },
];

export const framerRealEstate02MenuDef: BlockDef<FramerRealEstate02MenuContent> =
  {
    type: 'framer_realestate02_menu',
    meta: {
      type: 'framer_realestate02_menu',
      label: 'RealEstate02 - Menu',
      accent: '#c49f8a',
      adminLabel: 'RealEstate02 - Menu',
      gradient: 'from-amber-100 to-orange-200',
      defaultName: 'Menu',
      aiLabelVi:
        'block "menu" navigation bar dạng pill: flex row chứa label dropdown (chữ Inter 11px uppercase #565440 trên nền tròn #e9e4dc viền #c49f8a border-radius 20px) bên trái + icon hamburger 3 gạch trong circle #e9e4dc viền #c49f8a bên phải; chữ hiện từng ký tự stagger 75ms khi vào viewport',
      aiLabelEn:
        '"menu" navigation pill block: flex row with a label pill (Inter 11px uppercase #565440 on #e9e4dc circle with #c49f8a border-radius 20px) on the left + a 3-line hamburger icon inside an #e9e4dc circle with #c49f8a border on the right; text reveals character-by-character with 75ms stagger on scroll-into-view',
    },
    component: FramerRealEstate02Menu,
    defaultContent: { vi: CONTENT, en: CONTENT },
    elements: ELEMENTS,
  };
