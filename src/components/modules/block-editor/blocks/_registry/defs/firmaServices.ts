/** BlockDef `firma_services`. */
import { ListChecks, Type } from 'lucide-react';
import { FirmaServices } from '../../FirmaServices';
import type { FirmaServicesContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: FirmaServicesContent = {
  title: 'Our Services',
  count: '(3)',
  items: [
    {
      title: 'Brand Identity',
      description:
        'Naming, logo systems and visual language that make you unmistakable.',
    },
    {
      title: 'Web Design',
      description:
        'Editorial, fast, conversion-aware websites built with craft.',
    },
    {
      title: 'Art Direction',
      description:
        'Campaign concepts and creative direction across every touchpoint.',
    },
  ],
};
const EN: FirmaServicesContent = { ...VI };
export const firmaServicesDef: BlockDef<FirmaServicesContent> = {
  type: 'firma_services',
  meta: {
    type: 'firma_services',
    label: 'Services - Divided List',
    accent: '#8a7f6a',
    adminLabel: 'Services - Divided List',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Services - Divided List',
    aiLabelVi: 'list dich vu phan cach serif',
    aiLabelEn: 'divided service list serif',
  },
  component: FirmaServices,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Dịch vụ', icon: ListChecks },
  ],
};
