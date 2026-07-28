'use client';

/**
 * Block "Springs - Contact & Footer" (springs-estate-clone: `.l-callback`
 * lồng bên trong section `.footer`, DOM gốc dòng ~7337-8163). Gộp 2 phần
 * thành 1 block tĩnh:
 *
 *  1. Contact/"request a callback" — bản gốc: h1 hai dòng "Submit / a
 *     request" (Victor Serif), tab "request"/"callback" rồi 1 form (Name,
 *     Phone, Message, khung giờ gọi lại) + nút "submit a request". Ở đây rút
 *     gọn về đúng: heading + mô tả ngắn + 1 nút CTA tĩnh (không wiring form
 *     thật — block demo/template).
 *  2. Footer — bản gốc thật ra rất tối giản (logo ảnh scroll-to-top, link
 *     "legal information", credit "Site by Vide Infra", đoạn legal dài, dòng
 *     "© 2026. All rights reserved."; KHÔNG có address/phone/email/nav-row
 *     hiển thị public). Content interface yêu cầu các field đó nên def dùng
 *     placeholder hợp lý (brand "Springs", email @springs.estate…) — xem
 *     comment trong `defs/springsContactFooter.ts`.
 *
 * Font thật (self-host tại springs.estate/assets/fonts, nạp qua @font-face
 * trỏ thẳng CDN gốc — khai báo lặp giữa các block Springs vô hại):
 *   - "Victor Serif" cho contact heading.
 *   - "TT Commons Pro" cho phần còn lại.
 *
 * Nền dark gần đen/xanh rêu đậm theo theming `ui-dark` của bản gốc, chữ
 * cream/trắng. Motion: contact heading/description/button fade-up khi cuộn
 * tới (ScrollTrigger, scroller qua useBlockMotion); footer (logo, info,
 * links, copyright) fade-in nhẹ hơn vì đã ở cuối trang.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsContactFooterContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

/** Serif dùng cho contact heading — bản gốc: Victor Serif. */
export const SPRINGS_FOOTER_FONT_SERIF =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho phần còn lại — bản gốc: TT Commons Pro. */
export const SPRINGS_FOOTER_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Nền tối gần đen/xanh rêu đậm (`ui-dark` gốc dùng ảnh + gradient, ở đây
 *  chọn 1 tông đặc phù hợp brand Springs). */
export const SPRINGS_FOOTER_BG = '#0d1410';

/** Chữ chính trên nền tối — cream nhạt (đối lập nền). */
export const SPRINGS_FOOTER_INK = '#f4f1e9';

export const SPRINGS_FOOTER_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TTCommonsPro-Md.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
`;

interface Props {
  content: SpringsContactFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsContactFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (reduce) return;

      const heading = root.querySelector<HTMLElement>(
        '.springs-contact-footer-heading'
      );
      const description = root.querySelector<HTMLElement>(
        '.springs-contact-footer-description'
      );
      const button = root.querySelector<HTMLElement>(
        '.springs-contact-footer-submit'
      );
      const footer = root.querySelector<HTMLElement>(
        '.springs-contact-footer-bottom'
      );

      // (1) Contact: heading → description → button, fade-up khi cuộn tới.
      const contactTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });
      if (heading) {
        contactTl.from(heading, { autoAlpha: 0, y: 32, duration: 0.8 }, 0);
      }
      if (description) {
        contactTl.from(
          description,
          { autoAlpha: 0, y: 24, duration: 0.7 },
          0.12
        );
      }
      if (button) {
        contactTl.from(button, { autoAlpha: 0, y: 18, duration: 0.6 }, 0.24);
      }

      // (2) Footer: đã ở cuối trang — fade-in đơn giản, không cần reverse gắt.
      if (footer) {
        gsap.from(footer, {
          autoAlpha: 0,
          y: 16,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footer,
            scroller,
            start: 'top 95%',
            toggleActions: 'play none none none',
            invalidateOnRefresh: true,
          },
        });
      }
    },
    []
  );

  return (
    <footer
      ref={rootRef}
      style={composeStyle(
        { background: SPRINGS_FOOTER_BG, color: SPRINGS_FOOTER_INK },
        blockBackgroundStyle(background)
      )}
      className='springs-contact-footer @container relative w-full'
    >
      <style>{SPRINGS_FOOTER_FONT_CSS}</style>

      {/* Contact / "request a callback" */}
      <div
        className='mx-auto flex w-full max-w-[720px] flex-col items-center text-center'
        style={{
          padding:
            'clamp(72px, 14cqi, 160px) clamp(20px, 6cqi, 64px) clamp(48px, 8cqi, 96px)',
        }}
      >
        <h2
          data-element-key='contactHeading'
          className={selectableClass(
            activeKey === 'contactHeading',
            'springs-contact-footer-heading'
          )}
          style={composeStyle(
            {
              margin: 0,
              fontFamily: SPRINGS_FOOTER_FONT_SERIF,
              fontWeight: 400,
              fontSize: 'clamp(30px, 5cqi, 58px)',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              color: SPRINGS_FOOTER_INK,
            },
            styleOf('contactHeading')
          )}
        >
          {content.contactHeading}
        </h2>

        {content.contactDescription ? (
          <p
            data-element-key='contactDescription'
            className={selectableClass(
              activeKey === 'contactDescription',
              'springs-contact-footer-description'
            )}
            style={composeStyle(
              {
                margin: 0,
                marginTop: 'clamp(16px, 2.4cqi, 24px)',
                fontFamily: SPRINGS_FOOTER_FONT_BODY,
                fontWeight: 400,
                fontSize: 'clamp(14px, 1.6cqi, 18px)',
                lineHeight: 1.6,
                color: SPRINGS_FOOTER_INK,
                opacity: 0.72,
                maxWidth: '44ch',
              },
              styleOf('contactDescription')
            )}
          >
            {content.contactDescription}
          </p>
        ) : null}

        <button
          type='button'
          data-element-key='submitLabel'
          className={selectableClass(
            activeKey === 'submitLabel',
            'springs-contact-footer-submit inline-flex min-h-11 items-center justify-center'
          )}
          style={composeStyle(
            {
              marginTop: 'clamp(28px, 4cqi, 40px)',
              fontFamily: SPRINGS_FOOTER_FONT_BODY,
              fontWeight: 500,
              fontSize: 'clamp(13px, 1.3cqi, 15px)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: SPRINGS_FOOTER_BG,
              background: SPRINGS_FOOTER_INK,
              border: 'none',
              borderRadius: '999px',
              padding: 'clamp(12px, 1.6cqi, 16px) clamp(28px, 3.6cqi, 40px)',
              cursor: 'pointer',
            },
            styleOf('submitLabel')
          )}
        >
          {content.submitLabel}
        </button>
      </div>

      {/* Footer */}
      <div
        className='springs-contact-footer-bottom mx-auto flex w-full max-w-[1200px] flex-col border-t'
        style={{
          borderColor: 'rgba(244, 241, 233, 0.14)',
          padding:
            'clamp(32px, 5cqi, 56px) clamp(20px, 6cqi, 64px) clamp(24px, 4cqi, 40px)',
          gap: 'clamp(24px, 3.6cqi, 40px)',
        }}
      >
        <div className='flex flex-col gap-6 @2xl:flex-row @2xl:items-start @2xl:justify-between'>
          <span
            data-element-key='footerLogoText'
            className={selectableClass(
              activeKey === 'footerLogoText',
              'springs-contact-footer-logo'
            )}
            style={composeStyle(
              {
                fontFamily: SPRINGS_FOOTER_FONT_SERIF,
                fontWeight: 400,
                fontSize: 'clamp(20px, 2.2cqi, 26px)',
                letterSpacing: '0.02em',
                color: SPRINGS_FOOTER_INK,
              },
              styleOf('footerLogoText')
            )}
          >
            {content.footerLogoText}
          </span>

          <div
            className='flex flex-col gap-2 @2xl:text-right'
            style={{
              fontFamily: SPRINGS_FOOTER_FONT_BODY,
              fontSize: 'clamp(13px, 1.3cqi, 15px)',
              lineHeight: 1.6,
              color: SPRINGS_FOOTER_INK,
              opacity: 0.72,
            }}
          >
            <p
              data-element-key='footerAddress'
              className={selectableClass(activeKey === 'footerAddress')}
              style={composeStyle({ margin: 0 }, styleOf('footerAddress'))}
            >
              {content.footerAddress}
            </p>
            <p
              data-element-key='footerPhone'
              className={selectableClass(activeKey === 'footerPhone')}
              style={composeStyle({ margin: 0 }, styleOf('footerPhone'))}
            >
              {content.footerPhone}
            </p>
            <p
              data-element-key='footerEmail'
              className={selectableClass(activeKey === 'footerEmail')}
              style={composeStyle({ margin: 0 }, styleOf('footerEmail'))}
            >
              {content.footerEmail}
            </p>
          </div>
        </div>

        {/* footerLinks: mảng dữ liệu nội dung (không key riêng từng item —
            chỉnh sửa qua editor content field, không phải LayersPanel). */}
        {content.footerLinks?.length ? (
          <nav
            className='flex flex-wrap items-center gap-x-6 gap-y-2 @2xl:justify-center'
            aria-label='Footer'
          >
            {content.footerLinks.map((link, i) => (
              <a
                key={`${link.href}-${i}`}
                href={link.href}
                style={{
                  fontFamily: SPRINGS_FOOTER_FONT_BODY,
                  fontSize: 'clamp(12px, 1.2cqi, 14px)',
                  letterSpacing: '0.02em',
                  color: SPRINGS_FOOTER_INK,
                  opacity: 0.64,
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}

        <p
          data-element-key='footerCopyright'
          className={selectableClass(activeKey === 'footerCopyright')}
          style={composeStyle(
            {
              margin: 0,
              fontFamily: SPRINGS_FOOTER_FONT_BODY,
              fontSize: 'clamp(11px, 1.1cqi, 13px)',
              color: SPRINGS_FOOTER_INK,
              opacity: 0.48,
              textAlign: 'center',
            },
            styleOf('footerCopyright')
          )}
        >
          {content.footerCopyright}
        </p>
      </div>
    </footer>
  );
}
