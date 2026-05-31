// All product imagery served from s3://epictower-media/coin-nextjs/ via
// CloudFront with 1y immutable cache headers.
// WebP-encoded: 14MB original combined PNG/JPG → 3.1MB WebP (78% smaller).
// Source: mint.ca official 1kg gold coin photos (252469) + Wikimedia
// Tom Thomson "Jack Pine" painting.
const CDN = 'https://d10zufojjcedud.cloudfront.net/coin-nextjs';

export const IMG = {
  heroStorefront: `${CDN}/hero-coin.webp`,
  heroStorefrontMobile: `${CDN}/hero-coin.webp`,
  coinReverse: `${CDN}/coin-reverse.webp`,
  coinObverse: `${CDN}/coin-obverse.webp`,
  coinPackaging: `${CDN}/coin-packaging.webp`,
  painting: `${CDN}/jackpine-painting.webp`,
  // Legacy aliases kept for older usages that point at angle-view stills —
  // map both to the front reverse since hi-res angle shots not available
  // for the gold variant.
  coinRevLeft: `${CDN}/coin-reverse.webp`,
  coinRevRight: `${CDN}/coin-reverse.webp`,
};
