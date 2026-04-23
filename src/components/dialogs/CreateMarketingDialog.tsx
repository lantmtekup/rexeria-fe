'use client';

import * as React from 'react';
import { Pencil, Plus } from 'lucide-react';

import { Avatar, AvatarStack } from '@/components/atoms/avatar';
import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/atoms/dialog';
import { StatusDot } from '@/components/atoms/status-dot';
import { cn } from '@/lib/cn';

export interface CreateMarketingDialogProps {
  /** Triggering element — typically a "Create Marketing" button */
  trigger: React.ReactNode;
  onCreate?: (values: {
    name: string;
    campaigns: string[];
    status: 'active' | 'stop';
  }) => void;
}

const MEMBERS = [
  { name: 'Zayden Jarvis' },
  { name: 'Kailee Rogers' },
  { name: 'Ember Mooney' },
  { name: 'Lila Tran' },
];

function CreateMarketingDialog({
  trigger,
  onCreate,
}: CreateMarketingDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [campaigns, setCampaigns] = React.useState<string[]>(['']);
  const [status, setStatus] = React.useState<'active' | 'stop'>('active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate?.({ name, campaigns: campaigns.filter(Boolean), status });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-md p-6' showCloseButton={false}>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <div className='flex items-center justify-between'>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='text-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200'
              aria-label='Back'
            >
              ‹
            </button>
            <h3 className='text-lg font-semibold tracking-[-0.02em]'>
              Create Marketing
            </h3>
            <button
              type='button'
              aria-label='Info'
              className='border-border text-content-muted inline-flex size-6 cursor-pointer items-center justify-center rounded-full border'
            >
              i
            </button>
          </div>

          {/* Marketing name */}
          <div className='bg-muted flex items-center gap-2 rounded-lg px-4 py-3'>
            <input
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Marketing name'
              className='placeholder:text-content-muted flex-1 bg-transparent text-sm font-medium outline-none'
            />
            <Pencil className='text-content-muted size-3.5' />
            <button
              type='button'
              aria-label='More'
              className='text-content-muted'
            >
              ⋮
            </button>
          </div>

          {/* Member */}
          <div>
            <div className='mb-1.5 text-sm font-semibold'>Member</div>
            <div className='flex items-center gap-2'>
              {MEMBERS.slice(0, 3).map(m => (
                <div
                  key={m.name}
                  className='rounded-pill border-border bg-background flex items-center gap-1 border py-0.5 pr-2 pl-1'
                >
                  <Avatar name={m.name} size='xs' />
                  <span className='text-xs font-medium'>{m.name}</span>
                </div>
              ))}
              <AvatarStack avatars={MEMBERS.slice(3)} size='xs' max={3} />
            </div>
          </div>

          {/* Campaign */}
          <div>
            <div className='mb-1.5 text-sm font-semibold'>Campaign</div>
            <div className='flex flex-col gap-2'>
              {campaigns.map((c, i) => (
                <div
                  key={i}
                  className='border-border bg-background flex items-center gap-2 rounded-lg border px-4 py-2.5'
                >
                  <input
                    type='text'
                    value={c}
                    onChange={e =>
                      setCampaigns(prev =>
                        prev.map((v, idx) => (idx === i ? e.target.value : v))
                      )
                    }
                    placeholder='Campaign name'
                    className='placeholder:text-content-muted flex-1 bg-transparent text-sm outline-none'
                  />
                  <Pencil className='text-content-muted size-3.5' />
                </div>
              ))}
              <button
                type='button'
                onClick={() => setCampaigns(prev => [...prev, ''])}
                className='rounded-pill text-neutral-0 inline-flex h-8 w-fit cursor-pointer items-center gap-1 bg-neutral-900 px-3 text-xs font-semibold hover:bg-neutral-800'
              >
                <Plus className='size-3.5' /> Add more
              </button>
            </div>
          </div>

          {/* Status */}
          <div>
            <div className='mb-1.5 text-sm font-semibold'>Status</div>
            <div className='grid grid-cols-2 gap-2'>
              {(['active', 'stop'] as const).map(s => (
                <button
                  key={s}
                  type='button'
                  onClick={() => setStatus(s)}
                  className={cn(
                    'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-medium capitalize',
                    status === s
                      ? 'border-foreground bg-background'
                      : 'border-border bg-background text-content-muted'
                  )}
                >
                  <StatusDot tone={s === 'active' ? 'success' : 'danger'} />
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button type='submit' variant='primary' size='md' className='w-full'>
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { CreateMarketingDialog };
