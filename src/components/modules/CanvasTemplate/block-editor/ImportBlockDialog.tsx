'use client';

import * as React from 'react';
import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { cn } from '@/lib/cn';
import {
  fileToBase64,
  figmaNodeToImage,
  ImportBlockError,
  importBlockFromImage,
  parseFigmaUrl,
  type ImportBlockResult,
} from '@/services/ai/importBlock';

import { BLOCK_TYPE_META } from './types';
import type { Block } from './types';

interface ImportBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when user confirms — caller appends to canvas. */
  onInsert: (block: Block) => void;
}

type Source = 'image' | 'figma';

const FIGMA_TOKEN_STORAGE_KEY = 'rexer:figma_token';

export function ImportBlockDialog({
  open,
  onOpenChange,
  onInsert,
}: ImportBlockDialogProps) {
  const [source, setSource] = React.useState<Source>('image');
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [figmaUrl, setFigmaUrl] = React.useState('');
  const [figmaToken, setFigmaToken] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ImportBlockResult | null>(null);
  const [dragHover, setDragHover] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Counter for nested drag events — `dragenter`/`dragleave` fire per
  // descendant so we count to know when the pointer truly leaves the zone.
  const dragDepthRef = React.useRef(0);

  // Hydrate Figma token from localStorage so user doesn't re-paste each time.
  React.useEffect(() => {
    if (!open) return;
    try {
      const saved = window.localStorage.getItem(FIGMA_TOKEN_STORAGE_KEY);
      if (saved) setFigmaToken(saved);
    } catch {
      // localStorage blocked — fine, user re-pastes
    }
  }, [open]);

  // Generate a preview URL whenever the user picks a file.
  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Reset state when modal closes.
  React.useEffect(() => {
    if (open) return;
    setFile(null);
    setFigmaUrl('');
    setBusy(false);
    setError(null);
    setResult(null);
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0]);
    // Reset input so picking the same file twice still fires `change`.
    e.target.value = '';
  };

  const acceptFile = (f: File | null | undefined) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError(
        `File "${f.name}" không phải ảnh — chỉ chấp nhận PNG/JPG/WEBP/GIF.`
      );
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  // Browser drag/drop semantics:
  //   - preventDefault on dragover/dragenter is REQUIRED, otherwise the
  //     browser interprets the drop as navigation and dispatches no `drop`
  //     event to React.
  //   - dragenter fires for every descendant the pointer crosses; we count
  //     enter vs leave so the visual highlight only clears once the pointer
  //     has truly left the zone.
  //   - stopPropagation guards against the dialog overlay swallowing the drop.
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current += 1;
    if (e.dataTransfer.types?.includes('Files')) setDragHover(true);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragHover(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = 0;
    setDragHover(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const runImport = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      if (source === 'image') {
        if (!file) throw new ImportBlockError('Chưa chọn ảnh');
        const { base64, mediaType } = await fileToBase64(file);
        const r = await importBlockFromImage({ base64, mediaType });
        setResult(r);
      } else {
        if (!parseFigmaUrl(figmaUrl)) {
          throw new ImportBlockError('URL Figma không hợp lệ');
        }
        if (!figmaToken.trim()) {
          throw new ImportBlockError(
            'Cần Figma personal access token (lấy ở Figma → Settings → Account → Personal access tokens)'
          );
        }
        try {
          window.localStorage.setItem(
            FIGMA_TOKEN_STORAGE_KEY,
            figmaToken.trim()
          );
        } catch {
          // localStorage blocked — skip persistence
        }
        const { base64, mediaType } = await figmaNodeToImage(
          figmaUrl,
          figmaToken.trim()
        );
        const r = await importBlockFromImage({ base64, mediaType });
        setResult(r);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setBusy(false);
    }
  };

  const confirmInsert = () => {
    if (!result) return;
    onInsert(result.block);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Tạo block từ ảnh / Figma</DialogTitle>
        </DialogHeader>

        {/* Tab strip */}
        <div className='flex gap-2 border-b border-neutral-200'>
          <TabBtn
            active={source === 'image'}
            onClick={() => setSource('image')}
            testId='import-tab-image'
          >
            <ImageIcon className='size-3.5' /> Hình ảnh
          </TabBtn>
          <TabBtn
            active={source === 'figma'}
            onClick={() => setSource('figma')}
            testId='import-tab-figma'
          >
            Figma URL
          </TabBtn>
        </div>

        {/* Body */}
        <div className='space-y-3 py-3'>
          {source === 'image' ? (
            <div>
              <div
                role='button'
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                data-testid='import-drop-zone'
                data-drag-hover={dragHover ? 'true' : 'false'}
                className={cn(
                  'flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed transition-colors',
                  previewUrl
                    ? 'border-neutral-300 bg-neutral-50'
                    : dragHover
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-neutral-300 bg-white hover:border-sky-400 hover:bg-sky-50/50'
                )}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt='Preview'
                    className='pointer-events-none h-full w-full object-contain p-2'
                  />
                ) : (
                  <>
                    <Upload
                      className={cn(
                        'pointer-events-none size-6 transition-colors',
                        dragHover ? 'text-sky-600' : 'text-neutral-400'
                      )}
                    />
                    <p className='pointer-events-none text-xs text-neutral-500'>
                      {dragHover
                        ? 'Thả ảnh vào đây'
                        : 'Kéo thả ảnh PNG/JPG vào đây hoặc click để chọn'}
                    </p>
                    <p className='pointer-events-none text-[10px] text-neutral-400'>
                      Max 5MB — ưu tiên ảnh chụp 1 section landing page
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/png,image/jpeg,image/webp,image/gif'
                data-testid='import-file-input'
                onChange={handleFileChange}
                className='hidden'
              />
              {file && (
                <div className='mt-2 flex items-center justify-between text-[11px] text-neutral-500'>
                  <span className='truncate'>
                    {file.name} · {Math.round(file.size / 1024)}KB
                  </span>
                  <button
                    type='button'
                    onClick={() => setFile(null)}
                    className='flex cursor-pointer items-center gap-1 text-neutral-400 hover:text-neutral-900'
                  >
                    <X className='size-3' /> Bỏ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className='space-y-3'>
              <Field label='Figma URL'>
                <input
                  type='url'
                  value={figmaUrl}
                  onChange={e => setFigmaUrl(e.target.value)}
                  data-testid='import-figma-url'
                  placeholder='https://figma.com/design/ABC123/...?node-id=1-2'
                  className='h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-[12px] focus:border-neutral-400 focus:outline-none'
                />
                <p className='mt-1 text-[10px] text-neutral-400'>
                  Phải có <code>?node-id=...</code> — chọn frame cụ thể trong
                  Figma rồi copy link.
                </p>
              </Field>
              <Field label='Figma personal access token'>
                <input
                  type='password'
                  value={figmaToken}
                  onChange={e => setFigmaToken(e.target.value)}
                  data-testid='import-figma-token'
                  placeholder='figd_…'
                  className='h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-[12px] focus:border-neutral-400 focus:outline-none'
                />
                <p className='mt-1 text-[10px] text-neutral-400'>
                  Lấy ở Figma → Settings → Account → Personal access tokens. Lưu
                  trong browser (localStorage), không gửi lên BE.
                </p>
              </Field>
            </div>
          )}

          {error && (
            <div
              data-testid='import-error'
              className='rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] leading-relaxed text-rose-700'
            >
              {error}
            </div>
          )}

          {result && (
            <div
              data-testid='import-result'
              className='rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[12px] text-emerald-900'
            >
              <div className='font-semibold'>
                Đề xuất block:{' '}
                <span
                  className='rounded bg-white px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-emerald-700 uppercase'
                  data-testid='import-suggested-type'
                >
                  {BLOCK_TYPE_META[result.raw.blockType].label}
                </span>
              </div>
              {result.reasoning && (
                <p className='mt-1.5 text-[11px] leading-relaxed text-emerald-800'>
                  {result.reasoning}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className='flex items-center justify-between border-t border-neutral-200 pt-3'>
          <p className='text-[10px] text-neutral-400'>
            AI có thể tạo nhầm — review lại sau khi insert.
          </p>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => onOpenChange(false)}
              className='flex h-8 cursor-pointer items-center rounded-md border border-neutral-200 bg-white px-3 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50'
            >
              Đóng
            </button>
            {!result ? (
              <button
                type='button'
                onClick={runImport}
                disabled={
                  busy ||
                  (source === 'image' && !file) ||
                  (source === 'figma' && !figmaUrl.trim())
                }
                data-testid='import-run'
                className='flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-neutral-900 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40'
              >
                {busy && <Loader2 className='size-3 animate-spin' />}
                {busy ? 'Đang phân tích…' : 'Phân tích bằng AI'}
              </button>
            ) : (
              <button
                type='button'
                onClick={confirmInsert}
                data-testid='import-confirm'
                className='flex h-8 cursor-pointer items-center rounded-md bg-emerald-600 px-3 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-500'
              >
                Insert vào canvas
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabBtn({
  active,
  onClick,
  testId,
  children,
}: {
  active: boolean;
  onClick: () => void;
  testId: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      data-testid={testId}
      data-active={active ? 'true' : 'false'}
      className={cn(
        'relative -mb-px flex h-9 cursor-pointer items-center gap-1.5 px-3 text-[12px] font-medium transition-colors',
        active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
      )}
    >
      {children}
      {active && (
        <span className='absolute right-2 bottom-0 left-2 h-0.5 rounded-t bg-neutral-900' />
      )}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className='flex flex-col gap-1'>
      <span className='text-[10px] font-medium tracking-wide text-neutral-500 uppercase'>
        {label}
      </span>
      {children}
    </label>
  );
}
