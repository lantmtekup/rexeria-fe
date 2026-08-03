import { ListingCardSkeleton } from '@/components/organisms/portal-v2/exchange/ListingCardSkeleton';
import { cn } from '@/lib/cn';

const FeaturedCardSkeleton = () => {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-[var(--pv2-r)]',
        'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
      )}
      aria-hidden
    >
      <div className='relative flex aspect-[16/10] w-full flex-col overflow-hidden border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='h-[38%] animate-pulse bg-[var(--pv2-electric-soft)]' />
        <div className='flex flex-1 flex-col gap-2 px-4 py-3'>
          <div className='h-2 w-3/5 animate-pulse rounded-sm bg-[var(--pv2-slate-300)]' />
          <div className='h-2 w-2/5 animate-pulse rounded-sm bg-[var(--pv2-hair)]' />
          <div className='mt-auto h-7 w-24 animate-pulse rounded-[6px] bg-[var(--pv2-electric)]/20' />
        </div>
      </div>
      <div className='flex flex-col gap-1.5 px-3.5 pt-3 pb-3.5'>
        <div className='h-3.5 w-3/4 animate-pulse rounded bg-[var(--pv2-canvas)]' />
        <div className='h-3 w-1/2 animate-pulse rounded bg-[var(--pv2-canvas)]' />
        <div className='h-5 w-24 animate-pulse rounded-full bg-[var(--pv2-canvas)]' />
      </div>
    </div>
  );
};

/** Full-page skeleton matching ExchangeWorkspace layout (header → featured → tabs → filters → grid). */
export const ExchangePageSkeleton = () => {
  return (
    <div className='flex min-h-0 flex-col' aria-busy aria-live='polite'>
      <div className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0 flex-1 space-y-2'>
            <div className='h-7 w-40 animate-pulse rounded bg-[var(--pv2-canvas)] md:h-8' />
            <div className='h-4 w-full max-w-[62ch] animate-pulse rounded bg-[var(--pv2-canvas)]' />
            <div className='h-4 w-2/3 max-w-[42ch] animate-pulse rounded bg-[var(--pv2-canvas)]' />
          </div>
          <div className='h-9 w-[132px] shrink-0 animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)]' />
        </div>
      </div>

      <div className='mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8'>
        <section className='mb-[22px]'>
          <div className='grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3.5'>
            {Array.from({ length: 3 }).map((_, i) => (
              <FeaturedCardSkeleton key={i} />
            ))}
          </div>
        </section>

        <div className='sticky top-0 z-10 -mx-5 mb-3.5 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
          <div className='flex gap-2 py-1'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='h-9 w-[108px] animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-paper)]'
              />
            ))}
          </div>
        </div>

        <div className='mb-3.5 flex flex-wrap items-center gap-2'>
          <div className='h-10 min-w-[250px] flex-1 animate-pulse rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]' />
          <div className='h-3 w-16 animate-pulse rounded bg-[var(--pv2-canvas)]' />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`obj-${i}`}
              className='h-8 w-16 animate-pulse rounded-full bg-[var(--pv2-paper)]'
            />
          ))}
          <div className='h-3 w-12 animate-pulse rounded bg-[var(--pv2-canvas)]' />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`price-${i}`}
              className='h-8 w-16 animate-pulse rounded-full bg-[var(--pv2-paper)]'
            />
          ))}
        </div>

        <div className='mt-4 grid grid-cols-[repeat(auto-fill,minmax(244px,1fr))] gap-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
