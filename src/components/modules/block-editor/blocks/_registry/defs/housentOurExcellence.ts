/**
 * BlockDef cho `housent_our_excellence` — badge + heading + body giữa,
 * 8 satellite items (label + lucide icon). Flat fields + groupId theo
 * pattern ScrollMattis / Readymag Cases.
 *
 * Component: `blocks/HousentOurExcellence.tsx`.
 */
import { Pilcrow, Type } from 'lucide-react';

import { HousentOurExcellence } from '../../HousentOurExcellence';
import type { LayerElement } from '../../../LayersPanel';
import type { HousentOurExcellenceContent } from '../../../types';
import type { BlockDef } from '../types';

const ITEM_DEFAULTS: Array<{ label: string; icon: string }> = [
  { label: 'Verified Legality', icon: 'ShieldCheck' },
  { label: 'Market Stability', icon: 'BarChart3' },
  { label: 'Future Appreciation', icon: 'Sun' },
  { label: 'Strategic Location', icon: 'MapPin' },
  { label: 'Seamless Closing', icon: 'KeyRound' },
  { label: 'Portfolio Diversification', icon: 'Briefcase' },
  { label: 'Sustainable Growth', icon: 'Leaf' },
  { label: 'High Yield Potential', icon: 'TrendingUp' },
];

const flatItems = (): Pick<
  HousentOurExcellenceContent,
  | 'item1Label'
  | 'item1Icon'
  | 'item2Label'
  | 'item2Icon'
  | 'item3Label'
  | 'item3Icon'
  | 'item4Label'
  | 'item4Icon'
  | 'item5Label'
  | 'item5Icon'
  | 'item6Label'
  | 'item6Icon'
  | 'item7Label'
  | 'item7Icon'
  | 'item8Label'
  | 'item8Icon'
> => {
  const out: Record<string, string> = {};
  ITEM_DEFAULTS.forEach((it, i) => {
    const n = i + 1;
    out[`item${n}Label`] = it.label;
    out[`item${n}Icon`] = it.icon;
  });
  return out as ReturnType<typeof flatItems>;
};

const VI: HousentOurExcellenceContent = {
  badge: 'Foundation of Trust',
  heading: 'Our Excellence',
  body: 'Chúng tôi kết hợp chuyên môn địa phương với phân tích cấp tổ chức để mang đến một môi trường đầu tư bất động sản an toàn và sinh lời cao.',
  ...flatItems(),
};

const EN: HousentOurExcellenceContent = {
  ...VI,
  body: 'We combine localized expertise with institutional-grade analysis to provide a safe and high-yielding environment for your property investments.',
};

const itemElements = (n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): LayerElement[] => {
  const groupId = `item${n}`;
  return [
    {
      key: `item${n}Label`,
      label: 'nhãn',
      groupId,
      groupLabel: `Item ${n}`,
      icon: Type,
      fieldType: 'text',
    },
    {
      key: `item${n}Icon`,
      label: 'icon (lucide)',
      groupId,
      icon: Type,
      fieldType: 'text',
    },
  ];
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
      'block Our Excellence: badge + heading + body giữa, 8 satellite icon-item xếp vòng tròn (desktop) hoặc stack dọc (mobile)',
    aiLabelEn:
      'Our Excellence block: center badge+heading+body with 8 satellite icon items on a radial circle (desktop) or stacked list (mobile)',
  },
  component: HousentOurExcellence,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'badge', label: 'Badge', icon: Type, fieldType: 'text' },
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'body', label: 'Mô tả', icon: Pilcrow, fieldType: 'textarea' },
    ...itemElements(1),
    ...itemElements(2),
    ...itemElements(3),
    ...itemElements(4),
    ...itemElements(5),
    ...itemElements(6),
    ...itemElements(7),
    ...itemElements(8),
  ],
};
