/**
 * BlockDef cho `west72_footer` — footer 212 West 72nd.
 * Port từ apps/212-west Footer. Path A registry.
 */
import {
  AlignLeft,
  Copyright,
  Instagram,
  Link2,
  Mail,
  MapPin,
  Phone,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { West72FooterContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: West72FooterContent = {
  wordmark: '212west72',
  addressText: '212 West 72nd Street New York, NY 10023',
  emailLabel: 'info@212west72.com',
  emailHref: 'mailto:info@212west72.com',
  phoneLabel: '+12127211200',
  phoneHref: 'tel:+12127211200',
  instagramLabel: '212 West 72nd on Instagram',
  instagramHref: '',
  fairHousingText:
    '200 West 72nd Street Owner, LLC and Exclusive Sales and Marketing Agent fully support the principles of the Fair Housing Act and the Equal Opportunity Act.',
  fairHousingHref: '',
  disclaimer:
    "All images are artist's renderings for illustration purposes and should not be relied upon by the purchasing public. Views shown are reasonable approximations and taken from various elevations. They are provided for illustration purposes only and should not be relied upon by the purchasing public. Sponsor makes no representation whatsoever with respect to actual, current or future views from any particular floor or unit. The complete terms are in an offering plan available from the Sponsor, which is subject to change by a duly filed amendment. File No. CD19-0069. 212 West 72 Street, NYC 10023. 200 West 72nd Street Owner, LLC c/o Centurion Property Investors, LLC, 595 Madison Avenue, NYC 10022. Only",
  copyright: '© ReXeR Studio. 2026. All Rights Reserved.',
};

const EN: West72FooterContent = { ...VI };

export const west72FooterDef: BlockDef<West72FooterContent> = {
  type: 'west72_footer',
  meta: {
    type: 'west72_footer',
    category: 'footer',
    style: 'luxury',
    tags: ['clone', '212-west', 'real-estate', 'residence', 'reveal'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-09-07',
    label: '212 West · Footer',
    accent: '#763718',
    adminLabel: '212 West Footer',
    gradient: 'from-orange-950 to-stone-900',
    defaultName: '212 West Footer',
    aiLabelVi:
      'footer bất động sản: khung viền trắng nền nâu, wordmark cưỡi mép trên, địa chỉ + email + điện thoại + Instagram + fine print, rèm 4 cột reveal',
    aiLabelEn:
      'residential footer: white-bordered frame on brown, wordmark straddling the top edge, address + email + phone + Instagram + fine print, four-column curtain reveal',
  },
  component: dynamic(() =>
    import('../../West72Footer').then(m => m.West72Footer)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'wordmark',
      label: 'Wordmark',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'addressText',
      label: 'Địa chỉ',
      icon: MapPin,
      fieldType: 'text',
    },
    {
      key: 'emailLabel',
      label: 'Email hiển thị',
      icon: Mail,
      fieldType: 'text',
      groupId: 'email',
      groupLabel: 'Email',
    },
    {
      key: 'emailHref',
      label: 'Link email (mailto:)',
      icon: Link2,
      fieldType: 'link',
      groupId: 'email',
    },
    {
      key: 'phoneLabel',
      label: 'Điện thoại hiển thị',
      icon: Phone,
      fieldType: 'text',
      groupId: 'phone',
      groupLabel: 'Điện thoại',
    },
    {
      key: 'phoneHref',
      label: 'Link gọi (tel:)',
      icon: Link2,
      fieldType: 'link',
      groupId: 'phone',
    },
    {
      key: 'instagramLabel',
      label: 'Aria-label Instagram',
      icon: Tag,
      fieldType: 'text',
      groupId: 'instagram',
      groupLabel: 'Instagram',
    },
    {
      key: 'instagramHref',
      label: 'Link Instagram',
      icon: Instagram,
      fieldType: 'link',
      groupId: 'instagram',
    },
    {
      key: 'fairHousingText',
      label: 'Fair Housing',
      icon: AlignLeft,
      fieldType: 'textarea',
      groupId: 'fairHousing',
      groupLabel: 'Fair Housing',
    },
    {
      key: 'fairHousingHref',
      label: 'Link Fair Housing',
      icon: Link2,
      fieldType: 'link',
      groupId: 'fairHousing',
    },
    {
      key: 'disclaimer',
      label: 'Disclaimer',
      icon: AlignLeft,
      fieldType: 'textarea',
    },
    {
      key: 'copyright',
      label: 'Bản quyền',
      icon: Copyright,
      fieldType: 'text',
    },
  ],
};
