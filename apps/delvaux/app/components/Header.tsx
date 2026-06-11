// Static, server-renderable. No 'use client' needed.
//
// Fixed top header with a soft white-fade gradient backdrop. The gradient
// dissolves into transparent toward the bottom edge so the logo reads
// cleanly against any scrolling content below — without the heavy slab look
// of a solid bar. Mirrors the Delvaux reference's always-visible top
// branding while preventing the "logo punching through paragraph text"
// overlap that plain transparent fixed headers produce.
export default function Header() {
  return (
    <header
      className='pointer-events-none fixed top-0 right-0 left-0 z-50 flex items-center justify-center px-6 pt-5 pb-6'
      style={{
        // Solid white block with a soft edge fade. Backdrop-filter REMOVED —
        // it forced a GPU re-rasterisation of the area under the header on
        // every scroll frame (because content behind shifts each tick),
        // producing the slow-scroll micro-jank ("khựng nhẹ"). The opaque
        // white gradient already prevents content bleed-through, so the
        // blur was visual sugar at a heavy paint cost.
        background:
          'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 70%, rgba(255,255,255,0) 100%)',
      }}
    >
      <a
        href=''
        className='brand-logo pointer-events-auto'
        aria-label='MANOLO BLAHNIK'
      >
        {/* h-6 on mobile (was h-8) so the logo doesn't graze the viewport
            edges on 393px screens. Desktop unchanged at h-10. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/manolo-logo.png'
          alt='MANOLO BLAHNIK'
          className='h-6 md:h-10'
        />
      </a>
    </header>
  );
}
