/**
 * BlockDef cho `interactive_ad_widget` — clone tính năng "quảng cáo tương
 * tác" từ 360-admin-cms. Chỉ có 1 "field" duy nhất trong Layers panel —
 * `slides` — vì toàn bộ nội dung là mảng lồng nhau (slides → hotspots/ctas),
 * sửa qua panel riêng `InteractiveAdControls` trong `ElementToolbar.tsx`
 * (route theo `resolveKind`'s blockType-aware special-case cho key `slides`
 * trùng tên với `image_carousel` nhưng khác shape), không qua field text/image
 * thông thường.
 */
import { Grid3x3 } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { InteractiveAdWidgetContent } from '../../../types';
import type { BlockDef } from '../types';

const DEFAULT_CONTENT: InteractiveAdWidgetContent = {
  slides: [
    {
      id: 'slide-1',
      backgroundType: 'image',
      backgroundUrl:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      hotspots: [
        {
          id: 'hotspot-1',
          xPct: 50,
          yPct: 50,
          label: 'Xem chi tiết',
          ctaId: 'cta-1',
        },
      ],
      ctas: [
        { id: 'cta-1', label: 'Tìm hiểu thêm', href: '#', style: 'primary' },
      ],
    },
  ],
  closeable: true,
  autoplayMs: 4500,
};

export const interactiveAdWidgetDef: BlockDef<InteractiveAdWidgetContent> = {
  type: 'interactive_ad_widget',
  meta: {
    type: 'interactive_ad_widget',
    label: 'Quảng cáo tương tác',
    accent: '#7c3aed',
    adminLabel: 'Interactive Ad',
    gradient: 'from-violet-500 to-fuchsia-600',
    defaultName: 'Quảng cáo tương tác',
    aiLabelVi: 'widget quảng cáo nhiều slide có hotspot và nút CTA',
    aiLabelEn: 'multi-slide ad widget with hotspots and CTA buttons',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../InteractiveAdWidget').then(m => m.InteractiveAdWidget)
  ),
  defaultContent: { vi: DEFAULT_CONTENT, en: { ...DEFAULT_CONTENT } },
  elements: [{ key: 'slides', label: 'Slides quảng cáo', icon: Grid3x3 }],
};
