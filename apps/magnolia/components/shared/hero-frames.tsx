'use client';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import manifest from '@/lib/hero-frames.json';
import { useFrameLoader, type FrameList } from './use-frame-loader';

/**
 * The hero film's frames, loaded once and shared.
 *
 * Two components need them and they must not each start their own download: the hero draws
 * them, and the preloader counts them — the opening beat now holds until the whole sequence is
 * decoded, which is the difference between scrubbing a film and scrubbing a slideshow. So the
 * load is hoisted to a provider in the layout and both read from here.
 *
 * Under `prefers-reduced-motion` nothing is fetched at all (21 MB for a viewer who will never
 * see the film), and `done` reports true straight away so the preloader does not wait on a
 * download that is not happening.
 */
const FRAME_DIR = '/frames/hero';

const frameUrl = (index: number) =>
  `${FRAME_DIR}/${String(index).padStart(4, '0')}.webp`;

type HeroFrames = {
  framesRef: { current: FrameList };
  loaded: number;
  total: number;
  done: boolean;
};

const HeroFramesContext = createContext<HeroFrames | null>(null);

export function HeroFramesProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  const urls = useMemo(
    () =>
      reduced
        ? null
        : Array.from({ length: manifest.count }, (_, i) => frameUrl(i)),
    [reduced]
  );
  const { framesRef, loaded, total, done } = useFrameLoader(urls);

  const value = useMemo<HeroFrames>(
    () => ({ framesRef, loaded, total, done: reduced ? true : done }),
    [framesRef, loaded, total, done, reduced]
  );

  return (
    <HeroFramesContext.Provider value={value}>
      {children}
    </HeroFramesContext.Provider>
  );
}

export function useHeroFrames() {
  const ctx = useContext(HeroFramesContext);
  if (!ctx)
    throw new Error('useHeroFrames must be used inside <HeroFramesProvider>');
  return ctx;
}
