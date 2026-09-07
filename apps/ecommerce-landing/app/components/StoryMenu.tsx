import Image from 'next/image';

import { IconDash } from './StoryIcons';
import {
  CROWN_H,
  CROWN_W,
  MENU_STACK_H,
  STORY_SECTIONS,
  menuLayout,
} from './story-data';

const EASE = 'cubic-bezier(.4,0,.2,1)';

type Props = {
  activeIndex: number;
  onSelect: (index: number) => void;
};

function Dashes({ visible, offset }: { visible: boolean; offset: number }) {
  const base = `absolute top-1/2 h-[6px] w-[21px] -translate-y-1/2 text-[#1D1D1B] transition-opacity duration-300 ${
    visible ? 'opacity-100' : 'opacity-0'
  }`;
  return (
    <>
      <IconDash className={base} style={{ left: -offset }} />
      <IconDash className={base} style={{ right: -offset }} />
    </>
  );
}

export function StoryRail({ activeIndex, onSelect }: Props) {
  const { crownTop, itemTop } = menuLayout(activeIndex);

  return (
    <aside className='sticky top-[72px] hidden h-[calc(100svh-72px)] w-[354px] shrink-0 border-r border-black/40 bg-[#F5F5F5] pt-[clamp(56px,13vh,120px)] lg:block'>
      <div className='relative mx-auto w-full' style={{ height: MENU_STACK_H }}>
        <Image
          data-crown-slot='story'
          src='/hero/hero-emblem.png'
          alt=''
          aria-hidden
          width={CROWN_W}
          height={CROWN_H}
          className='absolute left-1/2 h-auto w-[159px] -translate-x-1/2'
          style={{ top: crownTop, transition: `top 500ms ${EASE}` }}
        />

        {STORY_SECTIONS.map((section, i) => (
          <button
            key={section.id}
            type='button'
            onClick={() => onSelect(i)}
            aria-current={i === activeIndex ? 'true' : undefined}
            className='absolute left-1/2 flex h-[26px] -translate-x-1/2 items-center whitespace-nowrap'
            style={{ top: itemTop[i], transition: `top 500ms ${EASE}` }}
          >
            <span className='font-montserrat text-[16px] leading-[26px] font-medium text-black uppercase'>
              {section.label}
            </span>
            <Dashes visible={i === activeIndex} offset={26} />
          </button>
        ))}
      </div>
    </aside>
  );
}

export function StoryTabBar({ activeIndex, onSelect }: Props) {
  return (
    <nav
      aria-label='Product story'
      className='sticky top-[72px] z-30 flex items-center justify-center gap-4 border-b border-black/40 bg-[#F5F5F5] py-3 sm:gap-8 lg:hidden'
    >
      {STORY_SECTIONS.map((section, i) => (
        <button
          key={section.id}
          type='button'
          onClick={() => onSelect(i)}
          aria-current={i === activeIndex ? 'true' : undefined}
          className='relative flex h-[26px] items-center px-[26px] whitespace-nowrap'
        >
          <span
            className={`font-montserrat text-[13px] leading-[26px] font-medium text-black uppercase transition-opacity ${
              i === activeIndex ? 'opacity-100' : 'opacity-40'
            }`}
          >
            {section.label}
          </span>
          <Dashes visible={i === activeIndex} offset={0} />
        </button>
      ))}
    </nav>
  );
}
