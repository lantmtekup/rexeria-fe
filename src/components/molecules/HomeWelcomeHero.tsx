'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { motion } from 'framer-motion';
import { Database, LayoutDashboard, Sparkles } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { HomeLanguageToolbar } from '@/components/molecules/HomeLanguageToolbar';
import { cn } from '@/lib/cn';
import { Locale } from '@/settings/enums';

type HomeWelcomeHeroProps = {
  title: string;
  description: string;
  logoUrl: string | null;
  logoAlt: string;
  dbOk: boolean;
  dbConnectedLabel: string;
  dbDisconnectedLabel: string;
  locale: Locale;
  welcomeKicker: string;
  cmsCta: string;
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const HomeWelcomeHero = ({
  title,
  description,
  logoUrl,
  logoAlt,
  dbOk,
  dbConnectedLabel,
  dbDisconnectedLabel,
  locale,
  welcomeKicker,
  cmsCta,
}: HomeWelcomeHeroProps) => {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

  const childTransition = (delay: number) => ({
    ...transition,
    delay: reduceMotion ? 0 : delay,
  });

  return (
    <div className='relative flex min-h-dvh w-full flex-col overflow-hidden'>
      <div className='pointer-events-none fixed inset-0 -z-10' aria-hidden>
        <div className='bg-background absolute inset-0' />
        <div className='bg-primary/15 dark:bg-primary/25 absolute -top-32 left-1/2 h-[min(100vw,720px)] w-[min(100vw,720px)] -translate-x-1/2 rounded-full blur-3xl' />
        <div className='bg-brand-gold/12 dark:bg-brand-gold/8 absolute -right-32 -bottom-32 h-96 w-96 rounded-full blur-3xl' />
        <div className='from-bg-section-light/60 absolute inset-0 bg-gradient-to-b via-transparent to-transparent' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(13,36,114,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(100,120,200,0.15),transparent)]' />
      </div>

      <header className='relative z-10 flex flex-col gap-3 px-4 pt-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:px-12'>
        <div
          className={cn(
            'border-border/60 inline-flex w-fit max-w-full items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm',
            dbOk
              ? 'bg-emerald-500/8 text-emerald-800 dark:text-emerald-300'
              : 'bg-destructive/8 text-destructive'
          )}
        >
          <Database className='size-3.5 shrink-0' aria-hidden />
          <span className='min-w-0 truncate'>
            {dbOk ? dbConnectedLabel : dbDisconnectedLabel}
          </span>
        </div>
        <HomeLanguageToolbar locale={locale} />
      </header>

      <main className='relative z-0 flex min-h-0 flex-1 flex-col items-center justify-center px-4 pt-6 pb-20 sm:px-8 sm:pt-0 sm:pb-24'>
        <div className='mx-auto flex w-full max-w-2xl flex-col items-center text-center'>
          {logoUrl ? (
            <motion.div
              className='mb-8'
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={childTransition(0)}
            >
              <div
                className='relative h-20 w-20 sm:h-24 sm:w-24'
                style={{ aspectRatio: '1' }}
              >
                <div className='bg-card ring-border/50 absolute inset-0 rounded-2xl shadow-lg ring-1' />
                <Image
                  src={logoUrl}
                  alt={logoAlt}
                  fill
                  className='object-contain p-3'
                  unoptimized
                />
              </div>
            </motion.div>
          ) : null}

          <motion.p
            className='text-primary dark:text-primary mb-3 inline-flex items-center justify-center gap-2 text-sm font-semibold tracking-wide'
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={childTransition(logoUrl ? 0.06 : 0)}
          >
            <span className='bg-primary/10 dark:bg-primary/20 inline-flex items-center gap-1.5 rounded-full px-3 py-1'>
              <Sparkles
                className='text-brand-gold-cta size-3.5 sm:size-4'
                aria-hidden
              />
              {welcomeKicker}
            </span>
          </motion.p>

          <motion.h1
            className='text-foreground text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl'
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={childTransition(logoUrl ? 0.12 : 0.08)}
          >
            <span className='from-primary via-brand-navy-cta to-brand-navy-deep dark:from-foreground dark:via-foreground/95 dark:to-muted-foreground bg-gradient-to-r bg-clip-text text-transparent'>
              {title}
            </span>
          </motion.h1>

          <motion.p
            className='text-content-muted dark:text-muted-foreground mt-6 max-w-lg text-base leading-relaxed text-balance sm:text-lg'
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={childTransition(logoUrl ? 0.18 : 0.14)}
          >
            {description}
          </motion.p>

          <motion.div
            className='mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:max-w-md sm:flex-row sm:items-center'
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={childTransition(logoUrl ? 0.24 : 0.2)}
          >
            <Button
              asChild
              size='lg'
              className='h-12 rounded-full px-8 text-base shadow-md'
            >
              <Link
                href='/cms'
                className='inline-flex items-center justify-center gap-2'
              >
                <LayoutDashboard className='size-4' aria-hidden />
                {cmsCta}
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
