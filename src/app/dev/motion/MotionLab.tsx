'use client';

import * as React from 'react';

import { getMotionEffect } from '@/components/modules/block-editor/motion/motionLibrary';

import { EffectView, PatternView } from './EffectView';
import { GuideView } from './GuideView';
import { Sidebar, type LabNavId } from './Sidebar';

const parseHash = (hash: string): LabNavId => {
  const raw = hash.replace(/^#/, '');
  if (!raw || raw === 'guide') return 'guide';
  if (raw === 'pattern' || raw === 'fx-group' || raw === 'fx-click') {
    return 'pattern';
  }
  const id = raw.startsWith('fx-') ? raw.slice(3) : raw;
  // Legacy aliases from old lab anchors
  const aliases: Record<string, string> = {
    char: 'char-reveal',
    word: 'word-reveal',
    line: 'line-reveal',
    pop: 'scale-pop',
    rotate: 'rotate-in',
    flip: 'flip-in',
    zoom: 'media-zoom',
    'line-y': 'line-draw',
    'line-x': 'line-draw',
    marquee: 'marquee-loop',
    'clip-down': 'clip-reveal',
    'clip-up': 'clip-reveal',
    'clip-left': 'clip-reveal',
    'clip-right': 'clip-reveal',
  };
  const resolved = aliases[id] ?? id;
  if (resolved === 'pattern') return 'pattern';
  if (getMotionEffect(resolved)) return resolved;
  return 'guide';
};

const hashFor = (id: LabNavId): string => {
  if (id === 'guide') return '#guide';
  if (id === 'pattern') return '#pattern';
  return `#fx-${id}`;
};

export function MotionLab({
  scrollerRef,
}: {
  scrollerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [activeId, setActiveId] = React.useState<LabNavId>('guide');

  React.useEffect(() => {
    setActiveId(parseHash(window.location.hash));
    const handleHash = () => setActiveId(parseHash(window.location.hash));
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelect = React.useCallback(
    (id: LabNavId) => {
      setActiveId(id);
      const next = hashFor(id);
      if (window.location.hash !== next) {
        window.history.replaceState(null, '', next);
      }
      // Reset scroll when switching views so scrub stages start clean
      requestAnimationFrame(() => {
        scrollerRef.current?.scrollTo({ top: 0 });
      });
    },
    [scrollerRef]
  );

  return (
    <div className='flex h-full min-h-0 text-stone-800 antialiased'>
      <Sidebar activeId={activeId} onSelect={handleSelect} />
      <div
        ref={scrollerRef}
        className='min-h-0 min-w-0 flex-1 overflow-y-auto bg-stone-50'
      >
        {activeId === 'guide' ? (
          <GuideView />
        ) : activeId === 'pattern' ? (
          <PatternView />
        ) : (
          <EffectView
            effectId={activeId}
            onSelectEffect={id => handleSelect(id)}
          />
        )}
      </div>
    </div>
  );
}
