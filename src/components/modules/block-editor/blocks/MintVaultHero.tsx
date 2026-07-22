'use client';

/**
 * Data-block "Vault · Hero" (tách từ apps/mint2026 Hồi I — The Reveal).
 *
 * Compose ImageTrail (coin vẽ thành chữ "2026" khi chưa tương tác, rê chuột →
 * trail bám con trỏ) + overlay text. Overlay fade-in on-load qua useBlockMotion
 * (hero là section đầu, trong view khi mount).
 *
 * Canvas fork: ImageTrail tự tắt demo vĩnh viễn ngay pointermove đầu tiên và ảnh
 * trail do `document.createElement` sinh ngoài React (không select được) → trên
 * canvas thay bằng strip thumbnail tĩnh, mỗi ảnh là 1 element key. PreviewMode +
 * /p giữ nguyên composition prototype.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintVaultHeroContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { ImageTrail } from './ImageTrail';

interface Props {
  content: MintVaultHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

/**
 * Chuỗi vẽ bằng con trỏ ảo — CỐ ĐỊNH, không phải content.
 * GLYPHS trong ImageTrail chỉ có 0/2/6/M; mở ra CMS thì author gõ "2027" sẽ ra
 * "202" (ký tự lạ bị bỏ im lặng). Đây là năm của collection, không phải copy.
 */
const AUTO_DEMO_TEXT = '2026';

const GOLD = '#c9a96e';
const VAULT_BG = '#08070a';

// Tuyền inline: token phải nằm ở đây (KHÔNG phải Tailwind class) thì toolbar
// mới đè được color/fontSize. Class chỉ giữ structure.
const EYEBROW_BASE: React.CSSProperties = {
  color: GOLD,
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
};
const TITLE_BASE: React.CSSProperties = {
  fontFamily: 'var(--font-display), Georgia, serif',
  fontSize: 'clamp(40px, 9cqi, 128px)',
  fontWeight: 300,
  lineHeight: 0.95,
  letterSpacing: '-0.01em',
};
const DESC_BASE: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '14px',
  lineHeight: 1.625,
};
const HINT_BASE: React.CSSProperties = {
  color: GOLD,
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
};

/** Hint pill "mời di chuột" (fidelity apps/mint2026 VAULT_CSS).
 *  Prefix `mint-vault-` tránh đụng DOM chung. */
const VAULT_HERO_CSS = `
.mint-vault-hint-pill{animation:mvHintBob 1.5s ease-in-out infinite;will-change:transform;
  box-shadow:0 8px 30px rgba(201,169,110,0.18)}
.mint-vault-hint-text{animation:mvHintBlink 1.6s ease-in-out infinite}
.mint-vault-hint-cursor{animation:mvHintWiggle 2.4s ease-in-out infinite;transform-origin:center}
.mint-vault-hint-ring::after{content:'';position:absolute;inset:-2px;border-radius:9999px;
  border:1px solid rgba(201,169,110,0.6);animation:mvHintRing 2s ease-out infinite}
@keyframes mvHintBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes mvHintBlink{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes mvHintWiggle{0%,100%{transform:translate(0,0) rotate(0)}
  30%{transform:translate(7px,-5px) rotate(-10deg)}65%{transform:translate(-5px,6px) rotate(8deg)}}
@keyframes mvHintRing{0%{transform:scale(.85);opacity:.8}100%{transform:scale(1.6);opacity:0}}
@media(prefers-reduced-motion:reduce){
  .mint-vault-hint-pill,.mint-vault-hint-text,.mint-vault-hint-cursor,
  .mint-vault-hint-ring::after{animation:none}
}
`;

export function MintVaultHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const images = React.useMemo(() => content.images ?? [], [content.images]);

  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, () => {
    if (isCanvas) return;
    const root = rootRef.current;
    if (!root) return;
    const els = gsap.utils.toArray<HTMLElement>('.vault-hero-reveal', root);
    gsap.fromTo(
      els,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.2,
      }
    );
  }, [isCanvas]);

  const Glow = (
    <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(60cqw_60cqh_at_50%_42%,rgba(201,169,110,0.12),transparent_70%)]' />
  );

  const Eyebrow = (
    <p
      data-element-key='eyebrow'
      style={composeStyle(EYEBROW_BASE, styleOf('eyebrow'))}
      className={selectableClass(activeKey === 'eyebrow', 'vault-hero-reveal')}
    >
      {content.eyebrow}
    </p>
  );

  const Title = (
    <h1
      data-element-key='title'
      style={composeStyle(TITLE_BASE, styleOf('title'))}
      className={selectableClass(activeKey === 'title', 'vault-hero-reveal')}
    >
      {content.title}
    </h1>
  );

  const Description = (
    <p
      data-element-key='description'
      style={composeStyle(DESC_BASE, styleOf('description'))}
      className={selectableClass(
        activeKey === 'description',
        'vault-hero-reveal mt-6 max-w-md'
      )}
    >
      {content.description}
    </p>
  );

  const HintText = (
    <span
      data-element-key='hintText'
      style={composeStyle(HINT_BASE, styleOf('hintText'))}
      className={selectableClass(
        activeKey === 'hintText',
        'mint-vault-hint-text'
      )}
    >
      {content.hintText}
    </span>
  );

  // ── Canvas: layout sửa được, KHÔNG chạy ImageTrail ────────────────────────
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        style={
          blockBackgroundStyle(background) ?? { backgroundColor: VAULT_BG }
        }
        className='@container relative h-screen w-full overflow-hidden bg-[#08070a] text-white'
      >
        {Glow}
        <div className='absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pb-28 text-center'>
          {Eyebrow}
          {Title}
          {Description}
          <div className='mt-8 inline-flex items-center gap-2.5 rounded-full border border-[#c9a96e]/40 bg-[#c9a96e]/10 py-2.5 pr-5 pl-2.5 backdrop-blur-sm'>
            <span className='relative flex size-9 items-center justify-center rounded-full border border-[#c9a96e]/50 bg-[#08070a]/40'>
              <svg
                viewBox='0 0 24 24'
                className='size-4 fill-[#c9a96e]'
                aria-hidden
              >
                <path d='M5 3l15 9-6 1.5L11 20 5 3z' />
              </svg>
            </span>
            {HintText}
          </div>
        </div>

        {/* Ảnh trail: strip tĩnh để select/đổi từng ảnh (trail thật không select được). */}
        <div className='absolute inset-x-0 bottom-0 z-20 flex gap-2 overflow-x-auto bg-gradient-to-t from-[#08070a] to-transparent p-4'>
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${i}`}
              src={src}
              alt=''
              data-element-key={`images[${i}]`}
              style={composeStyle(
                { height: '72px', width: '72px', objectFit: 'cover' },
                styleOf(`images[${i}]`)
              )}
              className={selectableClass(
                activeKey === `images[${i}]`,
                'shrink-0 rounded'
              )}
            />
          ))}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: composition production ──────────────────────────────
  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='@container relative h-screen w-full overflow-hidden bg-[#08070a] text-white'
    >
      <style>{VAULT_HERO_CSS}</style>

      <div className='absolute inset-0'>
        <ImageTrail
          content={{
            images: content.images,
            autoDemo: true,
            autoDemoText: AUTO_DEMO_TEXT,
          }}
          background={{ color: VAULT_BG }}
          className='!h-full !min-h-screen !rounded-none'
        />
      </div>
      {Glow}

      {/* Overlay pointer-events-none TOÀN BỘ: ImageTrail nghe pointermove trên
          root của nó, node con bắt event sẽ làm trail chết ngay giữa màn hình. */}
      <div className='pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center'>
        {Eyebrow}
        {Title}
        {Description}
        <div className='mint-vault-hint-pill vault-hero-reveal mt-8 inline-flex items-center gap-2.5 rounded-full border border-[#c9a96e]/40 bg-[#c9a96e]/10 py-2.5 pr-5 pl-2.5 backdrop-blur-sm'>
          <span className='mint-vault-hint-ring relative flex size-9 items-center justify-center rounded-full border border-[#c9a96e]/50 bg-[#08070a]/40'>
            <svg
              viewBox='0 0 24 24'
              className='mint-vault-hint-cursor size-4 fill-[#c9a96e]'
              aria-hidden
            >
              <path d='M5 3l15 9-6 1.5L11 20 5 3z' />
            </svg>
          </span>
          {HintText}
        </div>
      </div>
    </section>
  );
}
