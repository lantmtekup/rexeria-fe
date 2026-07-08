/** BlockDef `housent_blogs` — blog post grid. */
import { AlignLeft, Newspaper, Sparkles, Type } from 'lucide-react';

import { HousentBlogs } from '../../HousentBlogs';
import type { HousentBlogsContent } from '../../../types';
import type { BlockDef } from '../types';

const F = 'https://cdn.prod.website-files.com/69c8ec3d62ab7aba560d580f';
const VI: HousentBlogsContent = {
  eyebrow: 'The Journal',
  title: 'Deep structural intelligence',
  subtitle:
    'Field notes on the market, the buying process, and the small decisions that add up.',
  items: [
    {
      imageUrl: `${F}/69ca0307f1ac92b4ecaaefcb_HighLight%20Card%20Image%2001.webp`,
      category: 'Market',
      title: 'What rising rates mean for buyers in 2026',
      date: 'Jan 12, 2026',
    },
    {
      imageUrl: `${F}/69ca0307f4ce3589f45a7e1e_HighLight%20Card%20Image%2002.webp`,
      category: 'Guide',
      title: "A first-timer's checklist before you sign",
      date: 'Feb 03, 2026',
    },
    {
      imageUrl: `${F}/69ca030744518a567ffa5f8a_HighLight%20Card%20Image%2003.webp`,
      category: 'Design',
      title: 'Renovations that actually add value',
      date: 'Feb 28, 2026',
    },
  ],
};
const EN: HousentBlogsContent = { ...VI };

export const housentBlogsDef: BlockDef<HousentBlogsContent> = {
  type: 'housent_blogs',
  meta: {
    type: 'housent_blogs',
    label: 'Blogs - Post Grid',
    accent: '#e8622c',
    adminLabel: 'Blogs - Post Grid',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Blogs - Post Grid',
    aiLabelVi: 'lưới bài viết: ảnh + category + tiêu đề + ngày',
    aiLabelEn: 'blog post grid: image + category + title + date',
  },
  component: HousentBlogs,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Mô tả', icon: AlignLeft, fieldType: 'text' },
    { key: 'items', label: 'Bài viết', icon: Newspaper },
  ],
};
