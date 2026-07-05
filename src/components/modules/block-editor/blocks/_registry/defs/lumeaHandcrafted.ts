/** BlockDef `lumea_handcrafted` — LumeaFeature (ảnh phải, reverse). */
import { Image as ImageIcon, Pilcrow, Sparkles, Type } from 'lucide-react';
import { LumeaFeature } from '../../LumeaFeature';
import type { LumeaFeatureContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: LumeaFeatureContent = {
  eyebrow: 'Floor-to-Ceiling Views',
  title:
    'Handcrafted Design Elements That Bring Timeless Elegance Into Modern Living',
  text: 'Natural stone, warm oak and bespoke metalwork come together in spaces that age beautifully. Lumea is designed to be lived in, not just looked at.',
  imageUrl:
    'https://cdn.prod.website-files.com/68e5ec116b3a2c9be42a08b1/68e5ec116b3a2c9be42a08c8_Rectangle%202714.webp',
  reverse: true,
};
const EN: LumeaFeatureContent = { ...VI };
export const lumeaHandcraftedDef: BlockDef<LumeaFeatureContent> = {
  type: 'lumea_handcrafted',
  meta: {
    type: 'lumea_handcrafted',
    label: 'Feature - Image Right',
    accent: '#a68a5b',
    adminLabel: 'Feature - Image Right',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Feature - Image Right',
    aiLabelVi: 'feature 2 cột đảo: heading serif và mô tả trái + ảnh phải',
    aiLabelEn:
      'reversed two-column feature: serif heading and copy left + image right',
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
