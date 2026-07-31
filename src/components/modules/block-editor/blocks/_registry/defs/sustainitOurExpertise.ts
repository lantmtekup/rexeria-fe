/**
 * BlockDef cho `sustainit_our_expertise` — nguồn sự thật duy nhất.
 *
 * Nguồn: Readymag sustainit.space (block "Our Expertise"). Geist Mono,
 * ink #282828 + accent xanh #B6FF3D. Grid 2×2 cell vuông @4xl desktop.
 * `items[]` động — thêm/xoá qua Layers「Thêm / quản lý mục」.
 */
import { Image as ImageIcon, ListChecks, Pilcrow, Type } from 'lucide-react';

import { SustainitOurExpertise } from '../../SustainitOurExpertise';
import type { LayerElement } from '../../../LayersPanel';
import type {
  SustainitExpertiseItem,
  SustainitOurExpertiseContent,
} from '../../../types';
import type { BlockDef } from '../types';

const TOP_LEFT =
  'https://i-p.rmcdn.net/696f62d64575af21c4116928/6138196/image-bb559446-e2c7-4880-8089-ec1a8a62f541.png';
const TOP_RIGHT =
  'https://i-p.rmcdn.net/696f62d64575af21c4116928/6138196/image-6baaea42-567b-4e70-93a0-f9b46d8552a1.png';
const BOTTOM_LEFT =
  'https://i-p.rmcdn.net/696f62d64575af21c4116928/6138196/image-8badfd91-3a51-409e-a32f-94c61f7aa050.png';
const BOTTOM_RIGHT =
  'https://i-p.rmcdn.net/696f62d64575af21c4116928/6138196/image-cedecca1-0622-4f1a-8550-485e76609778.png';

export const SUSTAINIT_OUR_EXPERTISE_DEFAULT_ITEMS: SustainitExpertiseItem[] = [
  {
    imageUrl: TOP_LEFT,
    backImageUrl: TOP_LEFT,
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
    backImageUrl: TOP_RIGHT,
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
    backImageUrl: BOTTOM_LEFT,
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
    backImageUrl: BOTTOM_RIGHT,
    title: 'FASHION STARTUP LAUNCH & GLOBAL EXPANSION',
    subtitle: 'We launch, scale, and take brands to the global stage',
    bullets: [
      'Go-to-market strategy development and execution.',
      'Distribution channels: own e-commerce through premium multi-brand retailers.',
      'Marketing and communications that scale.',
    ],
    color: '#a9f54b',
  },
];

export const SUSTAINIT_OUR_EXPERTISE_BLANK: SustainitExpertiseItem = {
  imageUrl: TOP_LEFT,
  backImageUrl: TOP_LEFT,
  title: 'NEW EXPERTISE',
  subtitle: 'Subtitle',
  bullets: ['Bullet point one.', 'Bullet point two.'],
  color: '#a9f54b',
};

/** Resolve items[] — fallback default khi thiếu / rỗng. */
export const resolveSustainitOurExpertiseItems = (
  content: SustainitOurExpertiseContent | null | undefined
): SustainitExpertiseItem[] => {
  const raw = content?.items;
  if (!Array.isArray(raw) || raw.length === 0) {
    return SUSTAINIT_OUR_EXPERTISE_DEFAULT_ITEMS.map(item => ({ ...item }));
  }
  return raw
    .filter(it => it && typeof it === 'object')
    .map(it => ({
      imageUrl: it.imageUrl ?? '',
      backImageUrl: it.backImageUrl ?? it.imageUrl ?? '',
      title: it.title ?? '',
      subtitle: it.subtitle ?? '',
      bullets: Array.isArray(it.bullets) ? it.bullets : [],
      color: it.color ?? '#a9f54b',
    }));
};

export const sustainitOurExpertiseItemElements = (
  items: SustainitExpertiseItem[]
): LayerElement[] =>
  items.flatMap((item, i) => {
    const groupId = `item${i}`;
    const groupLabel = item.title?.trim().slice(0, 36) || `Item ${i + 1}`;
    return [
      {
        key: `items[${i}].imageUrl`,
        label: 'Ảnh trước',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `items[${i}].backImageUrl`,
        label: 'Ảnh sau (blur)',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `items[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].subtitle`,
        label: 'Phụ đề',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
      {
        key: `items[${i}].bullets`,
        label: 'Bullets',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
    ];
  });

const VI: SustainitOurExpertiseContent = {
  indexLabel: '(01 — 04)',
  heading: 'Our Expertise',
  intro:
    'We offer strategic partnership at the key stages of building a global iconic brand.',
  bgColor: '#F4F4F2',
  accentColor: '#B6FF3D',
  items: SUSTAINIT_OUR_EXPERTISE_DEFAULT_ITEMS,
  ctaLabel: 'Work with us',
};

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
        'grid 2×2 cell vuông: N expertise item (ảnh trước/sau + tiêu đề ALL-CAPS + bullets), Geist Mono, accent xanh',
      aiLabelEn:
        '2×2 square-cell grid: N expertise items (front/back image + ALL-CAPS title + bullets), Geist Mono, green accent',
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
      ...sustainitOurExpertiseItemElements(
        SUSTAINIT_OUR_EXPERTISE_DEFAULT_ITEMS
      ),
      {
        key: 'items',
        label: 'Thêm / quản lý mục',
        icon: ListChecks,
      },
    ],
  };
