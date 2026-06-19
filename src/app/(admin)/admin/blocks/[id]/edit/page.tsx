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
import { useParams, useSearchParams } from 'next/navigation';

import { BlockEditor } from '@/components/modules/CanvasTemplate/BlockEditor';

export default function AdminBlockEditPage() {
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();
  const savedBlockId = params?.id ?? '';
  const canvasId = sp?.get('canvas_id') ?? '';

  React.useEffect(() => {
    if (!canvasId || !savedBlockId) return;
    if (sp.get('saved_block_id') === savedBlockId) return;
    const u = new URL(window.location.href);
    u.searchParams.set('saved_block_id', savedBlockId);
    window.history.replaceState(null, '', u.toString());
  }, [canvasId, savedBlockId, sp]);

  return (
    <div className='relative flex h-screen flex-col'>
      {/* Breadcrumb admin đã ẩn — editor có nút back riêng (mũi tên ⬅ trên
          header) nên thanh này dư thừa, chiếm thêm chiều cao. */}
      <div className='flex-1 overflow-hidden'>
        {/* Block-direct: không có canvas_id → sửa thẳng saved block (blocks.get
            → canvas, lưu qua 🔖 → blocks.update). canvas_id (legacy) vẫn chạy. */}
        {canvasId ? (
          <BlockEditor templateId={canvasId} />
        ) : (
          <BlockEditor savedBlockDirectId={savedBlockId} />
        )}
      </div>
    </div>
  );
}
