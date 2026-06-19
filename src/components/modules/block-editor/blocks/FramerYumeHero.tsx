import * as React from 'react';

import { cn } from '@/lib/cn';

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
  fontSize: 'clamp(40px, 13cqi, 174px)',
  fontWeight: 600,
  lineHeight: '1em',
  letterSpacing: '-0.09em',
  margin: 0,
  display: 'block',
  whiteSpace: 'nowrap',
};

const EMAIL_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(13px, 1.4cqi, 16px)',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  margin: 0,
};

const BIO_STYLE: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(15px, 2.5cqi, 40px)',
  fontWeight: 500,
  lineHeight: '1.25em',
  letterSpacing: '-0.04em',
  margin: 0,
  whiteSpace: 'pre-wrap',
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
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container flex w-full justify-center overflow-hidden rounded-md bg-white px-[clamp(20px,5cqi,80px)] py-[clamp(48px,9cqi,120px)] text-black duration-700 ease-out',
        className
      )}
    >
      <div className='flex w-full max-w-[1600px] flex-col justify-between gap-[clamp(28px,6cqi,80px)]'>
        {/* Top row: 2 dòng tên + avatar (wrap khi container hẹp) */}
        <div className='flex w-full flex-wrap items-start gap-[clamp(16px,2cqi,32px)]'>
          <div className='flex min-w-[min(100%,420px)] flex-[1_1_0] flex-col gap-2.5'>
            <h1
              data-element-key='firstName'
              style={composeStyle(TITLE_STYLE, styleOf('firstName'))}
              className={selectableClass(
                activeKey === 'firstName',
                'animate-soft-rise'
              )}
            >
              {content.firstName}
            </h1>
            <h1
              data-element-key='lastName'
              style={composeStyle(TITLE_STYLE, styleOf('lastName'))}
              className={selectableClass(
                activeKey === 'lastName',
                'animate-soft-rise [animation-delay:80ms]'
              )}
            >
              {content.lastName}
            </h1>
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
              'animate-soft-rise size-[clamp(80px,11cqi,168px)] shrink-0 self-start rounded-full [animation-delay:160ms]'
            )}
            aria-label='Avatar'
          />
        </div>

        {/* Bottom row: email + bio */}
        <div className='flex w-full flex-wrap items-start justify-between gap-[clamp(16px,3cqi,40px)]'>
          <span
            data-element-key='email'
            style={composeStyle(EMAIL_STYLE, styleOf('email'))}
            className={selectableClass(
              activeKey === 'email',
              'animate-soft-rise [animation-delay:240ms]'
            )}
          >
            {content.email}
          </span>
          <p
            data-element-key='bio'
            style={composeStyle(BIO_STYLE, styleOf('bio'))}
            className={selectableClass(
              activeKey === 'bio',
              'animate-soft-rise max-w-[min(100%,640px)] flex-[1_1_320px] [animation-delay:280ms]'
            )}
          >
            {content.bio}
          </p>
        </div>
      </div>
    </div>
  );
}
