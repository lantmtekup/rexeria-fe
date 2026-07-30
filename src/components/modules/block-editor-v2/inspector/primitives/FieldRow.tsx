'use client';

import * as React from 'react';
import { RotateCcw } from 'lucide-react';

import { cn } from '@/lib/cn';

import { CONTROL_H, ICON_SM, LABEL_W, TEXT_CONTROL } from '../tokens';

interface FieldRowProps {
  label: string;
  /**
   * True when this single property carries an override. Shows a per-field
   * revert button — the old toolbar only had one all-or-nothing reset.
   */
  hasOverride?: boolean;
  onRevert?: () => void;
  /** Stack the control under the label instead of beside it (wide controls). */
  stacked?: boolean;
  children: React.ReactNode;
}

export function FieldRow({
  label,
  hasOverride = false,
  onRevert,
  stacked = false,
  children,
}: FieldRowProps) {
  const revert = hasOverride && onRevert && (
    <button
      type='button'
      onClick={onRevert}
      title={`Bỏ tuỳ chỉnh "${label}"`}
      aria-label={`Bỏ tuỳ chỉnh ${label}`}
      className='text-content-muted hover:text-foreground hover:bg-muted flex size-5 shrink-0 cursor-pointer items-center justify-center rounded transition-colors'
    >
      <RotateCcw className={ICON_SM} />
    </button>
  );

  if (stacked) {
    return (
      <div className='flex flex-col gap-1.5'>
        <div className='flex h-5 items-center gap-1'>
          <Label text={label} active={hasOverride} />
          {revert}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', CONTROL_H)}>
      <div className={cn('flex shrink-0 items-center gap-1', LABEL_W)}>
        <Label text={label} active={hasOverride} />
        {revert}
      </div>
      <div className='flex min-w-0 flex-1 items-center gap-1'>{children}</div>
    </div>
  );
}

function Label({ text, active }: { text: string; active: boolean }) {
  return (
    <span
      className={cn(
        'truncate',
        TEXT_CONTROL,
        active ? 'text-foreground font-medium' : 'text-content-muted'
      )}
      title={text}
    >
      {text}
    </span>
  );
}
