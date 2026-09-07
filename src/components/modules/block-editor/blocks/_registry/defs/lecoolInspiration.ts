/**
 * BlockDef cho `lecool_inspiration` — bộ ảnh xếp chồng như cỗ bài, bung quạt 3D
 * khi rê chuột. Port từ apps/ecommerce-landing InspirationSection.tsx.
 * Path A registry.
 *
 * `cards[i].*` expand trong LayersPanel.elementsForType.
 */
import { Crown, Tag, TextCursorInput, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LecoolInspirationContent } from '../../../types';
import { DEFAULT_INSPIRATION_CARDS } from '../../lecoolInspirationData';
import type { BlockDef } from '../types';

const VI: LecoolInspirationContent = {
  crownUrl: '/lecool/hero-emblem.png',
  eyebrow: 'Inspirations',
  title: 'The moods behind the move',
  subtitle:
    'Hover the stack to open it — every frame is a note we kept while shaping Le Cool Move.',
  cards: DEFAULT_INSPIRATION_CARDS.map(card => ({ ...card })),
};

const EN: LecoolInspirationContent = { ...VI };

export const lecoolInspirationDef: BlockDef<LecoolInspirationContent> = {
  type: 'lecool_inspiration',
  meta: {
    type: 'lecool_inspiration',
    label: 'Le Cool Move · Inspiration',
    accent: '#B68D45',
    adminLabel: 'Le Cool Move Inspiration',
    gradient: 'from-neutral-200 to-neutral-500',
    defaultName: 'Le Cool Move Inspiration',
    aiLabelVi:
      'bộ ảnh Inspiration xếp chồng như cỗ bài, rê chuột vào thì bung ra hình quạt 3D và từng lá nhấc lên kèm pill tên; khổ hẹp thành dải cuộn ngang',
    aiLabelEn:
      'Inspiration image deck stacked like playing cards that fans out in 3D on hover, each card lifting with a title pill; narrow widths fall back to a horizontal scroll strip',
  },
  component: dynamic(() =>
    import('../../LecoolInspiration').then(m => m.LecoolInspiration)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'crownUrl',
      label: 'Vương miện',
      groupId: 'head',
      groupLabel: 'Đầu section',
      icon: Crown,
      fieldType: 'image',
    },
    {
      key: 'eyebrow',
      label: 'Eyebrow',
      groupId: 'head',
      icon: Tag,
      fieldType: 'text',
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      groupId: 'head',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'subtitle',
      label: 'Mô tả',
      groupId: 'head',
      icon: TextCursorInput,
      fieldType: 'textarea',
    },
    // cards[i].* expand in LayersPanel.elementsForType(lecool_inspiration)
  ],
};
