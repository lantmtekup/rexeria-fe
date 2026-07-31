import { HelpCircle, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CiteFlowFaqContent, CiteFlowFaqItem } from '../../../types';
import type { LayerElement } from '../../../LayersPanel';
import type { BlockDef } from '../types';

const DEFAULT_ITEMS: CiteFlowFaqItem[] = [
  {
    question: 'What makes Ecopark Onsen different?',
    answer:
      "Ecopark Onsen is Vietnam's first onsen-integrated residencial complex, inspired by traditional Japanese hot-spring culture and designed in harmony with Ecopark's lush, green ecosystem.",
  },
  {
    question: 'Are the onsen pools natrual hot springs or articially heated?',
    answer:
      'While the mineral content and water quality are scientifically engieered to replicate authentic Japanese onsen minerals, the pools are artificially temperatur-controlled to ensure consistent wellness.',
  },
  {
    question: 'Is the onsen experience private or shared?',
    answer:
      'Residents can enjoy both private and communal onsen experiences:\nPrivate Onsen Suites: Select residences feature exclusive indoor soaking tubs directly connected to your living space, offering complete privacy and tranquility.\nPublic Wellness Pavilion: A beautifully designed onsen zone with 13 soaking pools, each offering unique therapeutic properties (e.g., relaxation, skin rejuvenation, muscle recovery).',
  },
  {
    question: 'Who can use the Onsen and Wellness facilities?',
    answer:
      'The onsen and wellness facilities are exclusively available to Ecopark Onsen residents adn their guests; full access to the saunas, mediation rooms, and spa lounges.',
  },
];

const CONTENT: CiteFlowFaqContent = {
  heading: 'Have some questions?',
  ctaText: 'Ask a question',
  ctaLink: '#',
  items: DEFAULT_ITEMS,
};

export const citeFlowFaqElements = (
  items: CiteFlowFaqItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : DEFAULT_ITEMS;
  return list.flatMap((item, i) => {
    const groupId = `faq${i}`;
    const groupLabel = item.question?.trim() || `FAQ ${i + 1}`;
    return [
      {
        key: `items[${i}].question`,
        label: 'Câu hỏi',
        groupId,
        groupLabel,
        icon: HelpCircle,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].answer`,
        label: 'Trả lời',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
    ];
  });
};

export const citeFlowFaqDef: BlockDef<CiteFlowFaqContent> = {
  type: 'cite_flow_faq',
  meta: {
    type: 'cite_flow_faq',
    label: 'Cite Flow FAQ',
    accent: '#3f6b4f',
    adminLabel: 'Cite Flow FAQ',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Cite Flow FAQ',
    aiLabelVi:
      'FAQ accordion: heading + CTA bên trái, danh sách câu hỏi/trả lời mở-đóng bên phải',
    aiLabelEn:
      'FAQ accordion: heading + CTA on the left, click-to-expand question/answer list on the right',
  },
  component: dynamic(() =>
    import('../../CiteFlowFaq').then(m => m.CiteFlowFaq)
  ),
  defaultContent: { vi: CONTENT, en: CONTENT },
  elements: [
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'ctaText', label: 'CTA — Nhãn', icon: Type, fieldType: 'text' },
    { key: 'ctaLink', label: 'CTA — Link', icon: Type, fieldType: 'link' },
    ...citeFlowFaqElements(DEFAULT_ITEMS),
    {
      key: 'items',
      label: 'Thêm / quản lý FAQ',
      icon: HelpCircle,
    },
  ],
};
