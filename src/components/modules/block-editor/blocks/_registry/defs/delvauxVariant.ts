/**
 * BlockDef cho `delvaux_variant` — port section `.product-variant` của
 * delvaux-clone (https://delvaux.alphacreative.vn/). Ảnh sản phẩm + dãy swatch
 * màu (bấm → đổi ảnh) + accordion FAQ thuần React (GSAP R1–R6 qua useBlockMotion).
 *
 * Component: `blocks/DelvauxVariant.tsx`. Đăng ký Path A → không cần đụng
 * factory.ts / renderBlock.tsx / LayersPanel.tsx.
 *
 * Default dùng asset + nội dung thật của trang gốc (thuộc sở hữu dự án),
 * đặt trong `public/delvaux/`.
 */
import { HelpCircle, Palette, Type } from 'lucide-react';

import { DelvauxVariant } from '../../DelvauxVariant';
import type { DelvauxVariantContent } from '../../../types';
import type { BlockDef } from '../types';

// Ảnh biến thể thật (asset thuộc sở hữu dự án) trong public/delvaux/.
const IMG_HAZEL =
  'https://d10zufojjcedud.cloudfront.net/uploads/21e09f9e-fe5d-4e25-a2dd-98ae4a27c7a6/delvaux-product-variant-1.png';
const IMG_BLACK =
  'https://d10zufojjcedud.cloudfront.net/uploads/c9428456-51f5-42fa-a6b8-6730bf13df27/delvaux-product-variant-2.png';
const IMG_IVORY =
  'https://d10zufojjcedud.cloudfront.net/uploads/03d0a155-b5e1-4e62-8dbd-8970096a2495/delvaux-product-variant-3.png';

const VI: DelvauxVariantContent = {
  // xuống dòng như <br/> của gốc ("Leather D </br> Hazel Doré")
  title: 'Leather D\nHazel Doré',
  moreInfoLabel: 'More information',
  skuName: 'Brillant MM\nArsenal',
  skuMediaUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/f99248ec-b4b6-47ad-b835-83d496ac978f/delvaux-product-dream-calf.mp4',
  skuMediaType: 'video',
  skuPersonUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/34f412bd-0751-48c2-a601-199af4948970/delvaux-person3.png',
  variants: [
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
  ],
  faqs: [
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
  ],
};

const EN: DelvauxVariantContent = { ...VI };

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
      'chọn biến thể màu: swatch đổi ảnh sản phẩm + accordion FAQ, phong cách cao cấp',
    aiLabelEn:
      'color-variant selector: swatches swap product image + FAQ accordion, luxury tone',
  },
  component: DelvauxVariant,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề (ghost)', icon: Type, fieldType: 'text' },
    {
      key: 'variants',
      label: 'Biến thể màu',
      icon: Palette,
      fieldType: 'image',
    },
    {
      key: 'faqs',
      label: 'Chi tiết (popup)',
      icon: HelpCircle,
      fieldType: 'text',
    },
    {
      key: 'moreInfoLabel',
      label: 'Nhãn nút thông tin',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'skuName',
      label: 'Tên sản phẩm (stage cuối)',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
