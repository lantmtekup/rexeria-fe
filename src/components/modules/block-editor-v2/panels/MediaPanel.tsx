'use client';

import * as React from 'react';
import { ImageIcon, Loader2, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/cn';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { MediaAsset } from '@/services/rexer/types';

/**
 * The workspace's image library, in reach of the canvas.
 *
 * New surface — v2 only ever had `ImagePicker`, a per-field widget that could
 * upload but could not browse. `MediaLibrary` (the full manager, with folder
 * CRUD, bulk move and a table view) is the wrong shape for a 280px column, so
 * this is the narrow read-mostly view: search, grid, upload.
 *
 * Clicking an asset writes it into the selected image element. With nothing
 * selected there is no destination, so it says so rather than doing nothing.
 */

interface MediaPanelProps {
  /** Set the picked URL on the current selection. Absent ⇒ nothing selected. */
  onPick?: (url: string) => void;
  /** Label of the element that will receive the image, for the hint line. */
  targetLabel?: string | null;
}

const errMessage = (err: unknown): string =>
  err instanceof RxApiError
    ? err.message || err.code
    : err instanceof Error
      ? err.message
      : 'Lỗi';

export function MediaPanel({ onPick, targetLabel }: MediaPanelProps) {
  const [items, setItems] = React.useState<MediaAsset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    const handle = setTimeout(() => {
      rexerApi.media
        .list({ limit: 60, media_type: 'image', q: search.trim() || undefined })
        .then(r => {
          if (alive) setItems(r.items ?? []);
        })
        .catch(err => {
          if (alive) toast.error(`Không tải được media: ${errMessage(err)}`);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    }, 300);

    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [search, reloadKey]);

  /* Same 3-step BE flow as ImagePicker: init → presigned PUT → complete. The
     public URL is the presigned URL with its query string stripped. */
  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const init = await rexerApi.media.initUpload({
        filename: file.name,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        owner_scope: 'library',
        media_type: file.type.startsWith('image/') ? 'image' : 'file',
      });

      if (!init.presigned_url) {
        await rexerApi.media.uploadRaw(init.upload_id, file);
        throw new Error(
          'BE không trả presigned_url — chưa lấy được URL công khai'
        );
      }

      const res = await fetch(init.presigned_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!res.ok) throw new Error(`Storage upload failed: ${res.status}`);

      await rexerApi.media.completeUpload({ upload_id: init.upload_id });
      toast.success('Đã tải ảnh lên');
      setReloadKey(k => k + 1);
    } catch (err) {
      toast.error(`Tải ảnh thất bại: ${errMessage(err)}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePick = (asset: MediaAsset) => {
    if (!asset.public_url) {
      toast.error('Asset này chưa có URL công khai.');
      return;
    }
    if (!onPick) {
      toast.info('Chọn một element ảnh trên canvas trước, rồi bấm lại.');
      return;
    }
    onPick(asset.public_url);
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='shrink-0 space-y-2 p-2.5'>
        <div className='relative'>
          <Search className='absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-neutral-400' />
          <Input
            placeholder='Tìm ảnh…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='h-8 pl-8 text-xs'
          />
        </div>

        <input
          ref={fileRef}
          type='file'
          accept='image/*'
          hidden
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
        <button
          type='button'
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className='flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-neutral-300 py-2 text-xs font-medium text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-800 disabled:cursor-wait disabled:opacity-60'
        >
          {uploading ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <Upload className='size-3.5' />
          )}
          {uploading ? 'Đang tải lên…' : 'Tải ảnh lên'}
        </button>

        <p className='text-3xs leading-relaxed text-neutral-500'>
          {onPick && targetLabel
            ? `Bấm một ảnh để gán vào “${targetLabel}”.`
            : 'Chọn một element ảnh trên canvas để gán ảnh.'}
        </p>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-2.5 pb-2.5'>
        {loading ? (
          <div className='flex items-center justify-center gap-2 py-8 text-xs text-neutral-500'>
            <Loader2 className='size-3.5 animate-spin' />
            Đang tải…
          </div>
        ) : items.length === 0 ? (
          <p className='py-8 text-center text-xs text-neutral-500'>
            Chưa có ảnh nào trong thư viện.
          </p>
        ) : (
          <div className='grid grid-cols-2 gap-2'>
            {items.map(asset => (
              <button
                key={asset.id}
                type='button'
                onClick={() => handlePick(asset)}
                title={asset.original_filename}
                className={cn(
                  'group flex cursor-pointer flex-col overflow-hidden rounded-md bg-[var(--pv2-paper)] ring-1 ring-[var(--pv2-hair)] transition-colors',
                  'hover:ring-[var(--pv2-electric)]'
                )}
              >
                <span className='grid aspect-square w-full place-items-center overflow-hidden bg-neutral-100'>
                  {asset.public_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.public_url}
                      alt=''
                      loading='lazy'
                      className='size-full object-cover'
                    />
                  ) : (
                    <ImageIcon className='size-4 text-neutral-400' />
                  )}
                </span>
                <span className='text-3xs w-full truncate px-1.5 py-1 text-left text-neutral-500'>
                  {asset.original_filename}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
