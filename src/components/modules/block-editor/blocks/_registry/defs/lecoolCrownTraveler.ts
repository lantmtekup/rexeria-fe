/**
 * BlockDef cho `lecool_crown_traveler` — lớp phủ toàn trang: một vương miện bay
 * qua mọi `[data-crown-slot]` theo scroll.
 * Port từ apps/ecommerce-landing CrownTraveler.tsx. Path A registry.
 *
 * Không có mảng → LayersPanel không cần expand. Thứ tự điểm dừng lấy theo DOM
 * nên cũng không có field khai danh sách.
 */
import { Crown } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LecoolCrownTravelerContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: LecoolCrownTravelerContent = {
  crownUrl: '/lecool/hero-emblem.png',
  crownWidth: 159,
};

const EN: LecoolCrownTravelerContent = { ...VI };

export const lecoolCrownTravelerDef: BlockDef<LecoolCrownTravelerContent> = {
  type: 'lecool_crown_traveler',
  meta: {
    type: 'lecool_crown_traveler',
    label: 'Le Cool Move · Crown Traveler',
    accent: '#B68D45',
    adminLabel: 'Le Cool Move Crown Traveler',
    gradient: 'from-amber-300 to-amber-800',
    defaultName: 'Le Cool Move Crown Traveler',
    aiLabelVi:
      'lớp phủ toàn trang: một vương miện bay lần lượt qua các điểm dừng của những block Le Cool Move khác theo scroll, ẩn các vương miện tĩnh đi',
    aiLabelEn:
      'page-wide overlay: a single crown flies between the crown slots of the other Le Cool Move blocks as you scroll, hiding the static crowns',
  },
  component: dynamic(() =>
    import('../../LecoolCrownTraveler').then(m => m.LecoolCrownTraveler)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'crownUrl', label: 'Vương miện', icon: Crown, fieldType: 'image' },
  ],
};
