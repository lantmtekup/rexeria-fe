'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Database, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Spinner } from '@/components/atoms/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import { EmptyState } from '@/components/molecules/EmptyState';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { dataCollectionRemote as dataCollectionLocal } from '@/services/dataCollection.remote';
import type { DataCollection } from '@/types/dataCollection';

const COLOR_PALETTE = [
  '#4f46e5',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#ea580c',
  '#db2777',
];

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

function CreateCollectionDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (c: DataCollection) => void;
}) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState(COLOR_PALETTE[0]);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setColor(COLOR_PALETTE[0]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const res = await dataCollectionLocal.createCollection({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(`"${res.data.name}" created`);
      onCreated(res.data);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <DialogHeader>
            <DialogTitle>New collection</DialogTitle>
            <DialogDescription>
              A collection is a custom data table — you define the fields, then
              add records.
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='c-name'>Name</Label>
            <Input
              id='c-name'
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Customers, Inventory, Posts…'
              required
              disabled={submitting}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='c-desc'>Description</Label>
            <Textarea
              id='c-desc'
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Optional — short note about what this stores.'
              disabled={submitting}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Accent color</Label>
            <div className='flex flex-wrap gap-2'>
              {COLOR_PALETTE.map(c => (
                <button
                  key={c}
                  type='button'
                  onClick={() => setColor(c)}
                  aria-label={`color ${c}`}
                  className='h-7 w-7 rounded-full ring-offset-2 transition-shadow'
                  style={{
                    background: c,
                    boxShadow:
                      c === color
                        ? `0 0 0 2px white, 0 0 0 4px ${c}`
                        : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              disabled={submitting || !name.trim()}
            >
              {submitting ? 'Creating…' : 'Create collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CollectionList() {
  const [collections, setCollections] = React.useState<DataCollection[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await dataCollectionLocal.getCollections({
        is_active: true,
        search: search.trim() || undefined,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setCollections(res.data.collections);
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = async (c: DataCollection) => {
    if (
      !window.confirm(
        `Archive "${c.name}"? Records stay in storage but the collection is hidden.`
      )
    )
      return;
    const res = await dataCollectionLocal.deleteCollection(c.id);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success('Archived');
    reload();
  };

  return (
    <div className='mx-auto w-full max-w-[1100px] px-8 py-6'>
      <SectionHeader
        title='Collections'
        actions={
          <Button variant='pill' size='sm' onClick={() => setCreateOpen(true)}>
            <Plus className='size-3.5' /> New collection
          </Button>
        }
      />

      <div className='relative mb-4 max-w-sm'>
        <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
        <Input
          placeholder='Search collections…'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='h-9 pl-9'
        />
      </div>

      {loading ? (
        <div className='text-muted-foreground flex justify-center py-16'>
          <Spinner size={20} />
        </div>
      ) : collections.length === 0 ? (
        <EmptyState
          icon={<Database className='size-10' />}
          title={search ? 'No matching collections' : 'No collections yet'}
          description={
            search
              ? 'Try a different search query.'
              : 'Create your first collection to start defining a custom data table.'
          }
          actions={
            !search && (
              <Button variant='pill' onClick={() => setCreateOpen(true)}>
                <Plus className='size-3.5' /> New collection
              </Button>
            )
          }
        />
      ) : (
        <div className='border-border bg-background overflow-hidden rounded-xl border'>
          <ul className='flex flex-col divide-y divide-neutral-100'>
            {collections.map(c => (
              <li key={c.id}>
                <div className='hover:bg-muted/40 flex items-center justify-between gap-3 px-5 py-4 transition-colors'>
                  <Link
                    href={`/collections/${c.id}`}
                    className='flex min-w-0 flex-1 items-center gap-3'
                  >
                    <span
                      className='inline-flex size-9 shrink-0 items-center justify-center rounded-lg'
                      style={{
                        background: `${c.color || '#4f46e5'}1a`,
                        color: c.color || '#4f46e5',
                      }}
                    >
                      <Database className='size-4' />
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='text-foreground truncate font-medium'>
                        {c.name}
                      </p>
                      <p className='text-muted-foreground truncate text-xs'>
                        /{c.slug} · v{c.version} · {c.fields.length} field(s) ·{' '}
                        {c.record_count} record(s) · updated{' '}
                        {formatDate(c.updated_at)}
                      </p>
                    </div>
                  </Link>
                  {c.is_template && <Badge variant='secondary'>Template</Badge>}
                  <Button
                    variant='ghost'
                    size='icon'
                    className='text-muted-foreground hover:text-destructive size-8'
                    onClick={() => handleDelete(c)}
                    aria-label='Archive collection'
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                  <Link
                    href={`/collections/${c.id}`}
                    className='text-muted-foreground'
                  >
                    <ChevronRight className='size-4' />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CreateCollectionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => reload()}
      />
    </div>
  );
}
