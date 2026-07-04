/**
 * Badge dọc teal "W. Nominee" (award) neo mép phải màn — mirror gốc.
 */
export function AwardBadge() {
  return (
    <div className='fixed top-1/2 right-0 z-40 hidden -translate-y-1/2 flex-col items-center overflow-hidden rounded-l-md bg-[var(--color-brand-teal,#3bb6a6)] text-white shadow-md sm:flex'>
      <span className='px-2 pt-2 pb-1 text-sm font-semibold'>W.</span>
      <span
        className='px-2 pb-3 text-[10px] tracking-[0.18em] uppercase'
        style={{ writingMode: 'vertical-rl' }}
      >
        Nominee
      </span>
    </div>
  );
}
