// Analytics overlay config for the Coin landing. Metrics come LIVE from ReXeR
// (no mock data). Each block is anchored to a DOM node via `selector`
// (getBoundingClientRect), so the overlay never wraps section markup — keeps
// Lenis/GSAP pinning intact.

export interface AnalyticsBlock {
  id: string;
  label: string;
  selector: string; // CSS selector of the anchor element on the page
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
const PAGE_ID_FALLBACK = 'mintcoin';
export const REXER_PAGE_ID =
  process.env.NEXT_PUBLIC_REXER_PAGE_ID || PAGE_ID_FALLBACK;

// Publishable tracking key (pk_live_…) — write-only, scopes events to the brand
// & passes anti-spam. Minted by staff/admin in the ReXeR portal (shown once).
// 👇 PASTE YOUR pk_live_ KEY HERE (or set NEXT_PUBLIC_REXER_TRACKING_KEY).
const TRACKING_KEY_FALLBACK = 'pk_live_cByX98GnD7it7PvSA8LmNQXYFcrJWjzF';
export const REXER_TRACKING_KEY =
  process.env.NEXT_PUBLIC_REXER_TRACKING_KEY || TRACKING_KEY_FALLBACK;

export const ANALYTICS_BLOCKS: AnalyticsBlock[] = [
  { id: 'hero', label: 'Hero Intro', selector: '.hero' },
  { id: 'details', label: 'Details', selector: '#description' },
  { id: 'discover', label: 'Product Detail · Reverse', selector: '#discover' },
  {
    id: 'craftsmanship',
    label: 'Product Detail · Obverse',
    selector: '#craftsmanship',
  },
  { id: 'information', label: 'Variants', selector: '#information' },
  { id: 'sku', label: 'SKU / Buy', selector: '#sku' },
];
