'use client';

/**
 * Brand-portal template library — Rexer-curated landing pages the user can
 * clone into their workspace. Standard list affordances: search, sort, grid
 * + table view, pagination. BE endpoint
 * `GET /v1/portal/templates/library` (be-todo.md P0.7). Falls back to
 * `canvas-templates?is_template=true` if the endpoint isn't shipped yet.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LayoutTemplate,
  Loader2,
  Search,
  Sparkles,
  Table as TableIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/atoms/input';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { CanvasTemplate } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

import { useActiveWorkspace } from '../_workspace';
import { PortalShell } from '../_shell';

type View = 'grid' | 'table';
type Sort = '-updated_at' | '-created_at' | 'name';

const SORT_OPTIONS: { id: Sort; label: string }[] = [
  { id: '-updated_at', label: 'Mới cập nhật' },
  { id: '-created_at', label: 'Mới nhất' },
  { id: 'name', label: 'Tên A→Z' },
];

const LIMIT = 12;

export default function PortalTemplateLibraryPage() {
  const router = useRouter();
  const activeWs = useActiveWorkspace();
  const [items, setItems] = React.useState<CanvasTemplate[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [sort, setSort] = React.useState<Sort>('-updated_at');
  const [view, setView] = React.useState<View>('table');
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [cloning, setCloning] = React.useState<string | null>(null);
  const [pendingEndpoint, setPendingEndpoint] = React.useState(false);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const query = { page, limit: LIMIT, q: debouncedSearch || undefined, sort };
    rexerApi.portal
      .listTemplateLibrary(query)
      .then(res => {
        if (cancelled) return;
        setItems(res.items ?? []);
        setTotal(res.total ?? res.items?.length ?? 0);
        setTotalPages(Math.max(1, res.total_pages ?? 1));
        setPendingEndpoint(false);
      })
      .catch(err => {
        if (cancelled) return;
        // Legacy fallback (canvas-templates) removed in Wave 2 cutover —
        // BE no longer serves /v1/canvas-templates post-Migration 134.
        const code =
          err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED';
        toast.error(`Không load được template library: ${code}`);
        setItems([]);
        setTotal(0);
        setTotalPages(1);
        setPendingEndpoint(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, sort, page]);

  // Brand instantiates a template into their active workspace. Canonical:
  // POST /workspaces/:wsId/pages { type:'landing', template_id }
  // (replaces legacy POST /canvas-templates/:id/clone-to-workspace).
  const cloneIntoWorkspace = async (tpl: CanvasTemplate) => {
    if (!activeWs.id) {
      toast.error('Cần workspace hợp lệ trước khi tạo landing');
      return;
    }
    setCloning(tpl.id);
    try {
      const page = await rexerApi.pages.create(activeWs.id, {
        template_id: tpl.id,
        type: 'landing',
        name: tpl.name,
      });
      toast.success(`Đã tạo landing "${page.name}" từ template`);
      // TODO(wave-3): redirect to canonical brand slot-fill editor when
      // shipped (e.g. /portal/landing-pages/:id/edit). For now, surface the
      // new page in the landings list.
      router.push('/portal/landing-pages');
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'CREATE_FAILED';
      toast.error(`Tạo landing thất bại: ${msg}`);
    } finally {
      setCloning(null);
    }
  };

  return (
    <PortalShell>
      <section>
        <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
          <LayoutTemplate className='size-3' /> Template library
        </div>
        <h1 className='mt-1 text-2xl font-bold tracking-tight'>
          Bắt đầu từ template
        </h1>
        <p className='text-content-muted mt-1 text-sm'>
          Chọn 1 template Rexer đã thiết kế sẵn, click{' '}
          <strong>Dùng template</strong> để tạo landing page trong workspace của
          bạn — sửa nội dung + publish khi sẵn sàng.
        </p>

        {pendingEndpoint && (
          <div className='text-2xs mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800'>
            BE chưa ship <code>/portal/templates/library</code> — đang fallback
            sang <code>canvas-templates?is_template=true</code>. UI tự live khi
            BE merge (be-todo.md P0.7).
          </div>
        )}
      </section>

      {/* Toolbar — search + sort + view */}
      <div className='border-border mt-5 flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-2 shadow-sm'>
        <div className='relative max-w-sm flex-1'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
          <Input
            placeholder='Tìm theo tên / mô tả…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <div className='relative inline-flex items-center'>
          <ArrowDownUp className='text-muted-foreground pointer-events-none absolute left-2.5 size-3.5' />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as Sort)}
            className='border-border text-content-muted hover:bg-muted appearance-none rounded-lg border bg-white py-1.5 pr-3 pl-7 text-xs font-medium outline-none focus:border-zinc-400'
            aria-label='Sort'
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className='border-border ml-auto inline-flex items-center gap-0.5 rounded-lg border bg-white p-0.5'>
          <ViewBtn
            active={view === 'grid'}
            onClick={() => setView('grid')}
            icon={<LayoutGrid className='size-3.5' />}
            label='Grid'
          />
          <ViewBtn
            active={view === 'table'}
            onClick={() => setView('table')}
            icon={<TableIcon className='size-3.5' />}
            label='Table'
          />
        </div>
      </div>

      {/* List body */}
      <div className='mt-5'>
        {loading && items.length === 0 ? (
          <div className='text-content-muted flex items-center justify-center py-16 text-sm'>
            <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải template…
          </div>
        ) : items.length === 0 ? (
          <div className='border-border rounded-2xl border bg-white p-12 text-center'>
            <Sparkles className='text-muted-foreground mx-auto size-8' />
            <p className='text-content-muted mt-3 text-sm font-semibold'>
              {debouncedSearch
                ? 'Không có template khớp tìm kiếm'
                : 'Rexer chưa publish template nào'}
            </p>
            <p className='text-content-muted mt-1 text-xs'>
              {debouncedSearch
                ? 'Thử từ khoá khác hoặc clear filter.'
                : 'Sẽ có sớm — staff Rexer đang chuẩn bị bộ template demo.'}
            </p>
          </div>
        ) : view === 'grid' ? (
          <GridView
            items={items}
            onUse={cloneIntoWorkspace}
            cloning={cloning}
          />
        ) : (
          <TableView
            items={items}
            onUse={cloneIntoWorkspace}
            cloning={cloning}
          />
        )}

        {items.length > 0 && totalPages > 1 && (
          <div className='mt-5'>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={LIMIT}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </PortalShell>
  );
}

/* ─── Grid ──────────────────────────────────────────────────────────── */

function GridView({
  items,
  onUse,
  cloning,
}: {
  items: CanvasTemplate[];
  onUse: (t: CanvasTemplate) => void;
  cloning: string | null;
}) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {items.map(tpl => (
        <TemplateCard
          key={tpl.id}
          tpl={tpl}
          onUse={() => onUse(tpl)}
          loading={cloning === tpl.id}
        />
      ))}
    </div>
  );
}

function TemplateCard({
  tpl,
  onUse,
  loading,
}: {
  tpl: CanvasTemplate;
  onUse: () => void;
  loading: boolean;
}) {
  return (
    <div className='group border-border hover:border-border flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      <div className='relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-zinc-200 to-zinc-300'>
        {tpl.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tpl.thumbnail_url}
            alt={tpl.name}
            className='size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
          />
        ) : (
          <div className='text-muted-foreground flex h-full items-center justify-center'>
            <LayoutTemplate className='size-10' />
          </div>
        )}
      </div>
      <div className='flex flex-1 flex-col gap-2 p-3.5'>
        <h3 className='text-foreground truncate text-sm font-semibold'>
          {tpl.name}
        </h3>
        {tpl.description && (
          <p className='text-2xs text-content-muted line-clamp-2'>
            {tpl.description}
          </p>
        )}
        <button
          type='button'
          onClick={onUse}
          disabled={loading}
          className={cn(
            'mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          {loading ? (
            <>
              <Loader2 className='size-3.5 animate-spin' /> Đang clone…
            </>
          ) : (
            <>
              <Sparkles className='size-3.5' /> Dùng template này
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Table ─────────────────────────────────────────────────────────── */

function TableView({
  items,
  onUse,
  cloning,
}: {
  items: CanvasTemplate[];
  onUse: (t: CanvasTemplate) => void;
  cloning: string | null;
}) {
  return (
    <div className='border-border overflow-hidden rounded-2xl border bg-white shadow-sm'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-border bg-muted/50 border-b'>
            <th className='text-content-muted w-20 px-4 py-2 text-left font-medium'>
              Thumb
            </th>
            <th className='text-content-muted px-4 py-2 text-left font-medium'>
              Tên
            </th>
            <th className='text-content-muted hidden px-4 py-2 text-left font-medium sm:table-cell'>
              Mô tả
            </th>
            <th className='text-content-muted w-32 px-4 py-2 text-right font-medium' />
          </tr>
        </thead>
        <tbody>
          {items.map(tpl => (
            <tr key={tpl.id} className='border-border border-b last:border-0'>
              <td className='px-4 py-2'>
                <div className='border-border aspect-[4/3] w-16 overflow-hidden rounded-md border bg-gradient-to-br from-zinc-100 to-zinc-200'>
                  {tpl.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tpl.thumbnail_url}
                      alt={tpl.name}
                      className='size-full object-cover'
                    />
                  ) : (
                    <div className='text-muted-foreground flex h-full items-center justify-center'>
                      <LayoutTemplate className='size-4' />
                    </div>
                  )}
                </div>
              </td>
              <td className='px-4 py-2'>
                <div className='text-foreground font-semibold'>{tpl.name}</div>
                <div className='text-3xs text-muted-foreground font-mono'>
                  {tpl.id.slice(0, 12)}…
                </div>
              </td>
              <td className='hidden px-4 py-2 sm:table-cell'>
                <p className='text-content-muted line-clamp-2 max-w-md text-xs'>
                  {tpl.description || (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </p>
              </td>
              <td className='px-4 py-2 text-right'>
                <button
                  type='button'
                  onClick={() => onUse(tpl)}
                  disabled={cloning === tpl.id}
                  className='text-2xs inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60'
                >
                  {cloning === tpl.id ? (
                    <>
                      <Loader2 className='size-3 animate-spin' /> Cloning…
                    </>
                  ) : (
                    <>
                      <Sparkles className='size-3' /> Dùng
                    </>
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Pagination ────────────────────────────────────────────────────── */

function Pagination({
  page,
  totalPages,
  total,
  limit,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (next: number) => void;
}) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages: (number | 'gap')[] = [];
  const add = (n: number) => {
    if (!pages.includes(n) && n >= 1 && n <= totalPages) pages.push(n);
  };
  add(1);
  if (page - 1 > 2) pages.push('gap');
  add(page - 1);
  add(page);
  add(page + 1);
  if (page + 1 < totalPages - 1) pages.push('gap');
  add(totalPages);

  return (
    <div className='border-border flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-2.5 shadow-sm'>
      <span className='text-2xs text-content-muted'>
        {from}–{to} trong {total}
      </span>
      <div className='flex items-center gap-1'>
        <button
          type='button'
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className='border-border text-content-muted hover:bg-muted inline-flex size-7 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronLeft className='size-3.5' />
        </button>
        {pages.map((p, i) =>
          p === 'gap' ? (
            <span
              key={`gap-${i}`}
              className='text-2xs text-muted-foreground px-1'
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type='button'
              onClick={() => onChange(p)}
              className={cn(
                'text-2xs inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 font-mono font-semibold tabular-nums',
                p === page
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'border-border text-content-muted hover:bg-muted border bg-white'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          type='button'
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className='border-border text-content-muted hover:bg-muted inline-flex size-7 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronRight className='size-3.5' />
        </button>
      </div>
    </div>
  );
}

function ViewBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      title={label}
      className={cn(
        'text-2xs flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors',
        active ? 'bg-zinc-900 text-white' : 'text-content-muted hover:bg-muted'
      )}
    >
      {icon}
    </button>
  );
}
