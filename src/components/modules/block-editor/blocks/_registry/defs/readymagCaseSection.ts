/**
 * BlockDef cho `readymag_case_section` — port từ framer-recon
 * `recon-readymag-cases` (URL https://readymag.com/designs/6263403/,
 * selector `article.page`).
 *
 * Content phẳng + groupId theo pattern ScrollMattis: mỗi case là 1 folder
 * trong LayersPanel (Case 1…5) với name / body / link / ảnh editable.
 *
 * Component: `blocks/ReadymagCaseSection.tsx`.
 */
import { Image as ImageIcon, Link as LinkIcon, Type } from 'lucide-react';

import { ReadymagCaseSection } from '../../ReadymagCaseSection';
import type { LayerElement } from '../../../LayersPanel';
import type { ReadymagCaseSectionContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: ReadymagCaseSectionContent = {
  case1Name: 'Fold',
  case1Body:
    ' — một studio gốm sứ muốn thương hiệu có cùng "chất" với tác phẩm. Chúng tôi xây dựng bộ nhận diện đặt trên vật liệu và quy trình — chậm rãi, kỹ lưỡng, và bền.',
  case1LinkText: 'Xem case →',
  case1LinkHref: '#fold',
  case1ImageUrl:
    'https://i-p.rmcdn.net/699f38cb426b5ca9c4aa865a/6244544/image-e3721297-d15a-4602-93da-f2e7b71f6c62.png',

  case2Name: 'Lune',
  case2Body:
    ' — đài radio indie đang tìm chỗ đứng trong thế giới streaming-first. Chúng tôi giúp họ giữ lại thứ khiến mình đáng nghe.',
  case2LinkText: 'Xem case →',
  case2LinkHref: '#lune',
  case2ImageUrl:
    'https://i-p.rmcdn.net/699f38cb426b5ca9c4aa865a/6244544/image-48f00240-e6bd-4214-ade7-2a12e2e087f3.png',

  case3Name: 'Arca',
  case3Body:
    ' — thương hiệu nến thủ công có lượng khách trung thành nhưng nhận diện chưa theo kịp. Chúng tôi cân chỉnh cả hai — ấm, chính xác, kín đáo.',
  case3LinkText: 'Xem case →',
  case3LinkHref: '#arca',
  case3ImageUrl:
    'https://i-p.rmcdn.net/699f38cb426b5ca9c4aa865a/6244544/image-02200fe6-14cc-47bd-be69-9a8b14943b57.png',

  case4Name: 'Still',
  case4Body:
    ' — label thời trang bền vững ra mắt bộ sưu tập thường trực đầu tiên. Xây dựng quanh sự tĩnh lặng và chủ đích — không gì ồn hơn mức cần thiết.',
  case4LinkText: 'Xem case →',
  case4LinkHref: '#still',
  case4ImageUrl:
    'https://i-p.rmcdn.net/699f38cb426b5ca9c4aa865a/6244544/image-b7641285-1355-4898-a8b6-eb6da3c89e7f.png',

  case5Name: 'Signal',
  case5Body:
    ' — studio kiến trúc Berlin cần một mặt hiện diện số có cùng sự kỹ lưỡng như công trình. Sạch, không gian, tập trung hoàn toàn vào tác phẩm.',
  case5LinkText: 'Xem case →',
  case5LinkHref: '#signal',
  case5ImageUrl:
    'https://i-p.rmcdn.net/699f38cb426b5ca9c4aa865a/6244544/image-02200fe6-14cc-47bd-be69-9a8b14943b57.png',

  bgColor: '#ffffff',
  textColor: '#000000',
  accentColor: '#0000ee',
  wordmarkColor: '#000000',
};

const EN: ReadymagCaseSectionContent = {
  ...VI,
  case1Body:
    ' — a ceramics studio that wanted a brand as tactile as their work. We built an identity rooted in material and process — unhurried, considered, and built to last.',
  case2Body:
    ' — an independent radio station finding its footing in a streaming-first world. We helped them hold on to what made them worth listening to.',
  case3Body:
    " — a small-batch candle brand with a loyal following and a visual identity that hadn't kept up. We brought the two in line — warm, precise, and quietly confident.",
  case4Body:
    ' — a sustainable fashion label launching their first permanent collection. Built around stillness and intention — nothing louder than it needed to be.',
  case5Body:
    ' — a Berlin-based architecture practice that needed a digital presence as considered as their buildings. Clean, spatial, and focused entirely on the work.',
  case1LinkText: 'View case →',
  case2LinkText: 'View case →',
  case3LinkText: 'View case →',
  case4LinkText: 'View case →',
  case5LinkText: 'View case →',
};

const caseElements = (n: 1 | 2 | 3 | 4 | 5): LayerElement[] => {
  const groupId = `case${n}`;
  return [
    {
      key: `case${n}ImageUrl`,
      label: 'ảnh',
      groupId,
      groupLabel: `Case ${n}`,
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: `case${n}Name`,
      label: 'tên',
      groupId,
      icon: Type,
      fieldType: 'text',
    },
    {
      key: `case${n}Body`,
      label: 'mô tả',
      groupId,
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: `case${n}LinkText`,
      label: 'link text',
      groupId,
      icon: Type,
      fieldType: 'text',
    },
    {
      key: `case${n}LinkHref`,
      label: 'link URL',
      groupId,
      icon: LinkIcon,
      fieldType: 'text',
    },
  ];
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
    ...caseElements(1),
    ...caseElements(2),
    ...caseElements(3),
    ...caseElements(4),
    ...caseElements(5),
  ],
};
