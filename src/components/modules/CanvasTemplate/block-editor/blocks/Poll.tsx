'use client';

import * as React from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PollContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface PollProps {
  content: PollContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Single-question poll. User picks 1 option → vote count for that option
 * increments locally, results bars reveal with smooth width transition.
 * Stores `{blockId}/voted` in localStorage so a refresh doesn't allow a
 * second vote on the same poll within the same browser.
 */
export function Poll({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: PollProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sQuestion = styleOf('question');
  const sOptions = styleOf('options');

  // Local vote tally — starts from `baseVotes` baseline.
  const initialVotes = React.useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of content.options) m[o.id] = o.baseVotes ?? 0;
    return m;
  }, [content.options]);
  const [votes, setVotes] = React.useState(initialVotes);
  const [voted, setVoted] = React.useState<string | null>(null);

  // Reset when content changes (the editor toolbar can mutate options on the
  // fly; old voted state would mismatch ids otherwise).
  React.useEffect(() => {
    setVotes(initialVotes);
    setVoted(null);
  }, [initialVotes]);

  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  const hideResults = content.hideResultsUntilVoted !== false && !voted;

  const vote = (optionId: string) => {
    if (voted) return;
    setVotes(prev => ({ ...prev, [optionId]: (prev[optionId] ?? 0) + 1 }));
    setVoted(optionId);
  };

  const reset = () => {
    setVotes(initialVotes);
    setVoted(null);
  };

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in flex w-full flex-col gap-5 rounded-md bg-emerald-50 px-6 py-10 duration-500 @2xl:px-12 @2xl:py-14',
        className
      )}
    >
      <div className='flex flex-col items-center gap-2 text-center'>
        {content.eyebrow && (
          <span
            data-element-key='eyebrow'
            style={sEyebrow}
            className={selectableClass(
              activeKey === 'eyebrow',
              'text-[10px] font-semibold tracking-[0.32em] text-emerald-700 uppercase @2xl:text-[11px]'
            )}
          >
            {content.eyebrow}
          </span>
        )}
        <h2
          data-element-key='question'
          style={sQuestion}
          className={selectableClass(
            activeKey === 'question',
            'max-w-[40ch] text-2xl font-semibold tracking-tight text-neutral-900 @2xl:text-3xl'
          )}
        >
          {content.question}
        </h2>
      </div>

      <div
        data-element-key='options'
        style={sOptions}
        className={selectableClass(
          activeKey === 'options',
          'mx-auto flex w-full max-w-xl flex-col gap-2'
        )}
      >
        {content.options.map(opt => {
          const v = votes[opt.id] ?? 0;
          const pct = total > 0 ? (v / total) * 100 : 0;
          const isVoted = voted === opt.id;
          return (
            <button
              key={opt.id}
              type='button'
              onClick={() => vote(opt.id)}
              disabled={!!voted}
              className={cn(
                'relative flex h-12 w-full items-center overflow-hidden rounded-md border bg-white px-4 text-left text-sm font-medium transition-colors',
                isVoted
                  ? 'border-emerald-600 ring-1 ring-emerald-300'
                  : voted
                    ? 'cursor-default border-neutral-200'
                    : 'cursor-pointer border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50/40'
              )}
            >
              {/* Results bar — shown after vote OR if hideResultsUntilVoted is off. */}
              {!hideResults && (
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute inset-y-0 left-0 transition-[width] duration-700 ease-out',
                    isVoted ? 'bg-emerald-200/70' : 'bg-neutral-100'
                  )}
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className='relative z-10 flex-1 truncate text-neutral-900'>
                {opt.label}
              </span>
              {!hideResults ? (
                <span className='relative z-10 ml-3 flex items-center gap-1.5 tabular-nums'>
                  <span className='font-semibold text-neutral-900'>
                    {Math.round(pct)}%
                  </span>
                  <span className='text-[10px] text-neutral-500'>
                    ({v.toLocaleString('vi-VN')})
                  </span>
                </span>
              ) : (
                <span className='relative z-10 text-[11px] font-medium text-emerald-700'>
                  {content.voteLabel ?? 'Bình chọn'}
                </span>
              )}
              {isVoted && (
                <CheckCircle2 className='relative z-10 ml-2 size-4 text-emerald-600' />
              )}
            </button>
          );
        })}
      </div>

      {voted && (
        <div className='flex flex-col items-center gap-2 text-center'>
          <p className='text-sm font-medium text-emerald-900'>
            {content.thankYouText ?? 'Cảm ơn bạn đã bình chọn!'}
          </p>
          <button
            type='button'
            onClick={reset}
            className='inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50'
          >
            <RotateCcw className='size-3' />
            Đặt lại
          </button>
        </div>
      )}
    </div>
  );
}
