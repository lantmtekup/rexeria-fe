'use client';

import * as React from 'react';
import { Trash2 } from 'lucide-react';

import type { MotionEasing, MotionKeyframe, MotionProperty } from '../types';

import {
  EASING_OPTIONS,
  PROPERTIES,
  PROPERTY_DEFAULT,
  PROPERTY_LABEL,
} from './utils';

interface KeyframeInspectorProps {
  kf: MotionKeyframe;
  maxTime: number;
  onChange: (patch: Partial<MotionKeyframe>) => void;
  onDelete: () => void;
}

export function KeyframeInspector({
  kf,
  maxTime,
  onChange,
  onDelete,
}: KeyframeInspectorProps) {
  const easingValue = typeof kf.easing === 'string' ? kf.easing : 'power2.out';

  const toggleProperty = (prop: MotionProperty, on: boolean) => {
    const next = { ...kf.values };
    if (on) {
      next[prop] = next[prop] ?? PROPERTY_DEFAULT[prop];
    } else {
      delete next[prop];
    }
    onChange({ values: next });
  };

  const setPropertyValue = (prop: MotionProperty, value: number) => {
    onChange({ values: { ...kf.values, [prop]: value } });
  };

  return (
    <div
      data-testid='motion-inspector'
      className='shrink-0 border-t border-neutral-200 bg-white px-4 py-3'
    >
      <div className='mb-3 flex items-center gap-3'>
        <span className='text-3xs font-mono tracking-[0.14em] text-neutral-400 uppercase'>
          Keyframe
        </span>
        <label className='flex items-center gap-1.5'>
          <span className='text-3xs font-mono text-neutral-500'>Time</span>
          <input
            type='number'
            min={0}
            max={maxTime}
            step={50}
            value={kf.time}
            data-testid='motion-kf-time'
            onChange={e =>
              onChange({
                time: Math.max(0, Math.min(maxTime, Number(e.target.value))),
              })
            }
            className='text-2xs h-7 w-20 rounded-md border border-neutral-200 bg-white px-2 tabular-nums focus:border-neutral-400 focus:outline-none'
          />
          <span className='text-3xs font-mono text-neutral-400'>ms</span>
        </label>
        <label className='flex items-center gap-1.5'>
          <span className='text-3xs font-mono text-neutral-500'>Easing</span>
          <select
            value={easingValue}
            onChange={e => onChange({ easing: e.target.value as MotionEasing })}
            className='text-2xs h-7 cursor-pointer rounded-md border border-neutral-200 bg-white px-2 focus:border-neutral-400 focus:outline-none'
          >
            {EASING_OPTIONS.map(o => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className='flex-1' />
        <button
          type='button'
          onClick={onDelete}
          data-testid='motion-kf-delete'
          className='text-2xs flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 font-medium text-rose-700 hover:bg-rose-100'
        >
          <Trash2 className='size-3' /> Xóa
        </button>
      </div>

      <div className='grid grid-cols-3 gap-x-4 gap-y-2'>
        {PROPERTIES.map(prop => {
          const enabled = kf.values[prop] !== undefined;
          const value = kf.values[prop] ?? PROPERTY_DEFAULT[prop];
          return (
            <label key={prop} className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={enabled}
                onChange={e => toggleProperty(prop, e.target.checked)}
                className='size-3.5 cursor-pointer accent-neutral-900'
              />
              <span className='text-3xs w-20 font-mono tracking-[0.06em] text-neutral-500 uppercase'>
                {PROPERTY_LABEL[prop]}
              </span>
              <input
                type='number'
                disabled={!enabled}
                step={prop === 'opacity' || prop === 'scale' ? 0.05 : 1}
                value={value}
                onChange={e => setPropertyValue(prop, Number(e.target.value))}
                className='text-2xs h-7 w-20 rounded-md border border-neutral-200 bg-white px-2 tabular-nums focus:border-neutral-400 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400'
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
