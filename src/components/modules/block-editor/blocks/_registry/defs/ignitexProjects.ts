/** BlockDef `ignitex_projects`. */
import { Image as ImageIcon, Type } from 'lucide-react';

import { IgnitexProjects } from '../../IgnitexProjects';
import type { IgnitexProjectsContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: IgnitexProjectsContent = {
  title: 'Selected Projects',
  count: '(07)',
  items: [
    {
      imageUrl:
        'https://framerusercontent.com/images/UY6B0qS4hdcjlEgPYtxTooD5yA.jpg',
      name: 'Halcyon Labs',
      tag: 'Branding',
    },
    {
      imageUrl:
        'https://framerusercontent.com/images/N65gWirdjRlG0xZD49X5I5MISJY.jpg',
      name: 'Vertex Finance',
      tag: 'Web Design',
    },
    {
      imageUrl:
        'https://framerusercontent.com/images/f2NvgNRlcuKjsRHuUQLb4qV1f40.jpg',
      name: 'Nova Health',
      tag: 'UI/UX',
    },
    {
      imageUrl:
        'https://framerusercontent.com/images/j8XeUVuuUet3t66YfywFE18Mc.jpg',
      name: 'Atlas Ventures',
      tag: 'Campaign',
    },
  ],
};

const EN: IgnitexProjectsContent = { ...VI };

const projectElements = (
  index: number,
  groupId: string,
  groupLabel: string
) => [
  {
    key: `items[${index}].imageUrl`,
    label: 'Ảnh',
    groupId,
    groupLabel,
    icon: ImageIcon,
    fieldType: 'image' as const,
  },
  {
    key: `items[${index}].name`,
    label: 'Tên',
    groupId,
    icon: Type,
    fieldType: 'text' as const,
  },
  {
    key: `items[${index}].tag`,
    label: 'Tag',
    groupId,
    icon: Type,
    fieldType: 'text' as const,
  },
];

export const ignitexProjectsDef: BlockDef<IgnitexProjectsContent> = {
  type: 'ignitex_projects',
  meta: {
    type: 'ignitex_projects',
    label: 'Projects - Dark Grid',
    accent: '#111111',
    adminLabel: 'Projects - Dark Grid',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Projects - Dark Grid',
    aiLabelVi: 'luoi project nen toi (anh + ten + tag)',
    aiLabelEn: 'dark project grid (image + name + tag)',
  },
  component: IgnitexProjects,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'title',
      label: 'Tiêu đề',
      groupId: 'header',
      groupLabel: 'Header',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'count',
      label: 'Số lượng',
      groupId: 'header',
      icon: Type,
      fieldType: 'text',
    },
    ...projectElements(0, 'project1', 'Project 1'),
    ...projectElements(1, 'project2', 'Project 2'),
    ...projectElements(2, 'project3', 'Project 3'),
    ...projectElements(3, 'project4', 'Project 4'),
  ],
};
