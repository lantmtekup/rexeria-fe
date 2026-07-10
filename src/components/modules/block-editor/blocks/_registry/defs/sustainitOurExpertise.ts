/**
 * BlockDef cho `sustainit_our_expertise` — nguồn sự thật duy nhất.
 *
 * Nguồn: Readymag sustainit.space (block "Our Expertise"). Geist Mono,
 * ink #282828 + accent xanh #B6FF3D. 4 expertise item trong grid 2×2
 * (cell vuông @4xl desktop). Mặc định dùng ảnh CDN gốc của source.
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import { SustainitOurExpertise } from '../../SustainitOurExpertise';
import type { SustainitOurExpertiseContent } from '../../../types';
import type { BlockDef } from '../types';

const TOP_LEFT =
  'https://i-p.rmcdn.net/696f62d64575af21c4116928/6138196/image-bb559446-e2c7-4880-8089-ec1a8a62f541.png';
const TOP_RIGHT =
  'https://i-p.rmcdn.net/696f62d64575af21c4116928/6138196/image-6baaea42-567b-4e70-93a0-f9b46d8552a1.png';
const BOTTOM_LEFT =
  'https://i-p.rmcdn.net/696f62d64575af21c4116928/6138196/image-8badfd91-3a51-409e-a32f-94c61f7aa050.png';
const BOTTOM_RIGHT =
  'https://i-p.rmcdn.net/696f62d64575af21c4116928/6138196/image-cedecca1-0622-4f1a-8550-485e76609778.png';

const VI: SustainitOurExpertiseContent = {
  indexLabel: '(01 — 04)',
  heading: 'Our Expertise',
  intro:
    'We offer strategic partnership at the key stages of building a global iconic brand.',
  bgColor: '#F4F4F2',
  accentColor: '#B6FF3D',
  items: [
    {
      imageUrl: TOP_LEFT,
      title: 'BIOTECH STRATEGY AND INNOVATION SCOUTING',
      subtitle: 'An R&D department for your brand',
      bullets: [
        'Analysis and selection of breakthrough technologies in biomaterials, biofabrication, and smart textiles.',
        'Commercialization strategy: from lab prototypes and supply chains to MVP, marketing, and global launch.',
        'Partnerships with scientific institutes and bio-startups.',
      ],
      color: '#a9f54b',
    },
    {
      imageUrl: TOP_RIGHT,
      title: 'BRAND STRATEGY AND BUSINESS ARCHITECTURE',
      subtitle: 'The foundation everything is built on',
      bullets: [
        'Brand DNA, positioning, and product matrix with innovation as the core driver.',
        'Hybrid business models (B2B, DTC, technology licensing).',
        'End-to-end financial modeling and investment readiness.',
      ],
      color: '#cbabff',
    },
    {
      imageUrl: BOTTOM_LEFT,
      title: 'SYSTEMIC SUSTAINABILITY (ESG BY DESIGN)',
      subtitle:
        'We embed responsibility into the foundation — not into reporting',
      bullets: [
        'Circular models: reducing, reusing, recycling, bioinnovation.',
        'Transparent supply chains powered by traceability technologies.',
        'Impact strategy aligned with global ESG standards.',
      ],
      color: '#cbabff',
    },
    {
      imageUrl: BOTTOM_RIGHT,
      title: 'FASHION STARTUP LAUNCH & GLOBAL EXPANSION',
      subtitle: 'We launch, scale, and take brands to the global stage',
      bullets: [
        'Go-to-market strategy development and execution.',
        'Distribution channels: own e-commerce through premium multi-brand retailers.',
        'Marketing and communications that scale.',
      ],
      color: '#a9f54b',
    },
  ],
  ctaLabel: 'Work with us',
};

// En clone giống hệt (source tiếng Anh); có thể điều chỉnh sau.
const EN: SustainitOurExpertiseContent = { ...VI };

export const sustainitOurExpertiseDef: BlockDef<SustainitOurExpertiseContent> =
  {
    type: 'sustainit_our_expertise',
    meta: {
      type: 'sustainit_our_expertise',
      label: 'Sustainit - Our Expertise',
      accent: '#B6FF3D',
      adminLabel: 'Sustainit - Our Expertise',
      gradient: 'from-lime-300 to-neutral-200',
      defaultName: 'Sustainit - Our Expertise',
      aiLabelVi:
        'grid 2×2 cell vuông: 4 expertise item (ảnh + tiêu đề ALL-CAPS + bullets), Geist Mono, accent xanh',
      aiLabelEn:
        '2×2 square-cell grid: 4 expertise items (image + ALL-CAPS title + bullets), Geist Mono, green accent',
    },
    component: SustainitOurExpertise,
    defaultContent: { vi: VI, en: EN },
    elements: [
      {
        key: 'indexLabel',
        label: 'Index',
        groupId: 'header',
        groupLabel: 'Header',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'heading',
        label: 'Tiêu đề',
        groupId: 'header',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'intro',
        label: 'Intro',
        groupId: 'header',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      {
        key: 'ctaLabel',
        label: 'CTA',
        groupId: 'header',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'items[0].imageUrl',
        label: 'Ảnh',
        groupId: 'item1',
        groupLabel: 'Item 1',
        icon: ImageIcon,
        fieldType: 'image',
      },
      {
        key: 'items[0].title',
        label: 'Tiêu đề',
        groupId: 'item1',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'items[0].subtitle',
        label: 'Phụ đề',
        groupId: 'item1',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      {
        key: 'items[0].bullets',
        label: 'Bullets',
        groupId: 'item1',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      {
        key: 'items[1].imageUrl',
        label: 'Ảnh',
        groupId: 'item2',
        groupLabel: 'Item 2',
        icon: ImageIcon,
        fieldType: 'image',
      },
      {
        key: 'items[1].title',
        label: 'Tiêu đề',
        groupId: 'item2',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'items[1].subtitle',
        label: 'Phụ đề',
        groupId: 'item2',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      {
        key: 'items[1].bullets',
        label: 'Bullets',
        groupId: 'item2',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      {
        key: 'items[2].imageUrl',
        label: 'Ảnh',
        groupId: 'item3',
        groupLabel: 'Item 3',
        icon: ImageIcon,
        fieldType: 'image',
      },
      {
        key: 'items[2].title',
        label: 'Tiêu đề',
        groupId: 'item3',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'items[2].subtitle',
        label: 'Phụ đề',
        groupId: 'item3',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      {
        key: 'items[2].bullets',
        label: 'Bullets',
        groupId: 'item3',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      {
        key: 'items[3].imageUrl',
        label: 'Ảnh',
        groupId: 'item4',
        groupLabel: 'Item 4',
        icon: ImageIcon,
        fieldType: 'image',
      },
      {
        key: 'items[3].title',
        label: 'Tiêu đề',
        groupId: 'item4',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'items[3].subtitle',
        label: 'Phụ đề',
        groupId: 'item4',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      {
        key: 'items[3].bullets',
        label: 'Bullets',
        groupId: 'item4',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
    ],
  };
