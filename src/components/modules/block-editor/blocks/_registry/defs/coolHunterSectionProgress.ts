/**
 * BlockDef cho `cool_hunter_section_progress` — rail progress bên phải Cool Hunter.
 * Port từ apps/cool-hunter SectionProgress.tsx. Path A registry.
 */
import { Hash, ListChecks, Tag } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  CoolHunterSectionProgressContent,
  CoolHunterSectionProgressItem,
} from '../../../types';
import type { BlockDef } from '../types';

export const COOL_HUNTER_SECTION_PROGRESS_DEFAULT_SECTIONS: CoolHunterSectionProgressItem[] =
  [
    { sectionId: 'welcome', label: '01 - Welcome' },
    { sectionId: 'lake-wehapa', label: '02 - Lake Wehapa' },
    { sectionId: 'architecture', label: '03 - Architecture' },
    { sectionId: 'interior-design', label: '04 - Interior Design' },
  ];

const DEFAULT_SECTIONS = COOL_HUNTER_SECTION_PROGRESS_DEFAULT_SECTIONS;

export const resolveCoolHunterSectionProgressSections = (
  content: CoolHunterSectionProgressContent | undefined
): CoolHunterSectionProgressItem[] => {
  const raw = content?.sections;
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_SECTIONS.map(item => ({ ...item }));
  }
  return raw.map((item, i) => {
    const fallback = DEFAULT_SECTIONS[i] ?? DEFAULT_SECTIONS[0];
    return {
      sectionId: item.sectionId?.trim() || fallback.sectionId,
      label: item.label?.trim() || fallback.label,
    };
  });
};

const VI: CoolHunterSectionProgressContent = {
  sections: DEFAULT_SECTIONS,
};

const EN: CoolHunterSectionProgressContent = {
  sections: DEFAULT_SECTIONS,
};

export const coolHunterSectionProgressItemElements = (
  sections: CoolHunterSectionProgressItem[]
): LayerElement[] => {
  const list = sections.length > 0 ? sections : DEFAULT_SECTIONS;
  return list.flatMap((item, i) => {
    const groupId = `section${i}`;
    const groupLabel = item.label?.trim() || `Section ${i + 1}`;
    return [
      {
        key: `sections[${i}].label`,
        label: 'Nhãn',
        groupId,
        groupLabel,
        icon: Tag,
        fieldType: 'text' as const,
      },
      {
        key: `sections[${i}].sectionId`,
        label: 'data-section id',
        groupId,
        icon: Hash,
        fieldType: 'text' as const,
      },
    ];
  });
};

export const coolHunterSectionProgressDef: BlockDef<CoolHunterSectionProgressContent> =
  {
    type: 'cool_hunter_section_progress',
    meta: {
      type: 'cool_hunter_section_progress',
      label: 'Cool Hunter · Section Progress',
      accent: '#111111',
      adminLabel: 'Cool Hunter Section Progress',
      gradient: 'from-neutral-200 to-neutral-700',
      defaultName: 'Cool Hunter Section Progress',
      aiLabelVi:
        'rail progress Cool Hunter: thanh tiến độ + nhãn section bên phải (desktop), đọc data-section trên các block story/gallery/product/quote',
      aiLabelEn:
        'Cool Hunter section progress rail: right-side scroll progress + section label (desktop), reads data-section on story/gallery/product/quote blocks',
    },
    component: dynamic(() =>
      import('../../CoolHunterSectionProgress').then(
        m => m.CoolHunterSectionProgress
      )
    ),
    defaultContent: { vi: VI, en: EN },
    elements: [
      ...coolHunterSectionProgressItemElements(DEFAULT_SECTIONS),
      {
        key: 'sections',
        label: 'Thêm / quản lý section',
        icon: ListChecks,
      },
    ],
  };
