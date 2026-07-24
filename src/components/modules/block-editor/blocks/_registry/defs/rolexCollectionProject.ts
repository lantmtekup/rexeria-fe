/** BlockDef `rolex_collection_project`. */
import { Image as ImageIcon, Pilcrow, Sparkles, Type } from 'lucide-react';
import { RolexCollectionProject } from '../../RolexCollectionProject';
import type { RolexCollectionProjectContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: RolexCollectionProjectContent = {
  eyebrow: 'Client ✤',
  title: 'SUBMARINER',
  description:
    'A mixed-media project that blends augmented reality and digital design to transform Broadway theaters into virtual gardens, viewable via AR apps.',
  heroImageUrl: '/rolex-collection/project-details/hero-watch.jpg',
  bandImageUrl1: '/rolex-collection/project-details/underwater-watch.jpg',
  pairImageLeftUrl: '/rolex-collection/project-details/diamond-watch.jpg',
  pairImageRightUrl: '/rolex-collection/project-details/rosegold-watch.jpg',
  bandImageUrl2: '/rolex-collection/project-details/gold-watch.jpg',
  closingImageUrl: '/rolex-collection/project-details/portrait.jpg',
  closingSubheading: 'With chronograph counters',
  closingParagraph:
    'This model features a bright green and golden dial with spray-coated counters, 18 ct gold applique hour markers and hands with a Chromalight display, a highly-legible luminescent material.\n\nThe dial allows drivers to accurately map out their track times and tactics without fail.',
  symbol: '✤',
};

const EN: RolexCollectionProjectContent = { ...VI };

export const rolexCollectionProjectDef: BlockDef<RolexCollectionProjectContent> = {
  type: 'rolex_collection_project',
  meta: {
    type: 'rolex_collection_project',
    label: 'Rolex Collection Project',
    accent: '#000000',
    adminLabel: 'Rolex Collection Project',
    gradient: 'from-neutral-100 to-white',
    defaultName: 'Rolex Collection Project',
    aiLabelVi:
      'toàn bộ trang chi tiết dự án: hero (ảnh + heading animation per-char + mô tả) → dải ảnh full-width → 2 ảnh cạnh nhau → dải ảnh full-width → split đóng bài (ảnh + subheading + mô tả + glyph)',
    aiLabelEn:
      'full project-details page: hero (image + per-char animated heading + description) → full-width image band → 2 side-by-side images → full-width image band → closing split (image + subheading + description + glyph)',
  },
  component: RolexCollectionProject,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'heroImageUrl', label: 'Ảnh hero', icon: ImageIcon, fieldType: 'image' },
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Heading lớn', icon: Type, fieldType: 'text' },
    { key: 'description', label: 'Mô tả (hero)', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'bandImageUrl1', label: 'Ảnh dải 1 (full-width)', icon: ImageIcon, fieldType: 'image' },
    { key: 'pairImageLeftUrl', label: 'Ảnh trái (2 ảnh cạnh nhau)', icon: ImageIcon, fieldType: 'image' },
    { key: 'pairImageRightUrl', label: 'Ảnh phải (2 ảnh cạnh nhau)', icon: ImageIcon, fieldType: 'image' },
    { key: 'bandImageUrl2', label: 'Ảnh dải 2 (full-width)', icon: ImageIcon, fieldType: 'image' },
    { key: 'closingImageUrl', label: 'Ảnh đóng bài', icon: ImageIcon, fieldType: 'image' },
    { key: 'closingSubheading', label: 'Subheading đóng bài', icon: Type, fieldType: 'text' },
    { key: 'closingParagraph', label: 'Mô tả đóng bài', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'symbol', label: 'Glyph trang trí (để trống = ẩn)', icon: Type, fieldType: 'text' },
  ],
};
