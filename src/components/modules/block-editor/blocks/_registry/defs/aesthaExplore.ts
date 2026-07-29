/**
 * BlockDef cho `aestha_explore` — trang index "EXPLORE" (cùng site RAMSA/Aestha
 * với `framer_aestha_editorial`). Clone từ `app/dev/nami-explore/page.tsx`.
 *
 * Wide (≥1100px): menu tên dự án phải, hover → crossfade ảnh featured, cursor-dot.
 * Narrow (<1100px): 1 dự án/màn, vuốt trái/phải để duyệt. Path A registry.
 */
import { ImageIcon, Link2, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  AesthaExploreContent,
  AesthaExploreProject,
} from '../../../types';
import type { BlockDef } from '../types';

// Menu → ảnh (giữ CDN framerusercontent.com theo asset rule của skill).
// detail.body chứa content hiển thị khi click vào project.
//
// ⚠️ `href` để RỖNG có chủ đích — KHÔNG điền path demo (`/projects/…`). Lý do:
//  1. Path đó 404 trên site public (path thật là `/p/{rootSlug}/{slug}`).
//  2. `href` rỗng = block mở view chi tiết nội bộ (`AesthaProject` nhúng) — hành
//     vi mặc định mong muốn. Điền href là ép điều hướng, khoá luôn view chi tiết.
// Author gán link thật qua link-picker của toolbar (`fieldType: 'link'`).
const PROJECTS: AesthaExploreProject[] = [
  {
    label: 'Vision',
    href: '',
    img: '/aestha/vision-1.png',
    alt: 'Kiến trúc tầm nhìn — khoảnh khắc ánh sáng tự nhiên',
    detail: {
      body: [
        'Aestha là studio kiến trúc và thiết kế nội thất được thành lập với sứ mệnh kiến tạo không gian sống đương đại — nơi di sản văn hoá gặp gỡ ngôn ngữ thiết kế quốc tế. Mỗi công trình là một câu chuyện riêng, được kể bằng vật liệu, ánh sáng và tỉ lệ.',
        'Chúng tôi tin rằng kiến trúc đích thực không chỉ nằm ở hình khối mà còn ở cảm xúc mà nó mang lại. Từng đường nét, từng khoảng sáng — tối đều được cân nhắc để tạo nên những rung động thẩm mỹ sâu sắc cho người ở.',
        'Với đội ngũ kiến trúc sư giàu kinh nghiệm, Aestha cam kết đồng hành cùng khách hàng từ ý tưởng đầu tiên đến từng chi tiết hoàn thiện cuối cùng — biến mọi không gian thành tác phẩm nghệ thuật sống.',
      ],
      images: [
        { src: '/aestha/vision-2.png', alt: 'Phối cảnh tổng thể công trình' },
        { src: '/aestha/vision-3.png', alt: 'Không gian đón sáng tự nhiên' },
        { src: '/aestha/vision-4.png', alt: 'Chi tiết mặt đứng và vật liệu' },
      ],
    },
  },
  {
    label: 'Architecture',
    href: '',
    img: '/aestha/architecture-1.png',
    alt: 'Thiết kế kiến trúc đương đại',
    detail: {
      body: [
        'Ngôn ngữ kiến trúc của Aestha là sự kết hợp tinh tế giữa phong cách tối giản đương đại và những giá trị bản địa — tạo nên những công trình vừa hiện đại vừa mang hồn cốt văn hoá Việt.',
        'Mỗi công trình đều được nghiên cứu kỹ lưỡng về khí hậu, cảnh quan và địa chất để tối ưu hoá công năng sử dụng. Hệ thống cửa kính lớn đón sáng tự nhiên, giếng trời thông gió và vật liệu thân thiện là những yếu tố cốt lõi.',
        'Từ biệt thự nghỉ dưỡng ven biển đến căn hộ cao cấp giữa lòng thành phố — mỗi dự án của Aestha đều là một tuyên ngôn về chất lượng sống, nơi kiến trúc và thiên nhiên hoà quyện không tách rời.',
      ],
      images: [
        {
          src: '/aestha/architecture-2.png',
          alt: 'Mặt tiền và khối tích công trình',
        },
        {
          src: '/aestha/architecture-3.png',
          alt: 'Không gian giao thoa nội — ngoại thất',
        },
        {
          src: '/aestha/architecture-4.png',
          alt: 'Chi tiết kết cấu và hoa văn',
        },
      ],
    },
  },
  {
    label: 'Interior',
    href: '',
    img: '/aestha/image-1.png',
    alt: 'Thiết kế nội thất dẫn dắt cảm xúc',
    detail: {
      body: [
        'Không gian nội thất được Aestha thiết kế như một bức tranh sống động — mỗi món đồ, mỗi chất liệu đều được tuyển chọn để kể tiếp câu chuyện kiến trúc của tổng thể.',
        'Chúng tôi ưu tiên sử dụng vật liệu tự nhiên như gỗ, đá, vải lanh và kim loại thủ công — mang đến cảm giác ấm áp, gần gũi nhưng không kém phần tinh tế. Gam màu trung tính làm nền cho những điểm nhấn nghệ thuật.',
        'Ánh sáng là yếu tố then chốt trong mọi thiết kế nội thất của Aestha. Hệ thống chiếu sáng được phân tầng tinh vi — từ ánh sáng tổng thể đến đèn điểm — tạo nên những cung bậc cảm xúc khác nhau theo thời gian trong ngày.',
      ],
      images: [
        {
          src: '/aestha/image-2.png',
          alt: 'Phòng khách với tầm nhìn panorama',
        },
        { src: '/aestha/image-3.png', alt: 'Phòng ngủ và không gian thư giãn' },
        { src: '/aestha/image-4.png', alt: 'Chi tiết decor và ánh sáng điểm' },
      ],
    },
  },
  {
    label: 'Amenities',
    href: '',
    img: '/aestha/image-1.png',
    alt: 'Hệ thống tiện ích cao cấp toàn diện',
    detail: {
      body: [
        'Aestha mang đến trải nghiệm sống toàn diện với hệ thống tiện ích đa tầng — từ không gian thư giãn, giải trí đến chăm sóc sức khoẻ và kết nối cộng đồng.',
        'Hồ bơi vô cực tầng thượng, khu vườn thiền trên cao và phòng gym hiện đại được thiết kế như những điểm chạm tinh tế trong quỹ đạo sống hàng ngày của cư dân.',
        'Mỗi chi tiết tiện ích đều được chúng tôi nghiên cứu để phục vụ một lối sống trọn vẹn — nơi nghỉ dưỡng bắt đầu ngay trước cửa nhà bạn.',
      ],
      images: [
        { src: '/aestha/image-2.png', alt: 'Hồ bơi vô cực tầng thượng' },
        {
          src: '/aestha/image-3.png',
          alt: 'Khu vườn thiền và không gian xanh',
        },
        { src: '/aestha/image-4.png', alt: 'Chi tiết decor và ánh sáng điểm' },
      ],
    },
  },
  {
    label: 'Nami Retreat',
    href: '',
    img: '/aestha/image-4.png',
    alt: 'Khu nghỉ dưỡng ven biển nhiệt đới đương đại',
    detail: {
      body: [
        'Nami Retreat là khu nghỉ dưỡng ven biển mang phong cách kiến trúc nhiệt đới đương đại — nơi những mái che lớn, gió biển và bóng râm tạo nên một vi khí hậu riêng giữa thiên nhiên.',
        'Thiết kế tôn trọng tối đa cảnh quan sẵn có: các khối tích thấp nép mình dưới tán cây, vật liệu địa phương như tre, đá ong và gỗ tái sinh được sử dụng xuyên suốt toàn bộ dự án.',
        'Mỗi căn biệt thự đều có hồ bơi riêng nhìn ra biển — ranh giới giữa không gian trong nhà và ngoài trời được xoá nhoà bằng những tấm kính trượt toàn phần.',
      ],
      images: [
        {
          src: '/aestha/image-1.png',
          alt: 'Phối cảnh tổng thể khu nghỉ dưỡng',
        },
        { src: '/aestha/image-2.png', alt: 'Biệt thự hướng biển với hồ bơi' },
        {
          src: '/aestha/image-3.png',
          alt: 'Khu spa và tiện chăm sóc sức khoẻ',
        },
      ],
    },
  },
];

// Nav (`footerLinks` / `currentFooterLabel`) đã tách sang block `aestha_nav`
// — không seed nữa; field chỉ còn optional để blueprint cũ không vỡ.
const VI: AesthaExploreContent = {
  heading: 'EXPLORE',
  headingHoverLabel: 'VIEW PROJECTS',
  // Seed rỗng như aestha_nav: đích tuỳ trang, user tự set qua LinkControls.
  headingHref: '',
  projects: PROJECTS,
};

const EN: AesthaExploreContent = {
  heading: 'EXPLORE',
  headingHoverLabel: 'VIEW PROJECTS',
  // Seed rỗng như aestha_nav: đích tuỳ trang, user tự set qua LinkControls.
  headingHref: '',
  projects: PROJECTS,
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
        fieldType: 'link' as const,
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

    // Row list-manager: thêm/xoá ảnh chi tiết ngay trong nhóm nội dung dự án
    // (mở `AesthaExploreProjectImagesControls` theo đúng dự án `i`).
    elements.push({
      key: `projects[${i}].detail.images`,
      label: 'Thêm / quản lý ảnh',
      groupId: detailGroupId,
      icon: ListChecks,
    });

    return elements;
  });

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
  // Phần tĩnh. `projects` được LayersPanel expand động qua helper trên —
  // xem branch `aestha_explore` ở đó.
  elements: [
    {
      key: 'heading',
      label: 'Tiêu đề',
      groupId: 'heading',
      groupLabel: 'Tiêu đề',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'headingHoverLabel',
      label: 'Nhãn khi hover',
      groupId: 'heading',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'headingHref',
      label: 'Link',
      groupId: 'heading',
      icon: Link2,
      fieldType: 'link',
    },
  ],
};
