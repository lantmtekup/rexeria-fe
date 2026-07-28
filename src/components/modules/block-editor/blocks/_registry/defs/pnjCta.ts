/**
 * BlockDef cho `pnj_cta` — section CTA tối cuối trang với form
 * email/phone/note. Port từ apps/pnj CtaSection. Path A registry.
 */
import {
  CheckCircle,
  MousePointerClick,
  Tag,
  TextCursorInput,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { PnjCtaContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: PnjCtaContent = {
  title: 'Đăng ký quan tâm',
  subtitle:
    'Chỉ 75 phiên bản được chế tác. Để lại thông tin liên hệ và chúng tôi sẽ liên lạc để giữ chỗ chiếc đồng hồ Citizen L Arcly dành cho bạn.',
  emailLabel: 'Email',
  emailPlaceholder: 'email@cua-ban.com',
  phoneLabel: 'Số điện thoại',
  phonePlaceholder: '+84 (000) 000-0000',
  noteLabel: 'Ghi chú (tuỳ chọn)',
  notePlaceholder: 'Điều bạn muốn chúng tôi biết…',
  submitText: 'Đăng ký quan tâm',
  successMessage:
    'Cảm ơn bạn — chúng tôi đã nhận được thông tin và sẽ liên hệ trong thời gian sớm nhất.',
};

const EN: PnjCtaContent = {
  title: 'Register your interest',
  subtitle:
    'Only 75 will ever be struck. Leave your contact details and we will be in touch to reserve your Citizen L Arcly watch.',
  emailLabel: 'Email',
  emailPlaceholder: 'your@email.com',
  phoneLabel: 'Phone',
  phonePlaceholder: '+1 (000) 000-0000',
  noteLabel: 'Note (optional)',
  notePlaceholder: 'Anything you’d like us to know…',
  submitText: 'Register interest',
  successMessage:
    'Thank you — your details have been received. We will be in touch shortly.',
};

export const pnjCtaDef: BlockDef<PnjCtaContent> = {
  type: 'pnj_cta',
  meta: {
    type: 'pnj_cta',
    label: 'PNJ · CTA',
    accent: '#c79119',
    adminLabel: 'PNJ CTA',
    gradient: 'from-neutral-900 to-neutral-800',
    defaultName: 'PNJ CTA',
    aiLabelVi:
      'section CTA tối cuối trang PNJ: tiêu đề + mô tả + form email/phone/note + nút đăng ký',
    aiLabelEn:
      'PNJ closing CTA section: dark form with title, copy and email/phone/note register form',
  },
  component: dynamic(() => import('../../PnjCta').then(m => m.PnjCta)),
  defaultContent: { vi: VI, en: EN },
  // Layers: mỗi field = 1 folder `groupId` (nhãn + placeholder). Placeholder
  // sửa qua toolbar (không đặt data-element-key lên <input> vì selectableClass
  // sẽ để lại cursor-pointer/hover-outline trên form thật ở /p).
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Mô tả', icon: Type, fieldType: 'textarea' },
    {
      key: 'emailLabel',
      label: 'Nhãn',
      groupId: 'email',
      groupLabel: 'Ô Email',
      icon: Tag,
      fieldType: 'text',
    },
    {
      key: 'emailPlaceholder',
      label: 'Placeholder',
      groupId: 'email',
      icon: TextCursorInput,
      fieldType: 'text',
    },
    {
      key: 'phoneLabel',
      label: 'Nhãn',
      groupId: 'phone',
      groupLabel: 'Ô Số điện thoại',
      icon: Tag,
      fieldType: 'text',
    },
    {
      key: 'phonePlaceholder',
      label: 'Placeholder',
      groupId: 'phone',
      icon: TextCursorInput,
      fieldType: 'text',
    },
    {
      key: 'noteLabel',
      label: 'Nhãn',
      groupId: 'note',
      groupLabel: 'Ô Ghi chú',
      icon: Tag,
      fieldType: 'text',
    },
    {
      key: 'notePlaceholder',
      label: 'Placeholder',
      groupId: 'note',
      icon: TextCursorInput,
      fieldType: 'text',
    },
    {
      key: 'submitText',
      label: 'Nút đăng ký',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    {
      key: 'successMessage',
      label: 'Thông báo cảm ơn',
      icon: CheckCircle,
      fieldType: 'textarea',
    },
  ],
};
