/** BlockDef `nordhaven_gallery`. */
import { GalleryHorizontal, Type } from 'lucide-react';
import { NordhavenGallery } from '../../NordhavenGallery';
import type { NordhavenGalleryContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: NordhavenGalleryContent = {
  title: 'Selected work',
  images: [
    'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9a3290ebbfac062548_About%20Gallery%20%283%29.webp',
    'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9a4fca8fc4ddbcf774_About%20Gallery%20%286%29.webp',
    'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9a42ac4da0e95074ba_About%20Gallery%20%287%29.webp',
    'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9a74a0c42e1dc8082a_About%20Gallery%20%288%29.webp',
  ],
};
const EN: NordhavenGalleryContent = { ...VI };
export const nordhavenGalleryDef: BlockDef<NordhavenGalleryContent> = {
  type: 'nordhaven_gallery',
  meta: {
    type: 'nordhaven_gallery',
    label: 'Gallery - Architecture Grid',
    accent: '#111111',
    adminLabel: 'Gallery - Architecture Grid',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Gallery - Architecture Grid',
    aiLabelVi: 'lưới ảnh kiến trúc nền tối',
    aiLabelEn: 'dark architecture image grid',
  },
  component: NordhavenGallery,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'images', label: 'Ảnh', icon: GalleryHorizontal },
  ],
};
