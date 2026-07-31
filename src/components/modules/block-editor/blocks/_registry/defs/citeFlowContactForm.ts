import { Mail, MousePointerClick, Phone, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CiteFlowContactFormContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: CiteFlowContactFormContent = {
  heading: 'Connect now',
  introText:
    'Do you want to find out more about the project, connect with us now.',
  contactEmailValue: 'info@ecoparkonsen.com',
  contactPhoneValue: '+84 24 3543 6789',
  contactAddressValue: 'Ecopark, Van Giang, Hung Yen, Vietnam',
  nameLabel: 'Name',
  namePlaceholder: 'Enter your name',
  emailLabel: 'Email',
  emailPlaceholder: 'Enter your mail',
  messageLabel: 'Message',
  messagePlaceholder: 'Message',
  submitText: 'Send message',
  submittedText: 'Message sent',
};

export const citeFlowContactFormDef: BlockDef<CiteFlowContactFormContent> = {
  type: 'cite_flow_contact_form',
  meta: {
    type: 'cite_flow_contact_form',
    label: 'Cite Flow Contact Form',
    accent: '#3f6b4f',
    adminLabel: 'Cite Flow Contact Form',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Cite Flow Contact Form',
    aiLabelVi:
      'form liên hệ 2 cột: heading + thông tin liên hệ bên trái, form Name/Email/Message + nút gửi (đổi nhãn sau khi bấm) bên phải',
    aiLabelEn:
      'two-column contact section: heading + contact info on the left, Name/Email/Message form with a submit button that swaps label after sending on the right',
  },
  component: dynamic(() =>
    import('../../CiteFlowContactForm').then(m => m.CiteFlowContactForm)
  ),
  defaultContent: { vi: CONTENT, en: CONTENT },
  elements: [
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    {
      key: 'introText',
      label: 'Giới thiệu',
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: 'contactEmailValue',
      label: 'Email',
      groupId: 'contact',
      groupLabel: 'Thông tin liên hệ',
      icon: Mail,
      fieldType: 'text',
    },
    {
      key: 'contactPhoneValue',
      label: 'Điện thoại',
      groupId: 'contact',
      icon: Phone,
      fieldType: 'text',
    },
    {
      key: 'contactAddressValue',
      label: 'Địa chỉ',
      groupId: 'contact',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'nameLabel',
      label: 'Nhãn',
      groupId: 'name',
      groupLabel: 'Trường Họ tên',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'namePlaceholder',
      label: 'Placeholder',
      groupId: 'name',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'emailLabel',
      label: 'Nhãn',
      groupId: 'email',
      groupLabel: 'Trường Email',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'emailPlaceholder',
      label: 'Placeholder',
      groupId: 'email',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'messageLabel',
      label: 'Nhãn',
      groupId: 'message',
      groupLabel: 'Trường Lời nhắn',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'messagePlaceholder',
      label: 'Placeholder',
      groupId: 'message',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'submitText',
      label: 'Nhãn — mặc định',
      groupId: 'submit',
      groupLabel: 'Nút gửi',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    {
      key: 'submittedText',
      label: 'Nhãn — sau khi gửi',
      groupId: 'submit',
      icon: MousePointerClick,
      fieldType: 'text',
    },
  ],
};
