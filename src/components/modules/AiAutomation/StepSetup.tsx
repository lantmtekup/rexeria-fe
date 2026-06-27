'use client';

import * as React from 'react';
import { LayoutTemplate, Package, Sparkles } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Skeleton } from '@/components/atoms/skeleton';
import { Textarea } from '@/components/atoms/textarea';
import { EmptyState } from '@/components/molecules/EmptyState';
import type { Product, Template, Workspace } from '@/services/rexer/types';

import { SelectTile } from './_bits';
import { TemplatePreviewOverlay } from './TemplatePreviewOverlay';

interface Props {
  loading: boolean;
  templates: Template[];
  products: Product[];
  workspaces: Workspace[];
  templateId: string;
  setTemplateId: (id: string) => void;
  workspaceId: string;
  setWorkspaceId: (id: string) => void;
  productIds: Set<string>;
  toggleProduct: (id: string) => void;
  brief: string;
  setBrief: (v: string) => void;
  canRun: boolean;
  onRun: () => void;
}

const SELECT_CLASS =
  'border-border bg-background text-foreground h-9 rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function StepSetup(props: Props) {
  const {
    loading,
    templates,
    products,
    workspaces,
    templateId,
    setTemplateId,
    workspaceId,
    setWorkspaceId,
    productIds,
    toggleProduct,
    brief,
    setBrief,
    canRun,
    onRun,
  } = props;

  const [previewTpl, setPreviewTpl] = React.useState<Template | null>(null);

  if (loading) return <SetupSkeleton />;

  const count = productIds.size;

  return (
    <div className='space-y-8'>
      {/* ① Master template */}
      <section className='space-y-3'>
        <SectionTitle index='①' title='Master template'>
          {workspaces.length > 0 && (
            <select
              value={workspaceId}
              onChange={e => setWorkspaceId(e.target.value)}
              aria-label='Workspace'
              className={SELECT_CLASS}
            >
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          )}
        </SectionTitle>
        {templates.length === 0 ? (
          <EmptyState
            icon={<LayoutTemplate className='size-6' />}
            title='Chưa có template'
            description='Tạo / kích hoạt 1 template ở mục Template trước.'
          />
        ) : (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
            {templates.map(t => (
              <SelectTile
                key={t.id}
                label={t.name}
                imageUrl={t.thumbnail_url}
                selected={templateId === t.id}
                onClick={() => setTemplateId(t.id)}
                onPreview={() => setPreviewTpl(t)}
                fallbackIcon={LayoutTemplate}
              />
            ))}
          </div>
        )}
      </section>

      {/* ② Sản phẩm */}
      <section className='space-y-3'>
        <SectionTitle
          index='②'
          title='Sản phẩm'
          hint={count > 0 ? `${count} đã chọn → ${count} landing` : 'chọn ≥ 1'}
        />
        {products.length === 0 ? (
          <EmptyState
            icon={<Package className='size-6' />}
            title='Chưa có sản phẩm'
            description='Tạo sản phẩm (có ảnh + mô tả) để AI map tốt hơn.'
          />
        ) : (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
            {products.map(p => (
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
      </section>

      {/* ③ Brief + run */}
      <section className='space-y-2'>
        <Label htmlFor='ai-brief'>Brief (tùy chọn)</Label>
        <Textarea
          id='ai-brief'
          value={brief}
          onChange={e => setBrief(e.target.value)}
          placeholder='Gợi ý tone / trọng tâm, vd: nhấn mạnh vàng nguyên chất, sang trọng.'
          className='min-h-[60px]'
        />
        <div className='flex justify-end pt-2'>
          <Button variant='ai' size='lg' disabled={!canRun} onClick={onRun}>
            <Sparkles className='size-4' />
            Tạo {count || ''} landing bằng AI
          </Button>
        </div>
      </section>

      {previewTpl && (
        <TemplatePreviewOverlay
          template={previewTpl}
          onClose={() => setPreviewTpl(null)}
        />
      )}
    </div>
  );
}

function SectionTitle({
  index,
  title,
  hint,
  children,
}: {
  index: string;
  title: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <h2 className='text-sm font-semibold'>
        <span className='text-content-muted mr-1.5'>{index}</span>
        {title}
        {hint && (
          <span className='text-content-muted ml-2 text-xs font-normal'>
            {hint}
          </span>
        )}
      </h2>
      {children}
    </div>
  );
}

function SetupSkeleton() {
  return (
    <div className='space-y-8'>
      {[0, 1].map(s => (
        <div key={s} className='space-y-3'>
          <Skeleton className='h-5 w-40' />
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className='aspect-[4/3] rounded-xl' />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
