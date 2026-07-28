/**
 * BlockDef cho `the_grand_about` — section "Giới Thiệu" The Grand: nền nâu tối,
 * trái ảnh skyline (clip-reveal + Ken Burns), phải cột nội dung (logo thương
 * hiệu → tiêu đề serif → mô tả → kẻ ngang → hàng logo đối tác). Port từ
 * apps/the-grand About. Path A registry.
 *
 * Layers: mỗi đối tác = 1 folder `groupId` — logo / vai trò editable từng field
 * (pattern the_grand_service). Content vẫn là `partners[]` động;
 * `elementsForType` expand từ content khi số đối tác ≠ default.
 */
import {
  Image as ImageIcon,
  ListChecks,
  Minus,
  Pilcrow,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  TheGrandAboutContent,
  TheGrandAboutPartner,
} from '../../../types';
import type { BlockDef } from '../types';

const VI_PARTNERS: TheGrandAboutPartner[] = [
  {
    name: 'GroupGSA',
    logo: '/the-grand/partner-groupgsa.svg',
    role: 'Công ty kiến trúc',
  },
  {
    name: 'Artelia',
    logo: '/the-grand/partner-artelia.svg',
    role: 'Tư vấn và quản lý dự án',
  },
  {
    name: 'HBA',
    logo: '/the-grand/partner-hba.svg',
    role: 'Thiết kế nội thất',
  },
];

const EN_PARTNERS: TheGrandAboutPartner[] = [
  {
    name: 'GroupGSA',
    logo: '/the-grand/partner-groupgsa.svg',
    role: 'Architecture firm',
  },
  {
    name: 'Artelia',
    logo: '/the-grand/partner-artelia.svg',
    role: 'Project consultancy and management',
  },
  {
    name: 'HBA',
    logo: '/the-grand/partner-hba.svg',
    role: 'Interior design',
  },
];

const VI: TheGrandAboutContent = {
  logoUrl: '/the-grand/masterise-homes-logo.svg',
  logoAlt: 'MASTERISE HOMES',
  heading: 'Giới Thiệu về Masterise Homes',
  description:
    'Masterise Homes – thành viên của tập đoàn Masterise Group, là nhà phát triển bất động sản quốc tế tiên phong áp dụng các chuẩn mực toàn cầu vào việc phát triển, vận hành và quản lý các sản phẩm, dịch vụ bất động sản tại Việt Nam và thế giới.',
  imageUrl: '/the-grand/about.png',
  imageAlt: 'Skyline đô thị lúc hoàng hôn',
  partners: VI_PARTNERS,
};

const EN: TheGrandAboutContent = {
  logoUrl: '/the-grand/masterise-homes-logo.svg',
  logoAlt: 'MASTERISE HOMES',
  heading: 'About Masterise Homes',
  description:
    'Masterise Homes — a member of Masterise Group — is an international real estate developer pioneering the application of global standards to the development, operation and management of real estate products and services in Vietnam and worldwide.',
  imageUrl: '/the-grand/about.png',
  imageAlt: 'City skyline at sunset',
  partners: EN_PARTNERS,
};

/**
 * Layer elements cho hàng đối tác — dùng chung bởi `elements` tĩnh của def và
 * `LayersPanel.elementsForType` (expand theo content thật). `groupLabel` chỉ đặt
 * trên phần tử ĐẦU của mỗi group để panel Lớp gộp thành 1 folder.
 */
export const theGrandAboutPartnerElements = (
  partners: TheGrandAboutPartner[]
): LayerElement[] => {
  const list = partners.length > 0 ? partners : VI_PARTNERS;
  return list.flatMap((partner, i) => {
    const groupId = `partner${i}`;
    const groupLabel = partner.name?.trim() || `Đối tác ${i + 1}`;
    return [
      {
        key: `partners[${i}].logo`,
        label: 'logo',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `partners[${i}].role`,
        label: 'vai trò',
        groupId,
        icon: Tag,
        fieldType: 'text' as const,
      },
    ];
  });
};

export const theGrandAboutDef: BlockDef<TheGrandAboutContent> = {
  type: 'the_grand_about',
  meta: {
    type: 'the_grand_about',
    label: 'The Grand · About',
    accent: '#4a3122',
    adminLabel: 'The Grand About',
    gradient: 'from-amber-950 to-stone-900',
    defaultName: 'The Grand About',
    aiLabelVi:
      'section giới thiệu The Grand: nền nâu gradient, trái ảnh skyline clip-reveal, phải cột nội dung (logo thương hiệu, tiêu đề serif, mô tả, kẻ ngang, hàng logo đối tác)',
    aiLabelEn:
      'The Grand about section: brown gradient backdrop, left skyline image with clip reveal, right content column (brand logo, serif title, copy, divider rule, partner logo row)',
  },
  component: dynamic(() =>
    import('../../TheGrandAbout').then(m => m.TheGrandAbout)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'logoUrl',
      label: 'Logo thương hiệu',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    {
      key: 'description',
      label: 'Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    { key: 'imageUrl', label: 'Ảnh', icon: ImageIcon, fieldType: 'image' },
    { key: 'rule', label: 'Kẻ ngang', icon: Minus },
    ...theGrandAboutPartnerElements(VI_PARTNERS),
    { key: 'partners', label: 'Thêm / quản lý đối tác', icon: ListChecks },
  ],
};
