/** BlockDef `housent_faq` — accordion FAQ. */
import { HelpCircle, Sparkles, Type } from 'lucide-react';

import { HousentFaq } from '../../HousentFaq';
import type { HousentFaqContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentFaqContent = {
  eyebrow: 'FAQ',
  title: 'Everything You Need to Know',
  items: [
    {
      question: 'How do I book a viewing?',
      answer:
        'Pick any listing and hit "Book a viewing" — an advisor confirms within the hour.',
    },
    {
      question: 'Are the listings verified?',
      answer:
        'Yes. Every property is inspected and title-checked before it goes live.',
    },
    {
      question: 'What fees should I expect?',
      answer:
        'We show the full cost breakdown up front — no surprises at closing.',
    },
    {
      question: 'Do you help with financing?',
      answer:
        'We partner with trusted lenders and guide you through pre-approval.',
    },
    {
      question: 'Can you help me sell too?',
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
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'FAQ - Accordion',
    aiLabelVi:
      'FAQ accordion nền tối: heading trái + danh sách câu hỏi mở/đóng phải',
    aiLabelEn:
      'dark FAQ accordion: heading left + expandable question list right',
  },
  component: HousentFaq,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Câu hỏi', icon: HelpCircle },
  ],
};
