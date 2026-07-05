/**
 * BlockDef cho `springs_contact_footer` — gộp `.l-callback` (contact/"request
 * a callback") + section `.footer` của springs-estate-clone thành 1 block
 * tĩnh. Component: `blocks/SpringsContactFooter.tsx`.
 *
 * Copy thật lấy từ site (index.html ~7337-8163):
 *  - contactHeading: h1 gốc 2 dòng "Submit / a request".
 *  - submitLabel: label nút xuất hiện lặp lại "submit a request".
 *  - footerCopyright: "© 2026. All rights reserved." (đoạn legal dài rút gọn).
 *  - footerLinks: "legal information" (→ /privacy-policy) là link footer thật
 *    duy nhất; các link còn lại lấy từ nav menu chính (`Residences`, `Design`,
 *    `Location`, `Amenities`, `About`) neo theo id section thật trong trang
 *    (#residences, #design, #place, #wellness, #about) — bản gốc không lặp
 *    lại các link này ở footer nhưng hợp lý cho 1 footer nav row.
 *  - contactDescription/footerLogoText/footerAddress/footerPhone/footerEmail:
 *    site gốc KHÔNG hiển thị các field này công khai (footer thật chỉ có logo
 *    ảnh không chữ, không địa chỉ/điện thoại/email) → placeholder hợp lý theo
 *    tông brand "Springs" (wellness residences), domain thật springs.estate.
 */
import {
  Heading,
  MapPin,
  Copyright,
  Mail,
  Phone,
  Pilcrow,
  Type,
} from 'lucide-react';

import { SpringsContactFooter } from '../../SpringsContactFooter';
import type { SpringsContactFooterContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: SpringsContactFooterContent = {
  contactHeading: 'Gửi yêu cầu tư vấn',
  contactDescription:
    'Để lại thông tin, đội ngũ Springs sẽ liên hệ và sắp xếp một buổi tham quan riêng cho bạn.',
  submitLabel: 'gửi yêu cầu',
  footerLogoText: 'Springs',
  footerAddress: '8 Serenity Ridge, Thung lũng Wellness',
  footerPhone: '+1 (555) 018-2947',
  footerEmail: 'hello@springs.estate',
  footerLinks: [
    { label: 'Bất động sản', href: '#residences' },
    { label: 'Thiết kế', href: '#design' },
    { label: 'Vị trí', href: '#place' },
    { label: 'Tiện ích', href: '#wellness' },
    { label: 'Giới thiệu', href: '#about' },
    { label: 'Thông tin pháp lý', href: '/privacy-policy' },
  ],
  footerCopyright: '© 2026. Bảo lưu mọi quyền.',
};

const EN: SpringsContactFooterContent = {
  contactHeading: 'Submit a request',
  contactDescription:
    'Leave your details and our team will get back to you shortly to arrange a private tour of Springs.',
  submitLabel: 'submit a request',
  footerLogoText: 'Springs',
  footerAddress: '8 Serenity Ridge, Wellness Valley',
  footerPhone: '+1 (555) 018-2947',
  footerEmail: 'hello@springs.estate',
  footerLinks: [
    { label: 'Residences', href: '#residences' },
    { label: 'Design', href: '#design' },
    { label: 'Location', href: '#place' },
    { label: 'Amenities', href: '#wellness' },
    { label: 'About', href: '#about' },
    { label: 'Legal information', href: '/privacy-policy' },
  ],
  footerCopyright: '© 2026. All rights reserved.',
};

export const springsContactFooterDef: BlockDef<SpringsContactFooterContent> = {
  type: 'springs_contact_footer',
  meta: {
    type: 'springs_contact_footer',
    label: 'Springs - Contact & Footer',
    accent: '#0d1410',
    adminLabel: 'Springs - Contact & Footer',
    gradient: 'from-emerald-950 to-neutral-900',
    defaultName: 'Springs - Contact & Footer',
    aiLabelVi:
      'khối liên hệ + footer cuối trang: tiêu đề mời gửi yêu cầu tư vấn + nút CTA, bên dưới logo/địa chỉ/liên hệ/nav footer/copyright, nền tối',
    aiLabelEn:
      'closing contact + footer block: request-a-callback heading + CTA button, below it logo/address/contact/footer nav/copyright, dark background',
  },
  component: SpringsContactFooter,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'contactHeading',
      label: 'Tiêu đề liên hệ',
      icon: Heading,
      fieldType: 'text',
    },
    {
      key: 'contactDescription',
      label: 'Mô tả liên hệ',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'submitLabel',
      label: 'Nhãn nút gửi',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'footerLogoText',
      label: 'Tên thương hiệu (footer)',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'footerAddress',
      label: 'Địa chỉ',
      icon: MapPin,
      fieldType: 'text',
    },
    {
      key: 'footerPhone',
      label: 'Điện thoại',
      icon: Phone,
      fieldType: 'text',
    },
    {
      key: 'footerEmail',
      label: 'Email',
      icon: Mail,
      fieldType: 'text',
    },
    {
      key: 'footerCopyright',
      label: 'Dòng bản quyền',
      icon: Copyright,
      fieldType: 'text',
    },
  ],
};
