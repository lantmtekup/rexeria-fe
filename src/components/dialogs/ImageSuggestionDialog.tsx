'use client';

import * as React from 'react';
import { Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Spinner } from '@/components/atoms/spinner';
import { rexerApi } from '@/services/rexer/endpoints';
import type { MediaAsset } from '@/services/rexer/types';

interface Props {
  open: boolean;
  /** Per BE Q17, suggestions are a flat list of media IDs. */
  mediaIds: string[];
  /** Currently chosen media_id, if any. */
  selectedMediaId?: string | null;
  onClose: () => void;
  onPick: (mediaId: string) => void;
}

/**
 * Resolves the suggestion media IDs to MediaAsset via the BE batch filter
 * `GET /v1/media?ids=…` (BE Q17 patch). One request — BE silently skips
 * unknown ids, caps at 100, dedups.
 */
export function ImageSuggestionDialog({
  open,
  mediaIds,
  selectedMediaId,
  onClose,
  onPick,
}: Props) {
  const [assets, setAssets] = React.useState<MediaAsset[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open || mediaIds.length === 0) {
      setAssets([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    rexerApi.media
      .list({ ids: mediaIds })
      .then(r => {
        if (cancelled) return;
        // Preserve the BE suggestion order (relevance ranking).
        const byId = new Map(r.items.map(m => [m.id, m]));
        setAssets(
          mediaIds.map(id => byId.get(id)).filter((m): m is MediaAsset => !!m)
        );
      })
      .catch(() => {
        if (!cancelled) setAssets([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, mediaIds]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Chọn ảnh AI gợi ý</DialogTitle>
          <DialogDescription>
            Bấm vào ảnh bạn thích để dùng cho block này.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className='flex justify-center py-8'>
            <Spinner />
          </div>
        ) : assets.length === 0 ? (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            Không có gợi ý nào cho block này.
          </p>
        ) : (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {assets.map(a => {
              const isSelected = selectedMediaId === a.id;
              const url = thumbnailUrlOf(a);
              return (
                <button
                  key={a.id}
                  type='button'
                  onClick={() => {
                    onPick(a.id);
                    onClose();
                  }}
                  className={
                    'group bg-muted relative aspect-video overflow-hidden rounded-md border-2 ' +
                    (isSelected
                      ? 'border-primary'
                      : 'hover:border-primary/60 border-transparent')
                  }
                >
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt='' className='size-full object-cover' />
                  ) : (
                    <span className='text-muted-foreground flex h-full items-center justify-center text-xs'>
                      {a.id.slice(0, 8)}
                    </span>
                  )}
                  {isSelected ? (
                    <span className='bg-primary text-primary-foreground absolute top-2 right-2 rounded-full p-1'>
                      <Check className='size-3' />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function thumbnailUrlOf(a: MediaAsset): string | undefined {
  // MediaAsset shape across the codebase varies — try a few common fields.
  const rec = a as unknown as Record<string, unknown>;
  return (
    (rec.thumbnail_url as string | undefined) ??
    (rec.url as string | undefined) ??
    (rec.public_url as string | undefined)
  );
}
