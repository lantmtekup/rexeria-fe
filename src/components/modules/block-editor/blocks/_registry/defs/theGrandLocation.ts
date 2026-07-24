/**
 * BlockDef cho `the_grand_location` — section "Vị Trí Độc Tôn" The Grand:
 * aside trái ghim (tiêu đề + danh sách địa điểm bấm được), cột phải sticky
 * trượt qua từng card (60% ảnh / 40% info) khi cuộn. Port từ apps/the-grand
 * Location. Path A registry.
 *
 * Layers: mỗi địa điểm = 1 folder `groupId` — nhãn / ảnh / mô tả / stat editable
 * từng field (pattern pnj_variant). Content vẫn là `items[]` động; `elementsForType`
 * expand từ content khi số địa điểm ≠ default.
 */
import { Gauge, Image as ImageIcon, Pilcrow, Ruler, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  TheGrandLocationContent,
  TheGrandLocationItem,
} from '../../../types';
import type { BlockDef } from '../types';

const VI_ITEMS: TheGrandLocationItem[] = [
  {
    label: 'Bản đồ vị trí',
    imageUrl: '/the-grand/map.jpg',
    imageAlt: 'Bản đồ vị trí The Grand tại quận Hoàn Kiếm',
    description:
      'Nằm ở trung tâm quận Hoàn Kiếm chỉ cách 1 phút đi xe, bao quanh bởi những địa danh nổi tiếng, với mọi tiện ích hiện đại bậc nhất, Khu căn hộ hàng hiệu Ritz-Carlton tại The Grand mang đến cho chủ nhân một cuộc sống đẳng cấp xứng tầm quốc tế.',
    statValue: '1',
    statUnit: 'Phút đi xe',
  },
  {
    label: 'Các địa danh',
    imageUrl: '/the-grand/landmarks.jpg',
    imageAlt: 'Các địa danh nổi tiếng quanh The Grand',
    description:
      'Chỉ vài phút di chuyển, cư dân có thể dễ dàng kết nối tới hồ Hoàn Kiếm, khu phố cổ, các trung tâm thương mại cao cấp, cùng những công trình văn hóa – lịch sử mang tính biểu tượng của Thủ đô, tạo nên một vị trí độc tôn hiếm có giữa lòng Hà Nội.',
    statValue: '3-50',
    statUnit: 'Phút đi xe',
  },
  {
    label: 'Trung tâm mua sắm',
    imageUrl: '/the-grand/shopping.png',
    imageAlt: 'Trung tâm mua sắm gần The Grand',
    description:
      'Tọa lạc ngay trên con phố Hàng Bài sầm uất, Khu căn hộ hàng hiệu Ritz-Carlton tại The Grand sở hữu vị trí đắc địa khi liền kề Tràng Tiền Plaza – biểu tượng mua sắm cao cấp lâu đời bậc nhất Thủ đô, quy tụ những thương hiệu xa xỉ hàng đầu thế giới.',
    statValue: '2',
    statUnit: 'Phút đi xe',
  },
  {
    label: 'Bệnh viện',
    imageUrl: '/the-grand/hospital.png',
    imageAlt: 'Bệnh viện gần The Grand',
    description:
      'Bệnh viện Việt Đức và các cơ sở y tế hàng đầu cả nước ở ngay gần kề, đảm bảo dịch vụ chăm sóc sức khỏe nhanh chóng và tận tâm cho cả gia đình.',
    statValue: '5',
    statUnit: 'Phút đi xe',
  },
];

const EN_ITEMS: TheGrandLocationItem[] = [
  {
    label: 'Location map',
    imageUrl: '/the-grand/map.jpg',
    imageAlt: 'The Grand location map in Hoan Kiem district',
    description:
      'Set in the heart of Hoan Kiem district, just one minute away and surrounded by famous landmarks with the finest modern amenities, the Ritz-Carlton branded residences at The Grand offer their owners a life of international distinction.',
    statValue: '1',
    statUnit: 'Minute drive',
  },
  {
    label: 'Landmarks',
    imageUrl: '/the-grand/landmarks.jpg',
    imageAlt: 'Famous landmarks around The Grand',
    description:
      'Only minutes away, residents connect easily to Hoan Kiem Lake, the Old Quarter, premium shopping centres and the capital’s iconic cultural and historic monuments — an exceptional, rare address in the middle of Hanoi.',
    statValue: '3-50',
    statUnit: 'Minute drive',
  },
  {
    label: 'Shopping centres',
    imageUrl: '/the-grand/shopping.png',
    imageAlt: 'Shopping centre near The Grand',
    description:
      'On bustling Hang Bai street, the Ritz-Carlton branded residences at The Grand enjoy a prime position next to Trang Tien Plaza — the capital’s most established luxury shopping icon, home to the world’s leading premium brands.',
    statValue: '2',
    statUnit: 'Minute drive',
  },
  {
    label: 'Hospitals',
    imageUrl: '/the-grand/hospital.png',
    imageAlt: 'Hospital near The Grand',
    description:
      'Viet Duc Hospital and the country’s leading medical facilities are right nearby, ensuring fast and attentive healthcare for the whole family.',
    statValue: '5',
    statUnit: 'Minute drive',
  },
];

const VI: TheGrandLocationContent = {
  heading: 'Vị Trí Độc Tôn',
  items: VI_ITEMS,
};

const EN: TheGrandLocationContent = {
  heading: 'A Coveted Location',
  items: EN_ITEMS,
};

/** Layers folders — 1 group / địa điểm (nhãn / ảnh / mô tả / stat). */
export const theGrandLocationItemElements = (
  items: TheGrandLocationItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : VI_ITEMS;
  return list.flatMap((it, i) => {
    const groupId = `item${i}`;
    const groupLabel = it.label?.trim() || `Địa điểm ${i + 1}`;
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
      {
        key: `items[${i}].statValue`,
        label: 'số liệu',
        groupId,
        icon: Gauge,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].statUnit`,
        label: 'đơn vị',
        groupId,
        icon: Ruler,
        fieldType: 'text' as const,
      },
    ];
  });
};

export const theGrandLocationDef: BlockDef<TheGrandLocationContent> = {
  type: 'the_grand_location',
  meta: {
    type: 'the_grand_location',
    label: 'The Grand · Location',
    accent: '#0f0b08',
    adminLabel: 'The Grand Location',
    gradient: 'from-stone-900 to-amber-950',
    defaultName: 'The Grand Location',
    aiLabelVi:
      'section vị trí The Grand: aside trái ghim (tiêu đề + danh sách địa điểm bấm được), cột phải sticky trượt qua từng card 60% ảnh / 40% info khi cuộn',
    aiLabelEn:
      'The Grand location: pinned left aside (title + clickable place list), right sticky column scrubbing through cards on scroll',
  },
  component: dynamic(() =>
    import('../../TheGrandLocation').then(m => m.TheGrandLocation)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    ...theGrandLocationItemElements(VI_ITEMS),
  ],
};
