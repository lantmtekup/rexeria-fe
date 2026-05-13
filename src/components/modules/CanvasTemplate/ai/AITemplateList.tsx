'use client';

import * as React from 'react';
import { Layers, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Input } from '@/components/atoms/input';
import { Spinner } from '@/components/atoms/spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { AIInputFormDialog } from '@/components/dialogs/AIInputFormDialog';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { AITemplate } from '@/services/rexer/types';

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function AITemplateList() {
  const [items, setItems] = React.useState<AITemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [pickedId, setPickedId] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await rexerApi.aiTemplates.list({
        q: search.trim() || undefined,
        limit: 50,
      });
      setItems(r.items);
    } catch (err) {
      toast.error(`Failed to load: ${rxMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className='mx-auto w-full max-w-[1100px] px-8 py-6'>
      <SectionHeader title='AI Templates' />

      <div className='mb-4 flex flex-col gap-3'>
        <div className='relative max-w-sm'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
          <Input
            placeholder='Search AI templates…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='h-9 pl-9'
          />
        </div>
      </div>

      {loading ? (
        <div className='text-muted-foreground flex justify-center py-16'>
          <Spinner size={20} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Layers className='size-10' />}
          title='No AI templates available'
          description='Ask your admin to publish AI templates from the admin builder.'
        />
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {items.map(t => (
            <button
              key={t.id}
              type='button'
              onClick={() => setPickedId(t.id)}
              className='border-border bg-background hover:border-primary group flex flex-col overflow-hidden rounded-xl border text-left transition-colors'
            >
              <div className='block aspect-video overflow-hidden bg-neutral-100'>
                {t.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.thumbnail_url}
                    alt={t.name}
                    className='size-full object-cover'
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <Sparkles className='text-muted-foreground size-10' />
                  </div>
                )}
              </div>
              <div className='flex items-start justify-between gap-2 p-3'>
                <div className='min-w-0 flex-1'>
                  <p className='text-foreground truncate font-medium'>
                    {t.name}
                  </p>
                  <p className='text-muted-foreground line-clamp-2 text-xs'>
                    {t.description ?? '—'}
                  </p>
                </div>
                <Badge variant='secondary'>AI</Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      <AIInputFormDialog
        templateId={pickedId}
        onClose={() => setPickedId(null)}
      />
    </div>
  );
}
