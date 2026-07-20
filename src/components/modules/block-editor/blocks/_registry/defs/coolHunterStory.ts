/**
 * BlockDef cho `cool_hunter_story` — story Cool Hunter: hai đoạn văn + khung
 * ảnh scrub 4 beat (text/ảnh trượt rồi đổi chỗ). Port từ apps/cool-hunter
 * StorySection.tsx. Path A registry.
 */
import { Image as ImageIcon, Tag, TextCursorInput } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CoolHunterStoryContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: CoolHunterStoryContent = {
  text1:
    "There's a house on a peninsula in rural Alabama that watches the water from three sides. Its architect, Jeffrey Dungan, says he thought of it as a camera, a device for framing and cropping the world outside. Inside, designer Betsy Brown stripped everything back until only the essential remained. What they produced together is something rare: a family home that feels both deeply rooted in place and entirely its own.",
  text2:
    "Lake Wehapa isn't a name you'll find on many design world itineraries. That's part of the point. Dungan's Birmingham-based practice has long been drawn to the particular poetry of the American South, its craft traditions, its materials, its slow pace, and this project, a retreat conceived around the rhythms of rest, connection, and multi-generational gathering, distils that sensibility down to something almost elemental.",
  imageUrl: '/cool-hunter/section-2.png',
  imageAlt:
    'A calm living room with a fireplace, oak cabinetry and leaded windows',
  label: '01 - Welcome',
};

const EN: CoolHunterStoryContent = {
  ...VI,
};

export const coolHunterStoryDef: BlockDef<CoolHunterStoryContent> = {
  type: 'cool_hunter_story',
  meta: {
    type: 'cool_hunter_story',
    label: 'Cool Hunter · Story',
    accent: '#111111',
    adminLabel: 'Cool Hunter Story',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Cool Hunter Story',
    aiLabelVi:
      'story Cool Hunter: hai đoạn văn + khung ảnh scrub 4 beat (text/ảnh trượt rồi đổi chỗ)',
    aiLabelEn:
      'Cool Hunter story: two copy blocks + image frame 4-beat scrub (text and image swap positions)',
  },
  component: dynamic(() =>
    import('../../CoolHunterStory').then(m => m.CoolHunterStory)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'text1',
      label: 'Đoạn 1',
      icon: TextCursorInput,
      fieldType: 'textarea',
      groupId: 'copy',
      groupLabel: 'Nội dung',
    },
    {
      key: 'text2',
      label: 'Đoạn 2',
      icon: TextCursorInput,
      fieldType: 'textarea',
      groupId: 'copy',
    },
    {
      key: 'imageUrl',
      label: 'Ảnh story',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'media',
      groupLabel: 'Ảnh',
    },
    {
      key: 'label',
      label: 'Nhãn dọc',
      icon: Tag,
      fieldType: 'text',
    },
  ],
};
