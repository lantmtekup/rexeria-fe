'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';

import { cn } from '@/lib/cn';
import { findFont } from '@/lib/fonts';

import type {
  BlockBackground,
  CiteFlowFaqContent,
  CiteFlowFaqItem,
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
import { CITE_FLOW_FONT_CSS, CITE_FLOW_FONT_HEADING } from './citeFlowTheme';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import { useMotionAttributes } from '../motion/useMotionAttributes';

interface CiteFlowFaqProps {
  content: CiteFlowFaqContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const HEADING_FONT_FAMILY = findFont('abril-fatface').family;

const DEFAULT_HEADING = 'Have some questions?';
const DEFAULT_CTA_TEXT = 'Ask a question';
const DEFAULT_CTA_LINK = '#';

const DEFAULT_ITEMS: CiteFlowFaqItem[] = [
  {
    question: 'What makes Ecopark Onsen different?',
    answer:
      "Ecopark Onsen is Vietnam's first onsen-integrated residencial complex, inspired by traditional Japanese hot-spring culture and designed in harmony with Ecopark's lush, green ecosystem.",
  },
  {
    question: 'Are the onsen pools natrual hot springs or articially heated?',
    answer:
      'While the mineral content and water quality are scientifically engieered to replicate authentic Japanese onsen minerals, the pools are artificially temperatur-controlled to ensure consistent wellness.',
  },
  {
    question: 'Is the onsen experience private or shared?',
    answer:
      'Residents can enjoy both private and communal onsen experiences:\nPrivate Onsen Suites: Select residences feature exclusive indoor soaking tubs directly connected to your living space, offering complete privacy and tranquility.\nPublic Wellness Pavilion: A beautifully designed onsen zone with 13 soaking pools, each offering unique therapeutic properties (e.g., relaxation, skin rejuvenation, muscle recovery).',
  },
  {
    question: 'Who can use the Onsen and Wellness facilities?',
    answer:
      'The onsen and wellness facilities are exclusively available to Ecopark Onsen residents adn their guests; full access to the saunas, mediation rooms, and spa lounges.',
  },
];

const resolveItems = (content: CiteFlowFaqContent): CiteFlowFaqItem[] => {
  const items = content.items;
  if (Array.isArray(items) && items.length > 0) return items;
  return DEFAULT_ITEMS;
};

const HEADING_BASE_STYLE: React.CSSProperties = {
  color: '#1a1919',
  fontWeight: 400,
  fontFamily: HEADING_FONT_FAMILY,
};

const BODY_BASE_STYLE: React.CSSProperties = {
  fontFamily: CITE_FLOW_FONT_HEADING,
};

export function CiteFlowFaq({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CiteFlowFaqProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = React.useState(0);
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const items = React.useMemo(() => resolveItems(content), [content]);
  const heading = content.heading?.trim() || DEFAULT_HEADING;
  const ctaText = content.ctaText?.trim() || DEFAULT_CTA_TEXT;
  const ctaLink = content.ctaLink?.trim() || DEFAULT_CTA_LINK;

  useMotionAttributes(rootRef);

  return (
    <div className='@container w-full'>
      <section
        ref={rootRef}
        style={blockBackgroundStyle(background)}
        className={cn(
          'relative z-10 flex w-full flex-row items-center rounded-b-2xl bg-neutral-100 px-5 py-15 @4xl:pt-25 @4xl:pb-50',
          !isCanvas && '@4xl:mb-[max(-100vh,-720px)]',
          className
        )}
      >
        <style>{CITE_FLOW_FONT_CSS}</style>
        <div
          data-motion='fade-in'
          data-motion-once='true'
          data-motion-duration='1.4'
          data-motion-ease='sine.out'
          className='mx-auto flex w-full max-w-[1720px] flex-col items-center gap-10 @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:gap-0'
        >
          <div className='flex w-full flex-1 flex-col items-center gap-2.5 text-left @4xl:max-w-165 @4xl:items-start @4xl:gap-5'>
            <h2
              data-element-key='heading'
              style={composeStyle(HEADING_BASE_STYLE, styleOf('heading'))}
              className={selectableClass(
                activeKey === 'heading',
                'text-center text-[60px] leading-none @4xl:text-left @4xl:text-[85px] @4xl:leading-[93.5px]'
              )}
            >
              {heading}
            </h2>
            <a
              href={ctaLink}
              onClick={e => e.preventDefault()}
              data-element-key='ctaText'
              style={composeStyle(BODY_BASE_STYLE, styleOf('ctaText'))}
              className={selectableClass(
                activeKey === 'ctaText',
                'group flex items-center gap-3.75 text-[16px] leading-[22.4px] text-[#1a1919]'
              )}
            >
              {ctaText}
              <span className='flex h-11 w-11 items-center justify-center rounded-full bg-[#1a1919]'>
                <ArrowRight className='h-4 w-4 text-neutral-100' />
              </span>
            </a>
          </div>

          <div className='flex w-full max-w-235 flex-1 flex-col gap-6.25'>
            {items.map((item, i) => {
              const isOpen = openIndex === i;
              const questionKey = `items[${i}].question`;
              const answerKey = `items[${i}].answer`;
              return (
                <div
                  key={`${item.question}-${i}`}
                  className='flex w-full flex-col rounded-2xl bg-white p-7'
                >
                  <button
                    type='button'
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className='flex w-full cursor-pointer items-center justify-between gap-6 text-left @2xl:gap-0'
                  >
                    <span
                      data-element-key={questionKey}
                      style={composeStyle(
                        BODY_BASE_STYLE,
                        styleOf(questionKey)
                      )}
                      className={selectableClass(
                        activeKey === questionKey,
                        'text-xl tracking-[-0.16px] text-[#1a1919] @4xl:text-2xl'
                      )}
                    >
                      {item.question}
                    </span>
                    <span className='relative flex h-10.25 w-10.25 flex-none items-center justify-center rounded-full bg-[#1a1919]'>
                      <span className='absolute h-px w-4 bg-neutral-100' />
                      <span
                        className={cn(
                          'absolute h-px w-4 bg-neutral-100 transition-transform duration-500 ease-in-out',
                          isOpen ? 'rotate-0' : 'rotate-90'
                        )}
                      />
                    </span>
                  </button>
                  <div
                    className='grid transition-[grid-template-rows] duration-500 ease-in-out'
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div
                      className={cn(
                        'overflow-hidden transition-opacity duration-500 ease-in-out',
                        isOpen ? 'opacity-100' : 'opacity-0'
                      )}
                    >
                      <p
                        data-element-key={answerKey}
                        style={composeStyle(
                          BODY_BASE_STYLE,
                          styleOf(answerKey)
                        )}
                        className={selectableClass(
                          activeKey === answerKey,
                          'pt-6.25 text-base leading-6.75 whitespace-pre-line text-[#6e6d6d] @4xl:text-lg'
                        )}
                      >
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
