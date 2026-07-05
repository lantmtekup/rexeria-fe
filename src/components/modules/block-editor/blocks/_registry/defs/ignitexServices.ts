/** BlockDef `ignitex_services`. */
import { ListChecks, Type } from 'lucide-react';
import { IgnitexServices } from '../../IgnitexServices';
import type { IgnitexServicesContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: IgnitexServicesContent = {
  title: 'Solutions that drive results',
  items: [
    {
      title: 'Brand identity design',
      description:
        'Distinct visual systems that make you unmistakable across every touchpoint.',
    },
    {
      title: 'Framer development',
      description:
        'High-craft, fast, animated sites built and shipped in Framer.',
    },
    {
      title: 'UI/UX strategy',
      description: 'Research-led product and interface design that converts.',
    },
    {
      title: 'Creative campaigns',
      description:
        'Concepts and art direction that get your work seen and remembered.',
    },
  ],
};
const EN: IgnitexServicesContent = { ...VI };
export const ignitexServicesDef: BlockDef<IgnitexServicesContent> = {
  type: 'ignitex_services',
  meta: {
    type: 'ignitex_services',
    label: 'Services - Solutions List',
    accent: '#111111',
    adminLabel: 'Services - Solutions List',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Services - Solutions List',
    aiLabelVi: 'list dich vu danh so phan cach nen toi',
    aiLabelEn: 'numbered divided service list on dark',
  },
  component: IgnitexServices,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Dịch vụ', icon: ListChecks },
  ],
};
