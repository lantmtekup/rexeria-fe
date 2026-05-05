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
import { TemplateCategoryTabs } from '@/components/organisms/TemplateCategoryTabs';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { CanvasTemplate } from '@/services/rexer/types';

const CATEGORY_KEYS = [
  'all',
  'my',
  'fashion',
  'fnb',
  'course',
  'tech',
  'health',
  'book',
  'interior',
  'other',
] as const;

type CategoryKey = (typeof CATEGORY_KEYS)[number];

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  all: 'All',
  my: 'My Template',
  fashion: 'Fashion',
  fnb: 'F&B',
  course: 'Course',
  tech: 'Technology',
  health: 'Health',
  book: 'Book',
  interior: 'Interior',
  other: 'Other',
};

// Deterministic bucket derived from id until BE returns `category_key`
// per canvas template.
function deriveCategory(id: string): Exclude<CategoryKey, 'all' | 'my'> {
  const keys: Exclude<CategoryKey, 'all' | 'my'>[] = [
    'fashion',
    'fnb',
    'course',
    'tech',
    'health',
    'book',
    'interior',
    'other',
  ];
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return keys[h % keys.length]!;
}

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
        // BE oneof validator accepts only 'fabric' / '5.3.0'. Our
        // block_editor schema lives inside canvas_data — engine is just
        // a capability tag (see GAP / be-issues-master.md).
        engine: 'fabric',
        engine_version: '5.3.0',
        // Empty block-editor canvas — editor seeds blocks on first open.
        canvas_data: { schema: 'block_editor', version: 1, blocks: [] },
        is_template: false,
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
  const [activeCategory, setActiveCategory] =
    React.useState<CategoryKey>('all');
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

  const categorized = React.useMemo(
    () =>
      items.map(t => ({
        ...t,
        category: deriveCategory(t.id),
        // Until BE exposes ownership: treat user-drafts (is_template === false)
        // as "mine". Refine when /me + ownership is wired.
        isMine: !t.is_template,
      })),
    [items]
  );

  const filteredItems = React.useMemo(() => {
    if (activeCategory === 'all') return categorized;
    if (activeCategory === 'my') return categorized.filter(t => t.isMine);
    return categorized.filter(t => t.category === activeCategory);
  }, [categorized, activeCategory]);

  const categoryTabs = React.useMemo(
    () =>
      CATEGORY_KEYS.map(key => {
        const label = CATEGORY_LABELS[key];
        let count: number;
        if (key === 'all') count = categorized.length;
        else if (key === 'my') count = categorized.filter(t => t.isMine).length;
        else count = categorized.filter(t => t.category === key).length;
        return { key, label, count };
      }),
    [categorized]
  );

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

      <div className='mb-4 flex flex-col gap-3'>
        <TemplateCategoryTabs
          categories={categoryTabs}
          activeKey={activeCategory}
          onChange={key => setActiveCategory(key as CategoryKey)}
        />
        <div className='relative max-w-sm'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
          <Input
            placeholder='Search canvas templates…'
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
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Layers className='size-10' />}
          title={
            search || activeCategory !== 'all'
              ? 'No matches'
              : 'No canvas templates yet'
          }
          description={
            search
              ? 'Try a different search query.'
              : activeCategory !== 'all'
                ? `No canvas templates in category "${CATEGORY_LABELS[activeCategory]}".`
                : 'Create your first canvas to start designing reusable layouts.'
          }
          actions={
            !search &&
            activeCategory === 'all' && (
              <Button variant='pill' onClick={() => setCreateOpen(true)}>
                <Plus className='size-3.5' /> New canvas
              </Button>
            )
          }
        />
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredItems.map(t => (
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
