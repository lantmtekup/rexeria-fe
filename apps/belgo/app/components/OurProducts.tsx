'use client';

import { useEffect, useRef } from 'react';
import {
  gsap,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '@/app/lib/motion';

type Product = {
  label: string;
  image: string;
  hoverImage: string;
  hoverTitle: string;
  cta: string;
  href: string;
};

const PRODUCTS: Product[] = [
  {
    label: 'BOTTLE 33CL',
    image: '/assets/section-4/c1.png',
    hoverImage: '/assets/section-4/c1-hover.png',
    hoverTitle: 'BELGO TO YOUR DOORSTEP',
    cta: 'ORDER BEER NOW',
    href: '#',
  },
  {
    label: 'GLASS 33CL',
    image: '/assets/section-4/c2.png',
    hoverImage: '/assets/section-4/c2-hover.png',
    hoverTitle: 'ENJOY DINING AT OUR RESTAURANT',
    cta: 'BOOK A TABLE',
    href: '#',
  },
];

function ProductCard({
  product,
  side,
}: {
  product: Product;
  side?: 'left' | 'right';
}) {
  const revealProps =
    side === 'left'
      ? { 'data-reveal-left': '' }
      : side === 'right'
        ? { 'data-reveal-right': '' }
        : {};

  return (
    <div {...revealProps} className='mx-auto w-full max-w-[410px]'>
      {/* Mobile — stacked, all info visible without hover */}
      <div className='flex flex-col gap-4 lg:hidden'>
        <div className='flex aspect-[3/4] flex-col items-center justify-center border border-white/12 bg-black px-6 pt-10 pb-8'>
          <div className='flex flex-1 items-center justify-center'>
            <img
              src={product.image}
              alt={product.label}
              className='max-h-[min(52vw,220px)] w-auto object-contain'
              decoding='async'
              loading='lazy'
            />
          </div>
          <p
            className='mt-5 shrink-0 text-lg tracking-[0.08em] text-[#e4ddcf]'
            style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
          >
            {product.label}
          </p>
        </div>

        <div className='flex flex-col bg-black p-3'>
          <div className='relative aspect-[4/3] overflow-hidden'>
            <img
              src={product.hoverImage}
              alt=''
              aria-hidden='true'
              className='h-full w-full object-cover object-center'
              decoding='async'
              loading='lazy'
            />
            <div className='pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black via-black/50 to-transparent' />
            <h3
              className='absolute inset-x-0 bottom-0 px-4 pb-4 text-2xl leading-[0.95] text-[#e4ddcf] sm:text-3xl'
              style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
            >
              {product.hoverTitle}
            </h3>
          </div>
          <a
            href={product.href}
            className='mt-3 block bg-[#e4ddcf] py-4 text-center text-sm tracking-widest text-[#1A1A1A] transition-colors duration-300 active:bg-white'
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            {product.cta}
          </a>
        </div>
      </div>

      {/* Desktop — hover flip, unchanged */}
      <div className='group relative hidden aspect-[3/4.5] overflow-hidden border border-white/12 lg:block'>
        <div className='absolute inset-0 flex flex-col items-center justify-center bg-black px-8 pt-16 pb-14 transition-opacity duration-500 ease-out group-hover:opacity-0'>
          <div className='flex flex-1 items-center justify-center'>
            <img
              src={product.image}
              alt={product.label}
              className='max-h-full w-auto object-contain'
              decoding='async'
              loading='lazy'
            />
          </div>
          <p
            className='mt-6 shrink-0 text-xl tracking-[0.08em] text-[#e4ddcf]'
            style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
          >
            {product.label}
          </p>
        </div>

        <div className='absolute inset-0 flex flex-col bg-black p-4 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100'>
          <div className='relative min-h-0 flex-1 overflow-hidden'>
            <img
              src={product.hoverImage}
              alt=''
              aria-hidden='true'
              className='h-full w-full object-cover object-center'
              decoding='async'
              loading='lazy'
            />
            <div className='pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black via-black/50 to-transparent' />
            <h3
              className='absolute inset-x-0 bottom-0 px-5 pb-5 text-3xl leading-[0.95] text-[#e4ddcf]'
              style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
            >
              {product.hoverTitle}
            </h3>
          </div>
          <a
            href={product.href}
            className='mt-4 block shrink-0 bg-[#e4ddcf] py-5 text-center text-sm tracking-widest text-[#1A1A1A] transition-colors duration-300 hover:bg-white'
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            {product.cta}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OurProducts() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(MOTION_CONDITIONS, ctx => {
      const { reduce, isMobile } = ctx.conditions as MotionConditions;
      const leftCol = root.querySelector<HTMLElement>('[data-reveal-left]');
      const centerCol = root.querySelector<HTMLElement>('[data-reveal-center]');
      const rightCol = root.querySelector<HTMLElement>('[data-reveal-right]');
      const centerParts = gsap.utils.toArray<HTMLElement>(
        '[data-reveal-center-part]',
        root
      );

      if (!leftCol || !centerCol || !rightCol) return;

      if (reduce) {
        gsap.set([leftCol, centerCol, rightCol, ...centerParts], {
          autoAlpha: 1,
          x: 0,
          y: 0,
        });
        return;
      }

      const tl = gsap.timeline({
        paused: true,
        scrollTrigger: {
          trigger: root,
          start: isMobile ? 'top 88%' : 'top 72%',
          end: isMobile ? 'bottom 12%' : 'bottom 28%',
          toggleActions: isMobile
            ? 'play none none none'
            : 'restart reverse restart reverse',
        },
      });

      if (isMobile) {
        tl.from(centerParts, {
          autoAlpha: 0,
          y: 24,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
        })
          .from(
            leftCol,
            {
              autoAlpha: 0,
              y: 32,
              duration: 0.7,
              ease: 'power3.out',
            },
            '-=0.25'
          )
          .from(
            rightCol,
            {
              autoAlpha: 0,
              y: 32,
              duration: 0.7,
              ease: 'power3.out',
            },
            '-=0.45'
          );
        return;
      }

      tl.from(leftCol, {
        x: -56,
        duration: 0.9,
        ease: 'power3.out',
      })
        .from(
          centerParts,
          {
            autoAlpha: 0,
            y: 28,
            duration: 0.65,
            stagger: 0.1,
            ease: 'power2.out',
          },
          0.12
        )
        .from(
          rightCol,
          {
            autoAlpha: 0,
            x: 56,
            y: 32,
            duration: 0.9,
            ease: 'power3.out',
          },
          0.2
        );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id='our-products'
      ref={rootRef}
      className='w-full bg-black py-14 lg:pt-0 lg:pb-10'
    >
      <div className='mx-auto grid w-full items-center gap-10 px-6 md:px-10 lg:grid-cols-[1.1fr_0.9fr_1.1fr] lg:gap-10 lg:px-16'>
        {/* Left card */}
        <ProductCard product={PRODUCTS[0]} side='left' />

        {/* Center copy — first on mobile */}
        <div
          data-reveal-center
          className='order-first mx-auto max-w-md text-center text-[#e4ddcf] lg:order-none'
        >
          <p
            data-reveal-center-part
            className='text-sm tracking-[0.12em]'
            style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
          >
            OUR PRODUCTS
          </p>
          <h2
            data-reveal-center-part
            className='mt-5 text-4xl leading-[0.95] sm:text-5xl lg:mt-8 lg:text-6xl'
            style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
          >
            ONE BOTTLE, ONE GLASS – A WORLD OF CRAFT BEER IN YOUR HANDS!
          </h2>
          <p
            data-reveal-center-part
            className='mx-auto mt-5 max-w-sm text-base leading-relaxed font-semibold text-[#e4ddcf]/85 lg:mt-8'
            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
          >
            Experience the rich flavors of Belgian craft beer. Order your
            favorite bottle or visit our restaurant for the perfect pairing of
            beer and cuisine!
          </p>
        </div>

        {/* Right card */}
        <ProductCard product={PRODUCTS[1]} side='right' />
      </div>
    </section>
  );
}
