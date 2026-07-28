'use client';

import * as React from 'react';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  TheGrandAboutContent,
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
import { resolveTheGrandAboutPartners } from './theGrandAboutContent';

const SERIF = "Cambria, 'Times New Roman', Georgia, serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";

const COLORS = {
  text: '#e8d9b5',
  muted: '#c9bca6',
  rule: '#6b5a44',
  mediaBg: '#241610',
} as const;

const BG_GRADIENT =
  'radial-gradient(110% 120% at 18% 35%, #4a3122 0%, #2e1d12 55%, #241610 100%)';

const RESPONSIVE = {
  sectionMinH: 'clamp(520px, 68cqi, 780px)',
  padY: 'clamp(40px, 6cqi, 88px)',
  padX: 'clamp(20px, 5cqi, 100px)',
  colGap: 'clamp(28px, 5cqi, 80px)',
  logoW: 'clamp(120px, 11cqi, 168px)',
  logoMb: 'clamp(20px, 2.6cqi, 36px)',
  headingFont: 'clamp(24px, 2.6cqi, 38px)',
  headingMb: 'clamp(16px, 1.8cqi, 24px)',
  descFont: 'clamp(13px, 1.05cqi, 16px)',
  ruleMy: 'clamp(28px, 3.6cqi, 48px)',
  partnerGap: 'clamp(16px, 2.2cqi, 40px)',
  partnerLogoH: 'clamp(20px, 2cqi, 30px)',
  partnerRoleFont: 'clamp(11px, 0.9cqi, 13px)',
} as const;

const DELAY = {
  media: 0,
  logo: 0.25,
  heading: 0.35,
  description: 0.5,
  rule: 0.62,
  partnersBase: 0.75,
  partnersStep: 0.1,
} as const;

interface Props {
  content: TheGrandAboutContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function TheGrandAbout({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const sectionRef = React.useRef<HTMLElement>(null);

  const partners = resolveTheGrandAboutPartners(content);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useMotionAttributes(sectionRef, [partners.length]);

  return (
    <section
      ref={sectionRef}
      data-motion-group
      data-motion-start='top 80%'
      className={`the-grand-about @container relative z-10 w-full overflow-hidden ${className ?? ''}`}
      style={composeStyle(
        {
          background: BG_GRADIENT,
          color: COLORS.text,
          minHeight: RESPONSIVE.sectionMinH,
        },
        blockBackgroundStyle(background)
      )}
    >
      <div
        className='mx-auto flex w-full max-w-[1600px] flex-col items-stretch @3xl:flex-row @3xl:items-center'
        style={{
          minHeight: RESPONSIVE.sectionMinH,
          gap: RESPONSIVE.colGap,
          paddingTop: RESPONSIVE.padY,
          paddingBottom: RESPONSIVE.padY,
          paddingLeft: RESPONSIVE.padX,
          paddingRight: RESPONSIVE.padX,
        }}
      >
        <div
          data-element-key='imageUrl'
          data-motion='clip-reveal'
          data-motion-direction='left'
          data-motion-duration='1.1'
          data-motion-delay={String(DELAY.media)}
          className={selectableClass(
            activeKey === 'imageUrl',
            'the-grand-about__media pointer-events-auto w-full shrink-0 overflow-hidden @3xl:w-[52%]'
          )}
          style={composeStyle(
            { aspectRatio: '16 / 11', backgroundColor: COLORS.mediaBg },
            styleOf('imageUrl')
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-motion='media-zoom'
            data-motion-duration='1.4'
            data-motion-delay={String(DELAY.media)}
            src={content.imageUrl}
            alt={content.imageAlt}
            loading='lazy'
            decoding='async'
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        <div className='flex min-w-0 flex-col items-start @3xl:flex-1'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='logoUrl'
            data-motion='fade-up'
            data-motion-distance='20'
            data-motion-duration='0.6'
            data-motion-delay={String(DELAY.logo)}
            src={content.logoUrl}
            alt={content.logoAlt}
            loading='lazy'
            decoding='async'
            className={selectableClass(
              activeKey === 'logoUrl',
              'the-grand-about__logo pointer-events-auto'
            )}
            style={composeStyle(
              {
                display: 'block',
                width: RESPONSIVE.logoW,
                height: 'auto',
                marginBottom: RESPONSIVE.logoMb,
              },
              styleOf('logoUrl')
            )}
          />

          <h2
            data-element-key='heading'
            data-motion='line-reveal'
            data-motion-duration='0.9'
            data-motion-delay={String(DELAY.heading)}
            className={selectableClass(
              activeKey === 'heading',
              'the-grand-about__heading pointer-events-auto'
            )}
            style={composeStyle(
              {
                margin: 0,
                marginBottom: RESPONSIVE.headingMb,
                fontFamily: SERIF,
                fontSize: RESPONSIVE.headingFont,
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: '0.005em',
                color: COLORS.text,
              },
              styleOf('heading')
            )}
          >
            {content.heading}
          </h2>

          <p
            data-element-key='description'
            data-motion='fade-up'
            data-motion-distance='24'
            data-motion-duration='0.7'
            data-motion-delay={String(DELAY.description)}
            className={selectableClass(
              activeKey === 'description',
              'the-grand-about__desc pointer-events-auto'
            )}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: SANS,
                fontSize: RESPONSIVE.descFont,
                fontWeight: 400,
                lineHeight: 1.8,
                color: COLORS.muted,
              },
              styleOf('description')
            )}
          >
            {content.description}
          </p>

          <div
            data-element-key='rule'
            data-motion='line-draw'
            data-motion-trigger='in-view'
            data-motion-axis='x'
            data-motion-duration='0.8'
            data-motion-delay={String(DELAY.rule)}
            className={selectableClass(
              activeKey === 'rule',
              'the-grand-about__rule pointer-events-auto'
            )}
            style={composeStyle(
              {
                width: '100%',
                height: 1,
                marginTop: RESPONSIVE.ruleMy,
                marginBottom: RESPONSIVE.ruleMy,
                backgroundColor: COLORS.rule,
              },
              styleOf('rule')
            )}
          />

          <ul
            className='flex list-none flex-row flex-wrap'
            style={{ margin: 0, padding: 0, gap: RESPONSIVE.partnerGap }}
          >
            {partners.map((partner, i) => {
              const logoKey = `partners[${i}].logo`;
              const roleKey = `partners[${i}].role`;
              const delay = DELAY.partnersBase + i * DELAY.partnersStep;

              return (
                <li
                  key={`${partner.name}-${i}`}
                  data-motion='fade-up'
                  data-motion-distance='18'
                  data-motion-duration='0.6'
                  data-motion-delay={delay.toFixed(2)}
                  className='flex flex-col items-start'
                  style={{ gap: 12 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    data-element-key={logoKey}
                    src={partner.logo}
                    alt={partner.name}
                    loading='lazy'
                    decoding='async'
                    className={selectableClass(
                      activeKey === logoKey,
                      'the-grand-about__partner-logo pointer-events-auto'
                    )}
                    style={composeStyle(
                      {
                        display: 'block',
                        height: RESPONSIVE.partnerLogoH,
                        width: 'auto',
                        maxWidth: 200,
                        objectFit: 'contain',
                      },
                      styleOf(logoKey)
                    )}
                  />

                  <span
                    data-element-key={roleKey}
                    className={selectableClass(
                      activeKey === roleKey,
                      'the-grand-about__partner-role pointer-events-auto'
                    )}
                    style={composeStyle(
                      {
                        fontFamily: SANS,
                        fontSize: RESPONSIVE.partnerRoleFont,
                        color: COLORS.muted,
                      },
                      styleOf(roleKey)
                    )}
                  >
                    {partner.role}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
