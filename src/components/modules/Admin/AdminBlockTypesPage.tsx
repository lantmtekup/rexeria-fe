'use client';

/**
 * Admin block_types catalog editor — `/admin/block-types`.
 *
 * Manage the system catalog of built-in block types (hero_split,
 * feature_grid, cta_button, ...). Each type defines `props_schema`,
 * `supported_surfaces` ('landing'|'ad'|'curate'), and metadata used by
 * the canvas builder + brand portal.
 *
 * BE endpoints (just wired):
 *   GET    /v1/admin/block-types?surface=&category=&q=
 *   POST   /v1/admin/block-types
 *   GET    /v1/admin/block-types/{code}
 *   PATCH  /v1/admin/block-types/{code}
 *   DELETE /v1/admin/block-types/{code}
 */

import * as React from 'react';
import {
  Blocks,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
import { Input } from '@/components/atoms/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { BlockTypeFormDialog } from '@/components/dialogs/BlockTypeFormDialog';
import { TablePagination } from '@/components/molecules/TablePagination';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { AdminBlockType } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

type SurfaceFilter = 'all' | 'landing' | 'ad' | 'curate';

const SURFACE_META: Record<string, { label: string; chip: string }> = {
  landing: {
    label: 'Landing',
    chip: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  ad: { label: 'Ad', chip: 'bg-amber-50 text-amber-700 border-amber-200' },
  curate: {
    label: 'Curate',
    chip: 'bg-violet-50 text-violet-700 border-violet-200',
  },
};

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  hero: { label: 'Hero', emoji: '🎬' },
  content: { label: 'Content', emoji: '📝' },
  media: { label: 'Media', emoji: '🖼️' },
  interactive: { label: 'Interactive', emoji: '🎮' },
  advanced: { label: 'Advanced', emoji: '⚙️' },
  widget: { label: 'Widget', emoji: '🧩' },
  creative: { label: 'Creative', emoji: '🎨' },
};

export function AdminBlockTypesPage() {
  const [items, setItems] = React.useState<AdminBlockType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [surface, setSurface] = React.useState<SurfaceFilter>('all');
  const [showInactive, setShowInactive] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [formInitial, setFormInitial] = React.useState<AdminBlockType | null>(
    null
  );
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset về trang 1 khi đổi filter/search (kết quả thay đổi).
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, surface, showInactive]);

  const paged = React.useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.adminBlockTypes.list({
        surface: surface === 'all' ? undefined : surface,
        q: debouncedSearch.trim() || undefined,
      });
      // A2 (be-response §A2): BE `/block-types` chưa filter `is_active` →
      // lọc client-side (giữ nguyên hành vi: tab off chỉ hiện block active).
      const items = r.items ?? [];
      setItems(showInactive ? items : items.filter(it => it.is_active));
    } catch (err) {
      setError(
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [surface, debouncedSearch, showInactive]);

  React.useEffect(() => {
    load();
  }, [load]);

  const counts = React.useMemo(() => {
    const m = { landing: 0, ad: 0, curate: 0, multi: 0, inactive: 0 };
    for (const it of items) {
      if (!it.is_active) m.inactive += 1;
      const surfaces = it.supported_surfaces ?? [];
      if (surfaces.length > 1) m.multi += 1;
      if (surfaces.includes('landing')) m.landing += 1;
      if (surfaces.includes('ad')) m.ad += 1;
      if (surfaces.includes('curate')) m.curate += 1;
    }
    return m;
  }, [items]);

  const handleToggleActive = async (item: AdminBlockType) => {
    try {
      await rexerApi.adminBlockTypes.update(item.type, {
        is_active: !item.is_active,
      });
      toast.success(
        `Đã ${item.is_active ? 'disable' : 'enable'} block "${item.type}"`
      );
      load();
    } catch (err) {
      const msg =
        err instanceof RxApiError ? err.code || err.message : 'TOGGLE_FAILED';
      toast.error(`Thao tác thất bại: ${msg}`);
    }
  };

  const handleDelete = async (item: AdminBlockType) => {
    if (
      !window.confirm(
        `Xoá block type "${item.type}"?\n\nMọi block đang dùng type này sẽ bị orphan.`
      )
    )
      return;
    try {
      await rexerApi.adminBlockTypes.remove(item.type);
      toast.success(`Đã xoá ${item.type}`);
      load();
    } catch (err) {
      const msg =
        err instanceof RxApiError ? err.code || err.message : 'DELETE_FAILED';
      toast.error(`Xoá thất bại: ${msg}`);
    }
  };

  return (
    <div className='flex h-[calc(100vh-3.5rem)]'>
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <div className='border-border bg-card border-b px-6 py-4'>
          <div className='flex flex-wrap items-end justify-between gap-3'>
            <div>
              <div className='text-3xs text-content-muted flex items-center gap-2 font-semibold tracking-[0.18em] uppercase'>
                <Blocks className='size-3' /> Block types catalog
              </div>
              <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
                Catalog blocks hệ thống
              </h1>
              <p className='text-content-muted mt-1 text-sm'>
                Block types brand dùng để dựng landing / ad / curate.
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='neutral'
                size='sm'
                onClick={load}
                disabled={loading}
              >
                <RefreshCw
                  className={cn('size-3.5', loading && 'animate-spin')}
                />
                Refresh
              </Button>
              <Button
                size='sm'
                onClick={() => {
                  setFormInitial(null);
                  setFormOpen(true);
                }}
              >
                <Plus className='size-3.5' />
                Tạo block type
              </Button>
            </div>
          </div>

          {/* Toolbar — filter Surface đã gánh việc đếm/segment nên bỏ stats strip;
              chỉ giữ 1 dòng đếm gọn. */}
          <div className='mt-4 flex flex-wrap items-center gap-2'>
            <span className='text-2xs text-content-muted mr-1 font-medium'>
              {items.length} types
              {counts.inactive > 0 && ` · ${counts.inactive} disabled`}
            </span>
            <div className='relative max-w-sm flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
              <Input
                placeholder='Tìm theo code / name / category…'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <span className='text-3xs text-muted-foreground inline-flex items-center gap-1 px-1 font-semibold tracking-[0.18em] uppercase'>
              <Filter className='size-3' /> Surface
            </span>
            {(['all', 'landing', 'ad', 'curate'] as const).map(s => (
              <Chip
                key={s}
                size='sm'
                selected={surface === s}
                onClick={() => setSurface(s)}
              >
                {s === 'all' ? 'Tất cả' : (SURFACE_META[s]?.label ?? s)}
              </Chip>
            ))}
            <label className='text-2xs text-content-muted ml-2 inline-flex cursor-pointer items-center gap-1.5'>
              <input
                type='checkbox'
                checked={showInactive}
                onChange={e => setShowInactive(e.target.checked)}
                className='size-3'
              />
              Show disabled
            </label>
          </div>
        </div>

        {/* Body — grid */}
        <div className='bg-muted/40 flex-1 overflow-y-auto p-6'>
          {error && (
            <div className='border-destructive/20 bg-danger-bg text-destructive mb-3 rounded-lg border px-3 py-2 text-xs'>
              {error}
            </div>
          )}

          {loading && items.length === 0 ? (
            <div className='text-content-muted flex items-center justify-center py-20 text-sm'>
              <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải catalog…
            </div>
          ) : items.length === 0 ? (
            <div className='border-border bg-card rounded-2xl border border-dashed p-12 text-center'>
              <Blocks className='text-muted-foreground mx-auto size-8' />
              <p className='text-content-muted mt-3 text-sm font-semibold'>
                Không có block type nào
              </p>
              <p className='text-content-muted mt-1 text-xs'>
                Bấm &ldquo;Tạo block type&rdquo; hoặc đổi filter.
              </p>
            </div>
          ) : (
            <div className='border-border bg-card overflow-x-auto rounded-xl border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Surfaces</TableHead>
                    <TableHead>Funnel</TableHead>
                    <TableHead>Goals</TableHead>
                    <TableHead>Tone</TableHead>
                    <TableHead>Media / CTA</TableHead>
                    <TableHead className='text-center'>Status</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map(item => {
                    const cat = item.category
                      ? CATEGORY_META[item.category]
                      : null;
                    const surfaces = item.supported_surfaces ?? [];
                    return (
                      <TableRow
                        key={item.type}
                        onClick={() => {
                          setFormInitial(item);
                          setFormOpen(true);
                        }}
                        className={cn(
                          'cursor-pointer',
                          !item.is_active && 'opacity-55'
                        )}
                      >
                        <TableCell>
                          <code className='text-foreground font-mono text-xs font-bold'>
                            {item.type}
                          </code>
                          <div className='text-content-muted mt-0.5 text-xs'>
                            {item.label_vi}
                          </div>
                        </TableCell>
                        <TableCell className='text-content-muted text-xs whitespace-nowrap'>
                          {cat?.label ?? item.category ?? '—'}
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-wrap gap-1'>
                            {surfaces.length === 0 && (
                              <span className='text-content-muted text-xs'>
                                —
                              </span>
                            )}
                            {surfaces.map(s => {
                              const meta = SURFACE_META[s];
                              return (
                                <span
                                  key={s}
                                  className={cn(
                                    'text-3xs inline-flex items-center rounded-full border px-1.5 py-0.5 font-bold tracking-wider uppercase',
                                    meta?.chip ??
                                      'border-border bg-muted text-content-muted'
                                  )}
                                >
                                  {meta?.label ?? s}
                                </span>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className='text-2xs text-content-muted'>
                          {item.funnel_stage?.length
                            ? item.funnel_stage.join(', ')
                            : '—'}
                        </TableCell>
                        <TableCell className='text-2xs text-content-muted'>
                          {item.goal_tags?.length
                            ? item.goal_tags.join(', ')
                            : '—'}
                        </TableCell>
                        <TableCell className='text-2xs text-content-muted'>
                          {item.tone?.length ? item.tone.join(', ') : '—'}
                        </TableCell>
                        <TableCell className='text-2xs text-content-muted whitespace-nowrap'>
                          {item.needs_media && item.needs_media !== 'none'
                            ? item.needs_media
                            : '—'}
                          {item.has_cta && ' · CTA'}
                        </TableCell>
                        <TableCell className='text-center'>
                          <span
                            className={cn(
                              'inline-block size-2 rounded-full',
                              item.is_active ? 'bg-emerald-500' : 'bg-zinc-300'
                            )}
                            title={item.is_active ? 'Active' : 'Disabled'}
                          />
                        </TableCell>
                        <TableCell onClick={e => e.stopPropagation()}>
                          <div className='flex items-center justify-end gap-0.5'>
                            <button
                              type='button'
                              onClick={() => {
                                setFormInitial(item);
                                setFormOpen(true);
                              }}
                              className='text-content-muted hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md'
                              title='Sửa'
                            >
                              <Pencil className='size-3.5' />
                            </button>
                            <button
                              type='button'
                              onClick={() => handleToggleActive(item)}
                              className={cn(
                                'hover:bg-muted inline-flex size-7 items-center justify-center rounded-md',
                                item.is_active
                                  ? 'text-content-muted hover:text-amber-700'
                                  : 'text-content-muted hover:text-emerald-700'
                              )}
                              title={item.is_active ? 'Disable' : 'Enable'}
                            >
                              {item.is_active ? (
                                <PowerOff className='size-3.5' />
                              ) : (
                                <Power className='size-3.5' />
                              )}
                            </button>
                            <button
                              type='button'
                              onClick={() => handleDelete(item)}
                              className='text-content-muted hover:bg-danger-bg hover:text-destructive inline-flex size-7 items-center justify-center rounded-md'
                              title='Xoá'
                            >
                              <Trash2 className='size-3.5' />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className='border-border border-t px-2'>
                <TablePagination
                  total={items.length}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={s => {
                    setPageSize(s);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <BlockTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={formInitial}
        onSaved={load}
      />
    </div>
  );
}
