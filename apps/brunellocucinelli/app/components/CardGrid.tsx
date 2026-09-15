'use client';

import Image from 'next/image';
import type { Highlight } from '../lib/highlights';
import { openStory } from '../lib/story';

/**
 * Grid card ảnh + tiêu đề (Highlights, Life and family…). flex-wrap +
 * justify-center để hàng cuối lẻ nằm giữa. Mỗi card có data-card — section
 * cha dùng để chạy reveal theo lô. Bấm card mở bài viết (mock).
 */
export default function CardGrid({ items }: { items: Highlight[] }) {
  return (
    <ul className='mx-auto flex max-w-[75.5rem] flex-wrap justify-center gap-4'>
      {items.map(item => (
        <li
          key={item.src}
          data-card
          className='flex w-full bg-white sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]'
        >
          <button
            type='button'
            onClick={openStory}
            className='group flex w-full flex-col text-left'
          >
            <span className='relative block aspect-[392/312] w-full overflow-hidden'>
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes='(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 392px'
                className='object-contain transition-transform duration-700 ease-out group-hover:scale-[1.04]'
              />
            </span>
            <span className='flex h-24 items-center justify-center px-8 text-center text-[16px] leading-snug text-neutral-900'>
              <span className='group-hover:underline'>{item.title}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
