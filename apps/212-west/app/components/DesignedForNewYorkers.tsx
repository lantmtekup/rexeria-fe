'use client';

import Image from 'next/image';

const HEADING_LINES = ['Designed For', 'New Yorkers'];

const VERTICAL_LABEL = 'By New Yorkers';

const BODY_COPY =
  'CetraRuddy’s principals and lead designers understand the way New Yorkers live because this is their city too. They know space and light are among the most sought-after residential luxuries and thoughtfully conceived floor plans elevate';

const HEADING_TYPE =
  'font-display text-[34px] leading-[31px] font-medium uppercase text-[#763718] md:text-[46px] md:leading-[42px] lg:text-6xl lg:leading-[55px]';

const VERTICAL_TYPE =
  'font-display text-[40px] leading-[0.7] font-medium uppercase text-[#763718] md:text-[54px] lg:text-[70px]';

const BODY_TYPE =
  'font-display text-[21px] font-medium uppercase md:text-[28px] lg:text-[37px] xl:leading-[41px]';

export default function DesignedForNewYorkers() {
  return (
    <section
      id='designed-for-new-yorkers'
      data-panel
      className='relative z-40 flex min-h-svh w-full items-center overflow-hidden bg-white'
    >
      <div
        data-panel-content
        className='mx-auto w-full max-w-360 px-5 py-12.5 md:px-12 lg:px-30'
      >
        <h2 data-heading className={`lg:w-138.25 ${HEADING_TYPE}`}>
          {HEADING_LINES.map(line => (
            <span key={line} className='block'>
              {line}
            </span>
          ))}
        </h2>

        <div
          data-frame
          className='mt-6 flex flex-col gap-10 md:gap-15 xl:flex-row xl:items-start xl:gap-30'
        >
          <div className='flex w-full gap-1.5'>
            <div
              data-media
              className='relative aspect-553/571 min-w-0 flex-1 overflow-hidden bg-[#0F0F0E]/5 xl:w-138.25 xl:max-w-138.25 xl:flex-none'
            >
              <Image
                src='/assets/designed-for-new-yorkers.jpg'
                alt='Light-filled living room at 212 West 72nd'
                fill
                sizes='(min-width: 1024px) 553px, 100vw'
                className='object-cover'
              />
            </div>

            <div className='flex shrink-0 items-start'>
              <span
                data-vertical
                className={`block rotate-180 [writing-mode:vertical-rl] ${VERTICAL_TYPE}`}
              >
                {VERTICAL_LABEL}
              </span>
            </div>
          </div>

          <p
            data-copy
            className={`text-black lg:flex-none xl:w-109 ${BODY_TYPE}`}
          >
            {BODY_COPY}
          </p>
        </div>
      </div>
    </section>
  );
}
