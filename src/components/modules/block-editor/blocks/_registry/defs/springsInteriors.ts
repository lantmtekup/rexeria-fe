/**
 * BlockDef cho `springs_interiors` — bản rút gọn của section `.l-interiors`
 * (`#interiors`) springs-estate-clone: tiêu đề "Interiors" (phải-canh, serif
 * lớn) + đoạn mô tả phụ + dải slider ảnh nội thất cuộn ngang. Component:
 * `blocks/SpringsInteriors.tsx`.
 *
 * Ảnh dùng LIVE origin springs.estate (direct path
 * `assets/images/media/landing/8.interiors/interiors-slider-N@xxxl.webp`,
 * đã verify HTTP 200 trên origin thật).
 */
import { Heading, Pilcrow } from 'lucide-react';

import { SpringsInteriors } from '../../SpringsInteriors';
import type { SpringsInteriorsContent } from '../../../types';
import type { BlockDef } from '../types';

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
  images: INTERIORS_IMAGES,
};

const EN: SpringsInteriorsContent = {
  heading: 'Interiors',
  description:
    'Our designs are chosen with a delicate treatment of materials and time; time that will soon become history, a story of family generations. Natural stone, warm wood, aged metal, and textured textiles. This is how we create a visual and tactile space for authentically high-class comfort.',
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
      'gallery nội thất: tiêu đề "Interiors" phải-canh + mô tả phụ, dải ảnh nội thất cuộn ngang bên dưới',
    aiLabelEn:
      'interiors gallery: right-aligned "Interiors" heading + supporting copy, horizontal scrolling strip of interior photography below',
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
    // `images` là mảng nội dung, không có `data-element-key` riêng từng ảnh
    // (LayerElement/fieldType hiện chỉ hỗ trợ text/textarea/image đơn) — nên
    // KHÔNG đưa vào `elements`, giống cách `frameUrls` của delvaux_hero không
    // xuất hiện trong danh sách layer chọn được.
  ],
};
