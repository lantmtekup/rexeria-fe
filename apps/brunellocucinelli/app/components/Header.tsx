'use client';

import Image from 'next/image';
import Link from 'next/link';
import { toggleMuted, useMuted } from '../lib/audio';
import { closeStory, useStoryState } from '../lib/story';

/** Nút tròn trắng 46px như c-site-header của trang mẫu. */
export const iconButton =
  'pointer-events-auto grid size-10 place-items-center rounded-full bg-white transition-[background-color,transform] duration-200 hover:bg-[#f1f1ef] active:scale-[0.96] md:size-[46px]';

export default function Header() {
  const muted = useMuted();
  // Đang xem bài: thêm Back (trái) và Share (phải) như trang mẫu. Mobile
  // chỉ giữ Back + History để logo không bị đè.
  const { open: storyOpen, mode: storyMode } = useStoryState();

  return (
    <header
      className='pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between [mask-image:linear-gradient(to_bottom,#000_55%,transparent)] px-4 pt-6 pb-10 md:px-9'
      style={{
        background:
          'radial-gradient(58.68% 135.88% at 50% -35.88%, #FFFFFF 26.17%, rgba(255, 255, 255, 0) 100%)',
      }}
    >
      {/* Căn giữa theo chiều cao logo (57px desktop). */}
      <div className='flex h-[43px] items-center gap-2 md:h-[57px] md:gap-3'>
        {storyOpen && (
          <button
            type='button'
            title='Back'
            aria-label='Back to home'
            onClick={closeStory}
            className={iconButton}
          >
            <Image
              src='/00-ui/arrow.svg'
              alt=''
              width={30}
              height={30}
              className='size-6 md:size-[30px]'
            />
          </button>
        )}
        <button
          type='button'
          title='Music'
          aria-label={muted ? 'Turn music on' : 'Turn music off'}
          aria-pressed={!muted}
          onClick={toggleMuted}
          className={`${iconButton} ${storyOpen ? 'max-md:hidden' : ''}`}
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
        onClick={closeStory}
        className='pointer-events-auto absolute top-6 left-1/2 -translate-x-1/2'
      >
        <Image
          src='/logo.svg'
          alt='Brunello Cucinelli'
          width={199}
          height={57}
          priority
          className='h-auto w-[150px] md:w-[199px]'
        />
      </Link>

      <div className='flex h-[43px] items-center gap-2 md:h-[57px] md:gap-3'>
        {storyOpen && storyMode === 'article' && (
          <button
            type='button'
            title='Share'
            aria-label='Share'
            onClick={() =>
              navigator.share
                ? navigator
                    .share({ title: document.title, url: location.href })
                    .catch(() => {})
                : navigator.clipboard?.writeText(location.href)
            }
            className={`${iconButton} max-md:hidden`}
          >
            <Image
              src='/00-ui/share.svg'
              alt=''
              width={30}
              height={30}
              className='size-6 md:size-[30px]'
            />
          </button>
        )}
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
