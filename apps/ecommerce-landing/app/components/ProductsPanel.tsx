'use client';

import Image from 'next/image';
import { useState } from 'react';

import {
  IconBag,
  IconCalendar,
  IconCheck,
  IconChevron,
  IconHeart,
  IconPhone,
  IconPin,
  IconRuler,
} from './StoryIcons';
import {
  ActionIcon,
  GOLD,
  PRODUCT_ACTIONS,
  PRODUCT_COLORS,
  PRODUCT_IMAGES,
  PRODUCT_NAME,
  PRODUCT_SPECS,
  SpecIcon,
} from './story-data';

const ICONS: Record<
  SpecIcon | ActionIcon,
  React.ComponentType<{ className?: string }>
> = {
  ruler: IconRuler,
  bag: IconBag,
  phone: IconPhone,
  calendar: IconCalendar,
  pin: IconPin,
};

function IconBox({ name }: { name: SpecIcon | ActionIcon }) {
  const Icon = ICONS[name];
  return (
    <span className='flex h-8 w-8 shrink-0 items-center justify-center bg-black/5 text-black'>
      <Icon className='h-4 w-4' />
    </span>
  );
}

export default function ProductsPanel() {
  const [image, setImage] = useState(0);
  const [color, setColor] = useState(0);

  return (
    <div className='relative flex w-full flex-col bg-[#F5F5F5] lg:h-full lg:flex-row lg:items-start lg:overflow-hidden lg:px-[var(--story-gutter)]'>
      <div className='no-scrollbar order-2 flex gap-2 overflow-x-auto px-6 py-4 lg:order-none lg:mt-[calc((100svh-72px)*0.143)] lg:w-[clamp(48px,5.6%,88px)] lg:shrink-0 lg:flex-col lg:overflow-visible lg:p-0'>
        {PRODUCT_IMAGES.map((src, i) => (
          <button
            key={src}
            type='button'
            onClick={() => setImage(i)}
            aria-label={`Ảnh ${i + 1}`}
            aria-pressed={i === image}
            className='relative aspect-square w-12 shrink-0 border bg-white transition-colors lg:w-full'
            style={{ borderColor: i === image ? GOLD : 'rgba(0,0,0,.2)' }}
          >
            <Image
              src={src}
              alt=''
              aria-hidden
              fill
              sizes='68px'
              className='object-cover'
            />
          </button>
        ))}
      </div>

      <div className='relative order-1 w-full lg:order-none lg:h-full lg:min-w-0 lg:flex-1'>
        <div className='relative aspect-[1086/840] w-full lg:absolute lg:inset-0 lg:aspect-auto'>
          <Image
            key={PRODUCT_IMAGES[image]}
            src={PRODUCT_IMAGES[image]}
            alt={`${PRODUCT_NAME} — ${PRODUCT_COLORS[color].name}`}
            fill
            sizes='(min-width: 1024px) 45vw, 100vw'
            className='object-contain'
          />
        </div>

        <div className='absolute bottom-[3.7%] left-1/2 hidden -translate-x-1/2 items-center gap-3 lg:flex'>
          {PRODUCT_IMAGES.map((src, i) => (
            <span
              key={src}
              className='h-px bg-black transition-[width] duration-500'
              style={{ width: i === image ? 120 : 24 }}
            />
          ))}
        </div>
      </div>

      <div className='order-3 mx-auto mb-6 w-[min(330px,calc(100%-3rem))] lg:order-none lg:mx-0 lg:mt-[calc((100svh-72px)*0.143)] lg:mb-0 lg:w-[330px] lg:max-w-[34%] lg:shrink-0'>
        <div className='bg-white px-6 py-6'>
          <h3 className='font-display text-[24px] leading-[32px] font-normal text-black'>
            {PRODUCT_NAME}
          </h3>

          <hr className='mt-5 border-t border-black' />

          <div className='mt-10 flex items-center justify-between'>
            <span className='font-montserrat text-[12px] leading-[10px] font-semibold text-black'>
              {PRODUCT_COLORS[color].name}
            </span>
            <div className='flex items-center gap-[11px]'>
              {PRODUCT_COLORS.map((swatch, i) => (
                <button
                  key={swatch.name}
                  type='button'
                  onClick={() => setColor(i)}
                  aria-label={swatch.name}
                  aria-pressed={i === color}
                  className='relative flex h-5 w-5 items-center justify-center rounded-full'
                  style={{
                    boxShadow: i === color ? 'inset 0 0 0 1px #000' : 'none',
                  }}
                >
                  <span
                    className='flex h-[14px] w-[14px] items-center justify-center rounded-full'
                    style={{
                      backgroundImage: `linear-gradient(180deg, ${swatch.from} 0%, ${swatch.to} 100%)`,
                    }}
                  >
                    {i === color ? (
                      <IconCheck className='h-[5px] w-[6px] text-white' />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <hr className='mt-4 border-t border-black' />

          <div className='mt-5 flex flex-col gap-2'>
            {PRODUCT_SPECS.map(spec => (
              <div key={spec.label} className='flex flex-col gap-3'>
                <div className='flex items-start gap-3'>
                  <IconBox name={spec.icon} />
                  <span className='flex flex-col gap-3'>
                    <span className='font-montserrat text-[10px] leading-[10px] font-semibold text-black uppercase'>
                      {spec.label}
                    </span>
                    <span className='font-montserrat text-[12px] leading-[10px] font-semibold text-black'>
                      {spec.value}
                    </span>
                  </span>
                </div>
                <hr className='border-t border-black' />
              </div>
            ))}
          </div>

          <div className='mt-5 flex flex-col gap-1'>
            {PRODUCT_ACTIONS.map(action => (
              <button
                key={action.title}
                type='button'
                className='flex h-10 items-center gap-2 border border-black p-1 pr-3 transition-colors hover:bg-black/[.03]'
              >
                <IconBox name={action.icon} />
                <span className='flex flex-1 flex-col items-start gap-1 text-left'>
                  <span className='font-montserrat text-[10px] leading-[10px] font-semibold text-black uppercase'>
                    {action.title}
                  </span>
                  <span className='font-montserrat text-[8px] leading-[10px] font-medium text-black'>
                    {action.sub}
                  </span>
                </span>
                <IconChevron className='h-2 w-1 shrink-0 text-black' />
              </button>
            ))}
          </div>
        </div>

        <div
          className='flex h-[50px] items-center pr-5 pl-8'
          style={{ backgroundColor: GOLD }}
        >
          <button
            type='button'
            className='flex items-center gap-[70px] text-white'
          >
            <IconBag className='h-5 w-5 shrink-0' />
            <span className='font-montserrat text-[12px] leading-[10px] font-semibold whitespace-nowrap uppercase'>
              Add to cart
            </span>
          </button>
          <span className='ml-auto h-[10px] w-px bg-white/60' aria-hidden />
          <button
            type='button'
            aria-label='Thêm vào wishlist'
            className='ml-[17px] text-white'
          >
            <IconHeart className='h-[14px] w-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
