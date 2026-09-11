'use client';
import { useEffect, useRef, useState } from 'react';

export type FrameList = (HTMLImageElement | null)[];

/**
 * Preloads and decodes a frame sequence, reporting progress.
 *
 * Ported from `website-magnolia`'s `use-frame-loader.ts`. Three decisions in it matter, and a
 * naive `new Image(); img.src = …` loop gets all three wrong:
 *
 * - **Bounded concurrency.** Firing all 286 requests at once saturates the connection pool and
 *   the frames come back in whatever order the network settles on. Eight workers pulling from
 *   a shared cursor means the opening frames land first, in order.
 * - **Explicit `decode()`.** `onload` only means the bytes arrived; the image is still decoded
 *   lazily on its first `drawImage`, which stalls exactly the frame you are scrubbing to.
 *   Decoding up front moves that cost off the scroll. Safari sometimes rejects `decode()` on
 *   an image it will happily paint, so a rejection is ignored rather than treated as a failure.
 * - **Failures stay `null`.** A frame that never arrives leaves a hole; the drawing side steps
 *   back to the nearest frame it does have instead of leaving a stale picture on screen.
 *
 * `framesRef` is a ref, not state: the array is read on every scroll frame and must not
 * re-render anything. `loaded` is state because the counter on the loader reads it.
 */
export function useFrameLoader(urls: string[] | null, concurrency = 8) {
  const framesRef = useRef<FrameList>([]);
  const [loaded, setLoaded] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!urls || urls.length === 0) return;

    let cancelled = false;
    const frames: FrameList = new Array(urls.length).fill(null);
    framesRef.current = frames;
    setLoaded(0);
    setDone(false);

    let next = 0;
    let count = 0;

    const loadOne = (index: number) =>
      new Promise<void>(resolve => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          img
            .decode()
            .catch(() => undefined)
            .finally(() => {
              frames[index] = img;
              resolve();
            });
        };
        img.onerror = () => resolve();
        img.src = urls[index];
      });

    const worker = async () => {
      while (!cancelled && next < urls.length) {
        const index = next++;
        await loadOne(index);
        if (cancelled) return;
        count += 1;
        setLoaded(count);
      }
    };

    Promise.all(
      Array.from({ length: Math.min(concurrency, urls.length) }, worker)
    ).then(() => {
      if (!cancelled) setDone(true);
    });

    return () => {
      cancelled = true;
    };
  }, [urls, concurrency]);

  return { framesRef, loaded, total: urls?.length ?? 0, done };
}
