'use client';

import * as React from 'react';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/atoms/dialog';

export interface ApiUrlDialogProps {
  trigger: React.ReactNode;
  onContinue?: (url: string) => void;
}

/** Small "Input API url" dialog — Product Information "API" trigger. */
function ApiUrlDialog({ trigger, onContinue }: ApiUrlDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue?.(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-sm p-6' showCloseButton={false}>
        <form onSubmit={submit} className='flex flex-col gap-4'>
          <div className='border-border bg-background rounded-xl border px-4 py-3'>
            <div className='text-content-muted text-xs font-semibold'>URL</div>
            <input
              type='url'
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder='Input API url'
              required
              className='text-foreground placeholder:text-content-muted w-full bg-transparent text-sm outline-none'
            />
          </div>
          <Button type='submit' variant='primary' size='md'>
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ApiUrlDialog };
