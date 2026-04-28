'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { EmptyState } from '@/components/molecules/EmptyState';
import type {
  CollectionFieldConfig,
  CollectionFieldType,
} from '@/types/dataCollection';

import { FieldEditor } from './FieldEditor';

export interface FieldSchemaBuilderProps {
  fields: CollectionFieldConfig[];
  recordCount?: number;
  onChange: (fields: CollectionFieldConfig[]) => void;
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `f_${Math.random().toString(36).slice(2)}`;
}

function nextFieldKey(existing: CollectionFieldConfig[]): string {
  const used = new Set(existing.map(f => f.fieldKey));
  let i = existing.length + 1;
  let key = `field_${i}`;
  while (used.has(key)) {
    i++;
    key = `field_${i}`;
  }
  return key;
}

export function FieldSchemaBuilder({
  fields,
  recordCount = 0,
  onChange,
}: FieldSchemaBuilderProps) {
  const sorted = React.useMemo(
    () => [...fields].sort((a, b) => a.order - b.order),
    [fields]
  );

  const replace = (next: CollectionFieldConfig[]) => {
    onChange(next.map((f, i) => ({ ...f, order: i })));
  };

  const addField = (type: CollectionFieldType = 'text') => {
    const key = nextFieldKey(sorted);
    const created: CollectionFieldConfig = {
      id: uuid(),
      fieldKey: key,
      type,
      label: `Field ${sorted.length + 1}`,
      required: false,
      order: sorted.length,
    };
    replace([...sorted, created]);
  };

  const updateAt = (idx: number, next: CollectionFieldConfig) => {
    const copy = [...sorted];
    copy[idx] = next;
    replace(copy);
  };

  const deleteAt = (idx: number) => {
    if (recordCount > 0) {
      const ok = window.confirm(
        'Records exist. Deleting this field will hide its data on existing records. Continue?'
      );
      if (!ok) return;
    }
    replace(sorted.filter((_, i) => i !== idx));
  };

  const moveAt = (idx: number, dir: 'up' | 'down') => {
    const copy = [...sorted];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= copy.length) return;
    const [moved] = copy.splice(idx, 1);
    copy.splice(target, 0, moved);
    replace(copy);
  };

  return (
    <div className='flex flex-col gap-3'>
      {sorted.length === 0 ? (
        <EmptyState
          icon={
            <div className='border-border flex size-14 items-center justify-center rounded-xl border'>
              <Plus className='text-muted-foreground size-6' />
            </div>
          }
          title='No fields yet'
          description='A collection needs at least one field. Start with a Text field for the primary label.'
          actions={
            <Button variant='pill' onClick={() => addField('text')}>
              <Plus className='size-3.5' /> Add first field
            </Button>
          }
        />
      ) : (
        sorted.map((f, i) => (
          <FieldEditor
            key={f.id}
            field={f}
            index={i}
            total={sorted.length}
            onChange={next => updateAt(i, next)}
            onDelete={() => deleteAt(i)}
            onMove={dir => moveAt(i, dir)}
            hasRecords={recordCount > 0}
          />
        ))
      )}

      {sorted.length > 0 && (
        <div className='flex justify-start'>
          <Button variant='pill-light' size='sm' onClick={() => addField()}>
            <Plus className='size-3.5' /> Add field
          </Button>
        </div>
      )}
    </div>
  );
}
