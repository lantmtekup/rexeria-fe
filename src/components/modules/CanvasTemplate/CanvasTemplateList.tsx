'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, Plus, Search, Trash2 } from 'lucide-react';
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
import { EmptyState } from '@/components/molecules/EmptyState';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { CanvasTemplate } from '@/services/rexer/types';

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function formatBytes(b?: number): string {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}

function CreateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (t: CanvasTemplate) => void;
}) {
  const [name, setName] = React.useState('');
  const [width, setWidth] = React.useState(800);
  const [height, setHeight] = React.useState(600);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName('');
      setWidth(800);
      setHeight(600);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const created = await rexerApi.canvasTemplates.create({
        name: name.trim(),
        width,
        height,
        engine: 'fabric',
        engine_version: 'fabric@7.3.1',
        // Empty Fabric scene — editor populates on first save.
        canvas_data: { version: '7.3.1', objects: [] },
      });
      toast.success(`"${created.name}" created`);
      onCreated(created);
      onOpenChange(false);
    } catch (err) {
      toast.error(`Create failed: ${rxErrorMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <DialogHeader>
            <DialogTitle>New canvas template</DialogTitle>
            <DialogDescription>
              Pick a name and dimensions. You can change the canvas in the
              editor.
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='ct-name'>Name</Label>
            <Input
              id='ct-name'
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Hero v1'
              required
              disabled={submitting}
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='ct-w'>Width (px)</Label>
              <Input
                id='ct-w'
                type='number'
                min={1}
                max={10000}
                value={width}
                onChange={e => setWidth(Number(e.target.value))}
                disabled={submitting}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='ct-h'>Height (px)</Label>
              <Input
                id='ct-h'
                type='number'
                min={1}
                max={10000}
                value={height}
                onChange={e => setHeight(Number(e.target.value))}
                disabled={submitting}
              />
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
              {submitting ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CanvasTemplateList() {
  const router = useRouter();
  const [items, setItems] = React.useState<CanvasTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await rexerApi.canvasTemplates.list({
        is_active: true,
        q: search.trim() || undefined,
        limit: 50,
      });
      setItems(r.items);
    } catch (err) {
      toast.error(`Failed to load: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = async (t: CanvasTemplate) => {
    if (
      !window.confirm(
        `Archive "${t.name}"? Canvas data stays in storage but the template is hidden.`
      )
    )
      return;
    try {
      await rexerApi.canvasTemplates.remove(t.id);
      toast.success('Archived');
      reload();
    } catch (err) {
      toast.error(`Archive failed: ${rxErrorMessage(err)}`);
    }
  };

  return (
    <div className='mx-auto w-full max-w-[1100px] px-8 py-6'>
      <SectionHeader
        title='Canvas templates'
        actions={
          <Button variant='pill' size='sm' onClick={() => setCreateOpen(true)}>
            <Plus className='size-3.5' /> New canvas
          </Button>
        }
      />

      <div className='relative mb-4 max-w-sm'>
        <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
        <Input
          placeholder='Search canvas templates…'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='h-9 pl-9'
        />
      </div>

      {loading ? (
        <div className='text-muted-foreground flex justify-center py-16'>
          <Spinner size={20} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Layers className='size-10' />}
          title={search ? 'No matches' : 'No canvas templates yet'}
          description={
            search
              ? 'Try a different search query.'
              : 'Create your first canvas to start designing reusable layouts.'
          }
          actions={
            !search && (
              <Button variant='pill' onClick={() => setCreateOpen(true)}>
                <Plus className='size-3.5' /> New canvas
              </Button>
            )
          }
        />
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {items.map(t => (
            <article
              key={t.id}
              className='border-border bg-background hover:border-primary group flex flex-col overflow-hidden rounded-xl border transition-colors'
            >
              <Link
                href={`/canvas-templates/${t.id}`}
                className='block aspect-video overflow-hidden bg-neutral-100'
              >
                {t.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.thumbnail_url}
                    alt={t.name}
                    className='size-full object-cover'
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <Layers className='text-muted-foreground size-10' />
                  </div>
                )}
              </Link>
              <div className='flex items-start justify-between gap-2 p-3'>
                <Link
                  href={`/canvas-templates/${t.id}`}
                  className='min-w-0 flex-1'
                >
                  <p className='text-foreground truncate font-medium'>
                    {t.name}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {t.width}×{t.height} · {formatBytes(t.canvas_size_bytes)} ·
                    v{t.version}
                  </p>
                </Link>
                <div className='flex items-center gap-1'>
                  {t.is_template && <Badge variant='secondary'>Template</Badge>}
                  <Button
                    variant='ghost'
                    size='icon'
                    className='text-muted-foreground hover:text-destructive size-7'
                    onClick={() => handleDelete(t)}
                    aria-label='Archive canvas'
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <CreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={t => {
          reload();
          router.push(`/canvas-templates/${t.id}`);
        }}
      />
    </div>
  );
}
