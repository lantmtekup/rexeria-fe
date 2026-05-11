'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PlusIcon, RefreshCwIcon, SearchIcon } from 'lucide-react';

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
import { cn } from '@/lib/cn';
import type { Product, ProductStatus } from '@/services/rexer/types';

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<ProductStatus, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  active: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-neutral-200 text-neutral-600',
};

export function AdminProductsPage() {
  const t = useTranslations('admin');
  const tErrors = useTranslations('errors');
  const router = useRouter();

  const [items, setItems] = React.useState<Product[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [q, setQ] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rexerApi.products.list({
        page,
        limit: PAGE_SIZE,
        sort: '-created_at',
        ...(q ? { q } : {}),
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
  }, [page, q]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await rexerApi.products.create({ name: 'Sản phẩm mới' });
      router.push(`/product/${res.product.id}/information`);
    } catch (err) {
      const code =
        err instanceof RxApiError
          ? err.code || err.message
          : 'CREATE_PRODUCT_FAILED';
      setError(code);
    } finally {
      setCreating(false);
    }
  };

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
          <Button variant='primary' onClick={handleCreate} disabled={creating}>
            <PlusIcon className='size-4' />
            {creating ? t('creating') : t('products.create')}
          </Button>
        </div>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          setQ(searchInput.trim());
          setPage(1);
        }}
        className='border-border flex gap-2 rounded-lg border bg-neutral-50 p-3'
      >
        <div className='relative flex-1'>
          <SearchIcon className='text-content-muted absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={t('products.searchPlaceholder')}
            className='pl-9'
          />
        </div>
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
                  colSpan={5}
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
    </div>
  );
}
