'use client';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/cn';
import { UQ } from '@/lib/motion';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** GSAP scrub parallax: yPercent from -100·depth to +100·depth across the parent's viewport transit. */
export function useParallaxLayer<T extends HTMLElement>(depth: number) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -(100 * depth) },
        {
          yPercent: 100 * depth,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, el);
    return () => ctx.revert();
  }, [depth]);
  return ref;
}

export type PanelBackgroundProps = {
  src?: string;
  alt?: string;
  tone?: string;
  depth?: number;
  priority?: boolean;
  scrim?: boolean;
  className?: string;
  layerClassName?: string;
  imageClassName?: string;
  overlayClassName?: string;
};

export function PanelBackground({
  src,
  alt = '',
  tone = 'from-clay-500 via-clay-600 to-charcoal-900',
  depth = UQ.base,
  priority = false,
  scrim = true,
  className,
  layerClassName,
  imageClassName,
  overlayClassName,
}: PanelBackgroundProps) {
  const parallaxRef = useParallaxLayer<HTMLDivElement>(depth);
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <div
        ref={parallaxRef}
        className={cn(
          'absolute inset-0 scale-[1.15] will-change-transform',
          layerClassName
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes='100vw'
            quality={92}
            className={cn('object-cover', imageClassName)}
          />
        ) : (
          <div className={cn('h-full w-full bg-gradient-to-br', tone)}>
            <div
              className='absolute inset-0 opacity-[0.14] mix-blend-overlay'
              style={{ backgroundImage: NOISE }}
            />
          </div>
        )}
      </div>
      {scrim && (
        <div
          aria-hidden
          className={cn('bg-panel-scrim absolute inset-0', overlayClassName)}
        />
      )}
    </div>
  );
}
