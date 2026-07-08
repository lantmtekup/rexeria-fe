/**
 * BlockDef cho `springs_intro` — port section `.l-intro__content` gốc
 * (`#about`, sub-layer 2 của pin Hero): câu tuyên ngôn lớn serif + đoạn mô
 * tả phụ + 1 ảnh đi kèm (gốc `opening-2`), layout 2 cột text/ảnh.
 * Component: `blocks/SpringsIntro.tsx`.
 */
import { Heading, Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import { SpringsIntro } from '../../SpringsIntro';
import type { SpringsIntroContent } from '../../../types';
import type { BlockDef } from '../types';

/** Ảnh đi kèm câu tuyên ngôn (gốc `opening-2`, dùng chung asset local với Hero). */
const IMAGE = '/landing/springs/intro/opening-2@xxl.webp';

const VI: SpringsIntroContent = {
  statement: 'Mở cánh cửa Springs và bước vào chính con người thật của bạn',
  tagline: '',
  description:
    'Một chốn bình yên và tĩnh lặng, nơi hạnh phúc của riêng bạn, nơi sự thư giãn sâu lắng giúp bạn kết nối với suy nghĩ và cảm xúc của chính mình. Tại đây, bạn sẽ khám phá những khả năng còn ẩn giấu mà tương lai dành riêng cho bạn.',
  image: IMAGE,
};

const EN: SpringsIntroContent = {
  statement: 'Open the doors of Springs and step into your true self',
  tagline: '',
  description:
    'Enclave of peace and quiet, your personal happy place, where deep relaxation helps you connect to your thoughts and feelings. Here, you will unveil hidden possibilities that the future holds just for you.',
  image: IMAGE,
};

export const springsIntroDef: BlockDef<SpringsIntroContent> = {
  type: 'springs_intro',
  meta: {
    type: 'springs_intro',
    label: 'Springs - Intro',
    accent: '#152018',
    adminLabel: 'Springs - Intro',
    gradient: 'from-emerald-950 to-emerald-800',
    defaultName: 'Springs - Intro',
    aiLabelVi:
      'khoảng lặng thương hiệu: câu tuyên ngôn serif lớn + đoạn mô tả phụ, đi kèm 1 ảnh, nền cream',
    aiLabelEn:
      'brand-statement pause: large serif statement + supporting paragraph paired with an image, cream background',
  },
  component: SpringsIntro,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'tagline',
      label: 'Dòng nhỏ (tuỳ chọn)',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'statement',
      label: 'Câu tuyên ngôn',
      icon: Heading,
      fieldType: 'textarea',
    },
    {
      key: 'description',
      label: 'Mô tả phụ',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'image',
      label: 'Ảnh',
      icon: ImageIcon,
      fieldType: 'image',
    },
  ],
};
