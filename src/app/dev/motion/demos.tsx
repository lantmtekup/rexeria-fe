'use client';

/**
 * Live demo stages for /dev/motion.
 *
 * EFFECT_DEMOS = optional custom stages (richer QA). Missing id → auto fallback
 * from MotionEffect (tile / text / wrap) — thêm effect trong motionLibrary là
 * đủ hiện Stage; không bắt buộc sửa file này.
 */
import * as React from 'react';

import { type MotionEffect } from '@/components/modules/block-editor/motion/motionLibrary';
import { cn } from '@/lib/cn';

export const TILE =
  'flex h-32 w-full max-w-[14rem] items-center justify-center rounded-md border border-stone-300 bg-white text-sm font-medium text-stone-700 shadow-sm';

const MEDIA_GRID =
  'relative h-full w-full bg-stone-100 bg-[length:24px_24px] bg-[linear-gradient(to_right,rgb(120_113_108/0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgb(120_113_108/0.15)_1px,transparent_1px)]';

const MediaFrame = ({
  children,
  caption,
  meta,
  ring,
  className,
}: {
  children: React.ReactNode;
  caption: string;
  meta: string;
  ring?: string;
  className?: string;
}) => (
  <div className={cn('w-full max-w-lg', className)}>
    <div className='mb-2 flex items-baseline justify-between gap-3 font-mono text-[11px]'>
      <span className='text-teal-700'>{meta}</span>
      <span className='text-stone-500'>{caption}</span>
    </div>
    <div
      className={cn(
        'relative h-56 overflow-hidden rounded-md border border-stone-300 bg-white',
        ring
      )}
    >
      <div
        aria-hidden
        className='pointer-events-none absolute inset-3 z-10 rounded-sm border border-dashed border-stone-400/50'
      />
      {children}
    </div>
  </div>
);

const simpleTile = (id: string, extra?: string) => (
  <div data-motion={id} className={cn(TILE, extra)}>
    {id}
  </div>
);

const ECHO_LAYERS = [
  { offset: 0.27, opacity: 0.12 },
  { offset: 0.18, opacity: 0.3 },
  { offset: 0.09, opacity: 0.6 },
] as const;

const ECHO_LAYER_CLASS =
  'block w-full font-extrabold uppercase tracking-tight text-white';

/** Stage brutalist echo — dùng trigger load để lab/replay luôn chạy. */
export const EchoRevealStage = ({
  label = 'BRUTALISM',
  trigger = 'load',
}: {
  label?: string;
  trigger?: 'load' | 'in-view';
}) => (
  <div className='w-full max-w-2xl rounded-md bg-black px-6 py-14'>
    <div
      data-motion='echo-reveal'
      data-motion-distance='28'
      data-motion-stagger='0.07'
      {...(trigger === 'load' ? { 'data-motion-trigger': 'load' } : {})}
      className='relative inline-block w-full text-center'
      style={{ paddingBottom: '0.27em' }}
    >
      {[...ECHO_LAYERS].reverse().map(layer => (
        <span
          key={layer.offset}
          aria-hidden
          data-echo-layer
          data-echo-offset={layer.offset}
          data-echo-opacity={layer.opacity}
          className={cn(ECHO_LAYER_CLASS, 'absolute top-0 right-0 left-0')}
          style={{
            fontSize: 'clamp(2rem, 10vw, 4rem)',
            lineHeight: 0.88,
            transform: `translateY(${layer.offset}em)`,
            opacity: layer.opacity,
          }}
        >
          {label}
        </span>
      ))}
      <h2
        data-echo-layer
        data-echo-offset={0}
        data-echo-opacity={1}
        className={cn(ECHO_LAYER_CLASS, 'relative m-0')}
        style={{
          fontSize: 'clamp(2rem, 10vw, 4rem)',
          lineHeight: 0.88,
        }}
      >
        {label}
      </h2>
    </div>
  </div>
);

export const EFFECT_DEMOS: Record<string, () => React.ReactNode> = {
  'fade-in': () => simpleTile('fade-in'),
  'fade-up': () => simpleTile('fade-up'),
  'fade-down': () => simpleTile('fade-down'),
  'slide-left': () => simpleTile('slide-left'),
  'slide-right': () => simpleTile('slide-right'),
  'scale-in': () => simpleTile('scale-in'),
  'zoom-in': () => simpleTile('zoom-in'),
  'blur-in': () => simpleTile('blur-in'),
  'scale-pop': () => simpleTile('scale-pop'),
  'rotate-in': () => simpleTile('rotate-in'),
  'flip-in': () => simpleTile('flip-in'),

  'char-reveal': () => (
    <h2
      data-motion='char-reveal'
      className='overflow-hidden text-4xl font-light tracking-tight text-stone-800 md:text-5xl'
    >
      From Brush to Strike
    </h2>
  ),
  'word-reveal': () => (
    <p
      data-motion='word-reveal'
      className='max-w-lg text-2xl font-light text-stone-700'
    >
      Every word arrives on its own beat
    </p>
  ),
  'line-reveal': () => (
    <p
      data-motion='line-reveal'
      className='max-w-md text-lg leading-relaxed font-light text-stone-600'
    >
      Lines rise one after another, masked cleanly, so long copy enters with
      rhythm instead of noise.
    </p>
  ),
  counter: () => (
    <div
      data-motion='counter'
      className='font-mono text-5xl font-light tracking-tight text-teal-700'
    >
      1,250+ collectors
    </div>
  ),

  'echo-reveal': () => <EchoRevealStage />,

  'clip-reveal': () => (
    <div className='flex flex-wrap items-center justify-center gap-4'>
      {(['down', 'up', 'left', 'right'] as const).map(dir => (
        <div
          key={dir}
          data-motion='clip-reveal'
          data-motion-direction={dir}
          className={cn(TILE, 'bg-teal-50')}
        >
          {dir}
        </div>
      ))}
    </div>
  ),

  'media-zoom': () => (
    <MediaFrame caption='media-zoom' meta='scale 1.18 → 1'>
      <div data-motion='media-zoom' className={MEDIA_GRID}>
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='rounded-sm border border-stone-300 bg-white/90 px-3 py-1.5 font-mono text-xs text-stone-700'>
            grid shows scale
          </span>
        </div>
      </div>
    </MediaFrame>
  ),

  parallax: () => (
    <div data-motion='parallax' data-motion-distance='40' className={TILE}>
      parallax
    </div>
  ),

  'line-draw': () => (
    <div className='flex w-full max-w-md flex-col items-center gap-10'>
      <div className='flex h-64 items-start'>
        <div
          data-motion='line-draw'
          data-motion-scrub='0.8'
          className='h-full w-0.5 bg-teal-600'
        />
      </div>
      <div
        data-motion='line-draw'
        data-motion-axis='x'
        data-motion-trigger='in-view'
        data-motion-duration='1.2'
        className='h-0.5 w-64 bg-teal-600'
      />
      <p className='font-mono text-[11px] text-stone-500'>
        top: scrub Y · bottom: axis=x in-view
      </p>
    </div>
  ),

  'hover-scale': () => (
    <div data-motion='hover-scale' className={cn(TILE, 'cursor-pointer')}>
      hover me
    </div>
  ),
  'hover-lift': () => (
    <div data-motion='hover-lift' className={cn(TILE, 'cursor-pointer')}>
      hover me
    </div>
  ),
  'hover-tilt': () => (
    <div data-motion='hover-tilt' className={cn(TILE, 'cursor-pointer')}>
      hover me
    </div>
  ),
  'hover-zoom': () => (
    <MediaFrame
      caption='hover-zoom'
      meta='listener: closest:.fx-card'
      ring='fx-card cursor-pointer border-teal-400/60 hover:border-teal-600'
    >
      <div
        data-motion='hover-zoom'
        data-motion-trigger-target='closest:.fx-card'
        className={MEDIA_GRID}
      >
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-2'>
          <span className='rounded-sm border border-stone-300 bg-white/90 px-3 py-1.5 font-mono text-xs text-stone-700'>
            hover card to zoom
          </span>
          <span className='font-mono text-[10px] text-stone-500'>
            scale 1 → 1.08
          </span>
        </div>
      </div>
    </MediaFrame>
  ),

  'marquee-loop': () => (
    <div className='w-full overflow-hidden'>
      <div
        data-motion='marquee-loop'
        data-motion-duration='8'
        className='flex w-max gap-12 font-mono text-2xl font-light tracking-wide whitespace-nowrap text-stone-500 md:text-3xl'
      >
        <span>ROYAL CANADIAN MINT · LIMITED STRIKE ·&nbsp;</span>
        <span>ROYAL CANADIAN MINT · LIMITED STRIKE ·&nbsp;</span>
      </div>
    </div>
  ),
};

export const PATTERN_DEMOS = {
  group: () => (
    <div
      data-motion-group=''
      data-motion-start='top 75%'
      data-motion-stagger-children='0.18'
      className='grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4'
    >
      {(['fade-up', 'rotate-in', 'flip-in', 'scale-pop'] as const).map(id => (
        <div key={id} data-motion={id} className={cn(TILE, 'max-w-none')}>
          {id}
        </div>
      ))}
    </div>
  ),
  click: () => (
    <div className='flex w-full flex-col gap-5'>
      <p className='max-w-xl text-sm leading-relaxed text-stone-600'>
        Bốn effect khác nhau, cùng trigger click — toggle play/reverse.
      </p>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {(['fade-in', 'fade-up', 'scale-pop', 'rotate-in'] as const).map(
          effect => (
            <button
              key={effect}
              type='button'
              data-motion={effect}
              data-motion-trigger='click'
              data-motion-duration='0.45'
              className={cn(
                TILE,
                'max-w-none cursor-pointer flex-col gap-1 transition-colors hover:border-teal-400 hover:bg-teal-50 active:scale-[0.98]'
              )}
              aria-label={`Toggle ${effect} on click`}
            >
              <span className='font-mono text-xs text-stone-800'>{effect}</span>
              <span className='font-mono text-[10px] text-stone-500'>
                click toggle
              </span>
            </button>
          )
        )}
      </div>
    </div>
  ),
};

/** Stage hints for scrub / hover when meta alone is not enough. */
export const DEMO_HOWTO: Record<string, string> = {
  parallax: 'Scroll trong khung stage (scrub). Replay tắt.',
  'line-draw': 'Thanh dọc: scroll scrub. Thanh ngang: Replay để xem in-view.',
  'hover-scale': 'Hover lên tile.',
  'hover-lift': 'Hover — tile nhấc lên.',
  'hover-tilt': 'Hover — nghiêng 3D.',
  'hover-zoom': 'Hover cả khung card (không chỉ label giữa).',
  'media-zoom': 'Replay để xem Ken Burns settle.',
  'marquee-loop': 'Chạy liên tục. Replay khởi động lại loop.',
  'clip-reveal': 'Bốn hướng direction trên cùng stage.',
  'echo-reveal':
    'Brutalist echo stack — trigger load trong lab; bấm Replay để xem lại.',
};

/** Auto stage khi chưa có custom trong EFFECT_DEMOS. */
export const defaultDemoForEffect = (effect: MotionEffect): React.ReactNode => {
  const id = effect.id;
  const hover = effect.defaults.trigger === 'hover';

  if (effect.special === 'counter') {
    return (
      <div
        data-motion={id}
        className='font-mono text-5xl font-light tracking-tight text-teal-700'
      >
        1,250+
      </div>
    );
  }

  if (effect.special === 'echo-reveal') {
    return <EchoRevealStage />;
  }

  if (effect.split) {
    const Tag =
      effect.split === 'lines' ? 'p' : effect.split === 'words' ? 'p' : 'h2';
    const className =
      effect.split === 'chars'
        ? 'overflow-hidden text-4xl font-light tracking-tight text-stone-800'
        : 'max-w-lg text-2xl font-light text-stone-700';
    return (
      <Tag data-motion={id} className={className}>
        {effect.split === 'lines'
          ? 'First line of copy.\nSecond line follows.'
          : 'Sample heading text'}
      </Tag>
    );
  }

  if (id === 'marquee-loop' || effect.defaults.trigger === 'loop') {
    return (
      <div className='w-full overflow-hidden'>
        <div
          data-motion={id}
          data-motion-duration='8'
          className='flex w-max gap-12 font-mono text-2xl font-light whitespace-nowrap text-stone-500'
        >
          <span>SAMPLE LOOP · SAMPLE LOOP ·&nbsp;</span>
          <span>SAMPLE LOOP · SAMPLE LOOP ·&nbsp;</span>
        </div>
      </div>
    );
  }

  if (
    effect.appliesTo.includes('image') &&
    (id.includes('zoom') || id.includes('media'))
  ) {
    return (
      <div className='h-56 w-full max-w-lg overflow-hidden rounded-md border border-stone-300'>
        <div
          data-motion={id}
          className={cn(
            MEDIA_GRID,
            hover && 'cursor-pointer',
            hover && 'fx-card'
          )}
          {...(hover
            ? { 'data-motion-trigger-target': 'closest:.fx-card' }
            : {})}
        />
      </div>
    );
  }

  return (
    <div data-motion={id} className={cn(TILE, hover && 'cursor-pointer')}>
      {id}
    </div>
  );
};

/** Custom override nếu có, không thì auto từ library. */
export const getEffectDemo = (
  effect: MotionEffect
): (() => React.ReactNode) => {
  const custom = EFFECT_DEMOS[effect.id];
  if (custom) return custom;
  return () => defaultDemoForEffect(effect);
};
