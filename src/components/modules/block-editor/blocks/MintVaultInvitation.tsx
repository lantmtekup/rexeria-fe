'use client';

/**
 * Data-block "Vault · Invitation" (tách từ apps/mint2026 — Hồi IV).
 *
 * Nền: ảnh vàng mờ + ImageExplosion (coin nổ) + spotlight bám chuột (--mx/--my).
 * Lead form (email → /api/forms best-effort). Reveal qua useBlockMotion; spotlight
 * dùng pointer listener riêng (cleanup). @container + data-element-key.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
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
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  // Reveal text qua nền GSAP.
  useBlockMotion(rootRef, ({ scroller }) => {
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
  });

  // Spotlight bám chuột — pointer listener riêng (ngoài gsap.context, cần cleanup).
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      root.style.setProperty('--mx', `${e.clientX - r.left}px`);
      root.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        className='pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]'
      />
      <div className='pointer-events-none absolute inset-0 bg-[#08070a]/40' />
      <div
        data-element-key='images'
        className='pointer-events-none absolute inset-0'
      >
        <ImageExplosion content={{ images: content.images }} />
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
        <p
          data-element-key='eyebrow'
          style={styleOf('eyebrow')}
          className={selectableClass(
            activeKey === 'eyebrow',
            'vault-inv-reveal mb-3 text-[11px] tracking-[0.3em] text-[#c9a96e] uppercase'
          )}
        >
          {content.eyebrow}
        </p>
        <h2
          data-element-key='title'
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(30px, 5cqi, 56px)',
            ...styleOf('title'),
          }}
          className={selectableClass(
            activeKey === 'title',
            'vault-inv-reveal max-w-2xl leading-tight font-light'
          )}
        >
          {content.title}
        </h2>

        {status === 'done' ? (
          <p className='vault-inv-reveal mt-8 text-sm text-[#c9a96e]'>
            Thank you — you&apos;re on the collector list.
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className='vault-inv-reveal mt-8 flex w-full max-w-md gap-2'
          >
            <input
              type='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='Your email'
              aria-label='Email'
              className='flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#c9a96e]'
            />
            <button
              type='submit'
              disabled={status === 'loading'}
              className='rounded-full bg-[#c9a96e] px-6 py-3 text-xs font-semibold tracking-[0.14em] text-[#08070a] uppercase transition-colors hover:bg-white disabled:opacity-60'
            >
              {status === 'loading' ? '…' : 'Reserve'}
            </button>
          </form>
        )}

        <p
          data-element-key='note'
          style={styleOf('note')}
          className={selectableClass(
            activeKey === 'note',
            'vault-inv-reveal mt-4 text-xs text-white/40'
          )}
        >
          {content.note}
        </p>
      </div>
    </section>
  );
}
