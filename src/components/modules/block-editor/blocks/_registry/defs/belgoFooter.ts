/**
 * BlockDef cho `belgo_footer` — footer pin/scrub: headline reveal, curtain wipe,
 * địa chỉ chi nhánh + socials. Port từ apps/belgo Footer.tsx. Path A registry.
 */
import {
  Image as ImageIcon,
  Link2,
  ListChecks,
  MapPin,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  BelgoFooterContent,
  BelgoFooterHeadlineWord,
  BelgoFooterLocation,
  BelgoFooterSocial,
  TheGrandFooterSocialPlatform,
} from '../../../types';
import type { BlockDef } from '../types';

export const BELGO_FOOTER_DEFAULT_HEADLINE: BelgoFooterHeadlineWord[] = [
  { text: '#DRINK', accent: true },
  { text: 'OUT', accent: false },
  { text: 'OF', accent: false },
  { text: 'THE', accent: false },
  { text: 'ORDINARY', accent: false },
];

export const BELGO_FOOTER_DEFAULT_LOCATIONS: BelgoFooterLocation[] = [
  {
    name: 'DA KAO',
    address: 'A: 159A Nguyễn Văn Thủ,\nĐa Kao Ward, District 1, HCMC',
    tel: 'T: +84 28 3910 0485',
  },
  {
    name: 'TON THAT THIEP',
    address: 'A: 29 - 31 Tôn Thất Thiệp,\nBến Nghé Ward, District 1, HCMC',
    tel: 'T: +84 28 3622 9887',
  },
  {
    name: 'PHAN XICH LONG',
    address: 'A: 186 Phan Xích Long,\nWard 2, Phú Nhuận District, HCMC',
    tel: 'T: +84 28 3517 0983',
  },
  {
    name: 'LE NGO CAT',
    address: 'A: 2 Lê Ngô Cát,\nWard 7, District 3, HCMC',
    tel: 'T: +84 28 3620 5212',
  },
  {
    name: 'BINH DUONG',
    address: 'A: Hikari Complex,\nLô M1-M2 Thủ Dầu Một, Bình Dương',
    tel: 'T: +84 27 4380 3188',
  },
];

export const resolveBelgoFooterHeadlineWords = (
  content: BelgoFooterContent | undefined
): BelgoFooterHeadlineWord[] => {
  const raw = content?.headlineWords;
  if (!Array.isArray(raw) || raw.length === 0) {
    return BELGO_FOOTER_DEFAULT_HEADLINE.map(w => ({ ...w }));
  }
  return raw
    .filter(w => w && typeof w === 'object')
    .map(w => ({
      text: w.text ?? '',
      accent: w.accent ?? false,
    }));
};

export const resolveBelgoFooterLocations = (
  content: BelgoFooterContent | undefined
): BelgoFooterLocation[] => {
  const raw = content?.locations;
  if (!Array.isArray(raw) || raw.length === 0) {
    return BELGO_FOOTER_DEFAULT_LOCATIONS.map(loc => ({ ...loc }));
  }
  return raw
    .filter(loc => loc && typeof loc === 'object')
    .map(loc => ({
      name: loc.name ?? '',
      address: loc.address ?? '',
      tel: loc.tel ?? '',
    }));
};

export const belgoFooterHeadlineElements = (
  words: BelgoFooterHeadlineWord[]
): LayerElement[] => {
  const list = words.length > 0 ? words : BELGO_FOOTER_DEFAULT_HEADLINE;
  return list.map((word, i) => ({
    key: `headlineWords[${i}].text`,
    label: `Headline · ${word.text?.trim() || `Từ ${i + 1}`}`,
    groupId: `headline${i}`,
    ...(i === 0 ? { groupLabel: 'Headline pin' } : null),
    icon: Type,
    fieldType: 'text' as const,
  }));
};

export const belgoFooterLocationElements = (
  locations: BelgoFooterLocation[]
): LayerElement[] => {
  const list =
    locations.length > 0 ? locations : BELGO_FOOTER_DEFAULT_LOCATIONS;
  return list.flatMap((loc, i) => {
    const groupId = `loc${i}`;
    const groupLabel = loc.name?.trim() || `Chi nhánh ${i + 1}`;
    return [
      {
        key: `locations[${i}].name`,
        label: 'Tên',
        groupId,
        groupLabel,
        icon: Tag,
        fieldType: 'text' as const,
      },
      {
        key: `locations[${i}].address`,
        label: 'Địa chỉ',
        groupId,
        icon: MapPin,
        fieldType: 'textarea' as const,
      },
      {
        key: `locations[${i}].tel`,
        label: 'Điện thoại',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
    ];
  });
};

export const BELGO_FOOTER_DEFAULT_SOCIALS: BelgoFooterSocial[] = [
  { platform: 'facebook', href: '#', iconAlt: 'Facebook' },
  { platform: 'instagram', href: '#', iconAlt: 'Instagram' },
  { platform: 'linkedin', href: '#', iconAlt: 'LinkedIn' },
];

const SOCIAL_PLATFORMS: readonly TheGrandFooterSocialPlatform[] = [
  'facebook',
  'instagram',
  'linkedin',
  'tripadvisor',
  'youtube',
  'tiktok',
];

/** Normalize socials — migrate 3 field phẳng cũ nếu chưa có mảng. */
export const resolveBelgoFooterSocials = (
  content: BelgoFooterContent | undefined
): BelgoFooterSocial[] => {
  const raw = content?.socials;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .filter(s => s && typeof s === 'object')
      .map(s => {
        const legacy = s as BelgoFooterSocial & { label?: string };
        const platform = SOCIAL_PLATFORMS.includes(
          legacy.platform as TheGrandFooterSocialPlatform
        )
          ? (legacy.platform as TheGrandFooterSocialPlatform)
          : 'facebook';
        return {
          href: legacy.href ?? '#',
          iconUrl: legacy.iconUrl ?? '',
          iconAlt: legacy.iconAlt?.trim() || legacy.label?.trim() || '',
          platform,
        };
      });
  }

  const legacy: BelgoFooterSocial[] = [];
  if (content?.facebookUrl?.trim()) {
    legacy.push({
      platform: 'facebook',
      href: content.facebookUrl.trim(),
      iconAlt: 'Facebook',
    });
  }
  if (content?.instagramUrl?.trim()) {
    legacy.push({
      platform: 'instagram',
      href: content.instagramUrl.trim(),
      iconAlt: 'Instagram',
    });
  }
  if (content?.linkedinUrl?.trim()) {
    legacy.push({
      platform: 'linkedin',
      href: content.linkedinUrl.trim(),
      iconAlt: 'LinkedIn',
    });
  }
  if (legacy.length > 0) {
    return legacy;
  }

  return BELGO_FOOTER_DEFAULT_SOCIALS.map(s => ({ ...s }));
};

export const belgoFooterSocialElements = (
  socials: BelgoFooterSocial[]
): LayerElement[] => {
  const list = socials.length > 0 ? socials : BELGO_FOOTER_DEFAULT_SOCIALS;
  return list.flatMap((social, i) => {
    const groupId = `social${i}`;
    return [
      {
        key: `socials[${i}].iconUrl`,
        label: 'Icon',
        groupId,
        groupLabel: `Icon ${i + 1}`,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `socials[${i}].href`,
        label: 'Link',
        groupId,
        icon: Link2,
        fieldType: 'text' as const,
      },
      {
        key: `socials[${i}].iconAlt`,
        label: 'Alt icon',
        groupId,
        icon: Tag,
        fieldType: 'text' as const,
      },
    ];
  });
};

const BASE: BelgoFooterContent = {
  logoUrl: '/belgo/logo-2.avif',
  logoAlt: 'Belgő',
  headlineWords: BELGO_FOOTER_DEFAULT_HEADLINE.map(w => ({ ...w })),
  locations: BELGO_FOOTER_DEFAULT_LOCATIONS.map(loc => ({ ...loc })),
  followLabel: 'FOLLOW US ON',
  copyright: 'Copyright © 2025 Belgo The Belgium Brewery',
  socials: BELGO_FOOTER_DEFAULT_SOCIALS.map(s => ({ ...s })),
};

const VI: BelgoFooterContent = { ...BASE };
const EN: BelgoFooterContent = { ...BASE };

export const belgoFooterDef: BlockDef<BelgoFooterContent> = {
  type: 'belgo_footer',
  meta: {
    type: 'belgo_footer',
    category: 'footer',
    style: 'luxury',
    tags: ['belgo', 'beer', 'footer', 'scroll', 'pin'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-03',
    label: 'Belgo · Footer',
    accent: '#e4ddcf',
    adminLabel: 'Belgo Footer',
    gradient: 'from-neutral-950 to-amber-950',
    defaultName: 'Belgo Footer',
    aiLabelVi:
      'footer Belgo pin/scrub: headline #DRINK OUT OF THE ORDINARY, curtain beige wipe, địa chỉ chi nhánh + socials',
    aiLabelEn:
      'Belgo footer pin/scrub: headline word reveal, beige curtain wipe, branch addresses + social links',
  },
  component: dynamic(() =>
    import('../../BelgoFooter').then(m => m.BelgoFooter)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'logoUrl',
      label: 'Logo',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'brand',
      groupLabel: 'Thương hiệu',
    },
    {
      key: 'logoAlt',
      label: 'Alt logo',
      icon: Type,
      fieldType: 'text',
      groupId: 'brand',
    },
    {
      key: 'followLabel',
      label: 'Nhãn social',
      icon: Tag,
      fieldType: 'text',
      groupId: 'social',
      groupLabel: 'Social & bản quyền',
    },
    {
      key: 'copyright',
      label: 'Copyright',
      icon: Type,
      fieldType: 'text',
      groupId: 'social',
    },
    ...belgoFooterSocialElements(BELGO_FOOTER_DEFAULT_SOCIALS),
    {
      key: 'socials',
      label: 'Thêm / xóa icon',
      icon: ListChecks,
    },
    ...belgoFooterHeadlineElements(BELGO_FOOTER_DEFAULT_HEADLINE),
    {
      key: 'headlineWords',
      label: 'Thêm / quản lý headline',
      icon: ListChecks,
    },
    ...belgoFooterLocationElements(BELGO_FOOTER_DEFAULT_LOCATIONS),
    {
      key: 'locations',
      label: 'Thêm / quản lý chi nhánh',
      icon: ListChecks,
    },
  ],
};
