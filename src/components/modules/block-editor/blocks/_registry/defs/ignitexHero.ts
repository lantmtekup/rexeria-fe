/** BlockDef `ignitex_hero`. */
import {
  Image as ImageIcon,
  ListChecks,
  MapPin,
  Pilcrow,
  Type,
} from 'lucide-react';
import { IgnitexHero } from '../../IgnitexHero';
import type { IgnitexHeroContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: IgnitexHeroContent = {
  location: 'Based in: Los Angeles, USA',
  titleLead: 'Design',
  titleTrail: 'Strategy',
  subtitle:
    "We turn bold ideas into standout brands and sleek websites. Let's bring your vision to life.",
  imageUrl:
    'https://framerusercontent.com/images/j8XeUVuuUet3t66YfywFE18Mc.jpg',
  services: [
    'Brand identity design',
    'Framer development',
    'UI/UX strategy',
    'Creative campaigns',
  ],
};
const EN: IgnitexHeroContent = { ...VI };
export const ignitexHeroDef: BlockDef<IgnitexHeroContent> = {
  type: 'ignitex_hero',
  meta: {
    type: 'ignitex_hero',
    label: 'Hero - 3D Big Type',
    accent: '#111111',
    adminLabel: 'Hero - 3D Big Type',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Hero - 3D Big Type',
    aiLabelVi: 'chu Design Strategy khong lo tren anh 3D nen toi',
    aiLabelEn: 'giant Design Strategy type over a 3D image on dark',
  },
  component: IgnitexHero,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'location', label: 'Địa điểm', icon: MapPin, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Phụ đề', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'services', label: 'Dịch vụ', icon: ListChecks },
    { key: 'image', label: 'Ảnh nền', icon: ImageIcon, fieldType: 'image' },
  ],
};
