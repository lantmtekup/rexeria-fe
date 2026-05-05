'use client';

import * as React from 'react';
import { Pencil, Plus } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/atoms/dialog';

export interface AddFeatureDialogProps {
  trigger: React.ReactNode;
  /** If true, dialog shows a "Continue" button; else "Apply". Figma distinguishes
   * the 01 variant (Continue) and the 02 variant (Apply). */
  mode?: 'continue' | 'apply';
  onSubmit?: (values: {
    name: string;
    rows: { label: string; description: string }[];
  }) => void;
}

function AddFeatureDialog({
  trigger,
  mode = 'continue',
  onSubmit,
}: AddFeatureDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [rows, setRows] = React.useState([{ label: '', description: '' }]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ name, rows });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-md p-6' showCloseButton={false}>
        <form onSubmit={submit} className='flex flex-col gap-3'>
          <div className='bg-muted flex items-center gap-2 rounded-lg px-4 py-3'>
            <input
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Feature name'
              className='placeholder:text-content-muted flex-1 bg-transparent text-sm font-medium outline-none'
            />
            <Pencil className='text-content-muted size-3.5' />
          </div>

          {rows.map((r, i) => (
            <div key={i} className='grid grid-cols-2 gap-2'>
              <input
                type='text'
                value={r.label}
                placeholder='Label'
                onChange={e =>
                  setRows(prev =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, label: e.target.value } : x
                    )
                  )
                }
                className='border-border bg-background placeholder:text-content-muted rounded-lg border px-4 py-2.5 text-sm outline-none'
              />
              <input
                type='text'
                value={r.description}
                placeholder='Description Text'
                onChange={e =>
                  setRows(prev =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, description: e.target.value } : x
                    )
                  )
                }
                className='border-border bg-background placeholder:text-content-muted rounded-lg border px-4 py-2.5 text-sm outline-none'
              />
            </div>
          ))}

          <div className='flex items-center gap-2 pt-2'>
            <Button
              type='button'
              variant='pill-light'
              size='sm'
              onClick={() =>
                setRows(prev => [...prev, { label: '', description: '' }])
              }
            >
              <Plus className='size-3.5' /> Add more
            </Button>
            <Button
              type='submit'
              variant='primary'
              size='sm'
              className='flex-1'
            >
              {mode === 'continue' ? 'Continue' : 'Apply'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { AddFeatureDialog };
