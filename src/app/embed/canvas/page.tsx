'use client';

/**
 * Bare full-viewport render of a LIVE editor canvas, for the shopper-view shell.
 *
 * Sibling of `/embed/block/[blockId]`, with one difference: there is no id to
 * fetch. The canvas being previewed is unsaved editor state, so the host hands
 * it over `postMessage` — see `lib/portal-v2/preview/liveCanvas.ts` for the
 * three-message handshake and why the render happens in an iframe at all
 * (the device stage scales its frame, and `transform: scale()` breaks pinning).
 *
 * The iframe IS the device viewport: `100vh` here === the frame, and overlay
 * portals (`resolveDrawerPortalHost`) land on `document.body` exactly as they do
 * on public `/p`.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import { AuthHydrator } from '@/components/modules/Auth/AuthHydrator';
import { LivePreviewCanvas } from '@/components/modules/block-editor-v2/LivePreviewCanvas';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';
import { parseCanvas } from '@/components/modules/block-editor/serialize';
import { PreviewStageLoading } from '@/components/organisms/portal-v2/exchange/PreviewStageLoading';
import {
  LIVE_CANVAS_HELLO,
  LIVE_CANVAS_PAYLOAD,
  LIVE_CANVAS_READY,
  type LiveCanvasPayload,
} from '@/lib/portal-v2/preview/liveCanvas';

const isPayload = (data: unknown): data is LiveCanvasPayload =>
  !!data &&
  typeof data === 'object' &&
  (data as { type?: unknown }).type === LIVE_CANVAS_PAYLOAD &&
  typeof (data as { token?: unknown }).token === 'string' &&
  !!(data as { blueprint?: unknown }).blueprint;

export default function EmbedCanvasPage() {
  const [payload, setPayload] = useState<LiveCanvasPayload | null>(null);
  const readySentRef = useRef<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isPayload(event.data)) return;
      setPayload(event.data);
    };
    window.addEventListener('message', handleMessage);

    // Tell the host we are listening. The host also (re)sends on iframe load,
    // so a hello that races the host's own listener is not fatal.
    window.parent?.postMessage(
      { type: LIVE_CANVAS_HELLO },
      window.location.origin
    );

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const canvas = useMemo(
    () => (payload ? parseCanvas(payload.blueprint) : null),
    [payload]
  );

  const handlePainted = () => {
    if (!payload || readySentRef.current === payload.token) return;
    readySentRef.current = payload.token;
    window.parent?.postMessage(
      { type: LIVE_CANVAS_READY, token: payload.token },
      window.location.origin
    );
  };

  if (!payload || !canvas) {
    return (
      <div className='min-h-dvh bg-white'>
        <AuthHydrator />
        <PreviewStageLoading
          className='fixed inset-0'
          label='Loading preview'
        />
      </div>
    );
  }

  return (
    <div className='min-h-dvh bg-white'>
      <AuthHydrator />
      <LandingMotionRoot enableSmooth={false}>
        <LivePreviewCanvas
          key={payload.token}
          blocks={canvas.blocks}
          pages={canvas.pages}
          initialPageId={canvas.activePageId}
          lang={payload.lang}
          device={payload.device}
          transition={payload.transition}
          onNavigate={() => window.scrollTo({ top: 0 })}
          onPainted={handlePainted}
        />
      </LandingMotionRoot>
    </div>
  );
}
