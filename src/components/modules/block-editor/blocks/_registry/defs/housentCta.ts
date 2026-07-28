/** BlockDef `housent_cta` — băng CTA cam. */
import { MousePointerClick, Pilcrow, Type } from 'lucide-react';

import { HousentCta } from '../../HousentCta';
import type { HousentCtaContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentCtaContent = {
  title: 'Let’s Find Your Elite Residence!',
  subtitle:
    'Connect with our advisors and step into a home that matches your ambition.',
  buttonLabel: 'Book a Consultation',
  buttonUrl: '#',
  imageUrl:
    'https://cdn.prod.website-files.com/69c8ec3d62ab7aba560d580f/69c9108b1fcc04bd7a40744b_3f75fad6acae920f99115d66b0f868ec_Hero%20Image.webp',
};
const EN: HousentCtaContent = { ...VI };

export const housentCtaDef: BlockDef<HousentCtaContent> = {
  type: 'housent_cta',
  meta: {
    type: 'housent_cta',
    label: 'CTA - Orange Banner',
    accent: '#e8622c',
    adminLabel: 'CTA - Orange Banner',
    gradient: 'from-orange-400 to-orange-600',
    defaultName: 'CTA - Orange Banner',
    aiLabelVi: 'băng CTA cam bo góc lớn: tiêu đề trắng + nút hành động',
    aiLabelEn: 'large rounded orange CTA banner: white heading + action button',
  },
  component: HousentCta,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Phụ đề', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'button', label: 'Nút', icon: MousePointerClick, fieldType: 'text' },
  ],
};
