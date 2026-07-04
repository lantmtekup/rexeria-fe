'use client';

/**
 * Admin — quản lý ad-creative (Page.type='ad', type_metadata.format=
 * 'interactive_widget') across mọi brand. Portal chỉ review (Preview/Sửa/
 * Nhúng/Báo cáo) — TẠO MỚI nằm ở đây vì `POST /templates` chỉ role
 * admin/staff gọi được (brand gọi 403, đã verify thật qua Playwright).
 *
 * ⚠️ Tạo mới hiện CÒN CHẶN bởi 1 giới hạn BE khác: template mới luôn nhận
 * `target_page_type: 'landing'` mặc định, không có field nào để set 'ad' —
 * `pages.create({type:'ad', template_id})` sẽ 400 `ERR_PAGE_TYPE_MISMATCH`
 * cho tới khi BE ship field này (xem
 * docs/be-spec-interactive-ad-creative-2026-07-02.md §0.1). Dialog vẫn build
 * đầy đủ + đúng để chạy ngay khi BE xong, không cần sửa FE thêm.
 */

import { Loader2, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Brand, Page, Workspace } from '@/services/rexer/types';

export function AdminAdCreativesPage() {
  const [pages, setPages] = React.useState<Page[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [versionToTemplate, setVersionToTemplate] = React.useState<
    Map<string, string>
  >(new Map());
  const [brandById, setBrandById] = React.useState<Map<string, Brand>>(
    new Map()
  );

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      rexerApi.pages.listAll({ type: 'ad', limit: 100 }),
      rexerApi.templates.list({ limit: 500 }).catch(() => ({ items: [] })),
      rexerApi.brands.list({ limit: 200 }).catch(() => ({ items: [] })),
    ]).then(([pageRes, tplRes, brandRes]) => {
      setPages(pageRes.items ?? []);
      const vMap = new Map<string, string>();
      for (const tpl of tplRes.items ?? []) {
        if (tpl.current_version_id) vMap.set(tpl.current_version_id, tpl.id);
      }
      setVersionToTemplate(vMap);
      const bMap = new Map<string, Brand>();
      for (const b of brandRes.items ?? []) bMap.set(b.id, b);
      setBrandById(bMap);
      setLoading(false);
    });
  }, []);

  React.useEffect(load, [load]);

  const adCreatives = React.useMemo(
    () =>
      pages.filter(p => {
        const meta = p.type_metadata as { format?: string } | undefined;
        return meta?.format === 'interactive_widget';
      }),
    [pages]
  );

  return (
    <div className='p-6'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Ad Creatives — mọi brand
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            Dựng widget quảng cáo tương tác cho brand, gán vào workspace của họ.
          </p>
        </div>
        <Button type='button' size='sm' onClick={() => setCreateOpen(true)}>
          <Plus className='size-3.5' />
          Tạo ad creative
        </Button>
      </div>

      {loading ? (
        <div className='mt-10 flex justify-center'>
          <Loader2 className='text-content-muted size-6 animate-spin' />
        </div>
      ) : adCreatives.length === 0 ? (
        <div className='border-border text-content-muted bg-card mt-6 rounded-2xl border border-dashed p-10 text-center text-sm'>
          Chưa có ad creative nào.
        </div>
      ) : (
        <table className='mt-6 w-full text-sm'>
          <thead>
            <tr className='text-content-muted text-3xs border-border border-b text-left tracking-wider uppercase'>
              <th className='py-2 font-semibold'>Tên</th>
              <th className='py-2 font-semibold'>Brand</th>
              <th className='py-2 font-semibold'>Status</th>
              <th className='py-2 font-semibold'>Cập nhật</th>
              <th className='py-2 font-semibold'>Sửa</th>
              <th className='py-2 font-semibold'>Nhúng</th>
              <th className='py-2 font-semibold'>Báo cáo</th>
            </tr>
          </thead>
          <tbody>
            {adCreatives.map(p => {
              const templateId = versionToTemplate.get(p.template_version_id);
              return (
                <tr key={p.id} className='border-border border-b'>
                  <td className='py-2'>{p.name}</td>
                  <td className='py-2 font-mono text-xs'>
                    {brandById.get(p.brand_id)?.name ?? p.brand_id}
                  </td>
                  <td className='py-2'>{p.status}</td>
                  <td className='py-2 font-mono text-xs'>
                    {new Date(p.updated_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className='py-2'>
                    {templateId ? (
                      <Link
                        href={`/canvas-templates/${templateId}`}
                        className='text-content-muted hover:text-foreground inline-flex items-center gap-1'
                      >
                        <Pencil className='size-3' /> Sửa
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className='py-2'>
                    <Link
                      href={`/portal/ad-creatives/${p.id}/embed`}
                      className='text-content-muted hover:text-foreground'
                    >
                      Nhúng
                    </Link>
                  </td>
                  <td className='py-2'>
                    <Link
                      href={`/portal/ad-creatives/${p.id}/analytics`}
                      className='text-content-muted hover:text-foreground'
                    >
                      Báo cáo
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <CreateAdCreativeDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={load}
      />
    </div>
  );
}

function CreateAdCreativeDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const router = useRouter();
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [brandId, setBrandId] = React.useState('');
  const [workspaceId, setWorkspaceId] = React.useState('');
  const [name, setName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setName('');
    setBrandId('');
    setWorkspaceId('');
    setWorkspaces([]);
    setError(null);
    rexerApi.brands
      .list({ limit: 200 })
      .then(r => setBrands(r.items ?? []))
      .catch(() => setBrands([]));
  }, [open]);

  React.useEffect(() => {
    if (!brandId) {
      setWorkspaces([]);
      setWorkspaceId('');
      return;
    }
    rexerApi.brands.workspaces
      .list(brandId)
      .then(r => {
        const items = r.items ?? [];
        setWorkspaces(items);
        setWorkspaceId(items.find(w => w.is_default)?.id ?? items[0]?.id ?? '');
      })
      .catch(() => setWorkspaces([]));
  }, [brandId]);

  if (!open) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError('Nhập tên ad creative.');
    if (!workspaceId) return setError('Chọn brand có workspace.');

    setSubmitting(true);
    setError(null);
    try {
      const code = `ad_${Math.random().toString(36).slice(2, 10)}`;
      const tpl = await rexerApi.templates.create({
        code,
        name: trimmed,
        preview_mode: 'static',
        status: 'draft',
        target_page_type: 'ad',
      });
      // Template mới chưa có current_version_id — phải commit 1 version
      // rỗng trước khi pages.create() chấp nhận template_id này. BE đọc
      // canvas_blueprint từ draft buffer (draft_canvas_blueprint), KHÔNG
      // từ field trong request này — bỏ trống, editor sẽ ghi draft khi
      // user thêm block rồi tự "Save Version" lại từ đó.
      await rexerApi.templates.createVersion(tpl.id, {
        version: '1.0.0',
        schema_version: '2.0',
        field_schema_json: {},
        default_config_json: {},
      });
      await rexerApi.pages.create(workspaceId, {
        type: 'ad',
        template_id: tpl.id,
        name: trimmed,
        workspace_id: workspaceId,
        type_metadata: {
          format: 'interactive_widget',
          dimensions: { width: 800, height: 450 },
          interactive: {
            layout: 'inline',
            trigger: 'on_load',
            trigger_config: {},
            closeable: true,
          },
        },
      });
      toast.success(`Đã tạo "${trimmed}"`);
      onCreated();
      onClose();
      router.push(`/canvas-templates/${tpl.id}`);
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'CREATE_FAILED';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className='bg-background my-16 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl'
      >
        <div className='border-border border-b px-5 py-3'>
          <h3 className='text-base font-semibold'>Tạo ad creative mới</h3>
        </div>

        <div className='space-y-3 px-5 py-4'>
          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              Brand <span className='text-destructive'>*</span>
            </label>
            <select
              value={brandId}
              onChange={e => setBrandId(e.target.value)}
              className='border-border bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none'
            >
              <option value=''>— chọn brand —</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              Workspace <span className='text-destructive'>*</span>
            </label>
            <select
              value={workspaceId}
              onChange={e => setWorkspaceId(e.target.value)}
              disabled={!brandId}
              className='border-border bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none disabled:opacity-50'
            >
              <option value=''>— chọn workspace —</option>
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              Tên ad creative <span className='text-destructive'>*</span>
            </label>
            <input
              type='text'
              value={name}
              maxLength={200}
              onChange={e => setName(e.target.value)}
              placeholder='VD: Happy City — ưu đãi ra mắt'
              className='border-border bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none'
            />
          </div>

          {error && (
            <div className='border-destructive/20 bg-danger-bg text-destructive rounded-lg border px-3 py-2 text-xs'>
              {error}
            </div>
          )}
        </div>

        <div className='border-border bg-muted/50 flex items-center justify-end gap-2 border-t px-5 py-3'>
          <Button
            type='button'
            variant='neutral'
            size='sm'
            onClick={onClose}
            disabled={submitting}
          >
            Huỷ
          </Button>
          <Button
            type='submit'
            size='sm'
            disabled={submitting || !name.trim() || !workspaceId}
          >
            {submitting ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Plus className='size-3.5' />
            )}
            {submitting ? 'Đang tạo…' : 'Tạo'}
          </Button>
        </div>
      </form>
    </div>
  );
}
