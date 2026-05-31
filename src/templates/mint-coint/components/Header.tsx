// Fixed top header. Transparent — sits directly over the hero image so the
// product photo runs edge-to-edge. Soft drop-shadow keeps the logo legible
// against varying hero backgrounds.
export default function Header() {
  return (
    <header className='pointer-events-none fixed top-0 right-0 left-0 z-50 flex items-center justify-start px-6 pt-5 pb-3 md:px-10'>
      <a
        href=''
        className='brand-logo pointer-events-auto'
        aria-label='Royal Canadian Mint'
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/templates/mint-coint/rcm-logo.svg'
          alt='Royal Canadian Mint'
          className='h-12 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] md:h-16'
        />
      </a>
    </header>
  );
}
