/**
 * BlockDef cho `aestha_explore` — trang index "EXPLORE" (cùng site RAMSA/Aestha
 * với `framer_aestha_editorial`). Clone từ `app/dev/nami-explore/page.tsx`.
 *
 * Wide (≥1100px): menu tên dự án phải, hover → crossfade ảnh featured, cursor-dot.
 * Narrow (<1100px): 1 dự án/màn, vuốt trái/phải để duyệt. Path A registry.
 */
import { ImageIcon, Link2, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  AesthaExploreContent,
  AesthaExploreFooterLink,
  AesthaExploreProject,
} from '../../../types';
import type { BlockDef } from '../types';

// Menu → route → ảnh (giữ CDN framerusercontent.com theo asset rule của skill).
// detail.body chứa content hiển thị khi click vào project.
const PROJECTS: AesthaExploreProject[] = [
  {
    label: 'Vision',
    href: '/projects/haus-loma',
    img: 'https://framerusercontent.com/images/WPx9Zr4AV2b97ubrDEMcky10rwA.jpg?width=2364&height=1578',
    alt: 'Haus Loma',
    detail: {
      body: [
        'Epictower là tổ hợp căn hộ cao cấp tại trung tâm Cầu Giấy — 45 tầng, 4 block, 500+ căn hộ đa dạng từ 1 phòng ngủ đến penthouse duplex.',
        'Toạ lạc trên tuyến đường huyết mạch, dự án kết nối liền mạch với hồ Tây, sân bay Nội Bài và hệ thống trường quốc tế chỉ trong 15–20 phút di chuyển.',
        'Thiết kế Art Deco & Indochine kết hợp vật liệu cao cấp và công năng đương đại — một công trình kiến tạo để tồn tại qua nhiều thế hệ cư dân.',
      ],
      images: [
        {
          src: 'https://framerusercontent.com/images/WPx9Zr4AV2b97ubrDEMcky10rwA.jpg?width=2364&height=1578',
          alt: 'Vision 1',
        },
        {
          src: 'https://framerusercontent.com/images/sb7lNvFscO86WspAS6g2Dbumdk4.jpg?width=2364&height=963',
          alt: 'Vision 2',
        },
      ],
    },
  },
  {
    label: 'Architecture',
    href: '/projects/haus-vanta',
    img: 'https://framerusercontent.com/images/sb7lNvFscO86WspAS6g2Dbumdk4.jpg?width=2364&height=963',
    alt: 'Haus Vanta',
    detail: {
      body: [
        'Ngôn ngữ Art Deco kết hợp Indochine đương đại — tỉ lệ cổ điển của Pháp thuộc gặp tinh thần vật liệu Việt Nam.',
        'Mặt đứng đá vôi tự nhiên, hoa văn kim loại đồng mạ thủ công và chi tiết vương miện tại đỉnh tháp tạo hiệu ứng ánh sáng thay đổi theo khoảnh khắc.',
        'Sky Garden tầng kỹ thuật và khu podium thương mại được tổ chức theo nguyên tắc "kiến trúc khí hậu" — ánh sáng, gió và bóng đổ là vật liệu cấu thành.',
      ],
      images: [
        {
          src: 'https://framerusercontent.com/images/sb7lNvFscO86WspAS6g2Dbumdk4.jpg?width=2364&height=963',
          alt: 'Architecture 1',
        },
        {
          src: 'https://framerusercontent.com/images/gx0JUIPtvSo4eMJgRkMoqx2HPc.jpg?width=2364&height=1576',
          alt: 'Architecture 2',
        },
      ],
    },
  },
  {
    label: 'Interior Experience',
    href: '/projects/koa-cafe',
    img: 'https://framerusercontent.com/images/gx0JUIPtvSo4eMJgRkMoqx2HPc.jpg?width=2364&height=1576',
    alt: 'Kōa Café',
    detail: {
      body: [
        'Bốn định dạng căn hộ — 1, 2, 3 phòng ngủ và penthouse — đều tuân theo cùng một ngôn ngữ thiết kế: ánh sáng tự nhiên dẫn lối, tỉ lệ không gian cân bằng.',
        'Vật liệu hoàn thiện cao cấp: đá tự nhiên, gỗ sồi, kính low-e cách nhiệt, thiết bị bếp Châu Âu và hệ thống smart home tích hợp sẵn.',
        'Căn hộ mẫu đã mở đón khách tham quan — liên hệ đội ngũ tư vấn để sắp xếp lịch xem nhà theo nhu cầu cá nhân.',
      ],
      images: [
        {
          src: 'https://framerusercontent.com/images/gx0JUIPtvSo4eMJgRkMoqx2HPc.jpg?width=2364&height=1576',
          alt: 'Interior 1',
        },
        {
          src: 'https://framerusercontent.com/images/FeVrkEA94CrUpaD629BKz29Pbs.jpg?width=2364&height=1280',
          alt: 'Interior 2',
        },
      ],
    },
  },
  {
    label: 'Amenities',
    href: '/projects/stillspace',
    img: 'https://framerusercontent.com/images/FeVrkEA94CrUpaD629BKz29Pbs.jpg?width=2364&height=1280',
    alt: 'Stillspace',
    detail: {
      body: [
        'Hơn 30 tiện ích nội khu được quy hoạch theo sáu không gian chuyên biệt: rooftop, thương mại, an ninh, fitness & spa, khu vui chơi trẻ em và môi trường xanh.',
        'Hồ bơi vô cực tầng cao với tầm nhìn panorama toàn cảnh Hà Nội, khu onsen lấy cảm hứng từ văn hoá tắm khoáng Nhật Bản và phòng gym vận hành 24/7.',
        'Hệ thống an ninh 3 lớp tiêu chuẩn quốc tế, concierge 7 ngày trong tuần và khu vui chơi trẻ em đạt chuẩn châu Âu — một cộng đồng sống toàn diện.',
      ],
      images: [
        {
          src: 'https://framerusercontent.com/images/FeVrkEA94CrUpaD629BKz29Pbs.jpg?width=2364&height=1280',
          alt: 'Amenities 1',
        },
        {
          src: 'https://framerusercontent.com/images/WPx9Zr4AV2b97ubrDEMcky10rwA.jpg?width=2364&height=1578',
          alt: 'Amenities 2',
        },
      ],
    },
  },
  {
    label: 'Nami Retreat',
    href: '/projects/nami-retreat',
    img: 'https://framerusercontent.com/images/HZvk4A3s8OUaBgUIyPFBUBIzJ0.png?width=1024&height=1024',
    alt: 'Nami Retreat',
    detail: {
      body: [
        'Epictower toạ lạc tại tuyến đường huyết mạch quận Cầu Giấy — trái tim hành chính, giáo dục và tài chính phía Tây Hà Nội.',
        '1,2 km tới trung tâm quận · 2,8 km tới Hồ Tây · 15 phút di chuyển tới sân bay Nội Bài · bao quanh bởi 3 trường quốc tế hàng đầu.',
        'Hạ tầng giao thông đồng bộ với tuyến metro số 3 và hệ thống đường vành đai kết nối toàn thành phố — một vị trí thực sự khó có thể thay thế.',
      ],
      images: [
        {
          src: 'https://framerusercontent.com/images/HZvk4A3s8OUaBgUIyPFBUBIzJ0.png?width=1024&height=1024',
          alt: 'Nami 1',
        },
        {
          src: 'https://framerusercontent.com/images/sb7lNvFscO86WspAS6g2Dbumdk4.jpg?width=2364&height=963',
          alt: 'Nami 2',
        },
      ],
    },
  },
];

const FOOTER_LINKS_VI: AesthaExploreFooterLink[] = [
  { label: 'Dự án', href: '/projects' },
  { label: 'Studio', href: '/studio' },
  { label: 'Liên hệ', href: '/contact' },
];

const FOOTER_LINKS_EN: AesthaExploreFooterLink[] = [
  { label: 'Projects', href: '/projects' },
  { label: 'Studio', href: '/studio' },
  { label: 'Contact', href: '/contact' },
];

const VI: AesthaExploreContent = {
  heading: 'EXPLORE',
  projects: PROJECTS,
  footerLinks: FOOTER_LINKS_VI,
  currentFooterLabel: 'Dự án',
};

const EN: AesthaExploreContent = {
  heading: 'EXPLORE',
  projects: PROJECTS,
  footerLinks: FOOTER_LINKS_EN,
  currentFooterLabel: 'Projects',
};

/**
 * `projects` là mảng động → không biểu diễn được trong `elements` tĩnh.
 * `LayersPanel.elementsForType` gọi helper này để expand `projects[i]`
 * (pattern `aesthaNavLinkElements`).
 * Bao gồm detail fields cho AesthaProject content (body, images).
 */
export const aesthaExploreProjectElements = (
  projects: AesthaExploreProject[]
): LayerElement[] =>
  projects.flatMap((proj, i) => {
    const elements: LayerElement[] = [
      {
        key: `projects[${i}].label`,
        label: 'Nhãn',
        groupId: `proj${i}`,
        groupLabel: `Dự án ${i + 1}`,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `projects[${i}].img`,
        label: 'Ảnh menu',
        groupId: `proj${i}`,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `projects[${i}].href`,
        label: 'Link',
        groupId: `proj${i}`,
        icon: Link2,
        fieldType: 'text' as const,
      },
    ];

    // Detail fields (AesthaProject content) - luôn hiển thị để edit được
    // Group label chỉ hiện trên item đầu tiên của nhóm
    const detailGroupId = `proj${i}Detail`;
    const detailGroupLabel = `Nội dung "${proj.label}"`;

    // Body paragraphs - luôn thêm 3 trường
    for (let j = 0; j < 3; j++) {
      elements.push({
        key: `projects[${i}].detail.body[${j}]`,
        label: `Body ${j + 1}`,
        groupId: detailGroupId,
        groupLabel: j === 0 ? detailGroupLabel : undefined,
        icon: Type,
        fieldType: 'textarea' as const,
      });
    }

    // Images - expand theo số ảnh thật trong `detail.images` (thêm/xoá tuỳ ý
    // qua `AesthaExploreProjectsControls` → nếu mảng rỗng vẫn show 1 slot rỗng
    // để user có chỗ bấm).
    const detailImages = Array.isArray(proj.detail?.images)
      ? proj.detail!.images!
      : [];
    const imageSlots = Math.max(detailImages.length, 1);
    for (let k = 0; k < imageSlots; k++) {
      elements.push({
        key: `projects[${i}].detail.images[${k}].src`,
        label: `Ảnh ${k + 1}`,
        groupId: detailGroupId,
        groupLabel: k === 0 ? detailGroupLabel : undefined,
        icon: ImageIcon,
        fieldType: 'image' as const,
      });
    }

    return elements;
  });

/** Footer nav — mảng động, expand `footerLinks[i]`. */
export const aesthaExploreFooterLinkElements = (
  links: AesthaExploreFooterLink[]
): LayerElement[] =>
  links.flatMap((_, i) => [
    {
      key: `footerLinks[${i}].label`,
      label: 'Nhãn',
      groupId: `foot${i}`,
      groupLabel: `Footer ${i + 1}`,
      icon: Type,
      fieldType: 'text' as const,
    },
    {
      key: `footerLinks[${i}].href`,
      label: 'Link',
      groupId: `foot${i}`,
      icon: Link2,
      fieldType: 'text' as const,
    },
  ]);

export const aesthaExploreDef: BlockDef<AesthaExploreContent> = {
  type: 'aestha_explore',
  meta: {
    type: 'aestha_explore',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'framer', 'index'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'Aestha Explore',
    accent: '#0F0F0F',
    adminLabel: 'Explore index (Aestha)',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Explore',
    aiLabelVi:
      'trang index EXPLORE: menu dự án hover đổi ảnh featured (desktop) / vuốt carousel (mobile)',
    aiLabelEn:
      'EXPLORE index page: project menu hover-swaps featured image (desktop) / swipe carousel (mobile)',
  },
  component: dynamic(() =>
    import('../../AesthaExplore').then(m => m.AesthaExplore)
  ),
  defaultContent: { vi: VI, en: EN },
  // Phần tĩnh. `projects` + `footerLinks` được LayersPanel expand động qua
  // các helper trên — xem branch `aestha_explore` ở đó.
  elements: [
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
  ],
};
