'use client';

/**
 * Bare full-viewport block render for Exchange shopper-view iframes.
 *
 * The parent `ExchangeDeviceStage` sizes the iframe to the device viewport
 * (390×844 / 1440×862). Inside this document, `100vh` / `100dvh` === that
 * iframe height — so full-viewport heroes fill the frame with no phantom scroll.
 *
 * Query: `?device=mobile|tablet|desktop` (default desktop) for variant content.
 */

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';
import {
  MotionBlockRoot,
  MotionProvider,
} from '@/components/modules/block-editor/motion/runtime';
import type { BlockMotion } from '@/components/modules/block-editor/motion/types';
import { migrateBlockV1toV2 } from '@/components/modules/block-editor/serialize';
import {
  readVariant,
  type Block,
  type Device,
} from '@/components/modules/block-editor/types';
import { AuthHydrator } from '@/components/modules/Auth/AuthHydrator';
import { PreviewStageLoading } from '@/components/organisms/portal-v2/exchange/PreviewStageLoading';
import { rexerApi } from '@/services/rexer/endpoints';

const DEVICES: Device[] = ['desktop', 'tablet', 'mobile'];

const PREVIEW_READY_TYPE = 'rexer-preview-ready';

const parseDevice = (raw: string | null): Device =>
  raw && (DEVICES as string[]).includes(raw) ? (raw as Device) : 'desktop';

const parseEditorBlock = (
  settings: Record<string, unknown> | undefined
): Block | null => {
  if (!settings || typeof settings !== 'object') return null;
  if (!('blockType' in settings)) return null;
  return migrateBlockV1toV2(settings);
};

const EmbedLoading = () => (
  <PreviewStageLoading className='fixed inset-0' label='Loading preview' />
);

const EmbedBlockInner = () => {
  const params = useParams<{ blockId: string }>();
  const searchParams = useSearchParams();
  const blockId = params.blockId;
  const device = parseDevice(searchParams.get('device'));

  const [block, setBlock] = useState<Block | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!blockId) return;
    let cancelled = false;
    setBlock(null);
    setError(null);

    void rexerApi.blocks
      .get(blockId)
      .then(apiBlock => {
        if (cancelled) return;
        const editor = parseEditorBlock(apiBlock.settings);
        if (!editor) {
          setError('Block canvas data is missing or invalid.');
          return;
        }
        setBlock(editor);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load block.');
      });

    return () => {
      cancelled = true;
    };
  }, [blockId]);

  const resolved = useMemo(() => {
    if (!block) return null;
    const content =
      readVariant(block.contentVi, device) ?? block.contentVi.desktop;
    return {
      content,
      styles: readVariant(block.elementStyles, device),
      background: readVariant(block.background, device),
      order: readVariant(block.elementOrder, device),
      motion: readVariant(block.motion, device) as BlockMotion | undefined,
    };
  }, [block, device]);

  /* Tell the parent preview shell the canvas is painted — host overlay can clear. */
  useEffect(() => {
    if (!block || !resolved || !blockId) return;
    window.parent.postMessage({ type: PREVIEW_READY_TYPE, blockId }, '*');
  }, [block, resolved, blockId]);

  if (error) {
    return (
      <div className='flex min-h-dvh items-center justify-center px-6 text-center text-sm text-neutral-500'>
        {error}
      </div>
    );
  }

  if (!block || !resolved) {
    return <EmbedLoading />;
  }

  return (
    <LandingMotionRoot enableSmooth={false}>
      <MotionProvider mode='preview' motion={resolved.motion}>
        <MotionBlockRoot>
          <RenderBlock
            block={block}
            content={resolved.content}
            styles={resolved.styles}
            background={resolved.background}
            order={resolved.order}
          />
        </MotionBlockRoot>
      </MotionProvider>
    </LandingMotionRoot>
  );
};

export default function EmbedBlockPage() {
  return (
    <div className='min-h-dvh bg-white'>
      <AuthHydrator />
      <Suspense fallback={<EmbedLoading />}>
        <EmbedBlockInner />
      </Suspense>
    </div>
  );
}
