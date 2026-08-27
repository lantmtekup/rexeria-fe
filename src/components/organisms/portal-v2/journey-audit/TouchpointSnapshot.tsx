'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import type {
  AuditFlag,
  AuditTouchpoint,
} from '@/lib/portal-v2/journey-audit/types';

const PIN_BG: Record<string, string> = {
  crit: 'bg-[var(--pv2-error)]',
  warn: 'bg-[var(--pv2-warning)]',
  good: 'bg-[var(--pv2-success)]',
  neutral: 'bg-[var(--pv2-faint)]',
};

const PIN_POS = [
  'top-2.5 right-2.5',
  'top-[46%] left-2.5',
  'right-2.5 bottom-3',
];

const FLAG_CLASSES: Record<string, string> = {
  crit: 'bg-[color-mix(in_srgb,var(--pv2-error)_9%,var(--pv2-paper))] text-[var(--pv2-error)]',
  warn: 'bg-[color-mix(in_srgb,var(--pv2-warning)_12%,var(--pv2-paper))] text-[color-mix(in_srgb,var(--pv2-warning)_80%,var(--pv2-ink))]',
  good: 'bg-[color-mix(in_srgb,var(--pv2-success)_10%,var(--pv2-paper))] text-[var(--pv2-success)]',
  neutral: 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]',
};

const Pin = ({
  flag,
  index,
  absolute,
}: {
  flag: AuditFlag;
  index: number;
  absolute?: boolean;
}) => (
  <span
    className={cn(
      'text-3xs grid size-[19px] place-items-center rounded-full font-bold text-[var(--pv2-paper)]',
      PIN_BG[flag.severity],
      absolute &&
        cn(
          'absolute z-[3] shadow-[0_0_0_3px_rgba(255,255,255,.85),0_2px_6px_rgba(14,22,38,.25)]',
          PIN_POS[index]
        )
    )}
  >
    {index + 1}
  </span>
);

type TouchpointSnapshotProps = {
  tp: AuditTouchpoint;
  productSlug: string;
  capturedVia: string;
};

/** Snapshot mock theo kind (page/listing/social/email/reviews/physical…). */
export const TouchpointSnapshot = ({
  tp,
  productSlug,
  capturedVia,
}: TouchpointSnapshotProps) => {
  const t = useTranslations('portalV2.journeyAudit');
  const sn = tp.snapshot;
  const pins = tp.flags.slice(0, 3);

  const cta = (extra?: string) => (
    <span
      className={cn(
        'text-2xs inline-block w-fit rounded-[var(--pv2-r-sm)] bg-[var(--pv2-electric)] px-3.5 py-1.5 font-semibold text-[var(--pv2-paper)]',
        extra
      )}
    >
      {sn.cta}
    </span>
  );

  let inner: React.ReactNode;
  if (sn.kind === 'social') {
    inner = (
      <>
        <div className='text-2xs flex items-center gap-2 border-b border-[var(--pv2-hair)] px-3 py-2'>
          <span
            aria-hidden
            className='size-5 rounded-full bg-[var(--pv2-grad-primary)]'
          />
          <b>@{productSlug}.official</b>
          <span className='text-3xs ml-auto text-[var(--pv2-faint)]'>
            {t('snapSponsored')}
          </span>
        </div>
        <div className='relative grid h-[110px] place-items-center bg-[var(--pv2-electric-soft)] text-[40px]'>
          {tp.icon}
          <span className='absolute grid size-8 place-items-center rounded-full bg-[color-mix(in_srgb,var(--pv2-ink)_55%,transparent)] pl-0.5 text-xs text-[var(--pv2-paper)]'>
            ▶
          </span>
        </div>
        <div className='px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-mut)]'>
          <b className='text-[var(--pv2-ink)]'>{sn.heading}</b>
          <br />
          {sn.subline}
        </div>
        <div className='px-3 pb-3'>{cta()}</div>
      </>
    );
  } else if (sn.kind === 'email') {
    inner = (
      <>
        <div className='text-2xs flex flex-col gap-0.5 border-b border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2.5 text-[var(--pv2-mut)]'>
          <span>
            <b>{t('snapFrom')}:</b>{' '}
            {productSlug === 'glow' ? 'JLO Beauty' : 'Brand'} Team
          </span>
          <span>
            <b>{t('snapSubject')}:</b> {sn.heading}
          </span>
        </div>
        <p className='text-2xs px-3 py-2.5 leading-relaxed text-[var(--pv2-mut)]'>
          {sn.subline}
        </p>
        <div className='px-3 pb-3'>{cta()}</div>
      </>
    );
  } else if (sn.kind === 'listing') {
    inner = (
      <div className='flex items-center gap-3 px-3 py-3.5'>
        <span
          aria-hidden
          className='grid size-[62px] shrink-0 place-items-center rounded-[var(--pv2-r)] bg-[var(--pv2-electric-soft)] text-[28px]'
        >
          {tp.icon}
        </span>
        <div className='min-w-0'>
          <div className='font-[family-name:var(--pv2-disp)] text-sm leading-tight font-bold text-[var(--pv2-ink)]'>
            {sn.heading}
          </div>
          <div className='mt-0.5 text-xs text-[color-mix(in_srgb,var(--pv2-warning)_85%,var(--pv2-ink))]'>
            ★★★★☆{' '}
            <span className='text-3xs text-[var(--pv2-faint)]'>
              {t('snapNoRating')}
            </span>
          </div>
          <div className='text-2xs mt-0.5 leading-relaxed text-[var(--pv2-mut)]'>
            {sn.subline}
          </div>
        </div>
        <span className='ml-auto shrink-0 text-sm font-semibold text-[var(--pv2-ink)]'>
          {sn.cta}
        </span>
      </div>
    );
  } else if (sn.kind === 'reviews') {
    inner = (
      <div className='px-3 py-3'>
        <div className='font-[family-name:var(--pv2-disp)] text-sm font-bold text-[var(--pv2-ink)]'>
          {sn.heading}
        </div>
        <div className='text-xs text-[color-mix(in_srgb,var(--pv2-warning)_85%,var(--pv2-ink))]'>
          ★★★★★ · ★★★★☆ · ★☆☆☆☆
        </div>
        <p className='text-2xs mt-1 leading-relaxed text-[var(--pv2-mut)]'>
          {sn.subline}
        </p>
        <div className='mt-2'>{cta()}</div>
      </div>
    );
  } else if (sn.kind === 'physical') {
    inner = (
      <div className='px-3.5 py-4 text-center'>
        <div className='font-[family-name:var(--pv2-disp)] text-sm font-bold text-[var(--pv2-ink)]'>
          {sn.heading}
        </div>
        <p className='text-2xs mt-1 leading-relaxed text-[var(--pv2-mut)]'>
          {sn.subline}
        </p>
        <div
          aria-hidden
          className='mx-auto my-2.5 grid size-[54px] place-items-center rounded-[var(--pv2-r-sm)] border-2 border-[var(--pv2-ink)] text-[26px]'
        >
          ▦
        </div>
        <span className='text-2xs inline-block rounded-[var(--pv2-r-sm)] bg-[var(--pv2-error)] px-3.5 py-1.5 font-semibold text-[var(--pv2-paper)]'>
          {sn.cta}
        </span>
      </div>
    );
  } else {
    // page (mặc định — cả audio/chat gom về khung page trong Phase 1)
    inner = (
      <>
        <div className='flex items-center gap-1.5 border-b border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2'>
          <i className='size-2 rounded-full bg-[var(--pv2-hair)]' />
          <i className='size-2 rounded-full bg-[var(--pv2-hair)]' />
          <i className='size-2 rounded-full bg-[var(--pv2-hair)]' />
          <span className='text-3xs ml-1.5 text-[var(--pv2-faint)]'>
            brand.com/{productSlug}
          </span>
        </div>
        <div className='flex items-center gap-3 px-3 py-3.5'>
          <span
            aria-hidden
            className='grid size-[62px] shrink-0 place-items-center rounded-[var(--pv2-r)] bg-[var(--pv2-electric-soft)] text-[28px]'
          >
            {tp.icon}
          </span>
          <div className='min-w-0'>
            <div className='font-[family-name:var(--pv2-disp)] text-sm leading-tight font-bold text-[var(--pv2-ink)]'>
              {sn.heading}
            </div>
            <div className='text-2xs mt-0.5 leading-relaxed text-[var(--pv2-mut)]'>
              {sn.subline}
            </div>
            <div className='mt-2'>{cta()}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <section className='mb-5'>
      <h4 className='text-3xs mb-2.5 font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
        {t('snapshotTitle')}
      </h4>
      <div className='relative overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] shadow-[var(--pv2-sh-sm)]'>
        {pins.map((flag, index) => (
          <Pin key={flag.label} flag={flag} index={index} absolute />
        ))}
        {inner}
      </div>
      <p className='text-2xs mt-2 text-[var(--pv2-faint)]'>
        {t('snapshotMeta', { source: capturedVia })}
      </p>
      <div className='mt-2 flex flex-col gap-1.5'>
        {pins.map((flag, index) => (
          <span key={flag.label} className='flex items-center gap-2'>
            <Pin flag={flag} index={index} />
            <span
              className={cn(
                'text-3xs rounded-[5px] px-1.5 py-0.5 font-semibold',
                FLAG_CLASSES[flag.severity]
              )}
            >
              {flag.label}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
};
