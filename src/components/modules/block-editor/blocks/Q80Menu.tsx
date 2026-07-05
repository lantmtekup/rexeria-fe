'use client';

/**
 * Block "Menu - Fullscreen Gold" (chrome cố định của quadplex80.com):
 *  - logo "111 W 57" serif căn giữa trên (fixed);
 *  - nút MENU trái trên → overlay vàng (#7c7262 nền tối hơn: gốc dùng bg-gold)
 *    fullscreen: ảnh tháp trái + link đánh số 01..07 + footer (main site /
 *    credits / legal / phone);
 *  - nút INQUIRE phải trên.
 *
 * Hai chế độ render như DelvauxHeader/DelvauxSubnav:
 *  - /p (hasRoot && scroller null): portal ra body, position fixed, z cao;
 *  - editor/mini-preview: render in-flow (dải preview) để không đè chrome admin.
 *
 * Điều khiển `q80_experience` qua window event `q80:goto` {target}; ẩn khi
 * experience báo overlay đang mở (`q80:overlay`).
 */
import * as React from 'react';
import { createPortal } from 'react-dom';

import { useLandingMotion } from '../motion/LandingMotion';
import {
  Q80_FONT_CSS,
  Q80_FONT_SANS,
  Q80_FONT_SERIF,
  Q80_LOGO_LINES,
} from './q80Theme';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  Q80MenuContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface Props {
  content: Q80MenuContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const MENU_BG = '#847a66'; // nền overlay vàng gốc (menu-mask bg-gold)

const CSS = `
${Q80_FONT_CSS}
.q80-menu-link { transition: opacity .35s ease; }
.q80-menu-link:hover { opacity: .55; }
.q80-menu-overlay { transition: clip-path .9s cubic-bezier(.7,0,.2,1); }
`;

export function Q80Menu({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const { scroller, hasRoot } = useLandingMotion();
  const isPublic = hasRoot && scroller === null;
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [creditsOpen, setCreditsOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  // Trên /p: chrome ẩn tới khi experience báo đã qua gate (`q80:entered`) —
  // mirror gốc: MENU/INQUIRE chỉ hiện sau khi enter.
  const [entered, setEntered] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Ẩn chrome khi experience mở overlay (drawer/plans/view)
  React.useEffect(() => {
    const onOverlay = (e: Event) =>
      setHidden(!!(e as CustomEvent<{ open: boolean }>).detail?.open);
    const onEntered = () => setEntered(true);
    window.addEventListener('q80:overlay', onOverlay);
    window.addEventListener('q80:entered', onEntered);
    return () => {
      window.removeEventListener('q80:overlay', onOverlay);
      window.removeEventListener('q80:entered', onEntered);
    };
  }, []);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const goto = (target: string) => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent('q80:goto', { detail: { target } }));
  };

  const chrome = (
    <>
      {/* thanh trên: MENU / logo / INQUIRE */}
      <div
        className='pointer-events-none flex w-full items-start justify-between'
        style={{
          padding: '14px 20px',
          opacity: hidden || (isPublic && !entered) ? 0 : 1,
          transition: 'opacity .6s ease',
        }}
      >
        <button
          type='button'
          onClick={() => setOpen(true)}
          className='pointer-events-auto flex items-center'
          style={{ gap: 15, color: '#ffffff' }}
        >
          <span className='flex flex-col' style={{ gap: 5 }}>
            <span
              style={{ width: 32, height: 1.5, background: 'currentColor' }}
            />
            <span
              style={{ width: 32, height: 1.5, background: 'currentColor' }}
            />
          </span>
          <span
            data-element-key='menuLabel'
            className={selectableClass(activeKey === 'menuLabel')}
            style={composeStyle(
              {
                fontFamily: Q80_FONT_SANS,
                fontWeight: 500,
                fontSize: 'clamp(11px, 1cqi, 14px)',
                letterSpacing: '.12em',
                textTransform: 'uppercase',
              },
              styleOf('menuLabel')
            )}
          >
            {content.menuLabel}
          </span>
        </button>

        <button
          type='button'
          onClick={() => goto('home')}
          aria-label={content.logoText}
          className='pointer-events-auto text-center'
          style={{ color: '#ffffff' }}
        >
          <span
            data-element-key='logoText'
            className={selectableClass(activeKey === 'logoText')}
            style={composeStyle(
              {
                fontFamily: Q80_FONT_SERIF,
                fontSize: 'clamp(12px, 1.15cqi, 16px)',
                letterSpacing: '.14em',
                lineHeight: 1.35,
                display: 'inline-block',
                whiteSpace: 'pre-line',
              },
              styleOf('logoText')
            )}
          >
            {content.logoText || Q80_LOGO_LINES.join('\n')}
          </span>
        </button>

        <a
          data-element-key='inquireLabel'
          href={content.inquireUrl || '#'}
          target='_blank'
          rel='noreferrer'
          className={
            selectableClass(activeKey === 'inquireLabel') +
            ' pointer-events-auto inline-flex items-center justify-center'
          }
          style={composeStyle(
            {
              fontFamily: Q80_FONT_SANS,
              fontWeight: 500,
              fontSize: 'clamp(10px, .95cqi, 13px)',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,.55)',
              padding: '11px 22px',
            },
            styleOf('inquireLabel')
          )}
        >
          {content.inquireLabel}
        </a>
      </div>

      {/* overlay menu vàng */}
      <div
        className='q80-menu-overlay absolute inset-0 flex flex-col'
        style={{
          background: MENU_BG,
          clipPath: open ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
          pointerEvents: open ? 'auto' : 'none',
          position: isPublic ? 'fixed' : 'absolute',
        }}
      >
        <div
          className='flex w-full items-start justify-between'
          style={{ padding: '14px 20px' }}
        >
          <button
            type='button'
            onClick={() => setOpen(false)}
            className='flex items-center'
            style={{ gap: 12, color: '#ffffff' }}
          >
            <span
              aria-hidden
              style={{ fontFamily: Q80_FONT_SANS, fontSize: 16 }}
            >
              ✕
            </span>
            <span
              data-element-key='closeLabel'
              className={selectableClass(activeKey === 'closeLabel')}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SANS,
                  fontWeight: 500,
                  fontSize: 'clamp(11px, 1cqi, 14px)',
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                },
                styleOf('closeLabel')
              )}
            >
              {content.closeLabel}
            </span>
          </button>
          <div className='text-center' style={{ color: '#ffffff' }}>
            <span
              style={{
                fontFamily: Q80_FONT_SERIF,
                fontSize: 'clamp(12px, 1.15cqi, 16px)',
                letterSpacing: '.14em',
                lineHeight: 1.35,
                display: 'inline-block',
                whiteSpace: 'pre-line',
              }}
            >
              {content.logoText || Q80_LOGO_LINES.join('\n')}
            </span>
          </div>
          <span style={{ width: 90 }} />
        </div>

        <div className='flex min-h-0 flex-1 items-center'>
          {/* ảnh tháp trái (ẩn khung hẹp) */}
          <div
            className='hidden h-[74%] @2xl:block'
            style={{ width: '31%', marginLeft: 20, overflow: 'hidden' }}
          >
            {content.menuImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                data-element-key='menuImageUrl'
                src={content.menuImageUrl}
                alt=''
                className={selectableClass(activeKey === 'menuImageUrl')}
                style={composeStyle(
                  { width: '100%', height: '100%', objectFit: 'cover' },
                  styleOf('menuImageUrl')
                )}
              />
            ) : null}
          </div>
          {/* links */}
          <nav
            className='flex flex-col'
            style={{
              gap: 'clamp(6px, 1.4cqi, 14px)',
              marginLeft: 'clamp(24px, 8cqi, 120px)',
            }}
          >
            {(content.links ?? []).map((l, i) => (
              <button
                key={l.target + i}
                type='button'
                onClick={() => goto(l.target)}
                className='q80-menu-link flex items-baseline text-left'
                style={{ gap: 'clamp(16px, 3cqi, 56px)', color: '#ffffff' }}
              >
                <span
                  style={{
                    fontFamily: Q80_FONT_SANS,
                    fontWeight: 500,
                    fontSize: 'clamp(9px, .85cqi, 12px)',
                    letterSpacing: '.1em',
                    opacity: 0.55,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontFamily: Q80_FONT_SERIF,
                    fontSize: 'clamp(26px, 3.4cqi, 50px)',
                    lineHeight: 1.1,
                  }}
                >
                  {l.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div
          className='flex w-full items-center justify-between'
          style={{ padding: '18px 24px' }}
        >
          <div className='flex items-center' style={{ gap: 26 }}>
            <a
              data-element-key='mainSiteLabel'
              href={content.mainSiteUrl || '#'}
              target='_blank'
              rel='noreferrer'
              className={selectableClass(activeKey === 'mainSiteLabel')}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SANS,
                  fontWeight: 500,
                  fontSize: 'clamp(9px, .85cqi, 12px)',
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                },
                styleOf('mainSiteLabel')
              )}
            >
              {content.mainSiteLabel}
            </a>
            <button
              type='button'
              onClick={() => setCreditsOpen(true)}
              style={{
                fontFamily: Q80_FONT_SANS,
                fontWeight: 500,
                fontSize: 'clamp(9px, .85cqi, 12px)',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: '#ffffff',
              }}
            >
              {content.creditsLabel}
            </button>
            <span
              style={{
                fontFamily: Q80_FONT_SANS,
                fontWeight: 500,
                fontSize: 'clamp(9px, .85cqi, 12px)',
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.75)',
              }}
            >
              {content.legalLabel}
            </span>
          </div>
          <a
            data-element-key='phone'
            href={`tel:${content.phone}`}
            className={selectableClass(activeKey === 'phone')}
            style={composeStyle(
              {
                fontFamily: Q80_FONT_SERIF,
                fontSize: 'clamp(16px, 1.8cqi, 26px)',
                color: '#ffffff',
              },
              styleOf('phone')
            )}
          >
            {content.phone}
          </a>
        </div>

        {/* credits panel */}
        <div
          className='absolute inset-0 overflow-y-auto'
          style={{
            background: '#ffffff',
            transition: 'transform .8s cubic-bezier(.7,0,.2,1)',
            transform: creditsOpen ? 'translateY(0)' : 'translateY(104%)',
            padding: 'clamp(20px, 4cqi, 56px)',
          }}
        >
          <div className='flex items-start justify-between'>
            <h3
              data-element-key='creditsTitle'
              className={selectableClass(activeKey === 'creditsTitle')}
              style={composeStyle(
                {
                  fontFamily: Q80_FONT_SERIF,
                  fontSize: 'clamp(22px, 2.6cqi, 38px)',
                  lineHeight: 1.2,
                  color: '#37342e',
                  whiteSpace: 'pre-line',
                  maxWidth: 640,
                },
                styleOf('creditsTitle')
              )}
            >
              {content.creditsTitle}
            </h3>
            <button
              type='button'
              aria-label='close credits'
              onClick={() => setCreditsOpen(false)}
              className='inline-flex items-center justify-center'
              style={{
                width: 34,
                height: 34,
                borderRadius: 3,
                border: '1px solid #7c726266',
                color: '#7c7262',
                fontSize: 14,
              }}
            >
              ✕
            </button>
          </div>
          <div
            className='grid @2xl:grid-cols-2'
            style={{
              gap: 'clamp(16px, 2.6cqi, 36px)',
              marginTop: 'clamp(18px, 3cqi, 40px)',
            }}
          >
            {(content.credits ?? []).map(c => (
              <div key={c.title}>
                <div
                  style={{
                    fontFamily: Q80_FONT_SANS,
                    fontWeight: 500,
                    fontSize: 12,
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color: '#7c7262',
                  }}
                >
                  {c.title}
                </div>
                <p
                  style={{
                    fontFamily: Q80_FONT_SANS,
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: '#4c4a45',
                    marginTop: 8,
                  }}
                >
                  {c.text}
                </p>
              </div>
            ))}
          </div>
          {content.legalText ? (
            <p
              style={{
                fontFamily: Q80_FONT_SANS,
                fontSize: 11,
                lineHeight: 1.6,
                color: '#8a857a',
                marginTop: 'clamp(18px, 3cqi, 40px)',
              }}
            >
              {content.legalText}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );

  return (
    <header
      style={blockBackgroundStyle(background)}
      className='q80-menu @container relative w-full'
    >
      <style>{CSS}</style>
      {isPublic && mounted ? (
        createPortal(
          <div
            className='q80-menu-fixed pointer-events-none'
            style={{ position: 'fixed', inset: 0, zIndex: 990 }}
          >
            {/* KHÔNG pointer-events-auto ở wrapper — chỉ nút bên trong nhận
                click, không thì portal che toàn viewport chặn mọi tương tác. */}
            <div className='pointer-events-none relative h-full w-full'>
              {chrome}
            </div>
          </div>,
          document.body
        )
      ) : (
        // editor/preview: dải chrome in-flow trên nền xanh trời để thấy chữ trắng
        <div
          className='relative w-full overflow-hidden'
          style={{
            background: 'linear-gradient(#7ba7cc, #cfdde9)',
            minHeight: open ? 'clamp(360px, 66cqi, 720px)' : undefined,
          }}
        >
          {chrome}
        </div>
      )}
    </header>
  );
}
