import * as React from 'react';

import { cn } from '@/lib/cn';
import { Copy } from 'lucide-react';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerYumeHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerYumeHeroProps {
  content: FramerYumeHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Hero - Yume (framer-native). Port từ `src/blocks/framer-yume-hero` sang
 * renderer native: mỗi element (firstName/lastName/avatarUrl/email/bio) là 1
 * layer chọn + sửa inline được (`data-element-key` + `selectableClass`).
 *
 * Khác bản legacy: dùng container-query (`cqi` + flex-wrap) thay vì viewport
 * media-query (rule canvas cấm `md:`/`lg:`…); reveal đổi sang mount-animation
 * (`animate-soft-rise` + delay) để chạy ngay trong editor không cần scroll.
 */
const TITLE_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontWeight: 600,
  lineHeight: '1em',
  letterSpacing: '-0.09em',
  margin: 0,
  display: 'block',
  whiteSpace: 'nowrap',
};

const EMAIL_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  margin: 0,
};

const BIO_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontWeight: 500,
  lineHeight: '1.1em',
  margin: 0,
  whiteSpace: 'pre-wrap',
  textIndent: '1.5em',
  textAlign: 'justify',
  display: 'flex',
};

export function FramerYumeHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerYumeHeroProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <div className={cn('@container', className)}>
      <div
        style={blockBackgroundStyle(background)}
        className='flex h-full w-full justify-center overflow-hidden rounded-md bg-white px-5 pt-16.75 pb-10 text-black @3xl:h-screen @3xl:px-7.5 @3xl:pt-14.75 @3xl:pb-20 @4xl:px-20 @4xl:pt-11.75'
      >
        <div className='flex w-full max-w-[1600px] flex-col gap-8.5 @3xl:justify-between @4xl:gap-0'>
          {/* Profile Section: tên + avatar */}
          <div className='flex w-full flex-col items-start gap-7.5 @3xl:flex-row @3xl:flex-wrap @3xl:gap-2.5'>
            <div className='flex min-w-[min(100%,420px)] flex-[1_1_0] flex-col'>
              <div className='overflow-hidden'>
                <h1
                  data-element-key='firstName'
                  style={composeStyle(TITLE_STYLE, styleOf('firstName'))}
                  className={selectableClass(
                    activeKey === 'firstName',
                    'animate-text-reveal text-[76px] @3xl:text-[116px] @4xl:text-[174px]'
                  )}
                >
                  {content.firstName}
                </h1>
              </div>
              <div className='overflow-hidden'>
                <h1
                  data-element-key='lastName'
                  style={composeStyle(TITLE_STYLE, styleOf('lastName'))}
                  className={selectableClass(
                    activeKey === 'lastName',
                    'animate-text-reveal text-[76px] [animation-delay:180ms] @3xl:text-[116px] @4xl:text-[174px]'
                  )}
                >
                  {content.lastName}
                </h1>
              </div>
            </div>

            <div
              data-element-key='avatarUrl'
              style={composeStyle(
                content.avatarUrl
                  ? {
                      backgroundImage: `url("${content.avatarUrl.replace(/"/g, '%22')}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : { backgroundColor: '#e5e5e5' },
                styleOf('avatarUrl')
              )}
              className={selectableClass(
                activeKey === 'avatarUrl',
                'animate-scale-in-hero order-first h-27.5 w-27.5 shrink-0 self-start rounded-full [animation-delay:200ms] @3xl:order-0 @3xl:size-27.5 @4xl:size-42'
              )}
              aria-label='Avatar'
            />
          </div>

          {/* Bio Section: email + bio animate cùng nhau như Framer gốc */}
          <div className='animate-soft-rise-hero flex w-full flex-col gap-8.5 [animation-delay:320ms] @3xl:flex-row @3xl:flex-wrap @3xl:items-start @3xl:justify-between @3xl:gap-0'>
            <span
              data-element-key='email'
              style={composeStyle(EMAIL_STYLE, styleOf('email'))}
              className={selectableClass(
                activeKey === 'email',
                'inline-flex items-center gap-3'
              )}
            >
              {content.email}
              <button
                type='button'
                onClick={() =>
                  navigator.clipboard.writeText(content.email ?? '')
                }
                className='shrink-0 cursor-pointer'
                aria-label='Copy email'
              >
                <Copy size={18} />
              </button>
            </span>
            <p
              data-element-key='bio'
              style={composeStyle(BIO_STYLE, styleOf('bio'))}
              className={selectableClass(
                activeKey === 'bio',
                'max-w-full text-[28px] tracking-[-0.075em] @3xl:max-w-83.75 @3xl:text-[32px] @4xl:max-w-160.75 @4xl:flex-[1_1_320px] @4xl:text-[40px] @4xl:tracking-[-0.06em]'
              )}
            >
              {content.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
