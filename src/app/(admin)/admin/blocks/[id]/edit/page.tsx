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
        <p className='text-sm font-semibold text-zinc-800'>
          Thiếu canvas_id — không thể mở editor.
        </p>
        <p className='mt-1 text-xs text-zinc-500'>
          Mở lại từ trang Blocks để tạo canvas tạm trước khi sửa.
        </p>
        <Link
          href='/admin/blocks'
          className='mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'
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
      <div className='flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-600'>
        <button
          type='button'
          onClick={() => router.push('/admin/blocks')}
          className='inline-flex items-center gap-1 hover:text-zinc-900'
        >
          <ArrowLeft className='size-3.5' />
          /admin/blocks
        </button>
        <span className='text-zinc-300'>/</span>
        <span className='font-mono text-zinc-500'>
          {savedBlockId.slice(0, 12)}…
        </span>
        <span className='text-zinc-300'>/</span>
        <span className='font-semibold text-zinc-900'>edit</span>
      </div>
      <div className='flex-1 overflow-hidden'>
        <BlockEditor templateId={canvasId} />
      </div>
    </div>
  );
}
