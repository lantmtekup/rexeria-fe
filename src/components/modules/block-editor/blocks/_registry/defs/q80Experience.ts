/**
 * BlockDef cho `q80_experience` — journey 3D quadplex80 (gate + cảnh three.js
 * + slide suite shader-wipe + contact). Component: `blocks/Q80Experience.tsx`.
 * Đăng ký Path A. Default = copy/asset nguyên bản (media trên S3 qua BE).
 */
import {
  Building2,
  DollarSign,
  Image as ImageIcon,
  Mail,
  MousePointerClick,
  Phone,
  Type,
} from 'lucide-react';

import { Q80Experience } from '../../Q80Experience';
import { Q80_EXPERIENCE_CONTENT } from './q80Content';
import type { Q80ExperienceContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: Q80ExperienceContent = Q80_EXPERIENCE_CONTENT;
const EN: Q80ExperienceContent = { ...VI };

export const q80ExperienceDef: BlockDef<Q80ExperienceContent> = {
  type: 'q80_experience',
  meta: {
    type: 'q80_experience',
    label: 'Experience - 3D Journey',
    accent: '#7c7262',
    adminLabel: 'Experience - 3D Journey',
    gradient: 'from-sky-200 to-white',
    defaultName: 'Experience - 3D Journey',
    aiLabelVi:
      'journey 3D bất động sản cao cấp: gate enter + cảnh WebGL tòa tháp trên mây + slide suite chuyển shader + contact, cuộn điều khiển toàn bộ',
    aiLabelEn:
      'luxury real-estate 3D journey: enter gate + WebGL tower-above-clouds scene + shader-wipe suite slides + contact, fully scroll-driven',
  },
  component: Q80Experience,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'introTitle',
      label: 'Intro - Tiêu đề',
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: 'introText',
      label: 'Intro - Mô tả',
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: 'homeEyebrow',
      label: 'Home - Eyebrow',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'homeTitle',
      label: 'Home - Tiêu đề',
      icon: Building2,
      fieldType: 'textarea',
    },
    {
      key: 'homeText',
      label: 'Home - Mô tả',
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: 'homePrice',
      label: 'Home - Giá',
      icon: DollarSign,
      fieldType: 'text',
    },
    {
      key: 'contactEyebrow',
      label: 'Contact - Eyebrow',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'contactTitle',
      label: 'Contact - Tiêu đề',
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: 'contactSubtitle',
      label: 'Contact - Mô tả',
      icon: Type,
      fieldType: 'textarea',
    },
    { key: 'email', label: 'Email', icon: Mail, fieldType: 'text' },
    { key: 'phone', label: 'Điện thoại', icon: Phone, fieldType: 'text' },
    {
      key: 'scrollLabel',
      label: 'Nhãn scroll',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    {
      key: 'homeViewVideoLabel',
      label: 'Nhãn overlay view',
      icon: ImageIcon,
      fieldType: 'text',
    },
  ],
};
