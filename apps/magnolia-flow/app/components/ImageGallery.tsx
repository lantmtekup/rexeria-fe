'use client';

import Image from 'next/image';

export default function ImageGallery() {
  return (
    <section className='flex w-full flex-row items-center justify-center border-t border-b border-[#6e6d6d] bg-[#f5f5f5] px-5 py-15 lg:py-25 xl:border-none'>
      <div className='mx-auto flex w-full max-w-[1720px] flex-col items-center gap-5 lg:gap-10 xl:flex-row'>
        <div className='relative flex h-95.75 w-full overflow-hidden rounded-2xl md:h-208 xl:h-165'>
          <Image
            src='/assets/gallery-1.webp'
            alt='A family on the stair at The Magnolia'
            fill
            className='object-cover'
          />
        </div>
        <div className='relative flex h-95.75 w-full overflow-hidden rounded-2xl md:h-208 xl:h-165'>
          <Image
            src='/assets/gallery-2.webp'
            alt='Three-bedroom living room at The Magnolia'
            fill
            className='object-cover'
          />
        </div>
      </div>
    </section>
  );
}
