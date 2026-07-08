/**
 * BlockDef cho `springs_interiors` — port section `.l-interiors` (`#interiors`)
 * springs-estate-clone: sticky pin 2 beat (intro full-bleed → slider +
 * thumbnail rail). Component: `blocks/SpringsInteriors.tsx`.
 *
 * Ảnh dùng LIVE origin springs.estate (direct path
 * `assets/images/media/landing/8.interiors/interiors-bg@xxxl.webp` +
 * `interiors-slider-N@xxxl.webp`, đã verify HTTP 200 trên origin thật).
 */
import { Heading, Image as ImageIcon, Pilcrow } from 'lucide-react';

import { SpringsInteriors } from '../../SpringsInteriors';
import type { SpringsInteriorsContent } from '../../../types';
import type { BlockDef } from '../types';

const INTRO_IMAGE =
  'https://springs.estate/assets/images/media/landing/8.interiors/interiors-bg@xxxl.webp';

const INTERIORS_IMAGES = [
  'https://springs.estate/assets/images/media/landing/8.interiors/interiors-slider-1@xxxl.webp',
  'https://springs.estate/assets/images/media/landing/8.interiors/interiors-slider-2@xxxl.webp',
  'https://springs.estate/assets/images/media/landing/8.interiors/interiors-slider-3@xxxl.webp',
  'https://springs.estate/assets/images/media/landing/8.interiors/interiors-slider-4@xxxl.webp',
  'https://springs.estate/assets/images/media/landing/8.interiors/interiors-slider-5@xxxl.webp',
];

const VI: SpringsInteriorsContent = {
  heading: 'Interiors',
  description:
    'Nội thất được lựa chọn với sự trau chuốt tinh tế trong vật liệu và thời gian; thời gian rồi sẽ trở thành lịch sử, thành câu chuyện của nhiều thế hệ trong gia đình. Đá tự nhiên, gỗ ấm áp, kim loại phong hoá và chất liệu dệt giàu kết cấu — tất cả tạo nên một không gian thị giác và xúc giác cho sự thư thái đẳng cấp đích thực.',
  introImage: INTRO_IMAGE,
  images: INTERIORS_IMAGES,
};

const EN: SpringsInteriorsContent = {
  heading: 'Interiors',
  description:
    'Our designs are chosen with a delicate treatment of materials and time; time that will soon become history, a story of family generations. Natural stone, warm wood, aged metal, and textured textiles. This is how we create a visual and tactile space for authentically high-class comfort.',
  introImage: INTRO_IMAGE,
  images: INTERIORS_IMAGES,
};

export const springsInteriorsDef: BlockDef<SpringsInteriorsContent> = {
  type: 'springs_interiors',
  meta: {
    type: 'springs_interiors',
    label: 'Springs - Interiors',
    accent: '#152018',
    adminLabel: 'Springs - Interiors',
    gradient: 'from-emerald-950 to-emerald-800',
    defaultName: 'Springs - Interiors',
    aiLabelVi:
      'sticky pin 2 beat: ảnh intro full-bleed + tiêu đề "Interiors" phải-canh → crossfade sang slider ảnh nội thất + rail thumbnail',
    aiLabelEn:
      'sticky pin 2-beat: full-bleed intro image + right-aligned "Interiors" heading → crossfades to interior slider with thumbnail rail',
  },
  component: SpringsInteriors,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'heading',
      label: 'Tiêu đề',
      icon: Heading,
      fieldType: 'text',
    },
    {
      key: 'description',
      label: 'Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'introImage',
      label: 'Ảnh intro (full-bleed)',
      icon: ImageIcon,
      fieldType: 'image',
    },
    // `images` là mảng nội dung, không có `data-element-key` riêng từng ảnh
    // (LayerElement/fieldType hiện chỉ hỗ trợ text/textarea/image đơn) — nên
    // KHÔNG đưa vào `elements`, giống cách `frameUrls` của delvaux_hero không
    // xuất hiện trong danh sách layer chọn được.
  ],
};
