import Image from 'next/image';

import { PAPER } from './story-data';

export default function Footer() {
  return (
    <footer
      aria-label='Site footer'
      className='w-full px-6 pt-[clamp(28px,3vw,40px)] pb-[clamp(40px,4vw,56px)]'
      style={{ backgroundColor: PAPER }}
    >
      <div className='mx-auto flex w-full flex-col items-center text-center'>
        <div className='flex w-full items-center gap-6'>
          <span aria-hidden className='h-px flex-1 bg-black/15' />
          <Image
            src='/product/crown.png'
            alt=''
            aria-hidden
            width={62}
            height={46}
            className='h-auto w-[clamp(46px,4.3vw,62px)] shrink-0'
          />
          <span aria-hidden className='h-px flex-1 bg-black/15' />
        </div>

        <h2 className='font-display mt-[clamp(40px,5vw,64px)] max-w-[900px] text-[clamp(24px,2.8vw,40px)] leading-[1.2] font-normal text-black'>
          The Oldest Fine Leather Goods House in the World.
        </h2>

        <a
          href='#products'
          className='font-montserrat mt-[clamp(28px,3.4vw,44px)] border border-black/40 px-12 py-3 text-[11px] leading-[10px] font-semibold tracking-[0.1em] text-black uppercase transition-colors hover:bg-black hover:text-white'
        >
          Shop now
        </a>

        <p className='font-montserrat mt-[clamp(32px,4vw,56px)] text-[13px] leading-[26px] font-medium text-black/70'>
          © ReXeR Studio. 2026. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
