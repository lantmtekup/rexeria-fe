'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import DesignPanel from './DesignPanel';
import DetailsPanel from './DetailsPanel';
import ProductsPanel from './ProductsPanel';
import { StoryRail, StoryTabBar } from './StoryMenu';
import { STORY_SECTIONS } from './story-data';

const HEADER_H = 72;

const PANELS = [
  { Component: DesignPanel, height: '' },
  { Component: DetailsPanel, height: 'lg:h-[calc(100svh-72px)]' },
  { Component: ProductsPanel, height: 'lg:h-[calc(100svh-72px)]' },
] as const;

export default function ProductStorySection() {
  const [active, setActive] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const nodes = panelRefs.current.filter(
      (node): node is HTMLDivElement => node !== null
    );
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const index = nodes.indexOf(entry.target as HTMLDivElement);
          if (index !== -1) setActive(index);
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const scrollToPanel = useCallback((index: number) => {
    const node = panelRefs.current[index];
    if (!node) return;
    const top = node.getBoundingClientRect().top + window.scrollY - HEADER_H;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return (
    <section
      id='story'
      aria-label='Le Cool Move'
      className='relative w-full bg-[#F5F5F5]'
    >
      <StoryTabBar activeIndex={active} onSelect={scrollToPanel} />

      <div className='flex items-start'>
        <StoryRail activeIndex={active} onSelect={scrollToPanel} />

        <div className='min-w-0 flex-1'>
          {PANELS.map(({ Component, height }, i) => (
            <div
              key={STORY_SECTIONS[i].id}
              id={STORY_SECTIONS[i].id}
              ref={node => {
                panelRefs.current[i] = node;
              }}
              className={`w-full scroll-mt-[72px] ${height}`}
            >
              <Component />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
