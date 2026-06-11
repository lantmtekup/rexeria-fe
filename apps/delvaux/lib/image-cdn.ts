// Centralised CDN base for the Manolo Blahnik product images.
// Originals were 220KB-1MB JPGs/PNGs that decoded to 5-12MB GPU buffers,
// causing 20-30ms paint spikes when the user scrolled them into view.
// Pipeline: sips resize to 1600px max → cwebp q78 with alpha_q80 →
// upload to s3://epictower-media/delvaux-nextjs/. WebP-encoded versions
// total ~528KB across all 7 product images (vs 3.3MB originals).
//
// CloudFront caches with 1y immutable headers, so first-paint after the
// initial page-load is served from edge with no decode pressure.
const CDN = 'https://d10zufojjcedud.cloudfront.net/delvaux-nextjs';

export const IMG = {
  heroStorefront: `${CDN}/hero-storefront.webp`,
  heroStorefrontMobile: `${CDN}/hero-storefront-mobile.webp`,
  manoloPair: `${CDN}/manolo-pair.webp`,
  manoloShoeSide: `${CDN}/manolo-shoe-side.webp`,
  manoloShoeTransparent: `${CDN}/manolo-shoe-transparent.webp`,
  manoloLegs: `${CDN}/manolo-legs.webp`,
  manoloBoutique: `${CDN}/manolo-boutique.webp`,
  // Logo kept as local PNG — original is 4KB, smaller than any WebP encoding.
  manoloLogo: '/manolo-logo.png',
};
