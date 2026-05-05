'use client';

import * as React from 'react';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Heart,
  MessageCircle,
  Monitor,
  Share2,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Avatar } from '@/components/atoms/avatar';
import { Button } from '@/components/atoms/button';
import { IconButton } from '@/components/atoms/icon-button';
import { Spinner } from '@/components/atoms/spinner';
import { TemplateVersionsPanel } from '@/components/modules/Template/TemplateVersionsPanel';
import { WorkspaceTopBar } from '@/components/organisms/WorkspaceTopBar';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  Template,
  TemplatePreviewResponse,
  TemplateVersion,
} from '@/services/rexer/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export default function TemplatePreviewPage({ params }: PageProps) {
  const { id } = use(params);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const [template, setTemplate] = useState<Template | null>(null);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [preview, setPreview] = useState<TemplatePreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      rexerApi.templates.get(id).catch(() => null),
      rexerApi.templates.preview(id).catch(() => null),
    ])
      .then(([t, p]) => {
        if (!alive) return;
        setTemplate(t?.template ?? null);
        if (t?.current_version) {
          setSelectedVersionId(t.current_version.id);
        }
        setPreview(p);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    let alive = true;
    setLoadingVersions(true);
    rexerApi.templates
      .versions(id)
      .then(r => {
        if (alive) setVersions(r.items);
      })
      .catch(() => {
        if (alive) setVersions([]);
      })
      .finally(() => {
        if (alive) setLoadingVersions(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const handleSelectVersion = async (v: TemplateVersion) => {
    setSelectedVersionId(v.id);
    try {
      // Refresh preview when switching version. BE preview is per-template;
      // version selection is informational until the BE accepts a version_id
      // query — surface a toast so the user knows their pick took effect.
      await rexerApi.templates.preview(id);
      toast.success(`Viewing v${v.version}`);
    } catch (err) {
      toast.error(`Preview failed: ${rxErrorMessage(err)}`);
    }
  };

  const fallbackName = id.charAt(0).toUpperCase() + id.slice(1);
  const name = template?.name ?? fallbackName;

  return (
    <div className='flex h-full flex-1 flex-col'>
      <WorkspaceTopBar
        title={<span className='text-2xl font-bold uppercase'>{name}</span>}
        actions={
          <>
            <div className='mr-4 flex items-center gap-3 text-sm'>
              <Avatar src='' name='Ryan Puckett' size='sm' />
              <div>
                <p className='text-content-muted text-xs'>
                  {template?.code ?? '—'}
                </p>
                <p className='font-semibold'>
                  {template?.description || 'Template'}
                </p>
              </div>
            </div>
            <Button asChild variant='outline' size='sm'>
              <Link href={`/template/${id}/edit`}>Edit</Link>
            </Button>
            <Button variant='ai' size='sm'>
              <Sparkles className='size-3.5' /> AI-Assistant
            </Button>
          </>
        }
      />

      {/* Toolbar — social actions + device switch */}
      <div className='border-border bg-background flex items-center justify-between border-b px-4 py-3'>
        <div className='flex items-center gap-2'>
          <IconButton aria-label='Like' variant='ghost' size='sm'>
            <Heart />
          </IconButton>
          <IconButton aria-label='Comment' variant='ghost' size='sm'>
            <MessageCircle />
          </IconButton>
          <IconButton aria-label='Share' variant='ghost' size='sm'>
            <Share2 />
          </IconButton>
          <IconButton aria-label='Bookmark' variant='ghost' size='sm'>
            <Bookmark />
          </IconButton>
        </div>

        <div className='rounded-pill inline-flex items-center gap-1 bg-neutral-100 p-1'>
          <button
            type='button'
            onClick={() => setDevice('desktop')}
            className={`rounded-pill inline-flex h-7 cursor-pointer items-center gap-1.5 px-3 text-xs font-semibold ${
              device === 'desktop'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-content-muted hover:text-foreground'
            }`}
          >
            <Monitor className='size-3.5' />
            Desktop
          </button>
          <button
            type='button'
            onClick={() => setDevice('mobile')}
            className={`rounded-pill inline-flex h-7 cursor-pointer items-center gap-1.5 px-3 text-xs font-semibold ${
              device === 'mobile'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-content-muted hover:text-foreground'
            }`}
          >
            <Smartphone className='size-3.5' />
            Mobile
          </button>
        </div>

        <div className='w-[200px]' />
      </div>

      {/* Preview stage + versions side panel */}
      <div className='flex flex-1 gap-4 overflow-hidden bg-neutral-100 p-6'>
        <div className='flex flex-1 items-center justify-center overflow-auto'>
          {loading ? (
            <Spinner size={24} />
          ) : preview?.preview_url ? (
            <iframe
              title={`${name} preview`}
              src={preview.preview_url}
              className={
                device === 'desktop'
                  ? 'bg-background aspect-[16/10] w-full max-w-4xl rounded-2xl shadow-xl'
                  : 'bg-background ring-border h-[640px] w-[320px] rounded-[32px] shadow-xl ring-1'
              }
            />
          ) : device === 'desktop' ? (
            <div className='bg-background flex aspect-[16/10] w-full max-w-4xl items-center justify-center rounded-2xl shadow-xl'>
              <span className='text-foreground text-3xl font-black tracking-[-0.04em] uppercase'>
                {name}
              </span>
            </div>
          ) : (
            <div className='bg-background ring-border flex h-[640px] w-[320px] flex-col overflow-hidden rounded-[32px] shadow-xl ring-1'>
              <div className='flex items-center justify-between bg-neutral-100 px-6 py-2 text-[10px] font-semibold'>
                <span>9:41</span>
                <span className='h-5 w-16 rounded-full bg-black' />
                <span>100%</span>
              </div>
              <div className='flex flex-1 items-center justify-center'>
                <span className='text-xl font-bold'>{name}</span>
              </div>
            </div>
          )}
        </div>

        <TemplateVersionsPanel
          versions={versions}
          loading={loadingVersions}
          currentVersionId={template?.current_version_id ?? undefined}
          selectedVersionId={selectedVersionId ?? undefined}
          onSelect={handleSelectVersion}
        />
      </div>
    </div>
  );
}
