'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { Device } from '@/components/modules/block-editor/types';
import { ExchangeDeviceStage } from '@/components/organisms/portal-v2/exchange/ExchangeDeviceStage';
import { PreviewStageLoading } from '@/components/organisms/portal-v2/exchange/PreviewStageLoading';
import { markExchangePagePreviewCached } from '@/lib/portal-v2/exchange/pagePreview';

type ExchangePagePreviewProps = {
  slug: string;
  /** Canvas sub-page path ('' = home) — renders `/p/{slug}/{pagePath}`. */
  pagePath?: string;
  name: string;
  device: Device;
  /** Set only from rail click — scrolls iframe to this block. */
  scrollToBlockId?: string | null;
  /** Bumped on each rail click so re-selecting the same block re-scrolls. */
  scrollNonce?: number;
  onActiveBlockChange?: (blockId: string) => void;
};

const scrollIframeToBlock = (
  iframe: HTMLIFrameElement,
  blockId: string
): boolean => {
  try {
    const doc = iframe.contentDocument;
    if (!doc) return false;
    const el = doc.querySelector(
      `[data-block-id="${CSS.escape(blockId)}"]`
    ) as HTMLElement | null;
    if (!el) return false;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  } catch {
    return false;
  }
};

export const ExchangePagePreview = ({
  slug,
  pagePath = '',
  name,
  device,
  scrollToBlockId = null,
  scrollNonce = 0,
  onActiveBlockChange,
}: ExchangePagePreviewProps) => {
  const t = useTranslations('portalV2.preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const programmaticScrollRef = useRef(false);
  const lastReportedRef = useRef<string | null>(null);
  const sessionKey = `${slug}:${pagePath}:${device}`;
  const [showOverlay, setShowOverlay] = useState(true);
  const loading = showOverlay;
  /** `pagePath` may contain '/' (nested sub-paths) — encode per segment. */
  const encodedPagePath = pagePath
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
  const src = encodedPagePath
    ? `/p/${encodeURIComponent(slug)}/${encodedPagePath}`
    : `/p/${encodeURIComponent(slug)}`;

  useLayoutEffect(() => {
    setShowOverlay(true);
  }, [sessionKey]);

  // Rail click → scroll iframe to block (does not run on IO-driven active sync).
  useEffect(() => {
    if (loading || !scrollToBlockId) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    programmaticScrollRef.current = true;
    lastReportedRef.current = scrollToBlockId;
    const ok = scrollIframeToBlock(iframe, scrollToBlockId);

    if (!ok) {
      programmaticScrollRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 750);
    return () => window.clearTimeout(timer);
  }, [scrollToBlockId, scrollNonce, loading, sessionKey]);

  // User scroll → sync active block in rail.
  useEffect(() => {
    if (loading || !onActiveBlockChange) return;
    const iframe = iframeRef.current;
    const win = iframe?.contentWindow;
    const doc = iframe?.contentDocument;
    if (!iframe || !win || !doc) return;

    const nodes = Array.from(
      doc.querySelectorAll<HTMLElement>('[data-block-id]')
    );
    if (!nodes.length) return;

    const pickActive = () => {
      if (programmaticScrollRef.current) return;

      let bestId: string | null = null;
      let bestScore = Number.POSITIVE_INFINITY;

      for (const node of nodes) {
        const id = node.getAttribute('data-block-id');
        if (!id) continue;
        const top = node.getBoundingClientRect().top;
        const score = Math.abs(top - 96);
        if (top < win.innerHeight * 0.75 && score < bestScore) {
          bestScore = score;
          bestId = id;
        }
      }

      if (!bestId || bestId === lastReportedRef.current) return;
      lastReportedRef.current = bestId;
      onActiveBlockChange(bestId);
    };

    pickActive();
    win.addEventListener('scroll', pickActive, { passive: true });
    win.addEventListener('resize', pickActive);
    return () => {
      win.removeEventListener('scroll', pickActive);
      win.removeEventListener('resize', pickActive);
    };
  }, [loading, sessionKey, onActiveBlockChange]);

  return (
    <ExchangeDeviceStage
      device={device}
      urlLabel={pagePath ? `/${slug}/${pagePath}` : `/${slug}`}
    >
      {showOverlay ? (
        <PreviewStageLoading
          className='absolute inset-0'
          label={t('previewLoading')}
        />
      ) : null}
      <iframe
        key={sessionKey}
        ref={iframeRef}
        title={name}
        src={src}
        sandbox='allow-scripts allow-same-origin allow-forms allow-popups'
        className='absolute inset-0 block size-full border-0 bg-white'
        onLoad={() => {
          if (!pagePath) markExchangePagePreviewCached(slug);
          // Immediate reveal — skip PreviewStageLoading's 0→100 outro so page
          // blocks (BelgoScrollFrames, etc.) can show their own preloader.
          setShowOverlay(false);
        }}
      />
    </ExchangeDeviceStage>
  );
};
