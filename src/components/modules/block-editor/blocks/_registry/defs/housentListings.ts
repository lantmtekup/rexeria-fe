/** BlockDef `housent_listings` — lưới card bất động sản có filter + badge. */
import { LayoutGrid, ListFilter, Sparkles, Type } from 'lucide-react';

import { HousentListings } from '../../HousentListings';
import type { HousentListingsContent } from '../../../types';
import type { BlockDef } from '../types';

const F = 'https://cdn.prod.website-files.com/69c8ec3d62ab7aba560d580f';
const VI: HousentListingsContent = {
  eyebrow: 'Featured Assets',
  title: 'Explore Our Signature Listings',
  filters: ['All', 'For Sell', 'For Rent'],
  items: [
    {
      imageUrl: `${F}/69ca0307f1ac92b4ecaaefcb_HighLight%20Card%20Image%2001.webp`,
      status: 'For Sell',
      price: '$10,900,000',
      name: 'The Oceancrest Villa',
      address: '1918 Santiago Drive, Scottsdale, AZ',
      beds: '3 Bed',
      baths: '4 Bathroom',
      area: '2,458 Square Fit',
    },
    {
      imageUrl: `${F}/69ca0307f4ce3589f45a7e1e_HighLight%20Card%20Image%2002.webp`,
      status: 'For Rent',
      price: '$8,450,000',
      name: 'Maplewood Estate',
      address: '1918 Santiago Drive, Scottsdale, AZ',
      beds: '3 Bed',
      baths: '4 Bathroom',
      area: '2,458 Square Fit',
    },
    {
      imageUrl: `${F}/69ca030744518a567ffa5f8a_HighLight%20Card%20Image%2003.webp`,
      status: 'For Rent',
      price: '$6,900,000',
      name: 'The Harborline Loft',
      address: '1918 Santiago Drive, Scottsdale, AZ',
      beds: '3 Bed',
      baths: '4 Bathroom',
      area: '2,458 Square Fit',
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
      'lưới card bất động sản có filter tabs: mỗi card có badge trạng thái, giá, chips bed/bath/diện tích + nút Details, tên + địa chỉ',
    aiLabelEn:
      'property listing grid with filter tabs: each card has status badge, price, bed/bath/area chips + Details button, name + address',
  },
  component: HousentListings,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'filters', label: 'Bộ lọc', icon: ListFilter },
    { key: 'items', label: 'Danh sách', icon: LayoutGrid },
  ],
};
