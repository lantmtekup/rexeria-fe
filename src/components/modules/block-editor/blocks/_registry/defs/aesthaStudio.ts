/**
 * BlockDef cho `aestha_studio` — trang "STUDIO" / About (cùng site RAMSA/Aestha
 * với `aestha_explore`). Port từ `app/dev/ramsa-studio/page.tsx`.
 *
 * Wide (≥1200px): cột trái wordmark + bio + team + footer · ảnh phải 448px,
 * cursor-dot. Narrow (<1200px): xếp dọc. Path A registry.
 */
import { Briefcase, ImageIcon, Pilcrow, Type, User } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { AesthaStudioContent, AesthaStudioMember } from '../../../types';
import type { BlockDef } from '../types';

// Team (recon: raw/block.html).
const TEAM: AesthaStudioMember[] = [
  { name: 'Elias Norwood', role: 'Founder & Creative Director' },
  { name: 'Vivian Kershaw', role: 'Lead Interior Architect' },
  { name: 'Matteo Renshaw', role: 'Head of Spatial Design' },
  { name: 'Elara Mendez', role: 'Interior Stylist' },
  { name: 'Cassian Dreyer', role: 'Lighting Designer' },
  { name: 'Noa Selkirk', role: '3D Visualization Specialist' },
];

const BIO =
  'At Ramsa, we believe interiors are more than just spaces—they’re experiences. Every line, texture, and material we choose is an intentional dialogue between design and emotion, shaping environments that feel as good as they look. Rooted in a philosophy of understated elegance, our approach blends contemporary aesthetics with timeless craftsmanship. We specialize in creating interiors that are both functional and evocative, transforming houses into homes and commercial spaces into narratives of brand identity.';

// Ảnh tòa nhà (Image wrapper), CDN Framer — portrait 1576×2364.
const HERO_IMG =
  'https://framerusercontent.com/images/ZOD0bzURObuyj6UYJSP6X2Wavc.jpg?scale-down-to=1024&width=1576&height=2364';

// Nav (`footerLinks` / `currentFooterLabel`) đã tách sang block `aestha_nav`
// — không seed nữa; field chỉ còn optional để blueprint cũ không vỡ.
const VI: AesthaStudioContent = {
  wordmark: 'STUDIO',
  bio: BIO,
  team: TEAM,
  imageUrl: HERO_IMG,
  imageAlt: 'Ramsa architectural project — masonry residential tower',
};

const EN: AesthaStudioContent = {
  wordmark: 'STUDIO',
  bio: BIO,
  team: TEAM,
  imageUrl: HERO_IMG,
  imageAlt: 'Ramsa architectural project — masonry residential tower',
};

/**
 * `team` là mảng động → không biểu diễn được trong `elements` tĩnh.
 * `LayersPanel.elementsForType` gọi helper này để expand `team[i]`
 * (pattern `aesthaExploreProjectElements`).
 */
export const aesthaStudioTeamElements = (
  team: AesthaStudioMember[]
): LayerElement[] =>
  team.flatMap((_, i) => [
    {
      key: `team[${i}].name`,
      label: 'Tên',
      groupId: `team${i}`,
      groupLabel: `Thành viên ${i + 1}`,
      icon: User,
      fieldType: 'text' as const,
    },
    {
      key: `team[${i}].role`,
      label: 'Vai trò',
      groupId: `team${i}`,
      icon: Briefcase,
      fieldType: 'text' as const,
    },
  ]);

export const aesthaStudioDef: BlockDef<AesthaStudioContent> = {
  type: 'aestha_studio',
  meta: {
    type: 'aestha_studio',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'framer', 'about'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'Aestha Studio',
    accent: '#0F0F0F',
    adminLabel: 'Studio / About (Aestha)',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Studio',
    aiLabelVi:
      'trang STUDIO / About: wordmark + bio + danh sách team + ảnh portrait',
    aiLabelEn:
      'STUDIO / About page: wordmark + bio + team list + portrait image',
  },
  component: dynamic(() =>
    import('../../AesthaStudio').then(m => m.AesthaStudio)
  ),
  defaultContent: { vi: VI, en: EN },
  // Phần tĩnh. `team` được LayersPanel expand động qua helper trên —
  // xem branch `aestha_studio` ở đó.
  elements: [
    { key: 'wordmark', label: 'Wordmark', icon: Type, fieldType: 'text' },
    { key: 'bio', label: 'Bio', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'imageUrl', label: 'Ảnh', icon: ImageIcon, fieldType: 'image' },
    { key: 'imageAlt', label: 'Alt ảnh', icon: Type, fieldType: 'text' },
  ],
};
