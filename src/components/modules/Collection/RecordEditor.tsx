'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Spinner } from '@/components/atoms/spinner';
import {
  dataCollectionRemote as dataCollectionLocal,
  validateRecordData,
} from '@/services/dataCollection.remote';
import type {
  DataCollection,
  DataCollectionRecord,
} from '@/types/dataCollection';

import { FieldRenderer } from './FieldRenderer';

export interface RecordEditorProps {
  collection: DataCollection;
  /** Record being edited — null = create mode. */
  record: DataCollectionRecord | null;
  /** When provided + `record` is null, prefill from this record (duplicate). */
  duplicateFrom?: DataCollectionRecord | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function emptyData(collection: DataCollection): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of collection.fields) {
    if (f.defaultValue !== undefined) out[f.fieldKey] = f.defaultValue;
  }
  return out;
}

export function RecordEditor({
  collection,
  record,
  duplicateFrom,
  open,
  onClose,
  onSaved,
}: RecordEditorProps) {
  const [data, setData] = React.useState<Record<string, unknown>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (record) setData({ ...record.data });
    else if (duplicateFrom) setData({ ...duplicateFrom.data });
    else setData(emptyData(collection));
    setErrors({});
  }, [open, record, duplicateFrom, collection]);

  const setValue = (key: string, value: unknown) => {
    setData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { valid, errors: validationErrors } = validateRecordData(
      collection.fields,
      data
    );
    if (!valid) {
      setErrors(validationErrors);
      toast.error(`Fix ${Object.keys(validationErrors).length} field error(s)`);
      return;
    }

    setSubmitting(true);
    try {
      // Compute display_name from primary field if any.
      const primary = collection.fields.find(f => f.isPrimary);
      const displayName = primary
        ? String(data[primary.fieldKey] ?? '').slice(0, 200) || null
        : null;

      const res = record
        ? await dataCollectionLocal.updateRecord(record.id, {
            data,
            display_name: displayName,
          })
        : await dataCollectionLocal.createRecord({
            collection_id: collection.id,
            data,
            display_name: displayName,
          });

      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(record ? 'Record saved' : 'Record created');
      onSaved();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const sortedFields = React.useMemo(
    () => [...collection.fields].sort((a, b) => a.order - b.order),
    [collection.fields]
  );

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <DialogHeader>
            <DialogTitle>
              {record
                ? 'Edit record'
                : duplicateFrom
                  ? 'Duplicate record'
                  : 'New record'}
            </DialogTitle>
            <DialogDescription>
              {collection.name} · {sortedFields.length} field(s)
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4'>
            {sortedFields.length === 0 ? (
              <p className='text-muted-foreground text-sm italic'>
                No fields defined yet — add fields in the Schema tab first.
              </p>
            ) : (
              sortedFields.map(f => (
                <FieldRenderer
                  key={f.id}
                  field={f}
                  value={data[f.fieldKey]}
                  onChange={v => setValue(f.fieldKey, v)}
                  error={errors[f.fieldKey]}
                  disabled={submitting}
                />
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              disabled={submitting || sortedFields.length === 0}
            >
              {submitting ? (
                <>
                  <Spinner size={14} /> Saving…
                </>
              ) : record ? (
                'Save changes'
              ) : (
                'Create record'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
