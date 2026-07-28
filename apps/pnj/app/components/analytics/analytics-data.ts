// Analytics overlay config for the Coin landing. Metrics come LIVE from ReXeR
// (no mock data). Each block is anchored to a DOM node via `selector`
// (getBoundingClientRect), so the overlay never wraps section markup — keeps
// Lenis/GSAP pinning intact.

export interface CtaPoint {
  id: string; // matches the element's data-cta-id (→ dimensions.cta_id)
  label: string; // human-readable name shown in the overlay breakdown
}

export interface AnalyticsBlock {
  id: string;
  label: string;
  selector: string; // CSS selector of the anchor element on the page
  // Optional per-CTA breakdown. When set, the overlay shows a click count for
  // each point (e.g. the 3 hotspots on the coin) instead of only the block total.
  ctas?: CtaPoint[];
}

// Hardcoded login credentials (change here if needed).
export const ANALYTICS_CREDENTIALS = {
  username: 'admin',
  password: 'coin2025',
};

export const ANALYTICS_AUTH_KEY = 'coin_analytics_auth';

// ── ReXeR backend integration ──────────────────────────────────────────────
// Tracking → POST {API_BASE}/v1/track (publishable key, X-ReXeR-Key header).
// Read-back → GET {API_BASE}/v1/pages/{PAGE_ID}/analytics/{summary,blocks}
// via the same-origin /api/rexer proxy (needs a logged-in ReXeR cookie session).
export const REXER_API_BASE =
  process.env.NEXT_PUBLIC_REXER_API_BASE || 'https://rexerai.tekupsoftware.com';

// REQUIRED: slug or UUID of this page in ReXeR.
// 👇 EDIT THIS LINE (or set NEXT_PUBLIC_REXER_PAGE_ID).
const PAGE_ID_FALLBACK = 'd64e6932-c047-43a8-9064-96df28b7dc78';
export const REXER_PAGE_ID =
  process.env.NEXT_PUBLIC_REXER_PAGE_ID || PAGE_ID_FALLBACK;

// Publishable tracking key (pk_live_…) — write-only, scopes events to the brand
// & passes anti-spam. Minted by staff/admin in the ReXeR portal (shown once).
// 👇 PASTE YOUR pk_live_ KEY HERE (or set NEXT_PUBLIC_REXER_TRACKING_KEY).
const TRACKING_KEY_FALLBACK = 'pk_live_al9kc5qrlOK7FntzDnpz3TXAr-hG0rjj';
export const REXER_TRACKING_KEY =
  process.env.NEXT_PUBLIC_REXER_TRACKING_KEY || TRACKING_KEY_FALLBACK;

export const ANALYTICS_BLOCKS: AnalyticsBlock[] = [
  { id: 'hero', label: 'Hero Intro', selector: '.hero' },
  { id: 'details', label: 'Details', selector: '#description' },
  {
    id: 'discover',
    label: 'Canvas Hotspots',
    selector: '#discover',
    ctas: [
      { id: 'hotspot-thông-số-kỹ-thuật', label: 'Thông số kỹ thuật' },
      { id: 'hotspot-chất-liệu-&-hoàn-thiện', label: 'Chất liệu & hoàn thiện' },
      { id: 'hotspot-thiết-kế-mặt-số', label: 'Thiết kế mặt số' },
      { id: 'hotspot-công-nghệ-eco-drive', label: 'Công nghệ Eco-Drive' },
      { id: 'hotspot-reverse', label: 'Reverse' },
      { id: 'hotspot-obverse', label: 'Obverse' },
      { id: 'hotspot-packaging', label: 'Packaging' },
    ],
  },
  { id: 'information', label: 'Variants', selector: '#information' },
  {
    id: 'contact',
    label: 'Register Interest',
    selector: '#contact',
    // Closing CTA form — the register-interest submit button.
    ctas: [{ id: 'cta-register', label: 'Register Interest' }],
  },
];
