/**
 * BlockDef cho `gambit_product_overview` — port `ProductOverview` của
 * apps/gambit-delvaux: sân khấu dán + track nhiều panel sản phẩm trượt theo
 * scroll (panel đầu có cụm Details + line-reveal). Path A.
 *
 * Layers: mỗi panel = 1 folder (ảnh / tiêu đề / mô tả / details / bullets),
 * cộng manager `panels` (thêm-xoá panel qua ElementToolbar).
 */
import { Image as ImageIcon, List, Pilcrow, Tag, Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { LayerElement } from '../../../LayersPanel';
import type {
  GambitProductOverviewContent,
  GambitProductOverviewPanel,
} from '../../../types';
import type { BlockDef } from '../types';

const DEFAULT_PANELS: GambitProductOverviewPanel[] = [
  {
    imageUrl: '/gambit/product1-nobg.png',
    title:
      'SMALL BAG WITH TOP HANDLE CRAFTED FROM BOX CALF LEATHER, ADORNED WITH HAND-EMBROIDERED EMBOSSED STARS.',
    detailsLabel: 'Details',
    detailsRef: 'REF. AA0406AAM062DDO',
    bullets: [
      'Smooth and sophisticated Box Calf leather',
      'Natural calfskin lining',
      '1 interior flat pocket with vanity mirror',
      'Removable and adjustable leather shoulder strap',
      'Gold metal hardware',
    ],
  },
  {
    imageUrl: '/gambit/product2-nobg.png',
    title: "BRILLANT MINI'S MATERIAL",
    body: 'Presenting the Luxury bag, where elegance meets sophistication. Made from premium materials, this handbag is a must-have for fashion connoisseurs. Its chic design and classic style make it the ultimate accessory for any outfit, perfect for your fashionable escapades.',
  },
  {
    imageUrl: '/gambit/product3-nobg.png',
    title: "BRILLANT MINI'S DESIGN",
    body: 'The Brillant Mini by Delvaux embodies the essence of luxury and style. Meticulously crafted from premium materials, this handbag is a must-have for discerning fashion lovers. Its exquisite design and classic charm make it the ultimate accessory for any outfit, perfect for your elegant gatherings.',
  },
];

/** Panel mới khi bấm "Thêm panel" trong ElementToolbar. */
export const GAMBIT_OVERVIEW_NEW_PANEL: GambitProductOverviewPanel = {
  imageUrl: '/gambit/product2-nobg.png',
  title: 'TIÊU ĐỀ PANEL',
  body: 'Mô tả ngắn cho panel này.',
};

/**
 * Panel hợp lệ từ content (block + Lớp + toolbar dùng CHUNG hàm này để không
 * lệch nhau); rỗng/sai shape → panel mặc định.
 */
export function resolveGambitOverviewPanels(
  content: GambitProductOverviewContent | undefined
): GambitProductOverviewPanel[] {
  const raw = content?.panels;
  const list = Array.isArray(raw)
    ? raw.filter(
        (p): p is GambitProductOverviewPanel =>
          !!p && typeof p === 'object' && typeof p.title === 'string'
      )
    : [];
  return list.length > 0 ? list : DEFAULT_PANELS;
}

/** Layers folders — 1 group / panel (+ bullets của panel đầu). */
export const gambitOverviewPanelElements = (
  panels: GambitProductOverviewPanel[]
): LayerElement[] => {
  const list = panels.length > 0 ? panels : DEFAULT_PANELS;
  return list.flatMap((panel, i) => {
    const groupId = `panel${i}`;
    const groupLabel = panel.title?.trim()
      ? `${i + 1}. ${panel.title.trim().slice(0, 32)}`
      : `Panel ${i + 1}`;
    const bullets = Array.isArray(panel.bullets) ? panel.bullets : [];

    return [
      {
        key: `panels[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `panels[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        icon: Type,
        fieldType: 'textarea' as const,
      },
      ...(typeof panel.body === 'string'
        ? [
            {
              key: `panels[${i}].body`,
              label: 'Mô tả',
              groupId,
              icon: Pilcrow,
              fieldType: 'textarea' as const,
            },
          ]
        : []),
      ...(panel.detailsLabel !== undefined || bullets.length > 0
        ? [
            {
              key: `panels[${i}].detailsLabel`,
              label: 'Nhãn Details',
              groupId,
              icon: Tag,
              fieldType: 'text' as const,
            },
            {
              key: `panels[${i}].detailsRef`,
              label: 'Mã REF',
              groupId,
              icon: Tag,
              fieldType: 'text' as const,
            },
            ...bullets.map((_, bi) => ({
              key: `panels[${i}].bullets[${bi}]`,
              label: `Gạch đầu dòng ${bi + 1}`,
              groupId,
              icon: List,
              fieldType: 'text' as const,
            })),
          ]
        : []),
    ];
  });
};

const VI: GambitProductOverviewContent = { panels: DEFAULT_PANELS };
const EN: GambitProductOverviewContent = { panels: DEFAULT_PANELS };

export const gambitProductOverviewDef: BlockDef<GambitProductOverviewContent> =
  {
    type: 'gambit_product_overview',
    meta: {
      type: 'gambit_product_overview',
      label: 'Product - Overview Scroll',
      accent: '#111111',
      adminLabel: 'Product - Overview Scroll',
      gradient: 'from-neutral-200 to-white',
      defaultName: 'Product - Overview Scroll',
      aiLabelVi:
        'sân khấu dán nhiều panel sản phẩm trượt theo scroll: ảnh từ giữa về cột trái + chữ reveal từng dòng, panel sau ảnh parallax chậm hơn chữ',
      aiLabelEn:
        'sticky multi-panel product overview: image settles from center to left column while copy reveals line by line, later panels parallax the image behind the copy',
    },
    // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
    component: dynamic(() =>
      import('../../GambitProductOverview').then(m => m.GambitProductOverview)
    ),
    defaultContent: { vi: VI, en: EN },
    elements: [
      ...gambitOverviewPanelElements(DEFAULT_PANELS),
      {
        key: 'panels',
        label: 'Thêm / quản lý panel',
        icon: List,
      },
    ],
  };
