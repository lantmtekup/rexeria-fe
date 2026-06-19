'use client';

import * as React from 'react';

const FULL_BLOCK_PREVIEW_MS = 5_000;
const ELEMENT_AUDITION_MS = 2_500;

/**
 * Motion preview state for the editor canvas. Two play modes:
 *
 *   - `playBlock()` — animates the whole block timeline for 5s. Triggered
 *     by the header / sidebar Play buttons. Sets `previewing=true` and
 *     bumps `nonce` so MotionBlockRoot re-runs even when previewing was
 *     already true (state-equality dedupe would otherwise no-op).
 *
 *   - `playElement(key)` — auditions just one element's track for 2.5s.
 *     Used when the user picks a preset on the sidebar Motion panel so
 *     they can see what each preset looks like.
 *
 * `nonce` is the key gadget: every play call increments it. The runtime
 * includes it in useGSAP deps to force a fresh build + play, decoupling
 * the "should we play?" signal from the "what mode are we in?" signal.
 */
export interface UseMotionPreviewApi {
  previewing: boolean;
  /** Bumped on every play call. Threaded through to the runtime. */
  nonce: number;
  /** When set, the runtime filters tracks to this element only. */
  previewElement: string | null;
  playBlock: () => void;
  playElement: (elementKey: string) => void;
}

export interface UseMotionPreviewOpts {
  /** Called when an element audition starts so caller can outline it. */
  onElementSelect?: (key: string) => void;
}

export function useMotionPreview(
  opts: UseMotionPreviewOpts = {}
): UseMotionPreviewApi {
  const [previewing, setPreviewing] = React.useState(false);
  const [nonce, setNonce] = React.useState(0);
  const [previewElement, setPreviewElement] = React.useState<string | null>(
    null
  );
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSelectRef = React.useRef(opts.onElementSelect);
  React.useEffect(() => {
    onSelectRef.current = opts.onElementSelect;
  });

  const arm = React.useCallback((ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPreviewing(false);
      setPreviewElement(null);
      timerRef.current = null;
    }, ms);
  }, []);

  const playBlock = React.useCallback(() => {
    setPreviewing(true);
    setPreviewElement(null);
    setNonce(n => n + 1);
    arm(FULL_BLOCK_PREVIEW_MS);
  }, [arm]);

  const playElement = React.useCallback(
    (key: string) => {
      onSelectRef.current?.(key);
      setPreviewing(true);
      setPreviewElement(key);
      setNonce(n => n + 1);
      arm(ELEMENT_AUDITION_MS);
    },
    [arm]
  );

  React.useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return { previewing, nonce, previewElement, playBlock, playElement };
}
