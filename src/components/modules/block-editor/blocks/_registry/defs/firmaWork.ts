/** BlockDef `firma_work`. */
import { LayoutGrid, Type } from 'lucide-react';
import { FirmaWork } from '../../FirmaWork';
import type { FirmaWorkContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: FirmaWorkContent = {
  title: 'Our Projects',
  count: '(8)',
  items: [
    {
      imageUrl:
        'https://framerusercontent.com/images/PfiGU0hjTzAbR0PsKPK9FkdXHzc.jpg',
      name: 'Common Future Co.',
      category: 'Branding',
    },
    {
      imageUrl:
        'https://framerusercontent.com/images/n4sFqqtcyXavdexSkTFwp9738RY.jpg',
      name: 'Lumen Path Studio',
      category: 'Web Design',
    },
    {
      imageUrl:
        'https://framerusercontent.com/images/BkkVzOFJAS98wSUHUTfcNbntzCU.jpg',
      name: 'Paper Bloom Collective',
      category: 'Identity',
    },
    {
      imageUrl:
        'https://framerusercontent.com/images/B4jxrHJqCYeKMdfyNVrqx2Gp4.jpg',
      name: 'Northwind Atelier',
      category: 'Art Direction',
    },
  ],
};
const EN: FirmaWorkContent = { ...VI };
export const firmaWorkDef: BlockDef<FirmaWorkContent> = {
  type: 'firma_work',
  meta: {
    type: 'firma_work',
    label: 'Work - Project Grid',
    accent: '#8a7f6a',
    adminLabel: 'Work - Project Grid',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Work - Project Grid',
    aiLabelVi: 'luoi project (anh + ten + category)',
    aiLabelEn: 'project grid (image + name + category)',
  },
  component: FirmaWork,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Project', icon: LayoutGrid },
  ],
};
