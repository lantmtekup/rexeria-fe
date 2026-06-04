'use client';

/**
 * In-portal wrapper around the canvas editor for editing a saved block.
 *
 * The brand portal opens this route at `/portal/blocks/:savedBlockId/edit?canvas_id=:scratchId`
 * instead of jumping to the admin/general `/canvas-templates/:id` URL so the
 * address bar stays under /portal. Internally it mounts the same `BlockEditor`
 * and forwards `saved_block_id` via the editor's existing query contract so
 * the bookmark/SaveBlockDialog flow opens in "overwrite original" mode.
 */

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { BlockEditor } from '@/components/modules/CanvasTemplate/BlockEditor';

export default function PortalBlockEditPage() {
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const savedBlockId = params?.id ?? '';
  const canvasId = sp?.get('canvas_id') ?? '';

  // BlockEditor reads `saved_block_id` from useSearchParams() to switch its
  // save dialog into overwrite-original mode. The query already contains
  // `canvas_id`; we synthesise the expected param so we don't have to touch
  // the editor itself.
  React.useEffect(() => {
    if (!canvasId || !savedBlockId) return;
    if (sp.get('saved_block_id') === savedBlockId) return;
    const u = new URL(window.location.href);
    u.searchParams.set('saved_block_id', savedBlockId);
    window.history.replaceState(null, '', u.toString());
  }, [canvasId, savedBlockId, sp]);

  if (!canvasId) {
    return (
      <div className='mx-auto max-w-2xl p-10 text-center'>
        <p className='text-foreground text-sm font-semibold'>
          Thiếu canvas_id — không thể mở editor.
        </p>
        <p className='text-content-muted mt-1 text-xs'>
          Mở lại từ trang chi tiết block để tạo canvas tạm trước khi sửa.
        </p>
        <Link
          href={`/portal/blocks/${savedBlockId}`}
          className='mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'
        >
          <ArrowLeft className='size-3.5' />
          Quay lại chi tiết
        </Link>
      </div>
    );
  }

  return (
    <div className='relative flex h-screen flex-col'>
      {/* Slim portal-context breadcrumb so the user knows they're still in
          the portal even though the underlying editor takes full viewport. */}
      <div className='border-border text-content-muted flex items-center gap-2 border-b bg-white px-4 py-2 text-xs'>
        <button
          type='button'
          onClick={() => router.push(`/portal/blocks/${savedBlockId}`)}
          className='hover:text-foreground inline-flex items-center gap-1'
        >
          <ArrowLeft className='size-3.5' />
          /portal/blocks/{savedBlockId.slice(0, 12)}…
        </button>
        <span className='text-muted-foreground'>/</span>
        <span className='text-foreground font-semibold'>edit</span>
      </div>
      <div className='flex-1 overflow-hidden'>
        <BlockEditor templateId={canvasId} />
      </div>
    </div>
  );
}
