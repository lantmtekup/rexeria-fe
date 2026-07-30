const AssetCardSkeleton = () => {
  return (
    <div
      className='flex flex-col overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
      aria-hidden
    >
      <div className='h-[132px] animate-pulse bg-[var(--pv2-canvas)]' />
      <div className='flex flex-col gap-1 px-3 py-2.5'>
        <div className='h-3 w-4/5 animate-pulse rounded bg-[var(--pv2-canvas)]' />
        <div className='h-2.5 w-1/2 animate-pulse rounded bg-[var(--pv2-hair)]' />
      </div>
    </div>
  );
};

/** Full-page skeleton matching MediaWorkspace layout (header → tabs → filters → grid). */
export const MediaPageSkeleton = () => {
  return (
    <div className='flex min-h-0 flex-col' aria-busy aria-live='polite'>
      <div className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0 flex-1 space-y-2'>
            <div className='h-7 w-40 animate-pulse rounded bg-[var(--pv2-canvas)] md:h-8' />
            <div className='h-4 w-full max-w-[48ch] animate-pulse rounded bg-[var(--pv2-canvas)]' />
          </div>
          <div className='flex shrink-0 items-center gap-2 pb-0.5'>
            <div className='h-9 w-[104px] animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)]' />
            <div className='h-9 w-[112px] animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-electric-soft)]' />
          </div>
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        <div className='sticky top-0 z-10 -mx-5 mb-3.5 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
          <div className='flex gap-2 py-1'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='h-9 w-[92px] animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-paper)]'
              />
            ))}
          </div>
        </div>

        <div className='mb-3.5 flex flex-wrap items-center gap-2'>
          <div className='h-10 min-w-[220px] flex-1 animate-pulse rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]' />
          <div className='h-8 w-20 animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-paper)]' />
          <div className='h-8 w-32 animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-paper)]' />
          <div className='ml-auto h-8 w-[68px] animate-pulse rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]' />
        </div>

        <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5'>
          {Array.from({ length: 10 }).map((_, i) => (
            <AssetCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
