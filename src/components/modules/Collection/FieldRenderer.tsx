'use client';

import * as React from 'react';
import { Star } from 'lucide-react';

import { Input } from '@/components/atoms/input';
import { Switch } from '@/components/atoms/switch';
import { Textarea } from '@/components/atoms/textarea';
import type { CollectionFieldConfig } from '@/types/dataCollection';
import { cn } from '@/lib/cn';

export interface FieldRendererProps {
  field: CollectionFieldConfig;
  value: unknown;
  onChange: (next: unknown) => void;
  error?: string;
  disabled?: boolean;
}

function asString(v: unknown): string {
  if (v === undefined || v === null) return '';
  return typeof v === 'string' ? v : String(v);
}

function StarRating({
  value,
  max,
  disabled,
  onChange,
}: {
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <div className='flex items-center gap-1'>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value;
        return (
          <button
            key={i}
            type='button'
            disabled={disabled}
            onClick={() => onChange(i + 1)}
            className={cn(
              'p-0.5 transition-colors',
              filled
                ? 'text-amber-500'
                : 'text-muted-foreground hover:text-amber-400'
            )}
          >
            <Star className='size-5' fill={filled ? 'currentColor' : 'none'} />
          </button>
        );
      })}
      {value > 0 && (
        <button
          type='button'
          onClick={() => onChange(0)}
          disabled={disabled}
          className='text-muted-foreground hover:text-foreground ml-2 text-xs'
        >
          Clear
        </button>
      )}
    </div>
  );
}

export function FieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled,
}: FieldRendererProps) {
  const baseProps = {
    placeholder: field.placeholder,
    'aria-invalid': Boolean(error),
    disabled,
  };

  let control: React.ReactNode = null;

  switch (field.type) {
    case 'paragraph':
      control = (
        <Textarea
          {...baseProps}
          rows={3}
          value={asString(value)}
          onChange={e => onChange(e.target.value)}
        />
      );
      break;

    case 'number':
    case 'currency':
      control = (
        <Input
          {...baseProps}
          type='number'
          step='any'
          value={asString(value)}
          onChange={e =>
            onChange(e.target.value === '' ? null : Number(e.target.value))
          }
        />
      );
      break;

    case 'email':
      control = (
        <Input
          {...baseProps}
          type='email'
          value={asString(value)}
          onChange={e => onChange(e.target.value)}
        />
      );
      break;

    case 'url':
      control = (
        <Input
          {...baseProps}
          type='url'
          value={asString(value)}
          onChange={e => onChange(e.target.value)}
        />
      );
      break;

    case 'phone':
      control = (
        <Input
          {...baseProps}
          type='tel'
          value={asString(value)}
          onChange={e => onChange(e.target.value)}
        />
      );
      break;

    case 'date':
      control = (
        <Input
          {...baseProps}
          type='date'
          value={asString(value)}
          onChange={e => onChange(e.target.value)}
        />
      );
      break;

    case 'time':
      control = (
        <Input
          {...baseProps}
          type='time'
          value={asString(value)}
          onChange={e => onChange(e.target.value)}
        />
      );
      break;

    case 'dropdown': {
      const opts = field.options ?? [];
      control = (
        <select
          disabled={disabled}
          value={asString(value)}
          onChange={e => onChange(e.target.value || null)}
          className='border-input bg-background h-10 w-full rounded-md border px-3 text-sm outline-none'
        >
          <option value=''>—</option>
          {opts.map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
      break;
    }

    case 'radio': {
      const opts = field.options ?? [];
      control = (
        <div className='flex flex-wrap gap-3'>
          {opts.map(o => (
            <label key={o} className='inline-flex items-center gap-2 text-sm'>
              <input
                type='radio'
                disabled={disabled}
                checked={asString(value) === o}
                onChange={() => onChange(o)}
                name={field.fieldKey}
              />
              {o}
            </label>
          ))}
        </div>
      );
      break;
    }

    case 'checkbox': {
      const opts = field.options ?? [];
      const arr = Array.isArray(value) ? (value as string[]) : [];
      control = (
        <div className='flex flex-wrap gap-3'>
          {opts.map(o => (
            <label key={o} className='inline-flex items-center gap-2 text-sm'>
              <input
                type='checkbox'
                disabled={disabled}
                checked={arr.includes(o)}
                onChange={e => {
                  const next = e.target.checked
                    ? [...arr, o]
                    : arr.filter(x => x !== o);
                  onChange(next);
                }}
              />
              {o}
            </label>
          ))}
        </div>
      );
      break;
    }

    case 'toggle':
      control = (
        <Switch
          checked={Boolean(value)}
          disabled={disabled}
          onCheckedChange={onChange}
        />
      );
      break;

    case 'rating': {
      const max = Number(field.validation?.maxRating) || 5;
      control = (
        <StarRating
          value={Number(value) || 0}
          max={max}
          disabled={disabled}
          onChange={onChange}
        />
      );
      break;
    }

    case 'file':
    case 'image':
      // Stub — wire to the rexer media upload pipeline later.
      // For now we let users paste a URL; full upload arrives with BE wire-up.
      control = (
        <Input
          {...baseProps}
          type='url'
          placeholder={field.placeholder ?? 'Paste asset URL (upload coming)'}
          value={asString(value)}
          onChange={e => onChange(e.target.value)}
        />
      );
      break;

    case 'relation':
      // Defer to Phase 2 — needs cross-collection picker.
      control = (
        <Input
          {...baseProps}
          placeholder='Relation field — pick UI ships in Phase 2'
          value={asString(value)}
          onChange={e => onChange(e.target.value)}
        />
      );
      break;

    case 'text':
    default:
      control = (
        <Input
          {...baseProps}
          type='text'
          value={asString(value)}
          onChange={e => onChange(e.target.value)}
        />
      );
  }

  return (
    <div className='flex flex-col gap-1.5'>
      <label
        htmlFor={field.fieldKey}
        className='text-foreground inline-flex items-center gap-1 text-sm font-medium'
      >
        {field.label}
        {field.required && <span className='text-destructive'>*</span>}
      </label>
      {field.description && (
        <p className='text-muted-foreground text-xs'>{field.description}</p>
      )}
      {control}
      {error && <p className='text-destructive text-xs'>{error}</p>}
    </div>
  );
}
