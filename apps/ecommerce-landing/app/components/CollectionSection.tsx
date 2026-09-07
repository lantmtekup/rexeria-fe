'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { useIsomorphicLayoutEffect } from '../../lib/use-isomorphic-layout-effect';
import {
  IconArrowRight,
  IconCheck,
  IconHeart,
  IconHeartOutline,
} from './StoryIcons';
import { GOLD, PRODUCT_COLORS } from './story-data';

gsap.registerPlugin(ScrollTrigger);

const CARD_W = 330;
const CARD_IMG_H = 373;

const REVEAL_Y = 32;
const REVEAL_DUR = 0.7;
const REVEAL_STAGGER = 0.12;
const REVEAL_START = 'top 88%';

const WISH_RED = '#DC2626';

const COLOR_IMAGES = [
  '/product/grigio.png',
  '/product/vegetal.png',
  '/product/violet.png',
  '/product/black.png',
  '/product/vegetal.png',
] as const;

type CollectionItem = {
  id: string;
  material: string;
  name: string;
  price: string;
  colors: readonly number[];
};

const COLLECTION_ITEMS: readonly CollectionItem[] = [
  {
    id: 'lilac',
    material: 'Sellier Calf',
    name: 'Cool Move',
    price: '3.900 €',
    colors: [2, 0, 3, 4],
  },
  {
    id: 'rain',
    material: 'Sellier Calf',
    name: 'Cool Move',
    price: '3.900 €',
    colors: [0, 1, 3, 4],
  },
  {
    id: 'cacao',
    material: 'Sellier Calf',
    name: 'Cool Move',
    price: '3.900 €',
    colors: [4, 3, 0, 2],
  },
  {
    id: 'noir',
    material: 'Sellier Calf',
    name: 'Cool Move',
    price: '3.900 €',
    colors: [3, 1, 2, 4],
  },
];

function Swatches({
  colors,
  active,
  onSelect,
  name,
}: {
  colors: readonly number[];
  active: number;
  onSelect: (index: number) => void;
  name: string;
}) {
  return (
    <div className='flex shrink-0 items-center gap-[11px]'>
      {colors.map(colorIndex => {
        const swatch = PRODUCT_COLORS[colorIndex];
        const isActive = colorIndex === active;
        return (
          <button
            key={swatch.name}
            type='button'
            onClick={() => onSelect(colorIndex)}
            aria-label={`${name} — ${swatch.name}`}
            aria-pressed={isActive}
            className='relative flex h-5 w-5 items-center justify-center rounded-full'
            style={{ boxShadow: isActive ? 'inset 0 0 0 1px #000' : 'none' }}
          >
            <span
              className='flex h-[14px] w-[14px] items-center justify-center rounded-full'
              style={{
                backgroundImage: `linear-gradient(180deg, ${swatch.from} 0%, ${swatch.to} 100%)`,
              }}
            >
              {isActive ? (
                <IconCheck className='h-[5px] w-[6px] text-white' />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CollectionCard({ item }: { item: CollectionItem }) {
  const [color, setColor] = useState(item.colors[0]);
  const [wished, setWished] = useState(false);

  return (
    <li className='flex flex-col border border-black/20 bg-white'>
      <div
        className='relative w-full'
        style={{ aspectRatio: `${CARD_W} / ${CARD_IMG_H}` }}
      >
        {item.colors.map(colorIndex => {
          const isActive = colorIndex === color;
          return (
            <Image
              key={colorIndex}
              src={COLOR_IMAGES[colorIndex]}
              alt={
                isActive
                  ? `${item.name} — ${PRODUCT_COLORS[colorIndex].name}`
                  : ''
              }
              aria-hidden={!isActive}
              fill
              sizes='(min-width: 1024px) 330px, (min-width: 640px) 50vw, 100vw'
              className={`object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            />
          );
        })}
        <button
          type='button'
          onClick={() => setWished(w => !w)}
          aria-label={wished ? 'Bỏ khỏi wishlist' : 'Thêm vào wishlist'}
          aria-pressed={wished}
          className='absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white transition-colors'
          style={{ color: wished ? WISH_RED : '#000' }}
        >
          {wished ? (
            <IconHeart className='h-[14px] w-4' />
          ) : (
            <IconHeartOutline className='h-[14px] w-4' />
          )}
        </button>
      </div>

      <div className='flex flex-col gap-6 p-6'>
        <div className='flex flex-col gap-2'>
          <span
            className='font-montserrat text-[11px] leading-[10px] font-medium'
            style={{ color: GOLD }}
          >
            {item.material}
          </span>

          <div className='flex items-center justify-between gap-3'>
            <h3 className='font-display text-[24px] leading-[32px] font-normal text-black'>
              {item.name}
            </h3>
            <Swatches
              colors={item.colors}
              active={color}
              onSelect={setColor}
              name={item.name}
            />
          </div>

          <span className='font-montserrat text-[16px] leading-[26px] font-medium text-black'>
            {item.price}
          </span>
        </div>

        <button
          type='button'
          className='font-montserrat flex h-[46px] w-full items-center justify-center border border-[color:var(--gold)] text-[12px] leading-[10px] font-semibold text-[color:var(--gold)] uppercase transition-colors hover:bg-[var(--gold)] hover:text-white'
          style={{ '--gold': GOLD } as React.CSSProperties}
        >
          Add to cart
        </button>
      </div>
    </li>
  );
}

export default function CollectionSection() {
  const listRef = useRef<HTMLUListElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const cards = gsap.utils.toArray<HTMLLIElement>(list.children);
    if (cards.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        animate: '(prefers-reduced-motion: no-preference)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      context => {
        const { reduce } = context.conditions as { reduce: boolean };
        if (reduce) return;

        gsap.set(cards, { autoAlpha: 0, y: REVEAL_Y });

        const triggers = ScrollTrigger.batch(cards, {
          start: REVEAL_START,
          once: true,
          onEnter: targets =>
            gsap.to(targets, {
              autoAlpha: 1,
              y: 0,
              duration: REVEAL_DUR,
              ease: 'power2.out',
              stagger: REVEAL_STAGGER,
            }),
        });

        return () => triggers.forEach(trigger => trigger.kill());
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id='collection'
      aria-label='The Collection'
      className='w-full scroll-mt-[72px] bg-white py-[clamp(48px,5vw,64px)]'
    >
      <div className='mx-auto w-full px-6'>
        <div className='relative flex flex-col items-center text-center'>
          <Image
            data-crown-slot='collection'
            src='/product/crown.png'
            alt=''
            aria-hidden
            width={73}
            height={56}
            className='h-auto w-[73px]'
          />

          <h2 className='font-display mt-1 text-[clamp(28px,2.8vw,40px)] leading-[1.2] font-normal text-black'>
            The Collection
          </h2>

          <p className='font-montserrat mt-3 text-[clamp(14px,1.15vw,16px)] leading-[26px] font-medium text-black'>
            Enjoy complimentary shipping on all online orders.
          </p>

          <a
            href='#products'
            className='font-montserrat mt-6 flex items-center gap-[13px] text-[12px] leading-[10px] font-semibold text-black uppercase transition-opacity hover:opacity-60 lg:absolute lg:right-0 lg:bottom-0 lg:mt-0'
          >
            All products
            <IconArrowRight className='h-[6px] w-3 shrink-0' />
          </a>
        </div>

        <ul
          ref={listRef}
          className='mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'
        >
          {COLLECTION_ITEMS.map(item => (
            <CollectionCard key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
}
