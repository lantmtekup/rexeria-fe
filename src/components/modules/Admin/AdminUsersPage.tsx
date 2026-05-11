'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RefreshCwIcon } from 'lucide-react';

import { Button } from '@/components/atoms/button';
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
import type { Client } from '@/services/rexer/types';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  suspended: 'bg-red-100 text-red-800',
};

export function AdminUsersPage() {
  const t = useTranslations('admin');
  const tErrors = useTranslations('errors');

  const [items, setItems] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.clients.list();
      setItems(r.items);
    } catch (err) {
      const code =
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED';
      setError(code);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const errorMessage = error
    ? (() => {
        try {
          return (tErrors as (key: string) => string)(error);
        } catch {
          return error;
        }
      })()
    : null;

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('users.title')}
          </h1>
          <p className='text-content-muted text-sm'>
            {t('users.subtitle', { total: items.length })}
          </p>
        </div>
        <Button variant='outline' onClick={load} disabled={loading}>
          <RefreshCwIcon className={cn('size-4', loading && 'animate-spin')} />
          {t('refresh')}
        </Button>
      </div>

      <p className='text-content-muted text-xs'>{t('users.note')}</p>

      {errorMessage && (
        <p className='text-destructive text-sm' role='alert'>
          {errorMessage}
        </p>
      )}

      <div className='border-border rounded-lg border bg-white'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('users.col.name')}</TableHead>
              <TableHead className='w-32'>{t('users.col.status')}</TableHead>
              <TableHead className='w-40'>{t('users.col.created')}</TableHead>
              <TableHead className='w-32' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && !loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='text-content-muted py-8 text-center'
                >
                  {t('users.empty')}
                </TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className='font-medium'>{item.name}</div>
                    <div className='text-content-muted truncate font-mono text-xs'>
                      {item.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs',
                        STATUS_BADGE[item.status] ??
                          'bg-neutral-100 text-neutral-700'
                      )}
                    >
                      {item.status || '—'}
                    </span>
                  </TableCell>
                  <TableCell className='text-xs'>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/cms/contacts/${item.id}`}
                      className='text-primary text-xs hover:underline'
                    >
                      {t('users.view')}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
