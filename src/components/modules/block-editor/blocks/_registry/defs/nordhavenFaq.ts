/** BlockDef `nordhaven_faq`. */
import { HelpCircle, Sparkles, Type } from 'lucide-react';
import { NordhavenFaq } from '../../NordhavenFaq';
import type { NordhavenFaqContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: NordhavenFaqContent = {
  eyebrow: 'FAQ',
  title: 'Discover answers to common questions',
  items: [
    {
      question: 'What types of projects do you take on?',
      answer:
        'Residential, cultural and select commercial projects where design ambition is shared.',
    },
    {
      question: 'Do you work internationally?',
      answer:
        'Yes — we work across the Nordics and beyond with trusted local partners.',
    },
    {
      question: 'How does your process begin?',
      answer:
        'Every project starts with a conversation about site, brief and how you want to live.',
    },
    {
      question: 'Do you handle interiors too?',
      answer:
        'We offer full interior design as an integrated part of the architecture.',
    },
  ],
};
const EN: NordhavenFaqContent = { ...VI };
export const nordhavenFaqDef: BlockDef<NordhavenFaqContent> = {
  type: 'nordhaven_faq',
  meta: {
    type: 'nordhaven_faq',
    label: 'FAQ - Dark Accordion',
    accent: '#111111',
    adminLabel: 'FAQ - Dark Accordion',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'FAQ - Dark Accordion',
    aiLabelVi: 'accordion FAQ nền tối 2 cột',
    aiLabelEn: 'dark two-column FAQ accordion',
  },
  component: NordhavenFaq,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Câu hỏi', icon: HelpCircle },
  ],
};
