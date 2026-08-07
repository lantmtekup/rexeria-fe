/**
 * Branded abstract cover for a record with no thumbnail of its own.
 *
 * `thumbnail_url` is empty on most rows in practice, so this is the common path
 * rather than a fallback — it has to read as a deliberate cover, not as a
 * missing image. Low contrast on purpose: a grid of these sits behind real
 * content and should recede.
 *
 * Two wireframes, because the two things are shaped differently: a page is a
 * layout (copy column beside a media well), a block is one section (a media
 * tile beside its own copy). Same drawing Exchange's `ListingCover` makes, so
 * the two grids stay recognisably the same product.
 */
export const GeneratedPageThumb = ({
  variant = 'page',
}: {
  variant?: 'page' | 'block';
} = {}) => (
  <div
    className='absolute inset-0 overflow-hidden bg-(--pv2-electric-soft)'
    aria-hidden
  >
    <div className='absolute inset-x-[13%] top-[13%] bottom-[17%] overflow-hidden rounded-[10px] border border-white/70 bg-(--pv2-paper) shadow-[0_12px_30px_rgba(56,98,255,0.14)]'>
      <div className='flex h-5 items-center border-b border-(--pv2-hair) bg-(--pv2-canvas) px-2.5'>
        <span className='h-1 w-8 rounded-full bg-(--pv2-slate-300)' />
      </div>

      {variant === 'page' ? (
        <div className='grid h-[calc(100%-1.25rem)] grid-cols-[1.15fr_0.85fr] gap-2.5 p-3'>
          <div className='flex min-w-0 flex-col justify-center'>
            <span className='h-1.5 w-8 rounded-full bg-(--pv2-electric)/35' />
            <span className='mt-1 h-2.5 w-4/5 rounded-sm bg-(--pv2-ink)/25' />
            <span className='mt-1 h-1.5 w-3/5 rounded-full bg-(--pv2-hair)' />
            <span className='mt-2.5 h-4 w-14 rounded-[5px] bg-(--pv2-electric)' />
          </div>
          <div className='relative overflow-hidden rounded-[7px] bg-(--pv2-electric-soft)' />
        </div>
      ) : (
        <div className='flex h-[calc(100%-1.25rem)] items-center p-3'>
          <div className='grid w-full grid-cols-[0.82fr_1.18fr] gap-2.5 rounded-md bg-(--pv2-electric-soft) p-2.5'>
            <div className='aspect-square rounded-[6px] bg-(--pv2-electric)/25' />
            <div className='flex min-w-0 flex-col justify-center py-1'>
              <span className='h-2 w-5/6 rounded-sm bg-(--pv2-ink)/25' />
              <span className='mt-2 h-1.5 w-full rounded-full bg-(--pv2-slate-300)' />
              <span className='mt-2.5 h-4 w-12 rounded-[5px] bg-(--pv2-electric)' />
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
