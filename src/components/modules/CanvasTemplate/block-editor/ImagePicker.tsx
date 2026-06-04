'use client';

import * as React from 'react';
import {
  ImageIcon,
  Loader2,
  RotateCcw,
  RotateCw,
  Undo2,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/cn';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';

import { DEFAULT_IMAGE_TRANSFORM, type ImageTransform } from './types';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  transform?: ImageTransform;
  onTransformChange?: (next: ImageTransform) => void;
  className?: string;
}

const ROTATION_STEP = 90;
const SCALE_MIN = 0.5;
const SCALE_MAX = 2;
const SCALE_STEP = 0.1;

function clampRotation(deg: number): number {
  // Normalize to [-180, 180].
  let n = ((((deg + 180) % 360) + 360) % 360) - 180;
  if (n === -180) n = 180;
  return Math.round(n);
}

function clampScale(s: number): number {
  return Math.max(SCALE_MIN, Math.min(SCALE_MAX, Math.round(s * 100) / 100));
}

export function ImagePicker({
  value,
  onChange,
  transform,
  onTransformChange,
  className,
}: ImagePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const t = transform ?? DEFAULT_IMAGE_TRANSFORM;
  const supportsTransform = !!onTransformChange;

  const updateTransform = (patch: Partial<ImageTransform>) => {
    if (!onTransformChange) return;
    onTransformChange({
      rotation: clampRotation(patch.rotation ?? t.rotation),
      scale: clampScale(patch.scale ?? t.scale),
    });
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      // BE 3-step flow: init → raw upload (presigned PUT or proxy) → complete.
      // Public URL is the presigned URL with the query string stripped — that
      // is the canonical S3 object URL after BUG-01 was fixed (2026-04-27).
      const init = await rexerApi.media.initUpload({
        filename: file.name,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        owner_scope: 'library',
        media_type: file.type.startsWith('image/') ? 'image' : 'file',
      });

      let publicUrl: string | null = null;
      if (init.presigned_url) {
        const res = await fetch(init.presigned_url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!res.ok) {
          throw new Error(`Storage upload failed: ${res.status}`);
        }
        publicUrl = init.presigned_url.split('?')[0] ?? null;
      } else {
        // Proxy fallback — bytes go through BE. Without a presigned URL we
        // can't derive a public URL on the client, so this path requires BE
        // to expose one via media_asset (currently it does not). Surface the
        // gap to the user instead of silently uploading a dangling file.
        await rexerApi.media.uploadRaw(init.upload_id, file);
        throw new Error(
          'BE không trả presigned_url — chưa lấy được URL công khai'
        );
      }

      await rexerApi.media.completeUpload({ upload_id: init.upload_id });

      if (!publicUrl) throw new Error('Không nhận được URL ảnh');
      onChange(publicUrl);
      toast.success('Đã tải ảnh lên');
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.message || err.code
          : err instanceof Error
            ? err.message
            : 'Lỗi';
      toast.error(`Tải ảnh thất bại: ${msg}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className='relative h-28 w-full overflow-hidden rounded-md border border-neutral-200 bg-neutral-100'>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt='Xem trước ảnh'
            className='h-full w-full origin-center object-cover transition-transform duration-150'
            style={{
              transform: `rotate(${t.rotation}deg) scale(${t.scale})`,
            }}
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-neutral-400'>
            <ImageIcon className='size-6' />
          </div>
        )}
        {uploading && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/70'>
            <Loader2 className='size-5 animate-spin text-neutral-700' />
          </div>
        )}
      </div>

      <div className='flex items-center gap-2'>
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder='https://...'
          className='h-8 border-neutral-200 bg-white text-xs'
        />
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className='text-2xs flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50'
        >
          <Upload className='size-3' />
          Tải lên
        </button>
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
      </div>

      {supportsTransform && (
        <div className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-3xs font-medium tracking-wider text-neutral-500 uppercase'>
              Xoay
            </span>
            <span className='text-2xs font-mono text-neutral-700 tabular-nums'>
              {t.rotation}°
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <PickerIconButton
              aria-label='Xoay -90°'
              onClick={() =>
                updateTransform({ rotation: t.rotation - ROTATION_STEP })
              }
            >
              <RotateCcw className='size-3.5' />
            </PickerIconButton>
            <input
              type='range'
              min={-180}
              max={180}
              step={1}
              value={t.rotation}
              onChange={e =>
                updateTransform({ rotation: Number(e.target.value) })
              }
              className='h-1 flex-1 accent-neutral-900'
              aria-label='Góc xoay'
            />
            <PickerIconButton
              aria-label='Xoay +90°'
              onClick={() =>
                updateTransform({ rotation: t.rotation + ROTATION_STEP })
              }
            >
              <RotateCw className='size-3.5' />
            </PickerIconButton>
          </div>

          <div className='mt-1 flex items-center justify-between gap-2'>
            <span className='text-3xs font-medium tracking-wider text-neutral-500 uppercase'>
              Phóng
            </span>
            <span className='text-2xs font-mono text-neutral-700 tabular-nums'>
              {Math.round(t.scale * 100)}%
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <PickerIconButton
              aria-label='Thu nhỏ'
              onClick={() => updateTransform({ scale: t.scale - SCALE_STEP })}
            >
              <ZoomOut className='size-3.5' />
            </PickerIconButton>
            <input
              type='range'
              min={SCALE_MIN}
              max={SCALE_MAX}
              step={SCALE_STEP}
              value={t.scale}
              onChange={e => updateTransform({ scale: Number(e.target.value) })}
              className='h-1 flex-1 accent-neutral-900'
              aria-label='Phóng to'
            />
            <PickerIconButton
              aria-label='Phóng to'
              onClick={() => updateTransform({ scale: t.scale + SCALE_STEP })}
            >
              <ZoomIn className='size-3.5' />
            </PickerIconButton>
          </div>

          <button
            type='button'
            onClick={() => onTransformChange?.({ ...DEFAULT_IMAGE_TRANSFORM })}
            className='text-3xs mt-1 flex w-full cursor-pointer items-center justify-center gap-1 rounded-md border border-dashed border-neutral-200 py-1 font-medium text-neutral-500 transition-colors hover:border-neutral-900 hover:text-neutral-900'
          >
            <Undo2 className='size-3' />
            Khôi phục
          </button>
        </div>
      )}
    </div>
  );
}

function PickerIconButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type='button'
      className={cn(
        'flex size-6 cursor-pointer items-center justify-center rounded text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
