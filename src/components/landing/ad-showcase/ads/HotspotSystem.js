'use client';

import { cn } from '@/lib/cn';
import { useState, useRef, useEffect } from 'react';
import { useDeviceView } from './shared/useDeviceView';

export default function HotspotSystem({ hotspots = [] }) {
  const [openIds, setOpenIds] = useState(new Set());
  const pointRefs = useRef({});
  const { device } = useDeviceView();
  const isDesktop = device === 'desktop';

  useEffect(() => {
    if (openIds.size === 0) return;
    const handler = e => {
      setOpenIds(prev => {
        const next = new Set(prev);
        for (const id of prev) {
          const el = pointRefs.current[id];
          if (el && !el.contains(e.target)) next.delete(id);
        }
        return next.size === prev.size ? prev : next;
      });
    };
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [openIds]);

  return (
    <div className='hs-overlay'>
      {hotspots.map(h => {
        const isOpen = openIds.has(h.id);
        const isRight = h.direction === 'right';

        const toggle = e => {
          e.stopPropagation();
          setOpenIds(prev => {
            const next = new Set(prev);
            isOpen ? next.delete(h.id) : next.add(h.id);
            return next;
          });
        };

        const dot = (
          <span key='dot' className='hs-dot' aria-hidden='true'>
            <span className='hs-ping' />
            <span className='hs-core' />
          </span>
        );

        const card = (
          <div
            key='card'
            className='hs-inline'
            style={h.openWidth ? { '--hs-open-w': h.openWidth } : undefined}
          >
            <div className='hs-inline-title'>{h.label}</div>
            {h.description && <p className='hs-inline-desc'>{h.description}</p>}
          </div>
        );

        return (
          <div
            key={h.id}
            ref={el => {
              pointRefs.current[h.id] = el;
            }}
            className={cn(
              'hs-point',
              isRight && 'hs-point--right',
              isOpen && 'hs-point--open'
            )}
            style={
              isRight
                ? {
                    right: `${100 - (isDesktop && h.xDesktop !== undefined ? h.xDesktop : h.x)}%`,
                    top: `${isDesktop && h.yDesktop !== undefined ? h.yDesktop : h.y}%`,
                  }
                : {
                    left: `${isDesktop && h.xDesktop !== undefined ? h.xDesktop : h.x}%`,
                    top: `${isDesktop && h.yDesktop !== undefined ? h.yDesktop : h.y}%`,
                  }
            }
            onClick={toggle}
            role='button'
            tabIndex={0}
            aria-label={h.label}
            aria-expanded={isOpen}
            onKeyDown={e => e.key === 'Enter' && toggle(e)}
          >
            {isRight ? [card, dot] : [dot, card]}
          </div>
        );
      })}
    </div>
  );
}
