'use client';
import { useEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function useScrollTriggerRefresh() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.status === 'loaded') refresh();
    else document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);
}

export function MainShell({ children }: { children: ReactNode }) {
  useScrollTriggerRefresh();
  return <main id='main'>{children}</main>;
}
