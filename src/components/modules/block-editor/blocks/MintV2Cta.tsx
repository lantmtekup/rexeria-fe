'use client';

/**
 * Data-block "MintV2 · CTA" (port từ apps/mintcoin-v2 CtaSection).
 *
 * LEFT: headline + copy + contact strip. RIGHT: form lead-capture
 * (name/email/phone/message) → POST /api/forms (best-effort; nếu page chưa nối
 * endpoint sẽ báo lỗi). Bỏ coupling analytics + debug-curl của bản gốc.
 * Reveal fade-up qua contract nền GSAP. Container-query (@2xl/@4xl).
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintV2CtaContent,
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
  content: MintV2CtaContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

const inputCls =
  'w-full rounded-md bg-neutral-100/[0.04] border border-neutral-100/15 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors duration-200 focus:border-[#c79119] focus:bg-neutral-100/[0.07]';

export function MintV2Cta({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const contacts = content.contacts ?? [];
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = React.useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = React.useState('');
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    if (!root) return;
    gsap.utils.toArray<HTMLElement>('.cta-reveal', root).forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          delay: i * 0.08,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    });
  });

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    if (!form.email.trim() && !form.phone.trim()) {
      setStatus('error');
      setErrorMsg('Please provide an email or phone number.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const fields: Record<string, string> = {};
      (['name', 'email', 'phone', 'message'] as const).forEach(k => {
        if (form[k].trim()) fields[k] = form[k].trim();
      });
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_slug:
            typeof window !== 'undefined' ? window.location.pathname : '',
          fields,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error ||
            data.message ||
            'Something went wrong. Please try again.'
        );
      }
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg((err as Error).message);
    }
  };

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='cta @container relative w-full overflow-hidden bg-[#0f0f0f] py-24 text-neutral-100 @2xl:py-40'
    >
      <div aria-hidden='true' className='absolute inset-0 z-0'>
        <div
          className='absolute inset-0 opacity-60'
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 75% 20%, rgba(199,145,25,0.10) 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(199,145,25,0.06) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className='relative z-10 mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 @2xl:px-16 @4xl:grid-cols-[1.1fr_1fr] @4xl:gap-24'>
        {/* LEFT */}
        <div className='flex flex-col justify-center'>
          <span
            data-element-key='eyebrow'
            style={styleOf('eyebrow')}
            className={selectableClass(
              activeKey === 'eyebrow',
              'cta-reveal mb-5 block text-[11px] tracking-[0.32em] text-[#c79119] uppercase'
            )}
          >
            {content.eyebrow}
          </span>
          <h2
            data-element-key='title'
            style={{ fontSize: 'clamp(44px, 7cqi, 96px)', ...styleOf('title') }}
            className={selectableClass(
              activeKey === 'title',
              'cta-reveal font-serif leading-[0.98] font-light tracking-tight text-neutral-50'
            )}
          >
            {content.title}
          </h2>
          <p
            data-element-key='description'
            style={styleOf('description')}
            className={selectableClass(
              activeKey === 'description',
              'cta-reveal mt-6 max-w-md text-base leading-relaxed font-light text-neutral-300 @2xl:text-lg'
            )}
          >
            {content.description}
          </p>

          <div
            data-element-key='contacts'
            className={selectableClass(
              activeKey === 'contacts',
              'cta-reveal mt-10 space-y-5'
            )}
          >
            {contacts.map(c => (
              <div key={c.key}>
                <h3 className='mb-1 text-[11px] tracking-[0.22em] text-neutral-500 uppercase'>
                  {c.label}
                </h3>
                <p className='text-sm text-neutral-300'>{c.value}</p>
              </div>
            ))}
            {content.buyUrl && (
              <a
                href={content.buyUrl}
                target='_blank'
                rel='noopener noreferrer'
                data-element-key='buyLabel'
                className='inline-block text-[11px] tracking-[0.18em] text-[#c79119] uppercase transition-colors hover:text-neutral-100'
              >
                {content.buyLabel}
              </a>
            )}
          </div>
        </div>

        {/* RIGHT — form */}
        <div className='cta-reveal flex flex-col justify-center'>
          {status === 'success' ? (
            <div className='rounded-xl border border-[#c79119]/40 bg-[#c79119]/[0.06] p-10 text-center'>
              <h3 className='mb-3 font-serif text-3xl text-neutral-50'>
                Thank you
              </h3>
              <p className='text-sm leading-relaxed text-neutral-300'>
                We&apos;ve received your details. An advisor will contact you
                shortly to help reserve your coin.
              </p>
              <button
                type='button'
                onClick={() => setStatus('idle')}
                className='mt-6 text-[11px] tracking-[0.18em] text-[#c79119] uppercase transition-colors hover:text-neutral-100'
              >
                Submit another request →
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className='space-y-4 rounded-xl border border-neutral-100/10 bg-neutral-100/[0.02] p-6 @2xl:p-8'
              noValidate
            >
              <h3 className='mb-2 font-serif text-2xl text-neutral-50'>
                Request a call back
              </h3>
              <input
                type='text'
                autoComplete='name'
                placeholder='Full name (optional)'
                aria-label='Full name'
                value={form.name}
                onChange={update('name')}
                className={inputCls}
              />
              <input
                type='email'
                autoComplete='email'
                placeholder='Email address *'
                aria-label='Email address'
                value={form.email}
                onChange={update('email')}
                className={inputCls}
              />
              <input
                type='tel'
                autoComplete='tel'
                placeholder='Phone number *'
                aria-label='Phone number'
                value={form.phone}
                onChange={update('phone')}
                className={inputCls}
              />
              <textarea
                rows={3}
                placeholder='Anything we should know? (optional)'
                aria-label='Message'
                value={form.message}
                onChange={update('message')}
                className={`${inputCls} resize-none`}
              />
              {status === 'error' && (
                <p className='text-sm text-red-400' role='alert'>
                  {errorMsg}
                </p>
              )}
              <button
                type='submit'
                disabled={status === 'loading'}
                className='w-full rounded-full bg-[#c79119] py-4 text-xs font-medium tracking-[0.18em] text-neutral-900 uppercase transition-colors duration-300 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {status === 'loading' ? 'Sending…' : 'Request a call back'}
              </button>
              <p className='text-[11px] leading-relaxed text-neutral-500'>
                By submitting you agree to be contacted by an advisor about this
                product.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
