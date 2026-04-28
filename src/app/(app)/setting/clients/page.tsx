'use client';

import * as React from 'react';
import Link from 'next/link';
import { Building2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { ClientFormDialog } from '@/components/dialogs/ClientFormDialog';
import { EmptyState } from '@/components/molecules/EmptyState';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Client } from '@/services/rexer/types';

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

export default function ClientsListPage() {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await rexerApi.clients.list();
      setClients(r.items);
    } catch (err) {
      toast.error(`Failed to load clients: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleCreate = async (values: {
    name: string;
    status: 'active' | 'inactive';
  }) => {
    setSubmitting(true);
    try {
      const created = await rexerApi.clients.create(values);
      toast.success(`Client "${created.name}" created`);
      setCreateOpen(false);
      await reload();
    } catch (err) {
      toast.error(`Create failed: ${rxErrorMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='mx-auto w-full max-w-[1100px] px-8 py-6'>
      <div className='flex items-center gap-2 text-xs'>
        <Link
          href='/setting'
          className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1'
        >
          <ChevronLeft className='size-3.5' /> Settings
        </Link>
      </div>

      <SectionHeader
        title='Clients'
        actions={
          <Button variant='pill' size='sm' onClick={() => setCreateOpen(true)}>
            <Plus className='size-3.5' /> New client
          </Button>
        }
      />

      {loading ? (
        <div className='text-muted-foreground flex justify-center py-16'>
          <Spinner size={20} />
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<Building2 className='size-10' />}
          title='No client workspaces yet'
          description='Create your first client to scope landings, users and reports.'
          actions={
            <Button variant='pill' onClick={() => setCreateOpen(true)}>
              <Plus className='size-3.5' /> New client
            </Button>
          }
        />
      ) : (
        <div className='border-border bg-background overflow-hidden rounded-xl border'>
          <ul className='flex flex-col divide-y divide-neutral-100'>
            {clients.map(c => (
              <li key={c.id}>
                <Link
                  href={`/setting/clients/${c.id}`}
                  className='hover:bg-muted/50 flex items-center justify-between gap-4 px-5 py-4 transition-colors'
                >
                  <div className='flex min-w-0 flex-1 items-center gap-3'>
                    <span className='bg-primary/10 text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-lg font-semibold'>
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                    <div className='min-w-0'>
                      <p className='text-foreground truncate font-medium'>
                        {c.name}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        Created {formatDate(c.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={c.status === 'active' ? 'default' : 'outline'}
                    className='capitalize'
                  >
                    {c.status}
                  </Badge>
                  <ChevronRight className='text-muted-foreground size-4' />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ClientFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        submitting={submitting}
        onSubmit={handleCreate}
      />
    </div>
  );
}
