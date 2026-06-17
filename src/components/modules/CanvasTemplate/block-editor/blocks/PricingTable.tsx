'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PricingTableContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface PricingTableProps {
  content: PricingTableContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/** Pricing Table — bảng giá các gói (port SaaS templates feb/nov2024, jun2024). */
export function PricingTable({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: PricingTableProps) {
  const plans = content.plans ?? [];
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in @container w-full rounded-md bg-[#0e0f13] px-6 py-14 duration-500 ease-out @2xl:px-10',
        className
      )}
    >
      {content.title && (
        <h2
          data-element-key='title'
          style={styleOf('title')}
          className={selectableClass(
            activeKey === 'title',
            'mb-8 text-center text-3xl font-bold tracking-tight text-white @2xl:text-5xl'
          )}
        >
          {content.title}
        </h2>
      )}
      <div className='grid grid-cols-1 gap-5 @md:grid-cols-2 @4xl:grid-cols-3'>
        {plans.map((plan, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col rounded-2xl border p-6',
              plan.highlighted
                ? 'border-white/40 bg-white/10'
                : 'border-white/10 bg-white/[0.03]'
            )}
          >
            <span className='text-sm font-medium text-white/60'>
              {plan.name}
            </span>
            <div className='mt-2 flex items-baseline gap-1'>
              <span className='text-4xl font-bold text-white'>
                {plan.price}
              </span>
              {plan.period && (
                <span className='text-sm text-white/50'>/{plan.period}</span>
              )}
            </div>
            <ul className='mt-5 flex flex-col gap-2'>
              {plan.features?.map((f, fi) => (
                <li
                  key={fi}
                  className='flex items-start gap-2 text-sm text-white/75'
                >
                  <span className='mt-1 size-1.5 shrink-0 rounded-full bg-white/50' />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
