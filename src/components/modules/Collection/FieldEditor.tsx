'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Switch } from '@/components/atoms/switch';
import type {
  CollectionFieldConfig,
  CollectionFieldType,
} from '@/types/dataCollection';
import { cn } from '@/lib/cn';

const TYPE_OPTIONS: { value: CollectionFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'phone', label: 'Phone' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'toggle', label: 'Toggle' },
  { value: 'rating', label: 'Rating' },
  { value: 'file', label: 'File (URL only)' },
  { value: 'image', label: 'Image (URL only)' },
  { value: 'relation', label: 'Relation (Phase 2)' },
];

export interface FieldEditorProps {
  field: CollectionFieldConfig;
  index: number;
  total: number;
  onChange: (next: CollectionFieldConfig) => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
  /** Block destructive type changes when records already exist. */
  hasRecords?: boolean;
}

const HAS_OPTIONS = new Set<CollectionFieldType>([
  'dropdown',
  'radio',
  'checkbox',
]);

export function FieldEditor({
  field,
  index,
  total,
  onChange,
  onDelete,
  onMove,
  hasRecords,
}: FieldEditorProps) {
  const [expanded, setExpanded] = React.useState(false);

  const set = <K extends keyof CollectionFieldConfig>(
    key: K,
    value: CollectionFieldConfig[K]
  ) => onChange({ ...field, [key]: value });

  const handleTypeChange = (next: CollectionFieldType) => {
    if (hasRecords && next !== field.type) {
      const ok = window.confirm(
        'Records exist. Changing field type may corrupt existing data. Continue?'
      );
      if (!ok) return;
    }
    onChange({ ...field, type: next });
  };

  const handleOptionsChange = (raw: string) => {
    const opts = raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    set('options', opts);
  };

  return (
    <div
      className={cn(
        'border-border bg-background flex flex-col rounded-xl border'
      )}
    >
      <div className='flex items-center gap-2 px-3 py-2'>
        <GripVertical className='text-muted-foreground size-4 shrink-0' />
        <span className='text-muted-foreground w-6 text-xs tabular-nums'>
          #{index + 1}
        </span>
        <Input
          value={field.label}
          placeholder='Field label'
          onChange={e => set('label', e.target.value)}
          className='h-8 flex-1'
        />
        <Input
          value={field.fieldKey}
          placeholder='field_key'
          onChange={e =>
            set(
              'fieldKey',
              e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9_]+/g, '_')
                .replace(/^_+|_+$/g, '')
            )
          }
          className='h-8 w-40 font-mono text-xs'
        />
        <select
          value={field.type}
          onChange={e =>
            handleTypeChange(e.target.value as CollectionFieldType)
          }
          className='border-input bg-background h-8 rounded-md border px-2 text-xs'
        >
          {TYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Badge variant='outline' className='shrink-0 capitalize'>
          {field.required ? 'required' : 'optional'}
        </Badge>
        <div className='flex items-center'>
          <Button
            variant='ghost'
            size='icon'
            className='size-7'
            disabled={index === 0}
            onClick={() => onMove('up')}
            aria-label='Move up'
          >
            <ChevronUp className='size-3.5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='size-7'
            disabled={index === total - 1}
            onClick={() => onMove('down')}
            aria-label='Move down'
          >
            <ChevronDown className='size-3.5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='text-muted-foreground hover:text-destructive size-7'
            onClick={onDelete}
            aria-label='Delete field'
          >
            <Trash2 className='size-3.5' />
          </Button>
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setExpanded(v => !v)}
          className='text-xs'
        >
          {expanded ? 'Less' : 'More'}
        </Button>
      </div>

      {expanded && (
        <div className='border-border grid grid-cols-1 gap-3 border-t px-3 py-3 sm:grid-cols-2'>
          <label className='flex flex-col gap-1 text-xs'>
            <span className='text-muted-foreground font-semibold uppercase'>
              Placeholder
            </span>
            <Input
              value={field.placeholder ?? ''}
              onChange={e => set('placeholder', e.target.value)}
              className='h-8'
            />
          </label>
          <label className='flex flex-col gap-1 text-xs'>
            <span className='text-muted-foreground font-semibold uppercase'>
              Description
            </span>
            <Input
              value={field.description ?? ''}
              onChange={e => set('description', e.target.value)}
              className='h-8'
            />
          </label>
          {HAS_OPTIONS.has(field.type) && (
            <label className='col-span-full flex flex-col gap-1 text-xs'>
              <span className='text-muted-foreground font-semibold uppercase'>
                Options (comma separated)
              </span>
              <Input
                value={(field.options ?? []).join(', ')}
                onChange={e => handleOptionsChange(e.target.value)}
                className='h-8'
                placeholder='Option 1, Option 2'
              />
            </label>
          )}
          <label className='flex items-center gap-2 text-xs'>
            <Switch
              checked={Boolean(field.required)}
              onCheckedChange={c => set('required', c)}
              size='sm'
            />
            Required
          </label>
          <label className='flex items-center gap-2 text-xs'>
            <Switch
              checked={Boolean(field.isUnique)}
              onCheckedChange={c => set('isUnique', c)}
              size='sm'
            />
            Unique value
          </label>
          <label className='flex items-center gap-2 text-xs'>
            <Switch
              checked={Boolean(field.isPrimary)}
              onCheckedChange={c => set('isPrimary', c)}
              size='sm'
            />
            Primary (display name)
          </label>
        </div>
      )}
    </div>
  );
}
