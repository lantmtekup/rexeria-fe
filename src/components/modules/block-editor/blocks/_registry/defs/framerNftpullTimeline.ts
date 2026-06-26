/**
 * BlockDef cho `framer_nftpull_timeline` — port từ framer-recon
 * `recon-nftpull-why-go` (URL https://nftpull.framer.website/,
 * selector `section[data-framer-name="Why Go Sections"]`).
 *
 * Timeline 2 cột zig-zag nền tối: header căn giữa, cột sống dọc gradient
 * ở giữa, item xen kẽ trái/phải với badge số + card dark surface. Mặc
 * định 4 items để khớp với site gốc (User-Friendly Interface, Cool
 * Security Features, Live Market Insights, Engagement Tools).
 *
 * Component: `blocks/FramerNftpullTimeline.tsx`. Entrance reveal (header
 * fade-up, spine fill scrub, card stagger, badge pop) đi qua
 * `useBlockMotion` theo GSAP R1–R6.
 */
import { Pilcrow, Type } from 'lucide-react';

import { FramerNftpullTimeline } from '../../FramerNftpullTimeline';
import type { FramerNftpullTimelineContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: FramerNftpullTimelineContent = {
  heading: 'Why Go with NFTpull',
  intro:
    'Our platform isn’t just another NFT marketplace — it’s a fun new space designed to help digital creators and give them some awesome rewards.',
  items: [
    {
      number: '1',
      title: 'User-Friendly Interface',
      description:
        'Navigate with ease through a clean, intuitive design that makes managing your digital assets an absolute breeze, regardless of your experience level.',
    },
    {
      number: '2',
      title: 'Cool Security Features',
      description:
        'Protect your valuable investments with state-of-the-art security protocols, including robust two-factor authentic and end-to-end encryption.',
    },
    {
      number: '3',
      title: 'Live Market Insights',
      description:
        'Stay ahead of the curve with real-time market data, trend analysis, and curated drops — all from one dashboard built for creators and collectors alike.',
    },
    {
      number: '4',
      title: 'Engagement Tools',
      description:
        'Grow your community with built-in engagement tools: auctions, drops, gated content, and reward mechanics that keep collectors coming back.',
    },
  ],
};

const EN: FramerNftpullTimelineContent = {
  ...VI,
  intro:
    'Our platform isn’t just another NFT marketplace — it’s a fun new space designed to help digital creators and give them some awesome rewards.',
};

export const framerNftpullTimelineDef: BlockDef<FramerNftpullTimelineContent> =
  {
    type: 'framer_nftpull_timeline',
    meta: {
      type: 'framer_nftpull_timeline',
      label: 'Why-Go Timeline',
      accent: '#0e0e0e',
      adminLabel: 'NFTpull Why-Go Timeline',
      gradient: 'from-neutral-700 to-neutral-900',
      defaultName: 'Why-Go Timeline',
      aiLabelVi:
        'timeline nền tối, cột sống dọc gradient, card dark surface xen kẽ trái/phải, badge số trên spine (recon spec)',
      aiLabelEn:
        'dark timeline with vertical gradient spine and alternating dark cards, numbered badges on the spine (recon spec)',
    },
    component: FramerNftpullTimeline,
    defaultContent: { vi: VI, en: EN },
    elements: [
      { key: 'heading', label: 'Heading', icon: Type, fieldType: 'text' },
      { key: 'intro', label: 'Intro', icon: Pilcrow, fieldType: 'textarea' },
      // Mảng items được edit trong array control (LayerElement.kind='array') —
      // key 'items' đánh dấu group; các field lẻ (number/title/description)
      // chỉ selectable qua data-element-key trong component.
      { key: 'items', label: 'Items', icon: Pilcrow, fieldType: 'textarea' },
    ],
  };
