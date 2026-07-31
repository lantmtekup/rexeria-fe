/**
 * BlockDef cho `readymag_case_section` — port từ framer-recon
 * `recon-readymag-cases` (URL https://readymag.com/designs/6263403/,
 * selector `article.page`).
 *
 * `cases[]` = preferred (thêm/xoá trong Layers / toolbar).
 * Flat case1…5 = legacy fallback cho content cũ.
 *
 * Component: `blocks/ReadymagCaseSection.tsx`.
 */
import {
  Image as ImageIcon,
  Link as LinkIcon,
  ListChecks,
  Type,
} from 'lucide-react';

import { ReadymagCaseSection } from '../../ReadymagCaseSection';
import type { LayerElement } from '../../../LayersPanel';
import type {
  ReadymagCaseItem,
  ReadymagCaseSectionContent,
} from '../../../types';
import type { BlockDef } from '../types';

const LEGACY_KEYS = ['fold', 'lune', 'arca', 'still', 'signal'] as const;

export const READMAG_CASE_SECTION_DEFAULT_CASES: ReadymagCaseItem[] = [
  {
    key: 'fold',
    name: 'Fold',
    body: ' — một studio gốm sứ muốn thương hiệu có cùng "chất" với tác phẩm. Chúng tôi xây dựng bộ nhận diện đặt trên vật liệu và quy trình — chậm rãi, kỹ lưỡng, và bền.',
    linkText: 'Xem case →',
    linkHref: '#fold',
    imageUrl:
      'https://i-p.rmcdn.net/699f38cb426b5ca9c4aa865a/6244544/image-e3721297-d15a-4602-93da-f2e7b71f6c62.png',
  },
  {
    key: 'lune',
    name: 'Lune',
    body: ' — đài radio indie đang tìm chỗ đứng trong thế giới streaming-first. Chúng tôi giúp họ giữ lại thứ khiến mình đáng nghe.',
    linkText: 'Xem case →',
    linkHref: '#lune',
    imageUrl:
      'https://i-p.rmcdn.net/699f38cb426b5ca9c4aa865a/6244544/image-48f00240-e6bd-4214-ade7-2a12e2e087f3.png',
  },
  {
    key: 'arca',
    name: 'Arca',
    body: ' — thương hiệu nến thủ công có lượng khách trung thành nhưng nhận diện chưa theo kịp. Chúng tôi cân chỉnh cả hai — ấm, chính xác, kín đáo.',
    linkText: 'Xem case →',
    linkHref: '#arca',
    imageUrl:
      'https://i-p.rmcdn.net/699f38cb426b5ca9c4aa865a/6244544/image-02200fe6-14cc-47bd-be69-9a8b14943b57.png',
  },
  {
    key: 'still',
    name: 'Still',
    body: ' — label thời trang bền vững ra mắt bộ sưu tập thường trực đầu tiên. Xây dựng quanh sự tĩnh lặng và chủ đích — không gì ồn hơn mức cần thiết.',
    linkText: 'Xem case →',
    linkHref: '#still',
    imageUrl:
      'https://i-p.rmcdn.net/699f38cb426b5ca9c4aa865a/6244544/image-b7641285-1355-4898-a8b6-eb6da3c89e7f.png',
  },
  {
    key: 'signal',
    name: 'Signal',
    body: ' — studio kiến trúc Berlin cần một mặt hiện diện số có cùng sự kỹ lưỡng như công trình. Sạch, không gian, tập trung hoàn toàn vào tác phẩm.',
    linkText: 'Xem case →',
    linkHref: '#signal',
    imageUrl:
      'https://i-p.rmcdn.net/699f38cb426b5ca9c4aa865a/6244544/image-02200fe6-14cc-47bd-be69-9a8b14943b57.png',
  },
];

const READMAG_CASE_BLANK: ReadymagCaseItem = {
  key: 'new-case',
  name: 'New case',
  body: ' — mô tả case mới.',
  linkText: 'View case →',
  linkHref: '#',
  imageUrl: READMAG_CASE_SECTION_DEFAULT_CASES[0]?.imageUrl ?? '',
};

type FlatCaseIndex = 1 | 2 | 3 | 4 | 5;

const legacyCase = (
  content: ReadymagCaseSectionContent,
  i: number
): ReadymagCaseItem => {
  const n = (i + 1) as FlatCaseIndex;
  const pick = (suffix: string) => {
    const k = `case${n}${suffix}` as keyof ReadymagCaseSectionContent;
    const v = content[k];
    return typeof v === 'string' ? v.trim() : '';
  };
  const prev = content.cases?.[i];
  return {
    key: prev?.key || LEGACY_KEYS[i] || `case${n}`,
    name: pick('Name') || prev?.name || '',
    body: pick('Body') || prev?.body || '',
    linkText: pick('LinkText') || prev?.linkText || '',
    linkHref: pick('LinkHref') || prev?.linkHref || '#',
    imageUrl: pick('ImageUrl') || prev?.imageUrl || '',
  };
};

/** Resolve cases[] (preferred) hoặc flat case1…5 (legacy). */
export const resolveReadymagCases = (
  content: ReadymagCaseSectionContent | null | undefined
): ReadymagCaseItem[] => {
  const raw = content?.cases;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .filter(c => c && typeof c === 'object')
      .map((c, i) => ({
        key: c.key?.trim() || LEGACY_KEYS[i] || `case${i + 1}`,
        name: c.name ?? '',
        body: c.body ?? '',
        linkText: c.linkText ?? '',
        linkHref: c.linkHref ?? '#',
        imageUrl: c.imageUrl ?? '',
      }));
  }
  return [0, 1, 2, 3, 4]
    .map(i => legacyCase(content ?? ({} as ReadymagCaseSectionContent), i))
    .filter(c => c.name || c.body || c.imageUrl);
};

export const hasReadymagCasesArray = (
  content: ReadymagCaseSectionContent | null | undefined
): boolean =>
  Array.isArray(content?.cases) && (content?.cases?.length ?? 0) > 0;

export const readymagCaseElements = (
  cases: ReadymagCaseItem[]
): LayerElement[] =>
  cases.flatMap((c, i) => {
    const groupId = `case${i}`;
    const groupLabel = c.name?.trim() || `Case ${i + 1}`;
    return [
      {
        key: `cases[${i}].imageUrl`,
        label: 'ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `cases[${i}].name`,
        label: 'tên',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `cases[${i}].body`,
        label: 'mô tả',
        groupId,
        icon: Type,
        fieldType: 'textarea' as const,
      },
      {
        key: `cases[${i}].linkText`,
        label: 'link text',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `cases[${i}].linkHref`,
        label: 'link URL',
        groupId,
        icon: LinkIcon,
        fieldType: 'link' as const,
      },
    ];
  });

/** Legacy flat case1…5 — Layers khi content chưa migrate sang cases[]. */
export const READMAG_CASE_SECTION_LEGACY_ELEMENTS: LayerElement[] = (
  [1, 2, 3, 4, 5] as const
).flatMap(n => {
  const groupId = `case${n}`;
  return [
    {
      key: `case${n}ImageUrl`,
      label: 'ảnh',
      groupId,
      groupLabel: `Case ${n}`,
      icon: ImageIcon,
      fieldType: 'image' as const,
    },
    {
      key: `case${n}Name`,
      label: 'tên',
      groupId,
      icon: Type,
      fieldType: 'text' as const,
    },
    {
      key: `case${n}Body`,
      label: 'mô tả',
      groupId,
      icon: Type,
      fieldType: 'textarea' as const,
    },
    {
      key: `case${n}LinkText`,
      label: 'link text',
      groupId,
      icon: Type,
      fieldType: 'text' as const,
    },
    {
      key: `case${n}LinkHref`,
      label: 'link URL',
      groupId,
      icon: LinkIcon,
      fieldType: 'text' as const,
    },
  ];
});

const VI: ReadymagCaseSectionContent = {
  cases: READMAG_CASE_SECTION_DEFAULT_CASES,
  bgColor: '#ffffff',
  textColor: '#000000',
  accentColor: '#0000ee',
  wordmarkColor: '#000000',
};

const EN: ReadymagCaseSectionContent = {
  ...VI,
  cases: READMAG_CASE_SECTION_DEFAULT_CASES.map((item, i) => ({
    ...item,
    body:
      [
        ' — a ceramics studio that wanted a brand as tactile as their work. We built an identity rooted in material and process — unhurried, considered, and built to last.',
        ' — an independent radio station finding its footing in a streaming-first world. We helped them hold on to what made them worth listening to.',
        " — a small-batch candle brand with a loyal following and a visual identity that hadn't kept up. We brought the two in line — warm, precise, and quietly confident.",
        ' — a sustainable fashion label launching their first permanent collection. Built around stillness and intention — nothing louder than it needed to be.',
        ' — a Berlin-based architecture practice that needed a digital presence as considered as their buildings. Clean, spatial, and focused entirely on the work.',
      ][i] ?? item.body,
    linkText: 'View case →',
  })),
};

export const readymagCaseSectionDef: BlockDef<ReadymagCaseSectionContent> = {
  type: 'readymag_case_section',
  meta: {
    type: 'readymag_case_section',
    label: 'Readymag Cases',
    accent: '#000000',
    adminLabel: 'Readymag Cases',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Cases',
    aiLabelVi:
      'section cases Readymag: 3-cột tuyệt đối (ảnh trái + bio giữa + wordmark phải) với case-cycle scroll-driven (GSAP scrub R1–R6)',
    aiLabelEn:
      'Readymag cases: 3-column absolute layout (image-stack left + bio middle + wordmark right) with scroll-driven case cycle (GSAP scrub R1–R6)',
  },
  component: ReadymagCaseSection,
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...readymagCaseElements(READMAG_CASE_SECTION_DEFAULT_CASES),
    {
      key: 'cases',
      label: 'Thêm / quản lý case',
      icon: ListChecks,
    },
  ],
};

export { READMAG_CASE_BLANK };
