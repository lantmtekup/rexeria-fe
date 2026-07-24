import {
  CheckCircle,
  Image as ImageIcon,
  Link2,
  MousePointerClick,
  Type,
} from 'lucide-react';

import dynamic from 'next/dynamic';
import type { RolexContactContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: RolexContactContent = {
  backgroundUrl: '/rolex-collection/contact-bg.png',
  heading: 'SAY HELLO',
  email: 'hello@margot-quinn.com',
  phone: '+212 455 563',
  nameLabel: 'Enter Name',
  namePlaceholder: 'Margot Quinn',
  mailLabel: 'Enter mail ID',
  mailPlaceholder: 'margot@framer.com',
  messageLabel: 'Message',
  messagePlaceholder: 'Hello...',
  submitLabel: 'Submit',
  successMessage: 'Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm nhất.',
  portraitUrl: '/rolex-collection/contact-portrait.jpg',
  instagramLabel: 'Instagram',
  instagramHref: '',
  twitterLabel: 'Twitter',
  twitterHref: '',
};

export const rolexContactDef: BlockDef<RolexContactContent> = {
  type: 'rolex_collection_contact',
  meta: {
    type: 'rolex_collection_contact',
    label: 'Rolex Collection Contact',
    accent: '#ffffff',
    adminLabel: 'Rolex Collection Contact',
    gradient: 'from-neutral-800 to-black',
    defaultName: 'Rolex Collection Contact',
    aiLabelVi:
      'section "SAY HELLO" tối: card kính mờ chứa form liên hệ (tên/email/lời nhắn) bên trái + ảnh chân dung + link Instagram/Twitter bên phải',
    aiLabelEn:
      'dark "SAY HELLO" glass card: contact form (name/email/message) left + portrait photo with Instagram/Twitter links right',
  },
  component: dynamic(() =>
    import('../../RolexContact').then(m => m.RolexContact)
  ),
  defaultContent: { vi: VI, en: { ...VI } },
  elements: [
    {
      key: 'backgroundUrl',
      label: 'Background image',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'heading', label: 'Heading', icon: Type, fieldType: 'text' },
    { key: 'email', label: 'Email', icon: Type, fieldType: 'text' },
    { key: 'phone', label: 'Phone', icon: Type, fieldType: 'text' },
    // Cụm form liên hệ — groupId liền kề mới gom thành 1 folder (buildLayerTree).
    {
      key: 'nameLabel',
      label: 'Name label',
      icon: Type,
      fieldType: 'text',
      groupId: 'form',
      groupLabel: 'Form liên hệ',
    },
    {
      key: 'namePlaceholder',
      label: 'Name placeholder',
      icon: Type,
      fieldType: 'text',
      groupId: 'form',
    },
    {
      key: 'mailLabel',
      label: 'Mail label',
      icon: Type,
      fieldType: 'text',
      groupId: 'form',
    },
    {
      key: 'mailPlaceholder',
      label: 'Mail placeholder',
      icon: Type,
      fieldType: 'text',
      groupId: 'form',
    },
    {
      key: 'messageLabel',
      label: 'Message label',
      icon: Type,
      fieldType: 'text',
      groupId: 'form',
    },
    {
      key: 'messagePlaceholder',
      label: 'Message placeholder',
      icon: Type,
      fieldType: 'text',
      groupId: 'form',
    },
    {
      key: 'submitLabel',
      label: 'Submit button',
      icon: MousePointerClick,
      fieldType: 'text',
      groupId: 'form',
    },
    {
      key: 'successMessage',
      label: 'Success message',
      icon: CheckCircle,
      fieldType: 'textarea',
      groupId: 'form',
    },
    {
      key: 'portraitUrl',
      label: 'Portrait image',
      icon: ImageIcon,
      fieldType: 'image',
    },
    // Cụm social — groupId liền kề mới gom thành 1 folder (buildLayerTree).
    {
      key: 'instagramLabel',
      label: 'Instagram label',
      icon: Type,
      fieldType: 'text',
      groupId: 'instagram',
      groupLabel: 'Instagram',
    },
    {
      key: 'instagramHref',
      label: 'Instagram link',
      icon: Link2,
      fieldType: 'text',
      groupId: 'instagram',
    },
    {
      key: 'twitterLabel',
      label: 'Twitter label',
      icon: Type,
      fieldType: 'text',
      groupId: 'twitter',
      groupLabel: 'Twitter',
    },
    {
      key: 'twitterHref',
      label: 'Twitter link',
      icon: Link2,
      fieldType: 'text',
      groupId: 'twitter',
    },
  ],
};
