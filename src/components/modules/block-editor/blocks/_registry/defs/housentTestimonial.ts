/** BlockDef `housent_testimonial` — heading + subtitle, hàng card quote scroll. */
import { Pilcrow, Quote, Sparkles, Type } from 'lucide-react';

import { HousentTestimonial } from '../../HousentTestimonial';
import type { HousentTestimonialContent } from '../../../types';
import type { BlockDef } from '../types';

const F = 'https://cdn.prod.website-files.com/69c8ec3d62ab7aba560d580f';
const VI: HousentTestimonialContent = {
  eyebrow: 'Market Reputation',
  title: 'The Verdict Of Excellence',
  subtitle:
    'How our commitment to structural transparency and data-driven valuation is redefining the investor experience',
  items: [
    {
      quote:
        'The level of structural transparency provided was refreshing. It made the acquisition of my second commercial asset seamless and data-driven.',
      name: 'Liam Grant',
      role: 'Real Estate Investor',
      avatar: `${F}/69ca9c5c4a1f7c8e1a2b3c4d_Testimonial%20Avatar%2001.webp`,
    },
    {
      quote:
        'The meticulous attention to detail during the integration phase was exceptional. It ensured our operational transition remained efficient and entirely stress-free.',
      name: 'Tom Crose',
      role: 'Property Investment Advisor',
      avatar: `${F}/69ca9c5c4a1f7c8e1a2b3c4e_Testimonial%20Avatar%2002.webp`,
    },
    {
      quote:
        'Their data-driven strategy allowed us to acquire with absolute confidence, delivering results well beyond our initial projections.',
      name: 'Ethan Cole',
      role: 'Portfolio Manager',
      avatar: `${F}/69ca9c5c4a1f7c8e1a2b3c4f_Testimonial%20Avatar%2003.webp`,
    },
  ],
};
const EN: HousentTestimonialContent = { ...VI };

export const housentTestimonialDef: BlockDef<HousentTestimonialContent> = {
  type: 'housent_testimonial',
  meta: {
    type: 'housent_testimonial',
    label: 'Testimonial - Quote Slider',
    accent: '#e8622c',
    adminLabel: 'Testimonial - Quote Slider',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Testimonial - Quote Slider',
    aiLabelVi:
      'heading + phụ đề, hàng ngang các card trích dẫn lớn (scroll ngang) với avatar + tên + vai trò, nút prev/next',
    aiLabelEn:
      'heading + subtitle, horizontal row of large quote cards (scroll) with avatar + name + role, prev/next buttons',
  },
  component: HousentTestimonial,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Phụ đề', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'items', label: 'Đánh giá', icon: Quote },
  ],
};
