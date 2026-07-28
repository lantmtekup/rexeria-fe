/**
 * BlockDef cho `springs_design` — bản rút gọn của section `.l-design`
 * (`#design`) springs-estate-clone: bản gốc là chuỗi sticky-scroll 3-4 slide
 * (`l-design__slide--1..4`) với parallax ảnh + reveal chữ. Ở đây giữ tinh
 * thần "mỗi tầng một góc nhìn" bằng heading + chuỗi card ảnh/phụ đề/đoạn văn
 * xếp dọc (mobile) / so le trái-phải (desktop), scroll-reveal độc lập từng
 * card — không replicate cơ chế pin gốc. Component: `blocks/SpringsDesign.tsx`.
 *
 * Copy + ảnh THẬT lấy từ springs.estate (asset gốc `6.design/`, dùng thẳng
 * live origin URL, không self-host lại):
 *  - design-bg@xxl.webp — slide mở đầu ("Inspired Architecture").
 *  - design-1@xxl.webp — slide "Each floor reflects boundless perspectives...".
 *  - design-4@xxl.webp — slide "Tabanlioglu, the renowned architectural bureau...".
 *  - design-3@xxl.webp — slide còn lại của cùng đoạn Tabanlioglu.
 */
import { GalleryHorizontal, Heading } from 'lucide-react';

import { SpringsDesign } from '../../SpringsDesign';
import type { SpringsDesignContent } from '../../../types';
import type { BlockDef } from '../types';

const IMG_BG =
  'https://springs.estate/assets/images/media/landing/6.design/design-bg@xxl.webp';
const IMG_1 =
  'https://springs.estate/assets/images/media/landing/6.design/design-1@xxl.webp';
const IMG_3 =
  'https://springs.estate/assets/images/media/landing/6.design/design-3@xxl.webp';
const IMG_4 =
  'https://springs.estate/assets/images/media/landing/6.design/design-4@xxl.webp';

const VI: SpringsDesignContent = {
  heading: 'Thiết kế',
  slides: [
    {
      subtitle: 'Cảm hứng kiến trúc',
      text: 'Toà tháp pha lê đơn độc vươn cao trên những tán cây. Toà tháp biệt lập tựa như thác nước bằng kính, với những vòm lá xanh mướt bao quanh ban công.',
      imageUrl: IMG_BG,
    },
    {
      subtitle: 'Những con sóng lấp lánh',
      text: 'Mỗi tầng phản chiếu những góc nhìn vô tận trong ánh sóng lấp lánh, mời gọi bạn nhìn xa hơn với một bảng màu trọn vẹn hơn của những khả năng.',
      imageUrl: IMG_1,
    },
    {
      subtitle: 'Sự bất đối xứng táo bạo',
      text: 'Tabanlioglu, hãng kiến trúc danh tiếng, nhấn mạnh sự bất đối xứng táo bạo của các ban công theo hoạ tiết bàn cờ. Ba vách ngăn dọc chia mặt tiền trong suốt, tạo hiệu ứng khối tích như không trọng lượng.',
      imageUrl: IMG_4,
    },
    {
      subtitle: 'Sự nhẹ nhàng thị giác',
      text: 'Tự do trong biểu đạt, sự tinh tế của trí tuệ, và sự nhẹ nhàng thị giác.',
      imageUrl: IMG_3,
    },
  ],
};

const EN: SpringsDesignContent = {
  heading: 'Design',
  slides: [
    {
      subtitle: 'Inspired Architecture',
      text: 'A standalone crystal building soaring above the treetops. Secluded tower resembling a glassy waterfall with flowing cascades of greenery-framed loggia.',
      imageUrl: IMG_BG,
    },
    {
      subtitle: 'Glistening Waves',
      text: 'Each floor reflects boundless perspectives in its glistening waves, inviting you to look farther with a fuller palette of possibilities.',
      imageUrl: IMG_1,
    },
    {
      subtitle: 'Bold Asymmetry',
      text: 'Tabanlioglu, the renowned architectural bureau, emphasizes the bold asymmetry of balconies in a chessboard pattern. Three vertical partitions divide the translucent façade, creating the effect of weightless volume.',
      imageUrl: IMG_4,
    },
    {
      subtitle: 'Visual Lightness',
      text: 'Freedom of expression, elegance of intelligence, and visual lightness.',
      imageUrl: IMG_3,
    },
  ],
};

export const springsDesignDef: BlockDef<SpringsDesignContent> = {
  type: 'springs_design',
  meta: {
    type: 'springs_design',
    label: 'Springs - Design',
    accent: '#152018',
    adminLabel: 'Springs - Design',
    gradient: 'from-emerald-950 to-emerald-800',
    defaultName: 'Springs - Design',
    aiLabelVi:
      'kiến trúc "Design": heading lớn + chuỗi card ảnh/phụ đề/đoạn văn xếp dọc, so le trái-phải trên desktop, scroll-reveal từng card',
    aiLabelEn:
      'architecture "Design" section: large heading + sequence of image/subtitle/paragraph cards, alternating sides on desktop, per-card scroll-reveal',
  },
  component: SpringsDesign,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'heading',
      label: 'Tiêu đề section',
      icon: Heading,
      fieldType: 'text',
    },
    {
      key: 'slides',
      label: 'Chuỗi slide (ảnh + phụ đề + đoạn văn)',
      icon: GalleryHorizontal,
      fieldType: 'text',
    },
  ],
};
