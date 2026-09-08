'use client';

/**
 * 212 West 72nd · Footer — khung viền trắng trên nền nâu, wordmark cưỡi mép
 * trên, hàng liên hệ + Instagram + fine print, rèm 4 cột reveal.
 * Port từ apps/212-west Footer.tsx.
 *
 * Motion (giữ timing app): 4 rèm trượt ∓100% (lệch ±2px chống hở mép) +
 * nội dung `autoAlpha` 0→1, 1.8s power3.out. Chỉ chạy từ khung `@2xl` trở lên
 * (app: `md`); khung hẹp hiện tĩnh.
 *
 * - `useLayoutEffect` để `gsap.set(content, autoAlpha 0)` chạy trước paint —
 *   không nháy nội dung rồi mới ẩn.
 * - Editor canvas: bỏ rèm + không ẩn nội dung, mọi field chọn được.
 * - KHÔNG gsap.registerPlugin — LandingMotionRoot đã đăng ký.
 */

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  West72FooterContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import {
  WEST72_BROWN,
  WEST72_FONT_CSS,
  WEST72_FONT_DISPLAY,
  WEST72_FONT_TEXT,
  WEST72_WHITE,
} from './west72Theme';

const CURTAIN_DURATION = 1.8;
const CURTAIN_PANELS = [0, 1, 2, 3];

/** Kem nhạt cho dòng bản quyền (app: #F6F3E7). */
const WEST72_SAND = '#F6F3E7';

const FINE_TYPE: React.CSSProperties = {
  fontFamily: WEST72_FONT_TEXT,
  fontSize: 10,
  lineHeight: 1.35,
  fontWeight: 400,
  letterSpacing: '0.33px',
  textTransform: 'uppercase',
  color: WEST72_WHITE,
  textDecoration: 'none',
};

function InstagramIcon() {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      aria-hidden='true'
      style={{ width: 20, height: 20, display: 'block' }}
    >
      <path
        d='M10.0022 4.87117C7.16453 4.87117 4.87563 7.16007 4.87563 9.99777C4.87563 12.8355 7.16453 15.1244 10.0022 15.1244C12.8399 15.1244 15.1288 12.8355 15.1288 9.99777C15.1288 7.16007 12.8399 4.87117 10.0022 4.87117ZM10.0022 13.3307C8.16843 13.3307 6.66927 11.836 6.66927 9.99777C6.66927 8.15951 8.16397 6.66481 10.0022 6.66481C11.8405 6.66481 13.3352 8.15951 13.3352 9.99777C13.3352 11.836 11.836 13.3307 10.0022 13.3307ZM16.5343 4.66146C16.5343 5.32627 15.9989 5.85722 15.3385 5.85722C14.6737 5.85722 14.1428 5.32181 14.1428 4.66146C14.1428 4.00112 14.6782 3.4657 15.3385 3.4657C15.9989 3.4657 16.5343 4.00112 16.5343 4.66146ZM19.9297 5.87507C19.8539 4.27328 19.488 2.85443 18.3146 1.68544C17.1456 0.516453 15.7267 0.150586 14.1249 0.0702733C12.4741 -0.0234244 7.52593 -0.0234244 5.87507 0.0702733C4.27775 0.146124 2.8589 0.511991 1.68544 1.68098C0.511991 2.84997 0.150586 4.26882 0.0702733 5.87061C-0.0234244 7.52147 -0.0234244 12.4696 0.0702733 14.1205C0.146124 15.7223 0.511991 17.1411 1.68544 18.3101C2.8589 19.4791 4.27328 19.845 5.87507 19.9253C7.52593 20.019 12.4741 20.019 14.1249 19.9253C15.7267 19.8494 17.1456 19.4835 18.3146 18.3101C19.4835 17.1411 19.8494 15.7223 19.9297 14.1205C20.0234 12.4696 20.0234 7.52593 19.9297 5.87507ZM17.797 15.8918C17.449 16.7663 16.7752 17.44 15.8963 17.7925C14.58 18.3146 11.4568 18.1941 10.0022 18.1941C8.54769 18.1941 5.41997 18.3101 4.1082 17.7925C3.23369 17.4445 2.55996 16.7708 2.20747 15.8918C1.68544 14.5756 1.80591 11.4523 1.80591 9.99777C1.80591 8.54322 1.68991 5.4155 2.20747 4.10374C2.55549 3.22922 3.22922 2.55549 4.1082 2.20301C5.42443 1.68098 8.54769 1.80145 10.0022 1.80145C11.4568 1.80145 14.5845 1.68544 15.8963 2.20301C16.7708 2.55103 17.4445 3.22476 17.797 4.10374C18.319 5.41997 18.1985 8.54322 18.1985 9.99777C18.1985 11.4523 18.319 14.58 17.797 15.8918Z'
        fill='currentColor'
      />
    </svg>
  );
}

interface Props {
  content: West72FooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function West72Footer({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const { scroller, requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const isNarrow = useContainerMobile(rootRef);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const wordmark = content.wordmark?.trim() || '';
  const addressText = content.addressText?.trim() || '';
  const emailLabel = content.emailLabel?.trim() || '';
  const emailHref = content.emailHref?.trim() ?? '';
  const phoneLabel = content.phoneLabel?.trim() || '';
  const phoneHref = content.phoneHref?.trim() ?? '';
  const instagramLabel = content.instagramLabel?.trim() || '';
  const instagramHref = content.instagramHref?.trim() ?? '';
  const fairHousingText = content.fairHousingText?.trim() || '';
  const fairHousingHref = content.fairHousingHref?.trim() ?? '';
  const disclaimer = content.disclaimer?.trim() || '';
  const copyright = content.copyright?.trim() || '';

  // ── Motion ───────────────────────────────────────────────────────────────
  React.useLayoutEffect(() => {
    if (isCanvas || isNarrow) return;
    const root = rootRef.current;
    if (!root) return;

    const width = root.clientWidth;
    if (width === 0) return;

    const panels = root.querySelectorAll<HTMLElement>('[data-footer-panel]');
    const contentEl = root.querySelector<HTMLElement>('[data-footer-content]');
    if (!panels.length || !contentEl) return;

    const st = scroller ?? undefined;
    const duration = reduceMotion ? 0 : CURTAIN_DURATION;

    const ctx = gsap.context(() => {
      gsap.set(panels, { yPercent: 0, y: 0 });
      gsap.set(contentEl, { autoAlpha: 0 });

      const tl = gsap
        .timeline({
          paused: true,
          defaults: { duration, ease: 'power3.out' },
        })
        .to(
          panels,
          {
            yPercent: (index: number) => (index % 2 === 0 ? -100 : 100),
            y: (index: number) => (index % 2 === 0 ? -2 : 2),
          },
          0
        )
        .to(contentEl, { autoAlpha: 1 }, 0);

      ScrollTrigger.create({
        trigger: root,
        scroller: st,
        start: 'top 75%',
        end: 'bottom top',
        invalidateOnRefresh: true,
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
        onLeave: () => tl.pause(0),
        onLeaveBack: () => tl.reverse(),
      });
    }, root);

    requestRefresh();
    return () => ctx.revert();
  }, [isCanvas, isNarrow, scroller, requestRefresh, reduceMotion]);

  const contactLink = (
    labelKey: 'emailLabel' | 'phoneLabel',
    hrefKey: 'emailHref' | 'phoneHref',
    label: string,
    href: string
  ) => (
    <a
      href={isCanvas ? undefined : href || '#'}
      onClick={isCanvas ? e => e.preventDefault() : undefined}
      data-element-key={hrefKey}
      aria-label={label}
      className={selectableClass(activeKey === hrefKey, 'cursor-pointer')}
      style={styleOf(hrefKey)}
    >
      <span
        data-element-key={labelKey}
        className={selectableClass(activeKey === labelKey)}
        style={composeStyle(FINE_TYPE, styleOf(labelKey))}
      >
        {label}
      </span>
    </a>
  );

  return (
    <footer
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className={cn(
        'west72-footer @container relative z-30 w-full overflow-hidden px-5 pt-14 pb-10 @2xl:px-10 @4xl:pt-[86px]',
        className
      )}
      style={composeStyle(
        { backgroundColor: WEST72_BROWN },
        blockBackgroundStyle(background)
      )}
    >
      <style>{WEST72_FONT_CSS}</style>

      <div
        data-footer-content
        className='mx-auto w-full'
        style={{ maxWidth: 1440 }}
      >
        <div
          className='relative px-5 pt-9 pb-11 @4xl:px-0 @4xl:pt-9 @4xl:pb-11'
          style={{ border: `1px solid ${WEST72_WHITE}` }}
        >
          <span
            data-element-key='wordmark'
            className={selectableClass(
              activeKey === 'wordmark',
              'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 whitespace-nowrap @4xl:px-16'
            )}
            style={composeStyle(
              {
                backgroundColor: WEST72_BROWN,
                fontFamily: WEST72_FONT_DISPLAY,
                fontSize: 'clamp(20px, 1.67cqi, 24px)',
                lineHeight: 1.2,
                fontWeight: 400,
                textTransform: 'uppercase',
                color: WEST72_WHITE,
              },
              styleOf('wordmark')
            )}
          >
            {wordmark}
          </span>

          <div className='flex flex-col items-center gap-2 @2xl:flex-row @2xl:justify-center @2xl:gap-6'>
            <span
              data-element-key='addressText'
              className={selectableClass(activeKey === 'addressText')}
              style={composeStyle(FINE_TYPE, styleOf('addressText'))}
            >
              {addressText}
            </span>
            {contactLink('emailLabel', 'emailHref', emailLabel, emailHref)}
            {contactLink('phoneLabel', 'phoneHref', phoneLabel, phoneHref)}
          </div>

          <div className='mt-5 flex justify-center'>
            <a
              href={isCanvas ? undefined : instagramHref || '#'}
              onClick={isCanvas ? e => e.preventDefault() : undefined}
              data-element-key='instagramHref'
              aria-label={instagramLabel}
              className={selectableClass(
                activeKey === 'instagramHref',
                'grid min-h-11 min-w-11 cursor-pointer place-items-center'
              )}
              style={composeStyle(
                { color: WEST72_WHITE },
                styleOf('instagramHref')
              )}
            >
              <InstagramIcon />
            </a>
            <span
              data-element-key='instagramLabel'
              className={selectableClass(
                activeKey === 'instagramLabel',
                'sr-only'
              )}
              style={styleOf('instagramLabel')}
            >
              {instagramLabel}
            </span>
          </div>

          <div className='mt-4 @2xl:px-5 @4xl:mt-4 @4xl:px-30'>
            <a
              href={isCanvas ? undefined : fairHousingHref || '#'}
              onClick={isCanvas ? e => e.preventDefault() : undefined}
              data-element-key='fairHousingHref'
              aria-label={fairHousingText}
              className={selectableClass(
                activeKey === 'fairHousingHref',
                'block cursor-pointer'
              )}
              style={styleOf('fairHousingHref')}
            >
              <span
                data-element-key='fairHousingText'
                className={selectableClass(activeKey === 'fairHousingText')}
                style={composeStyle(FINE_TYPE, styleOf('fairHousingText'))}
              >
                {fairHousingText}
              </span>
            </a>

            <p
              data-element-key='disclaimer'
              className={selectableClass(activeKey === 'disclaimer', 'm-0')}
              style={composeStyle(
                { ...FINE_TYPE, marginTop: 16 },
                styleOf('disclaimer')
              )}
            >
              {disclaimer}
            </p>
          </div>
        </div>

        <p
          data-element-key='copyright'
          className={selectableClass(
            activeKey === 'copyright',
            'm-0 text-center'
          )}
          style={composeStyle(
            {
              marginTop: 24,
              fontFamily: WEST72_FONT_TEXT,
              fontSize: 12.9,
              lineHeight: 1.52,
              fontWeight: 400,
              textTransform: 'uppercase',
              color: WEST72_SAND,
            },
            styleOf('copyright')
          )}
        >
          {copyright}
        </p>
      </div>

      {!isCanvas && (
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 z-40 hidden @2xl:block'
        >
          {CURTAIN_PANELS.map(index => (
            <div
              key={index}
              data-footer-panel
              className='absolute inset-y-0 will-change-transform'
              style={{
                left: `${index * 25}%`,
                width: 'calc(25% + 1px)',
                backgroundColor: WEST72_WHITE,
                transform: 'translateY(0)',
              }}
            />
          ))}
        </div>
      )}
    </footer>
  );
}
