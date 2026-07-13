/**
 * BlockDef cho `framer_ignitex_step` — port từ framer-recon
 * `recon-ignitex-step-section` (selector `[data-framer-name='Step Section']`,
 * URL https://ignitex-wbs.framer.website/).
 *
 * Content phẳng + groupId theo pattern ScrollMattis / Readymag Cases:
 * mỗi card là 1 folder trong LayersPanel (Card 1…3) với title + body.
 *
 * Component: `blocks/FramerIgnitexStep.tsx`.
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import { FramerIgnitexStep } from '../../FramerIgnitexStep';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerIgnitexStepContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: FramerIgnitexStepContent = {
  preTitle: 'From concept to launch',
  leftTop: 'Your ideas',
  leftBottom: 'into Brand',
  rightTop: 'transform',
  rightBottom: 'stories',
  card1Title: 'Discover & Define',
  card1Body:
    'We dive deep into your goals, audience, and brand to uncover insights and define a clear direction.',
  card1MainImageUrl:
    'https://framerusercontent.com/images/9pSg9VbHyOzgvjgKg8ZxafAC9Y.svg',
  card2Title: 'Design & Build',
  card2Body:
    'With strategy in place, we craft stunning visuals and high-performing digital solutions tailored to your needs.',
  card2MainImageUrl:
    'https://framerusercontent.com/images/FKdtn2NzI19PvdqikGNTBvGO8M.svg',
  card3Title: 'Launch & Grow',
  card3Body:
    'We bring your vision to life, optimize for performance, and support your ongoing success post-launch.',
  card3MainImageUrl:
    'https://framerusercontent.com/images/qijKgqD5sm0TZqlD52en6tHZeQ.svg',
};

const EN: FramerIgnitexStepContent = { ...VI };

const cardElements = (n: 1 | 2 | 3): LayerElement[] => {
  const groupId = `card${n}`;
  return [
    {
      key: `card${n}Title`,
      label: 'title',
      groupId,
      groupLabel: `Card ${n}`,
      icon: Type,
      fieldType: 'text',
    },
    {
      key: `card${n}Body`,
      label: 'body',
      groupId,
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: `card${n}MainImageUrl`,
      label: 'ảnh',
      groupId,
      icon: ImageIcon,
      fieldType: 'image',
    },
  ];
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
      'block IgniteX "Step Section" (recon spec): nền trắng, pill "From concept to launch", 3-cột (trái "Your ideas into Brand" + giữa 3 step card + phải "transform stories"), Geist 60/500 cho heading + Great Vibes 62/400 cho "Brand", card Geist 28/500 title + Geist 18/500 body #5b5b5b',
    aiLabelEn:
      'IgniteX "Step Section" (recon spec): white background, "From concept to launch" pill, 3-column (left "Your ideas into Brand" + center 3 step cards + right "transform stories"), Geist 60/500 heading + Great Vibes 62/400 for "Brand", card Geist 28/500 title + Geist 18/500 body #5b5b5b',
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
    ...cardElements(1),
    ...cardElements(2),
    ...cardElements(3),
  ],
};
