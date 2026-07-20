'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  CoolHunterHeroContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { resolvePnjHeroTitleLines } from './pnjHeroTitleLines';
import { useContainerMobile } from './useContainerMobile';

interface CoolHunterHeroProps {
  content: CoolHunterHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Cool Hunter Hero — port từ apps/cool-hunter Hero.tsx (+ Header logo gộp vào).
 *
 * Khung ảnh scrub từ 78%×75% (desktop) / 92%×78% (mobile) lên full stage.
 * Tiêu đề render 2 bản chồng khít nhau: bản đen nằm dưới trên nền trắng, bản
 * trắng nằm TRONG khung `overflow-hidden` → khung clip nó theo mép ảnh, nên chữ
 * đổi màu per-pixel đúng chỗ ảnh phủ qua (không nhoè đen trên ảnh).
 *
 * Khác apps: pin → sticky (host contract, docs/landing-motion-foundation.md §5),
 * viewport matchMedia → useContainerMobile, `w-screen h-svh` của stage bản trắng
 * → `100cqw/100cqh` để bám hộp block thay vì viewport.
 */

const FRAME_START_MOBILE = { width: '92%', height: '78%' };
const FRAME_START_DESKTOP = { width: '78%', height: '75%' };
const FRAME_END = { width: '100%', height: '100%' };

const DEFAULT_LOGO = '/cool-hunter/logo.png';
const DEFAULT_IMAGE = '/cool-hunter/hero.webp';

/**
 * `--font-display` (Fraunces) chỉ tồn tại trong apps/cool-hunter; host không
 * định nghĩa nên phải inline nguyên stack (precedent: MasteriseHomeInside).
 */
const TITLE_BASE_STYLE: React.CSSProperties = {
  position: 'absolute',
  margin: 0,
  fontFamily: "'Fraunces', 'Playfair Display', 'Times New Roman', serif",
  fontSize: 'clamp(1.65rem, 5.2cqi, 3.75rem)',
  fontWeight: 500,
  lineHeight: 1.1,
};

const STAGE_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
  backgroundColor: '#ffffff',
  // Cho phép bản tiêu đề trắng (nằm trong khung ảnh) đo theo hộp stage bằng
  // 100cqw/100cqh — thay cho `w-screen h-svh` bám viewport của apps.
  containerType: 'size',
};

const FRAME_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 10,
  overflow: 'hidden',
};

const LOGO_BAR_STYLE: React.CSSProperties = {
  position: 'absolute',
  insetInline: 0,
  top: 0,
  zIndex: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#ffffff',
};

export function CoolHunterHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CoolHunterHeroProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const { hasRoot } = useLandingMotion();
  const isMobile = useContainerMobile(rootRef);

  const [isCanvas, setIsCanvas] = React.useState(true);
  React.useLayoutEffect(() => {
    if (!hasRoot) {
      setIsCanvas(false);
      return;
    }
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, [hasRoot]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const titleLines = React.useMemo(
    () => resolvePnjHeroTitleLines(content),
    [content]
  );
  const logoUrl = content.logoUrl?.trim() || DEFAULT_LOGO;
  const logoAlt = content.logoAlt?.trim() || 'Cool Hunter';
  const imageUrl = content.imageUrl?.trim() || DEFAULT_IMAGE;
  const imageAlt = content.imageAlt?.trim() || '';

  const frameStart = isMobile ? FRAME_START_MOBILE : FRAME_START_DESKTOP;
  const titleAnchor: React.CSSProperties = isMobile
    ? { bottom: '4%', left: '6%' }
    : { bottom: '6%', left: '7%' };

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      const frame = frameRef.current;
      if (!root || !frame || isCanvas) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(frame, FRAME_END);
        return;
      }

      gsap.set(frame, frameStart);
      gsap.to(frame, {
        ...FRAME_END,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller,
          // Quãng scrub nằm ở chiều cao outer (155/170dvh) thay cho `+=55%/70%`
          // của apps, vì pin đã đổi sang sticky.
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });
    },
    [isCanvas, isMobile, titleLines.length]
  );

  /**
   * Hai bản tiêu đề phải nhận CÙNG style (font/size/weight/anchor) thì mới chồng
   * khít. Chỉ bản đen mang `data-element-key` — bản trắng là clone trang trí,
   * gắn key thứ hai cho cùng field sẽ phá selection trên canvas.
   */
  const renderTitle = (variant: 'black' | 'white') => {
    const isClone = variant === 'white';
    return (
      <h1
        aria-hidden={isClone || undefined}
        style={composeStyle(TITLE_BASE_STYLE, titleAnchor, {
          color: isClone ? '#ffffff' : '#000000',
        })}
      >
        {titleLines.map((line, i) => {
          const key = `titleLines[${i}]`;
          return (
            <span
              key={key}
              data-element-key={isClone ? undefined : key}
              className={
                isClone
                  ? undefined
                  : selectableClass(activeKey === key, 'block')
              }
              style={composeStyle(
                { display: 'block' },
                styleOf(key),
                // Override màu của bản đen không được kéo theo bản trắng, nếu
                // không hiệu ứng lật màu ở mép ảnh sẽ mất.
                isClone ? { color: '#ffffff' } : undefined
              )}
            >
              {line}
            </span>
          );
        })}
      </h1>
    );
  };

  const renderLogo = (extraStyle?: React.CSSProperties) => (
    <img
      src={logoUrl}
      alt={logoAlt}
      data-element-key='logoUrl'
      className={selectableClass(
        activeKey === 'logoUrl',
        'w-auto object-contain'
      )}
      style={composeStyle(
        { height: isMobile ? 32 : 40 },
        extraStyle,
        styleOf('logoUrl')
      )}
    />
  );

  // ── Editor canvas: layout phẳng, không sticky/scrub — mọi field đều bấm được ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('@container relative w-full bg-white', className)}
        style={composeStyle(
          { minHeight: 420 },
          blockBackgroundStyle(background)
        )}
      >
        <div className='flex w-full items-center justify-center bg-white p-3 @2xl:p-4'>
          {renderLogo()}
        </div>

        <div className='px-[6cqi] pb-[6cqi]'>
          <div
            className='relative w-full overflow-hidden'
            style={{ aspectRatio: '2 / 1' }}
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              data-element-key='imageUrl'
              className={selectableClass(
                activeKey === 'imageUrl',
                'h-full w-full object-cover'
              )}
              style={styleOf('imageUrl')}
            />
          </div>

          <h1
            style={composeStyle(TITLE_BASE_STYLE, {
              position: 'static',
              marginTop: '4cqi',
              color: '#000000',
            })}
          >
            {titleLines.map((line, i) => {
              const key = `titleLines[${i}]`;
              return (
                <span
                  key={key}
                  data-element-key={key}
                  className={selectableClass(activeKey === key, 'block')}
                  style={composeStyle({ display: 'block' }, styleOf(key))}
                >
                  {line}
                </span>
              );
            })}
          </h1>
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: layout production (sticky + scrub) ──
  return (
    <section
      ref={rootRef}
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          height: isMobile ? '155dvh' : '170dvh',
          backgroundColor: '#ffffff',
        },
        blockBackgroundStyle(background)
      )}
    >
      <div style={STAGE_STYLE}>
        {/* Logo bar nằm trong vùng sticky → không jump khi stage dính đỉnh */}
        <div
          style={composeStyle(LOGO_BAR_STYLE, { padding: isMobile ? 12 : 16 })}
        >
          {renderLogo()}
        </div>

        {/* Bản đen: hiện ở phần nền trắng ảnh chưa phủ tới */}
        {renderTitle('black')}

        <div ref={frameRef} style={composeStyle(FRAME_STYLE, frameStart)}>
          <img
            src={imageUrl}
            alt={imageAlt}
            data-element-key='imageUrl'
            className={selectableClass(
              activeKey === 'imageUrl',
              'h-full w-full object-cover'
            )}
            style={styleOf('imageUrl')}
          />
          {/* Stage cùng kích thước hộp sticky để bản trắng trùng khít vị trí bản
              đen; khung overflow-hidden clip nó theo mép ảnh. */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100cqw',
              height: '100cqh',
              pointerEvents: 'none',
            }}
          >
            {renderTitle('white')}
          </div>
        </div>
      </div>
    </section>
  );
}
