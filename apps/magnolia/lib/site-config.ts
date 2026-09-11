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
  // The opening beat's length is no longer a number: it holds until the hero film's frames
  // finish decoding (see components/shared/preloader.tsx). Only the mark's size is a choice.
  preloader: { markSize: 280 },
};
