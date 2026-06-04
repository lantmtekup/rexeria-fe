'use client';

import * as React from 'react';
import { Copy, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Spinner } from '@/components/atoms/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { EmptyState } from '@/components/molecules/EmptyState';
import { dataCollectionRemote as dataCollectionLocal } from '@/services/dataCollection.remote';
import type {
  CollectionFieldConfig,
  DataCollection,
  DataCollectionRecord,
} from '@/types/dataCollection';

export interface RecordTableProps {
  collection: DataCollection;
  refreshKey?: number;
  onCreate: () => void;
  onEdit: (record: DataCollectionRecord) => void;
  onDuplicate: (record: DataCollectionRecord) => void;
}

const VISIBLE_FIELDS_LIMIT = 5;

function formatCell(value: unknown, field: CollectionFieldConfig): string {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (field.type === 'toggle') return value ? 'Yes' : 'No';
  if (field.type === 'currency') {
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString();
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '[object]';
    }
  }
  return String(value);
}

export function RecordTable({
  collection,
  refreshKey = 0,
  onCreate,
  onEdit,
  onDuplicate,
}: RecordTableProps) {
  const [records, setRecords] = React.useState<DataCollectionRecord[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 20;

  const visibleFields = React.useMemo(() => {
    const sorted = [...collection.fields].sort((a, b) => a.order - b.order);
    // Primary first if any.
    const primary = sorted.find(f => f.isPrimary);
    const rest = sorted.filter(f => !f.isPrimary);
    const ordered = primary ? [primary, ...rest] : sorted;
    return ordered.slice(0, VISIBLE_FIELDS_LIMIT);
  }, [collection.fields]);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await dataCollectionLocal.getRecords(collection.id, {
        search: search.trim() || undefined,
        page,
        limit,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setRecords(res.data.records);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [collection.id, search, page]);

  React.useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  const handleDelete = async (record: DataCollectionRecord) => {
    const label = record.display_name ?? `record ${record.id.slice(0, 8)}`;
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    const res = await dataCollectionLocal.deleteRecord(record.id);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success('Record deleted');
    reload();
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='relative max-w-sm min-w-[200px] flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
          <Input
            placeholder='Search records…'
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className='h-9 pl-9'
          />
        </div>
        <div className='text-muted-foreground text-xs'>
          {loading ? <Spinner size={12} /> : `${total} record(s)`}
        </div>
        <Button variant='pill' size='sm' onClick={onCreate}>
          <Plus className='size-3.5' /> New record
        </Button>
      </div>

      {loading && records.length === 0 ? (
        <div className='text-muted-foreground flex justify-center py-12'>
          <Spinner size={20} />
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          title={search ? 'No matching records' : 'No records yet'}
          description={
            search
              ? 'Try a different search query.'
              : 'Create your first record to populate this collection.'
          }
          actions={
            !search && (
              <Button variant='pill' onClick={onCreate}>
                <Plus className='size-3.5' /> Add first record
              </Button>
            )
          }
        />
      ) : (
        <div className='border-border bg-background overflow-hidden rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                {visibleFields.map(f => (
                  <TableHead key={f.id} className='whitespace-nowrap'>
                    {f.label}
                    {f.isPrimary && (
                      <Badge variant='secondary' className='text-3xs ml-1'>
                        primary
                      </Badge>
                    )}
                  </TableHead>
                ))}
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map(r => (
                <TableRow key={r.id}>
                  {visibleFields.map(f => (
                    <TableCell key={f.id} className='max-w-[280px] truncate'>
                      {formatCell(r.data?.[f.fieldKey], f)}
                    </TableCell>
                  ))}
                  <TableCell className='text-right whitespace-nowrap'>
                    <div className='inline-flex gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-7'
                        onClick={() => onEdit(r)}
                        aria-label='Edit'
                      >
                        <Pencil className='size-3.5' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='size-7'
                        onClick={() => onDuplicate(r)}
                        aria-label='Duplicate'
                      >
                        <Copy className='size-3.5' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-muted-foreground hover:text-destructive size-7'
                        onClick={() => handleDelete(r)}
                        aria-label='Delete'
                      >
                        <Trash2 className='size-3.5' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className='flex items-center justify-between gap-2 pt-1'>
          <span className='text-muted-foreground text-xs'>
            Page {page} of {totalPages}
          </span>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
