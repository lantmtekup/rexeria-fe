/** BlockDef `nordhaven_services`. */
import { ListChecks, Sparkles, Type } from 'lucide-react';
import { NordhavenServices } from '../../NordhavenServices';
import type { NordhavenServicesContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: NordhavenServicesContent = {
  eyebrow: 'Services',
  title: 'What we do',
  items: [
    {
      title: 'Architecture',
      description:
        'Full-scope design from concept to construction documentation.',
    },
    {
      title: 'Interior Design',
      description: 'Considered interiors where every material earns its place.',
    },
    {
      title: 'Master Planning',
      description: 'Urban and site strategies that balance density and calm.',
    },
    {
      title: 'Consultation',
      description:
        'Advisory and feasibility for developers and private clients.',
    },
  ],
};
const EN: NordhavenServicesContent = { ...VI };
export const nordhavenServicesDef: BlockDef<NordhavenServicesContent> = {
  type: 'nordhaven_services',
  meta: {
    type: 'nordhaven_services',
    label: 'Services - Divided List',
    accent: '#111111',
    adminLabel: 'Services - Divided List',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Services - Divided List',
    aiLabelVi: 'list dịch vụ hàng ngang phân cách (số + tiêu đề + mô tả)',
    aiLabelEn: 'divided service list (index + title + description)',
  },
  component: NordhavenServices,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Dịch vụ', icon: ListChecks },
  ],
};
