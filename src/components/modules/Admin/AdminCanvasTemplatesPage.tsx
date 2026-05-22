'use client';

/**
 * Admin/staff list of canvas templates with one-click "Assign to brand"
 * hand-off. Phase 1 managed-service workflow: Rexer staff drafts the
 * template, then assigns it to a brand's workspace via the modal.
 */

import * as React from 'react';
import Link from 'next/link';
import { RefreshCwIcon, SendIcon, SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { CanvasTemplate } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

import { AdminAssignTemplateDialog } from './AdminAssignTemplateDialog';

export function AdminCanvasTemplatesPage() {
  const [items, setItems] = React.useState<CanvasTemplate[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [assignTarget, setAssignTarget] = React.useState<CanvasTemplate | null>(
    null
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.canvasTemplates.list({ limit: 50 });
      setItems(r.items ?? []);
    } catch (err) {
      setError(
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Canvas templates
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            Drafts của Rexer · assign sang brand để họ chỉnh sửa + publish ·{' '}
            {items.length} template
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={load} disabled={loading}>
            <RefreshCwIcon
              className={cn('size-4', loading && 'animate-spin')}
            />
            Refresh
          </Button>
          <Button asChild>
            <Link href='/canvas-templates'>
              <SparklesIcon className='size-4' />
              Editor
            </Link>
          </Button>
        </div>
      </div>

      <Input
        placeholder='Tìm theo tên / mô tả…'
        value={search}
        onChange={e => setSearch(e.target.value)}
        className='max-w-sm'
      />

      {error && (
        <div className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800'>
          {error}
        </div>
      )}

      <div className='overflow-hidden rounded-lg border border-zinc-200 bg-white'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead className='w-32'>Trạng thái</TableHead>
              <TableHead className='w-44'>Brand</TableHead>
              <TableHead className='w-32'>Cập nhật</TableHead>
              <TableHead className='w-32' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-content-muted py-8 text-center'
                >
                  Không có template
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(t => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className='font-medium'>{t.name}</div>
                    <div className='text-content-muted truncate font-mono text-[10.5px]'>
                      {t.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10.5px] font-medium',
                        t.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-600'
                      )}
                    >
                      {t.is_active ? 'active' : 'inactive'}
                    </span>
                    {t.is_template && (
                      <span className='ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10.5px] font-medium text-violet-700'>
                        library
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='text-[12px] text-zinc-600'>
                    {t.client_id ? (
                      <code className='font-mono text-[10.5px]'>
                        {t.client_id.slice(0, 8)}…
                      </code>
                    ) : (
                      <span className='text-zinc-400'>chưa assign</span>
                    )}
                  </TableCell>
                  <TableCell className='text-xs text-zinc-500'>
                    {t.updated_at
                      ? new Date(t.updated_at).toLocaleDateString('vi-VN')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        asChild
                        variant='ghost'
                        size='sm'
                        title='Mở editor'
                      >
                        <Link href={`/canvas-templates/${t.id}`}>Editor</Link>
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setAssignTarget(t)}
                        title='Assign sang brand'
                      >
                        <SendIcon className='size-3.5' />
                        Assign
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminAssignTemplateDialog
        open={!!assignTarget}
        template={assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssigned={updated => {
          setItems(prev =>
            prev.map(it => (it.id === updated.id ? updated : it))
          );
          toast.success(
            'Brand sẽ thấy template này trong /portal/landing-pages'
          );
        }}
      />
    </div>
  );
}
