/**
 * BlockDef cho `housent_our_excellence` — badge + heading + body giữa,
 * N satellite items (label + lucide icon) xếp vòng tròn.
 *
 * `items[]` động — thêm/xoá qua Layers「Thêm / quản lý mục」(pattern
 * Altura Olympus features). Legacy flat `item1Label…item8Icon` vẫn
 * resolve được cho page đã lưu trước đó.
 *
 * Component: `blocks/HousentOurExcellence.tsx`.
 */
import {
  Award,
  BarChart3,
  Briefcase,
  Building2,
  Coins,
  Gem,
  Handshake,
  Home,
  KeyRound,
  Leaf,
  ListChecks,
  MapPin,
  Pilcrow,
  Scale,
  ShieldCheck,
  Shapes,
  Sparkles,
  Sun,
  TrendingUp,
  Type,
  Users,
  type LucideIcon,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  HousentOurExcellenceContent,
  HousentOurExcellenceItem,
} from '../../../types';
import type { BlockDef } from '../types';

const HousentOurExcellence = dynamic(() =>
  import('../../HousentOurExcellence').then(m => m.HousentOurExcellence)
);

/** Icon map dùng chung: component render + toolbar select. */
export const HOUSENT_EXCELLENCE_ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  BarChart3,
  Sun,
  MapPin,
  KeyRound,
  Briefcase,
  Leaf,
  TrendingUp,
  Home,
  Building2,
  Award,
  Gem,
  Handshake,
  Coins,
  Sparkles,
  Users,
  Scale,
};

export const HOUSENT_EXCELLENCE_ICON_OPTIONS = Object.keys(
  HOUSENT_EXCELLENCE_ICONS
);

export const HOUSENT_EXCELLENCE_FALLBACK_ICON = 'ShieldCheck';

export const HOUSENT_EXCELLENCE_DEFAULT_ITEMS: HousentOurExcellenceItem[] = [
  { label: 'Verified Legality', icon: 'ShieldCheck' },
  { label: 'Market Stability', icon: 'BarChart3' },
  { label: 'Future Appreciation', icon: 'Sun' },
  { label: 'Strategic Location', icon: 'MapPin' },
  { label: 'Seamless Closing', icon: 'KeyRound' },
  { label: 'Portfolio Diversification', icon: 'Briefcase' },
  { label: 'Sustainable Growth', icon: 'Leaf' },
  { label: 'High Yield Potential', icon: 'TrendingUp' },
];

/** Legacy flat fields — content lưu trước khi chuyển sang `items[]`. */
const LEGACY_ITEM_KEYS = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({
  label: `item${n}Label` as keyof HousentOurExcellenceContent,
  icon: `item${n}Icon` as keyof HousentOurExcellenceContent,
}));

const str = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const legacyItems = (
  content: HousentOurExcellenceContent | null | undefined
): HousentOurExcellenceItem[] =>
  LEGACY_ITEM_KEYS.map(keys => ({
    label: str(content?.[keys.label]),
    icon: str(content?.[keys.icon]) || HOUSENT_EXCELLENCE_FALLBACK_ICON,
  })).filter(it => it.label);

/** Resolve items[] — ưu tiên mảng; fallback legacy flat; rồi default. */
export const resolveHousentOurExcellenceItems = (
  content: HousentOurExcellenceContent | null | undefined
): HousentOurExcellenceItem[] => {
  const raw = content?.items;
  const legacy = legacyItems(content);

  if (Array.isArray(raw) && raw.length > 0) {
    // Inline edit (`items[3].label`) trên content legacy tạo mảng thưa —
    // vá lỗ bằng legacy cùng index, và giữ đủ độ dài legacy để không mất mục.
    // Mảng do list manager ghi luôn dày ⇒ nhánh này không hồi sinh mục đã xoá.
    const sparse = Array.from({ length: raw.length }).some(
      (_, i) => !raw[i] || typeof raw[i] !== 'object'
    );
    const length = sparse ? Math.max(raw.length, legacy.length) : raw.length;

    return Array.from({ length }, (_, i) => {
      const it = raw[i];
      if (it && typeof it === 'object') {
        return {
          label: typeof it.label === 'string' ? it.label : '',
          icon: str(it.icon) || HOUSENT_EXCELLENCE_FALLBACK_ICON,
        };
      }
      const fallback = legacy[i] ?? HOUSENT_EXCELLENCE_DEFAULT_ITEMS[i] ?? null;
      return {
        label: fallback?.label ?? '',
        icon: fallback?.icon || HOUSENT_EXCELLENCE_FALLBACK_ICON,
      };
    });
  }

  if (legacy.length > 0) return legacy.map(it => ({ ...it }));

  return HOUSENT_EXCELLENCE_DEFAULT_ITEMS.map(it => ({ ...it }));
};

/**
 * Layers folders — 1 group / item. Dùng chung giữa BlockDef và
 * LayersPanel.elementsForType.
 */
export const housentOurExcellenceItemElements = (
  items: HousentOurExcellenceItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : HOUSENT_EXCELLENCE_DEFAULT_ITEMS;
  return list.flatMap((item, i) => {
    const groupId = `item${i}`;
    const groupLabel = (item.label ?? '').trim().slice(0, 40) || `Mục ${i + 1}`;
    return [
      {
        key: `items[${i}].label`,
        label: 'Nhãn',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].icon`,
        label: 'Icon (lucide)',
        groupId,
        icon: Shapes,
        fieldType: 'text' as const,
      },
    ];
  });
};

const VI: HousentOurExcellenceContent = {
  badge: 'Foundation of Trust',
  heading: 'Our Excellence',
  body: 'Chúng tôi kết hợp chuyên môn địa phương với phân tích cấp tổ chức để mang đến một môi trường đầu tư bất động sản an toàn và sinh lời cao.',
  items: HOUSENT_EXCELLENCE_DEFAULT_ITEMS.map(it => ({ ...it })),
};

const EN: HousentOurExcellenceContent = {
  ...VI,
  body: 'We combine localized expertise with institutional-grade analysis to provide a safe and high-yielding environment for your property investments.',
  items: HOUSENT_EXCELLENCE_DEFAULT_ITEMS.map(it => ({ ...it })),
};

export const housentOurExcellenceDef: BlockDef<HousentOurExcellenceContent> = {
  type: 'housent_our_excellence',
  meta: {
    type: 'housent_our_excellence',
    label: 'Housent Excellence',
    accent: '#ff810a',
    adminLabel: 'Our Excellence (Housent)',
    gradient: 'from-stone-100 to-stone-200',
    defaultName: 'Our Excellence',
    aiLabelVi:
      'block Our Excellence: badge + heading + body giữa, N satellite icon-item xếp vòng tròn (desktop) hoặc stack dọc (mobile)',
    aiLabelEn:
      'Our Excellence block: center badge+heading+body with N satellite icon items on a radial circle (desktop) or stacked list (mobile)',
  },
  component: HousentOurExcellence,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'badge', label: 'Badge', icon: Type, fieldType: 'text' },
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'body', label: 'Mô tả', icon: Pilcrow, fieldType: 'textarea' },
    ...housentOurExcellenceItemElements(HOUSENT_EXCELLENCE_DEFAULT_ITEMS),
    {
      key: 'items',
      label: 'Thêm / quản lý mục',
      icon: ListChecks,
    },
  ],
};
