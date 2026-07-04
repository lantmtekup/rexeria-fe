/**
 * BlockDef cho `delvaux_header` — thanh logo căn giữa (section `.header` của
 * delvaux-clone). Component: `blocks/DelvauxHeader.tsx`. Đăng ký Path A.
 *
 * Default dùng logo thật trong `public/delvaux/` (asset thuộc sở hữu dự án).
 */
import { Image as ImageIcon, Type } from 'lucide-react';

import { DelvauxHeader } from '../../DelvauxHeader';
import type { DelvauxHeaderContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: DelvauxHeaderContent = {
  logoUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/d0f947cd-369e-47f8-bff3-b3784d3b08ed/delvaux-svg-logo.svg',
  logoText: 'DELVAUX',
};

const EN: DelvauxHeaderContent = { ...VI };

export const delvauxHeaderDef: BlockDef<DelvauxHeaderContent> = {
  type: 'delvaux_header',
  meta: {
    type: 'delvaux_header',
    label: 'Header - Logo',
    accent: '#000000',
    adminLabel: 'Header - Logo',
    gradient: 'from-white to-neutral-100',
    defaultName: 'Header - Logo',
    aiLabelVi: 'thanh header tối giản chỉ có logo căn giữa',
    aiLabelEn: 'minimal centered logo header bar',
  },
  component: DelvauxHeader,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'logoUrl',
      label: 'Logo (ảnh)',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'logoText', label: 'Logo (chữ)', icon: Type, fieldType: 'text' },
  ],
};
