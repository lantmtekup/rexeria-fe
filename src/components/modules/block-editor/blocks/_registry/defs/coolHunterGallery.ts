/**
 * BlockDef cho `cool_hunter_gallery` — gallery Cool Hunter: ảnh+caption
 * scrub ngang (stack → hàng → cuộn). Port từ apps/cool-hunter
 * GallerySection.tsx. Path A registry.
 *
 * `items[]` động — thêm/xoá qua Layers「Thêm / quản lý ảnh」.
 */
import { Image as ImageIcon, ListChecks, Pilcrow } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  CoolHunterGalleryContent,
  CoolHunterGalleryItem,
} from '../../../types';
import type { BlockDef } from '../types';

export const COOL_HUNTER_GALLERY_DEFAULT_ITEMS: CoolHunterGalleryItem[] = [
  {
    imageUrl: '/cool-hunter/gallery-1.webp',
    imageAlt:
      'An arched hallway with steel-framed glass walls and a lantern pendant',
    text: 'The approach allowed maximum square footage without an imposing footprint, while creating multiple exposures to flood the interiors with natural light. Set on a peninsula jutting into the lake, the orientation provides water views on three sides; the entire plan was optimised to frame them. "I thought of the house as a camera and tried to frame and crop as many views of the lake as possible to make the setting as picturesque as it could be."',
  },
  {
    imageUrl: '/cool-hunter/gallery-2.webp',
    imageAlt: 'A breakfast nook with leaded windows and built-in benches',
    text: 'The approach allowed maximum square footage without an imposing footprint, while creating multiple exposures to flood the interiors with natural light. Set on a peninsula jutting into the lake, the orientation provides water views on three sides; the entire plan was optimised to frame them.',
  },
  {
    imageUrl: '/cool-hunter/gallery-3.webp',
    imageAlt:
      'A kitchen with oak cabinetry, marble counters and leaded windows',
    text: "Betsy Brown's interiors are almost monastic in their restraint, ruthlessly edited until every object asked to stay. She started with a Kaare Klint dining table, Danish modern pieces enjoyed by cognoscenti, leather because it wears, and everything else earned its place.",
  },
];

const VI: CoolHunterGalleryContent = {
  items: COOL_HUNTER_GALLERY_DEFAULT_ITEMS,
};

const EN: CoolHunterGalleryContent = {
  ...VI,
  items: [...COOL_HUNTER_GALLERY_DEFAULT_ITEMS],
};

/** Resolve items[] — fallback default khi thiếu / rỗng. */
export const resolveCoolHunterGalleryItems = (
  content: CoolHunterGalleryContent | null | undefined
): CoolHunterGalleryItem[] => {
  const raw = content?.items;
  if (!Array.isArray(raw) || raw.length === 0) {
    return COOL_HUNTER_GALLERY_DEFAULT_ITEMS.map(item => ({ ...item }));
  }
  return raw.filter(it => it && typeof it === 'object');
};

/**
 * Layers folders — 1 group / item. Dùng chung giữa BlockDef và
 * LayersPanel.elementsForType.
 */
export const coolHunterGalleryItemElements = (
  items: CoolHunterGalleryItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : COOL_HUNTER_GALLERY_DEFAULT_ITEMS;
  return list.flatMap((item, i) => {
    const groupId = `item${i}`;
    const groupLabel = (item.text ?? '').trim().slice(0, 40) || `Ảnh ${i + 1}`;
    return [
      {
        key: `items[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `items[${i}].text`,
        label: 'Caption',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
    ];
  });
};

export const coolHunterGalleryDef: BlockDef<CoolHunterGalleryContent> = {
  type: 'cool_hunter_gallery',
  meta: {
    type: 'cool_hunter_gallery',
    label: 'Cool Hunter · Gallery',
    accent: '#111111',
    adminLabel: 'Cool Hunter Gallery',
    gradient: 'from-neutral-600 to-neutral-900',
    defaultName: 'Cool Hunter Gallery',
    aiLabelVi:
      'gallery Cool Hunter: N ảnh+caption scrub ngang (stack → hàng → cuộn, text fade theo nhịp)',
    aiLabelEn:
      'Cool Hunter gallery: N image+caption horizontal scrub (stack → row → scroll, text fades in beat)',
  },
  component: dynamic(() =>
    import('../../CoolHunterGallery').then(m => m.CoolHunterGallery)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...coolHunterGalleryItemElements(COOL_HUNTER_GALLERY_DEFAULT_ITEMS),
    {
      key: 'items',
      label: 'Thêm / quản lý ảnh',
      icon: ListChecks,
    },
  ],
};
