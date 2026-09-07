import { useEffect, useLayoutEffect } from 'react';

// Avoid the SSR "useLayoutEffect does nothing on the server" warning while
// still using the synchronous variant on the client. GSAP/ScrollTrigger setup
// MUST run after layout but before paint to prevent first-frame flashes.
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
