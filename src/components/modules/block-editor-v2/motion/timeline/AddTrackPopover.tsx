'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';

import { elementLabel } from './utils';

interface AddTrackPopoverProps {
  options: string[];
  onPick: (key: string) => void;
}

export function AddTrackPopover({ options, onPick }: AddTrackPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} className='relative inline-flex'>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        disabled={options.length === 0}
        data-testid='motion-add-track'
        className='text-2xs flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40'
      >
        <Plus className='size-3' />
        Thêm track
        {options.length === 0 && (
          <span className='text-3xs font-mono text-neutral-400'>
            (đã hết element)
          </span>
        )}
      </button>
      {open && options.length > 0 && (
        <div className='absolute bottom-full left-0 z-20 mb-1 max-h-64 w-56 overflow-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg'>
          {options.map(key => (
            <button
              key={key}
              type='button'
              onClick={() => {
                onPick(key);
                setOpen(false);
              }}
              data-testid={`motion-add-track-option-${key}`}
              className='text-2xs flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-neutral-700 hover:bg-neutral-100'
            >
              <span className='flex-1 truncate font-medium'>
                {elementLabel(key)}
              </span>
              <span className='text-3xs font-mono text-neutral-400'>{key}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
