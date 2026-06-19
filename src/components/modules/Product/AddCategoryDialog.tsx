'use client';

import * as React from 'react';
import { Pencil, Plus } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/atoms/dialog';

export interface AddCategoryDialogProps {
  trigger: React.ReactNode;
  onApply?: (values: {
    categoryName: string;
    features: { label: string; description: string }[];
  }) => void;
}

type Feature = { label: string; description: string };

/**
 * "Category name" dialog with nested Feature rows (Label + Description) —
 * used by Product Information "+ Add new category" flow.
 */
function AddCategoryDialog({ trigger, onApply }: AddCategoryDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState('');
  const [features, setFeatures] = React.useState<Feature[]>([
    { label: '', description: '' },
  ]);

  const addMore = () =>
    setFeatures(prev => [...prev, { label: '', description: '' }]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply?.({ categoryName: category, features });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-md p-6' showCloseButton={false}>
        <form onSubmit={submit} className='flex flex-col gap-4'>
          <div className='flex items-center gap-2'>
            <h3 className='flex-1 text-lg font-semibold tracking-[-0.02em]'>
              Category name
            </h3>
            <Pencil className='text-content-muted size-4' />
          </div>

          <input
            type='text'
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder='Feature name'
            className='bg-muted placeholder:text-content-muted rounded-lg px-4 py-3 text-sm font-medium outline-none'
          />

          {features.map((f, i) => (
            <div key={i} className='grid grid-cols-2 gap-2'>
              <input
                type='text'
                value={f.label}
                placeholder='Label'
                onChange={e =>
                  setFeatures(prev =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, label: e.target.value } : x
                    )
                  )
                }
                className='border-border bg-background placeholder:text-content-muted rounded-lg border px-4 py-2.5 text-sm outline-none'
              />
              <input
                type='text'
                value={f.description}
                placeholder='Description Text'
                onChange={e =>
                  setFeatures(prev =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, description: e.target.value } : x
                    )
                  )
                }
                className='border-border bg-background placeholder:text-content-muted rounded-lg border px-4 py-2.5 text-sm outline-none'
              />
            </div>
          ))}

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='pill-light'
              size='sm'
              onClick={addMore}
            >
              <Plus className='size-3.5' /> Add more
            </Button>
            <Button
              type='submit'
              variant='primary'
              size='sm'
              className='flex-1'
            >
              Apply
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { AddCategoryDialog };
