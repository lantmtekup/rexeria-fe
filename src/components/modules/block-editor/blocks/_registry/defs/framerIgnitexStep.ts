/**
 * BlockDef cho `framer_ignitex_step` — port từ framer-recon
 * `recon-ignitex-step-section` (selector `[data-framer-name='Step Section']`,
 * URL https://ignitex-wbs.framer.website/).
 *
 * Animation spec được port sang GSAP R1–R6 (qua `useBlockMotion` trong
 * component):
 *   - Pre-title + 2 title columns + 3 cards: fade-up + opacity
 *     (duration 0.8s, stagger 0.15s, ease 'power3.out' ≈ Framer
 *      `cubic-bezier(0.22, 1, 0.36, 1)`).
 *   - Sparkle icons: continuous rotate (decoration only).
 *
 * Component: `blocks/FramerIgnitexStep.tsx`. Renderer tự quản animation
 * qua `useBlockMotion`.
 */
import { Pilcrow, Type } from 'lucide-react';

import { FramerIgnitexStep } from '../../FramerIgnitexStep';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerIgnitexStepContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: FramerIgnitexStepContent = {
  preTitle: 'From concept to launch',
  leftTop: 'Your',
  leftMiddle: 'ideas',
  leftPreBrand: 'into',
  leftBrand: 'Brand',
  rightTop: 'transform',
  rightBottom: 'stories',
  cards: [
    {
      title: 'Discover & Define',
      body: 'We dive deep into your goals, audience, and brand to uncover insights and define a clear direction.',
      mainImageUrl:
        'https://framerusercontent.com/images/9pSg9VbHyOzgvjgKg8ZxafAC9Y.svg',
      subImageUrl:
        'https://framerusercontent.com/images/ux3d5Re26BvQ1hMY6HFoUzaWtHA.svg',
    },
    {
      title: 'Design & Build',
      body: 'With strategy in place, we craft stunning visuals and high-performing digital solutions tailored to your needs.',
      mainImageUrl:
        'https://framerusercontent.com/images/FKdtn2NzI19PvdqikGNTBvGO8M.svg',
      subImageUrl:
        'https://framerusercontent.com/images/nJnhkgaAyHW1ZSoDX71zT6bWucA.svg',
    },
    {
      title: 'Launch & Grow',
      body: 'We bring your vision to life, optimize for performance, and support your ongoing success post-launch.',
      mainImageUrl:
        'https://framerusercontent.com/images/qijKgqD5sm0TZqlD52en6tHZeQ.svg',
      subImageUrl:
        'https://framerusercontent.com/images/Q7x7MuONdp0b9SNGrEqqnmMw.svg',
    },
  ],
};

const EN: FramerIgnitexStepContent = {
  ...VI,
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
  // Element con: pre-title pill, 2 title columns (left + right), và mỗi
  // card có title + body để user chỉnh text. Illustration giữ SVG glyph
  // cố định (compass / monitor+phone / rocket) — không editable.
  elements: [
    { key: 'preTitle', label: 'Pre-title pill', icon: Type, fieldType: 'text' },
    { key: 'leftColumn', label: 'Left title column', icon: Pilcrow },
    { key: 'leftTop', label: 'Left - dòng 1', icon: Type, fieldType: 'text' },
    {
      key: 'leftMiddle',
      label: 'Left - dòng 2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'leftPreBrand',
      label: 'Left - dòng 3 (trước Brand)',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'leftBrand',
      label: 'Left - chữ Brand (serif)',
      icon: Type,
      fieldType: 'text',
    },
    { key: 'rightColumn', label: 'Right title column', icon: Pilcrow },
    { key: 'rightTop', label: 'Right - dòng 1', icon: Type, fieldType: 'text' },
    {
      key: 'rightBottom',
      label: 'Right - dòng 2',
      icon: Type,
      fieldType: 'text',
    },
    ...(VI.cards.flatMap((_, idx): LayerElement[] => [
      {
        key: `card-${idx}`,
        label: `Card ${idx + 1} (khung)`,
        icon: Type,
      },
      {
        key: `card-${idx}-title`,
        label: `Card ${idx + 1} title`,
        icon: Type,
        fieldType: 'text',
      },
      {
        key: `card-${idx}-body`,
        label: `Card ${idx + 1} body`,
        icon: Pilcrow,
        fieldType: 'textarea',
      },
    ]) as LayerElement[]),
  ],
};
