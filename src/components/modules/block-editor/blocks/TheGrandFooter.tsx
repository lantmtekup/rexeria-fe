'use client';

import * as React from 'react';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  TheGrandFooterContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useMotionAttributes } from '../motion/useMotionAttributes';
import {
  resolveTheGrandFooterPolicies,
  resolveTheGrandFooterSocials,
} from './theGrandFooterContent';
import { socialIconOf } from './theGrandFooterSocialIcons';

const SANS = "'Helvetica Neue', Arial, sans-serif";

const COLORS = {
  section: '#f2ecdf',
  text: '#3e281f',
  label: '#8a7c68',
  rule: '#d6cbb4',
  formRule: '#c9bc9e',
  barBg: '#241610',
  barText: '#e8d9b5',
} as const;

const RESPONSIVE = {
  mainMinH: 'clamp(320px, 30cqi, 440px)',
  padTop: 'clamp(36px, 5cqi, 72px)',
  padX: 'clamp(20px, 5cqi, 100px)',
  padBottom: 'clamp(32px, 4cqi, 56px)',
  stackGap: 'clamp(36px, 5cqi, 72px)',
  logoGap: 'clamp(20px, 3cqi, 44px)',
  logoGrandH: 'clamp(56px, 6cqi, 96px)',
  logoMasteriseH: 'clamp(44px, 4.6cqi, 74px)',
  dividerMinH: 'clamp(48px, 5cqi, 74px)',
  gridGap: 'clamp(28px, 3.4cqi, 56px)',
  colGap: 'clamp(20px, 2.4cqi, 32px)',
  policyGap: 'clamp(12px, 1.4cqi, 18px)',
  socialGap: 'clamp(12px, 1.4cqi, 18px)',
  labelFont: 'clamp(11px, 0.82cqi, 12px)',
  textFont: 'clamp(13px, 1cqi, 15px)',
  inputPadY: 'clamp(12px, 1.2cqi, 16px)',
  submitPadX: 'clamp(16px, 1.6cqi, 22px)',
  barPadY: 'clamp(16px, 1.8cqi, 20px)',
  barFont: 'clamp(10px, 0.82cqi, 12px)',
} as const;

const DELAY = {
  logoPrimary: 0,
  logoDivider: 0.12,
  logoSecondary: 0.2,
  colBase: 0.32,
  colStep: 0.09,
  fieldStep: 0.06,
  copyright: 0.85,
} as const;

const at = (col: number, field: number) =>
  (DELAY.colBase + col * DELAY.colStep + field * DELAY.fieldStep).toFixed(2);

interface Props {
  content: TheGrandFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function TheGrandFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [email, setEmail] = React.useState('');

  const policies = resolveTheGrandFooterPolicies(content);
  const socials = resolveTheGrandFooterSocials(content);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useMotionAttributes(sectionRef, [policies.length, socials.length]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Bản demo: chặn reload, chưa gửi đi đâu cả (giống apps/the-grand).
    e.preventDefault();
  };

  const renderLabel = (key: string, text: string, delay: string) => (
    <h3
      data-element-key={key}
      data-motion='word-reveal'
      data-motion-duration='0.7'
      data-motion-delay={delay}
      className={selectableClass(
        activeKey === key,
        'the-grand-footer__label pointer-events-auto'
      )}
      style={composeStyle(
        {
          margin: 0,
          fontFamily: SANS,
          fontSize: RESPONSIVE.labelFont,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: COLORS.label,
        },
        styleOf(key)
      )}
    >
      {text}
    </h3>
  );

  const bodyStyle = (key: string) =>
    composeStyle(
      {
        margin: 0,
        fontFamily: SANS,
        fontSize: RESPONSIVE.textFont,
        lineHeight: 1.65,
        color: COLORS.text,
      },
      styleOf(key)
    );

  return (
    <footer
      ref={sectionRef}
      data-motion-group
      data-motion-start='top 85%'
      className={`the-grand-footer @container relative z-10 w-full overflow-hidden ${className ?? ''}`}
      style={composeStyle(
        { background: COLORS.section, color: COLORS.text },
        blockBackgroundStyle(background)
      )}
    >
      <FooterStyle />

      <div
        className='flex w-full flex-col'
        style={{
          minHeight: RESPONSIVE.mainMinH,
          gap: RESPONSIVE.stackGap,
          paddingTop: RESPONSIVE.padTop,
          paddingBottom: RESPONSIVE.padBottom,
          paddingLeft: RESPONSIVE.padX,
          paddingRight: RESPONSIVE.padX,
        }}
      >
        <div
          className='flex flex-row flex-wrap items-center'
          style={{ gap: RESPONSIVE.logoGap }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='logoPrimaryUrl'
            data-motion='fade-up'
            data-motion-distance='24'
            data-motion-duration='0.6'
            data-motion-delay={String(DELAY.logoPrimary)}
            src={content.logoPrimaryUrl}
            alt={content.logoPrimaryAlt}
            loading='lazy'
            decoding='async'
            className={selectableClass(
              activeKey === 'logoPrimaryUrl',
              'the-grand-footer__logo pointer-events-auto'
            )}
            style={composeStyle(
              {
                display: 'block',
                height: RESPONSIVE.logoGrandH,
                width: 'auto',
              },
              styleOf('logoPrimaryUrl')
            )}
          />

          <div
            data-element-key='logoDivider'
            data-motion='line-draw'
            data-motion-trigger='in-view'
            data-motion-duration='0.6'
            data-motion-delay={String(DELAY.logoDivider)}
            aria-hidden='true'
            className={selectableClass(
              activeKey === 'logoDivider',
              'the-grand-footer__divider pointer-events-auto hidden self-stretch @2xl:block'
            )}
            style={composeStyle(
              {
                width: 1,
                minHeight: RESPONSIVE.dividerMinH,
                backgroundColor: COLORS.rule,
              },
              styleOf('logoDivider')
            )}
          />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='logoSecondaryUrl'
            data-motion='fade-up'
            data-motion-distance='24'
            data-motion-duration='0.6'
            data-motion-delay={String(DELAY.logoSecondary)}
            src={content.logoSecondaryUrl}
            alt={content.logoSecondaryAlt}
            loading='lazy'
            decoding='async'
            className={selectableClass(
              activeKey === 'logoSecondaryUrl',
              'the-grand-footer__logo pointer-events-auto'
            )}
            style={composeStyle(
              {
                display: 'block',
                height: RESPONSIVE.logoMasteriseH,
                width: 'auto',
              },
              styleOf('logoSecondaryUrl')
            )}
          />
        </div>

        <div
          className='grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-[1.3fr_1fr_1fr_1.2fr]'
          style={{ gap: RESPONSIVE.gridGap }}
        >
          <div
            className='flex min-w-0 flex-col'
            style={{ gap: RESPONSIVE.colGap }}
          >
            <div className='flex flex-col' style={{ gap: 10 }}>
              {renderLabel(
                'projectAddressLabel',
                content.projectAddressLabel,
                at(0, 0)
              )}
              <p
                data-element-key='projectAddress'
                data-motion='fade-up'
                data-motion-distance='18'
                data-motion-duration='0.6'
                data-motion-delay={at(0, 1)}
                className={selectableClass(
                  activeKey === 'projectAddress',
                  'the-grand-footer__text pointer-events-auto'
                )}
                style={bodyStyle('projectAddress')}
              >
                {content.projectAddress}
              </p>
            </div>

            <div className='flex flex-col' style={{ gap: 10 }}>
              {renderLabel(
                'showroomAddressLabel',
                content.showroomAddressLabel,
                at(0, 2)
              )}
              <p
                data-element-key='showroomAddress'
                data-motion='fade-up'
                data-motion-distance='18'
                data-motion-duration='0.6'
                data-motion-delay={at(0, 3)}
                className={selectableClass(
                  activeKey === 'showroomAddress',
                  'the-grand-footer__text pointer-events-auto'
                )}
                style={bodyStyle('showroomAddress')}
              >
                {content.showroomAddress}
              </p>
            </div>
          </div>

          <div
            className='flex min-w-0 flex-col'
            style={{ gap: RESPONSIVE.colGap }}
          >
            <div className='flex flex-col' style={{ gap: 10 }}>
              {renderLabel('emailLabel', content.emailLabel, at(1, 0))}
              <a
                data-element-key='email'
                data-motion='fade-up'
                data-motion-distance='18'
                data-motion-duration='0.6'
                data-motion-delay={at(1, 1)}
                href={`mailto:${content.email}`}
                className={selectableClass(
                  activeKey === 'email',
                  'the-grand-footer__link pointer-events-auto'
                )}
                style={bodyStyle('email')}
              >
                {content.email}
              </a>
            </div>

            <div className='flex flex-col' style={{ gap: 10 }}>
              {renderLabel('hotlineLabel', content.hotlineLabel, at(1, 2))}
              <a
                data-element-key='hotline'
                data-motion='fade-up'
                data-motion-distance='18'
                data-motion-duration='0.6'
                data-motion-delay={at(1, 3)}
                href={`tel:${content.hotline.replace(/\s+/g, '')}`}
                className={selectableClass(
                  activeKey === 'hotline',
                  'the-grand-footer__link pointer-events-auto'
                )}
                style={bodyStyle('hotline')}
              >
                {content.hotline}
              </a>
            </div>
          </div>

          <nav
            className='flex min-w-0 flex-col'
            style={{ gap: RESPONSIVE.policyGap }}
            aria-label='Chính sách'
          >
            {policies.map((policy, i) => {
              const key = `policies[${i}].label`;
              return (
                <a
                  key={`${policy.label}-${i}`}
                  data-element-key={key}
                  data-motion='fade-up'
                  data-motion-distance='18'
                  data-motion-duration='0.6'
                  data-motion-delay={at(2, i)}
                  href={policy.href}
                  className={selectableClass(
                    activeKey === key,
                    'the-grand-footer__policy pointer-events-auto'
                  )}
                  style={bodyStyle(key)}
                >
                  {policy.label}
                </a>
              );
            })}
          </nav>

          <div
            className='flex min-w-0 flex-col'
            style={{ gap: RESPONSIVE.colGap }}
          >
            <div className='flex flex-col' style={{ gap: 10 }}>
              {renderLabel('socialLabel', content.socialLabel, at(3, 0))}

              <ul
                className='flex list-none flex-row flex-wrap'
                style={{ margin: 0, padding: 0, gap: RESPONSIVE.socialGap }}
              >
                {socials.map((social, i) => {
                  const icon = socialIconOf(social.platform);
                  return (
                    <li
                      key={`${social.platform}-${i}`}
                      data-motion='fade-up'
                      data-motion-distance='16'
                      data-motion-duration='0.5'
                      data-motion-delay={at(3, 1 + i * 0.5)}
                    >
                      <a
                        data-motion='hover-scale'
                        data-motion-duration='0.3'
                        href={social.href}
                        aria-label={social.label?.trim() || icon.label}
                        className='the-grand-footer__social inline-flex items-center justify-center'
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          color: COLORS.text,
                          border: '1px solid transparent',
                        }}
                      >
                        <svg
                          viewBox='0 0 24 24'
                          width='18'
                          height='18'
                          fill={icon.mode === 'fill' ? 'currentColor' : 'none'}
                          stroke={
                            icon.mode === 'stroke' ? 'currentColor' : undefined
                          }
                          strokeWidth={icon.mode === 'stroke' ? 1.7 : undefined}
                          aria-hidden='true'
                        >
                          {icon.glyph}
                        </svg>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className='flex flex-col' style={{ gap: 10 }}>
              {renderLabel(
                'newsletterLabel',
                content.newsletterLabel,
                at(3, 2)
              )}

              <form
                data-motion='fade-up'
                data-motion-distance='18'
                data-motion-duration='0.6'
                data-motion-delay={at(3, 3)}
                className='flex w-full flex-row items-stretch'
                style={{
                  border: `1px solid ${COLORS.formRule}`,
                  background: 'transparent',
                  maxWidth: 320,
                }}
                onSubmit={handleSubmit}
              >
                <input
                  className='the-grand-footer__input min-w-0 flex-1'
                  type='email'
                  placeholder={content.newsletterPlaceholder}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  aria-label={content.newsletterPlaceholder}
                  style={{
                    border: 0,
                    outline: 'none',
                    background: 'transparent',
                    padding: `${RESPONSIVE.inputPadY} 16px`,
                    fontFamily: SANS,
                    fontSize: RESPONSIVE.textFont,
                    color: COLORS.text,
                  }}
                />
                <button
                  className='the-grand-footer__submit inline-flex shrink-0 items-center'
                  type='submit'
                  style={{
                    gap: 8,
                    border: 0,
                    borderLeft: `1px solid ${COLORS.formRule}`,
                    background: 'transparent',
                    padding: `0 ${RESPONSIVE.submitPadX}`,
                    cursor: 'pointer',
                  }}
                >
                  <span
                    data-element-key='newsletterSubmitText'
                    className={selectableClass(
                      activeKey === 'newsletterSubmitText',
                      'pointer-events-auto'
                    )}
                    style={composeStyle(
                      {
                        fontFamily: SANS,
                        fontSize: RESPONSIVE.textFont,
                        color: COLORS.text,
                      },
                      styleOf('newsletterSubmitText')
                    )}
                  >
                    {content.newsletterSubmitText}
                  </span>
                  <span aria-hidden='true' style={{ color: COLORS.text }}>
                    →
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div
        data-element-key='copyright'
        data-motion='fade-in'
        data-motion-duration='0.7'
        data-motion-delay={String(DELAY.copyright)}
        className={selectableClass(
          activeKey === 'copyright',
          'the-grand-footer__bar pointer-events-auto'
        )}
        style={composeStyle(
          {
            background: COLORS.barBg,
            color: COLORS.barText,
            fontFamily: SANS,
            fontSize: RESPONSIVE.barFont,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textAlign: 'center',
            padding: `${RESPONSIVE.barPadY} 24px`,
          },
          styleOf('copyright')
        )}
      >
        {content.copyright}
      </div>
    </footer>
  );
}

function FooterStyle() {
  return (
    <style>{`
      .the-grand-footer__link,
      .the-grand-footer__policy {
        text-decoration: none;
        transition: color 0.2s ease;
      }
      .the-grand-footer__link:hover,
      .the-grand-footer__policy:hover {
        color: #8a6b3f;
      }
      .the-grand-footer__social {
        transition: color 0.2s ease, border-color 0.2s ease;
      }
      .the-grand-footer__social:hover {
        color: #8a6b3f;
        border-color: ${COLORS.rule};
      }
      .the-grand-footer__input::placeholder {
        color: #a99b84;
      }
      .the-grand-footer__submit {
        transition: color 0.2s ease;
      }
      .the-grand-footer__submit:hover span {
        color: #8a6b3f;
      }
    `}</style>
  );
}
