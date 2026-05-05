'use client';

import * as React from 'react';
import { ArrowLeft, Filter, Plus, Search } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/atoms/dialog';
import { IconButton } from '@/components/atoms/icon-button';
import { Tag } from '@/components/atoms/tag';
import { cn } from '@/lib/cn';

export interface PickerProduct {
  id: string;
  name: string;
  price: string;
  featureCount: number;
  imageBg?: string;
  imageSrc?: string;
}

export interface ProductPickerDialogProps {
  trigger: React.ReactNode;
  /** Dialog title — "Add Product" or "AI-Assistant" */
  title: string;
  products?: PickerProduct[];
  onApply?: (ids: string[]) => void;
  onCreateNew?: () => void;
}

const DEFAULT_PRODUCTS: PickerProduct[] = [
  {
    id: 'p1',
    name: 'Superstar Shoes',
    price: '99,88 $',
    featureCount: 5,
    imageBg: '#eeeeee',
  },
  {
    id: 'p2',
    name: 'Balenciaga Hoodie',
    price: '1.493 $',
    featureCount: 5,
    imageBg: '#2a2a2a',
  },
];

function ProductPickerDialog({
  trigger,
  title,
  products = DEFAULT_PRODUCTS,
  onApply,
  onCreateNew,
}: ProductPickerDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const apply = () => {
    onApply?.([...selected]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className='flex max-h-[85vh] max-w-md flex-col gap-0 p-0'
        showCloseButton={false}
      >
        {/* Header */}
        <div className='border-border flex items-center gap-3 border-b px-5 py-4'>
          <IconButton
            aria-label='Back'
            variant='default'
            size='sm'
            onClick={() => setOpen(false)}
          >
            <ArrowLeft />
          </IconButton>
          <h3 className='flex-1 text-center text-base font-semibold tracking-[-0.02em]'>
            {title}
          </h3>
          <span className='w-8' />
        </div>

        {/* Search */}
        <div className='flex items-center gap-2 px-5 pt-4'>
          <div className='bg-muted flex flex-1 items-center gap-2 rounded-lg px-3 py-2'>
            <Search className='text-content-muted size-4' />
            <input
              type='text'
              placeholder='Search'
              className='placeholder:text-content-muted flex-1 bg-transparent text-sm outline-none'
            />
          </div>
          <IconButton aria-label='Filter' variant='ghost' size='md'>
            <Filter />
          </IconButton>
        </div>

        {/* Product list */}
        <div className='flex-1 overflow-y-auto px-5 py-4'>
          <ul className='flex flex-col gap-3'>
            {products.map(p => {
              const isSelected = selected.has(p.id);
              return (
                <li key={p.id}>
                  <button
                    type='button'
                    onClick={() => toggle(p.id)}
                    className={cn(
                      'flex w-full flex-col gap-2 overflow-hidden rounded-xl border-2 p-3 text-left transition-colors',
                      isSelected
                        ? 'border-primary'
                        : 'border-border hover:border-neutral-300'
                    )}
                  >
                    <div className='flex items-start gap-2'>
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-full border',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-neutral-300'
                        )}
                      >
                        {isSelected && (
                          <svg
                            viewBox='0 0 16 16'
                            className='size-3'
                            fill='currentColor'
                          >
                            <path d='M6.2 12.2 2.6 8.6l1.2-1.2 2.4 2.4 5.6-5.6 1.2 1.2z' />
                          </svg>
                        )}
                      </span>
                      <div
                        className='flex aspect-square flex-1 items-center justify-center rounded-lg'
                        style={{ background: p.imageBg ?? '#f0f0f0' }}
                      >
                        {p.imageSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageSrc}
                            alt={p.name}
                            className='size-full rounded-lg object-cover'
                          />
                        ) : (
                          <span className='text-xs font-semibold text-neutral-500'>
                            {p.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Tag className='bg-background text-xs'>
                        +{p.featureCount} Feature
                      </Tag>
                    </div>
                    <div>
                      <p className='text-sm font-semibold'>{p.name}</p>
                      <p className='text-sm font-semibold'>{p.price}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer actions */}
        <div className='border-border flex items-center gap-2 border-t px-5 py-4'>
          <Button
            type='button'
            variant='pill-light'
            size='sm'
            onClick={onCreateNew}
          >
            <Plus className='size-3.5' /> Add new product
          </Button>
          <Button
            type='button'
            variant='primary'
            size='sm'
            className='flex-1'
            onClick={apply}
            disabled={selected.size === 0}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ProductPickerDialog };
