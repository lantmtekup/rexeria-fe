// Analytics overlay config for the mintcoin-v2 (Kunai) landing. Metrics come LIVE
// from ReXeR (no mock data). Each block is anchored to a DOM node via `selector`
// (getBoundingClientRect), so the overlay never wraps section markup — keeps
// Lenis/GSAP pinning intact. Each v2 section already carries a unique class
// (.emblem/.manifesto/.works/.services/.process/.cta) used as the anchor.

export interface CtaPoint {
  id: string; // matches the element's data-cta-id (→ dimensions.cta_id)
  label: string; // human-readable name shown in the overlay breakdown
}

export interface AnalyticsBlock {
  id: string;
  label: string;
  selector: string; // CSS selector of the anchor element on the page
  // Optional per-CTA breakdown. When set, the overlay shows a click count for
  // each named CTA in the block instead of only the block total.
  ctas?: CtaPoint[];
}

// Hardcoded login credentials (change here if needed).
export const ANALYTICS_CREDENTIALS = {
  username: 'admin',
  password: 'coin2025',
};

export const ANALYTICS_AUTH_KEY = 'coin_v2_analytics_auth';

// ── ReXeR backend integration ──────────────────────────────────────────────
// Tracking → POST {API_BASE}/v1/track (publishable key, X-ReXeR-Key header).
// Read-back → GET {API_BASE}/v1/pages/{PAGE_ID}/analytics/{summary,blocks}
// via the same-origin /api/rexer proxy (needs a logged-in ReXeR cookie session).
export const REXER_API_BASE =
  process.env.NEXT_PUBLIC_REXER_API_BASE || 'https://rexerai.tekupsoftware.com';

// REQUIRED: slug or UUID of this page in ReXeR. v2 is a distinct landing design
// from `mintcoin`, so it tracks under its own page id (separate block keys).
// 👇 EDIT THIS LINE (or set NEXT_PUBLIC_REXER_PAGE_ID).
const PAGE_ID_FALLBACK = 'the-jack-pine-1-kg-landing-v2';
export const REXER_PAGE_ID =
  process.env.NEXT_PUBLIC_REXER_PAGE_ID || PAGE_ID_FALLBACK;

// Publishable tracking key (pk_live_…) — write-only, scopes events to the brand
// & passes anti-spam. Minted by staff/admin in the ReXeR portal (shown once).
// 👇 PASTE YOUR pk_live_ KEY HERE (or set NEXT_PUBLIC_REXER_TRACKING_KEY).
const TRACKING_KEY_FALLBACK = 'pk_live_ZlNfRIW-nFVwjDpe23e6SVKYDM_NZreX';
export const REXER_TRACKING_KEY =
  process.env.NEXT_PUBLIC_REXER_TRACKING_KEY || TRACKING_KEY_FALLBACK;

// Anchored to the unique class on each v2 <section>, in page-scroll order.
export const ANALYTICS_BLOCKS: AnalyticsBlock[] = [
  { id: 'emblem', label: 'Emblem', selector: '.emblem' },
  { id: 'manifesto', label: 'Manifesto', selector: '.manifesto' },
  { id: 'works', label: 'Works', selector: '.works' },
  { id: 'services', label: 'Services', selector: '.services' },
  { id: 'process', label: 'Process', selector: '.process' },
  {
    id: 'cta',
    label: 'Reserve / CTA',
    selector: '.cta',
    // Named CTAs in the reserve block (cta_id = data-cta-id).
    ctas: [
      { id: 'buy-online', label: 'Buy online directly' },
      { id: 'reserve-submit', label: 'Submit reservation form' },
    ],
  },
];
