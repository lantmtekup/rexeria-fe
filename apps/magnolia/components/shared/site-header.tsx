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
      className={cn('flex h-[30px] w-[195px] items-stretch', className)}
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
              'font-display text-ivory relative flex-1 text-[10.4px] leading-none',
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

export function LogoLockup({
  scale = 1,
  className,
}: {
  scale?: number;
  className?: string;
}) {
  return (
    <div
      role='img'
      aria-label='The Magnolia — Private Residences'
      className={cn('text-ivory flex items-center', className)}
      style={{ gap: 7 * scale }}
    >
      <MagnoliaMark size={44 * scale} />
      <span className='flex flex-col' style={{ gap: 3 * scale }}>
        <span
          className='font-display leading-none'
          style={{ fontSize: 27 * scale, letterSpacing: '0.005em' }}
        >
          The Magnolia
        </span>
        <span
          className='text-ivory/85 self-center font-sans leading-none font-light'
          style={{ fontSize: 8 * scale, letterSpacing: `${0.3 * scale}em` }}
        >
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
      className={cn(
        'group text-ivory flex items-center gap-4 transition-opacity duration-300',
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
      <span className='font-sans text-[10.4px] leading-none font-light'>
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
