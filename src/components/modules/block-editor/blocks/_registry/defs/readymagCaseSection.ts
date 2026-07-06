/**
 * BlockDef cho `readymag_case_section` — port từ framer-recon
 * `recon-readymag-cases` (URL https://readymag.com/designs/6263403/,
 * selector `article.page`).
 *
 * 5 cases mặc định mô phỏng studio "North Bureau" — mỗi case có name + body +
 * image + "View case →" link. Layout: cột ảnh trái (stack scroll-driven) +
 * bio giữa + wordmark phải. Animation qua `useBlockMotion` (GSAP R1–R6).
 *
 * Component: `blocks/ReadymagCaseSection.tsx`.
 */
import { Images, Link as LinkIcon, Type } from 'lucide-react';

import { ReadymagCaseSection } from '../../ReadymagCaseSection';
import type { ReadymagCaseSectionContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: ReadymagCaseSectionContent = {
  cases: [
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
  ],
  bgColor: '#ffffff',
  textColor: '#000000',
  accentColor: '#0000ee',
  wordmarkColor: '#000000',
};

const EN: ReadymagCaseSectionContent = {
  ...VI,
  cases: VI.cases.map(c => ({
    ...c,
    body:
      ' — ' +
      c.body
        .replace(' — ', ' — ')
        .replace(
          'một studio gốm sứ muốn thương hiệu có cùng "chất" với tác phẩm.',
          'a ceramics studio that wanted a brand as tactile as their work.'
        )
        .replace(
          'Chúng tôi xây dựng bộ nhận diện đặt trên vật liệu và quy trình — chậm rãi, kỹ lưỡng, và bền.',
          'We built an identity rooted in material and process — unhurried, considered, and built to last.'
        )
        .replace(
          'đài radio indie đang tìm chỗ đứng trong thế giới streaming-first.',
          'an independent radio station finding its footing in a streaming-first world.'
        )
        .replace(
          'Chúng tôi giúp họ giữ lại thứ khiến mình đáng nghe.',
          'We helped them hold on to what made them worth listening to.'
        )
        .replace(
          'thương hiệu nến thủ công có lượng khách trung thành nhưng nhận diện chưa theo kịp.',
          "a small-batch candle brand with a loyal following and a visual identity that hadn't kept up."
        )
        .replace(
          'Chúng tôi cân chỉnh cả hai — ấm, chính xác, kín đáo.',
          'We brought the two in line — warm, precise, and quietly confident.'
        )
        .replace(
          'label thời trang bền vững ra mắt bộ sưu tập thường trực đầu tiên.',
          'a sustainable fashion label launching their first permanent collection.'
        )
        .replace(
          'Xây dựng quanh sự tĩnh lặng và chủ đích — không gì ồn hơn mức cần thiết.',
          'Built around stillness and intention — nothing louder than it needed to be.'
        )
        .replace(
          'studio kiến trúc Berlin cần một mặt hiện diện số có cùng sự kỹ lưỡng như công trình.',
          'a Berlin-based architecture practice that needed a digital presence as considered as their buildings.'
        )
        .replace(
          'Sạch, không gian, tập trung hoàn toàn vào tác phẩm.',
          'Clean, spatial, and focused entirely on the work.'
        )
        .replace('Chúng tôi cân chỉnh cả hai', 'We brought the two in line'),
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
    // Editor mở `cases[]` qua UI danh sách item-riêng; chỉ khai báo các
    // field-level "items" + container-level colors ở đây để LayersPanel có
    // chỗ gắn icon. Per-case key (name/body/image/link) được sửa trong
    // form danh sách.
    { key: 'cases', label: 'Cases', icon: Images, fieldType: 'image' },
    { key: 'bgColor', label: 'Nền', icon: Type, fieldType: 'text' },
    { key: 'textColor', label: 'Chữ', icon: Type, fieldType: 'text' },
    { key: 'accentColor', label: 'Link', icon: LinkIcon, fieldType: 'text' },
    { key: 'wordmarkColor', label: 'Wordmark', icon: Type, fieldType: 'text' },
  ],
};
