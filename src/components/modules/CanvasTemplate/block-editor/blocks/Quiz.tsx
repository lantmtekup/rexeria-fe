'use client';

import * as React from 'react';
import { RotateCcw } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  QuizContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface QuizProps {
  content: QuizContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Multi-question quiz that totals option scores and lands on the
 * highest-`minScore` result whose threshold is ≤ total. Renders one
 * question at a time with optional image, then a result card on finish.
 */
export function Quiz({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: QuizProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );
  const sEyebrow = styleOf('eyebrow');
  const sTitle = styleOf('title');
  const sDescription = styleOf('description');
  const sQuestions = styleOf('questions');
  const sResults = styleOf('results');

  const questions = content.questions ?? [];
  const results = content.results ?? [];
  const [step, setStep] = React.useState(0);
  // answers[i] = option id chosen for questions[i]
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [done, setDone] = React.useState(false);

  const currentQ = questions[step];
  const totalScore = React.useMemo(() => {
    return questions.reduce((acc, q) => {
      const optId = answers[q.id];
      const opt = q.options.find(o => o.id === optId);
      return acc + (opt?.score ?? 0);
    }, 0);
  }, [questions, answers]);

  const winningResult = React.useMemo(() => {
    if (!done || results.length === 0) return null;
    // Pick the highest-minScore result whose threshold is ≤ totalScore.
    const sorted = [...results].sort((a, b) => b.minScore - a.minScore);
    return sorted.find(r => totalScore >= r.minScore) ?? results[0];
  }, [done, results, totalScore]);

  const pickOption = (optionId: string) => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));
  };

  const advance = () => {
    if (step < questions.length - 1) {
      setStep(s => s + 1);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setDone(false);
  };

  const hasAnswer = currentQ ? !!answers[currentQ.id] : false;
  const isLast = step === questions.length - 1;

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in flex w-full flex-col gap-5 rounded-md bg-neutral-50 px-6 py-10 duration-500 @2xl:px-12 @2xl:py-14',
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
              'text-3xs @2xl:text-2xs font-semibold tracking-[0.32em] text-purple-700 uppercase'
            )}
          >
            {content.eyebrow}
          </span>
        )}
        {content.title && (
          <h2
            data-element-key='title'
            style={sTitle}
            className={selectableClass(
              activeKey === 'title',
              'text-2xl font-semibold tracking-tight text-neutral-900 @2xl:text-3xl'
            )}
          >
            {content.title}
          </h2>
        )}
        {content.description && !done && (
          <p
            data-element-key='description'
            style={sDescription}
            className={selectableClass(
              activeKey === 'description',
              'max-w-[60ch] text-sm text-neutral-600'
            )}
          >
            {content.description}
          </p>
        )}
      </div>

      {!done ? (
        <div
          data-element-key='questions'
          style={sQuestions}
          className={selectableClass(
            activeKey === 'questions',
            'mx-auto flex w-full max-w-xl flex-col gap-4 rounded-md border border-neutral-200 bg-white p-5 shadow-sm @2xl:p-7'
          )}
        >
          {/* Progress dots */}
          <div className='flex items-center justify-center gap-1.5'>
            {questions.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i < step
                    ? 'w-3 bg-purple-600'
                    : i === step
                      ? 'w-8 bg-purple-600'
                      : 'w-3 bg-neutral-200'
                )}
              />
            ))}
          </div>

          {currentQ ? (
            <>
              {currentQ.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentQ.imageUrl}
                  alt=''
                  className='aspect-[16/9] w-full rounded-md object-cover'
                />
              )}
              <p className='text-center text-lg leading-snug font-semibold text-neutral-900 @2xl:text-xl'>
                {currentQ.prompt}
              </p>
              <div className='flex flex-col gap-2'>
                {currentQ.options.map(opt => {
                  const selected = answers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type='button'
                      onClick={() => pickOption(opt.id)}
                      className={cn(
                        'flex h-11 cursor-pointer items-center justify-between rounded-md border px-4 text-sm transition-colors',
                        selected
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-300'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-purple-300 hover:bg-purple-50/50'
                      )}
                    >
                      <span>{opt.label}</span>
                      {selected && (
                        <span className='text-xs font-semibold text-purple-600'>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                type='button'
                onClick={advance}
                disabled={!hasAnswer}
                className={cn(
                  'rounded-pill mt-2 h-10 cursor-pointer text-sm font-semibold transition-colors',
                  hasAnswer
                    ? 'bg-purple-600 text-white hover:bg-purple-500'
                    : 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                )}
              >
                {isLast
                  ? (content.finishLabel ?? 'Xem kết quả')
                  : (content.nextLabel ?? 'Tiếp')}
              </button>
            </>
          ) : (
            <p className='text-center text-sm text-neutral-500'>
              Chưa có câu hỏi nào — thêm trong sidebar.
            </p>
          )}
        </div>
      ) : (
        <div
          data-element-key='results'
          style={sResults}
          className={selectableClass(
            activeKey === 'results',
            'mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-md border border-purple-200 bg-white p-6 text-center shadow @2xl:p-8'
          )}
        >
          {winningResult ? (
            <>
              {winningResult.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={winningResult.imageUrl}
                  alt=''
                  className='aspect-[16/9] w-full rounded-md object-cover'
                />
              )}
              <h3 className='text-2xl font-semibold tracking-tight text-purple-900'>
                {winningResult.title}
              </h3>
              {winningResult.body && (
                <p className='text-sm leading-relaxed text-neutral-600'>
                  {winningResult.body}
                </p>
              )}
              <div className='flex flex-wrap items-center justify-center gap-3'>
                {winningResult.ctaText && (
                  <a
                    href={winningResult.ctaUrl || '#'}
                    onClick={e => e.preventDefault()}
                    className='rounded-pill inline-flex h-10 items-center bg-purple-600 px-5 text-sm font-semibold text-white hover:bg-purple-500'
                  >
                    {winningResult.ctaText}
                  </a>
                )}
                <button
                  type='button'
                  onClick={restart}
                  className='rounded-pill inline-flex h-10 cursor-pointer items-center gap-1.5 border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50'
                >
                  <RotateCcw className='size-3.5' />
                  Làm lại
                </button>
              </div>
              <span className='text-3xs tracking-wider text-neutral-400 uppercase'>
                Điểm: {totalScore}
              </span>
            </>
          ) : (
            <p className='text-sm text-neutral-500'>
              Chưa có kết quả nào — thêm trong sidebar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
