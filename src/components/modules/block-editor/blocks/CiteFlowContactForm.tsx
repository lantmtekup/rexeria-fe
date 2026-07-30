'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  CiteFlowContactFormContent,
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
import { useIsCanvasEdit } from './useIsCanvasEdit';
import { useMotionAttributes } from '../motion/useMotionAttributes';
import { CITE_FLOW_FONT_CSS, CITE_FLOW_FONT_HEADING } from './citeFlowTheme';

interface CiteFlowContactFormProps {
  content: CiteFlowContactFormContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const DEFAULT_HEADING = 'Connect now';
const DEFAULT_INTRO_TEXT =
  'Do you want to find out more about the project, connect with us now.';
const DEFAULT_CONTACT_EMAIL_VALUE = 'info@ecoparkonsen.com';
const DEFAULT_CONTACT_PHONE_VALUE = '+84 24 3543 6789';
const DEFAULT_CONTACT_ADDRESS_VALUE = 'Ecopark, Van Giang, Hung Yen, Vietnam';
const DEFAULT_NAME_LABEL = 'Name';
const DEFAULT_NAME_PLACEHOLDER = 'Enter your name';
const DEFAULT_EMAIL_LABEL = 'Email';
const DEFAULT_EMAIL_PLACEHOLDER = 'Enter your mail';
const DEFAULT_MESSAGE_LABEL = 'Message';
const DEFAULT_MESSAGE_PLACEHOLDER = 'Message';
const DEFAULT_SUBMIT_TEXT = 'Send message';
const DEFAULT_SUBMITTED_TEXT = 'Message sent';

const TEXT_STYLE: React.CSSProperties = {
  color: '#1a1919',
  fontFamily: CITE_FLOW_FONT_HEADING,
  fontWeight: 400,
};

const HEADING_STYLE: React.CSSProperties = {
  ...TEXT_STYLE,
  lineHeight: 1,
};

const INTRO_STYLE: React.CSSProperties = {
  ...TEXT_STYLE,
  color: '#6e6d6d',
};

const LABEL_STYLE: React.CSSProperties = {
  ...TEXT_STYLE,
  letterSpacing: '-0.16px',
};

const FIELD_STYLE: React.CSSProperties = {
  ...TEXT_STYLE,
  width: '100%',
  background: 'transparent',
  borderBottom: '1px solid #1a1919',
  paddingBottom: 14,
  outline: 'none',
};

function contactHref(kind: 'email' | 'phone' | 'address', value: string) {
  if (kind === 'email') return `mailto:${value}`;
  if (kind === 'phone') return `tel:${value.replace(/[^\d+]/g, '')}`;
  return undefined;
}

export function CiteFlowContactForm({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CiteFlowContactFormProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isCanvas = useIsCanvasEdit(rootRef);
  const [status, setStatus] = React.useState<'idle' | 'submitted'>('idle');
  useMotionAttributes(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const heading = content.heading?.trim() || DEFAULT_HEADING;
  const introText = content.introText?.trim() || DEFAULT_INTRO_TEXT;
  const contactEmailValue =
    content.contactEmailValue?.trim() || DEFAULT_CONTACT_EMAIL_VALUE;
  const contactPhoneValue =
    content.contactPhoneValue?.trim() || DEFAULT_CONTACT_PHONE_VALUE;
  const contactAddressValue =
    content.contactAddressValue?.trim() || DEFAULT_CONTACT_ADDRESS_VALUE;
  const nameLabel = content.nameLabel?.trim() || DEFAULT_NAME_LABEL;
  const namePlaceholder =
    content.namePlaceholder?.trim() || DEFAULT_NAME_PLACEHOLDER;
  const emailLabel = content.emailLabel?.trim() || DEFAULT_EMAIL_LABEL;
  const emailPlaceholder =
    content.emailPlaceholder?.trim() || DEFAULT_EMAIL_PLACEHOLDER;
  const messageLabel = content.messageLabel?.trim() || DEFAULT_MESSAGE_LABEL;
  const messagePlaceholder =
    content.messagePlaceholder?.trim() || DEFAULT_MESSAGE_PLACEHOLDER;
  const submitText = content.submitText?.trim() || DEFAULT_SUBMIT_TEXT;
  const submittedText = content.submittedText?.trim() || DEFAULT_SUBMITTED_TEXT;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isCanvas) return;
    setStatus('submitted');
  };

  const labelClass = 'text-xl tracking-[-0.16px] @4xl:text-2xl';

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container flex w-full flex-col items-center bg-neutral-100',
        className
      )}
    >
      <style>{CITE_FLOW_FONT_CSS}</style>
      <div className='w-full px-5 pt-40 pb-15 @4xl:pt-45 @4xl:pb-25'>
        <div
          data-motion='fade-in'
          data-motion-duration='1.4'
          data-motion-ease='sine.out'
          className='mx-auto flex w-full max-w-[1720px] flex-col gap-7.5 @4xl:flex-row @4xl:items-start @4xl:gap-15'
        >
          <div className='flex w-full flex-1 flex-col gap-7.5 @4xl:min-w-150 @4xl:gap-5 @4xl:text-left'>
            <h1
              data-element-key='heading'
              style={composeStyle(HEADING_STYLE, styleOf('heading'))}
              className={selectableClass(
                activeKey === 'heading',
                'w-full text-[60px] font-normal @4xl:text-[90px] @4xl:leading-22.5'
              )}
            >
              {heading}
            </h1>

            <div className='flex h-min w-full flex-col gap-5'>
              <div className='flex h-min min-h-5.5 w-full @2xl:min-h-9' />
              <div className='flex flex-col items-start gap-2.5'>
                <a
                  href={contactHref('email', contactEmailValue)}
                  data-element-key='contactEmailValue'
                  style={composeStyle(TEXT_STYLE, styleOf('contactEmailValue'))}
                  className={selectableClass(
                    activeKey === 'contactEmailValue',
                    'text-sm transition-colors duration-400 ease-[cubic-bezier(0.44,0,0.56,1)] hover:text-[#1a1919]/70 @4xl:text-base'
                  )}
                >
                  {contactEmailValue}
                </a>
                <a
                  href={contactHref('phone', contactPhoneValue)}
                  data-element-key='contactPhoneValue'
                  style={composeStyle(TEXT_STYLE, styleOf('contactPhoneValue'))}
                  className={selectableClass(
                    activeKey === 'contactPhoneValue',
                    'text-sm transition-colors duration-400 ease-[cubic-bezier(0.44,0,0.56,1)] hover:text-[#1a1919]/70 @4xl:text-base'
                  )}
                >
                  {contactPhoneValue}
                </a>
                <p
                  data-element-key='contactAddressValue'
                  style={composeStyle(
                    TEXT_STYLE,
                    styleOf('contactAddressValue')
                  )}
                  className={selectableClass(
                    activeKey === 'contactAddressValue',
                    'text-sm @4xl:text-base'
                  )}
                >
                  {contactAddressValue}
                </p>
              </div>
            </div>
          </div>

          <div className='flex w-full flex-1 flex-col gap-7.5 @4xl:max-w-235 @4xl:gap-20'>
            <p
              data-element-key='introText'
              style={composeStyle(INTRO_STYLE, styleOf('introText'))}
              className={selectableClass(
                activeKey === 'introText',
                'text-base leading-[22.4px] font-normal @4xl:text-[18px] @4xl:leading-6.75'
              )}
            >
              {introText}
            </p>

            <form
              onSubmit={handleSubmit}
              className='flex flex-col justify-start gap-5 @2xl:gap-12.5'
            >
              <div className='flex flex-col gap-6.25 @2xl:gap-6'>
                <label className='flex flex-col gap-3.75 @2xl:gap-6.25'>
                  <span
                    data-element-key='nameLabel'
                    style={composeStyle(LABEL_STYLE, styleOf('nameLabel'))}
                    className={selectableClass(
                      activeKey === 'nameLabel',
                      labelClass
                    )}
                  >
                    {nameLabel}
                  </span>
                  <input
                    type='text'
                    name='name'
                    placeholder={namePlaceholder}
                    required
                    style={FIELD_STYLE}
                    className='text-sm placeholder:text-[#1a1919] focus:border-b-2 @4xl:text-base'
                  />
                </label>

                <label className='flex flex-col gap-3.75 @2xl:gap-6.25'>
                  <span
                    data-element-key='emailLabel'
                    style={composeStyle(LABEL_STYLE, styleOf('emailLabel'))}
                    className={selectableClass(
                      activeKey === 'emailLabel',
                      labelClass
                    )}
                  >
                    {emailLabel}
                  </span>
                  <input
                    type='email'
                    name='email'
                    placeholder={emailPlaceholder}
                    required
                    style={FIELD_STYLE}
                    className='text-sm placeholder:text-[#1a1919] focus:border-b-2 @4xl:text-base'
                  />
                </label>

                <label className='flex flex-col gap-3.75 @2xl:gap-6.25'>
                  <span
                    data-element-key='messageLabel'
                    style={composeStyle(LABEL_STYLE, styleOf('messageLabel'))}
                    className={selectableClass(
                      activeKey === 'messageLabel',
                      labelClass
                    )}
                  >
                    {messageLabel}
                  </span>
                  <textarea
                    name='message'
                    placeholder={messagePlaceholder}
                    rows={3}
                    required
                    style={{
                      ...FIELD_STYLE,
                      paddingBottom: 0,
                      resize: 'vertical',
                    }}
                    className='text-sm placeholder:text-[#1a1919] focus:border-b-2 @4xl:text-base'
                  />
                </label>
              </div>

              <button
                type={isCanvas ? 'button' : 'submit'}
                data-element-key='submitText'
                style={composeStyle(TEXT_STYLE, styleOf('submitText'))}
                className={selectableClass(
                  activeKey === 'submitText',
                  'group flex w-fit cursor-pointer items-center gap-3.75 text-sm font-normal @4xl:text-base'
                )}
              >
                {status === 'submitted' ? submittedText : submitText}
                <span className='flex h-11 w-11 items-center justify-center rounded-full bg-[#1a1919]'>
                  <ArrowRight className='h-4 w-4 text-neutral-100' />
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
