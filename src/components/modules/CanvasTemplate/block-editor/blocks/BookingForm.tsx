import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  BookingFormContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface BookingFormProps {
  content: BookingFormContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function BookingForm({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BookingFormProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sTitle = styleOf('title');
  const sDescription = styleOf('description');
  const sReasons = styleOf('reasons');
  const sSubmit = styleOf('submitText');
  const sNote = styleOf('noteText');

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 relative grid w-full grid-cols-1 overflow-hidden rounded-md bg-neutral-950 text-white duration-700 ease-out @2xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]',
        className
      )}
    >
      <div className='flex flex-col justify-between gap-6 p-6 @2xl:gap-8 @2xl:p-12 @4xl:p-16'>
        <div className='flex flex-col gap-3 @2xl:gap-4'>
          {content.eyebrow && (
            <span
              data-element-key='eyebrow'
              style={sEyebrow}
              className={selectableClass(
                activeKey === 'eyebrow',
                'animate-reveal-x inline-flex w-fit items-center gap-2 text-[10px] font-semibold tracking-[0.32em] text-white/60 uppercase [animation-delay:900ms] [animation-duration:700ms] @2xl:text-xs'
              )}
            >
              <span className='size-1 shrink-0 rounded-full bg-white/40' />
              {content.eyebrow}
            </span>
          )}
          <h2
            data-element-key='title'
            style={sTitle}
            className={selectableClass(
              activeKey === 'title',
              'animate-reveal-x text-2xl leading-[1.1] font-semibold [animation-delay:1100ms] [animation-duration:1200ms] @2xl:text-4xl @4xl:text-5xl'
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
                'animate-soft-rise max-w-[40ch] text-sm text-white/70 [animation-delay:1700ms] @2xl:text-base @2xl:leading-7'
              )}
            >
              {content.description}
            </p>
          )}
        </div>

        {content.reasons.length > 0 && (
          <div
            data-element-key='reasons'
            style={sReasons}
            className={selectableClass(
              activeKey === 'reasons',
              'grid grid-cols-2 gap-2 @2xl:gap-3 @4xl:gap-4'
            )}
          >
            {content.reasons.slice(0, 4).map((r, i) => (
              <div
                key={i}
                style={{ animationDelay: `${2200 + i * 100}ms` }}
                className='animate-in fade-in slide-in-from-bottom-2 fill-mode-both rounded-md border border-white/10 bg-white/[0.04] p-2.5 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] @2xl:p-3 @4xl:p-4'
              >
                <div className='text-base leading-none font-semibold @2xl:text-lg @4xl:text-xl'>
                  {r.value}
                </div>
                <div className='mt-1.5 text-[10px] tracking-widest text-white/55 uppercase @2xl:mt-2 @2xl:text-xs'>
                  {r.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='flex flex-col gap-3 bg-white p-6 text-neutral-900 @2xl:gap-4 @2xl:p-10 @4xl:gap-5 @4xl:p-14'>
        <FormField label='Họ tên' placeholder='Nguyễn Văn A' />
        <FormField label='Số điện thoại' placeholder='+84' />
        <FormField label='Email' placeholder='you@email.com' />
        <FormField label='Ghi chú' placeholder='Mong muốn của bạn…' textarea />
        <button
          type='button'
          data-element-key='submitText'
          onClick={e => e.preventDefault()}
          style={sSubmit}
          className={selectableClass(
            activeKey === 'submitText',
            'rounded-pill animate-soft-rise mt-2 inline-flex min-h-11 items-center justify-center bg-neutral-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 ease-out [animation-delay:2400ms] hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-xl @2xl:py-3.5 @2xl:text-base'
          )}
        >
          {content.submitText || 'Gửi đăng ký'}
        </button>
        {content.noteText && (
          <p
            data-element-key='noteText'
            style={sNote}
            className={selectableClass(
              activeKey === 'noteText',
              'text-[10px] text-neutral-400 @2xl:text-xs'
            )}
          >
            {content.noteText}
          </p>
        )}
      </div>
    </div>
  );
}

function FormField({
  label,
  placeholder,
  textarea,
}: {
  label: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className='flex flex-col gap-1'>
      <span className='text-[10px] font-medium tracking-widest text-neutral-500 uppercase @2xl:text-xs'>
        {label}
      </span>
      {textarea ? (
        <textarea
          disabled
          placeholder={placeholder}
          rows={2}
          className='resize-none rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400'
        />
      ) : (
        <input
          disabled
          placeholder={placeholder}
          className='h-11 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-700 placeholder:text-neutral-400'
        />
      )}
    </label>
  );
}
