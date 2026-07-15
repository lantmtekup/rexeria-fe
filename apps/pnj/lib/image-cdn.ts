// Product imagery served from s3://epictower-media/pnj-nextjs/ via
// CloudFront with 1y immutable cache headers.
// Hero frame-sequence is local: /frames + /frames-mobile (`yarn gen:frames`).
const CDN = 'https://d10zufojjcedud.cloudfront.net/coin-nextjs';

export const IMG = {
  heroStorefront: `/bg-hero.png`,
  heroStorefrontMobile: `/bg-hero.png`,
  // Citizen L Arcly stills from the hero frame sequence (accurate product).
  watchDial: '/frames/frame-001.webp',
  watchDialAlt: '/frames/frame-020.webp',
  watchProfile: '/frames/frame-038.webp',
  watchProfileAlt: '/frames/frame-055.webp',
  watchCaseback: '/frames/frame-076.webp',
  // Legacy coin CDN — kept for any residual references outside the watch flow.
  coinReverse: `${CDN}/coin-reverse.webp`,
  coinObverse: `${CDN}/coin-obverse.webp`,
  coinPackaging: `${CDN}/coin-packaging.webp`,
  painting: `${CDN}/jackpine-painting.webp`,
  coinRevLeft: `${CDN}/coin-reverse.webp`,
  coinRevRight: `${CDN}/coin-reverse.webp`,
};
