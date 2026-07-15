/**
 * BlockDef cho `pnj_details` — sticky-track + scrub word-reveal (title + N đoạn).
 * Port từ apps/pnj DetailsSection. Path A registry.
 */
import { ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { PnjDetailsContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: PnjDetailsContent = {
  title: 'Citizen L Arcly Nữ',
  paragraphs: [
    'Đồng Hồ Citizen L Arcly Nữ Dây Kim Loại là sự kết hợp hoàn hảo giữa thiết kế thanh lịch, hiện đại và công nghệ tiên tiến, mang đến một lựa chọn tuyệt vời cho phái đẹp yêu thích sự sang trọng và tinh tế. Các chi tiết trên mặt đồng hồ, từ vạch chỉ giờ đến kim đồng hồ, đều được chế tác tỉ mỉ, mang đến sự rõ ràng và dễ dàng quan sát thời gian.',
    'Với thiết kế thanh lịch và thời thượng, chiếc đồng hồ này không chỉ là sự lựa chọn lý tưởng cho phái đẹp yêu thích sự sang trọng mà còn là món phụ kiện lý tưởng cho những người phụ nữ hiện đại, yêu thích sự thanh lịch và đẳng cấp.',
  ],
};

const EN: PnjDetailsContent = {
  title: 'Citizen L Arcly Ladies',
  paragraphs: [
    'The Citizen L Arcly Ladies metal-bracelet watch blends elegant modern design with advanced technology — a refined choice for women who value sophistication. Dial details, from hour markers to hands, are meticulously crafted for clarity and ease of reading.',
    'With its contemporary silhouette, this watch is both a luxurious everyday companion and an ideal accessory for modern women who appreciate grace and presence.',
  ],
};

export const pnjDetailsDef: BlockDef<PnjDetailsContent> = {
  type: 'pnj_details',
  meta: {
    type: 'pnj_details',
    label: 'PNJ · Details',
    accent: '#003468',
    adminLabel: 'PNJ Details',
    gradient: 'from-slate-100 to-blue-50',
    defaultName: 'PNJ Details',
    aiLabelVi:
      'section mô tả PNJ: pin scroll + word reveal tiêu đề và các đoạn văn',
    aiLabelEn:
      'PNJ details section: pinned scroll with word-reveal title and paragraphs',
  },
  component: dynamic(() => import('../../PnjDetails').then(m => m.PnjDetails)),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    {
      key: 'paragraphs',
      label: 'Đoạn văn',
      icon: ListChecks,
    },
  ],
};
