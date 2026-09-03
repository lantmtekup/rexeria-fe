'use client';

/**
 * Data-block "Vault · Invitation" (tách từ apps/mint2026 — Hồi IV).
 *
 * Nền: ảnh vàng mờ + ImageExplosion (coin nổ) + spotlight bám chuột (--mx/--my).
 * Lead form (email → /api/forms best-effort). Reveal qua useBlockMotion; spotlight
 * dùng pointer listener riêng (cleanup).
 *
 * Canvas editor: lưới phẳng hiện đủ ảnh + hiện CẢ form lẫn lời cảm ơn để chọn/sửa
 * từng field (ở preview coin đang bay theo physics nên không bấm trúng, và form
 * chỉ hiện 1 trong 2 trạng thái). PreviewMode + /p: nền + explosion + spotlight thật.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintVaultInvitationContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { ImageExplosion } from './ImageExplosion';

interface Props {
  content: MintVaultInvitationContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

// Tuyền inline: token phải nằm ở đây (KHÔNG phải Tailwind class) thì toolbar mới
// đè được color/fontSize. Class chỉ giữ structure + target GSAP.
const EYEBROW_BASE: React.CSSProperties = {
  fontSize: 'clamp(10px, 1.4cqi, 11px)',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: '#c9a96e',
};
const TITLE_BASE: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: 'clamp(30px, 5cqi, 56px)',
  fontWeight: 300,
  lineHeight: 1.15,
  color: '#ffffff',
};
const NOTE_BASE: React.CSSProperties = {
  fontSize: 'clamp(11px, 1.2cqi, 12px)',
  color: 'rgba(255,255,255,0.4)',
};
const SUBMIT_BASE: React.CSSProperties = {
  borderRadius: 9999,
  background: '#c9a96e',
  padding: '12px 24px',
  fontSize: 'clamp(11px, 1.2cqi, 12px)',
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  color: '#08070a',
};

const SUCCESS_BASE: React.CSSProperties = {
  marginTop: 36,
  borderRadius: 9999,
  border: '1px solid rgba(201,169,110,0.4)',
  padding: '12px 24px',
  fontSize: 'clamp(12px, 1.4cqi, 14px)',
  color: '#c9a96e',
};
/**
 * Input thật (ship ra /p) — token inline, KHÔNG gắn `data-element-key`:
 * selectableClass sẽ để lại cursor-pointer/hover-outline trên form thật.
 * Placeholder sửa qua Layers. Xem PnjCta.
 */
const INPUT_STYLE: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  borderRadius: 9999,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.04)',
  padding: '12px 20px',
  fontSize: 14,
  color: '#ffffff',
  outline: 'none',
};

export function MintVaultInvitation({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'done'>(
    'idle'
  );
  const images = Array.isArray(content.images) ? content.images : [];

  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // Reveal text qua nền GSAP.
  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      if (isCanvas) return;
      const root = rootRef.current;
      if (!root) return;
      gsap.utils
        .toArray<HTMLElement>('.vault-inv-reveal', root)
        .forEach((el, i) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              delay: i * 0.08,
              scrollTrigger: {
                trigger: el,
                scroller,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
                invalidateOnRefresh: true,
              },
            }
          );
        });
    },
    [isCanvas]
  );

  // Spotlight bám chuột — pointer listener riêng (ngoài gsap.context, cần cleanup).
  React.useEffect(() => {
    if (isCanvas) return;
    const root = rootRef.current;
    if (!root) return;
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      root.style.setProperty('--mx', `${e.clientX - r.left}px`);
      root.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [isCanvas]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Canvas hiện form chỉ để chọn/sửa field — không gửi lead thật khi đang edit.
    if (isCanvas) return;
    if (status === 'loading' || !email.trim()) return;
    setStatus('loading');
    try {
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_slug:
            typeof window !== 'undefined' ? window.location.pathname : '',
          fields: { email: email.trim() },
        }),
      });
    } catch {
      /* best-effort */
    }
    setStatus('done');
  };

  // ── Node dùng chung cho cả 2 nhánh (canvas + production).
  const heading = (
    <>
      <p
        data-element-key='eyebrow'
        style={composeStyle(EYEBROW_BASE, styleOf('eyebrow'))}
        className={selectableClass(activeKey === 'eyebrow', 'vault-inv-reveal')}
      >
        {content.eyebrow}
      </p>
      <h2
        data-element-key='title'
        style={composeStyle(TITLE_BASE, styleOf('title'))}
        className={selectableClass(
          activeKey === 'title',
          'vault-inv-reveal mt-3 max-w-2xl'
        )}
      >
        {content.title}
      </h2>
    </>
  );

  const form = (
    <form
      onSubmit={onSubmit}
      className='vault-inv-reveal mt-8 flex w-full max-w-md gap-2'
    >
      <input
        type='email'
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={content.emailPlaceholder}
        aria-label='Email'
        style={INPUT_STYLE}
      />
      <button
        type='submit'
        disabled={status === 'loading'}
        data-element-key='submitText'
        style={composeStyle(SUBMIT_BASE, styleOf('submitText'))}
        // Hover dùng transform (không phải màu): `background` đã là token inline
        // nên class `hover:bg-*` sẽ không đè được. Khớp prototype apps/mint2026.
        className={selectableClass(
          activeKey === 'submitText',
          'transition-transform hover:-translate-y-0.5 disabled:opacity-60'
        )}
      >
        {status === 'loading' ? '…' : content.submitText}
      </button>
    </form>
  );

  const successMessage = (
    <p
      data-element-key='successMessage'
      style={composeStyle(SUCCESS_BASE, styleOf('successMessage'))}
      className={selectableClass(
        activeKey === 'successMessage',
        'vault-inv-reveal'
      )}
    >
      {content.successMessage}
    </p>
  );

  const note = (
    <p
      data-element-key='note'
      style={composeStyle(NOTE_BASE, styleOf('note'))}
      className={selectableClass(activeKey === 'note', 'vault-inv-reveal mt-4')}
    >
      {content.note}
    </p>
  );

  // ── Canvas editor: lưới phẳng, hiện đủ field để chọn/sửa (không explosion,
  // không spotlight, không min-h-screen).
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        style={blockBackgroundStyle(background)}
        className='@container w-full bg-[#08070a] px-6 py-16 text-center text-white'
      >
        <div className='mx-auto flex w-full max-w-3xl flex-col items-center'>
          {heading}
          {form}
          {/* Production chỉ hiện 1 trong 2 trạng thái — canvas hiện cả để chọn được. */}
          {successMessage}
          {note}
        </div>

        <div className='mx-auto mt-12 w-full max-w-6xl'>
          <div className='relative aspect-21/9 overflow-hidden rounded-2xl bg-[#17131f]'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-element-key='backgroundImageUrl'
              src={content.backgroundImageUrl}
              alt=''
              style={styleOf('backgroundImageUrl')}
              className={selectableClass(
                activeKey === 'backgroundImageUrl',
                'absolute inset-0 h-full w-full object-cover'
              )}
            />
          </div>
          <div className='mt-4 grid grid-cols-2 gap-4 @2xl:grid-cols-3'>
            {images.map((src, i) => {
              const imgKey = `images[${i}]`;
              return (
                <div
                  key={i}
                  className='relative aspect-square overflow-hidden rounded-2xl bg-[#17131f]'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    data-element-key={imgKey}
                    src={src}
                    alt=''
                    style={styleOf(imgKey)}
                    className={selectableClass(
                      activeKey === imgKey,
                      'absolute inset-0 h-full w-full object-cover'
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: nền vàng + coin nổ + spotlight thật.
  return (
    <section
      ref={rootRef}
      id='invite'
      style={
        {
          '--mx': '50%',
          '--my': '42%',
          ...blockBackgroundStyle(background),
        } as React.CSSProperties
      }
      className='@container relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#08070a] px-6 py-24 text-center text-white'
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-element-key='backgroundImageUrl'
        src={content.backgroundImageUrl}
        alt=''
        style={styleOf('backgroundImageUrl')}
        className='pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]'
      />
      <div className='pointer-events-none absolute inset-0 bg-[#08070a]/40' />
      {/* ImageExplosion phải trong suốt: mặc định nó có bg-[#0e1a16] + min-h-[70vh]
          + rounded-md → panel xanh đè hết nền vàng (xem apps/mint2026 page.tsx). */}
      <div
        data-element-key='images'
        className='pointer-events-none absolute inset-0'
      >
        <ImageExplosion
          content={{ images: content.images }}
          background={{ color: 'transparent' }}
          className='min-h-full! justify-end! rounded-none! bg-transparent! pb-0!'
        />
      </div>
      {/* spotlight bám chuột */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'radial-gradient(440px circle at var(--mx) var(--my), rgba(201,169,110,0.34), rgba(201,169,110,0.08) 45%, transparent 66%)',
        }}
      />

      <div className='relative z-10 flex w-full flex-col items-center'>
        {heading}
        {status === 'done' ? successMessage : form}
        {note}
      </div>
    </section>
  );
}
