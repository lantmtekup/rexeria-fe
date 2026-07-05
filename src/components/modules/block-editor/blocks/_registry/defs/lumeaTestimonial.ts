/** BlockDef `lumea_testimonial`. */
import { Quote, Type, User } from 'lucide-react';
import { LumeaTestimonial } from '../../LumeaTestimonial';
import type { LumeaTestimonialContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: LumeaTestimonialContent = {
  quote:
    'Living at Lumea has redefined city life for our family. It is calm, considered and quietly extraordinary.',
  name: 'Jane Doe',
  role: 'Resident, Floor 62',
};
const EN: LumeaTestimonialContent = { ...VI };
export const lumeaTestimonialDef: BlockDef<LumeaTestimonialContent> = {
  type: 'lumea_testimonial',
  meta: {
    type: 'lumea_testimonial',
    label: 'Testimonial - Serif Quote',
    accent: '#a68a5b',
    adminLabel: 'Testimonial - Serif Quote',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Testimonial - Serif Quote',
    aiLabelVi: 'trích dẫn serif lớn căn giữa + tên + vai trò',
    aiLabelEn: 'large centered serif quote + name + role',
  },
  component: LumeaTestimonial,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'quote', label: 'Trích dẫn', icon: Quote, fieldType: 'textarea' },
    { key: 'name', label: 'Tên', icon: User, fieldType: 'text' },
    { key: 'role', label: 'Vai trò', icon: Type, fieldType: 'text' },
  ],
};
