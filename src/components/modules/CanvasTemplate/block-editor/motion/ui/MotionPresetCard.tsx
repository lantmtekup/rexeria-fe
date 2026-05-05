'use client';

import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/cn';

import type { MotionPreset } from '../types';

interface MotionPresetCardProps {
  preset: MotionPreset;
  active: boolean;
  onSelect: () => void;
  lang?: 'vi' | 'en';
}

/**
 * Compact card showing a preset's name + thumb. Selected state uses an
 * indigo ring + check icon. Hover plays the GIF (if `previewGif` is set);
 * otherwise the static `thumbHint` glyph carries the visual identity.
 */
export function MotionPresetCard({
  preset,
  active,
  onSelect,
  lang = 'vi',
}: MotionPresetCardProps) {
  const name = preset.name[lang];
  const desc = preset.description[lang];
  return (
    <button
      type='button'
      onClick={onSelect}
      title={desc}
      data-testid={`motion-preset-${preset.id}`}
      data-active={active ? 'true' : 'false'}
      className={cn(
        'group relative flex w-[120px] shrink-0 cursor-pointer flex-col gap-1.5 rounded-md p-1.5 text-left transition-colors',
        'hover:bg-neutral-50',
        active && 'bg-indigo-50/60'
      )}
    >
      <div
        className={cn(
          'relative flex h-[68px] items-center justify-center overflow-hidden rounded-md bg-neutral-100 ring-1 ring-neutral-200',
          active && 'ring-2 ring-indigo-500'
        )}
      >
        {preset.previewGif ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preset.previewGif}
            alt={name}
            className='size-full object-cover'
            loading='lazy'
          />
        ) : (
          <span className='text-3xl' aria-hidden>
            {preset.thumbHint ?? '✦'}
          </span>
        )}
        {active && (
          <span className='absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-indigo-500 text-white'>
            <Check className='size-3' strokeWidth={3} />
          </span>
        )}
      </div>
      <div className='min-w-0'>
        <span className='block truncate text-[11px] font-semibold text-neutral-900'>
          {name}
        </span>
        <span className='block truncate font-mono text-[9px] tracking-tight text-neutral-400'>
          {preset.id}
        </span>
      </div>
    </button>
  );
}
