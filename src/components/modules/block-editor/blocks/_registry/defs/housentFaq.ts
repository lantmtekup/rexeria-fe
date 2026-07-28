/** BlockDef `housent_faq` — nền sáng, heading + CTA trái, accordion card phải. */
import {
  HelpCircle,
  MousePointerClick,
  Pilcrow,
  Sparkles,
  Type,
} from 'lucide-react';

import { HousentFaq } from '../../HousentFaq';
import type { HousentFaqContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentFaqContent = {
  eyebrow: 'FAQ - Quiry',
  title: 'Everything You Need To Know',
  subtitle: 'Still looking for answers or need a good chat?',
  ctaLabel: 'Book a Free Call',
  ctaAvatar:
    'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9a42ac4da0e95074ba_About%20Gallery%20%287%29.webp',
  items: [
    {
      question: 'How can I book an appointment online?',
      answer:
        'Pick any listing and hit "Book a viewing" — an advisor confirms within the hour.',
    },
    {
      question: 'Do you accept medical or dental insurance?',
      answer:
        'Yes. Every property is inspected and title-checked before it goes live.',
    },
    {
      question: 'What should I bring to my first visit?',
      answer:
        'We show the full cost breakdown up front — no surprises at closing.',
    },
    {
      question: 'Is there emergency care available after hours?',
      answer:
        'We partner with trusted lenders and guide you through pre-approval.',
    },
    {
      question: 'What payment options do you provide for treatments?',
      answer:
        'Absolutely — our sell-side team handles pricing, marketing and negotiation.',
    },
  ],
};
const EN: HousentFaqContent = { ...VI };

export const housentFaqDef: BlockDef<HousentFaqContent> = {
  type: 'housent_faq',
  meta: {
    type: 'housent_faq',
    label: 'FAQ - Accordion',
    accent: '#e8622c',
    adminLabel: 'FAQ - Accordion',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'FAQ - Accordion',
    aiLabelVi:
      'FAQ accordion nền sáng: heading + phụ đề + nút CTA (có avatar) bên trái, danh sách câu hỏi dạng card mở/đóng bên phải',
    aiLabelEn:
      'light FAQ accordion: heading + subtitle + CTA button (with avatar) on the left, expandable question cards on the right',
  },
  component: HousentFaq,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Phụ đề', icon: Pilcrow, fieldType: 'textarea' },
    {
      key: 'ctaLabel',
      label: 'Nút CTA',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    { key: 'items', label: 'Câu hỏi', icon: HelpCircle },
  ],
};
