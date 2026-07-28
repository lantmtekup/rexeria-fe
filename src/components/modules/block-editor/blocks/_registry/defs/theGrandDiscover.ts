/**
 * BlockDef cho `the_grand_discover` — section "Khám Phá Thư Viện" The Grand:
 * stack ảnh ghim 1 màn, scrub theo cuộn để ảnh active lùi ra sau-trái (ghost)
 * nhường chỗ ảnh kế trượt vào giữa; nav khu vực bấm được góc dưới phải + caption
 * góc dưới trái. Port từ apps/the-grand Discover. Path A registry.
 *
 * Layers: mỗi khu vực = 1 folder `groupId` — nhãn / ảnh editable từng field
 * (pattern the_grand_service). Content vẫn là `items[]` động; `elementsForType`
 * expand từ content khi số khu vực ≠ default.
 */
import { Image as ImageIcon, ListChecks, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  TheGrandDiscoverContent,
  TheGrandDiscoverItem,
} from '../../../types';
import type { BlockDef } from '../types';

const VI_ITEMS: TheGrandDiscoverItem[] = [
  {
    label: 'Cổng chính',
    imageUrl: '/the-grand/discover-1.png',
    imageAlt: 'Cổng chính The Grand',
  },
  {
    label: 'Đại sảnh',
    imageUrl: '/the-grand/discover-2.png',
    imageAlt: 'Đại sảnh The Grand',
  },
  {
    label: 'Tiện ích',
    imageUrl: '/the-grand/discover-3.png',
    imageAlt: 'Tiện ích The Grand',
  },
  {
    label: 'Phòng ngủ',
    imageUrl: '/the-grand/discover-4.png',
    imageAlt: 'Phòng ngủ The Grand',
  },
];

const EN_ITEMS: TheGrandDiscoverItem[] = [
  {
    label: 'Main gate',
    imageUrl: '/the-grand/discover-1.png',
    imageAlt: 'The Grand main gate',
  },
  {
    label: 'Lobby',
    imageUrl: '/the-grand/discover-2.png',
    imageAlt: 'The Grand lobby',
  },
  {
    label: 'Amenities',
    imageUrl: '/the-grand/discover-3.png',
    imageAlt: 'The Grand amenities',
  },
  {
    label: 'Bedroom',
    imageUrl: '/the-grand/discover-4.png',
    imageAlt: 'The Grand bedroom',
  },
];

const VI: TheGrandDiscoverContent = {
  heading: 'Khám Phá Thư Viện',
  description:
    'Mỗi căn hộ Ritz-Carlton tại The Grand không chỉ là không gian thỏa mãn nhu cầu tận hưởng cuộc sống, mà còn là một tài sản vô giá khẳng định vị thế của chủ nhân.',
  backdropImage: '',
  items: VI_ITEMS,
};

const EN: TheGrandDiscoverContent = {
  heading: 'Explore The Gallery',
  description:
    'Every Ritz-Carlton residence at The Grand is more than a space to savour life — it is a priceless asset that affirms its owner’s standing.',
  backdropImage: '',
  items: EN_ITEMS,
};

/** Layers folders — 1 group / khu vực (nhãn / ảnh). */
export const theGrandDiscoverItemElements = (
  items: TheGrandDiscoverItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : VI_ITEMS;
  return list.flatMap((it, i) => {
    const groupId = `item${i}`;
    const groupLabel = it.label?.trim() || `Khu vực ${i + 1}`;
    return [
      {
        key: `items[${i}].label`,
        label: 'nhãn',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].imageUrl`,
        label: 'ảnh',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
    ];
  });
};

export const theGrandDiscoverDef: BlockDef<TheGrandDiscoverContent> = {
  type: 'the_grand_discover',
  meta: {
    type: 'the_grand_discover',
    label: 'The Grand · Discover',
    accent: '#e8d9b5',
    adminLabel: 'The Grand Discover',
    gradient: 'from-stone-800 to-stone-950',
    defaultName: 'The Grand Discover',
    aiLabelVi:
      'section thư viện ảnh The Grand: nền nâu gradient ghim 1 màn, stack ảnh scrub theo cuộn (ảnh active lùi ra sau-trái thành ghost, ảnh kế trượt vào giữa), nav khu vực bấm được + caption',
    aiLabelEn:
      'The Grand gallery: brown gradient pinned to one screen, image stack scrubbing on scroll (active image recedes back-left as a ghost while the next slides in), clickable area nav + caption',
  },
  component: dynamic(() =>
    import('../../TheGrandDiscover').then(m => m.TheGrandDiscover)
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
      key: 'backdropImage',
      label: 'Ảnh nền mờ',
      icon: ImageIcon,
      fieldType: 'image',
    },
    ...theGrandDiscoverItemElements(VI_ITEMS),
    { key: 'items', label: 'Thêm / quản lý khu vực', icon: ListChecks },
  ],
};
