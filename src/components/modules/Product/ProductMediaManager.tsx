'use client';

import * as React from 'react';
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { MediaAsset, ProductMediaBinding } from '@/services/rexer/types';
import { useUploadAndBind } from '@/services/rexer/use-upload-and-bind';

interface ProductMediaManagerProps {
  productId: string;
}

interface BindingWithAsset {
  binding: ProductMediaBinding;
  asset?: MediaAsset;
}

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function formatSize(bytes?: number) {
  if (!bytes) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function MediaTile({
  entry,
  onUnbind,
  unbinding,
}: {
  entry: BindingWithAsset;
  onUnbind: (entry: BindingWithAsset) => void;
  unbinding: boolean;
}) {
  const { binding, asset } = entry;
  const isImage = asset?.media_type === 'image';
  return (
    <div className='border-border bg-background group relative flex flex-col overflow-hidden rounded-xl border'>
      <div className='bg-muted relative flex aspect-video items-center justify-center'>
        {isImage ? (
          <ImageIcon className='text-muted-foreground size-10' />
        ) : (
          <span className='text-muted-foreground text-xs uppercase'>
            {asset?.media_type ?? 'unknown'}
          </span>
        )}
        <Badge variant='secondary' className='absolute top-2 left-2 capitalize'>
          {binding.field_key ?? 'gallery'}
        </Badge>
      </div>
      <div className='flex items-start justify-between gap-2 p-3'>
        <div className='min-w-0 flex-1'>
          <p className='text-foreground truncate text-sm font-medium'>
            {asset?.original_filename ??
              `media ${binding.media_id.slice(0, 8)}`}
          </p>
          <p className='text-muted-foreground text-xs'>
            {formatSize(asset?.file_size)}
            {asset?.width && asset?.height
              ? ` · ${asset.width}×${asset.height}`
              : ''}
          </p>
        </div>
        <Button
          variant='ghost'
          size='icon'
          aria-label='Unbind'
          disabled={unbinding}
          onClick={() => onUnbind(entry)}
          className='text-muted-foreground hover:text-destructive size-8'
        >
          <Trash2 className='size-3.5' />
        </Button>
      </div>
    </div>
  );
}

function ProductMediaManager({ productId }: ProductMediaManagerProps) {
  const [entries, setEntries] = React.useState<BindingWithAsset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [unbindingId, setUnbindingId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const { uploadAndBind, uploading, progress } = useUploadAndBind({
    target: { kind: 'product', productId },
    fieldKey: 'gallery',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      // BE doesn't expose GET /products/{id}/media — bindings are embedded
      // in ProductResponse.media. Fetch the product once, then hydrate each
      // binding's asset metadata in parallel.
      const res = await rexerApi.products.get(productId);
      const bindings: ProductMediaBinding[] = res.media ?? [];
      const hydrated = await Promise.all(
        bindings.map(async b => {
          try {
            const asset = await rexerApi.media.get(b.media_id);
            return { binding: b, asset };
          } catch {
            return { binding: b };
          }
        })
      );
      setEntries(hydrated);
    } catch (err) {
      toast.error(`Failed to load media: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    let succeeded = 0;
    for (const f of arr) {
      try {
        await uploadAndBind(f);
        succeeded++;
      } catch (err) {
        toast.error(`${f.name}: ${rxErrorMessage(err)}`);
      }
    }
    if (succeeded > 0) {
      toast.success(
        succeeded === arr.length
          ? `Uploaded & bound ${succeeded} file(s)`
          : `Uploaded ${succeeded}/${arr.length} file(s)`
      );
      await load();
    }
  };

  const handleUnbind = async (entry: BindingWithAsset) => {
    const label =
      entry.asset?.original_filename ??
      `media ${entry.binding.media_id.slice(0, 8)}`;
    if (
      !window.confirm(
        `Unbind "${label}" from this product? The asset itself stays in the library.`
      )
    )
      return;
    setUnbindingId(entry.binding.id);
    try {
      await rexerApi.products.unbindMedia(productId, entry.binding.id);
      toast.success('Unbound');
      await load();
    } catch (err) {
      toast.error(`Unbind failed: ${rxErrorMessage(err)}`);
    } finally {
      setUnbindingId(null);
    }
  };

  const triggerPicker = () => inputRef.current?.click();

  return (
    <div className='mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-6 pb-10'>
      <input
        ref={inputRef}
        type='file'
        multiple
        accept='image/*,video/*'
        className='hidden'
        onChange={e => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <section className='border-border bg-background flex items-center justify-between gap-4 rounded-xl border p-5'>
        <div>
          <h3 className='text-foreground text-base font-semibold'>
            Product media
          </h3>
          <p className='text-muted-foreground text-xs'>
            Files uploaded here are bound to this product as gallery assets,
            ready to use across landings.
          </p>
        </div>
        <Button
          variant='pill'
          size='md'
          onClick={triggerPicker}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Spinner size={14} /> Uploading {progress}%
            </>
          ) : (
            <>
              <Upload className='size-3.5' /> Upload & bind
            </>
          )}
        </Button>
      </section>

      {loading ? (
        <div className='text-muted-foreground flex justify-center py-16'>
          <Spinner size={20} />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className='size-10' />}
          title='No media bound to this product'
          description='Upload an image or video to attach it to the product gallery.'
          actions={
            <Button variant='pill' onClick={triggerPicker}>
              <Upload className='size-3.5' /> Upload first file
            </Button>
          }
        />
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {entries.map(e => (
            <MediaTile
              key={e.binding.id}
              entry={e}
              onUnbind={handleUnbind}
              unbinding={unbindingId === e.binding.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { ProductMediaManager };
