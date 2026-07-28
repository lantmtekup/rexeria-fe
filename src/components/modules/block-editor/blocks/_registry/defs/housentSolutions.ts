/** BlockDef `housent_solutions` — 2-cột: heading trái + list mục có checklist. */
import { LayoutList, Pilcrow, Sparkles, Type } from 'lucide-react';

import { HousentSolutions } from '../../HousentSolutions';
import type { HousentSolutionsContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentSolutionsContent = {
  eyebrow: 'What We Do',
  title: 'Our Complete Property Solutions',
  subtitle:
    'From strategy recognition to long-term rental management, we provide a full spectrum of real-estate services to manage and grow your real-estate assets.',
  items: [
    {
      title: 'Buy & Sell Properties',
      description:
        'We help you find the perfect home or sell your current one at the best price with zero hassle.',
      features: [
        'Verified listings',
        'Market analysis',
        'Legal team',
        'Paperwork support',
      ],
    },
    {
      title: 'Rental Management',
      description:
        'A marketing-grade network that secures the best tenants and protects your rental income.',
      features: [
        'Tenant placement',
        'Legal agreement',
        'Walk-in inspection',
        'Market rent optimization',
      ],
      image:
        'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9a42ac4da0e95074ba_About%20Gallery%20%287%29.webp',
    },
    {
      title: 'Property Management',
      description:
        'Taking care of your property so you can enjoy a stress-free ownership experience.',
      features: [
        'Tenant screening',
        'Facility maintenance',
        'Portfolio growth',
        'Risk management',
      ],
    },
    {
      title: 'Investment Consulting',
      description:
        'Portfolio-driven advice to help you make bold, informed decisions in every market cycle.',
      features: [
        'ROI analysis',
        'Future trends',
        'Portfolio growth',
        'Paperwork support',
      ],
    },
  ],
};
const EN: HousentSolutionsContent = { ...VI };

export const housentSolutionsDef: BlockDef<HousentSolutionsContent> = {
  type: 'housent_solutions',
  meta: {
    type: 'housent_solutions',
    label: 'Solutions - Split List',
    accent: '#e8622c',
    adminLabel: 'Solutions - Split List',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Solutions - Split List',
    aiLabelVi:
      'bố cục 2 cột: tiêu đề lớn bên trái, danh sách dịch vụ bên phải (mỗi mục có tiêu đề + mô tả + checklist tính năng), xen 1 ảnh',
    aiLabelEn:
      'two-column layout: big heading on the left, vertical service list on the right (each item has title + description + feature checklist), with one inline image',
  },
  component: HousentSolutions,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Phụ đề', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'items', label: 'Dịch vụ', icon: LayoutList },
  ],
};
