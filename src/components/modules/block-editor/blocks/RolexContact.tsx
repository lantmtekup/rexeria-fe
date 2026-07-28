'use client';

import * as React from 'react';

import { useMotionAttributes } from '../motion/useMotionAttributes';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  RolexContactContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { FONT_BODY, FONT_CSS, FONT_HEADING } from './rolexFonts';

interface Props {
  content: RolexContactContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const HEADING_TEXT_CLASS = 'text-[48px] @3xl:text-[76px]';
const FORM_TEXT_CLASS = 'text-[16px] @3xl:text-[12px]';

const PANEL_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 1200,
  maxHeight: 900,
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.32)',
  backgroundColor: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(8px)',
};

const FIELD_STYLE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.08)',
  padding: ' 16px',
  fontFamily: FONT_BODY,
  color: '#ffffff',
  outline: 'none',
  height: '40px',
  transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
};

const LABEL_BASE: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
  color: '#ffffff',
  margin: 0,
};

const SOCIAL_LINK_STYLE: React.CSSProperties = {
  fontFamily: FONT_BODY,
};

// Color/background live here (not in SOCIAL_LINK_STYLE) so the `hover:` variants
// can actually win — an inline `style.color` always beats a CSS :hover rule.
const SOCIAL_LINK_CLASS =
  'inline-flex h-full max-h-8 items-center justify-center rounded-pill border border-white px-4 py-2 text-sm font-normal whitespace-nowrap text-white no-underline transition-colors duration-200 hover:bg-white hover:text-black';

const IMAGE_COVER_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
  borderRadius: '4px',
};

export function RolexContact({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCanvas) return;
    if (!name.trim() || !email.trim()) return;
    setSubmitted(true);
  };

  useMotionAttributes(rootRef);

  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { backgroundColor: '#0a0a0a' },
        blockBackgroundStyle(background)
      )}
      className='rolex-contact @container relative flex h-screen w-full flex-col items-center overflow-hidden'
    >
      <style>{FONT_CSS}</style>

      <div
        data-element-key='backgroundUrl'
        className={selectableClass(
          activeKey === 'backgroundUrl',
          'absolute inset-0 overflow-hidden'
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.backgroundUrl}
          alt='background'
          style={IMAGE_COVER_STYLE}
        />
      </div>

      <div className='flex w-full flex-1 flex-col items-center px-4 pt-4 pb-39 @3xl:px-11 @3xl:pt-16.5 @4xl:px-0 @4xl:pt-20'>
        <div
          style={PANEL_STYLE}
          className='flex flex-1 flex-col items-stretch justify-start gap-6 overflow-hidden px-4 pt-11 pb-6 @3xl:flex-row @3xl:items-center @3xl:p-6 @4xl:gap-1'
        >
          <div className='flex shrink-0 grow-0 flex-col justify-center gap-9.5 @3xl:flex-1 @3xl:gap-4.25'>
            <div className='flex flex-col items-center gap-2'>
              <h1
                data-element-key='heading'
                data-motion='char-blur-up-reveal'
                data-motion-trigger='load'
                data-motion-delay='0.1'
                data-motion-duration='0.7'
                style={composeStyle(
                  {
                    fontFamily: FONT_HEADING,
                    fontWeight: 400,
                    color: '#ffffff',
                    margin: 0,
                    textTransform: 'uppercase',
                    lineHeight: 1.2,
                  },
                  styleOf('heading')
                )}
                className={selectableClass(
                  activeKey === 'heading',
                  HEADING_TEXT_CLASS
                )}
              >
                {content.heading || 'SAY HELLO'}
              </h1>
              <p
                className='m-0 flex flex-col items-center gap-2 @3xl:flex-row @3xl:flex-wrap'
                style={{ fontFamily: FONT_BODY, color: '#ffffff' }}
              >
                <span
                  data-element-key='email'
                  style={composeStyle(
                    { fontSize: 16, fontWeight: 400 },
                    styleOf('email')
                  )}
                  className={selectableClass(activeKey === 'email')}
                >
                  {content.email}
                </span>
                <span aria-hidden='true' style={{ fontSize: 16 }}>
                  ✦
                </span>
                <span
                  data-element-key='phone'
                  style={composeStyle(
                    { fontSize: 16, fontWeight: 400 },
                    styleOf('phone')
                  )}
                  className={selectableClass(activeKey === 'phone')}
                >
                  {content.phone}
                </span>
              </p>
            </div>

            {submitted ? (
              <p
                data-element-key='successMessage'
                role='status'
                style={composeStyle(
                  {
                    fontFamily: FONT_BODY,
                    fontSize: 16,
                    color: '#ffffff',
                    margin: 0,
                  },
                  styleOf('successMessage')
                )}
                className={selectableClass(
                  activeKey === 'successMessage',
                  'w-full @3xl:w-[76%] @3xl:self-center'
                )}
              >
                {content.successMessage}
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className='flex w-full flex-col gap-3 @3xl:w-[76%] @3xl:self-center'
              >
                <div className='flex flex-col gap-1.5'>
                  <label
                    htmlFor='rcontact-name'
                    data-element-key='nameLabel'
                    style={composeStyle(LABEL_BASE, styleOf('nameLabel'))}
                    className={selectableClass(
                      activeKey === 'nameLabel',
                      FORM_TEXT_CLASS
                    )}
                  >
                    {content.nameLabel}
                  </label>
                  <input
                    id='rcontact-name'
                    name='name'
                    type='text'
                    autoComplete='name'
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={content.namePlaceholder}
                    style={FIELD_STYLE}
                    className={FORM_TEXT_CLASS}
                  />
                </div>

                <div className='flex flex-col gap-1.5'>
                  <label
                    htmlFor='rcontact-email'
                    data-element-key='mailLabel'
                    style={composeStyle(LABEL_BASE, styleOf('mailLabel'))}
                    className={selectableClass(
                      activeKey === 'mailLabel',
                      FORM_TEXT_CLASS
                    )}
                  >
                    {content.mailLabel}
                  </label>
                  <input
                    id='rcontact-email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={content.mailPlaceholder}
                    style={FIELD_STYLE}
                    className={FORM_TEXT_CLASS}
                  />
                </div>

                <div className='flex flex-col gap-1.5'>
                  <label
                    htmlFor='rcontact-message'
                    data-element-key='messageLabel'
                    style={composeStyle(LABEL_BASE, styleOf('messageLabel'))}
                    className={selectableClass(
                      activeKey === 'messageLabel',
                      FORM_TEXT_CLASS
                    )}
                  >
                    {content.messageLabel}
                  </label>
                  <textarea
                    id='rcontact-message'
                    name='message'
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={content.messagePlaceholder}
                    style={{
                      ...FIELD_STYLE,
                      height: 'auto',
                      minHeight: 100,
                      resize: 'none',
                    }}
                    className={FORM_TEXT_CLASS}
                  />
                </div>

                <button
                  type='submit'
                  data-element-key='submitLabel'
                  style={composeStyle(
                    {
                      marginTop: 4,
                      minHeight: 44,
                      borderRadius: 4,
                      background: '#ffffff',
                      padding: '12px 24px',
                      fontFamily: FONT_BODY,
                      fontSize: 14,
                      fontWeight: 400,
                      color: '#000000',
                      textTransform: 'uppercase',
                    },
                    styleOf('submitLabel')
                  )}
                  className={selectableClass(activeKey === 'submitLabel')}
                >
                  {content.submitLabel}
                </button>
              </form>
            )}
          </div>

          <div
            data-element-key='portraitUrl'
            className={selectableClass(
              activeKey === 'portraitUrl',
              'relative h-52.5 w-full shrink-0 grow-0 overflow-hidden @3xl:h-full @3xl:w-auto @3xl:flex-1'
            )}
          >
            <div className='absolute inset-0'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.portraitUrl}
                alt='portrait'
                style={IMAGE_COVER_STYLE}
              />
            </div>
            <div className='absolute right-4 bottom-4 flex gap-2'>
              <a
                data-element-key='instagramLabel'
                data-motion='fade-up'
                data-motion-trigger='load'
                data-motion-distance='150'
                data-motion-duration='1.1'
                href={content.instagramHref || '#'}
                target={content.instagramHref ? '_blank' : undefined}
                rel={content.instagramHref ? 'noopener noreferrer' : undefined}
                style={composeStyle(
                  SOCIAL_LINK_STYLE,
                  styleOf('instagramLabel')
                )}
                className={selectableClass(
                  activeKey === 'instagramLabel',
                  SOCIAL_LINK_CLASS
                )}
              >
                {content.instagramLabel}
              </a>
              <a
                data-element-key='twitterLabel'
                data-motion='fade-up'
                data-motion-trigger='load'
                data-motion-delay='0.6'
                data-motion-distance='150'
                data-motion-duration='1.1'
                href={content.twitterHref || '#'}
                target={content.twitterHref ? '_blank' : undefined}
                rel={content.twitterHref ? 'noopener noreferrer' : undefined}
                style={composeStyle(SOCIAL_LINK_STYLE, styleOf('twitterLabel'))}
                className={selectableClass(
                  activeKey === 'twitterLabel',
                  SOCIAL_LINK_CLASS
                )}
              >
                {content.twitterLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
