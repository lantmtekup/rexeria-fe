'use client';

import * as React from 'react';
import { ImageIcon, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Spinner } from '@/components/atoms/spinner';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Product } from '@/services/rexer/types';

import { UseTemplateDialog } from './UseTemplateDialog';

type Scope = 'all' | 'library' | 'mine';

const CATEGORY_FILTERS: Array<{ value: string | null; label: string }> = [
  { value: null, label: 'Tất cả' },
  { value: 'fmcg', label: 'FMCG' },
  { value: 'fashion', label: 'Thời trang' },
  { value: 'f&b', label: 'F&B' },
  { value: 'cosmetics', label: 'Mỹ phẩm' },
  { value: 'electronics', label: 'Điện tử' },
  { value: 'home', label: 'Gia dụng' },
];

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Lỗi';
}

/**
 * Browse + use product templates. Wraps `GET /products?is_template=true` with
 * scope filters (library vs my templates) and a "Sử dụng template" CTA per
 * card that opens UseTemplateDialog → server-side clone → redirect.
 */
export function ProductTemplateList() {
  const [scope, setScope] = React.useState<Scope>('all');
  const [category, setCategory] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [picked, setPicked] = React.useState<Product | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof rexerApi.products.list>[0] = {
        is_template: true,
        limit: 60,
        ...(category ? { template_category: category } : {}),
        ...(query.trim() ? { q: query.trim() } : {}),
      };
      // Scope filter — `is_public_template` distinguishes library vs my templates.
      if (scope === 'library') params.is_public_template = true;
      else if (scope === 'mine') params.is_public_template = false;
      const r = await rexerApi.products.list(params);
      setItems(r.items ?? []);
    } catch (err) {
      toast.error(`Không tải được templates: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [scope, category, query]);

  // Debounce search query.
  React.useEffect(() => {
    const t = setTimeout(reload, 250);
    return () => clearTimeout(t);
  }, [reload]);

  return (
    <div className='flex flex-col gap-4'>
      {/* Filters bar */}
      <div className='flex flex-wrap items-center gap-2'>
        <ScopeTabs scope={scope} onChange={setScope} />
        <div className='flex flex-1 items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2'>
          <Search className='size-3.5 text-neutral-400' />
          <input
            type='text'
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Tìm template theo tên…'
            className='h-8 flex-1 bg-transparent text-xs outline-none placeholder:text-neutral-400'
          />
        </div>
      </div>

      {/* Category chips */}
      <div className='-mb-1 flex flex-wrap gap-1.5'>
        {CATEGORY_FILTERS.map(c => (
          <button
            key={c.value ?? 'all'}
            type='button'
            onClick={() => setCategory(c.value)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
              category === c.value
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className='flex justify-center py-16 text-neutral-500'>
          <Spinner size={20} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState scope={scope} />
      ) : (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {items.map(t => (
            <TemplateTile key={t.id} template={t} onPick={() => setPicked(t)} />
          ))}
        </div>
      )}

      <UseTemplateDialog
        open={picked !== null}
        template={picked}
        onOpenChange={open => {
          if (!open) setPicked(null);
        }}
      />
    </div>
  );
}

function ScopeTabs({
  scope,
  onChange,
}: {
  scope: Scope;
  onChange: (s: Scope) => void;
}) {
  const tabs: Array<{ value: Scope; label: string }> = [
    { value: 'all', label: 'Tất cả' },
    { value: 'library', label: 'Thư viện' },
    { value: 'mine', label: 'Của tôi' },
  ];
  return (
    <div className='inline-flex rounded-md border border-neutral-200 bg-white p-0.5 text-xs font-semibold'>
      {tabs.map(t => (
        <button
          key={t.value}
          type='button'
          onClick={() => onChange(t.value)}
          className={cn(
            'cursor-pointer rounded-sm px-3 py-1 transition-colors',
            scope === t.value
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function TemplateTile({
  template,
  onPick,
}: {
  template: Product;
  onPick: () => void;
}) {
  const colorCount = template.colors?.length ?? 0;
  const featureCount = template.features?.length ?? 0;
  return (
    <div className='group border-border hover:border-primary relative flex flex-col overflow-hidden rounded-xl border bg-white transition-colors'>
      {/* Thumbnail */}
      <div className='relative aspect-square overflow-hidden bg-neutral-100'>
        {template.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnail_url}
            alt={template.name}
            className='size-full object-cover transition-transform group-hover:scale-105'
          />
        ) : (
          <div className='flex size-full items-center justify-center text-neutral-300'>
            <ImageIcon className='size-8' />
          </div>
        )}
        {template.is_public_template && (
          <span
            aria-label='Public template (library)'
            className='absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-violet-600/90 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase'
          >
            <Sparkles className='size-3' />
            Library
          </span>
        )}
      </div>

      <div className='flex flex-col gap-1 p-3'>
        <p className='text-foreground line-clamp-2 text-sm leading-tight font-semibold'>
          {template.name}
        </p>
        <div className='text-muted-foreground flex flex-wrap items-center gap-2 text-[10px]'>
          {template.template_category && (
            <span className='inline-flex items-center rounded-full bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-700'>
              {template.template_category}
            </span>
          )}
          {colorCount > 0 && <span>{colorCount} màu</span>}
          {featureCount > 0 && <span>{featureCount} feature</span>}
        </div>

        <button
          type='button'
          onClick={onPick}
          className='mt-2 inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-neutral-900 text-xs font-semibold text-white transition-colors hover:bg-neutral-800'
        >
          <Sparkles className='size-3.5' />
          Sử dụng template
        </button>
      </div>
    </div>
  );
}

function EmptyState({ scope }: { scope: Scope }) {
  const msg =
    scope === 'mine'
      ? 'Bạn chưa lưu template nào. Vào trang sản phẩm → "Lưu thành template" để tạo.'
      : scope === 'library'
        ? 'Thư viện template đang trống. Quay lại sau hoặc đổi sang "Của tôi".'
        : 'Chưa có template nào. Tạo từ sản phẩm hiện có để bắt đầu.';
  return (
    <div className='flex flex-col items-center gap-2 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center'>
      <Sparkles className='size-6 text-neutral-300' />
      <p className='text-sm text-neutral-500'>{msg}</p>
    </div>
  );
}
