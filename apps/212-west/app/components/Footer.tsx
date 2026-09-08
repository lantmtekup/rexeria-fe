'use client';

import { useLayoutEffect, useRef } from 'react';
import {
  createReplayTrigger,
  gsap,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '@/app/lib/motion';

const WORDMARK = '212west72';

const ADDRESS = '212 West 72nd Street New York, NY 10023';

const EMAIL = 'info@212west72.com';

const PHONE = '+12127211200';

const FAIR_HOUSING =
  '200 West 72nd Street Owner, LLC and Exclusive Sales and Marketing Agent fully support the principles of the Fair Housing Act and the Equal Opportunity Act.';

const DISCLAIMER =
  "All images are artist's renderings for illustration purposes and should not be relied upon by the purchasing public. Views shown are reasonable approximations and taken from various elevations. They are provided for illustration purposes only and should not be relied upon by the purchasing public. Sponsor makes no representation whatsoever with respect to actual, current or future views from any particular floor or unit. The complete terms are in an offering plan available from the Sponsor, which is subject to change by a duly filed amendment. File No. CD19-0069. 212 West 72 Street, NYC 10023. 200 West 72nd Street Owner, LLC c/o Centurion Property Investors, LLC, 595 Madison Avenue, NYC 10022. Only";

const COPYRIGHT = '© ReXeR Studio. 2026. All Rights Reserved.';

const WORDMARK_TYPE =
  'font-display text-xl leading-[29px] font-normal uppercase text-white md:text-2xl';

const FINE_TYPE =
  'font-sans text-[10px] leading-[13.5px] font-normal tracking-[0.33px] uppercase text-white';

const COPYRIGHT_TYPE =
  'font-sans text-[12.9px] leading-[19.6px] font-normal uppercase text-[#F6F3E7]';

function InstagramIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      className='h-5 w-5'
      aria-hidden='true'
    >
      <path
        d='M10.0022 4.87117C7.16453 4.87117 4.87563 7.16007 4.87563 9.99777C4.87563 12.8355 7.16453 15.1244 10.0022 15.1244C12.8399 15.1244 15.1288 12.8355 15.1288 9.99777C15.1288 7.16007 12.8399 4.87117 10.0022 4.87117ZM10.0022 13.3307C8.16843 13.3307 6.66927 11.836 6.66927 9.99777C6.66927 8.15951 8.16397 6.66481 10.0022 6.66481C11.8405 6.66481 13.3352 8.15951 13.3352 9.99777C13.3352 11.836 11.836 13.3307 10.0022 13.3307ZM16.5343 4.66146C16.5343 5.32627 15.9989 5.85722 15.3385 5.85722C14.6737 5.85722 14.1428 5.32181 14.1428 4.66146C14.1428 4.00112 14.6782 3.4657 15.3385 3.4657C15.9989 3.4657 16.5343 4.00112 16.5343 4.66146ZM19.9297 5.87507C19.8539 4.27328 19.488 2.85443 18.3146 1.68544C17.1456 0.516453 15.7267 0.150586 14.1249 0.0702733C12.4741 -0.0234244 7.52593 -0.0234244 5.87507 0.0702733C4.27775 0.146124 2.8589 0.511991 1.68544 1.68098C0.511991 2.84997 0.150586 4.26882 0.0702733 5.87061C-0.0234244 7.52147 -0.0234244 12.4696 0.0702733 14.1205C0.146124 15.7223 0.511991 17.1411 1.68544 18.3101C2.8589 19.4791 4.27328 19.845 5.87507 19.9253C7.52593 20.019 12.4741 20.019 14.1249 19.9253C15.7267 19.8494 17.1456 19.4835 18.3146 18.3101C19.4835 17.1411 19.8494 15.7223 19.9297 14.1205C20.0234 12.4696 20.0234 7.52593 19.9297 5.87507ZM17.797 15.8918C17.449 16.7663 16.7752 17.44 15.8963 17.7925C14.58 18.3146 11.4568 18.1941 10.0022 18.1941C8.54769 18.1941 5.41997 18.3101 4.1082 17.7925C3.23369 17.4445 2.55996 16.7708 2.20747 15.8918C1.68544 14.5756 1.80591 11.4523 1.80591 9.99777C1.80591 8.54322 1.68991 5.4155 2.20747 4.10374C2.55549 3.22922 3.22922 2.55549 4.1082 2.20301C5.42443 1.68098 8.54769 1.80145 10.0022 1.80145C11.4568 1.80145 14.5845 1.68544 15.8963 2.20301C16.7708 2.55103 17.4445 3.22476 17.797 4.10374C18.319 5.41997 18.1985 8.54322 18.1985 9.99777C18.1985 11.4523 18.319 14.58 17.797 15.8918Z'
        fill='white'
      />
    </svg>
  );
}

const CURTAIN_PANELS = [0, 1, 2, 3];

const CURTAIN_DURATION = 1.8;

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const panels = section.querySelectorAll<HTMLElement>('[data-footer-panel]');
    const content = section.querySelector<HTMLElement>('[data-footer-content]');
    if (!panels.length || !content) return;

    const mm = gsap.matchMedia(section);

    mm.add(MOTION_CONDITIONS, ctx => {
      const { isDesktop, reduce } = ctx.conditions as MotionConditions;
      if (!isDesktop) return;

      gsap.set(panels, { yPercent: 0, y: 0 });
      gsap.set(content, { autoAlpha: 0 });

      const tl = gsap
        .timeline({
          paused: true,
          defaults: {
            duration: reduce ? 0 : CURTAIN_DURATION,
            ease: 'power3.out',
          },
        })
        .to(
          panels,
          {
            yPercent: (index: number) => (index % 2 === 0 ? -100 : 100),
            y: (index: number) => (index % 2 === 0 ? -2 : 2),
          },
          0
        )
        .to(content, { autoAlpha: 1 }, 0);

      const trigger = createReplayTrigger({
        trigger: section,
        start: 'top 75%',
        timeline: tl,
      });

      return () => trigger.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
      data-snap
      className='relative z-30 w-full overflow-hidden bg-[#763718] px-5 pt-14 pb-10 md:px-10 lg:pt-[85.5px] 2xl:px-0'
    >
      <div data-footer-content className='mx-auto w-full max-w-360'>
        <div className='relative border border-white px-5 pt-9 pb-11 lg:px-0 lg:pt-[35.5px] lg:pb-[44.25px]'>
          <span
            className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#763718] px-4 whitespace-nowrap lg:px-16 ${WORDMARK_TYPE}`}
          >
            {WORDMARK}
          </span>

          <div
            className={`flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-6 lg:gap-6.5 ${FINE_TYPE}`}
          >
            <span>{ADDRESS}</span>
            <a href={`mailto:${EMAIL}`} className='cursor-pointer'>
              {EMAIL}
            </a>
            <a href={`tel:${PHONE}`} className='cursor-pointer'>
              {PHONE}
            </a>
          </div>

          <div className='mt-5 flex justify-center lg:mt-[20.5px]'>
            <a
              href='#'
              className='cursor-pointer'
              aria-label='212 West 72nd on Instagram'
            >
              <InstagramIcon />
            </a>
          </div>

          <div className={`mt-4 md:px-5 lg:mt-[17.25px] lg:px-30 ${FINE_TYPE}`}>
            <a href='#' className='block cursor-pointer'>
              {FAIR_HOUSING}
            </a>
            <p className='mt-4'>{DISCLAIMER}</p>
          </div>
        </div>

        <p className={`mt-6 text-center ${COPYRIGHT_TYPE}`}>{COPYRIGHT}</p>
      </div>

      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-40 hidden md:block'
      >
        {CURTAIN_PANELS.map(index => (
          <div
            key={index}
            data-footer-panel
            className='absolute inset-y-0 bg-white will-change-transform'
            style={{
              left: `${index * 25}%`,
              width: 'calc(25% + 1px)',
              transform: 'translateY(0)',
            }}
          />
        ))}
      </div>
    </footer>
  );
}
