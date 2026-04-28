'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Circle as CircleIcon,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Save,
  Square,
  Trash2,
  Type,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { CanvasTemplate } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

interface CanvasEditorProps {
  templateId: string;
}

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function CanvasEditor({ templateId }: CanvasEditorProps) {
  const canvasElRef = React.useRef<HTMLCanvasElement | null>(null);
  // `fabric.Canvas` instance — typed as `unknown` to keep this skeleton
  // independent of fabric's complex type surface.
  const fabricCanvasRef = React.useRef<unknown>(null);

  const [template, setTemplate] = React.useState<CanvasTemplate | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [etag, setEtag] = React.useState<string | null>(null);

  // Load metadata + canvas data (lazy with ETag).
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const meta = await rexerApi.canvasTemplates.get(templateId);
      setTemplate(meta);
      // Fetch canvas data with prior etag if any (reload-after-save case).
      const canvasResp = await rexerApi.canvasTemplates.getCanvas(
        templateId,
        etag ?? undefined
      );
      if (!canvasResp) {
        // 304 — keep current canvas in place.
        return;
      }
      setEtag(canvasResp.canvas_etag);
      // Initialise / reload Fabric canvas with this scene.
      const fabric = await import('fabric');
      if (!canvasElRef.current) return;
      const c =
        (fabricCanvasRef.current as InstanceType<typeof fabric.Canvas>) ??
        new fabric.Canvas(canvasElRef.current, {
          width: meta.width,
          height: meta.height,
          backgroundColor: '#ffffff',
        });
      fabricCanvasRef.current = c;
      c.setDimensions({ width: meta.width, height: meta.height });
      const data = canvasResp.canvas_data as Record<string, unknown>;
      // Fabric loadFromJSON returns a Promise in v6+.
      try {
        await (
          c as unknown as {
            loadFromJSON: (json: unknown) => Promise<unknown>;
          }
        ).loadFromJSON(data);
        c.renderAll();
      } catch {
        // loadFromJSON may fail for unsupported scene shape; render blank.
      }
      setDirty(false);
    } catch (err) {
      toast.error(`Failed to load canvas: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [templateId, etag]);

  React.useEffect(() => {
    load();
    // No cleanup dispose: React 18 StrictMode runs effects twice in dev,
    // and disposing the canvas between mount/remount races with toolbar
    // clicks that re-import fabric and read the ref. The leak is bounded
    // because we recreate the canvas only when templateId changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  // Mark dirty when user edits the canvas.
  React.useEffect(() => {
    const c = fabricCanvasRef.current as {
      on: (event: string, h: () => void) => void;
    } | null;
    if (!c) return;
    const onChange = () => setDirty(true);
    c.on('object:added', onChange);
    c.on('object:modified', onChange);
    c.on('object:removed', onChange);
  }, [template]);

  const addText = async () => {
    // eslint-disable-next-line no-console
    console.log('[canvas-add] addText called, ref:', !!fabricCanvasRef.current);
    const fabric = await import('fabric');
    const c = fabricCanvasRef.current as InstanceType<
      typeof fabric.Canvas
    > | null;
    if (!c) {
      // eslint-disable-next-line no-console
      console.log('[canvas-add] addText: ref null, abort');
      return;
    }
    const text = new fabric.Textbox('Click to edit', {
      left: 100,
      top: 100,
      width: 240,
      fontSize: 24,
      fill: '#111827',
      fontFamily: 'Inter',
    });
    c.add(text);
    c.setActiveObject(text);
    c.renderAll();
    setDirty(true);
  };

  const addRect = async () => {
    const fabric = await import('fabric');
    const c = fabricCanvasRef.current as InstanceType<
      typeof fabric.Canvas
    > | null;
    if (!c) return;
    const rect = new fabric.Rect({
      left: 80,
      top: 80,
      width: 160,
      height: 100,
      fill: '#4f46e5',
      rx: 8,
      ry: 8,
    });
    c.add(rect);
    c.setActiveObject(rect);
    c.renderAll();
    setDirty(true);
  };

  const addCircle = async () => {
    const fabric = await import('fabric');
    const c = fabricCanvasRef.current as InstanceType<
      typeof fabric.Canvas
    > | null;
    if (!c) return;
    const circle = new fabric.Circle({
      left: 200,
      top: 200,
      radius: 60,
      fill: '#10b981',
    });
    c.add(circle);
    c.setActiveObject(circle);
    c.renderAll();
    setDirty(true);
  };

  const addImage = async () => {
    const url = window.prompt('Image URL:', 'https://placehold.co/300x200');
    if (!url) return;
    const fabric = await import('fabric');
    const c = fabricCanvasRef.current as InstanceType<
      typeof fabric.Canvas
    > | null;
    if (!c) return;
    try {
      const img = await fabric.FabricImage.fromURL(url, {
        crossOrigin: 'anonymous',
      });
      img.set({ left: 50, top: 50 });
      c.add(img);
      c.renderAll();
      setDirty(true);
    } catch (err) {
      toast.error(`Image load failed: ${rxErrorMessage(err)}`);
    }
  };

  const deleteActive = () => {
    const c = fabricCanvasRef.current as {
      getActiveObjects: () => unknown[];
      remove: (...objs: unknown[]) => void;
      discardActiveObject: () => void;
      renderAll: () => void;
    } | null;
    if (!c) return;
    const objs = c.getActiveObjects();
    if (!objs.length) return;
    objs.forEach(o => c.remove(o));
    c.discardActiveObject();
    c.renderAll();
    setDirty(true);
  };

  const handleSave = async () => {
    if (!template) return;
    const c = fabricCanvasRef.current as {
      toJSON: () => Record<string, unknown>;
    } | null;
    if (!c) {
      toast.error('Canvas not ready');
      return;
    }
    setSaving(true);
    try {
      const canvas_data = c.toJSON();
      // eslint-disable-next-line no-console
      console.log(
        '[canvas-save] toJSON objects:',
        (canvas_data as { objects?: unknown[] }).objects?.length ?? 0
      );
      const updated = await rexerApi.canvasTemplates.update(template.id, {
        canvas_data,
        version: template.version,
      });
      setTemplate(updated);
      setEtag(updated.canvas_etag);
      setDirty(false);
      toast.success(`Saved · v${updated.version}`);
    } catch (err) {
      toast.error(`Save failed: ${rxErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='mx-auto flex h-full w-full max-w-[1400px] flex-col px-6 pb-10'>
      <header className='flex items-center justify-between gap-3 py-4'>
        <div className='flex items-center gap-2'>
          <Button asChild variant='ghost' size='sm'>
            <Link href='/canvas-templates'>
              <ArrowLeft className='size-3.5' /> All canvases
            </Link>
          </Button>
          <span className='text-foreground text-base font-semibold'>
            {template?.name ?? 'Loading…'}
          </span>
          {template && (
            <Badge variant='outline' className='text-[10px]'>
              v{template.version} · {template.width}×{template.height}
            </Badge>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' onClick={load} disabled={loading}>
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            variant='primary'
            size='sm'
            onClick={handleSave}
            disabled={!dirty || saving}
          >
            <Save className='size-3.5' />
            {saving ? 'Saving…' : dirty ? 'Save *' : 'Saved'}
          </Button>
        </div>
      </header>

      <div className='flex flex-1 gap-3 overflow-hidden'>
        {/* Toolbar */}
        <aside className='border-border bg-background flex w-12 shrink-0 flex-col items-center gap-1 rounded-xl border py-2'>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Add text'
            onClick={addText}
            className='size-9'
          >
            <Type className='size-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Add rectangle'
            onClick={addRect}
            className='size-9'
          >
            <Square className='size-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Add circle'
            onClick={addCircle}
            className='size-9'
          >
            <CircleIcon className='size-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            aria-label='Add image'
            onClick={addImage}
            className='size-9'
          >
            <ImageIcon className='size-4' />
          </Button>
          <div className='bg-border my-1 h-px w-6' />
          <Button
            variant='ghost'
            size='icon'
            aria-label='Delete selection'
            onClick={deleteActive}
            className='text-destructive size-9'
          >
            <Trash2 className='size-4' />
          </Button>
        </aside>

        {/* Canvas stage */}
        <div className='flex flex-1 items-center justify-center overflow-auto rounded-xl bg-neutral-100 p-6'>
          {loading ? (
            <Spinner size={24} />
          ) : (
            <div className='bg-background rounded-md shadow-xl'>
              <canvas ref={canvasElRef} />
            </div>
          )}
        </div>
      </div>

      {!loading && !template && (
        <div className='text-muted-foreground py-16 text-center text-sm'>
          Canvas not found.{' '}
          <Link href='/canvas-templates' className='text-primary underline'>
            Back to list
          </Link>
        </div>
      )}

      <p className='text-muted-foreground mt-2 inline-flex items-center gap-1 text-xs'>
        <Plus className='size-3' /> Skeleton editor — multi-page, animation,
        layers panel come in Phase 2.
      </p>
    </div>
  );
}
