'use client';

/**
 * Flat White — "Our Process": nền #747E90, label pill "/ OUR PROCESS",
 * headline lớn (clamp font-size theo cqi), 3 step card dọc (pill number +
 * title + body màu #D6D9E2), và SVG divider cong động (2 lớp: base track
 * rgba(255,255,255,0.1) + overlay animated #FFFFFF). Port từ
 * `recon-flat-white-our-process/spec.md` (Flat White framer site).
 *
 * Animation GSAP R1–R6 qua `useBlockMotion`:
 *   - Label pill + headline: word-by-word reveal (opacity + x), duration
 *     0.3s, stagger 0.1s, ease ≈ power3.out (Framer `cubic-bezier(.22,1,.36,1)`).
 *   - Mỗi step card: fade-in khi vào viewport (opacity + y, duration 0.8s,
 *     ease power2.out, toggleActions reverse). Đồng thời parallax scrub
 *     theo section root (`yPercent` ±6/9/12% tuần tự 3 step → cảm giác
 *     depth layer; ease 'none' + scrub 0.6s).
 *   - SVG overlay: pathLength 0 → 1 trên 3s, ease "power2.out", bắt đầu khi
 *     block vào viewport.
 *   - Reduced-motion: bail-out sớm → element hiện final state.
 *
 * Tuyền inline: mọi token (font-size/color/spacing) đi trong `style={composeStyle(...)}`,
 * responsive qua `clamp(min, N·cqi, max)`. Không `md:`/`lg:`/`vw`.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerFlatWhiteProcessContent,
  FramerFlatWhiteProcessStep,
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
  content: FramerFlatWhiteProcessContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const DEFAULT_STEPS: FramerFlatWhiteProcessStep[] = [
  {
    number: '001',
    title: 'Discover opportunities and define your priorities',
    body: 'We analyze your business, market and goals to identify key opportunities. Our approach combines industry insight, data-driven analysis and stakeholder engagement to create a clear foundation for meaningful transformation.',
  },
  {
    number: '002',
    title: 'Design actionable strategies tailored to your needs',
    body: 'We develop actionable strategies and practical solutions aligned with your vision. Each recommendation is designed to be scalable, implementable and capable of delivering measurable impact across the organization.',
  },
  {
    number: '003',
    title: 'Deliver measurable results with lasting impact',
    body: 'We implement plans alongside your team, ensuring sustainable results. Our hands-on approach includes support, monitoring and adaptation to embed changes and deliver long-term value.',
  },
];

const ROOT_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  backgroundColor: '#747E90',
  containerType: 'inline-size',
};

const CONTAINER_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 'min(1200px, 100% - 24px)',
  marginInline: 'auto',
  padding: 'clamp(60px, 11.5cqi, 164px) clamp(20px, 7.8cqi, 112px) 0',
  display: 'flex',
  flexDirection: 'column',
  gap: 'clamp(40px, 10.2cqi, 146px)',
};

const PILL_BASE_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: '#747E90',
  borderRadius: '99px',
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: 1,
  letterSpacing: 0,
  color: '#FFFFFF',
  width: 'fit-content',
};

const HEADLINE_STYLE: React.CSSProperties = {
  fontFamily:
    '"Inter", "Inter Placeholder", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  fontSize: 'clamp(36px, 7.8cqi, 64px)',
  fontWeight: 400,
  lineHeight: 1,
  letterSpacing: '-0.06em',
  color: '#FFFFFF',
  margin: 0,
  maxWidth: 'min(1192px, 100%)',
};

const HAIRLINE_STYLE: React.CSSProperties = {
  width: '100%',
  height: '1px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: 0,
  margin: 0,
  marginTop: 'clamp(24px, 3.5cqi, 48px)',
};

const STEPS_STACK_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 'min(1200px, 100%)',
  marginInline: 'auto',
  aspectRatio: '1199 / 1434',
};

const SVG_WRAPPER_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 2,
};

const STEP_CARD_STYLE: React.CSSProperties = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: 'clamp(323px, 45cqi, 450px)',
  zIndex: 1,
};

const STEP_POSITIONS: Array<{
  top: string;
  left?: string;
  right?: string;
}> = [
  { top: '12%', right: '5%' },
  { top: '42%', left: '10%' },
  { top: '70%', right: '15%' },
];

const STEP_TITLE_STYLE: React.CSSProperties = {
  fontFamily:
    '"Inter", "Inter Placeholder", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  fontSize: 'clamp(20px, 2.7cqi, 24px)',
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: '-0.06em',
  color: '#FFFFFF',
  margin: 0,
};

const STEP_BODY_STYLE: React.CSSProperties = {
  fontFamily:
    '"Inter", "Inter Placeholder", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  fontSize: 'clamp(14px, 1.8cqi, 16px)',
  fontWeight: 400,
  lineHeight: 1.4,
  letterSpacing: '-0.02em',
  color: '#D6D9E2',
  margin: 0,
};

const DIVIDER_PATH =
  'M232.488 0C232.488 46.2989 269.981 83.8525 316.279 83.9273L975.782 84.9935C1099.37 85.1932 1199.11 186.067 1197.91 309.646C1196.73 431.828 1097.32 530.197 975.135 529.997C856.628 529.803 711.976 529.566 598.349 529.38C480.719 529.188 329.837 528.941 209.135 528.744C94.1047 528.555 0.731262 621.631 0.50032 736.661C0.269118 851.82 93.5111 945.323 208.671 945.415L861.46 945.931C970.456 946.018 1058.77 1034.4 1058.77 1143.4C1058.77 1252.98 969.54 1341.6 859.96 1340.86L628.689 1339.28C576.127 1338.93 533.326 1381.44 533.326 1434';

function tokenize(text: string): string[] {
  return text.split(/(\s+)/);
}

function WordReveal({
  text,
  baseStyle,
  className,
  activeKey,
  elementKey,
  styles,
}: {
  text: string;
  baseStyle: React.CSSProperties;
  className: string;
  activeKey?: string | null;
  elementKey: string;
  styles?: ElementStylesMap;
}) {
  const tokens = React.useMemo(() => tokenize(text), [text]);
  return (
    <span
      data-element-key={elementKey}
      data-fwp-word-wrap
      className={selectableClass(activeKey === elementKey, className)}
      style={composeStyle(baseStyle, elementStyleOf(styles, elementKey))}
    >
      {tokens.map((tok, i) =>
        tok === '' ? null : /\s+/.test(tok) ? (
          <span key={`s-${i}`}>{tok}</span>
        ) : (
          <span
            key={`w-${i}`}
            data-fwp-word
            style={{
              display: 'inline-block',
              willChange: 'transform, opacity',
            }}
          >
            {tok}
          </span>
        )
      )}
    </span>
  );
}

export function FramerFlatWhiteProcess({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const overlayPathRef = React.useRef<SVGPathElement>(null);
  const hairlineRef = React.useRef<HTMLHRElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const bgColor = content.bgColor || '#747E90';
  const textColor = content.textColor || '#FFFFFF';
  const label = content.label || 'OUR PROCESS';
  const headline = content.headline || 'Our Process';
  const steps = React.useMemo<FramerFlatWhiteProcessStep[]>(
    () =>
      Array.isArray(content.steps) && content.steps.length > 0
        ? content.steps
        : DEFAULT_STEPS,
    [content.steps]
  );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      const overlay = overlayPathRef.current;
      if (!root) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const words = root.querySelectorAll<HTMLElement>('[data-fwp-word]');
        if (words.length)
          gsap.set(words, { opacity: 1, x: 0, clearProps: 'transform' });
        if (overlay) gsap.set(overlay, { strokeDashoffset: 0 });
        if (hairlineRef.current) gsap.set(hairlineRef.current, { scaleX: 1 });
        return;
      }

      const staggerWords = (
        container: HTMLElement | null | undefined,
        duration: number,
        ease: string,
        stagger: number,
        delay: number
      ) => {
        if (!container) return;
        const words =
          container.querySelectorAll<HTMLElement>('[data-fwp-word]');
        if (!words.length) return;
        gsap.fromTo(
          words,
          { opacity: 0.001, x: 10 },
          {
            opacity: 1,
            x: 0,
            duration,
            ease,
            stagger,
            delay,
            scrollTrigger: {
              trigger: container,
              scroller,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      };

      const labelEl = root.querySelector<HTMLElement>('.fwp-label');
      staggerWords(labelEl, 0.3, 'power3.out', 0.1, 0);

      const headlineEl = root.querySelector<HTMLElement>('.fwp-headline');
      staggerWords(headlineEl, 0.3, 'power3.out', 0.1, 0.1);

      const PARALLAX_RANGE = [6, 9, 12] as const;
      const stepEls = root.querySelectorAll<HTMLElement>('[data-fwp-step]');
      stepEls.forEach((stepEl, i) => {
        const range = PARALLAX_RANGE[i] ?? PARALLAX_RANGE[0];

        gsap.fromTo(
          stepEl,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: stepEl,
              scroller,
              start: 'top 100%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );

        gsap.fromTo(
          stepEl,
          { yPercent: range },
          {
            yPercent: -range,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          }
        );
      });

      if (hairlineRef.current) {
        gsap.set(hairlineRef.current, {
          scaleX: 0,
          transformOrigin: 'left center',
        });
        const hairlineTl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });
        hairlineTl
          .to(hairlineRef.current, {
            scaleX: 1,
            duration: 3,
            ease: 'power2.inOut',
          })
          .addLabel('done', '+=0');
      }

      if (overlay) {
        const len = overlay.getTotalLength();
        gsap.set(overlay, { strokeDasharray: len, strokeDashoffset: len });

        const svgTl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 40%',
            end: 'bottom top',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        svgTl
          .to(overlay, {
            strokeDashoffset: 0,
            duration: 1,
            ease: 'none',
          })
          .addLabel('drawn', '+=0');
      }
    },
    [steps.length]
  );

  return (
    <section
      ref={rootRef}
      data-block='framer-flat-white-process'
      style={composeStyle(
        ROOT_STYLE,
        { backgroundColor: bgColor },
        blockBackgroundStyle(background)
      )}
      className='fwp-root @container'
    >
      <style>{`
        .fwp-root :where(h1, h2, h3, h4, p) { margin: 0; }
        .fwp-root :focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
        }
        /* Mobile (≤671px): ẩn SVG, hiển thị steps theo column thay vì absolute */
        @container (max-width: 671px) {
          .fwp-svg-wrapper { display: none !important; }
          .fwp-steps-container {
            display: flex !important;
            flex-direction: column !important;
            gap: clamp(32px, 6cqi, 48px) !important;
            aspect-ratio: unset !important;
            height: auto !important;
          }
          .fwp-step {
            position: static !important;
            width: 100% !important;
          }
        }
        /* Tablet (672px–1024px): điều chỉnh vị trí và width step */
        @container (min-width: 672px) and (max-width: 1024px) {
          .fwp-step { width: clamp(340px, 55cqi, 480px) !important; }
          .fwp-step-0 { top: 10% !important; right: 5% !important; left: auto !important; }
          .fwp-step-1 { top: 40% !important; left: 10% !important; right: auto !important; }
          .fwp-step-2 { top: 70% !important; right: 15% !important; left: auto !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fwp-root [data-fwp-word] { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <div style={CONTAINER_STYLE}>
        {/* HEADLINE GROUP: pill label + headline + hairline */}
        <div
          data-element-key='label'
          className={selectableClass(activeKey === 'label', 'fwp-label')}
          style={composeStyle(
            PILL_BASE_STYLE,
            { color: textColor },
            styleOf('label')
          )}
        >
          <span style={{ opacity: 0.7 }}>/</span>
          <WordReveal
            text={label}
            baseStyle={{}}
            className='fwp-label-words'
            activeKey={null}
            elementKey='label-text'
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <WordReveal
            text={headline}
            baseStyle={HEADLINE_STYLE}
            className='fwp-headline'
            activeKey={activeKey}
            elementKey='headline'
            styles={styles}
          />
          <hr
            ref={hairlineRef}
            data-fwp-hairline
            style={composeStyle(HAIRLINE_STYLE, styleOf('headline'))}
          />
          <div style={STEPS_STACK_STYLE} className='fwp-steps-container'>
            <div
              style={SVG_WRAPPER_STYLE}
              className='fwp-svg-wrapper'
              aria-hidden='true'
            >
              <svg
                viewBox='0 0 1199 1434'
                preserveAspectRatio='xMidYMid meet'
                width='100%'
                height='100%'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                style={{ display: 'block', overflow: 'visible' }}
              >
                <path
                  d={DIVIDER_PATH}
                  stroke='rgba(255, 255, 255, 0.1)'
                  strokeWidth={1}
                  vectorEffect='non-scaling-stroke'
                />
                <path
                  ref={overlayPathRef}
                  d={DIVIDER_PATH}
                  stroke='#cdd9df'
                  strokeWidth={1.5}
                  vectorEffect='non-scaling-stroke'
                  style={{ willChange: 'stroke-dashoffset', opacity: 0.95 }}
                />
              </svg>
            </div>

            {steps.map((step, idx) => {
              const stepKey = `step-${idx}`;
              const pos = STEP_POSITIONS[idx] ?? STEP_POSITIONS[0];
              const stepPositionStyle: React.CSSProperties = {
                top: pos.top,
                ...(pos.left !== undefined ? { left: pos.left } : {}),
                ...(pos.right !== undefined ? { right: pos.right } : {}),
              };
              return (
                <div
                  key={`${step.number}-${idx}`}
                  data-fwp-step
                  data-element-key={stepKey}
                  data-fwp-align={pos.left !== undefined ? 'left' : 'right'}
                  className={`fwp-step fwp-step-${idx} ${selectableClass(activeKey === stepKey)}`.trim()}
                  style={composeStyle(
                    STEP_CARD_STYLE,
                    stepPositionStyle,
                    styleOf(stepKey)
                  )}
                >
                  <div
                    data-element-key={`${stepKey}-pill`}
                    className={selectableClass(
                      activeKey === `${stepKey}-pill`,
                      'fwp-step-pill'
                    )}
                    style={composeStyle(
                      PILL_BASE_STYLE,
                      { color: textColor },
                      styleOf(`${stepKey}-pill`)
                    )}
                  >
                    <span style={{ opacity: 0.7 }}>/</span>
                    <span>{step.number}</span>
                  </div>

                  <WordReveal
                    text={step.title}
                    baseStyle={STEP_TITLE_STYLE}
                    className='fwp-step-title'
                    activeKey={activeKey}
                    elementKey={`${stepKey}-title`}
                    styles={styles}
                  />
                  <WordReveal
                    text={step.body}
                    baseStyle={STEP_BODY_STYLE}
                    className='fwp-step-body'
                    activeKey={activeKey}
                    elementKey={`${stepKey}-body`}
                    styles={styles}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
