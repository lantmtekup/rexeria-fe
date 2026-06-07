'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PlusIcon, RefreshCwIcon, SearchIcon } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { ProductFormModal } from '@/app/(client-portal)/portal/products/_product-modal';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import { cn } from '@/lib/cn';
import type { Brand, Product, ProductStatus } from '@/services/rexer/types';

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<ProductStatus, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  active: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-neutral-200 text-neutral-600',
};

export function AdminProductsPage() {
  const t = useTranslations('admin');
  const tErrors = useTranslations('errors');

  const [items, setItems] = React.useState<Product[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [q, setQ] = React.useState('');
  const [brandFilter, setBrandFilter] = React.useState('');
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // Tạo product: dùng lại wizard portal (ProductFormModal). createBrand = brand
  // sẽ gắn cho product mới (admin tạo hộ). Rỗng → hỏi brand trước.
  const [creating, setCreating] = React.useState(false);
  const [createBrand, setCreateBrand] = React.useState('');

  const brandById = React.useMemo(() => {
    const m = new Map<string, Brand>();
    for (const b of brands) m.set(b.id, b);
    return m;
  }, [brands]);

  React.useEffect(() => {
    rexerApi.brands
      .list({ page: 1, limit: 200 })
      .then(r => setBrands(r.items ?? []))
      .catch(() => setBrands([]));
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rexerApi.products.list({
        page,
        limit: PAGE_SIZE,
        sort: '-created_at',
        ...(q ? { q } : {}),
        ...(brandFilter ? { brand_id: brandFilter } : {}),
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      const code =
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED';
      setError(code);
    } finally {
      setLoading(false);
    }
  }, [page, q, brandFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => setPage(1), [q, brandFilter]);

  const errorMessage = error
    ? (() => {
        try {
          return (tErrors as (key: string) => string)(error);
        } catch {
          return error;
        }
      })()
    : null;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('products.title')}
          </h1>
          <p className='text-content-muted text-sm'>
            {t('products.subtitle', { total })}
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={load} disabled={loading}>
            <RefreshCwIcon
              className={cn('size-4', loading && 'animate-spin')}
            />
            {t('refresh')}
          </Button>
          <Button
            variant='primary'
            onClick={() => {
              setCreateBrand(brandFilter);
              setCreating(true);
            }}
          >
            <PlusIcon className='size-4' />
            {t('products.create')}
          </Button>
        </div>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          setQ(searchInput.trim());
        }}
        className='border-border flex flex-wrap gap-2 rounded-lg border bg-neutral-50 p-3'
      >
        <div className='relative min-w-[220px] flex-1'>
          <SearchIcon className='text-content-muted absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className='pl-9'
          />
        </div>
        <select
          value={brandFilter}
          onChange={e => setBrandFilter(e.target.value)}
          className='border-border text-content-muted rounded-md border bg-white px-3 py-2 text-sm outline-none'
          aria-label='Brand'
        >
          <option value=''>Tất cả brand</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <Button type='submit' variant='outline'>
          {t('search')}
        </Button>
      </form>

      {errorMessage && (
        <p className='text-destructive text-sm' role='alert'>
          {errorMessage}
        </p>
      )}

      <div className='border-border rounded-lg border bg-white'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('products.col.name')}</TableHead>
              <TableHead className='w-44'>Brand</TableHead>
              <TableHead className='w-32'>{t('products.col.sku')}</TableHead>
              <TableHead className='w-32'>{t('products.col.status')}</TableHead>
              <TableHead className='w-40'>
                {t('products.col.created')}
              </TableHead>
              <TableHead className='w-24' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-content-muted py-8 text-center'
                >
                  {t('products.empty')}
                </TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className='font-medium'>
                    <div className='truncate'>{item.name}</div>
                    {item.slug && (
                      <div className='text-content-muted truncate text-xs'>
                        /{item.slug}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {item.brand_id ? (
                      <Link
                        href={`/admin/users/${item.brand_id}`}
                        className='text-content-muted hover:text-foreground hover:underline'
                      >
                        {brandById.get(item.brand_id)?.name ??
                          `${item.brand_id.slice(0, 8)}…`}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className='text-xs'>{item.sku || '—'}</TableCell>
                  <TableCell>
                    {item.status ? (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs',
                          STATUS_BADGE[item.status]
                        )}
                      >
                        {t(`products.status.${item.status}`)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className='text-xs'>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/product/${item.id}/information`}
                      className='text-primary text-xs hover:underline'
                    >
                      {t('products.edit')}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > PAGE_SIZE && (
        <div className='flex items-center justify-between text-sm'>
          <span className='text-content-muted'>
            {t('pageOf', { page, total: totalPages })}
          </span>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              {t('prev')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              {t('next')}
            </Button>
          </div>
        </div>
      )}

      {/* Chọn brand trước (nếu chưa lọc theo brand) → rồi mở wizard portal. */}
      {creating && !createBrand && (
        <BrandPickDialog
          brands={brands}
          onPick={id => setCreateBrand(id)}
          onCancel={() => setCreating(false)}
        />
      )}

      {/* Dùng lại đúng wizard tạo product của portal (đồng bộ trải nghiệm). */}
      {creating && createBrand && (
        <ProductFormModal
          open
          product={null}
          brandId={createBrand}
          liveBE
          onClose={() => {
            setCreating(false);
            setCreateBrand('');
          }}
          onSave={() => {
            setCreating(false);
            setCreateBrand('');
            load();
          }}
        />
      )}
    </div>
  );
}

/* Chọn brand đích trước khi mở wizard (admin tạo product hộ brand). */
function BrandPickDialog({
  brands,
  onPick,
  onCancel,
}: {
  brands: Brand[];
  onPick: (brandId: string) => void;
  onCancel: () => void;
}) {
  const [brandId, setBrandId] = React.useState('');
  return (
    <Dialog open onOpenChange={o => !o && onCancel()}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Tạo sản phẩm cho brand</DialogTitle>
          <p className='text-content-muted text-xs'>
            Chọn brand sẽ sở hữu sản phẩm này.
          </p>
        </DialogHeader>
        <div>
          <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
            Brand
          </Label>
          <select
            value={brandId}
            onChange={e => setBrandId(e.target.value)}
            className='border-border mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none'
          >
            <option value=''>Chọn brand…</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button variant='pill-light' size='sm' onClick={onCancel}>
            Huỷ
          </Button>
          <Button
            variant='pill'
            size='sm'
            disabled={!brandId}
            onClick={() => brandId && onPick(brandId)}
          >
            Tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
