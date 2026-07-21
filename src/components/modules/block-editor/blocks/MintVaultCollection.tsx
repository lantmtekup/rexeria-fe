'use client';

/**
 * Data-block "Vault · Collection" (tách từ apps/mint2026 — Hồi II, cuộn ngang).
 *
 * Sticky tall section: track coin cuộn ngang theo scroll; card scale/opacity/tilt
 * theo khoảng cách tâm viewport; gloss sweep + spotlight bám card giữa; panel info
 * + counter; click → modal chi tiết. RAF đọc getBoundingClientRect (scroller-agnostic:
 * chạy đúng cả /p lẫn PreviewMode). Block phức tạp → useLandingMotion + cleanup.
 *
 * 3 mặt render:
 *  - Editor canvas (isCanvas)  → lưới phẳng, hiện & sửa được MỌI coin (không pin/scroll).
 *  - PreviewMode Play + /p      → layout production (pin + cuộn ngang + tilt + gloss).
 *  - Container mobile           → fallback danh sách dọc (không pin).
 */
import * as React from 'react';
import { createPortal } from 'react-dom';

import { useLandingMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintVaultCoin,
  MintVaultCollectionContent,
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

interface Props {
  content: MintVaultCollectionContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

// ── Inline design tokens (đè được từ toolbar qua styleOf) ─────────────────
const EYEBROW_BASE: React.CSSProperties = {
  color: '#c9a96e',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
};
const SUBLABEL_BASE: React.CSSProperties = {
  color: 'rgba(255,255,255,0.4)',
  fontSize: '12px',
};
const COIN_NAME_BASE: React.CSSProperties = {
  fontFamily: 'var(--font-display, Georgia), serif',
  fontWeight: 300,
  lineHeight: 1.15,
};
const COIN_PRICE_BASE: React.CSSProperties = {
  color: '#c9a96e',
  fontWeight: 600,
};
const PILL_BASE: React.CSSProperties = {
  color: '#c9a96e',
  fontSize: '10px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
};

/** Gloss sweep + floaty (fidelity apps/mint2026). Prefix `mint-vault-` tránh đụng DOM chung. */
const VAULT_COLLECTION_CSS = `
.mint-vault-gloss{position:absolute;inset:0;border-radius:9999px;pointer-events:none;
  background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,0.45) 50%,transparent 65%);
  mix-blend-mode:screen;opacity:0;transform:translateX(-120%)}
.mint-vault-inner.mint-vault-live .mint-vault-gloss{opacity:1;animation:mvGloss 2.6s ease-in-out infinite}
@keyframes mvGloss{0%{transform:translateX(-120%)}55%,100%{transform:translateX(120%)}}
img.mint-vault-live{animation:mvFloaty 4s ease-in-out infinite}
@keyframes mvFloaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@media(prefers-reduced-motion:reduce){
  .mint-vault-inner.mint-vault-live .mint-vault-gloss,img.mint-vault-live{animation:none}
}
`;

function CoinModal({
  coin,
  onClose,
}: {
  coin: MintVaultCoin | null;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!coin) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [coin, onClose]);
  if (!coin || typeof document === 'undefined') return null;
  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-label={coin.name}
      onClick={onClose}
      className='@container fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm'
    >
      <div
        onClick={e => e.stopPropagation()}
        className='relative grid w-full max-w-2xl grid-cols-1 overflow-hidden rounded-2xl bg-[#0f0d0a] text-white shadow-2xl @3xl:grid-cols-2'
      >
        <div className='flex aspect-square items-center justify-center bg-black/30 p-6'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coin.image}
            alt={coin.name}
            className='mint-vault-live max-h-full max-w-full object-contain'
          />
        </div>
        <div className='flex flex-col justify-center p-8'>
          <span className='mb-2 text-[10px] tracking-[0.2em] text-[#c9a96e] uppercase'>
            {coin.metal}
            {coin.weight ? ` · ${coin.weight}` : ''}
          </span>
          <h3 style={COIN_NAME_BASE} className='text-2xl leading-tight'>
            {coin.name}
          </h3>
          <p style={COIN_PRICE_BASE} className='mt-2 text-lg'>
            {coin.price}
          </p>
          {coin.url && coin.url !== '#' && (
            <a
              href={coin.url}
              target='_blank'
              rel='noopener noreferrer'
              className='mt-5 inline-block rounded-full bg-[#c9a96e] px-5 py-2 text-xs font-semibold text-[#08070a] uppercase'
            >
              View on mint.ca →
            </a>
          )}
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label='Close'
          className='absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/25'
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
}

export function MintVaultCollection({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const spotRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const pointer = React.useRef({ x: 0, y: 0 });
  const isMobile = useContainerMobile(rootRef);
  const { scroller, requestRefresh } = useLandingMotion();
  const coins = Array.isArray(content.coins) ? content.coins : [];
  const [active, setActive] = React.useState(0);
  const [selected, setSelected] = React.useState<MintVaultCoin | null>(null);

  // Canvas editor (author) vs PreviewMode/​/p (production).
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => {
    // Không pin/cuộn khi đang author (canvas) hoặc mobile (danh sách dọc).
    if (isCanvas || isMobile) return;
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onMove);

    let raf = 0;
    const tick = () => {
      const vw = window.innerWidth;
      const rect = root.getBoundingClientRect();
      const dist = root.offsetHeight - window.innerHeight;
      const p = dist > 0 ? Math.min(1, Math.max(0, -rect.top / dist)) : 0;
      const maxX = Math.max(0, track.scrollWidth - vw);
      track.style.transform = `translate3d(${-p * maxX}px,0,0)`;

      let best = 0;
      let bestD = Infinity;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - vw / 2) / (vw / 2);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
        const scale = reduce ? 1 : Math.max(0.55, 1.16 - d * 0.62);
        el.style.opacity = String(Math.max(0.25, 1 - d * 0.7));
        el.style.zIndex = String(1000 - Math.round(d * 1000));
        const inner = el.firstElementChild as HTMLElement | null;
        if (inner) {
          const baseTilt = reduce ? 0 : ((c - vw / 2) / vw) * 16;
          const mt = d < 0.25 && !reduce ? pointer.current : { x: 0, y: 0 };
          inner.style.transform = `scale(${scale}) rotateY(${baseTilt + mt.x * 10}deg) rotateX(${-mt.y * 8}deg)`;
          // Card giữa → gloss sweep (fidelity apps).
          inner.classList.toggle('mint-vault-live', d < 0.18 && !reduce);
        }
      });
      setActive(best);
      const el = cardRefs.current[best];
      if (spotRef.current && el) {
        const r = el.getBoundingClientRect();
        spotRef.current.style.setProperty('--sx', `${r.left + r.width / 2}px`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    requestRefresh();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, [isCanvas, isMobile, scroller, requestRefresh, coins.length]);

  const activeCoin = coins[active];

  // Eyebrow + subLabel — dùng chung 3 mặt render.
  const eyebrowNode = (
    <p
      data-element-key='eyebrow'
      style={composeStyle(EYEBROW_BASE, styleOf('eyebrow'))}
      className={selectableClass(activeKey === 'eyebrow')}
    >
      {content.eyebrow}
    </p>
  );
  const subLabelNode = content.subLabel ? (
    <p
      data-element-key='subLabel'
      style={composeStyle(SUBLABEL_BASE, styleOf('subLabel'))}
      className={selectableClass(activeKey === 'subLabel', 'mt-1')}
    >
      {content.subLabel}
    </p>
  ) : null;

  // ── Editor canvas: lưới phẳng, sửa được mọi coin ─────────────────────────
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        style={composeStyle(
          { minHeight: 'auto' },
          blockBackgroundStyle(background)
        )}
        className='@container w-full bg-[#08070a] px-6 py-16 text-white'
      >
        {eyebrowNode}
        {subLabelNode}
        <div
          data-element-key='coins'
          className='mt-10 grid grid-cols-2 gap-8 @2xl:grid-cols-3 @4xl:grid-cols-4'
        >
          {coins.map((coin, i) => (
            <div
              key={coin.key}
              className='flex flex-col items-center text-center'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coin.image}
                alt={coin.name}
                data-element-key={`coins[${i}].image`}
                style={composeStyle(
                  { height: '180px', width: 'auto', objectFit: 'contain' },
                  styleOf(`coins[${i}].image`)
                )}
                className={selectableClass(
                  activeKey === `coins[${i}].image`,
                  'drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]'
                )}
                loading='lazy'
              />
              {/* Metal & weight — 2 node keyed riêng (1 layer ↔ 1 DOM node),
                  không gộp text để selection/inline-edit bám đúng field. */}
              <span className='mt-3 inline-flex items-center gap-1.5'>
                <span
                  data-element-key={`coins[${i}].metal`}
                  style={composeStyle(
                    PILL_BASE,
                    { minWidth: '1ch', display: 'inline-block' },
                    styleOf(`coins[${i}].metal`)
                  )}
                  className={selectableClass(activeKey === `coins[${i}].metal`)}
                >
                  {coin.metal}
                </span>
                <span aria-hidden='true' style={PILL_BASE}>
                  ·
                </span>
                <span
                  data-element-key={`coins[${i}].weight`}
                  style={composeStyle(
                    PILL_BASE,
                    { minWidth: '2ch', display: 'inline-block' },
                    styleOf(`coins[${i}].weight`)
                  )}
                  className={selectableClass(
                    activeKey === `coins[${i}].weight`
                  )}
                >
                  {coin.weight}
                </span>
              </span>
              <h3
                data-element-key={`coins[${i}].name`}
                style={composeStyle(
                  COIN_NAME_BASE,
                  { fontSize: '1.05rem' },
                  styleOf(`coins[${i}].name`)
                )}
                className={selectableClass(
                  activeKey === `coins[${i}].name`,
                  'mt-2 max-w-[16rem]'
                )}
              >
                {coin.name}
              </h3>
              <p
                data-element-key={`coins[${i}].price`}
                style={composeStyle(
                  COIN_PRICE_BASE,
                  { fontSize: '1rem' },
                  styleOf(`coins[${i}].price`)
                )}
                className={selectableClass(
                  activeKey === `coins[${i}].price`,
                  'mt-1'
                )}
              >
                {coin.price}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Container mobile: danh sách dọc (không pin) ─────────────────────────
  if (isMobile) {
    return (
      <section
        ref={rootRef}
        style={blockBackgroundStyle(background)}
        className='@container w-full bg-[#08070a] px-6 py-20 text-white'
      >
        {eyebrowNode}
        {subLabelNode}
        <div data-element-key='coins' className='mt-8 flex flex-col gap-10'>
          {coins.map(coin => (
            <button
              key={coin.key}
              type='button'
              onClick={() => setSelected(coin)}
              className='flex flex-col items-center text-center'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coin.image}
                alt={coin.name}
                className='h-56 w-auto object-contain'
                loading='lazy'
              />
              <h3 style={COIN_NAME_BASE} className='mt-4 max-w-xs text-lg'>
                {coin.name}
              </h3>
              <p style={COIN_PRICE_BASE} className='mt-1 text-base'>
                {coin.price}
              </p>
            </button>
          ))}
        </div>
        <CoinModal coin={selected} onClose={() => setSelected(null)} />
      </section>
    );
  }

  // ── Production (PreviewMode Play + /p): pin + cuộn ngang ─────────────────
  return (
    <section
      ref={rootRef}
      style={{
        height: `${coins.length * 48 + 40}vh`,
        ...blockBackgroundStyle(background),
      }}
      className='@container relative w-full bg-[#08070a] text-white'
    >
      <style>{VAULT_COLLECTION_CSS}</style>
      <div className='sticky top-0 h-screen overflow-hidden'>
        {/* Nhãn hồi — gập vào panel để giữ full-screen liền mạch. */}
        <div className='absolute top-20 left-6 z-30 @2xl:left-10'>
          {eyebrowNode}
          {subLabelNode}
        </div>

        <div
          ref={spotRef}
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(40vw 60vh at var(--sx,50%) 46%, rgba(201,169,110,0.14), transparent 70%)',
          }}
        />

        <div
          ref={trackRef}
          data-element-key='coins'
          className='flex h-full items-center pb-[26vh] will-change-transform'
          style={{ paddingInline: '41.5vw', gap: '6vw' }}
        >
          {coins.map((coin, i) => (
            <button
              key={coin.key}
              ref={el => {
                cardRefs.current[i] = el;
              }}
              type='button'
              onClick={() => setSelected(coin)}
              className='relative shrink-0'
              style={{ width: '17vw', perspective: '1000px' }}
            >
              <div className='mint-vault-inner relative flex h-[40vh] items-center justify-center will-change-transform'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coin.image}
                  alt={coin.name}
                  className='max-h-full max-w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]'
                  loading='lazy'
                />
                <span className='mint-vault-gloss' />
              </div>
            </button>
          ))}
        </div>

        {activeCoin && (
          <div className='pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center bg-gradient-to-t from-[#08070a] via-[#08070a]/85 to-transparent px-6 pt-20 pb-12 text-center'>
            <span
              style={PILL_BASE}
              className='mb-2 rounded-full border border-[#c9a96e]/40 px-3 py-1'
            >
              {activeCoin.metal}
              {activeCoin.weight ? ` · ${activeCoin.weight}` : ''}
            </span>
            <h2
              style={COIN_NAME_BASE}
              className='max-w-2xl text-2xl leading-tight @2xl:text-3xl'
            >
              {activeCoin.name}
            </h2>
            <p style={COIN_PRICE_BASE} className='mt-1 text-lg'>
              {activeCoin.price}
            </p>
            <button
              type='button'
              onClick={() => setSelected(activeCoin)}
              className='pointer-events-auto mt-4 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-white/20'
            >
              View details →
            </button>
          </div>
        )}

        <div className='absolute top-1/2 right-6 z-30 -translate-y-1/2 text-right text-xs text-white/40 tabular-nums'>
          {String(active + 1).padStart(2, '0')}
          <span className='text-white/20'> / {coins.length}</span>
        </div>
      </div>
      <CoinModal coin={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
