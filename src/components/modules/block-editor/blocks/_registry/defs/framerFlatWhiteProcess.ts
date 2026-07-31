/**
 * BlockDef cho `framer_flat_white_process` — port từ framer-recon
 * `recon-flat-white-our-process` (selector `[data-framer-name="Our Process"]`,
 * URL https://flat-white.framer.website/).
 *
 * Motion (hybrid Attribute System + T3):
 *   - Label / headline: `word-reveal`
 *   - Hairline: `line-draw` axis=x
 *   - Steps: outer `parallax` + inner `fade-up`
 *   - SVG overlay strokeDashoffset scrub: T3 `useBlockMotion`
 *
 * Component: `blocks/FramerFlatWhiteProcess.tsx`.
 */
import { Frame, Hash, ListChecks, Pilcrow, Type } from 'lucide-react';

import { FramerFlatWhiteProcess } from '../../FramerFlatWhiteProcess';
import type { LayerElement } from '../../../LayersPanel';
import type {
  FramerFlatWhiteProcessContent,
  FramerFlatWhiteProcessStep,
} from '../../../types';
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

/**
 * Layers folders — 1 group / step.
 *
 * Key phải là **content path** (`steps[i].<field>`): `setContentAt` chỉ hiểu
 * segment `[n]` là index mảng. Bản đầu dùng `step-N-title` — không parse ra
 * path nên ElementToolbar ghi vào key rác `content['step-0-title']` và block
 * không bao giờ đọc lại. `steps[i].card` là key style-only cho khung thẻ
 * (nền / drag position), không có field tương ứng trong CMS.
 */
export const framerFlatWhiteProcessStepElements = (
  steps: FramerFlatWhiteProcessStep[]
): LayerElement[] => {
  const list = steps.length > 0 ? steps : VI.steps;
  return list.flatMap((_, i): LayerElement[] => {
    const groupId = `flatWhiteStep${i}`;
    return [
      {
        key: `steps[${i}].card`,
        label: 'Khung',
        groupId,
        groupLabel: `Step ${i + 1}`,
        icon: Frame,
      },
      {
        key: `steps[${i}].number`,
        label: 'Số thứ tự',
        groupId,
        icon: Hash,
        fieldType: 'text',
      },
      {
        key: `steps[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        icon: Type,
        fieldType: 'textarea',
      },
      {
        key: `steps[${i}].body`,
        label: 'Mô tả',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea',
      },
    ];
  });
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
    // Layer nền tự động (BACKGROUND_LAYER) thêm vào đầu; step folders expand
    // theo content thật qua `elementsForType(framer_flat_white_process)` —
    // danh sách ở đây chỉ là seed cho 3 step mặc định.
    elements: [
      { key: 'label', label: 'Pill label', icon: Type, fieldType: 'text' },
      {
        key: 'headline',
        label: 'Headline',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      ...framerFlatWhiteProcessStepElements(VI.steps),
      // Không đặt fieldType: resolveKind short-circuit 'text'/'textarea' trước
      // khi tới nhánh `framerFlatWhiteProcessSteps` (control thêm/xoá bước).
      {
        key: 'steps',
        label: 'Thêm / quản lý bước',
        icon: ListChecks,
      },
    ],
  };
