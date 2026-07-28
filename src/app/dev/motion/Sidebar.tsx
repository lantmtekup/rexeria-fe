'use client';

import * as React from 'react';

import {
  listMotionEffects,
  type MotionEffectCategory,
} from '@/components/modules/block-editor/motion/motionLibrary';
import { cn } from '@/lib/cn';

export type LabNavId = 'guide' | 'pattern' | string;

const CATEGORY_ORDER: MotionEffectCategory[] = [
  'entrance',
  'text',
  'image',
  'scroll',
  'hover',
  'loop',
  'special',
];

const CATEGORY_LABEL: Record<MotionEffectCategory, string> = {
  entrance: 'Entrance',
  text: 'Text',
  image: 'Image',
  scroll: 'Scroll',
  hover: 'Hover',
  loop: 'Loop',
  special: 'Special',
};

const NavButton = ({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    type='button'
    onClick={onClick}
    onKeyDown={e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    className={cn(
      'w-full border-l-2 px-3 py-2 text-left transition-colors',
      active
        ? 'border-teal-600 bg-teal-50 text-teal-900'
        : 'border-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900',
      className
    )}
  >
    {children}
  </button>
);

export function Sidebar({
  activeId,
  onSelect,
}: {
  activeId: LabNavId;
  onSelect: (id: LabNavId) => void;
}) {
  const effects = React.useMemo(() => listMotionEffects(), []);
  const byCategory = React.useMemo(() => {
    const map = new Map<MotionEffectCategory, typeof effects>();
    for (const cat of CATEGORY_ORDER) map.set(cat, []);
    for (const effect of effects) {
      const list = map.get(effect.meta.category) ?? [];
      list.push(effect);
      map.set(effect.meta.category, list);
    }
    return map;
  }, [effects]);

  return (
    <aside className='flex h-full w-[280px] shrink-0 flex-col border-r border-stone-200 bg-white'>
      <div className='border-b border-stone-200 px-4 py-4'>
        <p className='text-sm font-semibold tracking-tight text-stone-800'>
          Motion Lab
        </p>
        <p className='mt-0.5 font-mono text-[11px] text-stone-500'>
          {effects.length} effects · attribute
        </p>
      </div>

      <nav
        aria-label='Motion lab navigation'
        className='flex-1 overflow-y-auto py-3'
      >
        <div className='mb-3 px-2'>
          <NavButton
            active={activeId === 'guide'}
            onClick={() => onSelect('guide')}
          >
            <span className='block text-sm font-medium'>Hướng dẫn</span>
            <span className='mt-0.5 block text-[11px] leading-snug text-stone-500'>
              Skill motion-pick · quy trình
            </span>
          </NavButton>
        </div>

        <div className='mx-3 mb-3 border-t border-stone-200' />

        {CATEGORY_ORDER.map(cat => {
          const list = byCategory.get(cat) ?? [];
          if (list.length === 0) return null;
          return (
            <div key={cat} className='mb-4'>
              <div className='mb-1 flex items-center justify-between px-4'>
                <span className='text-[10px] font-semibold tracking-wider text-stone-500 uppercase'>
                  {CATEGORY_LABEL[cat]}
                </span>
                <span className='font-mono text-[10px] text-stone-400'>
                  {list.length}
                </span>
              </div>
              <ul className='px-2'>
                {list.map(effect => (
                  <li key={effect.id}>
                    <NavButton
                      active={activeId === effect.id}
                      onClick={() => onSelect(effect.id)}
                    >
                      <span className='block font-mono text-[12px] font-medium'>
                        {effect.id}
                      </span>
                      <span className='mt-0.5 block truncate text-[11px] leading-snug text-stone-500'>
                        {effect.meta.summary}
                      </span>
                    </NavButton>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <div className='mx-3 mb-3 border-t border-stone-200' />

        <div className='mb-2 px-4'>
          <span className='text-[10px] font-semibold tracking-wider text-stone-500 uppercase'>
            Pattern
          </span>
        </div>
        <div className='px-2 pb-4'>
          <NavButton
            active={activeId === 'pattern'}
            onClick={() => onSelect('pattern')}
          >
            <span className='block text-sm font-medium'>Group + click</span>
            <span className='mt-0.5 block text-[11px] leading-snug text-stone-500'>
              stagger-children · trigger click
            </span>
          </NavButton>
        </div>
      </nav>
    </aside>
  );
}
