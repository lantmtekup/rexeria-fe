/**
 * BlockDef cho `framer_estancia_about_us` — port từ framer-recon
 * `recon-estancia-about` (URL https://estancia.framer.website/,
 * selector `[data-framer-name="Section - About"]`).
 *
 * Layout: section nền tan #E7DECF, container max-width 1380px, heading h2
 * center (Onest 56/44/34, ls -0.06em) + CTA pill "About us" (bg #3e362e,
 * text #e7decf, Onest 16/600) + grid 3 ảnh chân dung 3:4 với stat dưới
 * (2012 / 320+ / 200+). Mobile: grid row → column, gap 100 → 14px.
 *
 * Component: `blocks/FramerEstanciaAboutUs.tsx`. Entrance reveal
 * (heading/CTA/3 cards fade-up 16px, stagger 0.08s) đi qua `useBlockMotion`
 * theo GSAP R1–R6.
 */
import {
  Image as ImageIcon,
  Link as LinkIcon,
  Pilcrow,
  Type,
} from 'lucide-react';

import { FramerEstanciaAboutUs } from '../../FramerEstanciaAboutUs';
import type { FramerEstanciaAboutUsContent } from '../../../types';
import type { BlockDef } from '../types';

// Ảnh gốc từ framerusercontent.com CDN (Estancia site, 900×1200 portrait)
const IMG_1 =
  'https://framerusercontent.com/images/7eM3T2mXkOJYups2cnjJEaEXw.png?width=900&height=1200';
const IMG_2 =
  'https://framerusercontent.com/images/UfutDHiJ4W5fujLsVx8g6QnAzs.png?width=900&height=1200';
const IMG_3 =
  'https://framerusercontent.com/images/dCih8LWQwISuNCou1Sx9X3r2MI.png?width=900&height=1200';

const VI: FramerEstanciaAboutUsContent = {
  heading:
    'Tại Estancia, chúng tôi kiến tạo những không gian vượt thời gian nơi nội thất và thiết kế hòa quyện trong sự cân bằng hoàn hảo.',
  ctaText: 'Về chúng tôi',
  ctaHref: '#about',
  card1ImageUrl: IMG_1,
  card1Value: '2012',
  card1Label: 'Năm thành lập',
  card2ImageUrl: IMG_2,
  card2Value: '320+',
  card2Label: 'Dự án đã hoàn thành',
  card3ImageUrl: IMG_3,
  card3Value: '200+',
  card3Label: 'Khách hàng hài lòng',
};

const EN: FramerEstanciaAboutUsContent = {
  heading:
    'At Estancia, we shape timeless spaces where furniture, and interiors flow together in perfect harmony.',
  ctaText: 'About us',
  ctaHref: '#about',
  card1ImageUrl: IMG_1,
  card1Value: '2012',
  card1Label: 'Year of establishment',
  card2ImageUrl: IMG_2,
  card2Value: '320+',
  card2Label: 'Projects Completed',
  card3ImageUrl: IMG_3,
  card3Value: '200+',
  card3Label: 'Satisfied Clients',
};

export const framerEstanciaAboutUsDef: BlockDef<FramerEstanciaAboutUsContent> =
  {
    type: 'framer_estancia_about_us',
    meta: {
      type: 'framer_estancia_about_us',
      label: 'Estancia About Us',
      accent: '#e7decf',
      adminLabel: 'About Us (Estancia)',
      gradient: 'from-amber-100 to-amber-200',
      defaultName: 'About Us',
      aiLabelVi:
        'section nền tan #E7DECF, heading center + pill "About us" + grid 3 ảnh chân dung với stat (2012 / 320+ / 200+)',
      aiLabelEn:
        'tan #E7DECF section, centered heading + "About us" pill CTA + 3 portrait photo cards with stats (2012 / 320+ / 200+)',
    },
    component: FramerEstanciaAboutUs,
    defaultContent: { vi: VI, en: EN },
    elements: [
      {
        key: 'heading',
        label: 'Tiêu đề',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      { key: 'ctaText', label: 'CTA — Chữ', icon: Type, fieldType: 'text' },
      {
        key: 'ctaHref',
        label: 'CTA — Link',
        icon: LinkIcon,
        fieldType: 'text',
      },
      {
        key: 'card1ImageUrl',
        label: 'Card 1 — Ảnh',
        icon: ImageIcon,
        fieldType: 'image',
      },
      {
        key: 'card1Value',
        label: 'Card 1 — Số',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'card1Label',
        label: 'Card 1 — Nhãn',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'card2ImageUrl',
        label: 'Card 2 — Ảnh',
        icon: ImageIcon,
        fieldType: 'image',
      },
      {
        key: 'card2Value',
        label: 'Card 2 — Số',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'card2Label',
        label: 'Card 2 — Nhãn',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'card3ImageUrl',
        label: 'Card 3 — Ảnh',
        icon: ImageIcon,
        fieldType: 'image',
      },
      {
        key: 'card3Value',
        label: 'Card 3 — Số',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'card3Label',
        label: 'Card 3 — Nhãn',
        icon: Type,
        fieldType: 'text',
      },
    ],
  };
