'use client';

import * as React from 'react';
import { Loader2, X } from 'lucide-react';

import { PreviewMode } from '@/components/modules/block-editor/PreviewMode';
import { parseCanvas } from '@/components/modules/block-editor/serialize';
import type { Block } from '@/components/modules/block-editor/types';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Template } from '@/services/rexer/types';

/**
 * Xem trước 1 template (full-screen) — fetch canvas_blueprint của version hiện
 * hành → parse → blocks → `<PreviewMode>`. Dùng ở StepSetup (nút mắt trên tile).
 */
export function TemplatePreviewOverlay({
  template,
  onClose,
}: {
  template: Template;
  onClose: () => void;
}) {
  const [blocks, setBlocks] = React.useState<Block[] | null>(null);
  const [transition, setTransition] = React.useState<string | undefined>();

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const ver = await rexerApi.templates
        .version(template.id, template.current_version_id)
        .catch(() => null);
      if (!alive) return;
      const parsed = ver ? parseCanvas(ver.canvas_blueprint) : null;
      setBlocks(parsed?.blocks ?? []);
      setTransition(
        (ver?.canvas_blueprint as { transition?: string } | undefined)
          ?.transition
      );
    })();
    return () => {
      alive = false;
    };
  }, [template]);

  if (!blocks) {
    return (
      <div className='fixed inset-0 z-[2000] flex items-center justify-center bg-black/60'>
        <button
          type='button'
          onClick={onClose}
          aria-label='Đóng'
          className='absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20'
        >
          <X className='size-5' />
        </button>
        <Loader2 className='size-7 animate-spin text-white' />
      </div>
    );
  }

  return (
    <PreviewMode
      blocks={blocks}
      lang='vi'
      transition={transition}
      onClose={onClose}
    />
  );
}
