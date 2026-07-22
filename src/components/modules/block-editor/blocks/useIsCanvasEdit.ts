import * as React from 'react';

import { useLandingMotion } from '../motion/LandingMotion';

/**
 * `true` khi block đang nằm trong editor canvas (`active-block-preview`).
 *
 * QUAN TRỌNG — mặc định `false`: SSR của `/p/[slug]` phải render đúng nhánh
 * production ngay trong HTML. Nếu default `true`, trang public sẽ ship markup
 * editor (placeholder "Tiêu đề (tuỳ chọn)", layout phẳng…) rồi "nháy" sang
 * layout thật sau hydrate. Chiều ngược lại không flash: editor canvas là
 * client-only, `useLayoutEffect` lật `true` TRƯỚC paint đầu tiên.
 */
export function useIsCanvasEdit(
  rootRef: React.RefObject<HTMLElement | null>
): boolean {
  const { hasRoot } = useLandingMotion();
  const [isCanvas, setIsCanvas] = React.useState(false);

  React.useLayoutEffect(() => {
    if (!hasRoot) {
      setIsCanvas(false);
      return;
    }
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, [hasRoot, rootRef]);

  return isCanvas;
}
