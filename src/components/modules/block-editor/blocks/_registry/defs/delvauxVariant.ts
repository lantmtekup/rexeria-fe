/**
 * BlockDef cho `delvaux_variant` — port section `.product-variant` của
 * delvaux-clone: ảnh + swatch màu + popup FAQ + stage SKU pin. Path A.
 *
 * Layers: expand variants[i].* / faqs[i].* + managers; SKU fields phẳng.
 */
import {
  HelpCircle,
  Image as ImageIcon,
  ListChecks,
  Palette,
  Pilcrow,
  Type,
} from 'lucide-react';

import dynamic from 'next/dynamic';
import type { LayerElement } from '../../../LayersPanel';
import type {
  DelvauxVariantContent,
  DelvauxVariantFaq,
  DelvauxVariantOption,
} from '../../../types';
import type { BlockDef } from '../types';

const IMG_HAZEL =
  'https://d10zufojjcedud.cloudfront.net/uploads/21e09f9e-fe5d-4e25-a2dd-98ae4a27c7a6/delvaux-product-variant-1.png';
const IMG_BLACK =
  'https://d10zufojjcedud.cloudfront.net/uploads/c9428456-51f5-42fa-a6b8-6730bf13df27/delvaux-product-variant-2.png';
const IMG_IVORY =
  'https://d10zufojjcedud.cloudfront.net/uploads/03d0a155-b5e1-4e62-8dbd-8970096a2495/delvaux-product-variant-3.png';

const DEFAULT_VARIANTS: DelvauxVariantOption[] = [
  {
    label: 'Hazel Doré',
    ref: 'AA0555BKP010DDO',
    color: '#764733',
    imageUrl: IMG_HAZEL,
  },
  {
    label: 'Black',
    ref: 'AA0555BKP010DD1',
    color: '#000000',
    imageUrl: IMG_BLACK,
  },
  {
    label: 'Ivory',
    ref: 'AA0555BKP010DD2',
    color: '#ECE8DF',
    imageUrl: IMG_IVORY,
  },
];

const DEFAULT_FAQS: DelvauxVariantFaq[] = [
  {
    question: 'Details',
    answer:
      'REF. AA0723BNV099ZPA\nDerby grained calf leather\nNatural calfskin lining\n1 interior zipped pocket\n1 key hook\nRemovable and adjustable leather shoulder strap\nPalladium metal hardware',
  },
  { question: 'Care', answer: 'View care guide' },
  {
    question: 'Shipping and returns',
    answer: 'Shipping and returns content',
  },
];

const VI: DelvauxVariantContent = {
  title: 'Leather D\nHazel Doré',
  moreInfoLabel: 'More information',
  skuName: 'Brillant MM\nArsenal',
  skuMediaUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/f99248ec-b4b6-47ad-b835-83d496ac978f/delvaux-product-dream-calf.mp4',
  skuMediaType: 'video',
  skuPersonUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/34f412bd-0751-48c2-a601-199af4948970/delvaux-person3.png',
  variants: DEFAULT_VARIANTS,
  faqs: DEFAULT_FAQS,
};

const EN: DelvauxVariantContent = { ...VI };

/** Layers folders — 1 group / biến thể màu. */
export const delvauxVariantItemElements = (
  variants: DelvauxVariantOption[]
): LayerElement[] => {
  const list = variants.length > 0 ? variants : DEFAULT_VARIANTS;
  return list.flatMap((v, i) => {
    const groupId = `variant${i}`;
    const groupLabel = v.label?.trim() || `Màu ${i + 1}`;
    return [
      {
        key: `variants[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `variants[${i}].label`,
        label: 'Nhãn',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `variants[${i}].ref`,
        label: 'REF',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `variants[${i}].color`,
        label: 'Màu swatch',
        groupId,
        icon: Palette,
        fieldType: 'text' as const,
      },
    ];
  });
};

/** Layers folders — 1 group / FAQ. */
export const delvauxFaqElements = (
  faqs: DelvauxVariantFaq[]
): LayerElement[] => {
  const list = faqs.length > 0 ? faqs : DEFAULT_FAQS;
  return list.flatMap((f, i) => {
    const groupId = `faq${i}`;
    const groupLabel = f.question?.trim() || `FAQ ${i + 1}`;
    return [
      {
        key: `faqs[${i}].question`,
        label: 'Câu hỏi',
        groupId,
        groupLabel,
        icon: HelpCircle,
        fieldType: 'text' as const,
      },
      {
        key: `faqs[${i}].answer`,
        label: 'Trả lời',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
    ];
  });
};

export const delvauxVariantDef: BlockDef<DelvauxVariantContent> = {
  type: 'delvaux_variant',
  meta: {
    type: 'delvaux_variant',
    label: 'Product - Variant',
    accent: '#764733',
    adminLabel: 'Product - Variant',
    gradient: 'from-amber-100 to-white',
    defaultName: 'Product - Variant',
    aiLabelVi:
      'chọn biến thể màu: swatch đổi ảnh sản phẩm + accordion FAQ + stage SKU pin',
    aiLabelEn:
      'color-variant selector: swatches swap product image + FAQ accordion + SKU pin stage',
  },
  component: dynamic(() =>
    import('../../DelvauxVariant').then(m => m.DelvauxVariant)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'title',
      label: 'Tiêu đề (ghost)',
      icon: Type,
      fieldType: 'text',
      groupId: 'stage1',
      groupLabel: 'Stage 1',
    },
    {
      key: 'moreInfoLabel',
      label: 'Nhãn nút thông tin',
      icon: Type,
      fieldType: 'text',
      groupId: 'stage1',
    },
    ...delvauxVariantItemElements(DEFAULT_VARIANTS),
    {
      key: 'variants',
      label: 'Thêm / quản lý màu',
      icon: ListChecks,
    },
    ...delvauxFaqElements(DEFAULT_FAQS),
    {
      key: 'faqs',
      label: 'Thêm / quản lý FAQ',
      icon: ListChecks,
    },
    {
      key: 'skuName',
      label: 'Tên SKU (stage 2)',
      icon: Type,
      fieldType: 'textarea',
      groupId: 'sku',
      groupLabel: 'Stage 2 · SKU',
    },
    {
      key: 'skuMediaUrl',
      label: 'Media SKU (URL)',
      icon: ImageIcon,
      fieldType: 'text',
      groupId: 'sku',
    },
    {
      key: 'skuPersonUrl',
      label: 'Ảnh model',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'sku',
    },
  ],
};
