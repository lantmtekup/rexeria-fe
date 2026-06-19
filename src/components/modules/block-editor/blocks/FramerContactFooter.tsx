import * as React from 'react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerContactFooterContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface FramerContactFooterProps {
  content: FramerContactFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Contact Footer (Framer), framer-native. Port từ `src/blocks/framer-contact-footer`:
 * nền đen, greeting italic cực to + email xanh lá (#00940c), lưới nav/social,
 * copyright phía dưới. Responsive bằng container-query.
 */
const GREETING_STYLE: React.CSSProperties = {
  fontFamily: "'Aboreto', sans-serif",
  fontSize: 'clamp(40px, 10cqi, 180px)',
  fontStyle: 'italic',
  fontWeight: 400,
  lineHeight: 1,
  color: '#ffffff',
  letterSpacing: '-0.03em',
  margin: 0,
};

const EMAIL_STYLE: React.CSSProperties = {
  fontFamily: "'Aboreto', sans-serif",
  fontSize: 'clamp(22px, 5cqi, 72px)',
  fontWeight: 400,
  lineHeight: 1.1,
  color: '#00940c',
  textDecoration: 'none',
  display: 'inline-block',
  wordBreak: 'break-all',
};

const COPYRIGHT_STYLE: React.CSSProperties = {
  fontSize: 12,
  color: '#666666',
};

const LINK_LABEL_STYLE: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#777777',
};

const LINK_ITEM_STYLE: React.CSSProperties = {
  color: '#ffffff',
  textDecoration: 'none',
  fontSize: 15,
};

export function FramerContactFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerContactFooterProps) {
  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const navLinks: Array<{ label: string; href: string }> = Array.isArray(
    content.navLinks
  )
    ? content.navLinks
    : [];
  const socialLinks: Array<{ label: string; href: string }> = Array.isArray(
    content.socialLinks
  )
    ? content.socialLinks
    : [];

  return (
    <div
      style={blockBackgroundStyle(background)}
      className={cn(
        'animate-in fade-in zoom-in-95 @container relative w-full overflow-hidden bg-[#0a0a0a] duration-700 ease-out',
        className
      )}
    >
      <div
        style={{
          padding:
            'clamp(80px, 12cqi, 180px) clamp(24px, 5cqi, 80px) clamp(32px, 5cqi, 60px)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Greeting */}
          <h2
            data-element-key='greeting'
            style={composeStyle(GREETING_STYLE, styleOf('greeting'))}
            className={selectableClass(
              activeKey === 'greeting',
              'mb-[clamp(20px,4cqi,48px)]'
            )}
          >
            {content.greeting}
          </h2>

          {/* Email */}
          <div
            data-element-key='email'
            style={composeStyle(EMAIL_STYLE, styleOf('email'))}
            className={selectableClass(
              activeKey === 'email',
              'mb-[clamp(48px,10cqi,120px)] block'
            )}
          >
            <span style={{ color: '#00940c' }}>{content.email}</span>
          </div>

          {/* Link grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'clamp(32px, 4cqi, 64px)',
              paddingTop: 'clamp(32px, 5cqi, 60px)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Nav links */}
            <div>
              <div style={LINK_LABEL_STYLE} className='mb-4'>
                Menu
              </div>
              <div className='flex flex-col gap-2.5'>
                {navLinks.map((link, i) => (
                  <div
                    key={i}
                    data-element-key={`navLinks.${i}`}
                    style={composeStyle(
                      LINK_ITEM_STYLE,
                      styleOf(`navLinks.${i}`)
                    )}
                    className={selectableClass(activeKey === `navLinks.${i}`)}
                  >
                    <span style={{ color: '#ffffff' }}>{link.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div>
              <div style={LINK_LABEL_STYLE} className='mb-4'>
                Social
              </div>
              <div className='flex flex-col gap-2.5'>
                {socialLinks.map((link, i) => (
                  <div
                    key={i}
                    data-element-key={`socialLinks.${i}`}
                    style={composeStyle(
                      LINK_ITEM_STYLE,
                      styleOf(`socialLinks.${i}`)
                    )}
                    className={selectableClass(
                      activeKey === `socialLinks.${i}`
                    )}
                  >
                    <span style={{ color: '#ffffff' }}>{link.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div
            data-element-key='copyright'
            style={composeStyle(
              COPYRIGHT_STYLE,
              {
                marginTop: 'clamp(40px, 6cqi, 80px)',
                paddingTop: 24,
                borderTop: '1px solid rgba(255,255,255,0.08)',
              },
              styleOf('copyright')
            )}
            className={selectableClass(activeKey === 'copyright')}
          >
            {content.copyright}
          </div>
        </div>
      </div>
    </div>
  );
}
