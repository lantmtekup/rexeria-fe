export const siteConfig = {
  name: 'The Magnolia',
  description: 'The Journey of Timeless Value — Khai Sơn City, Hà Nội',
  // "none": CSS scroll-snap and Lenis fight each other — the browser re-targets the scroll
  // position mid-glide, which reads as the page grabbing. Smooth scroll replaces what snap
  // was there for. Set back to "proximity" to restore the original behaviour.
  scrollSnap: 'none' as 'proximity' | 'mandatory' | 'none',
  cursorGlow: true,
  promoVideoUrl: '',
  interactiveTour: {
    embedUrl:
      'https://studio.realhorizons.ai/tours/df3f63d0-0985-45de-8394-f1fadd60b1e9/view',
    externalUrl:
      'https://studio.realhorizons.ai/tours/df3f63d0-0985-45de-8394-f1fadd60b1e9',
    previewSrc: '/images/assets/tour/preview.webp',
    mountRootMargin: '50% 0px',
    readyTimeoutMs: 15000,
  },
  // minDuration is the opening beat's hold. The original 1400 ms is too short to read;
  // the staged entrance in components/shared/preloader.tsx needs ~1.45 s before the progress
  // rule even starts. Lower this to shorten the intro, raise it to let it breathe more.
  preloader: { markSize: 140, spinDuration: 14, minDuration: 3200 },
};
