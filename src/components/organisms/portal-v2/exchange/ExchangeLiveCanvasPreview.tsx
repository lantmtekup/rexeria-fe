'use client';

import { useTranslations } from 'next-intl';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import type { Device, Lang } from '@/components/modules/block-editor/types';
import { ExchangeDeviceStage } from '@/components/organisms/portal-v2/exchange/ExchangeDeviceStage';
import { PreviewStageLoading } from '@/components/organisms/portal-v2/exchange/PreviewStageLoading';
import {
  LIVE_CANVAS_EMBED_PATH,
  LIVE_CANVAS_HELLO,
  LIVE_CANVAS_PAYLOAD,
  LIVE_CANVAS_READY,
} from '@/lib/portal-v2/preview/liveCanvas';

type ExchangeLiveCanvasPreviewProps = {
  device: Device;
  lang: Lang;
  /** Read at handshake time so the frame always gets the latest edits. */
  getBlueprint: () => Record<string, unknown>;
  transition?: string;
  /** Desktop chrome URL pill. */
  urlLabel?: string;
};

/** Overlay never outlives the frame boot by more than this. */
const READY_TIMEOUT_MS = 10_000;

/**
 * Shopper-view stage for the editor's LIVE canvas — the unsaved one.
 *
 * The block/page stages point an iframe at a URL; this one has no URL to point
 * at, so it posts the serialized blueprint into `/embed/canvas` instead (the
 * handshake is documented in `lib/portal-v2/preview/liveCanvas.ts`). Rendering
 * inside the iframe rather than in the host document is what keeps sticky /
 * pinned / scrubbed blocks honest: `ExchangeDeviceStage` scales its frame, and
 * `transform: scale()` breaks pinning.
 */
export const ExchangeLiveCanvasPreview = ({
  device,
  lang,
  getBlueprint,
  transition,
  urlLabel = '/preview',
}: ExchangeLiveCanvasPreviewProps) => {
  const t = useTranslations('portalV2.preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const instanceId = useId();
  /* One token per (frame instance, device) — a stale frame can't clear the
     overlay of the one that replaced it. */
  const token = `${instanceId}:${device}`;
  const [frameReady, setFrameReady] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const getBlueprintRef = useRef(getBlueprint);
  getBlueprintRef.current = getBlueprint;

  useLayoutEffect(() => {
    setFrameReady(false);
    setShowOverlay(true);
  }, [token]);

  const sendPayload = useCallback(() => {
    const frame = iframeRef.current?.contentWindow;
    if (!frame) return;
    frame.postMessage(
      {
        type: LIVE_CANVAS_PAYLOAD,
        token,
        blueprint: getBlueprintRef.current(),
        lang,
        device,
        transition,
      },
      window.location.origin
    );
  }, [token, lang, device, transition]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === LIVE_CANVAS_HELLO) {
        sendPayload();
        return;
      }
      if (data.type === LIVE_CANVAS_READY && data.token === token) {
        setFrameReady(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendPayload, token]);

  /* Never leave the boot UI up forever if the frame goes quiet. */
  useEffect(() => {
    if (frameReady) return;
    const timer = window.setTimeout(
      () => setFrameReady(true),
      READY_TIMEOUT_MS
    );
    return () => window.clearTimeout(timer);
  }, [frameReady, token]);

  return (
    <ExchangeDeviceStage device={device} urlLabel={urlLabel}>
      {showOverlay ? (
        <PreviewStageLoading
          className='absolute inset-0'
          label={t('previewLoading')}
          complete={frameReady}
          onFinished={() => setShowOverlay(false)}
        />
      ) : null}
      <iframe
        key={token}
        ref={iframeRef}
        title={urlLabel}
        src={LIVE_CANVAS_EMBED_PATH}
        sandbox='allow-scripts allow-same-origin allow-forms allow-popups'
        className='absolute inset-0 block size-full border-0 bg-white'
        /* Belt and braces: a hello posted before this component's listener was
           attached would otherwise strand the frame on its own spinner. */
        onLoad={sendPayload}
      />
    </ExchangeDeviceStage>
  );
};
