/**
 * BlockDef cho `the_grand_service` — section "Dịch Vụ" The Grand: dải cream tiêu
 * đề dọc bên trái đứng yên, track card (ảnh trái cao + khối info trắng phải đè
 * một phần lên ảnh) trượt ngang đè lên dải cream khi cuộn. Port từ apps/the-grand
 * Service. Path A registry.
 *
 * Layers: mỗi dịch vụ = 1 folder `groupId` — nhãn / ảnh / mô tả editable từng
 * field (pattern the_grand_location). Content vẫn là `items[]` động;
 * `elementsForType` expand từ content khi số dịch vụ ≠ default.
 */
import { Image as ImageIcon, ListChecks, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  TheGrandServiceContent,
  TheGrandServiceItem,
} from '../../../types';
import type { BlockDef } from '../types';

const VI_ITEMS: TheGrandServiceItem[] = [
  {
    label: 'Dịch vụ ăn uống',
    imageUrl: '/the-grand/dining.png',
    imageAlt: 'Đầu bếp trang trí món ăn fine dining',
    description:
      'Đội ngũ đầu bếp giàu kinh nghiệm, được đào tạo theo tiêu chuẩn ẩm thực quốc tế, sẵn sàng phục vụ tận nơi những thực đơn được cá nhân hóa theo khẩu vị và nhu cầu dinh dưỡng riêng của từng gia đình. Từ những bữa ăn thường nhật tinh tế đến các bữa tiệc sang trọng dành cho dịp đặc biệt, mỗi món ăn đều được chế biến và trình bày công phu như trong nhà hàng fine dining đẳng cấp.',
  },
  {
    label: 'Dịch vụ Dọn phòng',
    imageUrl: '/the-grand/housekeeping.png',
    imageAlt: 'Không gian phòng ngủ được dọn dẹp tinh tế',
    description:
      'Không gian sống được chăm sóc tỉ mỉ mỗi ngày bởi đội ngũ housekeeping chuyên nghiệp, tuân thủ nghiêm ngặt tiêu chuẩn vệ sinh và thẩm mỹ của thương hiệu Ritz-Carlton. Đặc biệt, dịch vụ turndown vào buổi tối – nét đặc trưng chỉ có tại các khách sạn 5 sao hàng đầu – mang đến những chi tiết tinh tế giúp cư dân tận hưởng cảm giác thư thái tuyệt đối.',
  },
  {
    label: 'Dịch vụ Cắm hoa',
    imageUrl: '/the-grand/floral.png',
    imageAlt: 'Nghệ nhân cắm hoa tươi theo mùa',
    description:
      'Những nghệ nhân cắm hoa tuyển chọn hoa tươi theo mùa, kiến tạo các tác phẩm nghệ thuật mang phong cách riêng cho từng không gian. Từ việc trang trí không gian sống thường nhật đến các dịp đón khách quý, mỗi bình hoa đều thổi hồn ấm cúng và tinh tế cho tổ ấm của chủ nhân.',
  },
  {
    label: 'Dịch vụ Spa & Chăm sóc',
    imageUrl: '/the-grand/spa.png',
    imageAlt: 'Liệu trình spa thư giãn tại gia',
    description:
      'Trải nghiệm spa đẳng cấp ngay tại chính căn hộ với đội ngũ chuyên viên trị liệu được tuyển chọn kỹ lưỡng. Các liệu trình chăm sóc cơ thể, thư giãn và phục hồi được thiết kế riêng cho từng cư dân, mang đến sự cân bằng cả về thể chất lẫn tinh thần mà không cần rời khỏi không gian riêng tư của mình.',
  },
];

const EN_ITEMS: TheGrandServiceItem[] = [
  {
    label: 'Dining service',
    imageUrl: '/the-grand/dining.png',
    imageAlt: 'Chef plating a fine-dining dish',
    description:
      'A team of seasoned chefs, trained to international culinary standards, is ready to serve in-residence menus personalised to each family’s taste and dietary needs. From refined everyday meals to lavish banquets for special occasions, every dish is prepared and presented with the artistry of a world-class fine-dining restaurant.',
  },
  {
    label: 'Housekeeping service',
    imageUrl: '/the-grand/housekeeping.png',
    imageAlt: 'An immaculately kept bedroom',
    description:
      'The living space is meticulously cared for each day by a professional housekeeping team that strictly upholds the Ritz-Carlton hygiene and aesthetic standards. The evening turndown service — a signature found only at the world’s leading five-star hotels — brings refined touches that let residents enjoy absolute serenity.',
  },
  {
    label: 'Floral service',
    imageUrl: '/the-grand/floral.png',
    imageAlt: 'An artisan arranging seasonal fresh flowers',
    description:
      'Master florists select fresh seasonal blooms to craft signature works of art for each space. From everyday styling of the home to welcoming distinguished guests, every arrangement breathes warmth and refinement into the owner’s residence.',
  },
  {
    label: 'Spa & wellness',
    imageUrl: '/the-grand/spa.png',
    imageAlt: 'A relaxing in-residence spa treatment',
    description:
      'Experience world-class spa treatments right inside the residence with carefully selected therapists. Body-care, relaxation and recovery programmes are tailored to each resident, restoring balance in both body and mind without ever leaving their private space.',
  },
];

const VI: TheGrandServiceContent = {
  heading: 'Dịch Vụ',
  items: VI_ITEMS,
};

const EN: TheGrandServiceContent = {
  heading: 'Services',
  items: EN_ITEMS,
};

/** Layers folders — 1 group / dịch vụ (nhãn / ảnh / mô tả). */
export const theGrandServiceItemElements = (
  items: TheGrandServiceItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : VI_ITEMS;
  return list.flatMap((it, i) => {
    const groupId = `item${i}`;
    const groupLabel = it.label?.trim() || `Dịch vụ ${i + 1}`;
    return [
      {
        key: `items[${i}].label`,
        label: 'nhãn',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].imageUrl`,
        label: 'ảnh',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `items[${i}].description`,
        label: 'mô tả',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
    ];
  });
};

export const theGrandServiceDef: BlockDef<TheGrandServiceContent> = {
  type: 'the_grand_service',
  meta: {
    type: 'the_grand_service',
    label: 'The Grand · Service',
    accent: '#f0e8d6',
    adminLabel: 'The Grand Service',
    gradient: 'from-amber-100 to-stone-200',
    defaultName: 'The Grand Service',
    aiLabelVi:
      'section dịch vụ The Grand: dải cream tiêu đề dọc bên trái đứng yên, track card (ảnh trái + info phải) trượt ngang đè lên khi cuộn',
    aiLabelEn:
      'The Grand service: cream vertical title strip pinned left, horizontal card track (image left + info right) scrubbing across it on scroll',
  },
  component: dynamic(() =>
    import('../../TheGrandService').then(m => m.TheGrandService)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    ...theGrandServiceItemElements(VI_ITEMS),
    { key: 'items', label: 'Thêm / quản lý dịch vụ', icon: ListChecks },
  ],
};
