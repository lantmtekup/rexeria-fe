/**
 * BlockDef cho `springs_intro` — bản rút gọn tĩnh của section `.l-intro`
 * (`#about`) springs-estate-clone: câu tuyên ngôn lớn serif + đoạn mô tả phụ,
 * không ảnh, padding dọc rộng ("khoảng thở" giữa hero và nội dung).
 * Component: `blocks/SpringsIntro.tsx`.
 */
import { Heading, Pilcrow, Type } from 'lucide-react';

import { SpringsIntro } from '../../SpringsIntro';
import type { SpringsIntroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: SpringsIntroContent = {
  statement: 'Mở cánh cửa Springs và bước vào chính con người thật của bạn',
  tagline: '',
  description:
    'Một chốn bình yên và tĩnh lặng, nơi hạnh phúc của riêng bạn, nơi sự thư giãn sâu lắng giúp bạn kết nối với suy nghĩ và cảm xúc của chính mình. Tại đây, bạn sẽ khám phá những khả năng còn ẩn giấu mà tương lai dành riêng cho bạn.',
};

const EN: SpringsIntroContent = {
  statement: 'Open the doors of Springs and step into your true self',
  tagline: '',
  description:
    'Enclave of peace and quiet, your personal happy place, where deep relaxation helps you connect to your thoughts and feelings. Here, you will unveil hidden possibilities that the future holds just for you.',
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
      'khoảng lặng thương hiệu: câu tuyên ngôn serif lớn giữa trang + đoạn mô tả phụ, nền cream, không ảnh',
    aiLabelEn:
      'brand-statement pause: large centered serif statement + supporting paragraph, cream background, no imagery',
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
  ],
};
