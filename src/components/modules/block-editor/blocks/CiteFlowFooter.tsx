'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';
import { findFont } from '@/lib/fonts';

import type {
  BlockBackground,
  CiteFlowFooterContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useLandingMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import { CITE_FLOW_FONT_CSS, CITE_FLOW_FONT_HEADING } from './citeFlowTheme';

interface CiteFlowFooterProps {
  content: CiteFlowFooterContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const DEFAULT_HEADING = 'Say Hello!';
const DEFAULT_EMAIL = 'info@ecoparkonsen.com';
const DEFAULT_MENU_LABEL = 'Menu';
const DEFAULT_MENU_LINK_1_LABEL = 'Home';
const DEFAULT_MENU_LINK_1_HREF = '/';
const DEFAULT_MENU_LINK_2_LABEL = 'Contact';
const DEFAULT_MENU_LINK_2_HREF = '/contact';
const DEFAULT_SOCIAL_LABEL = 'Social Media';
const DEFAULT_SOCIAL_LINK_1_LABEL = 'LinkedIn';
const DEFAULT_SOCIAL_LINK_1_HREF = '#';
const DEFAULT_SOCIAL_LINK_2_LABEL = 'Behance';
const DEFAULT_SOCIAL_LINK_2_HREF = '#';
const DEFAULT_SOCIAL_LINK_3_LABEL = 'YouTube';
const DEFAULT_SOCIAL_LINK_3_HREF = '#';
const DEFAULT_LOGO_URL = '/cite-flow/ecopark-logo.png';
const DEFAULT_LOGO_ALT = 'Ecopark Onsen';

const HEADING_FONT_FAMILY = findFont('abril-fatface').family;

const HEADING_STYLE: React.CSSProperties = {
  color: '#ffffff',
  fontFamily: HEADING_FONT_FAMILY,
  fontWeight: 400,
  lineHeight: 1.1,
};

const LABEL_STYLE: React.CSSProperties = {
  color: '#ffffff',
  fontFamily: CITE_FLOW_FONT_HEADING,
  fontWeight: 400,
  letterSpacing: '-0.16px',
};

const LINK_STYLE: React.CSSProperties = {
  color: '#ffffff',
  fontFamily: CITE_FLOW_FONT_HEADING,
  fontWeight: 400,
};

function FooterLink({
  elementKey,
  href,
  style,
  className,
  isActive,
  isCanvas,
  children,
}: {
  elementKey: string;
  href: string;
  style?: React.CSSProperties;
  className: string;
  isActive: boolean;
  isCanvas: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      data-element-key={elementKey}
      style={style}
      className={selectableClass(
        isActive,
        cn('relative inline-block w-fit', !isCanvas && 'group', className)
      )}
    >
      {children}
      {!isCanvas && (
        <>
          <span className='absolute top-0 left-0 h-px w-0 bg-white transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full' />
          <span className='absolute bottom-0 left-0 h-px w-0 bg-white transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full' />
        </>
      )}
    </a>
  );
}

export function CiteFlowFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CiteFlowFooterProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isCanvas = useIsCanvasEdit(rootRef);
  const { requestRefresh } = useLandingMotion();

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const heading = content.heading?.trim() || DEFAULT_HEADING;
  const email = content.email?.trim() || DEFAULT_EMAIL;
  const menuLabel = content.menuLabel?.trim() || DEFAULT_MENU_LABEL;
  const menuLink1Label =
    content.menuLink1Label?.trim() || DEFAULT_MENU_LINK_1_LABEL;
  const menuLink1Href =
    content.menuLink1Href?.trim() || DEFAULT_MENU_LINK_1_HREF;
  const menuLink2Label =
    content.menuLink2Label?.trim() || DEFAULT_MENU_LINK_2_LABEL;
  const menuLink2Href =
    content.menuLink2Href?.trim() || DEFAULT_MENU_LINK_2_HREF;
  const socialLabel = content.socialLabel?.trim() || DEFAULT_SOCIAL_LABEL;
  const socialLink1Label =
    content.socialLink1Label?.trim() || DEFAULT_SOCIAL_LINK_1_LABEL;
  const socialLink1Href =
    content.socialLink1Href?.trim() || DEFAULT_SOCIAL_LINK_1_HREF;
  const socialLink2Label =
    content.socialLink2Label?.trim() || DEFAULT_SOCIAL_LINK_2_LABEL;
  const socialLink2Href =
    content.socialLink2Href?.trim() || DEFAULT_SOCIAL_LINK_2_HREF;
  const socialLink3Label =
    content.socialLink3Label?.trim() || DEFAULT_SOCIAL_LINK_3_LABEL;
  const socialLink3Href =
    content.socialLink3Href?.trim() || DEFAULT_SOCIAL_LINK_3_HREF;
  const logoUrl = content.logoUrl?.trim() || DEFAULT_LOGO_URL;
  const logoAlt = content.logoAlt?.trim() || DEFAULT_LOGO_ALT;

  const linkTextClass =
    'text-[16px] leading-[22.4px] @2xl:text-[18px] @2xl:leading-[27px]';
  const labelClass =
    'text-[20px] leading-[24px] @4xl:text-[24px] @4xl:leading-[28.8px]';

  const footerBody = (
    <div className='flex w-full max-w-[1720px] flex-col gap-6.25 px-5 py-15 @2xl:gap-12.5 @2xl:py-12.5'>
      <div className='flex flex-col items-center gap-3.75 text-center @2xl:text-left @4xl:flex-row @4xl:items-end @4xl:justify-between @4xl:gap-5'>
        <h2
          data-element-key='heading'
          style={composeStyle(HEADING_STYLE, styleOf('heading'))}
          className={selectableClass(
            activeKey === 'heading',
            'text-[40px] leading-15 @2xl:text-[50px]'
          )}
        >
          {heading}
        </h2>
        <a
          href={`mailto:${email}`}
          data-element-key='email'
          style={composeStyle(HEADING_STYLE, styleOf('email'))}
          className={selectableClass(
            activeKey === 'email',
            'max-w-full min-w-0 text-[40px] leading-15 wrap-break-word @2xl:text-[50px]'
          )}
        >
          {email}
        </a>
      </div>

      <div className='h-px w-full bg-white/30' />

      <div className='flex flex-col gap-7.5'>
        <div className='flex flex-col gap-7.5 @2xl:flex-row @2xl:gap-23.75 @2xl:pr-25'>
          <div className='flex flex-col gap-3.75 @2xl:max-w-25'>
            <p
              data-element-key='menuLabel'
              style={composeStyle(LABEL_STYLE, styleOf('menuLabel'))}
              className={selectableClass(activeKey === 'menuLabel', labelClass)}
            >
              {menuLabel}
            </p>
            <div className='flex flex-col gap-2'>
              <FooterLink
                elementKey='menuLink1Label'
                href={menuLink1Href}
                style={composeStyle(LINK_STYLE, styleOf('menuLink1Label'))}
                className={linkTextClass}
                isActive={activeKey === 'menuLink1Label'}
                isCanvas={isCanvas}
              >
                {menuLink1Label}
              </FooterLink>
              <FooterLink
                elementKey='menuLink2Label'
                href={menuLink2Href}
                style={composeStyle(LINK_STYLE, styleOf('menuLink2Label'))}
                className={linkTextClass}
                isActive={activeKey === 'menuLink2Label'}
                isCanvas={isCanvas}
              >
                {menuLink2Label}
              </FooterLink>
            </div>
          </div>

          <div className='flex flex-col gap-3.75 @4xl:max-w-40 @4xl:gap-7.5'>
            <p
              data-element-key='socialLabel'
              style={composeStyle(LABEL_STYLE, styleOf('socialLabel'))}
              className={selectableClass(
                activeKey === 'socialLabel',
                labelClass
              )}
            >
              {socialLabel}
            </p>
            <div className='flex flex-col gap-2'>
              <FooterLink
                elementKey='socialLink1Label'
                href={socialLink1Href}
                style={composeStyle(LINK_STYLE, styleOf('socialLink1Label'))}
                className={linkTextClass}
                isActive={activeKey === 'socialLink1Label'}
                isCanvas={isCanvas}
              >
                {socialLink1Label}
              </FooterLink>
              <FooterLink
                elementKey='socialLink2Label'
                href={socialLink2Href}
                style={composeStyle(LINK_STYLE, styleOf('socialLink2Label'))}
                className={linkTextClass}
                isActive={activeKey === 'socialLink2Label'}
                isCanvas={isCanvas}
              >
                {socialLink2Label}
              </FooterLink>
              <FooterLink
                elementKey='socialLink3Label'
                href={socialLink3Href}
                style={composeStyle(LINK_STYLE, styleOf('socialLink3Label'))}
                className={linkTextClass}
                isActive={activeKey === 'socialLink3Label'}
                isCanvas={isCanvas}
              >
                {socialLink3Label}
              </FooterLink>
            </div>
          </div>

          <div className='min-h-40 @4xl:hidden' />
        </div>

        <div className='flex items-center justify-center @2xl:gap-13 @4xl:justify-between'>
          <div className='hidden @4xl:flex @4xl:min-w-36' />
          <div className='relative z-4 w-full max-w-250'>
            <div className='mx-auto max-w-226'>
              <div className='h-auto overflow-hidden @2xl:h-32 @4xl:h-40.5'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-element-key='logoUrl'
                  src={logoUrl}
                  alt={logoAlt}
                  onLoad={requestRefresh}
                  style={composeStyle(
                    { objectFit: 'contain', width: '100%', height: '100%' },
                    styleOf('logoUrl')
                  )}
                  className={selectableClass(activeKey === 'logoUrl', '')}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        style={blockBackgroundStyle(background)}
        className={cn(
          '@container relative flex w-full flex-col items-center justify-center bg-[#1a1919]',
          className
        )}
      >
        <style>{CITE_FLOW_FONT_CSS}</style>
        {footerBody}
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn('@container relative w-full bg-[#1a1919]', className)}
    >
      <style>{CITE_FLOW_FONT_CSS}</style>
      <div className='relative h-[170vh] w-full @2xl:h-auto @4xl:h-[200vh]'>
        <div className='sticky top-0 flex h-auto w-full flex-col justify-center @2xl:static @4xl:sticky @4xl:h-dvh'>
          {footerBody}
        </div>
      </div>
    </section>
  );
}
