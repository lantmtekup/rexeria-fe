'use client';

import * as React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Expand,
  LayoutTemplate,
  Package,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Skeleton } from '@/components/atoms/skeleton';
import { Textarea } from '@/components/atoms/textarea';
import { EmptyState } from '@/components/molecules/EmptyState';
import type { Product, Template, Workspace } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

import { SelectTile } from './_bits';
import { TemplatePreviewOverlay } from './TemplatePreviewOverlay';

function filterByName<T extends { name: string }>(items: T[], q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return items;
  return items.filter(it => it.name.toLowerCase().includes(needle));
}

/* ────────────────────────────────────────────────────────────────────────
 * Bước ①  — chọn BẢN GỐC: gallery + preview lớn sống.
 * ──────────────────────────────────────────────────────────────────────── */

export function StepTemplate({
  loading,
  templates,
  workspaces,
  templateId,
  setTemplateId,
  workspaceId,
  setWorkspaceId,
  canNext,
  onNext,
}: {
  loading: boolean;
  templates: Template[];
  workspaces: Workspace[];
  templateId: string;
  setTemplateId: (id: string) => void;
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
  canNext: boolean;
  onNext: () => void;
}) {
  const [previewTpl, setPreviewTpl] = React.useState<Template | null>(null);
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');

  if (loading) return <TemplateSkeleton />;

  const selected = templates.find(t => t.id === templateId) ?? null;
  const filtered = filterByName(templates, query);
  const previewTarget = templates.find(t => t.id === hoverId) ?? selected;

  return (
    <section className='space-y-4'>
      <SectionHead
        index={1}
        title='Bản gốc'
        hint='Chọn 1 trang đã duyệt làm khuôn'
      >
        {workspaces.length > 1 && (
          <select
            value={workspaceId}
            onChange={e => setWorkspaceId(e.target.value)}
            aria-label='Workspace'
            className='border-input bg-background text-foreground focus-visible:ring-ring h-8 rounded-md border px-2.5 text-xs outline-none focus-visible:ring-2'
          >
            {workspaces.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        )}
      </SectionHead>

      {templates.length === 0 ? (
        <EmptyState
          icon={<LayoutTemplate className='size-6' />}
          title='Chưa có trang nào'
          description='Kích hoạt một trang ở mục Landing pages để dùng làm bản gốc.'
        />
      ) : (
        <div className='grid gap-5 md:grid-cols-[320px_minmax(0,1fr)]'>
          {/* Gallery */}
          <div className='border-border flex flex-col overflow-hidden rounded-xl border'>
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder='Tìm trang gốc…'
            />
            {filtered.length === 0 ? (
              <p className='text-content-muted px-3 py-8 text-center text-sm'>
                Không tìm thấy trang khớp “{query}”.
              </p>
            ) : (
              <ul className='divide-border max-h-[460px] divide-y overflow-y-auto'>
                {filtered.map(t => (
                  <li key={t.id}>
                    <GalleryRow
                      template={t}
                      selected={templateId === t.id}
                      onSelect={() => setTemplateId(t.id)}
                      onHover={() => setHoverId(t.id)}
                      onLeave={() => setHoverId(null)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Preview lớn */}
          <PreviewPane
            template={previewTarget}
            onFull={() => previewTarget && setPreviewTpl(previewTarget)}
          />
        </div>
      )}

      {/* Footer điều hướng */}
      <div className='border-border flex items-center justify-between gap-3 border-t pt-4'>
        <p className='text-content-muted min-w-0 truncate text-sm'>
          {selected ? (
            <>
              Đã chọn{' '}
              <span className='text-foreground font-medium'>
                {selected.name}
              </span>
            </>
          ) : (
            'Chọn một trang để tiếp tục'
          )}
        </p>
        <Button size='lg' disabled={!canNext} onClick={onNext}>
          Tiếp tục <ArrowRight className='size-4' />
        </Button>
      </div>

      {previewTpl && (
        <TemplatePreviewOverlay
          template={previewTpl}
          onClose={() => setPreviewTpl(null)}
        />
      )}
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Bước ②  — chọn SẢN PHẨM + brief + chạy. Plan card sticky bên phải.
 * ──────────────────────────────────────────────────────────────────────── */

export function StepProduct({
  template,
  products,
  productIds,
  toggleProduct,
  brief,
  setBrief,
  canRun,
  onRun,
  onBack,
}: {
  template: Template | null;
  products: Product[];
  productIds: Set<string>;
  toggleProduct: (id: string) => void;
  brief: string;
  setBrief: (v: string) => void;
  canRun: boolean;
  onRun: () => void;
  onBack: () => void;
}) {
  const [query, setQuery] = React.useState('');
  const count = productIds.size;
  const filtered = filterByName(products, query);
  const allOn =
    filtered.length > 0 && filtered.every(p => productIds.has(p.id));

  return (
    <div className='space-y-4'>
      <button
        type='button'
        onClick={onBack}
        className='text-content-muted hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium'
      >
        <ArrowLeft className='size-4' /> Quay lại chọn bản gốc
      </button>

      <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <section className='min-w-0 space-y-3'>
          <SectionHead
            index={2}
            title='Sản phẩm'
            hint='Mỗi sản phẩm thành một landing'
          >
            {products.length > 0 && (
              <div className='flex items-center gap-2'>
                {count > 0 && (
                  <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums'>
                    {count} đã chọn
                  </span>
                )}
                <button
                  type='button'
                  onClick={() =>
                    filtered.forEach(p => {
                      if (allOn === productIds.has(p.id)) toggleProduct(p.id);
                    })
                  }
                  className='text-content-muted hover:text-foreground text-xs font-medium'
                >
                  {allOn ? 'Bỏ chọn' : 'Chọn tất cả'}
                </button>
              </div>
            )}
          </SectionHead>

          {products.length === 0 ? (
            <EmptyState
              icon={<Package className='size-6' />}
              title='Chưa có sản phẩm'
              description='Thêm sản phẩm (ảnh + mô tả) để AI map nội dung chính xác hơn.'
            />
          ) : (
            <div className='space-y-3'>
              {products.length > 8 && (
                <div className='border-border overflow-hidden rounded-lg border'>
                  <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder='Tìm sản phẩm…'
                  />
                </div>
              )}
              {filtered.length === 0 ? (
                <p className='text-content-muted py-6 text-center text-sm'>
                  Không tìm thấy sản phẩm khớp “{query}”.
                </p>
              ) : (
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                  {filtered.map(p => (
                    <SelectTile
                      key={p.id}
                      label={p.name}
                      imageUrl={p.thumbnail_url}
                      selected={productIds.has(p.id)}
                      onClick={() => toggleProduct(p.id)}
                      fallbackIcon={Package}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <aside className='lg:sticky lg:top-6'>
          <PlanCard
            template={template}
            count={count}
            brief={brief}
            setBrief={setBrief}
            canRun={canRun}
            onRun={onRun}
          />
        </aside>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function GalleryRow({
  template,
  selected,
  onSelect,
  onHover,
  onLeave,
}: {
  template: Template;
  selected: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onFocus={onHover}
      onBlur={onLeave}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
        selected ? 'bg-primary/5' : 'hover:bg-muted/60'
      )}
    >
      {template.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={template.thumbnail_url}
          alt=''
          className='border-border h-10 w-14 shrink-0 rounded-md border object-cover'
          loading='lazy'
        />
      ) : (
        <span className='bg-muted text-content-muted flex h-10 w-14 shrink-0 items-center justify-center rounded-md'>
          <LayoutTemplate className='size-4' />
        </span>
      )}
      <span className='text-foreground min-w-0 flex-1 truncate text-sm font-medium'>
        {template.name}
      </span>
      <span
        className={cn(
          'flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input'
        )}
      >
        {selected && <Check className='size-3' strokeWidth={3} />}
      </span>
    </button>
  );
}

function PreviewPane({
  template,
  onFull,
}: {
  template: Template | null;
  onFull: () => void;
}) {
  if (!template) {
    return (
      <div className='border-border text-content-muted flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed text-sm'>
        <LayoutTemplate className='mb-2 size-8 opacity-50' />
        Chọn một trang để xem trước
      </div>
    );
  }
  return (
    <div className='border-border bg-card flex flex-col overflow-hidden rounded-xl border'>
      <div className='bg-muted relative aspect-[16/10] w-full overflow-hidden'>
        {template.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnail_url}
            alt={template.name}
            className='h-full w-full object-cover'
          />
        ) : (
          <span className='text-content-muted flex h-full items-center justify-center'>
            <LayoutTemplate className='size-10' />
          </span>
        )}
        <button
          type='button'
          onClick={onFull}
          className='absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/75'
        >
          <Expand className='size-3.5' /> Xem đầy đủ
        </button>
      </div>
      <div className='flex items-center justify-between gap-3 px-4 py-3'>
        <div className='min-w-0'>
          <p className='text-foreground truncate text-sm font-semibold'>
            {template.name}
          </p>
          <p className='text-content-muted text-xs'>Bản gốc sẽ được nhân ra</p>
        </div>
        {template.status && (
          <Badge variant='secondary' className='text-2xs shrink-0'>
            {template.status}
          </Badge>
        )}
      </div>
    </div>
  );
}

function PlanCard({
  template,
  count,
  brief,
  setBrief,
  canRun,
  onRun,
}: {
  template: Template | null;
  count: number;
  brief: string;
  setBrief: (v: string) => void;
  canRun: boolean;
  onRun: () => void;
}) {
  return (
    <div className='border-border bg-background overflow-hidden rounded-2xl border shadow-sm'>
      <div className='bg-ai-gradient flex items-center gap-2 px-4 py-2.5'>
        <Sparkles className='text-primary-600 size-4' />
        <span className='text-primary-700 text-xs font-semibold tracking-wide uppercase'>
          Kế hoạch tạo landing
        </span>
      </div>

      <div className='space-y-4 p-4'>
        <div className='flex items-center gap-3'>
          <Thumb url={template?.thumbnail_url} />
          <div className='min-w-0'>
            <p className='text-content-muted text-2xs font-medium tracking-wide uppercase'>
              Bản gốc
            </p>
            <p className='text-foreground truncate text-sm font-semibold'>
              {template?.name ?? 'Chưa chọn'}
            </p>
          </div>
        </div>

        <Row op='×' label='sản phẩm' value={count} muted={count === 0} />
        <div className='border-border border-t pt-3'>
          <Row op='=' label='landing page' value={count} accent />
          <p className='text-content-muted mt-1 pl-7 text-xs'>
            AI viết lại nội dung và gắn ảnh cho từng sản phẩm.
          </p>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='ai-brief' className='text-xs'>
            Định hướng{' '}
            <span className='text-content-muted font-normal'>(tùy chọn)</span>
          </Label>
          <Textarea
            id='ai-brief'
            value={brief}
            onChange={e => setBrief(e.target.value)}
            placeholder='Vd: nhấn mạnh vàng nguyên chất, giọng sang trọng.'
            className='min-h-[64px] text-sm'
          />
        </div>

        <Button
          variant='ai'
          size='lg'
          className='w-full'
          disabled={!canRun}
          onClick={onRun}
        >
          <Sparkles className='size-4' />
          {count > 0 ? `Tạo ${count} landing` : 'Tạo landing bằng AI'}
        </Button>
        {!canRun && (
          <p className='text-content-muted text-center text-xs'>
            Chọn ít nhất một sản phẩm để bắt đầu.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({
  op,
  value,
  label,
  accent,
  muted,
}: {
  op: string;
  value: number;
  label: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className='flex items-baseline gap-2'>
      <span
        className={cn(
          'w-5 text-center text-lg font-light',
          accent ? 'text-primary' : 'text-content-muted'
        )}
        aria-hidden
      >
        {op}
      </span>
      <span
        className={cn(
          'text-2xl font-bold tabular-nums',
          accent
            ? 'text-primary'
            : muted
              ? 'text-content-muted'
              : 'text-foreground'
        )}
      >
        {value}
      </span>
      <span className='text-content-muted text-sm'>{label}</span>
    </div>
  );
}

function SectionHead({
  index,
  title,
  hint,
  children,
}: {
  index: number;
  title: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <div className='flex min-w-0 items-center gap-2.5'>
        <span className='bg-primary/10 text-primary text-2xs flex size-6 shrink-0 items-center justify-center rounded-full font-bold'>
          {index}
        </span>
        <h2 className='text-foreground truncate text-[15px] font-semibold'>
          {title}
          {hint && (
            <span className='text-content-muted ml-2 text-xs font-normal'>
              {hint}
            </span>
          )}
        </h2>
      </div>
      {children}
    </div>
  );
}

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className='border-border relative border-b'>
      <Search className='text-content-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className='h-10 rounded-none border-0 pl-9 shadow-none focus-visible:ring-0'
      />
      {value && (
        <button
          type='button'
          onClick={() => onChange('')}
          aria-label='Xoá tìm kiếm'
          className='text-content-muted hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded p-1'
        >
          <X className='size-3.5' />
        </button>
      )}
    </div>
  );
}

function Thumb({ url }: { url?: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=''
      className='border-border h-12 w-16 shrink-0 rounded-md border object-cover'
      loading='lazy'
    />
  ) : (
    <span className='bg-muted text-content-muted flex h-12 w-16 shrink-0 items-center justify-center rounded-md'>
      <LayoutTemplate className='size-4' />
    </span>
  );
}

function TemplateSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='h-6 w-40' />
      <div className='grid gap-5 md:grid-cols-[320px_minmax(0,1fr)]'>
        <Skeleton className='h-[460px] w-full rounded-xl' />
        <Skeleton className='h-[460px] w-full rounded-xl' />
      </div>
    </div>
  );
}
