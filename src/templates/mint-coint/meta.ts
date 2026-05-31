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
      { id: 'hotspot-the-lone-pine', label: 'Hotspot — The Lone Pine' },
      { id: 'hotspot-sky-and-water', label: 'Hotspot — Sky and Water' },
      { id: 'hotspot-serrated-edge', label: 'Hotspot — Serrated Edge' },

      // ── Section: discover-obverse (Hotspots tab 2) ─────────────
      {
        id: 'hotspot-king-charles-iii-effigy',
        label: 'Hotspot — King Charles III Effigy',
      },
      {
        id: 'hotspot-99-99-pure-gold',
        label: 'Hotspot — 99.99% Pure Gold',
      },

      // ── Close detail drawer (both discover sections) ───────────
      { id: 'close-detail-tab', label: 'Close Detail Drawer' },

      // ── Section: variants ───────────────────────────────────────
      { id: 'open-discover-panel', label: 'Coin → Open Discover Panel' },
      { id: 'variant-reverse', label: 'Variant — Reverse' },
      { id: 'variant-obverse', label: 'Variant — Obverse' },
      { id: 'variant-packaging', label: 'Variant — Packaging' },

      // ── Discover Panel (overlay drawer) ────────────────────────
      { id: 'panel-close', label: 'Panel — Close' },
      { id: 'panel-view-reverse', label: 'Panel — Switch View Reverse' },
      { id: 'panel-view-obverse', label: 'Panel — Switch View Obverse' },
      {
        id: 'panel-view-packaging',
        label: 'Panel — Switch View Packaging',
      },
      { id: 'panel-contact-mint', label: 'Panel CTA — Contact The Mint' },
      { id: 'buy-coin', label: 'Panel CTA — Buy Now (conversion)' },
    ],
  },
};
