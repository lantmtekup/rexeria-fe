import type { TemplateMeta } from '../types';

/**
 * Mint-coint template — ported từ test-coin-nextjs standalone Next.js app
 * (Royal Canadian Mint 1 kg gold coin landing). GSAP + Lenis smooth
 * scroll + Swiper carousels + scroll-triggered pinned scenes.
 *
 * BE template entity phải có `code: "mint-coint"`. Đã setup ở dev BE.
 */
export const meta: TemplateMeta = {
  code: 'mint-coint',
  name: 'Mint Coin — Royal Canadian',
  description:
    'Premium product landing — Tom Thomson Jack Pine 1kg gold coin. ' +
    'Pinned scenes, smooth scroll (Lenis), GSAP scroll-triggered ' +
    'animations, variant picker, discover panel.',
  contentSchema: {
    fields: [
      {
        key: 'title',
        label: 'Tên sản phẩm',
        type: 'text',
        default: 'The Jack Pine by Tom Thomson',
        hint: 'Hiện ở meta title + một số chỗ heading',
      },
      {
        key: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        default: '1 Kilo Pure Gold Coin (2026)',
      },
    ],
  },
  tracking: {
    // Section IDs khớp với `data-rexer-section` ở index.tsx wrappers.
    // Stable across deploys — đừng rename vì sẽ break aggregate
    // history. Add section mới = append, không xen giữa.
    sections: [
      { id: 'hero', label: 'Hero Intro' },
      { id: 'details', label: 'Details / Specs' },
      { id: 'discover-reverse', label: 'Discover — Reverse Side' },
      { id: 'discover-obverse', label: 'Discover — Obverse Side' },
      { id: 'variants', label: 'Variants Picker' },
      { id: 'sku-cta', label: 'SKU + Buy CTA' },
    ],
    // Mọi CTA tracked qua data-rexer-cta attrs. Labels hiển thị ở
    // analytics breakdown nhóm theo cta_id (event_type=cta_click).
    // Add CTA mới = thêm attr ở TSX + entry ở đây — analytics chart
    // tự nhận. Section context (section_id) auto-attached khi CTA
    // nằm trong [data-rexer-section] wrapper.
    ctas: [
      // ── Global UI (outside sections) ───────────────────────────
      { id: 'header-logo', label: 'Header — RCM Logo' },
      { id: 'nav-description', label: 'Nav — Description' },
      { id: 'nav-discover', label: 'Nav — Discover' },
      { id: 'nav-information', label: 'Nav — Information' },
      { id: 'nav-podcast', label: 'Nav — Podcast' },
      { id: 'contact-mint', label: 'Sticky CTA — Contact The Mint' },

      // ── Section: discover-reverse (Hotspots tab 1) ─────────────
      {
        id: 'hotspot-the-lone-pine',
        label: 'Hotspot — The Lone Pine',
        section: 'discover-reverse',
      },
      {
        id: 'hotspot-sky-and-water',
        label: 'Hotspot — Sky and Water',
        section: 'discover-reverse',
      },
      {
        id: 'hotspot-serrated-edge',
        label: 'Hotspot — Serrated Edge',
        section: 'discover-reverse',
      },

      // ── Section: discover-obverse (Hotspots tab 2) ─────────────
      {
        id: 'hotspot-king-charles-iii-effigy',
        label: 'Hotspot — King Charles III Effigy',
        section: 'discover-obverse',
      },
      {
        id: 'hotspot-99-99-pure-gold',
        label: 'Hotspot — 99.99% Pure Gold',
        section: 'discover-obverse',
      },

      // ── Close detail drawer (both discover sections, attach reverse) ──
      {
        id: 'close-detail-tab',
        label: 'Close Detail Drawer',
        section: 'discover-reverse',
      },

      // ── Section: variants ───────────────────────────────────────
      {
        id: 'open-discover-panel',
        label: 'Coin → Open Discover Panel',
        section: 'variants',
      },
      {
        id: 'variant-reverse',
        label: 'Variant — Reverse',
        section: 'variants',
      },
      {
        id: 'variant-obverse',
        label: 'Variant — Obverse',
        section: 'variants',
      },
      {
        id: 'variant-packaging',
        label: 'Variant — Packaging',
        section: 'variants',
      },

      // ── Discover Panel (overlay drawer, attach variants section) ──
      { id: 'panel-close', label: 'Panel — Close', section: 'variants' },
      {
        id: 'panel-view-reverse',
        label: 'Panel — Switch View Reverse',
        section: 'variants',
      },
      {
        id: 'panel-view-obverse',
        label: 'Panel — Switch View Obverse',
        section: 'variants',
      },
      {
        id: 'panel-view-packaging',
        label: 'Panel — Switch View Packaging',
        section: 'variants',
      },
      {
        id: 'panel-contact-mint',
        label: 'Panel CTA — Contact The Mint',
        section: 'variants',
      },
      {
        id: 'buy-coin',
        label: 'Panel CTA — Buy Now (conversion)',
        section: 'variants',
      },
    ],
  },
};
