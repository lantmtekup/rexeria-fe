'use client';

import * as React from 'react';

import {
  getMotionEffect,
  type MotionEffect,
} from '@/components/modules/block-editor/motion/motionLibrary';
import { useMotionAttributes } from '@/components/modules/block-editor/motion/useMotionAttributes';
import { cn } from '@/lib/cn';

import { DEMO_HOWTO, getEffectDemo, PATTERN_DEMOS } from './demos';

const MetaBlock = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className='rounded-md border border-stone-200 bg-white p-4'>
    <h3 className='text-[11px] font-semibold tracking-wider text-stone-500 uppercase'>
      {title}
    </h3>
    <div className='mt-2 text-sm text-stone-700'>{children}</div>
  </div>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className='inline-flex rounded-md border border-stone-200 bg-stone-100 px-2 py-0.5 font-mono text-[11px] text-stone-700'>
    {children}
  </span>
);

const formatDefaults = (effect: MotionEffect): string => {
  const d = effect.defaults;
  const parts = [
    `trigger=${d.trigger}`,
    `duration=${d.duration}`,
    `ease=${d.ease}`,
  ];
  if (d.start) parts.push(`start=${d.start}`);
  if (d.end) parts.push(`end=${d.end}`);
  if (d.stagger != null) parts.push(`stagger=${d.stagger}`);
  if (d.repeat != null) parts.push(`repeat=${d.repeat}`);
  return parts.join(' · ');
};

export function EffectView({
  effectId,
  onSelectEffect,
}: {
  effectId: string;
  onSelectEffect: (id: string) => void;
}) {
  const effect = getMotionEffect(effectId);
  const rootRef = React.useRef<HTMLElement>(null);
  const [playKey, setPlayKey] = React.useState(0);
  const howTo = DEMO_HOWTO[effectId];
  const canReplay = effect?.defaults.trigger !== 'scrub';

  useMotionAttributes(rootRef, [playKey, effectId]);

  React.useEffect(() => {
    setPlayKey(0);
  }, [effectId]);

  if (!effect) {
    return (
      <div className='px-8 py-12 text-sm text-stone-600'>
        Effect <code className='font-mono'>{effectId}</code> không có trong
        library.
      </div>
    );
  }

  const { meta } = effect;
  const tall = effect.defaults.trigger === 'scrub';
  const renderDemo = getEffectDemo(effect);

  return (
    <article
      ref={rootRef}
      id={`fx-${effectId}`}
      className='flex min-h-full flex-col'
    >
      <header className='shrink-0 border-b border-stone-200 bg-white px-6 py-5 md:px-8'>
        <div className='flex flex-wrap items-center gap-2'>
          <h1 className='text-xl font-semibold tracking-tight text-stone-900'>
            {effect.label}
          </h1>
          <code className='rounded bg-teal-50 px-2 py-0.5 font-mono text-sm text-teal-800'>
            {effect.id}
          </code>
        </div>
        <p className='mt-2 text-sm text-stone-600'>{meta.summary}</p>
        <div className='mt-3 flex flex-wrap gap-1.5'>
          <Chip>{effect.defaults.trigger}</Chip>
          {effect.appliesTo.map(a => (
            <Chip key={a}>{a}</Chip>
          ))}
          {meta.tags.slice(0, 4).map(t => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </header>

      <div>
        <div className='border-b border-stone-200 px-6 py-6 md:px-8'>
          <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
            <h3 className='text-[11px] font-semibold tracking-wider text-stone-500 uppercase'>
              Stage
            </h3>
            {canReplay ? (
              <button
                type='button'
                onClick={() => setPlayKey(k => k + 1)}
                className='rounded-md border border-stone-300 bg-white px-3 py-1.5 font-mono text-[12px] text-stone-700 transition-colors hover:border-teal-500 hover:bg-teal-50 hover:text-teal-800 active:scale-[0.98]'
                aria-label={`Replay ${effect.id}`}
              >
                Replay
              </button>
            ) : (
              <span className='font-mono text-[11px] text-stone-500'>
                scrub — scroll stage
              </span>
            )}
          </div>
          {howTo ? (
            <p className='mb-3 text-xs font-medium text-teal-800'>{howTo}</p>
          ) : null}
          <div
            key={playKey}
            className={cn(
              'flex items-center justify-center rounded-md border border-stone-200 bg-white px-4 py-10',
              tall && 'min-h-[70vh]'
            )}
          >
            {renderDemo()}
          </div>
        </div>

        <div className='border-b border-stone-200 px-6 py-6 md:px-8'>
          <h3 className='text-[11px] font-semibold tracking-wider text-stone-500 uppercase'>
            Example
          </h3>
          <pre className='mt-2 overflow-x-auto rounded-md border border-stone-200 bg-stone-200/60 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-stone-800'>
            {meta.example}
          </pre>
        </div>

        <div className='grid gap-4 p-6 pb-10 md:grid-cols-2 md:p-8'>
          <MetaBlock title='When to use'>
            <ul className='list-disc space-y-1 pl-4'>
              {meta.whenToUse.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </MetaBlock>
          <MetaBlock title='When not to use'>
            <ul className='list-disc space-y-1 pl-4'>
              {meta.whenNotToUse.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </MetaBlock>
          <MetaBlock title='vs siblings'>
            {meta.vs.length === 0 ? (
              <p className='text-stone-500'>(none)</p>
            ) : (
              <ul className='space-y-2'>
                {meta.vs.map(v => (
                  <li
                    key={v.id}
                    className='flex flex-wrap items-baseline gap-2'
                  >
                    <button
                      type='button'
                      onClick={() => onSelectEffect(v.id)}
                      className='font-mono text-[12px] text-teal-700 hover:underline'
                    >
                      {v.id}
                    </button>
                    <span className='text-stone-600'>— {v.diff}</span>
                  </li>
                ))}
              </ul>
            )}
          </MetaBlock>
          <MetaBlock title='Prerequisites'>
            {meta.prerequisites.length === 0 ? (
              <p className='text-stone-500'>Không cần điều kiện đặc biệt.</p>
            ) : (
              <ul className='list-disc space-y-1 pl-4'>
                {meta.prerequisites.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </MetaBlock>
          <MetaBlock title='Defaults'>
            <p className='font-mono text-[12px] leading-relaxed text-stone-700'>
              {formatDefaults(effect)}
            </p>
          </MetaBlock>
          <MetaBlock title='Relevant attrs'>
            <div className='flex flex-wrap gap-1.5'>
              {meta.relevantAttrs.map(attr => (
                <Chip key={attr}>data-motion-{attr}</Chip>
              ))}
            </div>
          </MetaBlock>
        </div>
      </div>
    </article>
  );
}

export function PatternView() {
  const rootRef = React.useRef<HTMLElement>(null);
  const [playKey, setPlayKey] = React.useState(0);

  useMotionAttributes(rootRef, [playKey]);

  return (
    <article ref={rootRef} id='fx-group' className='flex min-h-full flex-col'>
      <header className='shrink-0 border-b border-stone-200 bg-white px-6 py-5 md:px-8'>
        <div className='flex flex-wrap items-start gap-3'>
          <div className='min-w-0 flex-1'>
            <h1 className='text-xl font-semibold tracking-tight text-stone-900'>
              Pattern — group & click
            </h1>
            <p className='mt-2 text-sm text-stone-600'>
              Không phải effect id trong library. Choreography T2 (
              <code className='font-mono text-[12px]'>data-motion-group</code> +
              stagger) và trigger click trên mọi effect.
            </p>
          </div>
          <button
            type='button'
            onClick={() => setPlayKey(k => k + 1)}
            className='rounded-md border border-stone-300 bg-white px-3 py-1.5 font-mono text-[12px] text-stone-700 transition-colors hover:border-teal-500 hover:bg-teal-50 hover:text-teal-800'
            aria-label='Replay pattern demos'
          >
            Replay
          </button>
        </div>
      </header>

      <div className='space-y-10 p-6 md:p-8'>
        <section>
          <h2 className='text-sm font-semibold text-stone-800'>
            Group + stagger-children
          </h2>
          <pre className='mt-2 overflow-x-auto rounded-md border border-stone-200 bg-stone-200/60 px-3 py-2 font-mono text-[12px] text-stone-800'>
            {
              "data-motion-group='' data-motion-stagger-children='0.18' + children data-motion"
            }
          </pre>
          <div
            key={`g-${playKey}`}
            className='mt-4 flex justify-center rounded-md border border-stone-200 bg-white px-4 py-10'
          >
            {PATTERN_DEMOS.group()}
          </div>
        </section>

        <section>
          <h2 className='text-sm font-semibold text-stone-800'>
            Click toggle (mọi effect)
          </h2>
          <pre className='mt-2 overflow-x-auto rounded-md border border-stone-200 bg-stone-200/60 px-3 py-2 font-mono text-[12px] text-stone-800'>
            {"data-motion='…' data-motion-trigger='click'"}
          </pre>
          <div
            key={`c-${playKey}`}
            className='mt-4 flex justify-center rounded-md border border-stone-200 bg-white px-4 py-10'
          >
            {PATTERN_DEMOS.click()}
          </div>
        </section>
      </div>
    </article>
  );
}
