import type { LegacyBlockSchema } from '../types';

/** Framer team directory — 2-col list (name + role) with dividers and stagger reveal. */
export const framerTeamDirectorySchema: LegacyBlockSchema = {
  id: 'framer.team.directory.v1',
  name: 'Framer Team Directory',
  category: 'Feature',
  description:
    'Danh sách thành viên dạng 2 cột (tên + vai trò), divider giữa các dòng.',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      default: 'OUR TEAM',
      maxLength: 60,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      default: 'Studio',
      required: true,
      maxLength: 120,
    },
    {
      name: 'members',
      type: 'array',
      label: 'Thành viên',
      minItems: 1,
      maxItems: 12,
      defaultItem: { avatar: null, name: 'Tên thành viên', role: 'Vai trò' },
      itemLabel: 'thành viên',
      itemSchema: [
        {
          name: 'avatar',
          type: 'image',
          label: 'Ảnh đại diện (tùy chọn)',
          aspectRatio: '1:1',
        },
        {
          name: 'name',
          type: 'text',
          label: 'Tên',
          required: true,
          maxLength: 80,
        },
        {
          name: 'role',
          type: 'text',
          label: 'Vai trò',
          required: true,
          maxLength: 80,
        },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'OUR TEAM',
      title: 'Studio',
      members: [
        {
          avatar: null,
          name: 'Elias Norwood',
          role: 'Founder & Creative Director',
        },
        {
          avatar: null,
          name: 'Vivian Kershaw',
          role: 'Lead Interior Architect',
        },
        {
          avatar: null,
          name: 'Matteo Renshaw',
          role: 'Head of Spatial Design',
        },
        { avatar: null, name: 'Elara Mendez', role: 'Interior Stylist' },
        { avatar: null, name: 'Cassian Dreyer', role: 'Lighting Designer' },
        {
          avatar: null,
          name: 'Noa Selkirk',
          role: '3D Visualization Specialist',
        },
      ],
    },
  },
};
