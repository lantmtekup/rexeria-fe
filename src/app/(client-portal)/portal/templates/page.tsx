'use client';

/**
 * Brand-portal template library — Rexer-curated canvas templates the user
 * can clone into their workspace as a new landing page.
 *
 * BE: `GET /v1/portal/templates/library` + `POST /canvas-templates/{id}/clone-to-workspace`
 * (be-todo.md P0.7). If endpoint isn't shipped, falls back to listing
 * canvas-templates with `is_template=true` from the generic endpoint.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LayoutTemplate, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/atoms/input';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { CanvasTemplate } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

import { useActiveWorkspace } from '../_workspace';
import { PortalShell } from '../_shell';

export default function PortalTemplateLibraryPage() {
  const router = useRouter();
  const activeWs = useActiveWorkspace();
  const [items, setItems] = React.useState<CanvasTemplate[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [cloning, setCloning] = React.useState<string | null>(null);
  const [pendingEndpoint, setPendingEndpoint] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    rexerApi.portal
      .listTemplateLibrary({ limit: 50 })
      .then(res => {
        if (cancelled) return;
        setItems(res.items ?? []);
      })
      .catch(async err => {
        if (cancelled) return;
        if (err instanceof RxApiError && err.status === 404) {
          // BE chưa ship endpoint — fallback list canvas_templates với is_template=true
          try {
            const r = await rexerApi.canvasTemplates.list({
              is_template: true,
              limit: 50,
            });
            setItems(r.items ?? []);
            setPendingEndpoint(true);
          } catch {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q)
    );
  }, [items, search]);

  const cloneIntoWorkspace = async (tpl: CanvasTemplate) => {
    setCloning(tpl.id);
    try {
      const created = await rexerApi.canvasTemplates.cloneToWorkspace(tpl.id, {
        workspace_id: activeWs.id,
      });
      toast.success(`Đã tạo landing "${created.name}" từ template`);
      router.push(`/canvas-templates/${created.id}`);
    } catch (err) {
      if (err instanceof RxApiError && err.status === 404) {
        toast.error(
          'BE chưa ship endpoint clone-to-workspace (be-todo.md P0.7). Nhắc BE merge.'
        );
      } else {
        const msg =
          err instanceof RxApiError
            ? err.code || err.message
            : err instanceof Error
              ? err.message
              : 'CLONE_FAILED';
        toast.error(`Clone thất bại: ${msg}`);
      }
    } finally {
      setCloning(null);
    }
  };

  return (
    <PortalShell>
      <section>
        <div className='flex items-center gap-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
          <LayoutTemplate className='size-3' /> Template library
        </div>
        <h1 className='mt-1 text-2xl font-bold tracking-tight'>
          Bắt đầu từ template
        </h1>
        <p className='mt-1 text-[13px] text-zinc-500'>
          Chọn 1 template Rexer đã thiết kế sẵn, click{' '}
          <strong>Dùng template</strong> để tạo landing page trong workspace của
          bạn — sửa nội dung + publish khi sẵn sàng.
        </p>

        {pendingEndpoint && (
          <div className='mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800'>
            BE chưa ship <code>/portal/templates/library</code> — đang fallback
            sang <code>canvas-templates?is_template=true</code>. UI tự live khi
            BE merge (be-todo.md P0.7).
          </div>
        )}
      </section>

      <Input
        placeholder='Tìm theo tên / mô tả…'
        value={search}
        onChange={e => setSearch(e.target.value)}
        className='mt-4 max-w-md'
      />

      <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {loading && items.length === 0 && (
          <div className='col-span-full flex items-center justify-center py-12 text-sm text-zinc-500'>
            <Loader2 className='mr-2 size-4 animate-spin' />
            Đang tải template…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className='col-span-full rounded-2xl border border-zinc-200 bg-white p-8 text-center'>
            <Sparkles className='mx-auto size-8 text-zinc-300' />
            <p className='mt-3 text-sm font-semibold text-zinc-700'>
              {items.length === 0
                ? 'Rexer chưa publish template nào'
                : 'Không có template khớp tìm kiếm'}
            </p>
            <p className='mt-1 text-[12px] text-zinc-500'>
              {items.length === 0
                ? 'Sẽ có sớm — staff Rexer đang chuẩn bị bộ template demo.'
                : 'Thử từ khoá khác hoặc xoá filter.'}
            </p>
          </div>
        )}

        {filtered.map(tpl => (
          <div
            key={tpl.id}
            className='group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md'
          >
            <div
              className='relative h-40 bg-gradient-to-br from-zinc-200 to-zinc-300'
              style={
                tpl.thumbnail_url
                  ? {
                      backgroundImage: `url(${tpl.thumbnail_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : undefined
              }
            >
              {!tpl.thumbnail_url && (
                <div className='flex h-full items-center justify-center text-zinc-400'>
                  <LayoutTemplate className='size-10' />
                </div>
              )}
            </div>
            <div className='flex flex-1 flex-col gap-2 p-3'>
              <div className='truncate text-[14px] font-semibold text-zinc-800'>
                {tpl.name}
              </div>
              {tpl.description && (
                <p className='line-clamp-2 text-[11.5px] text-zinc-500'>
                  {tpl.description}
                </p>
              )}
              <button
                type='button'
                onClick={() => cloneIntoWorkspace(tpl)}
                disabled={cloning === tpl.id}
                className={cn(
                  'mt-auto flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700',
                  cloning === tpl.id && 'cursor-not-allowed opacity-60'
                )}
              >
                {cloning === tpl.id ? (
                  <>
                    <Loader2 className='size-3.5 animate-spin' />
                    Đang clone…
                  </>
                ) : (
                  <>
                    <Sparkles className='size-3.5' />
                    Dùng template này
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
