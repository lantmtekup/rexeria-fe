/**
 * BlockDef cho `page_snap` — block tiện ích không giao diện, bật cuộn snap
 * từng section cho cả trang. Dùng chung engine với preset transition `snap`
 * (`motion/useSnapScroll.ts`); cờ `data-snap-owner` đảm bảo chỉ một cái arm.
 */
import { MoveVertical, Ruler, Tag, Timer, ToggleLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

import { BLOCK_TYPE_META, type PageSnapContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: PageSnapContent = {
  label: 'Cuộn snap từng section',
  note: '',
  enabled: true,
  minWidth: 1280,
  duration: 1.1,
};

const EN: PageSnapContent = {
  ...VI,
  label: 'Section snap scrolling',
};

export const pageSnapDef: BlockDef<PageSnapContent> = {
  type: 'page_snap',
  meta: BLOCK_TYPE_META.page_snap,
  component: dynamic(() => import('../../PageSnap').then(m => m.PageSnap)),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'enabled',
      label: 'Bật snap',
      icon: ToggleLeft,
      fieldType: 'text',
      groupId: 'cfg',
      groupLabel: 'Cấu hình',
    },
    {
      key: 'minWidth',
      label: 'Bề rộng tối thiểu (px)',
      icon: Ruler,
      fieldType: 'text',
      groupId: 'cfg',
    },
    {
      key: 'duration',
      label: 'Thời lượng chuyển (giây)',
      icon: Timer,
      fieldType: 'text',
      groupId: 'cfg',
    },
    {
      key: 'label',
      label: 'Nhãn (chỉ hiện trong editor)',
      icon: Tag,
      fieldType: 'text',
      groupId: 'canvas',
      groupLabel: 'Hiển thị trong editor',
    },
    {
      key: 'note',
      label: 'Ghi chú (chỉ hiện trong editor)',
      icon: MoveVertical,
      fieldType: 'textarea',
      groupId: 'canvas',
    },
  ],
};
