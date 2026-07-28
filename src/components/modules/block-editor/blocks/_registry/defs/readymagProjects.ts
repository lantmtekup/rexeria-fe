/** BlockDef `readymag_projects`. */
import { LayoutGrid } from 'lucide-react';
import { ReadymagProjects } from '../../ReadymagProjects';
import type { ReadymagProjectsContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: ReadymagProjectsContent = {
  items: [
    {
      no: 'No. 001',
      name: 'ALEXIS',
      role: 'Motion / Graphic Design',
      imageUrl:
        'https://c-p.rmcdn.net/662fd12ce27f9b00214eb2d1/5965465/Image-b973cb41-8943-4830-8ec9-d0fcdc841704.gif',
    },
    {
      no: 'No. 002',
      name: 'THOMASO',
      role: 'Motion / Graphic Design',
      imageUrl:
        'https://c-p.rmcdn.net/662fd12ce27f9b00214eb2d1/5965465/Image-3105a506-946a-4df2-af75-7184273a29b4.gif',
    },
    {
      no: 'No. 003',
      name: 'ALEXIS',
      role: 'Motion / Graphic Design',
      imageUrl:
        'https://c-p.rmcdn.net/662fd12ce27f9b00214eb2d1/5965465/Image-d69f7957-f19f-4899-a2a4-1bdb1c1d713d.gif',
    },
    {
      no: 'No. 004',
      name: 'THOMASO',
      role: 'Motion / Graphic Design',
      imageUrl:
        'https://c-p.rmcdn.net/662fd12ce27f9b00214eb2d1/5965465/Image-fa87c9a3-b697-43dd-b4eb-f5463d077780.gif',
    },
  ],
};
const EN: ReadymagProjectsContent = { ...VI };
export const readymagProjectsDef: BlockDef<ReadymagProjectsContent> = {
  type: 'readymag_projects',
  meta: {
    type: 'readymag_projects',
    label: 'Projects - Brutalist Grid',
    accent: '#000000',
    adminLabel: 'Projects - Brutalist Grid',
    gradient: 'from-neutral-100 to-neutral-300',
    defaultName: 'Projects - Brutalist Grid',
    aiLabelVi: 'luoi brutalist card danh so + card anh oval',
    aiLabelEn: 'brutalist numbered cards + oval image cards',
  },
  component: ReadymagProjects,
  defaultContent: { vi: VI, en: EN },
  elements: [{ key: 'items', label: 'Project', icon: LayoutGrid }],
};
