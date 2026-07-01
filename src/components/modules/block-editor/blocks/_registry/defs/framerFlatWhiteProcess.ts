/**
 * BlockDef cho `framer_flat_white_process` — port từ framer-recon
 * `recon-flat-white-our-process` (selector `[data-framer-name="Our Process"]`,
 * URL https://flat-white.framer.website/).
 *
 * Animation spec được port sang GSAP R1–R6 (qua `useBlockMotion` trong
 * component):
 *   - Pattern A: label + headline word-by-word reveal
 *       (300ms / 100ms stagger / ease 'power3.out' ≈ Framer
 *        `cubic-bezier(0.22, 1, 0.36, 1)`).
 *   - Pattern B: step title + body word-by-word reveal
 *       (500ms / 10ms stagger / ease 'power2.inOut' ≈ Framer
 *        `cubic-bezier(0.44, 0, 0.56, 1)`), delayChildren 0.2s.
 *   - Pattern C: SVG overlay path draw (pathLength 0→1 trên 3s, ease
 *       'power2.out').
 *
 * Component: `blocks/FramerFlatWhiteProcess.tsx`. Renderer tự quản animation
 * qua `useBlockMotion`.
 */
import { Pilcrow, Type } from 'lucide-react';

import { FramerFlatWhiteProcess } from '../../FramerFlatWhiteProcess';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerFlatWhiteProcessContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: FramerFlatWhiteProcessContent = {
  label: 'OUR PROCESS',
  headline:
    'How we transform strategy, insights and expertise into measurable business outcomes',
  steps: [
    {
      number: '001',
      title: 'Discover opportunities and define your priorities',
      body: 'We analyze your business, market and goals to identify key opportunities. Our approach combines industry insight, data-driven analysis and stakeholder engagement to create a clear foundation for meaningful transformation.',
    },
    {
      number: '002',
      title: 'Design actionable strategies tailored to your needs',
      body: 'We develop actionable strategies and practical solutions aligned with your vision. Each recommendation is designed to be scalable, implementable and capable of delivering measurable impact across the organization.',
    },
    {
      number: '003',
      title: 'Deliver measurable results with lasting impact',
      body: 'We implement plans alongside your team, ensuring sustainable results. Our hands-on approach includes support, monitoring and adaptation to embed changes and deliver long-term value.',
    },
  ],
  bgColor: '#747E90',
  textColor: '#FFFFFF',
  bodyTextColor: '#D6D9E2',
};

const EN: FramerFlatWhiteProcessContent = {
  ...VI,
};

export const framerFlatWhiteProcessDef: BlockDef<FramerFlatWhiteProcessContent> =
  {
    type: 'framer_flat_white_process',
    meta: {
      type: 'framer_flat_white_process',
      label: 'Flat White - Our Process',
      accent: '#747E90',
      adminLabel: 'Flat White - Our Process',
      gradient: 'from-slate-500 to-slate-700',
      defaultName: 'Flat White - Our Process',
      aiLabelVi:
        'block Flat White "Our Process" (recon spec): nền xám, pill label, headline lớn, 3 step card dọc, body màu #D6D9E2, có SVG divider cong động',
      aiLabelEn:
        'Flat White "Our Process" (recon spec): gray background, pill label, large headline, 3 vertical step cards, body text #D6D9E2, animated curved SVG divider',
    },
    component: FramerFlatWhiteProcess,
    defaultContent: { vi: VI, en: EN },
    // Layer nền tự động (BACKGROUND_LAYER) thêm vào đầu; khai báo element con.
    // step-0..step-2 (card root) + step-N-pill/title/body để user chỉnh
    // text/color/font trong editor. step-N-title/body dùng fieldType
    // 'textarea' cho phép nhập đoạn dài.
    elements: [
      { key: 'label', label: 'Pill label', icon: Type, fieldType: 'text' },
      {
        key: 'headline',
        label: 'Headline',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      ...(VI.steps.flatMap((_, idx): LayerElement[] => [
        {
          key: `step-${idx}`,
          label: `Step ${idx + 1} (khung)`,
          icon: Type,
        },
        {
          key: `step-${idx}-pill`,
          label: `Step ${idx + 1} pill`,
          icon: Type,
          fieldType: 'text',
        },
        {
          key: `step-${idx}-title`,
          label: `Step ${idx + 1} title`,
          icon: Pilcrow,
          fieldType: 'textarea',
        },
        {
          key: `step-${idx}-body`,
          label: `Step ${idx + 1} body`,
          icon: Pilcrow,
          fieldType: 'textarea',
        },
      ]) as LayerElement[]),
    ],
  };
