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

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
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

  const selected = items.find(it => it.type === selectedCode) ?? null;

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
                Quản lý block types brand dùng để dựng landing/ad/curate. Mỗi
                type có <code className='font-mono'>props_schema</code> +{' '}
                <code className='font-mono'>supported_surfaces</code>.
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
        'group bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        active
          ? 'border-foreground ring-foreground/10 ring-2'
          : 'border-border hover:border-border',
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
            <code className='text-foreground font-mono text-xs font-bold'>
              {item.type}
            </code>
          </div>
          <div className='flex items-center gap-1'>
            {item.is_premium && (
              <span className='text-3xs rounded-full bg-amber-100 px-1.5 py-0.5 font-bold tracking-wider text-amber-700 uppercase'>
                premium
              </span>
            )}
            {!item.is_active && (
              <span className='text-3xs text-content-muted bg-muted rounded-full px-1.5 py-0.5 font-bold tracking-wider uppercase'>
                disabled
              </span>
            )}
          </div>
        </div>
        <div className='text-foreground text-sm font-semibold'>
          {item.label_vi}
        </div>
        {item.description_vi && (
          <p className='text-2xs text-content-muted line-clamp-2 leading-snug'>
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
                  'text-3xs inline-flex items-center rounded-full border px-1.5 py-0.5 font-bold tracking-wider uppercase',
                  meta?.chip ?? 'border-border bg-muted text-content-muted'
                )}
              >
                {meta?.label ?? s}
              </span>
            );
          })}
        </div>

        {item.min_dimensions && (
          <p className='text-3xs text-muted-foreground font-mono'>
            {item.min_dimensions.width}×{item.min_dimensions.height}px
          </p>
        )}
      </button>

      {/* Footer actions */}
      <div className='border-border bg-muted/50 flex items-center gap-1 border-t px-2 py-1.5'>
        <button
          type='button'
          onClick={onSelect}
          className='text-2xs text-content-muted hover:bg-muted hover:text-foreground inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1 font-medium'
        >
          <Eye className='size-3' />
          Xem
        </button>
        <button
          type='button'
          onClick={onToggle}
          className={cn(
            'text-2xs hover:bg-muted inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 font-medium',
            item.is_active
              ? 'text-content-muted hover:text-amber-700'
              : 'text-content-muted hover:text-emerald-700'
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
          className='text-2xs text-content-muted hover:bg-danger-bg hover:text-destructive inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 font-medium'
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
    <aside className='border-border bg-card flex w-[420px] flex-col border-l'>
      <div className='border-border flex items-start justify-between border-b px-4 py-3'>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            {item.accent_color && (
              <span
                className='inline-block size-3 shrink-0 rounded'
                style={{ backgroundColor: item.accent_color }}
                aria-hidden
              />
            )}
            <code className='text-foreground font-mono text-sm font-bold'>
              {item.type}
            </code>
          </div>
          <p className='text-content-muted mt-0.5 text-xs'>{item.label_vi}</p>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={onClose}
          aria-label='Close'
        >
          <Trash2 className='size-4' />
        </Button>
      </div>

      <div className='flex-1 overflow-y-auto px-4 py-4 text-xs'>
        {item.description_vi && (
          <p className='text-content-muted leading-relaxed'>
            {item.description_vi}
          </p>
        )}
        {item.label_en && (
          <p className='text-2xs text-content-muted mt-1'>
            <span className='text-muted-foreground font-mono'>EN:</span>{' '}
            {item.label_en}
            {item.description_en ? `: ${item.description_en}` : ''}
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
                    'text-3xs inline-flex items-center rounded-full border px-2 py-0.5 font-bold tracking-wider uppercase',
                    meta?.chip ?? 'border-border bg-muted text-content-muted'
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
            <span className='text-content-muted text-xs'>
              {CATEGORY_META[item.category]?.emoji}{' '}
              {CATEGORY_META[item.category]?.label ?? item.category}
            </span>
          </Section>
        )}

        {(item.function ||
          item.page_role ||
          item.proof_type ||
          item.has_cta ||
          (item.needs_media && item.needs_media !== 'none') ||
          item.funnel_stage?.length ||
          item.goal_tags?.length ||
          item.tone?.length ||
          item.industry_fit?.length) && (
          <Section title='AI taxonomy'>
            <dl className='flex flex-col gap-1.5'>
              {item.function && (
                <TaxoRow label='Function' value={item.function} />
              )}
              {item.page_role && (
                <TaxoRow label='Vị trí' value={item.page_role} />
              )}
              {!!item.funnel_stage?.length && (
                <TaxoRow label='Funnel' value={item.funnel_stage.join(', ')} />
              )}
              {!!item.goal_tags?.length && (
                <TaxoRow label='Goals' value={item.goal_tags.join(', ')} />
              )}
              {!!item.tone?.length && (
                <TaxoRow label='Tone' value={item.tone.join(', ')} />
              )}
              {!!item.industry_fit?.length && (
                <TaxoRow
                  label='Industry'
                  value={item.industry_fit.join(', ')}
                />
              )}
              {item.proof_type && (
                <TaxoRow label='Proof' value={item.proof_type} />
              )}
              {item.needs_media && item.needs_media !== 'none' && (
                <TaxoRow label='Media' value={item.needs_media} />
              )}
              <TaxoRow label='CTA' value={item.has_cta ? 'có' : 'không'} />
            </dl>
          </Section>
        )}

        {item.min_dimensions && (
          <Section title='Min dimensions'>
            <code className='text-2xs text-content-muted font-mono'>
              {item.min_dimensions.width} × {item.min_dimensions.height}px
            </code>
          </Section>
        )}

        {item.engine_version && (
          <Section title='Engine'>
            <code className='text-2xs bg-muted text-content-muted rounded px-1.5 py-0.5 font-mono'>
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
                  className='text-3xs bg-muted text-content-muted rounded px-1.5 py-0.5 font-mono'
                >
                  {s}
                </code>
              ))}
            </div>
          </Section>
        )}

        <Section title='Props schema'>
          <pre className='text-3xs border-border bg-muted text-content-muted overflow-x-auto rounded-lg border p-3 font-mono leading-relaxed'>
            {JSON.stringify(item.props_schema ?? {}, null, 2)}
          </pre>
        </Section>
      </div>

      {/* Drawer footer actions */}
      <div className='border-border border-t px-4 py-3'>
        <div className='grid grid-cols-3 gap-2'>
          <Button
            type='button'
            variant='neutral'
            size='sm'
            onClick={onEdit}
            className='w-full'
          >
            <Pencil className='size-3.5' />
            Edit
          </Button>
          <Button
            type='button'
            variant='neutral'
            size='sm'
            onClick={onToggle}
            className='w-full'
          >
            {item.is_active ? (
              <PowerOff className='size-3.5' />
            ) : (
              <Power className='size-3.5' />
            )}
            {item.is_active ? 'Disable' : 'Enable'}
          </Button>
          <Button
            type='button'
            variant='destructive'
            size='sm'
            onClick={onDelete}
            className='w-full'
          >
            <Trash2 className='size-3.5' />
            Xoá
          </Button>
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
      <div className='text-3xs text-muted-foreground mb-1.5 font-semibold tracking-[0.18em] uppercase'>
        {title}
      </div>
      {children}
    </div>
  );
}

/** Một dòng label/value cho block AI taxonomy trong drawer. */
function TaxoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-baseline gap-2'>
      <dt className='text-muted-foreground w-16 shrink-0 font-mono'>{label}</dt>
      <dd className='text-content-muted'>{value}</dd>
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
    zinc: 'border-border bg-card text-content-muted',
  };
  return (
    <div
      className={cn('rounded-xl border px-3 py-2 shadow-sm', palette[accent])}
    >
      <div className='text-3xs font-semibold tracking-[0.18em] uppercase opacity-75'>
        {label}
      </div>
      <div className='text-foreground mt-0.5 font-mono text-lg font-bold tabular-nums'>
        {value}
      </div>
    </div>
  );
}
