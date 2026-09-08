/**
 * BlockDef cho `west72_elevated` — section "Elevated Living" 2 cột của
 * 212 West 72nd. Port từ apps/212-west ElevatedLiving. Path A registry.
 */
import {
  AlignLeft,
  Heading2,
  Image as ImageIcon,
  Quote,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { West72ElevatedContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: West72ElevatedContent = {
  badgeLabel: 'Overview',
  title: 'Elevated\nLiving',
  bodyText:
    'Oversized windows frame an array of captivating views stretching from the treetops of Verdi Square over the romantic prewar façades of surrounding buildings to the great crowns of the Manhattan skyline.',
  bgImageUrl: '/212-west/background-elevated-living.png',
  bgImageAlt: 'Sunlit dining room with skyline views at 212 West 72nd',
  artworkImageUrl: '/212-west/picture.png',
  artworkImageAlt: 'Framed abstract painting inside a 212 West 72nd residence',
  quote:
    'Glimpses of Central Park, Riverside Park, and the Hudson River are reminders that the city’s finest green spaces are just moments away.',
  verticalLabel: 'Modern • Minimalist • Elegant',
};

const EN: West72ElevatedContent = { ...VI };

export const west72ElevatedDef: BlockDef<West72ElevatedContent> = {
  type: 'west72_elevated',
  meta: {
    type: 'west72_elevated',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', '212-west', 'real-estate', 'residence', 'reveal'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-09-07',
    label: '212 West · Elevated Living',
    accent: '#763718',
    adminLabel: '212 West Elevated Living',
    gradient: 'from-stone-100 to-neutral-200',
    defaultName: '212 West Elevated Living',
    aiLabelVi:
      'section giới thiệu 2 cột: ảnh nội thất + tiêu đề trái, tranh treo + trích dẫn + đường kẻ dọc phải, reveal bằng rèm trượt',
    aiLabelEn:
      'two-column overview section: interior photo + heading left, framed artwork + pull quote + vertical rule right, slat curtain reveal',
  },
  component: dynamic(() =>
    import('../../West72Elevated').then(m => m.West72Elevated)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'badgeLabel',
      label: 'Nhãn badge',
      icon: Tag,
      fieldType: 'text',
      groupId: 'intro',
      groupLabel: 'Nội dung trái',
    },
    {
      key: 'title',
      label: 'Tiêu đề (mỗi dòng 1 hàng)',
      icon: Heading2,
      fieldType: 'textarea',
      groupId: 'intro',
    },
    {
      key: 'bodyText',
      label: 'Đoạn mô tả',
      icon: AlignLeft,
      fieldType: 'textarea',
      groupId: 'intro',
    },
    {
      key: 'bgImageUrl',
      label: 'Ảnh nền trái',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'bg',
      groupLabel: 'Ảnh nền',
    },
    {
      key: 'bgImageAlt',
      label: 'Alt ảnh nền',
      icon: Tag,
      fieldType: 'text',
      groupId: 'bg',
    },
    {
      key: 'artworkImageUrl',
      label: 'Ảnh tranh',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'artwork',
      groupLabel: 'Tranh treo',
    },
    {
      key: 'artworkImageAlt',
      label: 'Alt ảnh tranh',
      icon: Tag,
      fieldType: 'text',
      groupId: 'artwork',
    },
    {
      key: 'quote',
      label: 'Trích dẫn',
      icon: Quote,
      fieldType: 'textarea',
      groupId: 'aside',
      groupLabel: 'Nội dung phải',
    },
    {
      key: 'verticalLabel',
      label: 'Chữ dọc',
      icon: Type,
      fieldType: 'text',
      groupId: 'aside',
    },
  ],
};
