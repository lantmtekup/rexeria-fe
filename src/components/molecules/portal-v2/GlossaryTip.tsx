'use client';

import { HoverCard } from 'radix-ui';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import type { GlossaryTermId } from '@/lib/portal-v2/glossary/terms';

type GlossaryTipProps = {
  term: GlossaryTermId;
  className?: string;
};

export const GlossaryTip = ({ term, className }: GlossaryTipProps) => {
  const t = useTranslations('portalV2.glossary');
  const title = t(`${term}.title`);

  return (
    <HoverCard.Root openDelay={80} closeDelay={120}>
      <HoverCard.Trigger asChild>
        <button
          type='button'
          aria-label={t('aria', { term: title })}
          className={cn(
            'inline-flex size-3.5 shrink-0 items-center justify-center rounded-full',
            'bg-[var(--pv2-hair)] text-[9.5px] leading-none font-bold text-[var(--pv2-mut)]',
            'align-middle transition-colors',
            'hover:bg-[var(--pv2-violet)] hover:text-[var(--pv2-paper)]',
            'focus-visible:bg-[var(--pv2-violet)] focus-visible:text-[var(--pv2-paper)]',
            'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
            className
          )}
        >
          ?
        </button>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side='bottom'
          align='start'
          sideOffset={8}
          collisionPadding={12}
          className={cn(
            'z-[var(--pv2-z-tip)] w-[320px] max-w-[calc(100vw-24px)]',
            'rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
            'p-3.5 shadow-[var(--pv2-sh-soft)]'
          )}
        >
          <div className='flex flex-wrap items-baseline gap-2'>
            <strong className='font-[family-name:var(--pv2-disp)] text-[13px] font-semibold tracking-[-0.02em] text-[var(--pv2-ink)]'>
              {title}
            </strong>
            <span className='rounded-full bg-[color-mix(in_srgb,var(--pv2-violet)_12%,var(--pv2-paper))] px-2 py-0.5 text-[9.5px] font-bold tracking-[0.04em] text-[var(--pv2-violet)] uppercase'>
              {t(`${term}.industry`)}
            </span>
          </div>
          <p className='mt-2 text-[12px] leading-[1.55] text-[var(--pv2-mut)]'>
            {t(`${term}.body`)}
          </p>
          <p className='mt-2 text-[10.5px] text-[var(--pv2-faint)] italic'>
            {t(`${term}.example`)}
          </p>
          <p className='mt-2 text-[10.5px] text-[var(--pv2-faint)]'>
            {t('footer')}
          </p>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
