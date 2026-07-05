/** BlockDef `housent_listings` — lưới card bất động sản. */
import { LayoutGrid, Sparkles, Type } from 'lucide-react';

import { HousentListings } from '../../HousentListings';
import type { HousentListingsContent } from '../../../types';
import type { BlockDef } from '../types';

const F = 'https://cdn.prod.website-files.com/69c8ec3d62ab7aba560d580f';
const VI: HousentListingsContent = {
  eyebrow: 'Featured Properties',
  title: 'Explore Our Signature Listings',
  items: [
    {
      imageUrl: `${F}/69ca0307f1ac92b4ecaaefcb_HighLight%20Card%20Image%2001.webp`,
      price: '$2,450,000',
      name: 'Skyline Penthouse',
      address: '111 West 57th Street, Manhattan',
      specs: '4 Beds · 3 Baths · 3,200 sqft',
    },
    {
      imageUrl: `${F}/69ca0307f4ce3589f45a7e1e_HighLight%20Card%20Image%2002.webp`,
      price: '$1,180,000',
      name: 'Riverside Residence',
      address: 'Brooklyn Heights, New York',
      specs: '3 Beds · 2 Baths · 1,950 sqft',
    },
    {
      imageUrl: `${F}/69ca030744518a567ffa5f8a_HighLight%20Card%20Image%2003.webp`,
      price: '$3,900,000',
      name: 'The Crown Loft',
      address: 'Tribeca, New York',
      specs: '5 Beds · 4 Baths · 4,100 sqft',
    },
  ],
};
const EN: HousentListingsContent = { ...VI };

export const housentListingsDef: BlockDef<HousentListingsContent> = {
  type: 'housent_listings',
  meta: {
    type: 'housent_listings',
    label: 'Listings - Property Grid',
    accent: '#e8622c',
    adminLabel: 'Listings - Property Grid',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Listings - Property Grid',
    aiLabelVi:
      'lưới card bất động sản: ảnh + giá + tên + địa chỉ + thông số bed/bath/diện tích',
    aiLabelEn:
      'property listing grid: image + price + name + address + bed/bath/area specs',
  },
  component: HousentListings,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Danh sách', icon: LayoutGrid },
  ],
};
