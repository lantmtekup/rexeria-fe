'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ExternalLinkIcon, RefreshCwIcon } from 'lucide-react';

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
import type { Template } from '@/services/rexer/types';

export function AdminTemplatesPage() {
  const t = useTranslations('admin');
  const tErrors = useTranslations('errors');

  const [items, setItems] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.templates.list();
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
            {t('templates.title')}
          </h1>
          <p className='text-content-muted text-sm'>
            {t('templates.subtitle', { total: items.length })}
          </p>
        </div>
        <Button variant='outline' onClick={load} disabled={loading}>
          <RefreshCwIcon className={cn('size-4', loading && 'animate-spin')} />
          {t('refresh')}
        </Button>
      </div>

      <p className='text-content-muted text-xs'>{t('templates.note')}</p>

      {errorMessage && (
        <p className='text-destructive text-sm' role='alert'>
          {errorMessage}
        </p>
      )}

      <div className='border-border rounded-lg border bg-white'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('templates.col.name')}</TableHead>
              <TableHead className='w-32'>{t('templates.col.code')}</TableHead>
              <TableHead className='w-28'>
                {t('templates.col.status')}
              </TableHead>
              <TableHead className='w-40'>
                {t('templates.col.created')}
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
                  {t('templates.empty')}
                </TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className='font-medium'>{item.name}</div>
                    {item.description && (
                      <div className='text-content-muted truncate text-xs'>
                        {item.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className='font-mono text-xs'>
                    {item.code}
                  </TableCell>
                  <TableCell>
                    <span className='rounded-full bg-neutral-100 px-2 py-0.5 text-xs'>
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
                      href={`/template/${item.id}`}
                      className='text-primary inline-flex items-center gap-1 text-xs hover:underline'
                    >
                      {t('templates.view')}
                      <ExternalLinkIcon className='size-3' />
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
