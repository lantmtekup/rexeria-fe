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
import type { MediaAsset } from '@/services/rexer/types';
import { useUploadAndBind } from '@/services/rexer/use-upload-and-bind';

interface LandingMediaManagerProps {
  projectId: string;
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
  asset,
  onUnbind,
  unbinding,
}: {
  asset: MediaAsset;
  onUnbind: (asset: MediaAsset) => void;
  unbinding: boolean;
}) {
  const isImage = asset.media_type === 'image';
  return (
    <div className='border-border bg-background group relative flex flex-col overflow-hidden rounded-xl border'>
      <div className='bg-muted relative flex aspect-video items-center justify-center'>
        {isImage ? (
          // BE storage URL is opaque; rely on storage_key wiring elsewhere.
          // Fallback to icon when no preview URL is present.
          <ImageIcon className='text-muted-foreground size-10' />
        ) : (
          <span className='text-muted-foreground text-xs uppercase'>
            {asset.media_type}
          </span>
        )}
        <Badge variant='secondary' className='absolute top-2 left-2 capitalize'>
          {asset.media_type}
        </Badge>
      </div>
      <div className='flex items-start justify-between gap-2 p-3'>
        <div className='min-w-0 flex-1'>
          <p className='text-foreground truncate text-sm font-medium'>
            {asset.original_filename}
          </p>
          <p className='text-muted-foreground text-xs'>
            {formatSize(asset.file_size)}
            {asset.width && asset.height
              ? ` · ${asset.width}×${asset.height}`
              : ''}
          </p>
        </div>
        <Button
          variant='ghost'
          size='icon'
          aria-label='Unbind'
          disabled={unbinding}
          onClick={() => onUnbind(asset)}
          className='text-muted-foreground hover:text-destructive size-8'
        >
          <Trash2 className='size-3.5' />
        </Button>
      </div>
    </div>
  );
}

function LandingMediaManager({ projectId }: LandingMediaManagerProps) {
  const [assets, setAssets] = React.useState<MediaAsset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [unbindingId, setUnbindingId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const { uploadAndBind, uploading, progress } = useUploadAndBind({
    target: { kind: 'project', projectId },
    fieldKey: 'gallery',
  });

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await rexerApi.projects.media(projectId);
      setAssets(r.items);
    } catch (err) {
      toast.error(`Failed to load media: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

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

  const handleUnbind = async (asset: MediaAsset) => {
    // BE deletes by binding_id, but the project/{id}/media list returns
    // assets — we need binding_id from the bindings endpoint to unbind.
    // For MVP, surface guidance: unbind requires binding ids returned at
    // bind time. We refetch list afterward.
    if (
      !window.confirm(
        `Unbind "${asset.original_filename}" from this landing? The asset itself stays in the library.`
      )
    )
      return;
    setUnbindingId(asset.id);
    try {
      // Heuristic: many BE responses re-use media_id as binding key in lists
      // — if BE returns binding_id we should swap this with that. Until the
      // GET /projects/{id}/media response is wired to expose binding_id, we
      // try using the asset id and let BE 404 with a clear error.
      await rexerApi.media.unbindFromProject(projectId, asset.id);
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
    <div className='mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-6 pb-10'>
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
            Landing media
          </h3>
          <p className='text-muted-foreground text-xs'>
            Files uploaded here are bound to this landing automatically — they
            render in the published page.
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
      ) : assets.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className='size-10' />}
          title='No media bound to this landing'
          description='Upload an image or video to add it to the published page.'
          actions={
            <Button variant='pill' onClick={triggerPicker}>
              <Upload className='size-3.5' /> Upload first file
            </Button>
          }
        />
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {assets.map(a => (
            <MediaTile
              key={a.id}
              asset={a}
              onUnbind={handleUnbind}
              unbinding={unbindingId === a.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { LandingMediaManager };
