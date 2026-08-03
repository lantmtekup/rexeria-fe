import { cn } from '@/lib/cn';

const RowSkeleton = () => (
  <div className='flex items-center gap-3.5 border-b border-[var(--pv2-hair)] px-3.5 py-3 last:border-b-0'>
    <div className='size-[15px] shrink-0 animate-pulse rounded-[5px] bg-[var(--pv2-canvas)]' />
    <div className='size-[38px] shrink-0 animate-pulse rounded-[8px] bg-[var(--pv2-canvas)]' />
    <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
      <div className='h-3 w-2/5 animate-pulse rounded bg-[var(--pv2-canvas)]' />
      <div className='h-2.5 w-1/4 animate-pulse rounded bg-[var(--pv2-canvas)]' />
    </div>
    <div className='hidden h-5 w-16 shrink-0 animate-pulse rounded-full bg-[var(--pv2-canvas)] md:block' />
    <div className='hidden h-3 w-14 shrink-0 animate-pulse rounded bg-[var(--pv2-canvas)] lg:block' />
    <div className='hidden h-3 w-12 shrink-0 animate-pulse rounded bg-[var(--pv2-canvas)] lg:block' />
    <div className='hidden h-1.5 w-20 shrink-0 animate-pulse rounded-full bg-[var(--pv2-canvas)] xl:block' />
    <div className='hidden h-3 w-12 shrink-0 animate-pulse rounded bg-[var(--pv2-canvas)] xl:block' />
  </div>
);

/** Full-page skeleton matching ProductWorkspace layout (header → tabs → toolbar → table). */
export const ProductPageSkeleton = () => {
  return (
    <div className='flex min-h-0 flex-col' aria-busy aria-live='polite'>
      <div className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0 flex-1 space-y-2'>
            <div className='h-7 w-40 animate-pulse rounded bg-[var(--pv2-canvas)] md:h-8' />
            <div className='h-4 w-full max-w-[52ch] animate-pulse rounded bg-[var(--pv2-canvas)]' />
          </div>
          <div className='flex shrink-0 items-center gap-2 pb-0.5'>
            <div className='h-9 w-[92px] animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)]' />
            <div className='h-9 w-[132px] animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)]' />
          </div>
        </div>
      </div>

      <div className='bg-[var(--pv2-paper)]'>
        <div className='mx-auto flex w-full gap-4 px-5 py-2.5 md:px-8'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='h-5 w-[86px] animate-pulse rounded bg-[var(--pv2-canvas)]'
            />
          ))}
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        <div className='mb-3.5 flex flex-wrap items-center gap-2'>
          <div className='h-[34px] min-w-[250px] flex-1 animate-pulse rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]' />
          <div className='h-[34px] w-[150px] animate-pulse rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]' />
          <div className='h-[34px] w-[150px] animate-pulse rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]' />
          <div className='ml-auto h-9 w-[74px] animate-pulse rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]' />
        </div>

        <div
          className={cn(
            'overflow-hidden rounded-[var(--pv2-r)]',
            'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
          )}
        >
          <div className='h-[38px] border-b border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]' />
          {Array.from({ length: 6 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
