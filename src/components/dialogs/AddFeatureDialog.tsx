'use client';

import * as React from 'react';
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/atoms/dialog';
import { IconByName, IconPicker } from '@/components/molecules/IconPicker';
import { cn } from '@/lib/cn';
import type { ProductFeature } from '@/services/rexer/types';

export interface AddFeatureDialogProps {
  trigger: React.ReactNode;
  /** If true, dialog shows a "Continue" button; else "Apply". Figma distinguishes
   * the 01 variant (Continue) and the 02 variant (Apply). */
  mode?: 'continue' | 'apply';
  onSubmit?: (values: { name: string; rows: ProductFeature[] }) => void;
}

/** UI-local row state — each feature row picks ONE of: icon | media | none. */
type FeatureMode = 'none' | 'icon' | 'media';
interface FeatureRow extends ProductFeature {
  mode: FeatureMode;
}

const emptyRow = (): FeatureRow => ({
  label: '',
  description: '',
  mode: 'none',
});

function AddFeatureDialog({
  trigger,
  mode = 'continue',
  onSubmit,
}: AddFeatureDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [rows, setRows] = React.useState<FeatureRow[]>([emptyRow()]);

  const updateRow = (i: number, patch: Partial<FeatureRow>) => {
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Strip UI-local `mode` field before emitting upward — outer code expects
    // ProductFeature[] (just label/description/icon_name/media_id).
    const cleaned: ProductFeature[] = rows
      .filter(r => r.label.trim())
      .map(r => {
        const { label, description, icon_name, media_id } = r;
        return { label, description, icon_name, media_id };
      });
    onSubmit?.({ name, rows: cleaned });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-lg p-6' showCloseButton={false}>
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
            <FeatureRowEditor
              key={i}
              row={r}
              onChange={patch => updateRow(i, patch)}
              onRemove={
                rows.length > 1
                  ? () => setRows(prev => prev.filter((_, idx) => idx !== i))
                  : undefined
              }
            />
          ))}

          <div className='flex items-center gap-2 pt-2'>
            <Button
              type='button'
              variant='pill-light'
              size='sm'
              onClick={() => setRows(prev => [...prev, emptyRow()])}
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

/**
 * Single feature row with label + description inputs and an "icon | image"
 * mode toggle. Icon mode opens the IconPicker; image mode shows a media_id
 * placeholder input (full media library picker integration ships with FP-6).
 */
function FeatureRowEditor({
  row,
  onChange,
  onRemove,
}: {
  row: FeatureRow;
  onChange: (patch: Partial<FeatureRow>) => void;
  onRemove?: () => void;
}) {
  // Auto-detect mode from existing data when component mounts.
  React.useEffect(() => {
    if (row.mode !== 'none') return;
    if (row.media_id) onChange({ mode: 'media' });
    else if (row.icon_name) onChange({ mode: 'icon' });
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMode = (next: FeatureMode) => {
    // When switching mode, clear the other field so we don't ship inconsistent state.
    if (next === 'icon') onChange({ mode: 'icon', media_id: undefined });
    else if (next === 'media')
      onChange({ mode: 'media', icon_name: undefined });
    else onChange({ mode: 'none', icon_name: undefined, media_id: undefined });
  };

  return (
    <div className='border-border flex flex-col gap-2 rounded-lg border p-2'>
      <div className='grid grid-cols-2 gap-2'>
        <input
          type='text'
          value={row.label}
          placeholder='Label'
          onChange={e => onChange({ label: e.target.value })}
          className='border-border bg-background placeholder:text-content-muted rounded-md border px-3 py-2 text-sm outline-none'
        />
        <input
          type='text'
          value={row.description}
          placeholder='Description Text'
          onChange={e => onChange({ description: e.target.value })}
          className='border-border bg-background placeholder:text-content-muted rounded-md border px-3 py-2 text-sm outline-none'
        />
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        {/* Mode radio */}
        <div
          className='inline-flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase'
          role='radiogroup'
          aria-label='Loại hiển thị feature'
        >
          {(
            [
              ['none', 'Không'],
              ['icon', 'Icon'],
              ['media', 'Ảnh'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type='button'
              onClick={() => setMode(m)}
              role='radio'
              aria-checked={row.mode === m}
              className={cn(
                'cursor-pointer rounded-sm px-2 py-1 transition-colors',
                row.mode === m
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'hover:text-neutral-900'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mode-specific input */}
        {row.mode === 'icon' && (
          <IconPicker
            value={row.icon_name}
            onChange={v => onChange({ icon_name: v })}
          />
        )}
        {row.mode === 'media' && (
          <div className='inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2'>
            <ImagePlus className='size-3.5 text-neutral-400' />
            <input
              type='text'
              value={row.media_id ?? ''}
              onChange={e =>
                onChange({ media_id: e.target.value || undefined })
              }
              placeholder='media_id (TODO: picker)'
              className='h-7 w-44 bg-transparent text-xs outline-none placeholder:text-neutral-400'
            />
          </div>
        )}

        {/* Preview */}
        {row.mode === 'icon' && row.icon_name && (
          <span
            className='inline-flex size-8 items-center justify-center rounded-md bg-neutral-900 text-white'
            aria-hidden
          >
            <IconByName name={row.icon_name} className='size-4' />
          </span>
        )}

        {onRemove && (
          <button
            type='button'
            onClick={onRemove}
            aria-label='Xoá feature'
            className='ml-auto flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-400 hover:bg-rose-50 hover:text-rose-600'
          >
            <Trash2 className='size-3.5' />
          </button>
        )}
      </div>
    </div>
  );
}

export { AddFeatureDialog };
