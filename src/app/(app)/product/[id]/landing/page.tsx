'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Globe,
  Image as ImageIcon,
  Plus,
  Rocket,
} from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Project } from '@/services/rexer/types';
import { useRexer } from '@/services/rexer/use-rexer';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_TONE: Record<string, string> = {
  draft: 'bg-neutral-200 text-neutral-700',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-neutral-100 text-neutral-500',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

function LandingCard({
  project,
  productId,
}: {
  project: Project;
  productId: string;
}) {
  const tone = STATUS_TONE[project.status] ?? 'bg-neutral-200 text-neutral-700';
  const base = `/product/${productId}/landing/${project.id}`;
  return (
    <div className='border-border bg-background hover:border-primary group flex flex-col gap-3 rounded-xl border px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <h3 className='text-foreground truncate text-base font-semibold'>
            {project.name}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${tone}`}
          >
            {project.status}
          </span>
          {project.active_release_id ? (
            <Badge variant='secondary' className='gap-1'>
              <Globe className='size-3' /> Live
            </Badge>
          ) : (
            <Badge variant='outline'>Not published</Badge>
          )}
        </div>
        <p className='text-muted-foreground mt-1 truncate text-xs'>
          /{project.slug} · updated {formatDate(project.updated_at)}
        </p>
      </div>
      <div className='flex items-center gap-1.5'>
        <Link
          href={`${base}/publish`}
          className='text-foreground hover:bg-muted inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium'
        >
          <Rocket className='size-3.5' /> Publish
        </Link>
        <Link
          href={`${base}/media`}
          className='text-foreground hover:bg-muted inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium'
        >
          <ImageIcon className='size-3.5' /> Media
        </Link>
        <Link
          href={`${base}/analytics`}
          className='text-foreground hover:bg-muted inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium'
        >
          <BarChart3 className='size-3.5' /> Analytics
        </Link>
      </div>
    </div>
  );
}

export default function LandingListPage({ params }: PageProps) {
  const { id } = use(params);
  const basePath = `/product/${id}`;

  // BE chưa hỗ trợ filter `?product_id=`. Tạm thời list toàn bộ projects của user.
  // TODO: thay bằng `rexerApi.projects.list({ product_id: id })` khi BE bổ sung.
  const projects = useRexer(() => rexerApi.projects.list(), []);

  const items = projects.data?.items ?? [];

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName='Landings'
      scope='product'
      section='landing'
      actions={
        <Button variant='pill' size='sm' asChild>
          <Link href={`/ai-agents/start?product=${id}`}>
            <Plus className='size-3.5' /> New landing
          </Link>
        </Button>
      }
    >
      <div className='mx-auto w-full max-w-[1100px] px-6 pb-10'>
        {projects.loading && (
          <div className='text-muted-foreground flex justify-center py-16'>
            <Spinner size={20} />
          </div>
        )}

        {!projects.loading && projects.error && (
          <EmptyState
            icon={<Rocket className='size-10' />}
            title='Could not load landings'
            description={projects.error.message || 'Try again in a moment.'}
          />
        )}

        {!projects.loading && !projects.error && items.length === 0 && (
          <EmptyState
            icon={<Rocket className='size-10' />}
            title='No landings yet'
            description='Use the AI Agents wizard or pick a template to create your first landing for this product.'
            actions={
              <Button variant='pill' asChild>
                <Link href={`/ai-agents/start?product=${id}`}>
                  <Plus className='size-3.5' /> New landing
                </Link>
              </Button>
            }
          />
        )}

        {!projects.loading && !projects.error && items.length > 0 && (
          <div className='flex flex-col gap-3'>
            {items.map(p => (
              <LandingCard key={p.id} project={p} productId={id} />
            ))}
          </div>
        )}
      </div>
    </ProductWorkspaceLayout>
  );
}
