'use client';

/**
 * In-admin wrapper around the canvas editor for editing a saved block.
 *
 * Opens at `/admin/blocks/:savedBlockId/edit?canvas_id=:scratchId` so the
 * URL stays under /admin instead of leaking out to bare /canvas-templates.
 * Internally mounts the same `BlockEditor` and forwards `saved_block_id`
 * via the editor's existing query contract so the bookmark/SaveBlockDialog
 * flow opens in "overwrite original" mode.
 *
 * Mirror of /portal/blocks/[id]/edit but in admin namespace.
 */

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { BlockEditor } from '@/components/modules/CanvasTemplate/BlockEditor';

export default function AdminBlockEditPage() {
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const savedBlockId = params?.id ?? '';
  const canvasId = sp?.get('canvas_id') ?? '';

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
          Mở lại từ trang Blocks để tạo canvas tạm trước khi sửa.
        </p>
        <Link
          href='/admin/blocks'
          className='bg-foreground text-background hover:bg-foreground/85 mt-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium'
        >
          <ArrowLeft className='size-3.5' />
          Quay lại Blocks
        </Link>
      </div>
    );
  }

  return (
    <div className='relative flex h-screen flex-col'>
      {/* Slim admin-context breadcrumb so the user knows they're still in
          /admin even though the underlying editor takes full viewport. */}
      <div className='border-border text-content-muted bg-background flex items-center gap-2 border-b px-4 py-2 text-xs'>
        <button
          type='button'
          onClick={() => router.push('/admin/blocks')}
          className='hover:text-foreground inline-flex items-center gap-1'
        >
          <ArrowLeft className='size-3.5' />
          /admin/blocks
        </button>
        <span className='text-muted-foreground'>/</span>
        <span className='text-content-muted font-mono'>
          {savedBlockId.slice(0, 12)}…
        </span>
        <span className='text-muted-foreground'>/</span>
        <span className='text-foreground font-semibold'>edit</span>
      </div>
      <div className='flex-1 overflow-hidden'>
        <BlockEditor templateId={canvasId} />
      </div>
    </div>
  );
}
