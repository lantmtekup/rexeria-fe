'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { Device } from '@/components/modules/block-editor/types';
import { ExchangeDeviceStage } from '@/components/organisms/portal-v2/exchange/ExchangeDeviceStage';
import { PreviewStageLoading } from '@/components/organisms/portal-v2/exchange/PreviewStageLoading';
import {
  exchangeBlockEmbedSrc,
  markExchangeBlockPreviewCached,
} from '@/lib/portal-v2/exchange/blockPreview';

type ExchangeBlockPreviewProps = {
  blockId: string;
  device: Device;
};

const PREVIEW_READY_TYPE = 'rexer-preview-ready';

/**
 * Shopper-view block preview via iframe sized to the device frame.
 * Inside the iframe, `100vh`/`100dvh` match the frame — not the host window.
 *
 * Host overlay stays until the embed posts `rexer-preview-ready` (API + paint),
 * not merely iframe onLoad — otherwise the embed's own fetch spinner flashes.
 */
export const ExchangeBlockPreview = ({
  blockId,
  device,
}: ExchangeBlockPreviewProps) => {
  const t = useTranslations('portalV2.preview');
  const tExchange = useTranslations('portalV2.exchange');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sessionKey = `${blockId}:${device}`;
  const [iframeReady, setIframeReady] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const src = exchangeBlockEmbedSrc(blockId, device);

  useLayoutEffect(() => {
    setIframeReady(false);
    setShowOverlay(true);
  }, [sessionKey]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type !== PREVIEW_READY_TYPE) return;
      if (data.blockId !== blockId) return;
      markExchangeBlockPreviewCached(blockId);
      setIframeReady(true);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [blockId]);

  return (
    <ExchangeDeviceStage device={device} urlLabel='/block'>
      {showOverlay ? (
        <PreviewStageLoading
          className='absolute inset-0'
          label={t('previewLoading')}
          complete={iframeReady}
          onFinished={() => setShowOverlay(false)}
        />
      ) : null}
      <iframe
        key={sessionKey}
        ref={iframeRef}
        title={tExchange('kindBlock')}
        src={src}
        sandbox='allow-scripts allow-same-origin allow-forms allow-popups'
        className='absolute inset-0 block size-full border-0 bg-white'
      />
    </ExchangeDeviceStage>
  );
};
