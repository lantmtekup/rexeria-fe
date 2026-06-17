'use client';

/**
 * Admin asset library (toàn hệ thống) — `/admin/assets`. Quản lý asset/folder
 * cho BẤT KỲ brand nào: chọn brand → <MediaLibrary brandId> (upload/folder/
 * delete/move/rename/tag/search). Dùng chung component với portal.
 *
 * ⚠️ Cần BE ship brand_id scoping cho media/folders (be-spec-admin-asset-scope-
 * 2026-06-07) thì platform admin mới scope đúng brand; media-list đã honor
 * brand_id, folders hiện 403 — chờ BE.
 */

import * as React from 'react';
import { Images, Loader2 } from 'lucide-react';

import { MediaLibrary } from '@/components/modules/Media/MediaLibrary';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Brand } from '@/services/rexer/types';

export default function AdminAssetsPage() {
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [brandId, setBrandId] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    rexerApi.brands
      .list({ page: 1, limit: 200 })
      .then(r => {
        const items = r.items ?? [];
        setBrands(items);
        setBrandId(items[0]?.id ?? '');
      })
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <div className='text-3xs text-content-muted flex items-center gap-2 font-semibold tracking-[0.18em] uppercase'>
            <Images className='size-3' /> Asset library
          </div>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
            Asset toàn hệ thống
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            Quản lý hình ảnh, video, tài liệu cho từng brand, upload hộ, tổ chức
            thư mục, gắn tag.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-3xs text-muted-foreground font-semibold tracking-wider uppercase'>
            Brand
          </label>
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            disabled={brands.length === 0}
            className='border-border bg-background rounded-lg border px-3 py-1.5 text-sm outline-none disabled:opacity-50'
          >
            {brands.length === 0 ? (
              <option value=''>-</option>
            ) : (
              brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div className='text-content-muted flex items-center justify-center gap-2 py-20 text-sm'>
          <Loader2 className='size-4 animate-spin' /> Đang tải brand…
        </div>
      ) : !brandId ? (
        <div className='border-border text-content-muted rounded-2xl border border-dashed py-16 text-center text-sm'>
          Chọn brand để quản lý asset.
        </div>
      ) : (
        <MediaLibrary key={brandId} brandId={brandId} />
      )}
    </div>
  );
}
