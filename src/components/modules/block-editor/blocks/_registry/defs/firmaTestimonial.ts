/** BlockDef `firma_testimonial`. */
import { Quote, Users } from 'lucide-react';
import { FirmaTestimonial } from '../../FirmaTestimonial';
import type { FirmaTestimonialContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: FirmaTestimonialContent = {
  quote:
    "Good design is never just decoration — it's how people understand, remember, and trust your brand. At Firma, we make sure every detail tells the right story.",
  authors: ['Tomas Reed', 'Nina Moretti', 'Alma Castellano'],
};
const EN: FirmaTestimonialContent = { ...VI };
export const firmaTestimonialDef: BlockDef<FirmaTestimonialContent> = {
  type: 'firma_testimonial',
  meta: {
    type: 'firma_testimonial',
    label: 'Testimonial - Dark Serif',
    accent: '#8a7f6a',
    adminLabel: 'Testimonial - Dark Serif',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Testimonial - Dark Serif',
    aiLabelVi: 'trich dan serif lon nen toi + hang ten tac gia',
    aiLabelEn: 'large serif quote on dark + author row',
  },
  component: FirmaTestimonial,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'quote', label: 'Trích dẫn', icon: Quote, fieldType: 'textarea' },
    { key: 'authors', label: 'Tác giả', icon: Users },
  ],
};
