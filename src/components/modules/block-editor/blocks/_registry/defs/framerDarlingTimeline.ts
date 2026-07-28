/**
 * BlockDef cho `framer_darling_timeline` — timeline zigzag nền kem (Darling clone).
 * Port từ `FramerDarlingTimeline.tsx`. Pattern items giống `mintv2_process`.
 */
import { ImageIcon, ListChecks, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { FramerDarlingTimelineContent } from '../../../types';
import type { BlockDef } from '../types';

type DarlingTimelineItem = FramerDarlingTimelineContent['items'][number];

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80';

const VI_ITEMS: DarlingTimelineItem[] = [
  {
    time: '9:00 SA',
    title: 'Khởi đầu',
    description:
      'Cuộc họp khởi động để hiểu rõ mục tiêu và kỳ vọng của khách hàng.',
    imageUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
  },
  {
    time: '11:00 SA',
    title: 'Lên kế hoạch',
    description: 'Xây dựng lộ trình chi tiết cho từng giai đoạn dự án.',
    imageUrl:
      'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200&q=80',
  },
  {
    time: '2:00 CH',
    title: 'Thực hiện',
    description:
      'Đội ngũ sáng tạo bắt tay vào công việc với toàn bộ nhiệt huyết.',
    imageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
  },
];

const EN_ITEMS: DarlingTimelineItem[] = [
  {
    time: '9:00 AM',
    title: 'Kickoff',
    description: 'A kickoff meeting to understand the goals and expectations.',
    imageUrl: DEFAULT_IMG,
  },
  {
    time: '11:00 AM',
    title: 'Planning',
    description: 'Building a detailed roadmap for each project phase.',
    imageUrl:
      'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200&q=80',
  },
  {
    time: '2:00 PM',
    title: 'Execution',
    description: 'The creative team dives in with full passion.',
    imageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
  },
];

const VI: FramerDarlingTimelineContent = {
  heading: 'Hành Trình',
  intro:
    'Chúng tôi tin rằng mỗi dự án là một câu chuyện cần được kể bằng sự chăm chút và tận tâm.',
  items: VI_ITEMS,
};

const EN: FramerDarlingTimelineContent = {
  heading: 'The Day',
  intro:
    "Here's what to expect. Everything takes place here, and we'll guide you throughout the day.",
  items: EN_ITEMS,
};

/** Layers folders — 1 group / timeline milestone. */
export const framerDarlingTimelineItemElements = (
  items: DarlingTimelineItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : VI_ITEMS;
  return list.flatMap((item, i) => {
    const groupId = `milestone${i}`;
    const groupLabel = item.title?.trim() || `Mốc ${i + 1}`;
    return [
      {
        key: `items[${i}].time`,
        label: 'Giờ',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].description`,
        label: 'Mô tả',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
      {
        key: `items[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
    ];
  });
};

export const framerDarlingTimelineDef: BlockDef<FramerDarlingTimelineContent> =
  {
    type: 'framer_darling_timeline',
    meta: {
      type: 'framer_darling_timeline',
      category: 'progress',
      style: 'modern',
      tags: ['clone', 'framer', 'timeline'],
      status: 'ready',
      responsive: true,
      updatedAt: '2026-07-05',
      label: 'Timeline',
      accent: '#1f1d14',
      adminLabel: 'Darling Timeline',
      gradient: 'from-amber-100 to-amber-300',
      defaultName: 'Timeline',
      aiLabelVi: 'timeline nền kem, cột sống dọc, item xen kẽ trái/phải',
      aiLabelEn: 'cream timeline with vertical spine and alternating items',
    },
    component: dynamic(() =>
      import('../../FramerDarlingTimeline').then(m => m.FramerDarlingTimeline)
    ),
    defaultContent: { vi: VI, en: EN },
    elements: [
      { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
      { key: 'intro', label: 'Mô tả', icon: Pilcrow, fieldType: 'textarea' },
      ...framerDarlingTimelineItemElements(VI_ITEMS),
      {
        key: 'items',
        label: 'Thêm / quản lý mốc',
        icon: ListChecks,
      },
    ],
  };
