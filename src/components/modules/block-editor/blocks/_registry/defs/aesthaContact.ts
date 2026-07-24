/**
 * BlockDef cho `aestha_contact` — trang "CONTACT" (cùng site RAMSA/Aestha với
 * `aestha_explore` / `aestha_studio`). Port từ `app/dev/aestha-contact/page.tsx`.
 *
 * Wide (≥1100px): 2 cột full-viewport — trái CONTACT + địa chỉ, phải ảnh hero +
 * email/phone · social; cursor-dot. Narrow (<1100px): xếp dọc (địa chỉ → info →
 * ảnh). Path A registry.
 */
import { AtSign, ImageIcon, Link2, MapPin, Phone, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  AesthaContactContent,
  AesthaContactFooterLink,
  AesthaContactSocial,
} from '../../../types';
import type { BlockDef } from '../types';

// Ảnh hero (tòa nhà NYC) — giữ nguyên CDN URL của bản gốc (asset rule của skill).
const HERO_IMG =
  'https://framerusercontent.com/images/WPx9Zr4AV2b97ubrDEMcky10rwA.jpg?width=2364&height=1578';

const ADDRESS = 'Vesterhavnsgade 17, 2. sal\nDK-1620 København V\nDenmark';
const EMAIL = 'aesthainteriors@mailmail.com';
const PHONE = '+11 222 333 444';

const SOCIALS: AesthaContactSocial[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'Facebook', href: 'https://www.facebook.com/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com' },
];

const FOOTER_LINKS_VI: AesthaContactFooterLink[] = [
  { label: 'Dự án', href: '/projects' },
  { label: 'Studio', href: '/studio' },
  { label: 'Liên hệ', href: '/contact' },
];

const FOOTER_LINKS_EN: AesthaContactFooterLink[] = [
  { label: 'Projects', href: '/projects' },
  { label: 'Studio', href: '/studio' },
  { label: 'Contact', href: '/contact' },
];

const VI: AesthaContactContent = {
  heading: 'CONTACT',
  address: ADDRESS,
  email: EMAIL,
  phone: PHONE,
  imageUrl: HERO_IMG,
  imageAlt: 'RAMSA — kiến trúc tháp trên nền Central Park, New York',
  socials: SOCIALS,
  footerLinks: FOOTER_LINKS_VI,
  currentFooterLabel: 'Liên hệ',
};

const EN: AesthaContactContent = {
  heading: 'CONTACT',
  address: ADDRESS,
  email: EMAIL,
  phone: PHONE,
  imageUrl: HERO_IMG,
  imageAlt: 'RAMSA — tower architecture over Central Park, New York',
  socials: SOCIALS,
  footerLinks: FOOTER_LINKS_EN,
  currentFooterLabel: 'Contact',
};

/**
 * `socials` là mảng động → không biểu diễn được trong `elements` tĩnh.
 * `LayersPanel.elementsForType` gọi helper này để expand `socials[i]`
 * (pattern `aesthaStudioTeamElements`).
 */
export const aesthaContactSocialElements = (
  socials: AesthaContactSocial[]
): LayerElement[] =>
  socials.flatMap((_, i) => [
    {
      key: `socials[${i}].label`,
      label: 'Nhãn',
      groupId: `soc${i}`,
      groupLabel: `Mạng xã hội ${i + 1}`,
      icon: Type,
      fieldType: 'text' as const,
    },
    {
      key: `socials[${i}].href`,
      label: 'Link',
      groupId: `soc${i}`,
      icon: Link2,
      fieldType: 'text' as const,
    },
  ]);

/** Footer nav — mảng động, expand `footerLinks[i]`. */
export const aesthaContactFooterLinkElements = (
  links: AesthaContactFooterLink[]
): LayerElement[] =>
  links.flatMap((_, i) => [
    {
      key: `footerLinks[${i}].label`,
      label: 'Nhãn',
      groupId: `foot${i}`,
      groupLabel: `Footer ${i + 1}`,
      icon: Type,
      fieldType: 'text' as const,
    },
    {
      key: `footerLinks[${i}].href`,
      label: 'Link',
      groupId: `foot${i}`,
      icon: Link2,
      fieldType: 'text' as const,
    },
  ]);

export const aesthaContactDef: BlockDef<AesthaContactContent> = {
  type: 'aestha_contact',
  meta: {
    type: 'aestha_contact',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'framer', 'contact'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'Aestha Contact',
    accent: '#0F0F0F',
    adminLabel: 'Contact (Aestha)',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Contact',
    aiLabelVi:
      'trang CONTACT: heading + địa chỉ + email/phone + social + ảnh hero + footer nav',
    aiLabelEn:
      'CONTACT page: heading + address + email/phone + socials + hero image + footer nav',
  },
  component: dynamic(() =>
    import('../../AesthaContact').then(m => m.AesthaContact)
  ),
  defaultContent: { vi: VI, en: EN },
  // Phần tĩnh. `socials` + `footerLinks` được LayersPanel expand động qua các
  // helper trên — xem branch `aestha_contact` ở đó.
  elements: [
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'address', label: 'Địa chỉ', icon: MapPin, fieldType: 'textarea' },
    { key: 'email', label: 'Email', icon: AtSign, fieldType: 'text' },
    { key: 'phone', label: 'Điện thoại', icon: Phone, fieldType: 'text' },
    { key: 'imageUrl', label: 'Ảnh', icon: ImageIcon, fieldType: 'image' },
    { key: 'imageAlt', label: 'Alt ảnh', icon: Type, fieldType: 'text' },
  ],
};
