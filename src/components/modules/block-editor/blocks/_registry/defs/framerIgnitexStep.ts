/**
 * BlockDef cho `framer_ignitex_step` — port từ framer-recon
 * `recon-ignitex-step-section` (selector `[data-framer-name='Step Section']`,
 * URL https://ignitex-wbs.framer.website/).
 *
 * Content: `cards[]` động (thêm/xoá qua Layers「Thêm / quản lý card」) —
 * pattern ScrollMattis. Flat `card1…/card2…/card3…` = legacy fallback cho
 * content cũ, chỉ dùng khi chưa có `cards[]`.
 *
 * Component: `blocks/FramerIgnitexStep.tsx`.
 */
import { Image as ImageIcon, ListChecks, Pilcrow, Type } from 'lucide-react';

import { FramerIgnitexStep } from '../../FramerIgnitexStep';
import type { LayerElement } from '../../../LayersPanel';
import type {
  FramerIgnitexStepCard,
  FramerIgnitexStepContent,
} from '../../../types';
import type { BlockDef } from '../types';

export const FRAMER_IGNITEX_STEP_DEFAULT_CARDS: FramerIgnitexStepCard[] = [
  {
    title: 'Discover & Define',
    body: 'We dive deep into your goals, audience, and brand to uncover insights and define a clear direction.',
    mainImageUrl:
      'https://framerusercontent.com/images/9pSg9VbHyOzgvjgKg8ZxafAC9Y.svg',
  },
  {
    title: 'Design & Build',
    body: 'With strategy in place, we craft stunning visuals and high-performing digital solutions tailored to your needs.',
    mainImageUrl:
      'https://framerusercontent.com/images/FKdtn2NzI19PvdqikGNTBvGO8M.svg',
  },
  {
    title: 'Launch & Grow',
    body: 'We bring your vision to life, optimize for performance, and support your ongoing success post-launch.',
    mainImageUrl:
      'https://framerusercontent.com/images/qijKgqD5sm0TZqlD52en6tHZeQ.svg',
  },
];

/** Card trống khi bấm「Thêm card」trong toolbar. */
export const FRAMER_IGNITEX_STEP_BLANK_CARD: FramerIgnitexStepCard = {
  title: 'New step',
  body: 'Mô tả ngắn cho bước này.',
  mainImageUrl:
    'https://framerusercontent.com/images/9pSg9VbHyOzgvjgKg8ZxafAC9Y.svg',
};

const LEGACY_KEYS = [
  {
    title: 'card1Title',
    body: 'card1Body',
    mainImageUrl: 'card1MainImageUrl',
  },
  {
    title: 'card2Title',
    body: 'card2Body',
    mainImageUrl: 'card2MainImageUrl',
  },
  {
    title: 'card3Title',
    body: 'card3Body',
    mainImageUrl: 'card3MainImageUrl',
  },
] as const;

/** Content cũ có `cards[]` hợp lệ chưa? Quyết định key nào được render/edit. */
export const hasFramerIgnitexStepCardsArray = (
  content: FramerIgnitexStepContent | null | undefined
): boolean => {
  const raw = content?.cards;
  return Array.isArray(raw) && raw.length > 0;
};

const pick = (v?: string) => v?.trim() || '';

/** Resolve `cards[]` (preferred) hoặc flat card1/2/3 (legacy) hoặc default. */
export const resolveFramerIgnitexStepCards = (
  content: FramerIgnitexStepContent | null | undefined
): FramerIgnitexStepCard[] => {
  const raw = content?.cards;
  if (Array.isArray(raw) && raw.length > 0) {
    const cleaned = raw.filter(
      c => c && typeof c === 'object'
    ) as FramerIgnitexStepCard[];
    if (cleaned.length > 0) {
      return cleaned.map(c => ({
        title: c.title ?? '',
        body: c.body ?? '',
        mainImageUrl: c.mainImageUrl,
        subImageUrl: c.subImageUrl,
      }));
    }
  }
  if (!content) {
    return FRAMER_IGNITEX_STEP_DEFAULT_CARDS.map(c => ({ ...c }));
  }
  const legacy = LEGACY_KEYS.map((keys, i) => {
    const fallback = FRAMER_IGNITEX_STEP_DEFAULT_CARDS[i];
    return {
      title: pick(content[keys.title]) || fallback.title,
      body: pick(content[keys.body]) || fallback.body,
      mainImageUrl:
        pick(content[keys.mainImageUrl]) || fallback.mainImageUrl || undefined,
    };
  }).filter(c => c.title || c.body || c.mainImageUrl);
  return legacy.length > 0
    ? legacy
    : FRAMER_IGNITEX_STEP_DEFAULT_CARDS.map(c => ({ ...c }));
};

/**
 * Layers folders — 1 group / card. Dùng chung giữa BlockDef và
 * LayersPanel.elementsForType.
 */
export const framerIgnitexStepCardElements = (
  cards: FramerIgnitexStepCard[]
): LayerElement[] => {
  const list = cards.length > 0 ? cards : FRAMER_IGNITEX_STEP_DEFAULT_CARDS;
  return list.flatMap((card, i) => {
    const groupId = `card${i}`;
    const groupLabel =
      (card.title ?? '').trim().slice(0, 40) || `Card ${i + 1}`;
    return [
      {
        key: `cards[${i}].title`,
        label: 'title',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `cards[${i}].body`,
        label: 'body',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
      {
        key: `cards[${i}].mainImageUrl`,
        label: 'ảnh',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
    ];
  });
};

/** Flat card1/2/3 — Layers khi content chưa migrate sang `cards[]`. */
export const FRAMER_IGNITEX_STEP_LEGACY_ELEMENTS: LayerElement[] = [
  1, 2, 3,
].flatMap(n => {
  const groupId = `card${n}`;
  return [
    {
      key: `card${n}Title`,
      label: 'title',
      groupId,
      groupLabel: `Card ${n}`,
      icon: Type,
      fieldType: 'text' as const,
    },
    {
      key: `card${n}Body`,
      label: 'body',
      groupId,
      icon: Pilcrow,
      fieldType: 'textarea' as const,
    },
    {
      key: `card${n}MainImageUrl`,
      label: 'ảnh',
      groupId,
      icon: ImageIcon,
      fieldType: 'image' as const,
    },
  ];
});

const VI: FramerIgnitexStepContent = {
  preTitle: 'From concept to launch',
  leftTop: 'Your ideas',
  leftBottom: 'into Brand',
  rightTop: 'transform',
  rightBottom: 'stories',
  cards: FRAMER_IGNITEX_STEP_DEFAULT_CARDS,
};

const EN: FramerIgnitexStepContent = {
  ...VI,
  cards: FRAMER_IGNITEX_STEP_DEFAULT_CARDS.map(c => ({ ...c })),
};

export const framerIgnitexStepDef: BlockDef<FramerIgnitexStepContent> = {
  type: 'framer_ignitex_step',
  meta: {
    type: 'framer_ignitex_step',
    label: 'IgniteX - Step Section',
    accent: '#05080c',
    adminLabel: 'IgniteX - Step Section',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Step Section',
    aiLabelVi:
      'block IgniteX "Step Section" (recon spec): nền trắng, pill "From concept to launch", 3-cột (trái "Your ideas into Brand" + giữa N step card + phải "transform stories"), Geist 60/500 cho heading + Great Vibes 62/400 cho "Brand", card Geist 28/500 title + Geist 18/500 body #5b5b5b',
    aiLabelEn:
      'IgniteX "Step Section" (recon spec): white background, "From concept to launch" pill, 3-column (left "Your ideas into Brand" + center N step cards + right "transform stories"), Geist 60/500 heading + Great Vibes 62/400 for "Brand", card Geist 28/500 title + Geist 18/500 body #5b5b5b',
  },
  component: FramerIgnitexStep,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'preTitle', label: 'Pre-title', icon: Type, fieldType: 'text' },
    { key: 'leftTop', label: 'Left - dòng 1', icon: Type, fieldType: 'text' },
    {
      key: 'leftBottom',
      label: 'Left - dòng 2',
      icon: Type,
      fieldType: 'text',
    },
    { key: 'rightTop', label: 'Right - dòng 1', icon: Type, fieldType: 'text' },
    {
      key: 'rightBottom',
      label: 'Right - dòng 2',
      icon: Type,
      fieldType: 'text',
    },
    ...framerIgnitexStepCardElements(FRAMER_IGNITEX_STEP_DEFAULT_CARDS),
    {
      key: 'cards',
      label: 'Thêm / quản lý card',
      icon: ListChecks,
    },
  ],
};
