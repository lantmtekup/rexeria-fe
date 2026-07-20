'use client';

import * as React from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Blend,
  CheckCircle,
  ChevronRight,
  Film,
  FormInput,
  Grid3x3,
  GripVertical,
  Image as ImageIcon,
  Layers as LayersIcon,
  Link2,
  ListChecks,
  MousePointerClick,
  Paintbrush,
  Palette,
  Pilcrow,
  SquareDashed,
  Type,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import { AddExtraElementButton } from './AddExtraElementButton';
import { ExtraElementsList } from './ExtraElementsList';
import { resolvePnjParagraphs } from './blocks/PnjDetails';
import { resolvePnjHeroTitleLines } from './blocks/pnjHeroTitleLines';
import { realEstateHeroStatElements } from './blocks/_registry/defs/realEstateHero';
import { realEstateHighlightItemElements } from './blocks/_registry/defs/realEstateHighlights';
import { realEstateOverviewStatElements } from './blocks/_registry/defs/realEstateOverview';
import { realEstateUtilityItemElements } from './blocks/_registry/defs/realEstateUtilities';
import { realEstateVillaSlideElements } from './blocks/_registry/defs/realEstateVilla';
import { pnjVariantItemElements } from './blocks/_registry/defs/pnjVariant';
import { mintDiscoverTabElements } from './blocks/_registry/defs/mintDiscover';
import { mintV2ProcessStepElements } from './blocks/_registry/defs/mintV2Process';
import { mintV2ServicesItemElements } from './blocks/_registry/defs/mintV2Services';
import { mintV2WorksCardElements } from './blocks/_registry/defs/mintV2Works';
import { mintVaultCoinElements } from './blocks/mintVaultCollectionElements';
import { mintVaultCraftItemElements } from './blocks/mintVaultCraftElements';
import { mintVaultInvitationImageElements } from './blocks/mintVaultInvitationElements';
import { mintVaultRevealImageElements } from './blocks/mintVaultRevealElements';
import { pnjStickyMenuItemElements } from './blocks/_registry/defs/pnjStickyMenu';
import { getBlockDef } from './blocks/_registry/registry';
import {
  editingVariantOf,
  hasMobileOverride,
  readVariant,
  type Block,
  type BlockType,
  type Device,
  type ExtraElementKind,
  type PnjHeroContent,
  type PnjVariantItem,
  type PnjStickyMenuItem,
  type RealEstateHeroStat,
  type RealEstateOverviewStat,
  type RealEstateHighlightItem,
  type RealEstateVillaSlide,
  type RealEstateUtilityItem,
  type MintDiscoverTab,
  type MintV2ProcessStep,
  type MintV2ServiceItem,
  type MintV2WorkCard,
  type MintVaultCoin,
  type MintVaultCraftItem,
} from './types';

export interface LayerElement {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /**
   * Kiểu field cho ElementToolbar — registry-driven. Khai trong BlockDef để
   * editor biết hiện control gì (ô text / textarea / image picker) mà KHÔNG
   * phải đoán theo tên key. Bỏ trống → fallback heuristic cũ.
   */
  fieldType?: 'text' | 'textarea' | 'image';
  /**
   * Cùng `groupId` → gom thành 1 folder collapsible trong panel Lớp.
   * Opt-in: block không khai vẫn list phẳng.
   */
  groupId?: string;
  /** Nhãn group (vd. "Slide 1") — chỉ cần trên phần tử đầu của group. */
  groupLabel?: string;
}

/** View-model node for the layers tree (1-level groups). */
export type LayerTreeNode =
  | { kind: 'leaf'; element: LayerElement }
  | {
      kind: 'group';
      groupId: string;
      label: string;
      children: LayerElement[];
    };

/**
 * Build a 1-level tree from ordered elements. Contiguous runs that share
 * `groupId` become a group; everything else stays a top-level leaf.
 */
export function buildLayerTree(ordered: LayerElement[]): LayerTreeNode[] {
  const nodes: LayerTreeNode[] = [];
  let i = 0;
  while (i < ordered.length) {
    const el = ordered[i];
    if (!el.groupId) {
      nodes.push({ kind: 'leaf', element: el });
      i += 1;
      continue;
    }
    const groupId = el.groupId;
    const children: LayerElement[] = [];
    while (i < ordered.length && ordered[i].groupId === groupId) {
      children.push(ordered[i]);
      i += 1;
    }
    nodes.push({
      kind: 'group',
      groupId,
      label: children[0]?.groupLabel ?? groupId,
      children,
    });
  }
  return nodes;
}

interface LayersPanelProps {
  block: Block;
  device: Device;
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
  /** Persist a new order to the block's elementOrder field. */
  onReorder?: (nextOrder: string[]) => void;
  /** ExtraElements (free-drag user-added objects). Optional — when omitted
   *  the panel hides the "+ Thêm element" affordance entirely. */
  selectedExtraElementId?: string | null;
  onAddExtraElement?: (kind: ExtraElementKind) => void;
  onSelectExtraElement?: (id: string | null) => void;
  onRemoveExtraElement?: (id: string) => void;
}

export const BACKGROUND_LAYER_KEY = '__background__';

const BACKGROUND_LAYER: LayerElement = {
  key: BACKGROUND_LAYER_KEY,
  label: 'Nền (màu / ảnh)',
  icon: Paintbrush,
};

export const ELEMENTS_BY_TYPE: Partial<Record<BlockType, LayerElement[]>> = {
  hero_split: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'imageUrl', label: 'Ảnh hero', icon: ImageIcon },
    { key: 'stats', label: 'Thống kê', icon: SquareDashed },
    { key: 'ctaText', label: 'Nút CTA', icon: MousePointerClick },
  ],
  hero_overlay: [
    BACKGROUND_LAYER,
    { key: 'tag', label: 'Tag', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'subtitle', label: 'Mô tả', icon: Pilcrow },
    { key: 'backgroundUrl', label: 'Ảnh nền', icon: ImageIcon },
    { key: 'ctaText', label: 'Nút CTA', icon: MousePointerClick },
  ],
  // `framer_yume_hero` đã chuyển sang registry (elementsForType lấy từ def).
  framer_yuya_hero: [
    BACKGROUND_LAYER,
    { key: 'firstName', label: 'Tên (dòng 1)', icon: Type },
    { key: 'lastName', label: 'Họ (dòng 2)', icon: Type },
    { key: 'avatarUrl', label: 'Ảnh avatar', icon: ImageIcon },
    { key: 'email', label: 'Email', icon: Type },
    { key: 'bio', label: 'Bio', icon: Pilcrow },
  ],
  framer_arpeggio_hero_v2: [
    BACKGROUND_LAYER,
    { key: 'backgroundUrl', label: 'Ảnh nền', icon: ImageIcon },
    { key: 'headline', label: 'Tiêu đề', icon: Type },
    { key: 'subtitle', label: 'Subtitle', icon: Pilcrow },
    { key: 'topRightLabel', label: 'Nhãn góc phải', icon: Type },
    { key: 'wordmark', label: 'Wordmark', icon: Type },
    { key: 'wordmarkSuffix', label: 'Ký hiệu', icon: Type },
  ],
  framer_perform_hero: [
    BACKGROUND_LAYER,
    { key: 'backgroundUrl', label: 'Ảnh nền', icon: ImageIcon },
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'subtitle', label: 'Mô tả', icon: Pilcrow },
    { key: 'ctaLabel', label: 'Nút CTA', icon: MousePointerClick },
    { key: 'reviewCount', label: 'Đánh giá', icon: Type },
  ],
  framer_intro_redefined: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'body', label: 'Nội dung', icon: Pilcrow },
  ],
  framer_explore_cta: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'headline', label: 'Tiêu đề', icon: Type },
    { key: 'linkLabel', label: 'Nhãn link', icon: MousePointerClick },
  ],
  framer_studio_manifesto: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'body', label: 'Nội dung', icon: Pilcrow },
    { key: 'signature', label: 'Chữ ký', icon: Type },
  ],
  framer_stats_grid: [
    BACKGROUND_LAYER,
    { key: 'backgroundUrl', label: 'Ảnh nền', icon: ImageIcon },
    { key: 'stats', label: 'Chỉ số', icon: Grid3x3 },
  ],
  framer_projects_grid: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'projects', label: 'Dự án', icon: Grid3x3 },
  ],
  framer_team_directory: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'members', label: 'Thành viên', icon: Grid3x3 },
  ],
  framer_image_stagger: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'images', label: 'Ảnh', icon: Grid3x3 },
  ],
  framer_clarity_services: [
    BACKGROUND_LAYER,
    { key: 'centerImageUrl', label: 'Ảnh giữa', icon: ImageIcon },
    { key: 'services', label: 'Dịch vụ', icon: Grid3x3 },
  ],
  framer_aestha_editorial: [
    BACKGROUND_LAYER,
    { key: 'brand', label: 'Brand', icon: Type },
    { key: 'tagline', label: 'Tagline', icon: Pilcrow },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'image1Url', label: 'Ảnh 1', icon: ImageIcon },
    { key: 'image2Url', label: 'Ảnh 2', icon: ImageIcon },
    { key: 'image3Url', label: 'Ảnh 3', icon: ImageIcon },
    { key: 'ctaText', label: 'Nút CTA', icon: MousePointerClick },
    { key: 'navLinks', label: 'Nav', icon: Grid3x3 },
  ],
  framer_perform_about: [
    BACKGROUND_LAYER,
    { key: 'testimonials', label: 'Testimonials', icon: Grid3x3 },
  ],
  housent_our_excellence: [
    BACKGROUND_LAYER,
    { key: 'badge', label: 'Badge', icon: Type },
    { key: 'heading', label: 'Tiêu đề', icon: Type },
    { key: 'body', label: 'Mô tả', icon: Pilcrow },
  ],
  framer_perform_pricing: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'heading', label: 'Tiêu đề', icon: Type },
    { key: 'subheading', label: 'Mô tả', icon: Pilcrow },
    { key: 'tiers', label: 'Gói giá', icon: Grid3x3 },
  ],
  framer_faq_minimal: [
    BACKGROUND_LAYER,
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'ctaText', label: 'Nút CTA', icon: MousePointerClick },
    { key: 'items', label: 'Câu hỏi', icon: ListChecks },
  ],
  framer_darling_timeline: [
    BACKGROUND_LAYER,
    { key: 'heading', label: 'Tiêu đề', icon: Type },
    { key: 'intro', label: 'Mô tả', icon: Pilcrow },
    { key: 'items', label: 'Mốc thời gian', icon: Grid3x3 },
  ],
  framer_signature_feature: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'imageUrl', label: 'Ảnh', icon: ImageIcon },
    { key: 'bullets', label: 'Bullet points', icon: ListChecks },
  ],
  framer_vs_collins_projects: [
    BACKGROUND_LAYER,
    { key: 'items', label: 'Dự án', icon: Grid3x3 },
  ],
  feature_section: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'features', label: 'Danh sách tiện ích', icon: Grid3x3 },
  ],
  booking_form: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'reasons', label: 'Lý do', icon: ListChecks },
    { key: 'submitText', label: 'Nút gửi', icon: MousePointerClick },
    { key: 'noteText', label: 'Ghi chú', icon: FormInput },
  ],
  cta_section: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'subtitle', label: 'Mô tả', icon: Pilcrow },
    { key: 'backgroundUrl', label: 'Ảnh nền', icon: ImageIcon },
    { key: 'primaryText', label: 'CTA chính', icon: MousePointerClick },
    { key: 'secondaryText', label: 'CTA phụ', icon: MousePointerClick },
  ],
  mint_details: [
    BACKGROUND_LAYER,
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'paragraph1', label: 'Đoạn 1', icon: Pilcrow },
    { key: 'paragraph2', label: 'Đoạn 2', icon: Pilcrow },
  ],
  mint_sku: [
    BACKGROUND_LAYER,
    { key: 'title', label: 'Tiêu đề lớn', icon: Type },
    { key: 'paintingUrl', label: 'Ảnh nền (painting)', icon: ImageIcon },
    { key: 'packagingUrl', label: 'Ảnh packaging', icon: ImageIcon },
  ],
  mint_variants: [
    BACKGROUND_LAYER,
    { key: 'titleLine1', label: 'Tiêu đề dòng 1', icon: Type },
    { key: 'titleLine2', label: 'Tiêu đề dòng 2', icon: Type },
    { key: 'variants', label: 'Biến thể (swatch)', icon: Grid3x3 },
    {
      key: 'discover.title',
      label: 'Tiêu đề',
      icon: Type,
      groupId: 'discover',
      groupLabel: 'Drawer chi tiết',
    },
    {
      key: 'discover.badge',
      label: 'Nhãn (mintage)',
      icon: Type,
      groupId: 'discover',
    },
    {
      key: 'discover.subtitle',
      label: 'Phụ đề',
      icon: Type,
      groupId: 'discover',
    },
    {
      key: 'discover.dimensions',
      label: 'Kích thước',
      icon: Pilcrow,
      groupId: 'discover',
    },
    {
      key: 'discover.faceValue',
      label: 'Face value',
      icon: Type,
      groupId: 'discover',
    },
    {
      key: 'discover.detailsText',
      label: 'Chi tiết',
      icon: Pilcrow,
      groupId: 'discover',
    },
    {
      key: 'discover.packagingText',
      label: 'Đóng gói',
      icon: Pilcrow,
      groupId: 'discover',
    },
    {
      key: 'discover.shippingText',
      label: 'Vận chuyển',
      icon: Pilcrow,
      groupId: 'discover',
    },
  ],
  mint_hero: [
    BACKGROUND_LAYER,
    { key: 'heroLine1', label: 'Overlay dòng 1', icon: Type },
    { key: 'heroLine2', label: 'Overlay dòng 2', icon: Type },
    { key: 'heroLine3', label: 'Overlay dòng 3', icon: Type },
  ],
  mintv2_emblem: [
    BACKGROUND_LAYER,
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'coinUrl', label: 'Ảnh coin', icon: ImageIcon },
    { key: 'decorUrl', label: 'Ảnh nền (tranh)', icon: ImageIcon },
  ],
  mintv2_services: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề lớn', icon: Type, fieldType: 'text' },
    // items expand via elementsForType(mintv2_services) + mintV2ServicesItemElements
  ],
  mintv2_manifesto: [
    BACKGROUND_LAYER,
    { key: 'text', label: 'Tuyên ngôn', icon: Pilcrow },
  ],
  mintv2_process: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề lớn', icon: Type, fieldType: 'text' },
    // line/dot + steps expand via elementsForType(mintv2_process)
  ],
  mintv2_cta: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'contacts', label: 'Liên hệ', icon: ListChecks },
    { key: 'buyLabel', label: 'Link mua', icon: Type },
  ],
  mintv2_works: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề lớn', icon: Type },
    // cards expand via elementsForType(mintv2_works) + mintV2WorksCardElements
  ],
  linea_portfolio: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'headingPre', label: 'Tiêu đề (trước)', icon: Type },
    { key: 'headingAccent', label: 'Tiêu đề (nhấn)', icon: Type },
    { key: 'headingPost', label: 'Tiêu đề (sau)', icon: Type },
    { key: 'items', label: 'Lưới ảnh', icon: Grid3x3 },
  ],
  mint_vault_hero: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'hintText', label: 'Gợi ý cursor', icon: Type },
    { key: 'images', label: 'Ảnh trail', icon: Grid3x3 },
  ],
  mint_vault_craft: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'items', label: 'Mục accordion', icon: ListChecks },
  ],
  mint_vault_collection: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'subLabel', label: 'Nhãn phụ', icon: Type },
    { key: 'coins', label: 'Bộ sưu tập coin', icon: ListChecks },
  ],
  mint_vault_invitation: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'note', label: 'Ghi chú', icon: Pilcrow, fieldType: 'textarea' },
    // Cụm form — groupId liền kề mới gom thành 1 folder (buildLayerTree).
    {
      key: 'emailPlaceholder',
      label: 'Placeholder',
      groupId: 'form',
      groupLabel: 'Form lead',
      icon: FormInput,
      fieldType: 'text',
    },
    {
      key: 'submitText',
      label: 'Nút gửi',
      groupId: 'form',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    {
      key: 'successMessage',
      label: 'Lời cảm ơn',
      groupId: 'form',
      icon: CheckCircle,
      fieldType: 'textarea',
    },
    {
      key: 'backgroundImageUrl',
      label: 'Ảnh nền',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'images', label: 'Ảnh explosion', icon: Grid3x3 },
  ],
  mint_discover: [
    BACKGROUND_LAYER,
    { key: 'mainImage', label: 'Ảnh coin', icon: ImageIcon },
    { key: 'mainAlt', label: 'Alt ảnh', icon: Type },
    { key: 'tabs', label: 'Hotspot / chi tiết', icon: ListChecks },
  ],
  image_carousel: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'slides', label: 'Slides', icon: Grid3x3 },
  ],
  stories: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'slides', label: 'Story slides', icon: ImageIcon },
  ],
  split_screen: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'views', label: 'Khung so sánh', icon: SquareDashed },
  ],
  quiz: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'questions', label: 'Câu hỏi', icon: ListChecks },
    { key: 'results', label: 'Kết quả', icon: Grid3x3 },
  ],
  poll: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'question', label: 'Câu hỏi', icon: Type },
    { key: 'options', label: 'Lựa chọn', icon: ListChecks },
  ],
  carousel_3d: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'slides', label: 'Slides', icon: Grid3x3 },
  ],
  flipbook: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'pages', label: 'Trang', icon: ImageIcon },
  ],
  panorama: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'imageUrl', label: 'Ảnh 360°', icon: ImageIcon },
  ],
  text_displace_hero: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
  ],
  image_trail: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  sticky_scroll_cards: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  gallery_3d_depth: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  parallax_hero: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  lightbox_flip: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  flip_gallery: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  wheel_gallery: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  hover_reveal_list: [
    BACKGROUND_LAYER,
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  hover_equalizer_heading: [
    BACKGROUND_LAYER,
    { key: 'heading', label: 'Tiêu đề', icon: Type },
  ],
  image_explosion: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  marquee_band: [
    BACKGROUND_LAYER,
    { key: 'text', label: 'Chữ chạy', icon: Type },
  ],
  story_slides: [
    BACKGROUND_LAYER,
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  accordion_media: [BACKGROUND_LAYER],
  spotlight: [BACKGROUND_LAYER, { key: 'title', label: 'Chữ', icon: Type }],
  process_steps: [
    BACKGROUND_LAYER,
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  dot_matrix: [BACKGROUND_LAYER, { key: 'title', label: 'Chữ', icon: Type }],
  interactive_grid: [BACKGROUND_LAYER],
  pixel_reveal: [
    BACKGROUND_LAYER,
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  letter_slider: [BACKGROUND_LAYER],
  seamless_scroll_gallery: [
    BACKGROUND_LAYER,
    { key: 'title', label: 'Tiêu đề', icon: Type },
  ],
  product_spec_sheet: [
    BACKGROUND_LAYER,
    { key: 'eyebrow', label: 'Eyebrow', icon: Type },
    { key: 'title', label: 'Tiêu đề', icon: Type },
    { key: 'description', label: 'Mô tả', icon: Pilcrow },
    { key: 'imageUrl', label: 'Ảnh', icon: ImageIcon },
  ],
};

/**
 * Element con của 1 block — registry-first (BlockDef.elements + layer nền),
 * fallback map ELEMENTS_BY_TYPE cho block CHƯA migrate sang registry.
 * `pnj_details`: expand `paragraphs[i]` từ content.
 * `pnj_hero`: expand `titleLines[i]` từ content.
 * `pnj_variant`: expand từng góc với groupId (pattern ScrollMattis).
 */
export function elementsForType(
  type: BlockType,
  content?: Record<string, unknown> | null
): LayerElement[] {
  const def = getBlockDef(type);
  if (type === 'pnj_details') {
    // Same normalize as canvas/toolbar — tránh layers lệch khi còn legacy paragraph1/2.
    const list = resolvePnjParagraphs(
      (content ?? {}) as unknown as Parameters<typeof resolvePnjParagraphs>[0]
    );
    const slots = list.map((_, i) => ({
      key: `paragraphs[${i}]`,
      label: `Đoạn ${i + 1}`,
      icon: Pilcrow,
      fieldType: 'textarea' as const,
    }));
    return [
      BACKGROUND_LAYER,
      { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
      ...slots,
      {
        key: 'paragraphs',
        label: 'Thêm / quản lý đoạn',
        icon: ListChecks,
      },
    ];
  }
  if (type === 'pnj_hero') {
    const lines = resolvePnjHeroTitleLines(
      (content ?? {}) as unknown as PnjHeroContent
    );
    const titleSlots = lines.map((_, i) => ({
      key: `titleLines[${i}]`,
      label: `Tiêu đề dòng ${i + 1}`,
      icon: Type,
      fieldType: 'text' as const,
    }));
    return [
      BACKGROUND_LAYER,
      {
        key: 'subtitle',
        label: 'Subtitle / brand',
        icon: Type,
        fieldType: 'text' as const,
      },
      ...titleSlots,
      {
        key: 'titleLines',
        label: 'Thêm / quản lý tiêu đề',
        icon: ListChecks,
      },
      {
        key: 'storefrontUrl',
        label: 'Ảnh storefront',
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: 'hotspots',
        label: 'Hotspot / chi tiết',
        icon: ListChecks,
      },
      {
        key: 'frames',
        label: 'Frame sequence / JSON',
        icon: Film,
      },
      {
        key: 'scrim',
        label: 'Lớp mờ / scrim',
        icon: Blend,
      },
    ];
  }
  if (type === 'pnj_variant') {
    const raw = content?.variants;
    const variants = Array.isArray(raw)
      ? (raw as PnjVariantItem[]).filter(
          v => v && typeof v === 'object' && typeof v.label === 'string'
        )
      : [];
    return [
      BACKGROUND_LAYER,
      ...pnjVariantItemElements(variants),
      {
        key: 'variants',
        label: 'Thêm / quản lý góc',
        icon: ListChecks,
      },
      { key: 'ctaText', label: 'CTA', icon: Type, fieldType: 'text' },
    ];
  }
  if (type === 'real_estate_hero') {
    const raw = content?.stats;
    const stats = Array.isArray(raw)
      ? (raw as RealEstateHeroStat[]).filter(
          s => s && typeof s === 'object' && typeof s.label === 'string'
        )
      : [];
    return [
      BACKGROUND_LAYER,
      {
        key: 'imageUrl',
        label: 'Ảnh banner',
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      ...realEstateHeroStatElements(stats),
      {
        key: 'stats',
        label: 'Thêm / quản lý thông số',
        icon: ListChecks,
      },
    ];
  }
  if (type === 'real_estate_overview') {
    const raw = content?.stats;
    const stats = Array.isArray(raw)
      ? (raw as RealEstateOverviewStat[]).filter(
          s => s && typeof s === 'object' && typeof s.text === 'string'
        )
      : [];
    // Không có mục list manager: số hạng mục cố định 6 (mỗi icon gắn ngữ nghĩa
    // riêng với chữ của nó) — xem docblock `defs/realEstateOverview.ts`.
    return [
      BACKGROUND_LAYER,
      {
        key: 'title',
        label: 'Tiêu đề',
        icon: Type,
        fieldType: 'text' as const,
      },
      ...realEstateOverviewStatElements(stats),
    ];
  }
  if (type === 'real_estate_highlights') {
    const raw = content?.items;
    const items = Array.isArray(raw)
      ? (raw as RealEstateHighlightItem[]).filter(
          it => it && typeof it === 'object' && typeof it.text === 'string'
        )
      : [];
    // Không có mục list manager: số card cố định 4 như nguồn — xem docblock
    // `defs/realEstateHighlights.ts`.
    return [
      // BACKGROUND_LAYER = nền NGOÀI (của cả block); `contentSurface` = dải nền
      // 372 phía trong. Hai lớp tách bạch, sửa độc lập.
      BACKGROUND_LAYER,
      { key: 'contentSurface', label: 'Nền cột nội dung', icon: Palette },
      {
        key: 'title',
        label: 'Tiêu đề',
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: 'description',
        label: 'Mô tả',
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
      ...realEstateHighlightItemElements(items),
    ];
  }
  if (type === 'real_estate_villa') {
    const raw = content?.slides;
    const slides = Array.isArray(raw)
      ? (raw as RealEstateVillaSlide[]).filter(
          s => s && typeof s === 'object' && typeof s.title === 'string'
        )
      : [];
    // Không có mục list manager: số slide cố định 4 như nguồn — xem docblock
    // `defs/realEstateVilla.ts`.
    return [
      // BACKGROUND_LAYER = nền NGOÀI (của cả block); `cardSurface` = nền thẻ
      // phía trong. Hai lớp tách bạch, sửa độc lập.
      BACKGROUND_LAYER,
      {
        key: 'eyebrow',
        label: 'Nhãn nhỏ',
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: 'title',
        label: 'Tiêu đề',
        icon: Type,
        fieldType: 'text' as const,
      },
      { key: 'cardSurface', label: 'Nền thẻ', icon: Palette },
      ...realEstateVillaSlideElements(slides),
    ];
  }
  if (type === 'real_estate_utilities') {
    const raw = content?.items;
    const items = Array.isArray(raw)
      ? (raw as RealEstateUtilityItem[]).filter(
          it => it && typeof it === 'object' && typeof it.label === 'string'
        )
      : [];
    // Không có mục list manager: số ô cố định 6 như nguồn — xem docblock
    // `defs/realEstateUtilities.ts`.
    return [
      BACKGROUND_LAYER,
      {
        key: 'title',
        label: 'Tiêu đề',
        icon: Type,
        fieldType: 'text' as const,
      },
      ...realEstateUtilityItemElements(items),
    ];
  }
  if (type === 'mint_discover') {
    const raw = content?.tabs;
    const tabs = Array.isArray(raw)
      ? (raw as MintDiscoverTab[]).filter(
          t => t && typeof t === 'object' && typeof t.label === 'string'
        )
      : [];
    return [
      BACKGROUND_LAYER,
      { key: 'variant', label: 'Theme variant', icon: LayersIcon },
      {
        key: 'mainImage',
        label: 'Ảnh coin',
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: 'mainAlt',
        label: 'Alt ảnh',
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: 'cardSurface',
        label: 'Thẻ info (nền)',
        icon: LayersIcon,
      },
      ...mintDiscoverTabElements(tabs),
      {
        key: 'tabs',
        label: 'Hotspot / chi tiết',
        icon: ListChecks,
      },
    ];
  }
  if (type === 'mintv2_services') {
    const raw = content?.items;
    const items = Array.isArray(raw)
      ? (raw as MintV2ServiceItem[]).filter(
          item =>
            item && typeof item === 'object' && typeof item.label === 'string'
        )
      : [];
    return [
      BACKGROUND_LAYER,
      { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
      { key: 'title', label: 'Tiêu đề lớn', icon: Type, fieldType: 'text' },
      ...mintV2ServicesItemElements(items),
      {
        key: 'items',
        label: 'Thêm / quản lý mục',
        icon: ListChecks,
      },
    ];
  }
  if (type === 'mintv2_process') {
    const raw = content?.steps;
    const steps = Array.isArray(raw)
      ? (raw as MintV2ProcessStep[]).filter(
          s => s && typeof s === 'object' && typeof s.title === 'string'
        )
      : [];
    return [
      BACKGROUND_LAYER,
      { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
      { key: 'title', label: 'Tiêu đề lớn', icon: Type, fieldType: 'text' },
      { key: 'line', label: 'Đường timeline', icon: Palette },
      { key: 'dot', label: 'Chấm bước', icon: Palette },
      ...mintV2ProcessStepElements(steps),
      {
        key: 'steps',
        label: 'Thêm / quản lý bước',
        icon: ListChecks,
      },
    ];
  }
  if (type === 'mintv2_works') {
    const raw = content?.cards;
    const cards = Array.isArray(raw)
      ? (raw as MintV2WorkCard[]).filter(
          c => c && typeof c === 'object' && typeof c.title === 'string'
        )
      : [];
    return [
      BACKGROUND_LAYER,
      { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
      { key: 'title', label: 'Tiêu đề lớn', icon: Type, fieldType: 'text' },
      ...mintV2WorksCardElements(cards),
      {
        key: 'cards',
        label: 'Thêm / quản lý card',
        icon: ListChecks,
      },
    ];
  }
  if (type === 'mint_vault_craft') {
    const raw = content?.items;
    const items = Array.isArray(raw)
      ? (raw as MintVaultCraftItem[]).filter(
          it => it && typeof it === 'object' && typeof it.title === 'string'
        )
      : [];
    return [
      BACKGROUND_LAYER,
      { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
      { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
      ...mintVaultCraftItemElements(items),
      {
        key: 'items',
        label: 'Thêm / quản lý mục',
        icon: ListChecks,
      },
    ];
  }
  if (type === 'mint_vault_reveal') {
    const raw = content?.images;
    const images = Array.isArray(raw)
      ? (raw as unknown[]).filter(
          (src): src is string => typeof src === 'string'
        )
      : [];
    return [
      BACKGROUND_LAYER,
      { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
      { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
      ...mintVaultRevealImageElements(images),
      {
        key: 'images',
        label: 'Thêm / quản lý ảnh',
        icon: Grid3x3,
      },
    ];
  }
  if (type === 'mint_vault_invitation') {
    const raw = content?.images;
    const images = Array.isArray(raw)
      ? (raw as unknown[]).filter(
          (src): src is string => typeof src === 'string'
        )
      : [];
    return [
      BACKGROUND_LAYER,
      { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
      { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
      { key: 'note', label: 'Ghi chú', icon: Pilcrow, fieldType: 'textarea' },
      // Cụm form — groupId liền kề mới gom thành 1 folder (buildLayerTree).
      {
        key: 'emailPlaceholder',
        label: 'Placeholder',
        groupId: 'form',
        groupLabel: 'Form lead',
        icon: FormInput,
        fieldType: 'text',
      },
      {
        key: 'submitText',
        label: 'Nút gửi',
        groupId: 'form',
        icon: MousePointerClick,
        fieldType: 'text',
      },
      {
        key: 'successMessage',
        label: 'Lời cảm ơn',
        groupId: 'form',
        icon: CheckCircle,
        fieldType: 'textarea',
      },
      {
        key: 'backgroundImageUrl',
        label: 'Ảnh nền',
        icon: ImageIcon,
        fieldType: 'image',
      },
      ...mintVaultInvitationImageElements(images),
      {
        key: 'images',
        label: 'Thêm / quản lý ảnh',
        icon: Grid3x3,
      },
    ];
  }
  if (type === 'mint_vault_collection') {
    const raw = content?.coins;
    const coins = Array.isArray(raw)
      ? (raw as MintVaultCoin[]).filter(
          c => c && typeof c === 'object' && typeof c.name === 'string'
        )
      : [];
    return [
      BACKGROUND_LAYER,
      { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
      { key: 'subLabel', label: 'Nhãn phụ', icon: Type, fieldType: 'text' },
      ...mintVaultCoinElements(coins),
      {
        key: 'coins',
        label: 'Thêm / quản lý coin',
        icon: ListChecks,
      },
    ];
  }
  if (type === 'pnj_sticky_menu') {
    const raw = content?.items;
    const items = Array.isArray(raw)
      ? (raw as PnjStickyMenuItem[]).filter(
          item =>
            item && typeof item === 'object' && typeof item.label === 'string'
        )
      : [];
    return [
      BACKGROUND_LAYER,
      ...pnjStickyMenuItemElements(items),
      {
        key: 'items',
        label: 'Thêm / quản lý mục',
        icon: ListChecks,
      },
      { key: 'ctaText', label: 'Nút CTA', icon: Type, fieldType: 'text' },
      {
        key: 'ctaLink',
        label: 'Link CTA',
        icon: Link2,
        fieldType: 'text',
      },
    ];
  }
  if (def) return [BACKGROUND_LAYER, ...def.elements];
  return ELEMENTS_BY_TYPE[type] ?? [];
}

export function LayersPanel({
  block,
  device,
  selectedKey,
  onSelectKey,
  onReorder,
  selectedExtraElementId = null,
  onAddExtraElement,
  onSelectExtraElement,
  onRemoveExtraElement,
}: LayersPanelProps) {
  const extras = block.extraElements ?? [];
  const showExtraSection = !!onAddExtraElement;
  const baseElements = React.useMemo(() => {
    const content = (readVariant(block.contentVi, device) ??
      block.contentVi?.desktop) as Record<string, unknown> | undefined;
    return elementsForType(block.blockType, content);
  }, [block.blockType, block.contentVi, device]);
  const elementByKey = React.useMemo(() => {
    const map = new Map<string, LayerElement>();
    for (const e of baseElements) map.set(e.key, e);
    return map;
  }, [baseElements]);

  // Stored order for the active variant (or fall back to the natural order).
  // Background layer is never reorderable so we keep it pinned at top.
  const variant = editingVariantOf(device);
  const storedOrder = readVariant(block.elementOrder, device);
  const naturalOrder = React.useMemo(
    () => baseElements.map(e => e.key),
    [baseElements]
  );
  // Merge: any keys in storedOrder first (filtered to existing), then any
  // baseElement keys not yet in stored order (handles new fields gracefully).
  // Always pin background at index 0.
  const order = React.useMemo<string[]>(() => {
    const withoutBg = (keys: string[]) =>
      keys.filter(k => k !== BACKGROUND_LAYER_KEY);
    if (!storedOrder?.length) {
      return naturalOrder[0] === BACKGROUND_LAYER_KEY
        ? naturalOrder
        : [BACKGROUND_LAYER_KEY, ...withoutBg(naturalOrder)];
    }
    const set = new Set(storedOrder);
    const merged = [
      ...storedOrder.filter(k => baseElements.some(e => e.key === k)),
      ...naturalOrder.filter(k => !set.has(k)),
    ];
    return [BACKGROUND_LAYER_KEY, ...withoutBg(merged)];
  }, [storedOrder, naturalOrder, baseElements]);

  const orderedElements = React.useMemo(
    () =>
      order
        .map(key => elementByKey.get(key))
        .filter((e): e is LayerElement => Boolean(e)),
    [order, elementByKey]
  );

  const tree = React.useMemo(
    () => buildLayerTree(orderedElements),
    [orderedElements]
  );

  // Collapse state — default open; persist per block in sessionStorage.
  const collapseStorageKey = `layers-collapsed:${block.id}`;
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const skipCollapseSaveRef = React.useRef(true);

  React.useEffect(() => {
    skipCollapseSaveRef.current = true;
    try {
      const raw = sessionStorage.getItem(collapseStorageKey);
      setCollapsed(raw ? (JSON.parse(raw) as Record<string, boolean>) : {});
    } catch {
      setCollapsed({});
    }
  }, [collapseStorageKey]);

  React.useEffect(() => {
    if (skipCollapseSaveRef.current) {
      skipCollapseSaveRef.current = false;
      return;
    }
    try {
      sessionStorage.setItem(collapseStorageKey, JSON.stringify(collapsed));
    } catch {
      /* ignore quota */
    }
  }, [collapseStorageKey, collapsed]);

  // Auto-expand group that contains the selected key.
  React.useEffect(() => {
    if (!selectedKey) return;
    const el = elementByKey.get(selectedKey);
    if (!el?.groupId) return;
    setCollapsed(prev => {
      if (!prev[el.groupId!]) return prev;
      const next = { ...prev };
      delete next[el.groupId!];
      return next;
    });
  }, [selectedKey, elementByKey]);

  const toggleGroup = (groupId: string) => {
    setCollapsed(prev => {
      const next = { ...prev };
      if (next[groupId]) delete next[groupId];
      else next[groupId] = true;
      return next;
    });
  };

  // Mouse + touch sensors split — TouchSensor needs a small delay to
  // distinguish drag from scroll on mobile. MouseSensor uses distance so
  // a quick click stays a click. KeyboardSensor enables a11y reorder.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Track drag state for the status banner — gives users a visible cue that
  // dnd-kit picked up their pointer (vs. silent failure when sensors don't fire).
  const [dragState, setDragState] = React.useState<{
    activeKey: string | null;
    overKey: string | null;
    didReorder: boolean;
  }>({ activeKey: null, overKey: null, didReorder: false });

  const handleDragStart = (event: DragStartEvent) => {
    setDragState({
      activeKey: event.active.id as string,
      overKey: null,
      didReorder: false,
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    setDragState(s => ({ ...s, overKey: (event.over?.id as string) ?? null }));
  };

  const sameReorderScope = (a: string, b: string) => {
    if (a === BACKGROUND_LAYER_KEY || b === BACKGROUND_LAYER_KEY) return false;
    const ga = elementByKey.get(a)?.groupId ?? null;
    const gb = elementByKey.get(b)?.groupId ?? null;
    return ga === gb;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    let didReorder = false;
    if (over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;
      if (sameReorderScope(activeId, overId)) {
        const scopeId = elementByKey.get(activeId)?.groupId ?? null;
        // Reorder only within the scope slice so groups stay contiguous.
        const scopeKeys = order.filter(k => {
          if (k === BACKGROUND_LAYER_KEY) return false;
          const g = elementByKey.get(k)?.groupId ?? null;
          return g === scopeId;
        });
        const oldInScope = scopeKeys.indexOf(activeId);
        const newInScope = scopeKeys.indexOf(overId);
        if (oldInScope !== -1 && newInScope !== -1) {
          const nextScope = arrayMove(scopeKeys, oldInScope, newInScope);
          let si = 0;
          const next = order.map(k => {
            if (k === BACKGROUND_LAYER_KEY) return k;
            const g = elementByKey.get(k)?.groupId ?? null;
            if (g !== scopeId) return k;
            const replaced = nextScope[si];
            si += 1;
            return replaced;
          });
          onReorder?.(next);
          didReorder = true;
        }
      }
    }
    setDragState({ activeKey: null, overKey: null, didReorder });
    if (didReorder) {
      window.setTimeout(
        () => setDragState(s => ({ ...s, didReorder: false })),
        1200
      );
    }
  };

  const handleDragCancel = () => {
    setDragState({ activeKey: null, overKey: null, didReorder: false });
  };

  const labelOf = (key: string | null) =>
    key ? (elementByKey.get(key)?.label ?? key) : null;

  // Suppress unused warning for `variant` — kept for potential future variant-aware UI.
  void variant;

  if (!orderedElements.length) {
    return (
      <div className='p-4 text-xs text-neutral-500'>
        Block <strong>{block.name}</strong> chưa khai báo các phần tử lớp.
      </div>
    );
  }

  // Sortable ids: everything except pinned background.
  const sortableIds = orderedElements
    .filter(e => e.key !== BACKGROUND_LAYER_KEY)
    .map(e => e.key);

  // Drive a visible status banner — chỉ hiện khi đang kéo hoặc vừa reorder.
  const isDragging = dragState.activeKey !== null;
  const showStatusBanner = isDragging || dragState.didReorder;
  const statusTone = isDragging
    ? 'bg-sky-50 text-sky-700 ring-sky-200'
    : 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  const statusLabel = isDragging
    ? `Đang kéo: ${labelOf(dragState.activeKey)}` +
      (dragState.overKey && dragState.overKey !== dragState.activeKey
        ? ` → ${labelOf(dragState.overKey)}`
        : '')
    : 'Đã đổi thứ tự';

  const renderLeaf = (element: LayerElement, nested: boolean) => {
    const isOver = dragState.overKey === element.key;
    const overFromAbove =
      isOver &&
      dragState.activeKey !== null &&
      order.indexOf(dragState.activeKey) > order.indexOf(element.key);
    const pinned = element.key === BACKGROUND_LAYER_KEY;
    return (
      <LayerRow
        key={element.key}
        element={element}
        active={selectedKey === element.key}
        nested={nested}
        pinned={pinned}
        isAnyDragging={dragState.activeKey !== null}
        dropIndicator={isOver ? (overFromAbove ? 'above' : 'below') : null}
        hasStyle={
          element.key === BACKGROUND_LAYER_KEY
            ? !!block.background?.desktop
            : !!block.elementStyles?.desktop?.[element.key]
        }
        color={
          element.key === BACKGROUND_LAYER_KEY
            ? block.background?.desktop?.color
            : block.elementStyles?.desktop?.[element.key]?.color
        }
        mobileOverride={hasMobileOverride(block, element.key)}
        onSelect={() =>
          onSelectKey(selectedKey === element.key ? null : element.key)
        }
      />
    );
  };

  return (
    <div
      className='flex flex-col gap-1.5 p-2'
      data-drag-state={isDragging ? 'dragging' : 'idle'}
    >
      {showExtraSection ? (
        <section className='flex flex-col gap-1 rounded-md bg-white p-1.5 ring-1 ring-neutral-200/80'>
          <AddExtraElementButton onPick={kind => onAddExtraElement?.(kind)} />
          {extras.length > 0 ? (
            <ExtraElementsList
              elements={extras}
              selectedId={selectedExtraElementId}
              onSelect={id => onSelectExtraElement?.(id)}
              onRemove={id => onRemoveExtraElement?.(id)}
            />
          ) : null}
        </section>
      ) : null}

      {showStatusBanner && (
        <div
          className={cn(
            'text-2xs flex items-center gap-2 rounded-md px-2 py-1 font-medium ring-1 transition-colors',
            statusTone
          )}
          role='status'
          aria-live='polite'
        >
          <span
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              isDragging ? 'animate-pulse bg-sky-500' : 'bg-emerald-500'
            )}
          />
          <span className='flex-1 truncate'>{statusLabel}</span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          <div className='flex flex-col gap-1'>
            {tree.map(node => {
              if (node.kind === 'leaf') {
                return renderLeaf(node.element, false);
              }
              const isCollapsed = !!collapsed[node.groupId];
              const childSelected = node.children.some(
                c => c.key === selectedKey
              );
              return (
                <div key={node.groupId} className='flex flex-col gap-1'>
                  <GroupHeader
                    label={node.label}
                    count={node.children.length}
                    collapsed={isCollapsed}
                    highlight={childSelected}
                    onToggle={() => toggleGroup(node.groupId)}
                  />
                  {!isCollapsed &&
                    node.children.map(child => renderLeaf(child, true))}
                </div>
              );
            })}
          </div>
        </SortableContext>

        {/* Floating ghost — Figma/Canva style drag preview. */}
        <DragOverlay
          dropAnimation={{
            duration: 180,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)',
          }}
        >
          {dragState.activeKey
            ? (() => {
                const el = elementByKey.get(dragState.activeKey);
                if (!el) return null;
                return <DragGhost element={el} />;
              })()
            : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function GroupHeader({
  label,
  count,
  collapsed,
  highlight,
  onToggle,
}: {
  label: string;
  count: number;
  collapsed: boolean;
  highlight: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onToggle}
      aria-expanded={!collapsed}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
        highlight
          ? 'bg-sky-50 text-sky-900'
          : 'bg-neutral-100/80 text-neutral-700 hover:bg-neutral-100'
      )}
    >
      <ChevronRight
        className={cn(
          'size-3.5 shrink-0 text-neutral-500 transition-transform',
          !collapsed && 'rotate-90'
        )}
      />
      <LayersIcon className='size-3.5 shrink-0 text-neutral-500' />
      <span className='flex-1 truncate text-xs font-semibold'>{label}</span>
      <span className='text-3xs text-neutral-400 tabular-nums'>{count}</span>
    </button>
  );
}

function LayerRow({
  element,
  active,
  color,
  mobileOverride,
  isAnyDragging,
  dropIndicator,
  nested,
  pinned,
  onSelect,
}: {
  element: LayerElement;
  active: boolean;
  hasStyle: boolean;
  color?: string;
  mobileOverride?: boolean;
  /** True when ANY row is being dragged (used to dim non-target rows). */
  isAnyDragging: boolean;
  /** Where the drop indicator line should render relative to this row. */
  dropIndicator: 'above' | 'below' | null;
  nested?: boolean;
  /** Background — not draggable. */
  pinned?: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.key, disabled: pinned });

  const sortableStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = element.icon;

  return (
    <div
      ref={setNodeRef}
      style={sortableStyle}
      data-testid={`layer-row-${element.key}`}
      data-layer-key={element.key}
      data-dragging={isDragging ? 'true' : undefined}
      className={cn(
        'group relative flex items-center gap-1.5 rounded-md border bg-white px-1.5 py-1.5 transition-all select-none',
        nested && 'ml-4',
        active
          ? 'border-sky-500 ring-1 ring-sky-500'
          : 'border-neutral-200 hover:border-sky-400 hover:bg-sky-50/50',
        // Source row while being dragged: faded + flat (Figma pattern)
        isDragging && 'opacity-30',
        // Other rows while ANY row is being dragged: subtle non-interactive
        !isDragging && isAnyDragging && 'cursor-default'
      )}
    >
      {/* ── Drop indicator line (Figma/Canva style) ────────────────────── */}
      {dropIndicator && !pinned && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-1 -left-1 z-20 flex items-center',
            dropIndicator === 'above' ? '-top-1' : '-bottom-1'
          )}
        >
          {/* Round terminator */}
          <span className='size-2 rounded-full bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.18)]' />
          {/* Animated line */}
          <span className='-ml-0.5 h-0.5 flex-1 rounded-full bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.18)]' />
          <span className='size-2 rounded-full bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.18)]' />
        </span>
      )}

      {/* ── Dedicated drag handle (clearer affordance, like Notion/Figma) */}
      {pinned ? (
        <span
          className='flex size-7 shrink-0 items-center justify-center text-neutral-200'
          aria-hidden
        >
          <GripVertical className='size-4' />
        </span>
      ) : (
        <button
          ref={setActivatorNodeRef}
          type='button'
          {...attributes}
          {...listeners}
          aria-label={`Kéo để sắp xếp ${element.label}`}
          title='Kéo để sắp xếp'
          data-testid={`layer-drag-handle-${element.key}`}
          className={cn(
            'flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded transition-colors select-none active:cursor-grabbing',
            'text-neutral-300 hover:bg-sky-100 hover:text-sky-700',
            isDragging && 'cursor-grabbing bg-sky-100 text-sky-700'
          )}
        >
          <GripVertical className='size-4' />
        </button>
      )}

      {/* ── Click target for selection (separate from drag) ──────────── */}
      <button
        type='button'
        onClick={onSelect}
        className='flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left'
      >
        <Icon className='size-3.5 shrink-0 text-neutral-500' />
        <span className='flex-1 truncate text-xs text-neutral-700 group-hover:text-neutral-900'>
          {element.label}
        </span>
        {color && (
          <span
            aria-hidden
            className='size-3 shrink-0 rounded-sm border border-neutral-200'
            style={{ backgroundColor: color }}
          />
        )}
        {mobileOverride && (
          <span
            aria-label='Đã tuỳ biến cho mobile'
            title='Đã tuỳ biến cho mobile'
            data-testid='layer-mobile-badge'
            className='text-3xs inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 font-mono font-semibold tracking-tight text-emerald-700 ring-1 ring-emerald-200/80'
          >
            📱
          </span>
        )}
      </button>
    </div>
  );
}

// ─── Drag ghost — floating preview that follows the cursor ────────────────

function DragGhost({ element }: { element: LayerElement }) {
  const Icon = element.icon;
  return (
    <div
      className='flex cursor-grabbing items-center gap-2 rounded-md border border-sky-400 bg-white px-2 py-2 shadow-2xl ring-2 ring-sky-300/60'
      style={{
        // Slight tilt for tactile feel — matches Figma/Canva drag preview.
        transform: 'rotate(-2deg) scale(1.02)',
      }}
    >
      <span className='flex size-7 shrink-0 items-center justify-center rounded bg-sky-100 text-sky-700'>
        <GripVertical className='size-4' />
      </span>
      <Icon className='size-3.5 shrink-0 text-neutral-500' />
      <span className='text-xs font-semibold text-neutral-900'>
        {element.label}
      </span>
    </div>
  );
}
