/**
 * BlockDef cho `framer_perform_pricing` — sticky deck-scroll pricing cards.
 * Pattern tiers giống `mintv2_process` / `framer_darling_timeline`.
 */
import {
  ImageIcon,
  Link2,
  ListChecks,
  MousePointerClick,
  Pilcrow,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { FramerPerformPricingContent } from '../../../types';
import type { BlockDef } from '../types';

type PricingTier = FramerPerformPricingContent['tiers'][number];

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80';

const VI_TIERS: PricingTier[] = [
  {
    imageUrl: DEFAULT_IMG,
    price: '$59/tháng',
    title: 'Cơ bản',
    features:
      'Tư vấn ban đầu miễn phí\nCập nhật kế hoạch tập 2 tuần/lần\nKiểm tra hàng tuần',
    ctaLabel: 'Liên hệ',
    ctaHref: '#contact',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1024&q=80',
    price: '$99/tháng',
    title: 'Tiêu chuẩn',
    features:
      'Tất cả của gói trước\nXây dựng chiến lược đua cụ thể\nƯu đãi từ đối tác',
    ctaLabel: 'Liên hệ',
    ctaHref: '#contact',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1024&q=80',
    price: '$169/tháng',
    title: 'Cao cấp',
    features:
      'Tất cả của gói trước\nCập nhật kế hoạch không giới hạn\nHỗ trợ tư duy hiệu suất tối ưu',
    ctaLabel: 'Liên hệ',
    ctaHref: '#contact',
  },
];

const EN_TIERS: PricingTier[] = [
  {
    imageUrl: DEFAULT_IMG,
    price: '$59/month',
    title: 'Basic',
    features:
      'Free initial consultation\n1x per 2 weeks training plan update\nWeekly checking',
    ctaLabel: 'Get in touch',
    ctaHref: '#contact',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1024&q=80',
    price: '$99/month',
    title: 'Standard',
    features:
      'All of the previous\nDevelopment of a specific race strategy\nBenefits from my partners',
    ctaLabel: 'Get in touch',
    ctaHref: '#contact',
  },
  {
    imageUrl:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1024&q=80',
    price: '$169/month',
    title: 'Premium',
    features:
      'All of the previous\nUnlimited plan updates and modifications\nWorking together on mindset for optimal performance',
    ctaLabel: 'Get in touch',
    ctaHref: '#contact',
  },
];

const VI: FramerPerformPricingContent = {
  eyebrow: 'Pricing',
  heading: 'Chọn gói của bạn',
  subheading:
    'Chọn gói phù hợp với mục tiêu tập luyện. Hủy hoặc nâng cấp bất cứ lúc nào.',
  tiers: VI_TIERS,
};

const EN: FramerPerformPricingContent = {
  eyebrow: 'Pricing',
  heading: 'Choose your plan',
  subheading:
    'Pick the plan that fits your training goals. Cancel or upgrade any time.',
  tiers: EN_TIERS,
};

/** Layers folders — 1 group / pricing tier. */
export const framerPerformPricingTierElements = (
  tiers: PricingTier[]
): LayerElement[] => {
  const list = tiers.length > 0 ? tiers : VI_TIERS;
  return list.flatMap((tier, i) => {
    const groupId = `tier${i}`;
    const groupLabel = tier.title?.trim() || `Gói ${i + 1}`;
    return [
      {
        key: `tiers[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `tiers[${i}].price`,
        label: 'Giá',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `tiers[${i}].title`,
        label: 'Tên gói',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `tiers[${i}].features`,
        label: 'Tính năng',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
      {
        key: `tiers[${i}].ctaLabel`,
        label: 'CTA — Chữ',
        groupId,
        icon: MousePointerClick,
        fieldType: 'text' as const,
      },
      {
        key: `tiers[${i}].ctaHref`,
        label: 'CTA — Link',
        groupId,
        icon: Link2,
        fieldType: 'link' as const,
      },
    ];
  });
};

export const framerPerformPricingDef: BlockDef<FramerPerformPricingContent> = {
  type: 'framer_perform_pricing',
  meta: {
    type: 'framer_perform_pricing',
    category: 'pricing',
    style: 'modern',
    tags: ['clone', 'framer', 'pricing'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Perform Pricing',
    accent: '#0c0c0c',
    adminLabel: 'Pricing Cards (Perform)',
    gradient: 'from-neutral-200 to-white',
    defaultName: 'Bảng giá',
    aiLabelVi: 'stack pricing card: ảnh trái + giá/tính năng/CTA phải mỗi card',
    aiLabelEn:
      'stacked pricing cards: image left + price/features/CTA right per card',
  },
  component: dynamic(() =>
    import('../../FramerPerformPricing').then(m => m.FramerPerformPricing)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subheading', label: 'Mô tả', icon: Pilcrow, fieldType: 'textarea' },
    ...framerPerformPricingTierElements(VI_TIERS),
    {
      key: 'tiers',
      label: 'Thêm / quản lý gói',
      icon: ListChecks,
    },
  ],
};
