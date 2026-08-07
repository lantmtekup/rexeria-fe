/**
 * BlockDef cho `cg_responsive_team` — team carousel clip-path + marquee name.
 * Port từ CodeGrid cg-responsive-team-page (discord 107).
 * Bỏ nav góc trên ("Vertex Studio" / "Showreel").
 *
 * `members[]` động — thêm/xoá qua Layers「Thêm / quản lý thành viên」.
 */
import { Briefcase, Image as ImageIcon, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  CgResponsiveTeamContent,
  CgResponsiveTeamMember,
} from '../../../types';
import type { BlockDef } from '../types';

const BG_CYCLE = ['#ffffff', '#c4bca9', '#ffffff', '#8e908a'] as const;

export const CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS: CgResponsiveTeamMember[] = [
  {
    name: 'Ava Sinclair',
    role: 'Creative Director',
    imageUrl: '/cg-responsive-team/team-1.jpg',
    imageAlt: 'Ava Sinclair',
    bgColor: BG_CYCLE[0],
  },
  {
    name: 'Liam Archer',
    role: 'Brand Strategist',
    imageUrl: '/cg-responsive-team/team-2.jpg',
    imageAlt: 'Liam Archer',
    bgColor: BG_CYCLE[1],
  },
  {
    name: 'Zoe Clementine',
    role: 'Lead Designer',
    imageUrl: '/cg-responsive-team/team-3.jpg',
    imageAlt: 'Zoe Clementine',
    bgColor: BG_CYCLE[2],
  },
  {
    name: 'Ethan Hawthorne',
    role: 'Chief Innovation Officer',
    imageUrl: '/cg-responsive-team/team-4.jpg',
    imageAlt: 'Ethan Hawthorne',
    bgColor: BG_CYCLE[3],
  },
];

const VI: CgResponsiveTeamContent = {
  members: CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS,
};

const EN: CgResponsiveTeamContent = {
  members: [...CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS],
};

/** Resolve members[] — fallback default khi thiếu / rỗng. */
export const resolveCgResponsiveTeamMembers = (
  content: CgResponsiveTeamContent | null | undefined
): CgResponsiveTeamMember[] => {
  const raw = content?.members;
  if (!Array.isArray(raw) || raw.length === 0) {
    return CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS.map(m => ({ ...m }));
  }
  return raw.filter(it => it && typeof it === 'object');
};

export const cgResponsiveTeamMemberElements = (
  members: CgResponsiveTeamMember[]
): LayerElement[] => {
  const list =
    members.length > 0 ? members : CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS;
  return list.flatMap((member, i) => {
    const groupId = `member${i}`;
    const groupLabel =
      (member.name ?? '').trim().slice(0, 40) || `Thành viên ${i + 1}`;
    return [
      {
        key: `members[${i}].name`,
        label: 'Tên',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `members[${i}].role`,
        label: 'Vai trò',
        groupId,
        icon: Briefcase,
        fieldType: 'text' as const,
      },
      {
        key: `members[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
    ];
  });
};

export const cgResponsiveTeamDef: BlockDef<CgResponsiveTeamContent> = {
  type: 'cg_responsive_team',
  meta: {
    type: 'cg_responsive_team',
    category: 'interactive',
    style: 'modern',
    tags: ['team', 'slider', 'carousel', 'marquee', 'animation', 'codegrid'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-07',
    label: 'Responsive Team',
    accent: '#c4bca9',
    adminLabel: 'Responsive Team',
    gradient: 'from-stone-300 to-stone-500',
    defaultName: 'Responsive Team',
    aiLabelVi:
      'team carousel: ảnh + tên marquee clip-path, click trái/phải để chuyển thành viên',
    aiLabelEn:
      'team carousel: portrait + marquee name clip-path, click left/right to change member',
  },
  component: dynamic(() =>
    import('../../CgResponsiveTeam').then(m => m.CgResponsiveTeam)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...cgResponsiveTeamMemberElements(CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS),
    {
      key: 'members',
      label: 'Thêm / quản lý thành viên',
      icon: ListChecks,
    },
  ],
};
