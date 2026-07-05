/** BlockDef `nordhaven_testimonials`. */
import { Quote, Sparkles, Type } from 'lucide-react';
import { NordhavenTestimonials } from '../../NordhavenTestimonials';
import type { NordhavenTestimonialsContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: NordhavenTestimonialsContent = {
  eyebrow: 'Testimonials',
  title: 'Words from our clients',
  items: [
    {
      quote:
        'Nordhaven understood exactly the kind of calm we wanted to live in. The result is quietly perfect.',
      name: 'Ingrid H.',
      role: 'Private client',
    },
    {
      quote:
        'Rigorous, restrained and deeply thoughtful. They elevated the whole development.',
      name: 'Marcus B.',
      role: 'Developer',
    },
    {
      quote:
        'Every detail considered. The house feels inevitable, as if it always belonged there.',
      name: 'Elin S.',
      role: 'Homeowner',
    },
  ],
};
const EN: NordhavenTestimonialsContent = { ...VI };
export const nordhavenTestimonialsDef: BlockDef<NordhavenTestimonialsContent> =
  {
    type: 'nordhaven_testimonials',
    meta: {
      type: 'nordhaven_testimonials',
      label: 'Testimonials - Dark Cards',
      accent: '#111111',
      adminLabel: 'Testimonials - Dark Cards',
      gradient: 'from-neutral-800 to-neutral-950',
      defaultName: 'Testimonials - Dark Cards',
      aiLabelVi: 'lưới card đánh giá nền tối viền mảnh',
      aiLabelEn: 'dark testimonial card grid with thin borders',
    },
    component: NordhavenTestimonials,
    defaultContent: { vi: VI, en: EN },
    elements: [
      { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
      { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
      { key: 'items', label: 'Đánh giá', icon: Quote },
    ],
  };
