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
  Eye,
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

import { Input } from '@/components/atoms/input';
import { BlockTypeFormDialog } from '@/components/dialogs/BlockTypeFormDialog';
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
  const [selectedCode, setSelectedCode] = React.useState<string | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [formInitial, setFormInitial] = React.useState<AdminBlockType | null>(
    null
  );

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.adminBlockTypes.list({
        surface: surface === 'all' ? undefined : surface,
        q: debouncedSearch.trim() || undefined,
        is_active: showInactive ? undefined : true,
      });
      setItems(r.items ?? []);
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

  const selected = items.find(it => it.type === selectedCode) ?? null;

  return (
    <div className='flex h-[calc(100vh-3.5rem)]'>
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <div className='border-b border-zinc-200 bg-white px-6 py-4'>
          <div className='flex flex-wrap items-end justify-between gap-3'>
            <div>
              <div className='flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
                <Blocks className='size-3' /> Block types catalog
              </div>
              <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
                Catalog blocks hệ thống
              </h1>
              <p className='text-content-muted mt-1 text-sm'>
                Quản lý 14+ block types brand dùng để dựng landing/ad/curate.
                Mỗi type có <code className='font-mono'>props_schema</code> +{' '}
                <code className='font-mono'>supported_surfaces</code>.
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={load}
                disabled={loading}
                className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50'
              >
                <RefreshCw
                  className={cn('size-3.5', loading && 'animate-spin')}
                />
                Refresh
              </button>
              <button
                type='button'
                onClick={() => {
                  setFormInitial(null);
                  setFormOpen(true);
                }}
                className='inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'
              >
                <Plus className='size-3.5' />
                Tạo block type
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5'>
            <Stat label='Tổng' value={items.length} accent='zinc' />
            <Stat label='Landing' value={counts.landing} accent='rose' />
            <Stat label='Ad' value={counts.ad} accent='amber' />
            <Stat label='Curate' value={counts.curate} accent='violet' />
            <Stat label='Multi-surface' value={counts.multi} accent='emerald' />
          </div>

          {/* Toolbar */}
          <div className='mt-4 flex flex-wrap items-center gap-2'>
            <div className='relative max-w-sm flex-1'>
              <Search className='absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400' />
              <Input
                placeholder='Tìm theo code / name / category…'
                value={search}
                onChange={e => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <span className='inline-flex items-center gap-1 px-1 text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase'>
              <Filter className='size-3' /> Surface
            </span>
            {(['all', 'landing', 'ad', 'curate'] as const).map(s => (
              <button
                key={s}
                type='button'
                onClick={() => setSurface(s)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
                  surface === s
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                )}
              >
                {s === 'all' ? 'Tất cả' : (SURFACE_META[s]?.label ?? s)}
              </button>
            ))}
            <label className='ml-2 inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-zinc-600'>
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
        <div className='flex-1 overflow-y-auto bg-zinc-50/40 p-6'>
          {error && (
            <div className='mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800'>
              {error}
            </div>
          )}

          {loading && items.length === 0 ? (
            <div className='flex items-center justify-center py-20 text-sm text-zinc-500'>
              <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải catalog…
            </div>
          ) : items.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center'>
              <Blocks className='mx-auto size-8 text-zinc-300' />
              <p className='mt-3 text-[14px] font-semibold text-zinc-700'>
                Không có block type nào
              </p>
              <p className='mt-1 text-[12px] text-zinc-500'>
                Bấm &ldquo;Tạo block type&rdquo; hoặc đổi filter.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {items.map(item => (
                <BlockTypeCard
                  key={item.type}
                  item={item}
                  active={item.type === selectedCode}
                  onSelect={() => setSelectedCode(item.type)}
                  onToggle={() => handleToggleActive(item)}
                  onDelete={() => handleDelete(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <BlockTypeDrawer
          item={selected}
          onClose={() => setSelectedCode(null)}
          onToggle={() => handleToggleActive(selected)}
          onDelete={() => {
            handleDelete(selected);
            setSelectedCode(null);
          }}
          onEdit={() => {
            setFormInitial(selected);
            setFormOpen(true);
          }}
        />
      )}

      <BlockTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={formInitial}
        onSaved={load}
      />
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────────────────── */

function BlockTypeCard({
  item,
  active,
  onSelect,
  onToggle,
  onDelete,
}: {
  item: AdminBlockType;
  active: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const cat = item.category ? CATEGORY_META[item.category] : null;
  const surfaces = item.supported_surfaces ?? [];
  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        active
          ? 'border-zinc-900 ring-2 ring-zinc-900/10'
          : 'border-zinc-200 hover:border-zinc-300',
        !item.is_active && 'opacity-60'
      )}
    >
      <button
        type='button'
        onClick={onSelect}
        className='flex flex-1 flex-col gap-2 p-4 text-left'
      >
        <div className='flex items-start justify-between gap-2'>
          <div className='flex items-center gap-2'>
            {item.accent_color ? (
              <span
                className='inline-block size-3 shrink-0 rounded'
                style={{ backgroundColor: item.accent_color }}
                aria-hidden
              />
            ) : (
              cat && (
                <span className='text-lg' aria-hidden>
                  {cat.emoji}
                </span>
              )
            )}
            <code className='font-mono text-[12.5px] font-bold text-zinc-900'>
              {item.type}
            </code>
          </div>
          <div className='flex items-center gap-1'>
            {item.is_premium && (
              <span className='rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-700 uppercase'>
                premium
              </span>
            )}
            {!item.is_active && (
              <span className='rounded-full bg-zinc-200 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-zinc-600 uppercase'>
                disabled
              </span>
            )}
          </div>
        </div>
        <div className='text-[13px] font-semibold text-zinc-800'>
          {item.label_vi}
        </div>
        {item.description_vi && (
          <p className='line-clamp-2 text-[11.5px] leading-snug text-zinc-500'>
            {item.description_vi}
          </p>
        )}

        {/* Surfaces */}
        <div className='mt-1 flex flex-wrap gap-1'>
          {surfaces.map(s => {
            const meta = SURFACE_META[s];
            return (
              <span
                key={s}
                className={cn(
                  'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase',
                  meta?.chip ?? 'border-zinc-200 bg-zinc-100 text-zinc-700'
                )}
              >
                {meta?.label ?? s}
              </span>
            );
          })}
        </div>

        {item.min_dimensions && (
          <p className='font-mono text-[10px] text-zinc-400'>
            {item.min_dimensions.width}×{item.min_dimensions.height}px
          </p>
        )}
      </button>

      {/* Footer actions */}
      <div className='flex items-center gap-1 border-t border-zinc-100 bg-zinc-50/50 px-2 py-1.5'>
        <button
          type='button'
          onClick={onSelect}
          className='inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
        >
          <Eye className='size-3' />
          Xem
        </button>
        <button
          type='button'
          onClick={onToggle}
          className={cn(
            'inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium hover:bg-zinc-100',
            item.is_active
              ? 'text-zinc-600 hover:text-amber-700'
              : 'text-zinc-600 hover:text-emerald-700'
          )}
          title={item.is_active ? 'Disable type' : 'Enable type'}
        >
          {item.is_active ? (
            <PowerOff className='size-3' />
          ) : (
            <Power className='size-3' />
          )}
        </button>
        <button
          type='button'
          onClick={onDelete}
          className='inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-600 hover:bg-rose-50 hover:text-rose-700'
          title='Xoá'
        >
          <Trash2 className='size-3' />
        </button>
      </div>
    </div>
  );
}

/* ─── Drawer ─────────────────────────────────────────────────────────── */

function BlockTypeDrawer({
  item,
  onClose,
  onToggle,
  onDelete,
  onEdit,
}: {
  item: AdminBlockType;
  onClose: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <aside className='flex w-[420px] flex-col border-l border-zinc-200 bg-white'>
      <div className='flex items-start justify-between border-b border-zinc-100 px-4 py-3'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            {item.accent_color && (
              <span
                className='inline-block size-3 shrink-0 rounded'
                style={{ backgroundColor: item.accent_color }}
                aria-hidden
              />
            )}
            <code className='font-mono text-[13px] font-bold text-zinc-900'>
              {item.type}
            </code>
          </div>
          <p className='mt-0.5 text-[12px] text-zinc-600'>{item.label_vi}</p>
        </div>
        <button
          type='button'
          onClick={onClose}
          className='rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'
          aria-label='Close'
        >
          <Trash2 className='size-4' />
        </button>
      </div>

      <div className='flex-1 overflow-y-auto px-4 py-4 text-[12.5px]'>
        {item.description_vi && (
          <p className='leading-relaxed text-zinc-600'>{item.description_vi}</p>
        )}
        {item.label_en && (
          <p className='mt-1 text-[11px] text-zinc-500'>
            <span className='font-mono text-zinc-400'>EN:</span> {item.label_en}
            {item.description_en ? ` — ${item.description_en}` : ''}
          </p>
        )}

        <Section title='Surfaces'>
          <div className='flex flex-wrap gap-1.5'>
            {(item.supported_surfaces ?? []).map(s => {
              const meta = SURFACE_META[s];
              return (
                <span
                  key={s}
                  className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                    meta?.chip ?? 'border-zinc-200 bg-zinc-100 text-zinc-700'
                  )}
                >
                  {meta?.label ?? s}
                </span>
              );
            })}
          </div>
        </Section>

        {item.category && (
          <Section title='Category'>
            <span className='text-[12px] text-zinc-700'>
              {CATEGORY_META[item.category]?.emoji}{' '}
              {CATEGORY_META[item.category]?.label ?? item.category}
            </span>
          </Section>
        )}

        {item.min_dimensions && (
          <Section title='Min dimensions'>
            <code className='font-mono text-[11.5px] text-zinc-700'>
              {item.min_dimensions.width} × {item.min_dimensions.height}px
            </code>
          </Section>
        )}

        {item.engine_version && (
          <Section title='Engine'>
            <code className='rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700'>
              {item.engine_version}
            </code>
          </Section>
        )}

        {item.supported_slot_types && item.supported_slot_types.length > 0 && (
          <Section title='Supported slot types'>
            <div className='flex flex-wrap gap-1'>
              {item.supported_slot_types.map(s => (
                <code
                  key={s}
                  className='rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-700'
                >
                  {s}
                </code>
              ))}
            </div>
          </Section>
        )}

        <Section title='Props schema'>
          <pre className='overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-[10.5px] leading-relaxed text-zinc-700'>
            {JSON.stringify(item.props_schema ?? {}, null, 2)}
          </pre>
        </Section>
      </div>

      {/* Drawer footer actions */}
      <div className='border-t border-zinc-100 px-4 py-3'>
        <div className='grid grid-cols-3 gap-2'>
          <button
            type='button'
            onClick={onEdit}
            className='inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50'
          >
            <Pencil className='size-3.5' />
            Edit
          </button>
          <button
            type='button'
            onClick={onToggle}
            className='inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50'
          >
            {item.is_active ? (
              <PowerOff className='size-3.5' />
            ) : (
              <Power className='size-3.5' />
            )}
            {item.is_active ? 'Disable' : 'Enable'}
          </button>
          <button
            type='button'
            onClick={onDelete}
            className='inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs font-medium text-rose-700 hover:border-rose-300 hover:bg-rose-50'
          >
            <Trash2 className='size-3.5' />
            Xoá
          </button>
        </div>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='mt-4'>
      <div className='mb-1.5 text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase'>
        {title}
      </div>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'rose' | 'amber' | 'violet' | 'emerald' | 'zinc';
}) {
  const palette: Record<typeof accent, string> = {
    rose: 'border-rose-100 bg-rose-50/40 text-rose-700',
    amber: 'border-amber-100 bg-amber-50/40 text-amber-700',
    violet: 'border-violet-100 bg-violet-50/40 text-violet-700',
    emerald: 'border-emerald-100 bg-emerald-50/40 text-emerald-700',
    zinc: 'border-zinc-200 bg-white text-zinc-600',
  };
  return (
    <div
      className={cn('rounded-xl border px-3 py-2 shadow-sm', palette[accent])}
    >
      <div className='text-[9.5px] font-semibold tracking-[0.18em] uppercase opacity-75'>
        {label}
      </div>
      <div className='mt-0.5 font-mono text-lg font-bold text-zinc-900 tabular-nums'>
        {value}
      </div>
    </div>
  );
}
