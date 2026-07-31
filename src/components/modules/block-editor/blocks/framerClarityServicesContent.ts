import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import type { LayerElement } from '../LayersPanel';
import type {
  FramerClarityServiceItem,
  FramerClarityServicesContent,
} from '../types';

/**
 * Normalize + Layers folders cho `framer_clarity_services.services[]` — dùng
 * CHUNG bởi canvas render, LayersPanel `elementsForType` và list manager trong
 * ElementToolbar để số item không bao giờ lệch nhau (pattern
 * `theGrandServiceContent.ts` / `scrollImgScale.ts`).
 *
 * `services[]` là mảng ĐỘNG: thêm/xoá qua Lớp →「Thêm / quản lý dịch vụ」.
 * Grid tự giãn số hàng theo số item (2 card / hàng, ảnh giữa span hết hàng).
 */

/** Item mặc định khi content thiếu / rỗng — giữ block không trắng trên canvas. */
export const FRAMER_CLARITY_SERVICES_DEFAULT_ITEMS: FramerClarityServiceItem[] =
  [
    {
      iconUrl:
        'https://framerusercontent.com/images/ugycgoOkv3p1p1LgDNQKUj0DMw.svg',
      title: 'Tư vấn chiến lược',
      description: 'Xác định hướng đi rõ ràng cho doanh nghiệp của bạn.',
    },
    {
      iconUrl:
        'https://framerusercontent.com/images/hkvMklMx6UMQAP554YRJlGFEC38.svg?width=52&height=52',
      title: 'Thiết kế thương hiệu',
      description: 'Xây dựng bản sắc thương hiệu mạnh mẽ và nhất quán.',
    },
    {
      iconUrl:
        'https://framerusercontent.com/images/wcJdPBWrhic7UC9lCPXawWPP6OM.svg?width=52&height=52',
      title: 'Phát triển kỹ thuật số',
      description: 'Giải pháp công nghệ hiện đại phục vụ tăng trưởng.',
    },
    {
      iconUrl:
        'https://framerusercontent.com/images/nvcIvRkMNCueCZAw3q3pHxc3mc4.svg?width=52&height=52',
      title: 'Tối ưu hoá hiệu suất',
      description: 'Cải thiện kết quả thông qua phân tích dữ liệu.',
    },
  ];

/** Item trống khi bấm「Thêm dịch vụ」— icon để trống → fallback dấu cộng SVG. */
export const FRAMER_CLARITY_SERVICE_NEW_ITEM: FramerClarityServiceItem = {
  iconUrl: '',
  title: 'Dịch vụ mới',
  description: 'Mô tả ngắn cho dịch vụ này.',
};

/** Resolve `services[]` — fallback default khi thiếu / rỗng. */
export const resolveFramerClarityServices = (
  content: FramerClarityServicesContent | null | undefined
): FramerClarityServiceItem[] => {
  const raw = content?.services as unknown;
  if (!Array.isArray(raw)) {
    return FRAMER_CLARITY_SERVICES_DEFAULT_ITEMS.map(item => ({ ...item }));
  }
  const list = raw
    .filter(v => v && typeof v === 'object')
    .map(v => {
      const item = v as Partial<FramerClarityServiceItem>;
      return {
        iconUrl: typeof item.iconUrl === 'string' ? item.iconUrl : '',
        title: typeof item.title === 'string' ? item.title : '',
        description:
          typeof item.description === 'string' ? item.description : '',
      };
    });
  if (list.length === 0) {
    return FRAMER_CLARITY_SERVICES_DEFAULT_ITEMS.map(item => ({ ...item }));
  }
  return list;
};

/** Layers folders — 1 group / dịch vụ (icon + tiêu đề + mô tả). */
export const framerClarityServiceItemElements = (
  items: FramerClarityServiceItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : FRAMER_CLARITY_SERVICES_DEFAULT_ITEMS;
  return list.flatMap((item, i) => {
    const groupId = `service${i}`;
    const groupLabel =
      (item.title ?? '').trim().slice(0, 40) || `Dịch vụ ${i + 1}`;
    return [
      {
        key: `services[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `services[${i}].description`,
        label: 'Mô tả',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
      {
        key: `services[${i}].iconUrl`,
        label: 'Icon',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
    ];
  });
};
