'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';
import {
  MotionBlockRoot,
  MotionProvider,
} from '@/components/modules/block-editor/motion/runtime';
import type { BlockMotion } from '@/components/modules/block-editor/motion/types';
import {
  readVariant,
  type Block,
  type Device,
} from '@/components/modules/block-editor/types';
import { ExchangeDeviceStage } from '@/components/organisms/portal-v2/exchange/ExchangeDeviceStage';
import {
  getCachedExchangeBlockPreview,
  isExchangeBlockPreviewCached,
  prefetchExchangeBlockPreview,
} from '@/lib/portal-v2/exchange/blockPreview';
import { cn } from '@/lib/cn';
import { RxApiError } from '@/services/rexer/client';

type ExchangeBlockPreviewProps = {
  blockId: string;
  device: Device;
};

export const ExchangeBlockPreview = ({
  blockId,
  device,
}: ExchangeBlockPreviewProps) => {
  const t = useTranslations('portalV2.exchange');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollerEl, setScrollerEl] = useState<HTMLElement | null>(null);
  /** Prefer blockId match — never flip back to loading once resolved for this id. */
  const [loadedBlockId, setLoadedBlockId] = useState<string | null>(() =>
    isExchangeBlockPreviewCached(blockId) ? blockId : null
  );
  const [error, setError] = useState<string | null>(null);

  const block: Block | null =
    loadedBlockId === blockId
      ? (getCachedExchangeBlockPreview(blockId) ?? null)
      : null;
  const loading = loadedBlockId !== blockId && !error;

  useEffect(() => {
    let cancelled = false;

    if (isExchangeBlockPreviewCached(blockId)) {
      setLoadedBlockId(blockId);
      setError(null);
      return;
    }

    void prefetchExchangeBlockPreview(blockId)
      .then(editor => {
        if (cancelled) return;
        if (!editor) {
          setError(t('previewBlockInvalid'));
          return;
        }
        setLoadedBlockId(blockId);
        setError(null);
      })
      .catch(err => {
        if (cancelled) return;
        setError(
          err instanceof RxApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : t('previewBlockLoadError')
        );
      });

    return () => {
      cancelled = true;
    };
    // `t` omitted — identity can churn and re-trigger fetch → flicker
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId]);

  useLayoutEffect(() => {
    setScrollerEl(scrollerRef.current);
  }, [block, device]);

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

  const showLoading = loading && !block;
  const statusMessage = showLoading
    ? t('previewLoading')
    : error && !block
      ? error
      : null;

  return (
    <LandingMotionRoot scrollerRef={scrollerRef} enableSmooth={false}>
      <ExchangeDeviceStage
        device={device}
        urlLabel='/block'
        scrollable
        scrollerRef={scrollerRef}
      >
        {statusMessage ? (
          <div
            className={cn(
              'flex min-h-full items-center justify-center gap-2 px-6',
              'text-center text-[13px] text-[var(--pv2-mut)]'
            )}
          >
            {showLoading ? (
              <Loader2
                className='size-4 shrink-0 animate-spin text-[var(--pv2-electric)]'
                aria-hidden
              />
            ) : null}
            {statusMessage}
          </div>
        ) : block && resolved ? (
          <MotionProvider
            mode='preview'
            motion={resolved.motion}
            scrollerEl={scrollerEl}
          >
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
        ) : (
          <div className='flex min-h-full items-center justify-center px-6 text-center text-[13px] text-[var(--pv2-mut)]'>
            {t('previewBlockLoadError')}
          </div>
        )}
      </ExchangeDeviceStage>
    </LandingMotionRoot>
  );
};
