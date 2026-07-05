/** BlockDef `housent_solutions` — service cards. */
import { LayoutGrid, Pilcrow, Sparkles, Type } from 'lucide-react';

import { HousentSolutions } from '../../HousentSolutions';
import type { HousentSolutionsContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentSolutionsContent = {
  eyebrow: 'What We Do',
  title: 'Our Complete Property Solutions',
  subtitle:
    'We help you find the perfect home or sell your current one at the best price with zero hassle.',
  items: [
    {
      icon: '⌂',
      title: 'Buy a home',
      description:
        'Curated, verified listings matched to your budget and lifestyle.',
    },
    {
      icon: '⇅',
      title: 'Sell a property',
      description:
        'Data-driven pricing and marketing that closes at the best value.',
    },
    {
      icon: '⌘',
      title: 'Rent & manage',
      description:
        'Full-service leasing and management for owners and tenants.',
    },
    {
      icon: '✦',
      title: 'Invest',
      description:
        'Portfolio guidance backed by deep local market intelligence.',
    },
    {
      icon: '◎',
      title: 'Valuation',
      description: 'Accurate, transparent appraisals in minutes.',
    },
    {
      icon: '☎',
      title: 'Advisory',
      description:
        'One dedicated advisor from first viewing to final signature.',
    },
  ],
};
const EN: HousentSolutionsContent = { ...VI };

export const housentSolutionsDef: BlockDef<HousentSolutionsContent> = {
  type: 'housent_solutions',
  meta: {
    type: 'housent_solutions',
    label: 'Solutions - Service Cards',
    accent: '#e8622c',
    adminLabel: 'Solutions - Service Cards',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Solutions - Service Cards',
    aiLabelVi: 'lưới card dịch vụ: icon + tiêu đề + mô tả',
    aiLabelEn: 'service card grid: icon + title + description',
  },
  component: HousentSolutions,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Phụ đề', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'items', label: 'Dịch vụ', icon: LayoutGrid },
  ],
};
