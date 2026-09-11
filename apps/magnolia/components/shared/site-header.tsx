'use client';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { localeLabels, locales, type Locale } from '@/lib/i18n';
import { MagnoliaMark } from './magnolia-mark';
import { useLocale } from './locale-provider';

type Mode = 'story' | 'explore';

function ModeTabs({
  value,
  onChange,
  labels,
  className,
}: {
  value: Mode;
  onChange: (m: Mode) => void;
  labels: Record<Mode, string>;
  className?: string;
}) {
  return (
    <div
      role='tablist'
      aria-label='Story Mode / Explore Mode'
      // 44 px is the smallest target a finger hits reliably; the 30 px of the original is a
      // pointer-only size. Reverts to it from `sm` up, where there is a cursor.
      className={cn('flex h-11 w-[195px] items-stretch sm:h-[30px]', className)}
    >
      {(['story', 'explore'] as Mode[]).map(key => {
        const active = value === key;
        return (
          <button
            key={key}
            role='tab'
            type='button'
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(key)}
            className={cn(
              'font-display text-ivory relative flex-1 text-[12px] leading-none sm:text-[10.4px]',
              'ease-luxe transition-opacity duration-500',
              active
                ? 'bg-white/[0.04] backdrop-blur-[35.9px]'
                : 'opacity-[0.64] hover:opacity-90'
            )}
          >
            {labels[key]}
            {active && (
              <span
                aria-hidden
                className='bg-ivory absolute inset-x-0 bottom-0 h-px'
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The wordmark, sized by breakpoint rather than by a scale factor.
 *
 * It used to take a numeric `scale` and multiply every dimension by it. That cannot answer the
 * problem it had on a phone: the lockup is absolutely centred in a row that also carries the
 * sound control, and at full size the two ran into each other at 390 px — measured, the mark
 * ended at x 293 and the sound control began at 253. Scaling the whole thing down would have
 * fixed the collision and made the small line smaller still, and it was already 8 px.
 *
 * So below `sm` the lockup drops to the mark and the name, and the 8 px line is left out
 * rather than shrunk. Nothing is lost: "PRIVATE RESIDENCES" at 8 px on a phone was decoration
 * that could not be read anyway.
 */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <div
      role='img'
      aria-label='The Magnolia — Private Residences'
      className={cn('text-ivory flex items-center gap-[7px]', className)}
    >
      <MagnoliaMark size={44} className='h-8 w-8 sm:h-11 sm:w-11' />
      <span className='flex flex-col gap-[3px]'>
        <span className='font-display text-[20px] leading-none tracking-[0.005em] sm:text-[27px]'>
          The Magnolia
        </span>
        <span className='text-ivory/85 hidden self-center font-sans text-[8px] leading-none font-light tracking-[0.3em] sm:block'>
          PRIVATE RESIDENCES
        </span>
      </span>
    </div>
  );
}

function SoundToggle({
  on,
  onToggle,
  label,
  className,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const bars = [9, 16, 20, 13, 7];
  return (
    <button
      type='button'
      aria-pressed={on}
      onClick={onToggle}
      aria-label={label}
      className={cn(
        // The bars alone carry the meaning on a phone; the label is what made this control
        // wide enough to collide with the centred wordmark.
        'group text-ivory flex h-11 items-center gap-4 transition-opacity duration-300 sm:h-auto',
        on ? 'opacity-100' : 'opacity-60 hover:opacity-90',
        className
      )}
    >
      <span aria-hidden className='flex h-5 items-center gap-[3px]'>
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className='bg-ivory w-px'
            style={{ height: h }}
            animate={
              on && !reduced
                ? { scaleY: [1, 0.35, 1] }
                : { scaleY: on ? 1 : 0.4 }
            }
            transition={
              on && !reduced
                ? {
                    duration: 1.1 + 0.17 * i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.09 * i,
                  }
                : { duration: 0.4 }
            }
          />
        ))}
      </span>
      <span className='hidden font-sans text-[10.4px] leading-none font-light sm:inline'>
        {label}
      </span>
    </button>
  );
}

export function SiteHeader() {
  const { t, locale, setLocale } = useLocale();
  const [mode, setMode] = useState<Mode>('story');
  const [sound, setSound] = useState(true);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className='fixed inset-x-0 top-0 z-50 bg-transparent'
    >
      <div className='relative flex items-start justify-between px-8 py-7 md:px-10'>
        <ModeTabs
          value={mode}
          onChange={setMode}
          labels={t.modes}
          className='hidden md:flex'
        />
        <a
          href='#top'
          className='absolute top-6 left-1/2 -translate-x-1/2'
          aria-label={t.hero.brand}
        >
          <LogoLockup />
        </a>
        <div className='ml-auto flex items-center gap-7'>
          <div
            role='group'
            aria-label={t.a11y.languageSwitcher}
            className='text-ivory hidden items-center font-sans text-[10.4px] font-light sm:flex'
          >
            {locales.map((code, idx) => (
              <span key={code} className='flex items-center'>
                {idx > 0 && <span className='mx-1.5 opacity-40'>/</span>}
                <button
                  type='button'
                  onClick={() => setLocale(code as Locale)}
                  aria-pressed={locale === code}
                  className={cn(
                    'transition-opacity duration-300',
                    locale === code
                      ? 'opacity-100'
                      : 'opacity-50 hover:opacity-85'
                  )}
                >
                  {localeLabels[code]}
                </button>
              </span>
            ))}
          </div>
          <a
            href='#consultation'
            className='text-ivory hidden font-sans text-[10.4px] font-light opacity-80 transition-opacity duration-300 hover:opacity-100 sm:inline-flex'
          >
            {t.contact.trigger}
          </a>
          <SoundToggle
            on={sound}
            onToggle={() => setSound(s => !s)}
            label={sound ? t.sound.on : t.sound.off}
          />
        </div>
      </div>
      <div className='px-8 pb-4 md:hidden'>
        <ModeTabs value={mode} onChange={setMode} labels={t.modes} />
      </div>
    </motion.header>
  );
}
