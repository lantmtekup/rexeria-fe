import type { LegacyBlockSchema } from '../types';

/**
 * Bento - 01 (Avexa Why-Us): clone of avexa.framer.media features section.
 *
 * 5 fixed-slot cards laid out in a bento grid.
 */
export const framerAvexaBentoSchema: LegacyBlockSchema = {
  id: 'framer.avexa.bento.v1',
  name: 'Bento - 01 (Avexa Why-Us)',
  category: 'Features',
  description:
    'Bento 5-card layout từ avexa.framer.media: Strategy + Quality+24/7 stack + Tailored, dòng dưới Collaborative + Creative (2 ảnh xoay).',
  fields: [
    // Card 1 — Strategy-First
    {
      name: 'card1Image',
      type: 'image',
      label: 'Card 1 — Ảnh (compass)',
      aspectRatio: '1:1',
    },
    {
      name: 'card1Title',
      type: 'text',
      label: 'Card 1 — Tiêu đề',
      default: 'Strategy-First Approach',
      maxLength: 60,
    },
    {
      name: 'card1Desc',
      type: 'text',
      label: 'Card 1 — Mô tả',
      default: 'Every decision is rooted in clarity, not guesswork.',
      maxLength: 160,
    },

    // Card 2 — Quality Over Quantity (orange)
    {
      name: 'card2Image',
      type: 'image',
      label: 'Card 2 — Ảnh (brush)',
      aspectRatio: '1:1',
    },
    {
      name: 'card2Title',
      type: 'text',
      label: 'Card 2 — Tiêu đề',
      default: 'Quality Over Quantity, Always',
      maxLength: 80,
    },
    {
      name: 'card2Caption',
      type: 'text',
      label: 'Card 2 — Caption góc phải dưới',
      default: 'We focus on fewer projects to deliver better outcomes.',
      maxLength: 160,
    },

    // Card 3 — 24/7 Priority Support (black)
    {
      name: 'card3Big',
      type: 'text',
      label: 'Card 3 — Số to',
      default: '24/7',
      maxLength: 12,
    },
    {
      name: 'card3Sub',
      type: 'text',
      label: 'Card 3 — Phụ đề',
      default: 'Priority Support',
      maxLength: 60,
    },
    {
      name: 'card3BadgeBrand',
      type: 'text',
      label: 'Card 3 — Tên app badge',
      default: 'Avexa',
      maxLength: 30,
    },
    {
      name: 'card3BadgeLabel',
      type: 'text',
      label: 'Card 3 — Nhãn badge',
      default: 'Support Ticket',
      maxLength: 40,
    },

    // Card 4 — Tailored Solutions
    {
      name: 'card4Image',
      type: 'image',
      label: 'Card 4 — Ảnh (table/lamp)',
      aspectRatio: '1:1',
    },
    {
      name: 'card4Title',
      type: 'text',
      label: 'Card 4 — Tiêu đề',
      default: 'Tailored Solutions',
      maxLength: 60,
    },
    {
      name: 'card4Desc',
      type: 'text',
      label: 'Card 4 — Mô tả',
      default: 'No one-size-fits-all — everything is shaped to fit your goals.',
      maxLength: 160,
    },

    // Card 5 — Collaborative Process (wide BG photo)
    {
      name: 'card5Image',
      type: 'image',
      label: 'Card 5 — Ảnh nền (team B&W)',
      aspectRatio: '16:9',
    },
    {
      name: 'card5Title',
      type: 'text',
      label: 'Card 5 — Tiêu đề',
      default: 'Collaborative Process',
      maxLength: 60,
    },
    {
      name: 'card5Caption',
      type: 'text',
      label: 'Card 5 — Caption phải dưới',
      default: 'We work with you, not just for you.',
      maxLength: 120,
    },

    // Card 6 — Creative Meets Practical
    {
      name: 'card6Image1',
      type: 'image',
      label: 'Card 6 — Ảnh 1 (xoay trái)',
      aspectRatio: '4:3',
    },
    {
      name: 'card6Image2',
      type: 'image',
      label: 'Card 6 — Ảnh 2 (xoay phải)',
      aspectRatio: '4:3',
    },
    {
      name: 'card6Title',
      type: 'text',
      label: 'Card 6 — Tiêu đề',
      default: 'Creative Meets Practical',
      maxLength: 60,
    },
    {
      name: 'card6Desc',
      type: 'text',
      label: 'Card 6 — Mô tả',
      default: 'Smart design that actually works in the real world.',
      maxLength: 160,
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      card1Image: {
        url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
        alt: 'Compass',
      },
      card1Title: 'Strategy-First Approach',
      card1Desc: 'Every decision is rooted in clarity, not guesswork.',

      card2Image: {
        url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80',
        alt: 'Makeup brush',
      },
      card2Title: 'Quality Over Quantity, Always',
      card2Caption: 'We focus on fewer projects to deliver better outcomes.',

      card3Big: '24/7',
      card3Sub: 'Priority Support',
      card3BadgeBrand: 'Avexa',
      card3BadgeLabel: 'Support Ticket',

      card4Image: {
        url: 'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=1000&q=80',
        alt: 'Desk with lamp and book',
      },
      card4Title: 'Tailored Solutions',
      card4Desc:
        'No one-size-fits-all — everything is shaped to fit your goals.',

      card5Image: {
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80',
        alt: 'Team collaborating',
      },
      card5Title: 'Collaborative Process',
      card5Caption: 'We work with you, not just for you.',

      card6Image1: {
        url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&q=80',
        alt: 'Design samples',
      },
      card6Image2: {
        url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1000&q=80',
        alt: 'Workspace flat-lay',
      },
      card6Title: 'Creative Meets Practical',
      card6Desc: 'Smart design that actually works in the real world.',
    },
    en: {
      card1Image: {
        url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
        alt: 'Compass',
      },
      card1Title: 'Strategy-First Approach',
      card1Desc: 'Every decision is rooted in clarity, not guesswork.',
      card2Image: {
        url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80',
        alt: 'Brush',
      },
      card2Title: 'Quality Over Quantity, Always',
      card2Caption: 'We focus on fewer projects to deliver better outcomes.',
      card3Big: '24/7',
      card3Sub: 'Priority Support',
      card3BadgeBrand: 'Avexa',
      card3BadgeLabel: 'Support Ticket',
      card4Image: {
        url: 'https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=1000&q=80',
        alt: 'Desk',
      },
      card4Title: 'Tailored Solutions',
      card4Desc:
        'No one-size-fits-all — everything is shaped to fit your goals.',
      card5Image: {
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80',
        alt: 'Team',
      },
      card5Title: 'Collaborative Process',
      card5Caption: 'We work with you, not just for you.',
      card6Image1: {
        url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&q=80',
        alt: 'Design samples',
      },
      card6Image2: {
        url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1000&q=80',
        alt: 'Workspace',
      },
      card6Title: 'Creative Meets Practical',
      card6Desc: 'Smart design that actually works in the real world.',
    },
  },
};
