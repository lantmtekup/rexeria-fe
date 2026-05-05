'use client';

import * as React from 'react';
import { ArrowLeft, BarChart3, ChevronDown, Edit3, MapPin } from 'lucide-react';

import { IconButton } from '@/components/atoms/icon-button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/atoms/dialog';
import { cn } from '@/lib/cn';

export interface CampaignAnalyticsDialogProps {
  trigger: React.ReactNode;
  campaignName?: string;
}

type TopMetric = {
  label: string;
  value: string;
  spark: number[];
};

const TOP_METRICS: TopMetric[] = [
  { label: 'Views', value: '00,0', spark: [4, 2, 3, 5, 8, 6, 9] },
  { label: 'Subscriber', value: '00,0', spark: [2, 3, 5, 4, 6, 7, 8] },
  { label: 'Reach', value: '00,0', spark: [3, 5, 4, 6, 8, 7, 9] },
];

type OverviewItem = { label: string; value: string };
const OVERVIEW: OverviewItem[] = [
  { label: 'Sessions', value: '00,0' },
  { label: 'User', value: '00,0' },
  { label: 'Page Views', value: '00,0' },
  { label: 'Pages/Session', value: '00,0' },
  { label: 'Avg. Session Duration', value: '00,0' },
  { label: 'Bounce Rate', value: '00,0' },
  { label: 'New Sessions', value: '00,0' },
];

function Spark({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`)
    .join(' ');
  return (
    <svg
      viewBox='0 0 100 100'
      preserveAspectRatio='none'
      className='text-primary h-12 w-full'
    >
      <polyline
        points={points}
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
      />
      <polyline
        points={`0,100 ${points} 100,100`}
        fill='currentColor'
        opacity='0.1'
      />
    </svg>
  );
}

function TimeSelect({ value = 'Today' }: { value?: string }) {
  return (
    <button
      type='button'
      className='rounded-pill text-foreground inline-flex items-center gap-1 bg-neutral-100 px-3 py-1 text-xs font-semibold hover:bg-neutral-200'
    >
      {value} <ChevronDown className='size-3.5' />
    </button>
  );
}

function CampaignAnalyticsDialog({
  trigger,
  campaignName = 'DELVAUX',
}: CampaignAnalyticsDialogProps) {
  const [tab, setTab] = React.useState<'edit' | 'analytics'>('analytics');
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className='max-w-5xl gap-0 p-0 sm:max-w-5xl'
        showCloseButton={false}
      >
        {/* Header */}
        <div className='border-border flex items-center justify-between border-b px-6 py-4'>
          <div className='flex items-center gap-3'>
            <IconButton aria-label='Back' variant='default' size='sm'>
              <ArrowLeft />
            </IconButton>
            <h2 className='text-xl font-bold tracking-[-0.02em]'>
              {campaignName}
            </h2>
          </div>
          <div className='rounded-pill inline-flex items-center gap-1 bg-neutral-100 p-1'>
            <button
              onClick={() => setTab('edit')}
              className={cn(
                'rounded-pill inline-flex h-7 cursor-pointer items-center gap-1.5 px-3 text-xs font-semibold',
                tab === 'edit'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-content-muted'
              )}
            >
              <Edit3 className='size-3.5' /> Edit
            </button>
            <button
              onClick={() => setTab('analytics')}
              className={cn(
                'rounded-pill inline-flex h-7 cursor-pointer items-center gap-1.5 px-3 text-xs font-semibold',
                tab === 'analytics'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-content-muted'
              )}
            >
              <BarChart3 className='size-3.5' /> Analytics
            </button>
          </div>
        </div>

        {/* Body */}
        {tab === 'analytics' ? (
          <div className='grid grid-cols-[1fr_260px] gap-4 p-6'>
            {/* Left — metrics */}
            <div className='flex flex-col gap-4'>
              <div className='grid grid-cols-3 gap-3'>
                {TOP_METRICS.map(m => (
                  <div
                    key={m.label}
                    className='border-border bg-background rounded-xl border p-4'
                  >
                    <div className='flex items-start justify-between'>
                      <div>
                        <p className='text-content-muted text-xs font-semibold'>
                          {m.label}
                        </p>
                        <p className='text-2xl font-bold tracking-[-0.02em]'>
                          {m.value}
                        </p>
                      </div>
                      <TimeSelect />
                    </div>
                    <Spark data={m.spark} />
                    <div className='text-content-muted mt-1 flex justify-between text-[10px]'>
                      <span>01:00</span>
                      <span>02:00</span>
                      <span>03:00</span>
                      <span>04:00</span>
                      <span>05:00</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className='border-border bg-background rounded-xl border p-4'>
                <div className='mb-3 flex items-center justify-between'>
                  <p className='text-sm font-semibold'>Overview</p>
                  <div className='rounded-pill inline-flex items-center gap-1 bg-neutral-100 p-1 text-xs'>
                    {['Today', 'Yesterday', 'Last month', 'Last year'].map(
                      (l, i) => (
                        <button
                          key={l}
                          className={cn(
                            'rounded-pill inline-flex h-6 cursor-pointer items-center px-3 font-semibold',
                            i === 0
                              ? 'text-neutral-0 bg-neutral-900'
                              : 'text-content-muted'
                          )}
                        >
                          {l}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div className='grid grid-cols-4 gap-2'>
                  {OVERVIEW.map(o => (
                    <div
                      key={o.label}
                      className='border-border bg-background rounded-lg border p-3'
                    >
                      <p className='text-content-muted text-[10px] font-semibold'>
                        {o.label}
                      </p>
                      <p className='text-lg font-bold tracking-[-0.02em]'>
                        {o.value}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Chart */}
                <div className='relative mt-4 h-28 w-full'>
                  <div className='text-content-muted absolute inset-y-0 left-0 flex flex-col justify-between text-[10px]'>
                    <span>500</span>
                    <span>400</span>
                    <span>300</span>
                    <span>200</span>
                    <span>100</span>
                    <span>0</span>
                  </div>
                  <svg
                    viewBox='0 0 100 40'
                    preserveAspectRatio='none'
                    className='text-primary ml-8 h-full w-[calc(100%-2rem)]'
                  >
                    <polyline
                      points='0,40 100,40'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      fill='none'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right — country */}
            <div className='border-border bg-background rounded-xl border p-4'>
              <div className='flex items-center justify-between'>
                <p className='text-sm font-semibold'>Country</p>
                <TimeSelect />
              </div>
              <p className='mt-2 text-2xl font-bold tabular-nums'>00</p>
              <div className='text-content-muted mt-6 flex flex-col items-center gap-2 text-center text-xs'>
                <MapPin className='size-8 text-neutral-300' />
                <p>
                  No users from any country
                  <br />
                  have accessed your website.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-content-muted flex h-[400px] items-center justify-center text-sm'>
            Edit mode placeholder — template editor goes here.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { CampaignAnalyticsDialog };
