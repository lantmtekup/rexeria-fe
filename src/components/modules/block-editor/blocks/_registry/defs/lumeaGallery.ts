/** BlockDef `lumea_gallery`. */
import { GalleryHorizontal, Type } from 'lucide-react';
import { LumeaGallery } from '../../LumeaGallery';
import type { LumeaGalleryContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: LumeaGalleryContent = {
  title: 'Gallery',
  images: [
    'https://cdn.prod.website-files.com/68e5ec116b3a2c9be42a08b1/68e5ec116b3a2c9be42a08c7_Rectangle%202713.webp',
    'https://cdn.prod.website-files.com/68e5ec116b3a2c9be42a08b1/68e5ec116b3a2c9be42a08c8_Rectangle%202714.webp',
    'https://cdn.prod.website-files.com/68e5ec116b3a2c9be42a08b1/68e5ec116b3a2c9be42a08c6_Immersive.webp',
  ],
};
const EN: LumeaGalleryContent = { ...VI };
export const lumeaGalleryDef: BlockDef<LumeaGalleryContent> = {
  type: 'lumea_gallery',
  meta: {
    type: 'lumea_gallery',
    label: 'Gallery - Interior Grid',
    accent: '#a68a5b',
    adminLabel: 'Gallery - Interior Grid',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Gallery - Interior Grid',
    aiLabelVi: 'lưới ảnh nội thất bo góc + heading serif',
    aiLabelEn: 'rounded interior image grid + serif heading',
  },
  component: LumeaGallery,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'images', label: 'Ảnh', icon: GalleryHorizontal },
  ],
};
