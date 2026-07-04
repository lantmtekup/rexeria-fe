/**
 * BlockDef cho `delvaux_details` — port section `.details` của delvaux-clone
 * (https://delvaux.alphacreative.vn/). Tiêu đề căn giữa mask-reveal + 2 đoạn
 * mô tả fade-up (GSAP R1–R6 qua useBlockMotion).
 *
 * Component: `blocks/DelvauxDetails.tsx`. Đăng ký Path A → không cần đụng
 * factory.ts / renderBlock.tsx / LayersPanel.tsx.
 *
 * Default content là copy thật của trang gốc (asset/nội dung thuộc sở hữu
 * dự án) — bản VI là bản dịch tương ứng.
 */
import { Pilcrow, Type } from 'lucide-react';

import { DelvauxDetails } from '../../DelvauxDetails';
import type { DelvauxDetailsContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: DelvauxDetailsContent = {
  title: 'Brillant MM S Dream',
  body1:
    'The exceptional craftsmanship with the Leather D technique offers a unique treatment on one of the most emblematic Delvaux’s bag : the Brillant. This new ode to savoir-faire is created from water jet-cut leather panels to which a series of precious D-shaped pieces of leather have been sewn by hand, adding movement and fluidity to the bags’ silhouettes.',
  body2:
    "A tribute to the art of detail, the panels are then assembled by hand with leather covered rivets and with additional small 'D's. Representing more than 20 hours of work, the Brillant Leather-D is a true masterpiece born from the advanced expertise of Delvaux’s ateliers.",
};

const EN: DelvauxDetailsContent = { ...VI };

export const delvauxDetailsDef: BlockDef<DelvauxDetailsContent> = {
  type: 'delvaux_details',
  meta: {
    type: 'delvaux_details',
    label: 'Story - Editorial',
    accent: '#000000',
    adminLabel: 'Story - Editorial',
    gradient: 'from-neutral-100 to-white',
    defaultName: 'Story - Editorial',
    aiLabelVi:
      'block kể chuyện sản phẩm căn giữa: tiêu đề mask-reveal + 2 đoạn mô tả, phong cách editorial cao cấp',
    aiLabelEn:
      'centered editorial product-story block: masked title reveal + 2 paragraphs, luxury tone',
  },
  component: DelvauxDetails,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'body1', label: 'Đoạn 1', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'body2', label: 'Đoạn 2', icon: Pilcrow, fieldType: 'textarea' },
  ],
};
