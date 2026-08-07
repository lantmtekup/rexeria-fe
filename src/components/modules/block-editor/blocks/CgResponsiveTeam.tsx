'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  CgResponsiveTeamContent,
  CgResponsiveTeamMember,
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
import { CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS } from './_registry/defs/cgResponsiveTeam';
import { useLandingMotion } from '../motion/LandingMotion';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface CgResponsiveTeamProps {
  content: CgResponsiveTeamContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const CLIP_HIDDEN = 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';
const CLIP_REVEALED = 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)';

const BG_CYCLE = ['#ffffff', '#c4bca9', '#ffffff', '#8e908a'] as const;

const DISPLAY_FONT =
  "'Neue Montreal', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const resolveMembers = (
  raw: CgResponsiveTeamMember[] | undefined
): CgResponsiveTeamMember[] => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS.map(m => ({ ...m }));
  }
  return raw.map((member, i) => {
    const fallback =
      CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS[
        i % CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS.length
      ] ?? CG_RESPONSIVE_TEAM_DEFAULT_MEMBERS[0];
    return {
      name: member.name?.trim() || fallback.name || `Member ${i + 1}`,
      role: member.role?.trim() || fallback.role || '',
      imageUrl: member.imageUrl?.trim() || fallback.imageUrl || '',
      imageAlt:
        member.imageAlt?.trim() || member.name?.trim() || fallback.imageAlt,
      bgColor:
        member.bgColor?.trim() ||
        fallback.bgColor ||
        BG_CYCLE[i % BG_CYCLE.length],
    };
  });
};

const marqueeText = (name: string) => `${name} ${name} ${name}`;

/**
 * Responsive Team — port CodeGrid cg-responsive-team-page (107).
 * Clip-path marquee + portrait stack; click trái/phải để prev/next.
 * Bỏ nav góc trên. Canvas: grid phẳng. Preview + /p: composition + GSAP gốc.
 */
export function CgResponsiveTeam({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CgResponsiveTeamProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);
  const animating = React.useRef(false);
  const currentIndexRef = React.useRef(0);
  const pointerXRef = React.useRef(0);

  useLandingMotion();
  const isMobile = useContainerMobile(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [cursorDir, setCursorDir] = React.useState<'left' | 'right' | 'none'>(
    'none'
  );

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const members = React.useMemo(
    () => resolveMembers(content.members),
    [content.members]
  );

  React.useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  React.useEffect(() => {
    if (currentIndex >= members.length) setCurrentIndex(0);
  }, [members.length, currentIndex]);

  const updateCursorDir = React.useCallback(
    (clientX: number) => {
      const root = rootRef.current;
      if (!root || members.length < 2) {
        setCursorDir('none');
        return;
      }
      const rect = root.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      const idx = currentIndexRef.current;
      if (clientX > mid) {
        setCursorDir(idx < members.length - 1 ? 'right' : 'none');
      } else {
        setCursorDir(idx > 0 ? 'left' : 'none');
      }
    },
    [members.length]
  );

  const animateSlide = React.useCallback((index: number, reveal: boolean) => {
    const root = rootRef.current;
    if (!root) return;
    const marquee = root.querySelector<HTMLElement>(
      `[data-crt-marquee="${index}"]`
    );
    const img = root.querySelector<HTMLElement>(`[data-crt-img="${index}"]`);
    const clip = reveal ? CLIP_REVEALED : CLIP_HIDDEN;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduce) {
      if (marquee) gsap.set(marquee, { clipPath: clip });
      if (img) gsap.set(img, { clipPath: clip });
      return;
    }

    if (marquee) {
      gsap.to(marquee, {
        clipPath: clip,
        duration: 1,
        ease: 'power4.out',
        delay: 0.3,
      });
    }
    if (img) {
      gsap.to(img, {
        clipPath: clip,
        duration: 1,
        ease: 'power4.out',
      });
    }
  }, []);

  const handleAdvance = React.useCallback(
    (dir: 'left' | 'right') => {
      if (isCanvas || animating.current || members.length < 2) return;
      const idx = currentIndexRef.current;

      if (dir === 'right') {
        if (idx >= members.length - 1) return;
        animating.current = true;
        animateSlide(idx + 1, true);
        const next = idx + 1;
        setCurrentIndex(next);
        window.setTimeout(() => {
          animating.current = false;
          updateCursorDir(pointerXRef.current);
        }, 1100);
        return;
      }

      if (idx <= 0) return;
      animating.current = true;
      animateSlide(idx, false);
      const next = idx - 1;
      setCurrentIndex(next);
      window.setTimeout(() => {
        animating.current = false;
        updateCursorDir(pointerXRef.current);
      }, 1100);
    },
    [animateSlide, isCanvas, members.length, updateCursorDir]
  );

  const handlePointerMove = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isCanvas) return;
      const root = rootRef.current;
      const cursor = cursorRef.current;
      if (!root || !cursor) return;

      const rect = root.getBoundingClientRect();
      pointerXRef.current = e.clientX;
      updateCursorDir(e.clientX);

      const x = e.clientX - rect.left - cursor.offsetWidth / 2;
      const y = e.clientY - rect.top - cursor.offsetHeight / 2;

      gsap.to(cursor, {
        x,
        y,
        duration: 1,
        ease: 'power3.out',
      });
    },
    [isCanvas, updateCursorDir]
  );

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (isCanvas) return;
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      handleAdvance(e.clientX > mid ? 'right' : 'left');
    },
    [handleAdvance, isCanvas]
  );

  // Reset clip states when members list identity changes (preview + /p).
  React.useLayoutEffect(() => {
    if (isCanvas) return;
    const root = rootRef.current;
    if (!root) return;

    members.forEach((_, i) => {
      const marquee = root.querySelector<HTMLElement>(
        `[data-crt-marquee="${i}"]`
      );
      const img = root.querySelector<HTMLElement>(`[data-crt-img="${i}"]`);
      const clip = i <= currentIndexRef.current ? CLIP_REVEALED : CLIP_HIDDEN;
      if (marquee) gsap.set(marquee, { clipPath: clip });
      if (img) gsap.set(img, { clipPath: clip });
    });

    return () => {
      gsap.killTweensOf(
        root.querySelectorAll('[data-crt-marquee], [data-crt-img]')
      );
    };
  }, [isCanvas, members]);

  const active = members[currentIndex] ?? members[0];
  const nameKey = `members[${currentIndex}].name`;
  const roleKey = `members[${currentIndex}].role`;
  const imgH = isMobile ? 'min(62cqi, 500px)' : 'min(55cqi, 600px)';
  const modalW = isMobile ? 'min(88cqi, 400px)' : 'min(42cqi, 500px)';

  // ── Editor canvas: flat grid ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('@container relative w-full', className)}
        style={composeStyle(
          { backgroundColor: '#f5f4f0', minHeight: 320, padding: '1.5rem' },
          blockBackgroundStyle(background)
        )}
      >
        <div className='grid grid-cols-1 gap-6 @2xl:grid-cols-2'>
          {members.map((m, i) => {
            const nKey = `members[${i}].name`;
            const rKey = `members[${i}].role`;
            const iKey = `members[${i}].imageUrl`;
            return (
              <div
                key={`${nKey}-${iKey}`}
                className='relative flex flex-col gap-3 overflow-hidden'
                style={{
                  backgroundColor: m.bgColor || BG_CYCLE[i % BG_CYCLE.length],
                  padding: '1rem',
                }}
              >
                <div
                  className='relative overflow-hidden'
                  style={{ height: 220, width: '100%' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.imageUrl}
                    alt={m.imageAlt || m.name}
                    data-element-key={iKey}
                    className={selectableClass(
                      activeKey === iKey,
                      'h-full w-full object-cover'
                    )}
                    style={composeStyle({ objectFit: 'cover' }, styleOf(iKey))}
                    draggable={false}
                  />
                </div>
                <p
                  data-element-key={nKey}
                  className={selectableClass(activeKey === nKey)}
                  style={composeStyle(
                    {
                      margin: 0,
                      fontFamily: DISPLAY_FONT,
                      fontSize: 'clamp(1.1rem, 3cqi, 1.5rem)',
                      fontWeight: 400,
                      color: '#111',
                      lineHeight: 1.2,
                    },
                    styleOf(nKey)
                  )}
                >
                  {m.name}
                </p>
                <p
                  data-element-key={rKey}
                  className={selectableClass(activeKey === rKey)}
                  style={composeStyle(
                    {
                      margin: 0,
                      fontFamily: DISPLAY_FONT,
                      fontSize: 'clamp(0.85rem, 2cqi, 1rem)',
                      fontWeight: 400,
                      color: '#444',
                      lineHeight: 1.3,
                    },
                    styleOf(rKey)
                  )}
                >
                  {m.role}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p ──
  return (
    <section
      ref={rootRef}
      role='button'
      tabIndex={0}
      aria-label='Chuyển thành viên team — click nửa trái/phải'
      onClick={handleClick}
      onMouseMove={handlePointerMove}
      onKeyDown={e => {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          handleAdvance('right');
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleAdvance('left');
        }
      }}
      className={cn('@container relative w-full overflow-hidden', className)}
      style={composeStyle(
        {
          backgroundColor: '#f5f4f0',
          minHeight: isMobile ? 'min(120cqi, 720px)' : 'min(100cqi, 900px)',
          height: isMobile ? 'min(120cqi, 720px)' : 'min(100cqi, 900px)',
          cursor: 'none',
        },
        blockBackgroundStyle(background)
      )}
    >
      <style>{`
        @keyframes crt-marquee {
          0% { transform: translate(0%, -50%); }
          50% { transform: translate(-5%, -50%); }
          50.5% { transform: translate(-5%, -50%); }
          100% { transform: translate(0%, -50%); }
        }
      `}</style>

      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        {members.map((m, i) => {
          const nKey = `members[${i}].name`;
          return (
            <div
              key={`marquee-${i}`}
              data-crt-marquee={i}
              className='absolute inset-0 overflow-hidden'
              style={{
                backgroundColor: m.bgColor || BG_CYCLE[i % BG_CYCLE.length],
                clipPath: i === 0 ? CLIP_REVEALED : CLIP_HIDDEN,
              }}
            >
              <h1
                data-element-key={nKey}
                className={selectableClass(activeKey === nKey)}
                style={composeStyle(
                  {
                    position: 'absolute',
                    top: '50%',
                    left: '-100%',
                    margin: 0,
                    width: '100%',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 400,
                    fontSize: isMobile
                      ? 'clamp(48px, 22cqi, 120px)'
                      : 'clamp(80px, 18cqi, 240px)',
                    color: '#111',
                    animation: 'crt-marquee 10s linear infinite',
                    pointerEvents: 'none',
                  },
                  styleOf(nKey)
                )}
              >
                {marqueeText(m.name)}
              </h1>
            </div>
          );
        })}
      </div>

      <div
        className='pointer-events-none absolute top-1/2 left-1/2 z-1 -translate-x-1/2 -translate-y-1/2'
        style={{ width: modalW }}
      >
        <div className='relative w-full' style={{ height: imgH }}>
          {members.map((m, i) => {
            const iKey = `members[${i}].imageUrl`;
            return (
              <div
                key={`img-${i}`}
                data-crt-img={i}
                className='absolute inset-0'
                style={{
                  clipPath: i === 0 ? CLIP_REVEALED : CLIP_HIDDEN,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.imageUrl}
                  alt={m.imageAlt || m.name}
                  data-element-key={iKey}
                  className={selectableClass(
                    activeKey === iKey,
                    'h-full w-full object-cover'
                  )}
                  style={composeStyle(
                    { objectFit: 'cover', width: '100%', height: '100%' },
                    styleOf(iKey)
                  )}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 24 }}>
          <p
            data-element-key={nameKey}
            className={selectableClass(activeKey === nameKey)}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontSize: isMobile
                  ? 'clamp(1rem, 3.5cqi, 1.25rem)'
                  : 'clamp(1.1rem, 2cqi, 1.35rem)',
                fontWeight: 400,
                color: '#111',
                lineHeight: 1.3,
              },
              styleOf(nameKey)
            )}
          >
            {active?.name}
          </p>
          <p
            data-element-key={roleKey}
            className={selectableClass(activeKey === roleKey)}
            style={composeStyle(
              {
                margin: '5px 0 0',
                fontFamily: DISPLAY_FONT,
                fontSize: isMobile
                  ? 'clamp(0.85rem, 3cqi, 1rem)'
                  : 'clamp(0.9rem, 1.5cqi, 1.05rem)',
                fontWeight: 400,
                color: '#333',
                lineHeight: 1.3,
              },
              styleOf(roleKey)
            )}
          >
            {active?.role}
          </p>
        </div>
      </div>

      <div
        ref={cursorRef}
        aria-hidden
        className='pointer-events-none absolute top-0 left-0 z-10'
        style={{
          fontSize: 30,
          lineHeight: 1,
          color: '#111',
          opacity: cursorDir === 'none' ? 0 : 1,
          willChange: 'transform',
        }}
      >
        {cursorDir === 'right' ? (
          <svg width='28' height='28' viewBox='0 0 256 256' fill='currentColor'>
            <path d='M221.66 133.66l-72 72a8 8 0 01-11.32-11.32L196.69 136H40a8 8 0 010-16h156.69l-58.35-58.34a8 8 0 0111.32-11.32l72 72a8 8 0 010 11.32z' />
          </svg>
        ) : (
          <svg width='28' height='28' viewBox='0 0 256 256' fill='currentColor'>
            <path d='M224 128a8 8 0 01-8 8H59.31l58.35 58.34a8 8 0 01-11.32 11.32l-72-72a8 8 0 010-11.32l72-72a8 8 0 0111.32 11.32L59.31 120H216a8 8 0 018 8z' />
          </svg>
        )}
      </div>
    </section>
  );
}
