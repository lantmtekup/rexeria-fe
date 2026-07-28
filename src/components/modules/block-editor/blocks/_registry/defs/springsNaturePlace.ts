/**
 * BlockDef cho `springs_nature_place` — gộp 2 slide sticky-scroll liền kề của
 * springs-estate-clone: `#nature` (dòng ~3217) rồi `#place` (dòng ~3838),
 * mỗi slide là 1 panel full-bleed xếp chồng dọc (không replicate pin gốc).
 * Component: `blocks/SpringsNaturePlace.tsx`.
 *
 * Ảnh dùng thẳng origin `springs.estate` (không self-host lại):
 *  - natureImage: 3.nature/nature-caption@xxxl.webp (full-bleed nature bg gốc)
 *  - placeImage:  4.place/place-bg-1@xxxl.webp (full-bleed place bg gốc, 1440x900 cover)
 */
import {
  Image as ImageIcon,
  MapPin,
  Pilcrow,
  Quote,
  Trees,
} from 'lucide-react';

import { SpringsNaturePlace } from '../../SpringsNaturePlace';
import type { SpringsNaturePlaceContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: SpringsNaturePlaceContent = {
  natureHeading: 'Thiên nhiên',
  natureDescription:
    'Đắm mình trong vòng tay thiên nhiên, tách biệt khỏi thế giới ồn ào bên ngoài. Những giàn cây leo trên mái, lối hoa uốn lượn, thảm cỏ xanh ngọc bích. Springs cho bạn học lại nghệ thuật của sự thư thái.',
  natureImage:
    'https://springs.estate/assets/images/media/landing/3.nature/nature-caption@xxxl.webp',
  placeHeading: 'Không gian',
  placeDescription:
    'Hít thở bầu không khí trong lành và không gian rộng mở. Bạn muốn chạy bộ? Đừng ngần ngại. Khi sải bước dọc theo bờ kè, hãy tận hưởng vạn hoa cảnh sắc đổi thay khiến bạn không khỏi ấn tượng. Tự đặt nhịp độ của mình và thay đổi theo ý thích.',
  placeCaption:
    'Dễ dàng tiếp cận Công viên Nature Park. Khung cảnh dịu dàng như tranh màu nước, chỉ thuộc về riêng bạn.',
  placeImage:
    'https://springs.estate/assets/images/media/landing/4.place/place-bg-1@xxxl.webp',
};

const EN: SpringsNaturePlaceContent = {
  natureHeading: 'Nature',
  natureDescription:
    "Enjoy nature's embrace that shields you from the world outside. Climbing rooftop plants, winding layouts of flowerbeds, emerald lawns. Springs lets you learn the art of leisure.",
  natureImage:
    'https://springs.estate/assets/images/media/landing/3.nature/nature-caption@xxxl.webp',
  placeHeading: 'Place',
  placeDescription:
    "Breathe in the air and open space. Do you feel like running? Don't hold back. As you are running along the embankment, delight in the kaleidoscope of shifting panoramas that will leave you impressed. Set your pace and change it at your desire.",
  placeCaption:
    'Easy access to Nature Park. Landscapes of watercolor tenderness that belong only to you.',
  placeImage:
    'https://springs.estate/assets/images/media/landing/4.place/place-bg-1@xxxl.webp',
};

export const springsNaturePlaceDef: BlockDef<SpringsNaturePlaceContent> = {
  type: 'springs_nature_place',
  meta: {
    type: 'springs_nature_place',
    label: 'Springs - Nature & Place',
    accent: '#1c2b1e',
    adminLabel: 'Springs - Nature & Place',
    gradient: 'from-emerald-950 to-stone-800',
    defaultName: 'Springs - Nature & Place',
    aiLabelVi:
      '2 panel full-bleed xếp chồng: "Nature" (ảnh thiên nhiên + mô tả) rồi "Place" (ảnh không gian sống + mô tả + caption), mỗi panel tự reveal khi cuộn tới',
    aiLabelEn:
      'two stacked full-bleed panels: "Nature" (nature imagery + copy) then "Place" (surrounding-area imagery + copy + caption), each panel reveals independently on scroll',
  },
  component: SpringsNaturePlace,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'natureImage',
      label: 'Ảnh nền - Nature',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'natureHeading',
      label: 'Tiêu đề - Nature',
      icon: Trees,
      fieldType: 'text',
    },
    {
      key: 'natureDescription',
      label: 'Mô tả - Nature',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'placeImage',
      label: 'Ảnh nền - Place',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'placeHeading',
      label: 'Tiêu đề - Place',
      icon: MapPin,
      fieldType: 'text',
    },
    {
      key: 'placeDescription',
      label: 'Mô tả - Place',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'placeCaption',
      label: 'Chú thích - Place',
      icon: Quote,
      fieldType: 'textarea',
    },
  ],
};
