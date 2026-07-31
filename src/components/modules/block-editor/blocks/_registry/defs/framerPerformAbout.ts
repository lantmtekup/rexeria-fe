/**
 * BlockDef cho `framer_perform_about` — dark full-viewport sticky deck
 * with GSAP-driven text scroll + image swap + mobile stack fallback.
 *
 * Content: dynamic `testimonials[]` (add/remove in Layers).
 * Elements được gen động từ seed content (pattern như framerPerformPricing).
 */
import { ImageIcon, Grid3x3, Type, Pilcrow } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { FramerPerformAboutContent } from '../../../types';
import type { BlockDef } from '../types';

type Testimonial = FramerPerformAboutContent['testimonials'][number];

const VI_TESTIMONIALS: Testimonial[] = [
  {
    imageUrl:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1024&q=80',
    textHighlight:
      'Hành trình triathlon của tôi bắt đầu từ những khó khăn về kỹ thuật và sức bền.',
    textRest:
      'Giờ đây, tôi hướng dẫn người khác đạt được tiềm năng tối đa của họ.',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80',
    textHighlight: 'Phương pháp huấn luyện kết hợp thể chất và tinh thần,',
    textRest:
      'giúp vận động viên xây dựng sức mạnh và tự tin để vượt qua giới hạn.',
  },
  {
    imageUrl:
      'https://framerusercontent.com/images/o1iEuFuB1ARuwoXcEgQQTV0CYbw.png',
    textHighlight:
      'Cùng nhau, chúng ta sẽ phá vỡ mọi rào cản và khơi dậy tiềm năng của bạn,',
    textRest:
      'biến mỗi cột mốc thành một thắng lợi thông qua sự huấn luyện được cá nhân hóa.',
  },
];

const EN_TESTIMONIALS: Testimonial[] = [
  {
    imageUrl:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1024&q=80',
    textHighlight:
      'I started my triathlon journey struggling with balance and technique.',
    textRest: 'Now, I guide others to achieve their full potential.',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80',
    textHighlight:
      'My coaching blends physical training and mental strategies,',
    textRest:
      'helping athletes build strength and confidence to overcome their limits.',
  },
];

const VI: FramerPerformAboutContent = {
  testimonials: VI_TESTIMONIALS,
};

const EN: FramerPerformAboutContent = {
  testimonials: EN_TESTIMONIALS,
};

/** Layers folders — 1 group / testimonial card. */
export const framerPerformAboutTestimonialElements = (
  testimonials: Testimonial[]
): LayerElement[] => {
  const list = testimonials.length > 0 ? testimonials : VI_TESTIMONIALS;
  return list.flatMap((t, i) => {
    const groupId = `testimonial${i}`;
    const groupLabel = `Card ${i + 1}`;
    return [
      {
        key: `testimonials[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `testimonials[${i}].textHighlight`,
        label: 'Highlight',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `testimonials[${i}].textRest`,
        label: 'Nội dung',
        groupId,
        icon: Pilcrow,
        fieldType: 'text' as const,
      },
    ];
  });
};

export const framerPerformAboutDef: BlockDef<FramerPerformAboutContent> = {
  type: 'framer_perform_about',
  meta: {
    type: 'framer_perform_about',
    category: 'intro',
    style: 'modern',
    tags: ['clone', 'framer', 'about'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Perform About',
    accent: '#ffffff',
    adminLabel: 'Testimonials (Perform)',
    gradient: 'from-neutral-800 to-black',
    defaultName: 'Về chúng tôi',
    aiLabelVi: 'stack testimonial nền đen: text trái + ảnh phải mỗi hàng',
    aiLabelEn: 'dark testimonial stack: text left + image right per row',
  },
  component: dynamic(() =>
    import('../../FramerPerformAbout').then(m => m.FramerPerformAbout)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...framerPerformAboutTestimonialElements(VI_TESTIMONIALS),
    {
      key: 'testimonials',
      label: 'Thêm / quản lý card',
      icon: Grid3x3,
    },
  ],
};
