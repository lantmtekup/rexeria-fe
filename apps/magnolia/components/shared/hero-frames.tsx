'use client';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useReducedMotion } from 'framer-motion';
import manifest from '@/lib/hero-frames.json';
import { useFrameLoader, type FrameList } from './use-frame-loader';

/**
 * The hero film's frames, loaded once and shared.
 *
 * Two components need them and they must not each start their own download: the hero draws
 * them, and the preloader counts them — the opening beat holds until the whole sequence is
 * decoded, which is the difference between scrubbing a film and scrubbing a slideshow. So the
 * load is hoisted to a provider in the layout and both read from here.
 *
 * **Two sets, chosen by screen width.** The film is 16:9, and a phone held upright is not. The
 * canvas covers its box, so on a 390 × 844 screen the wide frame was being blown up 1.88× and
 * then cropped to the middle 26 % of its width — the viewer was paying for a whole landscape
 * frame to see a strip of it, upscaled. `sm` is that strip, cut from the 4K source at the
 * aspect a tall phone actually has, so it arrives smaller AND sharper than what it replaces.
 * The cropping is not a loss: it is the same crop the canvas was already doing at draw time.
 *
 * The set is picked once, after mount, from `window.innerWidth` — never re-picked on resize,
 * because swapping mid-film would throw away everything already decoded.
 *
 * Under `prefers-reduced-motion` nothing is fetched at all, and `done` reports true straight
 * away so the preloader does not wait on a download that is not happening.
 */
type SetName = keyof typeof manifest.sets;

const frameUrl = (set: SetName, index: number) =>
  `${manifest.sets[set].dir}/${String(index).padStart(4, '0')}.webp`;

type HeroFrames = {
  framesRef: { current: FrameList };
  loaded: number;
  total: number;
  done: boolean;
};

const HeroFramesContext = createContext<HeroFrames | null>(null);

export function HeroFramesProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  // `null` until mounted: the width is not knowable while rendering, and guessing one would
  // start the wrong download and then have to abandon it.
  const [set, setSet] = useState<SetName | null>(null);
  useEffect(() => {
    setSet(window.innerWidth < manifest.smallMaxWidth ? 'sm' : 'lg');
  }, []);

  const urls = useMemo(
    () =>
      reduced || !set
        ? null
        : Array.from({ length: manifest.count }, (_, i) => frameUrl(set, i)),
    [reduced, set]
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
