import * as React from 'react';
import {
  Building2,
  Compass,
  Home,
  Leaf,
  ShieldCheck,
  Sparkles,
  TreePine,
  Waves,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FeatureSectionContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FeatureSectionProps {
  content: FeatureSectionContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Building2,
  Compass,
  Leaf,
  TreePine,
  Waves,
  ShieldCheck,
  Sparkles,
};

export function FeatureSection({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FeatureSectionProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sTitle = styleOf('title');
  const sDescription = styleOf('description');
  const sFeatures = styleOf('features');

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 relative w-full overflow-hidden rounded-md bg-white px-6 py-10 duration-700 ease-out @2xl:px-12 @2xl:py-16 @4xl:px-20 @4xl:py-20',
        className
      )}
    >
      <div className='flex flex-col gap-3 @2xl:max-w-[60ch]'>
        {content.eyebrow && (
          <span
            data-element-key='eyebrow'
            style={sEyebrow}
            className={selectableClass(
              activeKey === 'eyebrow',
              'animate-reveal-x inline-flex w-fit items-center gap-2 text-[10px] font-semibold tracking-[0.32em] text-neutral-400 uppercase [animation-delay:900ms] [animation-duration:700ms] @2xl:text-xs'
            )}
          >
            <span className='size-1 shrink-0 rounded-full bg-neutral-400' />
            {content.eyebrow}
          </span>
        )}
        <h2
          data-element-key='title'
          style={sTitle}
          className={selectableClass(
            activeKey === 'title',
            'animate-reveal-x text-2xl leading-[1.15] font-semibold text-neutral-900 [animation-delay:1100ms] [animation-duration:1200ms] @2xl:text-4xl @4xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
        {content.description && (
          <p
            data-element-key='description'
            style={sDescription}
            className={selectableClass(
              activeKey === 'description',
              'animate-soft-rise text-sm text-neutral-500 [animation-delay:1700ms] @2xl:text-base @2xl:leading-7'
            )}
          >
            {content.description}
          </p>
        )}
      </div>

      {content.features.length > 0 && (
        <div
          data-element-key='features'
          style={sFeatures}
          className={selectableClass(
            activeKey === 'features',
            'mt-8 grid grid-cols-1 gap-3 @2xl:mt-12 @2xl:grid-cols-2 @2xl:gap-4 @4xl:grid-cols-4'
          )}
        >
          {content.features.map((f, i) => {
            const Icon = ICON_MAP[f.icon] ?? Sparkles;
            return (
              <div
                key={i}
                style={{ animationDelay: `${2200 + i * 100}ms` }}
                className='animate-in fade-in slide-in-from-bottom-2 group/card fill-mode-both flex flex-col gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition-all duration-500 ease-out hover:-translate-y-1 hover:border-neutral-300 hover:bg-white hover:shadow-lg @2xl:gap-3 @2xl:p-6'
              >
                <div className='flex size-9 items-center justify-center rounded-md bg-neutral-900 text-white transition-transform duration-300 ease-out group-hover/card:scale-110 @2xl:size-10'>
                  <Icon className='size-4 @2xl:size-5' />
                </div>
                <h3 className='text-base font-semibold text-neutral-900 @2xl:text-base @4xl:text-lg'>
                  {f.label}
                </h3>
                {f.body && (
                  <p className='text-sm text-neutral-500 @2xl:text-sm @2xl:leading-6'>
                    {f.body}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const FEATURE_ICON_OPTIONS = Object.keys(ICON_MAP);
