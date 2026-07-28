/**
 * BlockDef cho `the_grand_footer` — chân trang The Grand: nền kem, hàng logo
 * (The Grand · Masterise ngăn bởi kẻ dọc), 4 cột (địa chỉ / email + hotline /
 * chính sách / social + đăng ký bản tin), thanh copyright nâu đậm căn giữa.
 * Port từ apps/the-grand Footer. Path A registry.
 *
 * Layers: field ghép đôi gom bằng `groupId`; `policies[]` và `socials[]` là
 * mảng ĐỘNG — mỗi item 1 folder, thêm/xoá qua popover trong ElementToolbar
 * (pattern aesthaContact — block duy nhất khác có 2 mảng động).
 */
import {
  AtSign,
  Image as ImageIcon,
  Link as LinkIcon,
  ListChecks,
  MapPin,
  Minus,
  Phone,
  Share2,
  Tag,
  TextCursorInput,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  TheGrandFooterContent,
  TheGrandFooterPolicy,
  TheGrandFooterSocial,
} from '../../../types';
import type { BlockDef } from '../types';

const VI_POLICIES: TheGrandFooterPolicy[] = [
  { label: 'Chính Sách Bảo Mật', href: '#' },
  { label: 'Điều Khoản Bảo Mật', href: '#' },
  { label: 'Chính Sách Thanh Toán', href: '#' },
  { label: 'Chính Sách Mua Hàng', href: '#' },
];

const EN_POLICIES: TheGrandFooterPolicy[] = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Privacy', href: '#' },
  { label: 'Payment Policy', href: '#' },
  { label: 'Purchase Policy', href: '#' },
];

const SOCIALS: TheGrandFooterSocial[] = [
  { platform: 'facebook', href: '#' },
  { platform: 'instagram', href: '#' },
  { platform: 'linkedin', href: '#' },
  { platform: 'tripadvisor', href: '#' },
];

const VI: TheGrandFooterContent = {
  logoPrimaryUrl: '/the-grand/the-grand.svg',
  logoPrimaryAlt: 'The Grand Hanoi',
  logoSecondaryUrl: '/the-grand/masterise-homes-logo-dark.svg',
  logoSecondaryAlt: 'Masterise Homes',

  projectAddressLabel: 'Địa Chỉ Dự Án',
  projectAddress:
    '22-24 Hàng Bài, P. Hàng Bài, Q. Hoàn Kiếm, Tp. Hà Nội, Việt Nam',
  showroomAddressLabel: 'Địa Chỉ Nhà Mẫu',
  showroomAddress:
    'T-Place, 30A Lý Thường Kiệt, P. Hàng Bài, Q. Hoàn Kiếm, Tp. Hà Nội, Việt Nam',

  emailLabel: 'Email',
  email: 'thegrand@masterisehomes.com',
  hotlineLabel: 'Hotline',
  hotline: '0828 159 159',

  policies: VI_POLICIES,

  socialLabel: 'Kết Nối Với Chúng Tôi',
  socials: SOCIALS,

  newsletterLabel: 'Đăng Ký Nhận Bản Tin',
  newsletterPlaceholder: 'Email',
  newsletterSubmitText: 'Gửi',

  copyright: '© REXER STUDIO. 2026. ALL RIGHTS RESERVED.',
};

const EN: TheGrandFooterContent = {
  logoPrimaryUrl: '/the-grand/the-grand.svg',
  logoPrimaryAlt: 'The Grand Hanoi',
  logoSecondaryUrl: '/the-grand/masterise-homes-logo-dark.svg',
  logoSecondaryAlt: 'Masterise Homes',

  projectAddressLabel: 'Project Address',
  projectAddress:
    '22-24 Hang Bai, Hang Bai Ward, Hoan Kiem District, Hanoi, Vietnam',
  showroomAddressLabel: 'Showroom Address',
  showroomAddress:
    'T-Place, 30A Ly Thuong Kiet, Hang Bai Ward, Hoan Kiem District, Hanoi, Vietnam',

  emailLabel: 'Email',
  email: 'thegrand@masterisehomes.com',
  hotlineLabel: 'Hotline',
  hotline: '0828 159 159',

  policies: EN_POLICIES,

  socialLabel: 'Connect With Us',
  socials: SOCIALS,

  newsletterLabel: 'Subscribe To Our Newsletter',
  newsletterPlaceholder: 'Email',
  newsletterSubmitText: 'Send',

  copyright: '© REXER STUDIO. 2026. ALL RIGHTS RESERVED.',
};

/**
 * Layer elements cho mảng chính sách — dùng chung bởi `elements` tĩnh của def và
 * `LayersPanel.elementsForType` (expand theo content thật). `groupLabel` chỉ đặt
 * trên phần tử ĐẦU của mỗi group để panel Lớp gộp thành 1 folder.
 */
export const theGrandFooterPolicyElements = (
  policies: TheGrandFooterPolicy[]
): LayerElement[] => {
  const list = policies.length > 0 ? policies : VI_POLICIES;
  return list.flatMap((policy, i) => {
    const groupId = `policy${i}`;
    const groupLabel = policy.label?.trim() || `Chính sách ${i + 1}`;
    return [
      {
        key: `policies[${i}].label`,
        label: 'nhãn',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `policies[${i}].href`,
        label: 'link',
        groupId,
        icon: LinkIcon,
        fieldType: 'text' as const,
      },
    ];
  });
};

/** Layer elements cho mảng social — 1 folder / icon (platform + link). */
export const theGrandFooterSocialElements = (
  socials: TheGrandFooterSocial[]
): LayerElement[] => {
  const list = socials.length > 0 ? socials : SOCIALS;
  return list.flatMap((social, i) => {
    const groupId = `social${i}`;
    const groupLabel =
      social.label?.trim() || social.platform || `Social ${i + 1}`;
    return [
      {
        key: `socials[${i}].href`,
        label: 'link',
        groupId,
        groupLabel,
        icon: LinkIcon,
        fieldType: 'text' as const,
      },
      {
        key: `socials[${i}].label`,
        label: 'nhãn trợ năng',
        groupId,
        icon: Tag,
        fieldType: 'text' as const,
      },
    ];
  });
};

/**
 * Toàn bộ `elements[]` của block — dùng CHUNG bởi def (mảng default) và
 * `LayersPanel.elementsForType` (mảng thật từ content) nên 2 nơi không thể lệch.
 */
export const theGrandFooterElements = (
  policies: TheGrandFooterPolicy[],
  socials: TheGrandFooterSocial[]
): LayerElement[] => [
  {
    key: 'logoPrimaryUrl',
    label: 'Logo The Grand',
    groupId: 'logos',
    groupLabel: 'Hàng logo',
    icon: ImageIcon,
    fieldType: 'image',
  },
  {
    key: 'logoSecondaryUrl',
    label: 'Logo Masterise',
    groupId: 'logos',
    icon: ImageIcon,
    fieldType: 'image',
  },
  { key: 'logoDivider', label: 'Kẻ dọc', groupId: 'logos', icon: Minus },

  {
    key: 'projectAddressLabel',
    label: 'nhãn dự án',
    groupId: 'address',
    groupLabel: 'Địa chỉ',
    icon: Tag,
    fieldType: 'text',
  },
  {
    key: 'projectAddress',
    label: 'địa chỉ dự án',
    groupId: 'address',
    icon: MapPin,
    fieldType: 'textarea',
  },
  {
    key: 'showroomAddressLabel',
    label: 'nhãn nhà mẫu',
    groupId: 'address',
    icon: Tag,
    fieldType: 'text',
  },
  {
    key: 'showroomAddress',
    label: 'địa chỉ nhà mẫu',
    groupId: 'address',
    icon: MapPin,
    fieldType: 'textarea',
  },

  {
    key: 'emailLabel',
    label: 'nhãn email',
    groupId: 'contact',
    groupLabel: 'Liên hệ',
    icon: Tag,
    fieldType: 'text',
  },
  {
    key: 'email',
    label: 'email',
    groupId: 'contact',
    icon: AtSign,
    fieldType: 'text',
  },
  {
    key: 'hotlineLabel',
    label: 'nhãn hotline',
    groupId: 'contact',
    icon: Tag,
    fieldType: 'text',
  },
  {
    key: 'hotline',
    label: 'hotline',
    groupId: 'contact',
    icon: Phone,
    fieldType: 'text',
  },

  ...theGrandFooterPolicyElements(policies),
  { key: 'policies', label: 'Thêm / quản lý chính sách', icon: ListChecks },

  {
    key: 'socialLabel',
    label: 'Nhãn cột social',
    icon: Share2,
    fieldType: 'text',
  },
  ...theGrandFooterSocialElements(socials),
  { key: 'socials', label: 'Thêm / quản lý social', icon: ListChecks },

  {
    key: 'newsletterLabel',
    label: 'nhãn bản tin',
    groupId: 'newsletter',
    groupLabel: 'Đăng ký bản tin',
    icon: Tag,
    fieldType: 'text',
  },
  {
    key: 'newsletterPlaceholder',
    label: 'placeholder',
    groupId: 'newsletter',
    icon: TextCursorInput,
    fieldType: 'text',
  },
  {
    key: 'newsletterSubmitText',
    label: 'chữ nút gửi',
    groupId: 'newsletter',
    icon: Type,
    fieldType: 'text',
  },

  { key: 'copyright', label: 'Copyright', icon: Type, fieldType: 'text' },
];

export const theGrandFooterDef: BlockDef<TheGrandFooterContent> = {
  type: 'the_grand_footer',
  meta: {
    type: 'the_grand_footer',
    label: 'The Grand · Footer',
    accent: '#f2ecdf',
    adminLabel: 'The Grand Footer',
    gradient: 'from-amber-50 to-stone-200',
    defaultName: 'The Grand Footer',
    aiLabelVi:
      'chân trang The Grand: nền kem, hàng logo The Grand · Masterise ngăn bởi kẻ dọc, 4 cột (địa chỉ / email + hotline / chính sách / social + đăng ký bản tin), thanh copyright nâu đậm căn giữa',
    aiLabelEn:
      'The Grand footer: cream backdrop, The Grand · Masterise logo row split by a vertical rule, four columns (addresses / email + hotline / policies / socials + newsletter), dark centred copyright bar',
  },
  component: dynamic(() =>
    import('../../TheGrandFooter').then(m => m.TheGrandFooter)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: theGrandFooterElements(VI_POLICIES, SOCIALS),
};
