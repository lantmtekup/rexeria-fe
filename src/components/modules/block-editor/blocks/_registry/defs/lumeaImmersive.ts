/** BlockDef `lumea_immersive` — LumeaFeature (ảnh trái). */
import { Image as ImageIcon, Pilcrow, Sparkles, Type } from 'lucide-react';
import { LumeaFeature } from '../../LumeaFeature';
import type { LumeaFeatureContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: LumeaFeatureContent = {
  eyebrow: 'Immersive Living',
  title:
    'Lumea Residence is an architectural landmark that redefines modern city living.',
  text: 'Floor-to-ceiling glass, panoramic terraces and interiors sculpted by world-class designers. Every detail is engineered to feel effortless, so life at Lumea flows the way it should.',
  imageUrl:
    'https://cdn.prod.website-files.com/68e5ec116b3a2c9be42a08b1/68e5ec116b3a2c9be42a08c6_Immersive.webp',
  reverse: false,
};
const EN: LumeaFeatureContent = { ...VI };
export const lumeaImmersiveDef: BlockDef<LumeaFeatureContent> = {
  type: 'lumea_immersive',
  meta: {
    type: 'lumea_immersive',
    label: 'Feature - Image Left',
    accent: '#a68a5b',
    adminLabel: 'Feature - Image Left',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Feature - Image Left',
    aiLabelVi: 'feature 2 cột: ảnh trái + heading serif và mô tả phải',
    aiLabelEn: 'two-column feature: image left + serif heading and copy right',
  },
  component: LumeaFeature,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'text', label: 'Mô tả', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'image', label: 'Ảnh', icon: ImageIcon, fieldType: 'image' },
  ],
};
