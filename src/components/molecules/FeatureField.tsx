'use client';

import * as React from 'react';
import { Info, Plus, Upload } from 'lucide-react';

import { cn } from '@/lib/cn';

type DivAttrs = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title' | 'onChange'
>;

export interface FeatureFieldProps extends DivAttrs {
  label: string;
  /** Initial text shown in the textarea (uncontrolled mode). */
  description?: string;
  /** Controlled value — when set, caller manages state via `onChange`. */
  value?: string;
  /** Controlled change handler — receives the new full text. */
  onChange?: (next: string) => void;
  placeholder?: string;
  /** Render the "+ Add more feature" button below the description box */
  showAddMore?: boolean;
  showUpload?: boolean;
  /** Render slot on the right of the label */
  info?: boolean;
  disabled?: boolean;
  rows?: number;
  /** Fired when user clicks "+ Add more feature". */
  onAddMore?: () => void;
}

/**
 * Editable multi-line text field used across Marketing Discovery / Concept /
 * Assets. Pages can pass `description` (uncontrolled — internal state seeds
 * from prop) or `value` + `onChange` (controlled). Layout matches Figma:
 * left label column, right rounded box with textarea + upload + add-more.
 */
function FeatureField({
  label,
  description,
  value,
  onChange,
  placeholder = 'Describe something',
  showAddMore = false,
  showUpload = true,
  info = true,
  disabled = false,
  rows = 4,
  onAddMore,
  className,
  ...props
}: FeatureFieldProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string>(description ?? '');

  // Reset internal state when the upstream `description` (mock per route)
  // changes. Skip for controlled mode — caller owns state.
  React.useEffect(() => {
    if (!isControlled) setInternal(description ?? '');
  }, [description, isControlled]);

  const text = isControlled ? (value ?? '') : internal;
  const setText = (next: string) => {
    if (isControlled) onChange?.(next);
    else setInternal(next);
  };

  return (
    <div
      className={cn('grid grid-cols-[160px_1fr] items-start gap-6', className)}
      {...props}
    >
      <div className='text-foreground flex items-center gap-1 pt-2 text-sm font-semibold'>
        {label}
        {info && <Info className='text-content-muted size-3.5' />}
      </div>
      <div className='flex flex-col gap-3'>
        <div className='border-border bg-background focus-within:border-foreground/40 rounded-xl border p-4 transition-colors'>
          <div className='text-content-muted mb-1 text-xs font-semibold'>
            Description
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className='text-foreground placeholder:text-content-muted w-full resize-y border-0 bg-transparent p-0 text-sm leading-6 outline-none disabled:opacity-60'
          />
          {showUpload && (
            <div className='mt-3 flex items-center'>
              <button
                type='button'
                aria-label='Upload'
                className='text-content-muted hover:text-foreground inline-flex size-6 cursor-pointer items-center justify-center'
              >
                <Upload className='size-4' />
              </button>
            </div>
          )}
        </div>
        {showAddMore && (
          <button
            type='button'
            onClick={onAddMore}
            className='rounded-pill text-neutral-0 inline-flex h-8 w-fit cursor-pointer items-center gap-1 bg-neutral-900 px-3 text-xs font-semibold hover:bg-neutral-800'
          >
            <Plus className='size-3.5' /> Add more feature
          </button>
        )}
      </div>
    </div>
  );
}

export { FeatureField };
