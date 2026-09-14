'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

/** Nút tròn trắng 46px như c-site-header của trang mẫu. */
const iconButton =
  'pointer-events-auto grid size-10 place-items-center rounded-full bg-white transition-[background-color,transform] duration-200 hover:bg-[#f1f1ef] active:scale-[0.96] md:size-[46px]';

export default function Header() {
  // Trang mẫu mặc định tắt nhạc (is-muted). Chưa có file nhạc nên nút chỉ
  // đổi trạng thái hiển thị.
  const [muted, setMuted] = useState(true);

  return (
    <header
      className='pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between [mask-image:linear-gradient(to_bottom,#000_55%,transparent)] px-4 pt-6 pb-10 md:px-9'
      style={{
        background:
          'radial-gradient(58.68% 135.88% at 50% -35.88%, #FFFFFF 26.17%, rgba(255, 255, 255, 0) 100%)',
      }}
    >
      {/* Căn giữa theo chiều cao logo (57px desktop). */}
      <div className='flex h-[43px] items-center md:h-[57px]'>
        <button
          type='button'
          title='Music'
          aria-label={muted ? 'Turn music on' : 'Turn music off'}
          aria-pressed={!muted}
          onClick={() => setMuted(m => !m)}
          className={iconButton}
        >
          <Image
            src={muted ? '/00-ui/audio-off.svg' : '/00-ui/audio-on.svg'}
            alt=''
            width={30}
            height={30}
            className='size-6 md:size-[30px]'
          />
        </button>
      </div>

      <Link
        href='/'
        className='pointer-events-auto absolute top-6 left-1/2 -translate-x-1/2'
      >
        <Image
          src='/logo.svg'
          alt='Brunello Cucinelli'
          width={199}
          height={57}
          priority
          className='h-auto w-24 md:w-[199px]'
        />
      </Link>

      <div className='flex h-[43px] items-center md:h-[57px]'>
        <button
          type='button'
          title='History'
          aria-label='History'
          className={iconButton}
        >
          <Image
            src='/00-ui/history.svg'
            alt=''
            width={30}
            height={30}
            className='size-6 md:size-[30px]'
          />
        </button>
      </div>
    </header>
  );
}
