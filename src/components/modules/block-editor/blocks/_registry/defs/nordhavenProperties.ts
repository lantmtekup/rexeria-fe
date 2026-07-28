/** BlockDef `nordhaven_properties`. */
import { LayoutGrid, Sparkles, Type } from 'lucide-react';
import { NordhavenProperties } from '../../NordhavenProperties';
import type { NordhavenPropertiesContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: NordhavenPropertiesContent = {
  eyebrow: 'Featured Projects',
  title: 'A curated selection of spaces reflecting our practice',
  items: [
    {
      imageUrl:
        'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9ac4ba3d0d8aaad504_About%20Gallery%20%284%29.webp',
      price: '$785,000',
      name: 'Coastal House',
      location: 'Skagen, Denmark',
    },
    {
      imageUrl:
        'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9a4fca8fc4ddbcf774_About%20Gallery%20%286%29.webp',
      price: '$1,240,000',
      name: 'Concrete Villa',
      location: 'Oslo, Norway',
    },
    {
      imageUrl:
        'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9a42ac4da0e95074ba_About%20Gallery%20%287%29.webp',
      price: '$960,000',
      name: 'Forest Retreat',
      location: 'Lapland, Finland',
    },
  ],
};
const EN: NordhavenPropertiesContent = { ...VI };
export const nordhavenPropertiesDef: BlockDef<NordhavenPropertiesContent> = {
  type: 'nordhaven_properties',
  meta: {
    type: 'nordhaven_properties',
    label: 'Properties - Dark Grid',
    accent: '#111111',
    adminLabel: 'Properties - Dark Grid',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Properties - Dark Grid',
    aiLabelVi: 'lưới card bất động sản nền tối (ảnh + giá + tên + địa điểm)',
    aiLabelEn: 'dark property grid (image + price + name + location)',
  },
  component: NordhavenProperties,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Dự án', icon: LayoutGrid },
  ],
};
