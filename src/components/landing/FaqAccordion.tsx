'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface FaqItem {
  q: string;
  a: string;
}

/** Accordion FAQ — clone style từ site Framer gốc (card trắng bo tròn, icon +). */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className='space-y-3'>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className='rounded-2xl border border-neutral-200 bg-white'
          >
            <button
              type='button'
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className='flex w-full items-center justify-between gap-4 px-6 py-5 text-left'
            >
              <span className='font-medium text-neutral-900'>{item.q}</span>
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white transition-transform duration-300',
                  isOpen && 'rotate-45'
                )}
              >
                <Plus className='size-4' />
              </span>
            </button>
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-300',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              )}
            >
              <div className='overflow-hidden'>
                <p className='px-6 pb-6 text-sm leading-relaxed text-neutral-600'>
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 4 câu hỏi dùng chung giữa trang About và Contact (copy từ site gốc). */
export const REXER_FAQ: FaqItem[] = [
  {
    q: 'What are Experiences and how are they different from a normal website?',
    a: 'Experiences are interactive, scroll-based, modular journeys designed to engage users far beyond a static website. Instead of just browsing information, audiences explore products and stories through motion, hotspots, 3D views, and immersive storytelling. A normal website is mostly static — menus, pages, text. A ReXeR Experience guides customers through a curated journey that captures attention, builds emotion, and drives action in fewer clicks.',
  },
  {
    q: 'How is ReXeR different from other agencies?',
    a: 'Traditional agencies create content or campaigns. ReXeR Studio builds the interactive layer that makes those assets unforgettable. Build once, deliver everywhere → experiences adapt across web, social, and ads. AI-powered orchestration → we optimize how your content is arranged, animated, and delivered. Focus on engagement & conversion → we’re not just designers, we’re builders of measurable digital experiences.',
  },
  {
    q: 'What values can ReXeR Studio bring to clients?',
    a: 'We help brands: Engage deeper → audiences spend more time and interact with your content. Convert smarter → frictionless calls-to-action drive higher leads & sales. Scale faster → modular experiences can be reused and adapted across campaigns. Differentiate clearly → stand out from competitors with immersive storytelling.',
  },
  {
    q: 'Do brands need their own content, or can ReXeR create it for them?',
    a: 'Both options work: If you already have photos, videos, or brand assets, we’ll transform them into interactive experiences. If you don’t, we can help produce the content through our creative partners — ensuring it’s optimized for interactivity and storytelling.',
  },
];
