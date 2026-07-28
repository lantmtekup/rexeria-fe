/**
 * BlockDef cho `the_grand_intro` — section editorial nền nâu The Grand
 * (heading serif + description căn giữa, tượng sư tử neo đáy, entrance fade-up).
 * Port từ apps/the-grand Intro. Path A registry.
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { TheGrandIntroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: TheGrandIntroContent = {
  heading: 'Sự Hoà Quyện Tinh Tế Của Vẻ Đẹp Vượt Thời Gian',
  description:
    'Đơn giản là đỉnh cao của sự tinh tế. Mỗi căn hộ hàng hiệu Ritz-Carlton tại The Grand là minh chứng đích thực của giá trị thẩm mỹ tinh tuý nhất. Từng chi tiết nhỏ được trau chuốt tỉ mỉ để chủ nhân luôn cảm nhận được sự ấm áp mỗi khi trở về nhà sau những tất bật của cuộc sống.',
  imageUrl: '/the-grand/lion-artwork.png',
  imageAlt: 'The Grand sculpture',
};

const EN: TheGrandIntroContent = {
  heading: 'A Refined Harmony of Timeless Beauty',
  description:
    'Simplicity is the ultimate sophistication. Each Ritz-Carlton branded residence at The Grand is a true testament to the finest aesthetic values. Every small detail is meticulously crafted so that owners always feel the warmth of coming home after the rush of daily life.',
  imageUrl: '/the-grand/lion-artwork.png',
  imageAlt: 'The Grand sculpture',
};

export const theGrandIntroDef: BlockDef<TheGrandIntroContent> = {
  type: 'the_grand_intro',
  meta: {
    type: 'the_grand_intro',
    label: 'The Grand · Intro',
    accent: '#5a3d29',
    adminLabel: 'The Grand Intro',
    gradient: 'from-amber-900 to-stone-900',
    defaultName: 'The Grand Intro',
    aiLabelVi:
      'section giới thiệu The Grand: nền nâu gradient, tiêu đề serif + mô tả căn giữa, tượng sư tử neo đáy, entrance fade-up',
    aiLabelEn:
      'The Grand intro section: brown gradient backdrop, centered serif title + copy, bottom sculpture, fade-up entrance',
  },
  component: dynamic(() =>
    import('../../TheGrandIntro').then(m => m.TheGrandIntro)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    {
      key: 'description',
      label: 'Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'imageUrl',
      label: 'Ảnh tượng',
      icon: ImageIcon,
      fieldType: 'image',
    },
  ],
};
