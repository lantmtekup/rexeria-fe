/** BlockDef `housent_testimonial` — quote cards. */
import { Quote, Sparkles, Type } from 'lucide-react';

import { HousentTestimonial } from '../../HousentTestimonial';
import type { HousentTestimonialContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentTestimonialContent = {
  eyebrow: 'Testimonials',
  title: 'The Verdict Of Excellence',
  items: [
    {
      quote:
        'They found us a home that ticked every box and closed weeks ahead of schedule.',
      name: 'Amelia R.',
      role: 'First-time buyer',
    },
    {
      quote:
        'The most transparent property experience I have ever had. No games, just results.',
      name: 'David K.',
      role: 'Investor',
    },
    {
      quote:
        'Sold above asking with zero stress. The advisory team was outstanding.',
      name: 'Sofia L.',
      role: 'Home seller',
    },
  ],
};
const EN: HousentTestimonialContent = { ...VI };

export const housentTestimonialDef: BlockDef<HousentTestimonialContent> = {
  type: 'housent_testimonial',
  meta: {
    type: 'housent_testimonial',
    label: 'Testimonial - Quote Cards',
    accent: '#e8622c',
    adminLabel: 'Testimonial - Quote Cards',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Testimonial - Quote Cards',
    aiLabelVi: 'lưới card đánh giá: trích dẫn + tên + vai trò',
    aiLabelEn: 'testimonial card grid: quote + name + role',
  },
  component: HousentTestimonial,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Đánh giá', icon: Quote },
  ],
};
