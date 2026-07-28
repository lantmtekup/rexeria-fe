'use client';

/**
 * PNJ · CTA — section tối cuối trang: tiêu đề + mô tả + form
 * "để lại thông tin" (email + phone + note). Port từ apps/pnj CtaSection.
 *
 * Motion R1–R6:
 * - Entrance fade-up (`.pnj-cta-fade`) qua useBlockMotion (GSAP context + scroller).
 * - KHÔNG gsap.registerPlugin / Lenis trong block.
 * - Editor canvas (`active-block-preview`): submit KHÔNG đổi sang màn cảm ơn
 *   (giữ form hiển thị để còn sửa được label/nút). Trên /p thì submit thật.
 * - Backend chưa nối — submit chỉ set state cục bộ + hiện successMessage.
 */

import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PnjCtaContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

const RESPONSIVE = {
  padX: 'clamp(24px, 5cqi, 40px)',
  padTop: 'clamp(88px, 12cqi, 144px)',
  padBottom: 'clamp(128px, 16cqi, 176px)',
  titleFont: 'clamp(32px, 6cqi, 48px)',
  subtitleFont: 'clamp(14px, 1.9cqi, 16px)',
  labelFont: 'clamp(10px, 1.1cqi, 11px)',
  fieldFont: 'clamp(13px, 1.5cqi, 14px)',
  buttonFont: 'clamp(11px, 1.2cqi, 12px)',
  successFont: 'clamp(15px, 1.9cqi, 16px)',
} as const;

const FIELD_STYLE: React.CSSProperties = {
  width: '100%',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.05)',
  padding: '12px 16px',
  fontSize: RESPONSIVE.fieldFont,
  color: '#ffffff',
  transition: 'border-color 0.2s ease',
  outline: 'none',
};

const LABEL_BASE: React.CSSProperties = {
  fontSize: RESPONSIVE.labelFont,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#a3a3a3',
};

interface Props {
  content: PnjCtaContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function PnjCta({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [note, setNote] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  // Editor canvas detection — trong canvas không đổi sang màn cảm ơn.
  const [isCanvas, setIsCanvas] = React.useState(false);
  React.useLayoutEffect(() => {
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, []);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCanvas) return;
    if (!email.trim() || !phone.trim()) return;
    // Chưa có backend — bắt cục bộ + xác nhận. Thay bằng POST thật
    // (vd /api/reserve) khi có endpoint. Note tuỳ chọn; email + phone bắt buộc.
    setSubmitted(true);
  };

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const fades = gsap.utils.toArray<HTMLElement>('.pnj-cta-fade', root);
      if (!fades.length) return;

      gsap.fromTo(
        fades,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        }
      );
    },
    [submitted]
  );

  return (
    <section
      ref={rootRef}
      id='contact'
      style={composeStyle(
        {
          paddingLeft: RESPONSIVE.padX,
          paddingRight: RESPONSIVE.padX,
          paddingTop: RESPONSIVE.padTop,
          paddingBottom: RESPONSIVE.padBottom,
          background: '#171717',
        },
        blockBackgroundStyle(background)
      )}
      className='pnj-cta @container relative w-full overflow-hidden text-center text-white'
    >
      <div className='mx-auto flex max-w-md flex-col'>
        {/* Gold hairline accent — brand language với hero/details */}
        <div
          className='pnj-cta-fade mx-auto mb-8 h-px w-16 @2xl:w-24'
          style={{
            background:
              'linear-gradient(to right, transparent, #c79119, transparent)',
          }}
        />

        <h2
          data-element-key='title'
          style={composeStyle(
            {
              margin: 0,
              fontSize: RESPONSIVE.titleFont,
              fontWeight: 300,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textWrap: 'balance',
              color: '#ffffff',
            },
            styleOf('title')
          )}
          className={selectableClass(activeKey === 'title', 'pnj-cta-fade')}
        >
          {content.title}
        </h2>

        <p
          data-element-key='subtitle'
          style={composeStyle(
            {
              margin: '24px auto 0',
              maxWidth: '24rem',
              fontSize: RESPONSIVE.subtitleFont,
              lineHeight: 1.7,
              color: '#a3a3a3',
            },
            styleOf('subtitle')
          )}
          className={selectableClass(activeKey === 'subtitle', 'pnj-cta-fade')}
        >
          {content.subtitle}
        </p>

        {submitted ? (
          <p
            data-element-key='successMessage'
            role='status'
            style={composeStyle(
              {
                margin: '40px auto 0',
                maxWidth: '24rem',
                fontSize: RESPONSIVE.successFont,
                color: '#e6b94a',
              },
              styleOf('successMessage')
            )}
            className={selectableClass(
              activeKey === 'successMessage',
              'pnj-cta-fade'
            )}
          >
            {content.successMessage}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className='pnj-cta-fade mx-auto mt-10 flex w-full flex-col gap-4 text-left'
          >
            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor='pnj-cta-email'
                data-element-key='emailLabel'
                style={composeStyle(LABEL_BASE, styleOf('emailLabel'))}
                className={selectableClass(activeKey === 'emailLabel')}
              >
                {content.emailLabel}
              </label>
              <input
                id='pnj-cta-email'
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={content.emailPlaceholder}
                style={FIELD_STYLE}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor='pnj-cta-phone'
                data-element-key='phoneLabel'
                style={composeStyle(LABEL_BASE, styleOf('phoneLabel'))}
                className={selectableClass(activeKey === 'phoneLabel')}
              >
                {content.phoneLabel}
              </label>
              <input
                id='pnj-cta-phone'
                name='phone'
                type='tel'
                autoComplete='tel'
                inputMode='tel'
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={content.phonePlaceholder}
                style={FIELD_STYLE}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label
                htmlFor='pnj-cta-note'
                data-element-key='noteLabel'
                style={composeStyle(LABEL_BASE, styleOf('noteLabel'))}
                className={selectableClass(activeKey === 'noteLabel')}
              >
                {content.noteLabel}
              </label>
              <textarea
                id='pnj-cta-note'
                name='note'
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={content.notePlaceholder}
                style={{ ...FIELD_STYLE, resize: 'none' }}
              />
            </div>

            <button
              type='submit'
              data-element-key='submitText'
              style={composeStyle(
                {
                  marginTop: 8,
                  alignSelf: 'flex-start',
                  minHeight: 44,
                  borderRadius: 9999,
                  background: '#ffffff',
                  padding: '16px 32px',
                  fontSize: RESPONSIVE.buttonFont,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  color: '#000000',
                  transition: 'background-color 0.3s ease',
                },
                styleOf('submitText')
              )}
              className={selectableClass(activeKey === 'submitText')}
            >
              {content.submitText}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
