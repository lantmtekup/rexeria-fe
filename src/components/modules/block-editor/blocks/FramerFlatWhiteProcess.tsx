'use client';

/**
 * Flat White — "Our Process": nền #747E90, label pill "/ OUR PROCESS",
 * headline lớn (clamp font-size theo cqi), 3 step card dọc (pill number +
 * title + body màu #D6D9E2), và SVG divider cong động (2 lớp: base track
 * rgba(255,255,255,0.1) + overlay animated). Port từ
 * `recon-flat-white-our-process/spec.md` (Flat White framer site).
 *
 * Motion (hybrid Attribute System + T3):
 *   - Label / headline: `word-reveal` via useMotionAttributes.
 *   - Hairline: `line-draw` axis=x, in-view.
 *   - Step: outer `parallax` + inner `fade-up` (1 driver / element).
 *   - SVG overlay strokeDashoffset scrub: T3 `useBlockMotion` (không có
 *     effect path-draw trong catalog).
 *
 * Tuyền inline: mọi token (font-size/color/spacing) đi trong `style={composeStyle(...)}`,
 * responsive qua `clamp(min, N·cqi, max)`. Không `md:`/`lg:`/`vw`.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import { useMotionAttributes } from '../motion/useMotionAttributes';
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

/** px ≈ former yPercent ±6/9/12 on ~card-height depth layers. */
const STEP_PARALLAX_DISTANCE = [24, 36, 48] as const;

const ROOT_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  backgroundColor: '#747E90',
  containerType: 'inline-size',
};

const CONTAINER_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 'min(1416px, 100% - 24px)',
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
  backgroundColor: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.2)',
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
  margin: 0,
};

const DIVIDER_PATH =
  'M232.488 0C232.488 46.2989 269.981 83.8525 316.279 83.9273L975.782 84.9935C1099.37 85.1932 1199.11 186.067 1197.91 309.646C1196.73 431.828 1097.32 530.197 975.135 529.997C856.628 529.803 711.976 529.566 598.349 529.38C480.719 529.188 329.837 528.941 209.135 528.744C94.1047 528.555 0.731262 621.631 0.50032 736.661C0.269118 851.82 93.5111 945.323 208.671 945.415L861.46 945.931C970.456 946.018 1058.77 1034.4 1058.77 1143.4C1058.77 1252.98 969.54 1341.6 859.96 1340.86L628.689 1339.28C576.127 1338.93 533.326 1381.44 533.326 1434';

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

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const bgColor = content.bgColor || '#747E90';
  const textColor = content.textColor || '#FFFFFF';
  const bodyTextColor = content.bodyTextColor || '#D6D9E2';
  const label = content.label || 'OUR PROCESS';
  const headline = content.headline || 'Our Process';
  const steps = React.useMemo<FramerFlatWhiteProcessStep[]>(
    () =>
      Array.isArray(content.steps) && content.steps.length > 0
        ? content.steps
        : DEFAULT_STEPS,
    [content.steps]
  );

  useMotionAttributes(rootRef, [steps.length]);

  // T3: SVG path stroke draw — không có effect catalog tương đương.
  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      const overlay = overlayPathRef.current;
      if (!root || !overlay) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(overlay, { strokeDashoffset: 0 });
        return;
      }

      const len = overlay.getTotalLength();
      gsap.set(overlay, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(overlay, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 40%',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
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
          <span
            data-motion='word-reveal'
            data-motion-duration='0.5'
            data-motion-stagger='0.03'
            data-motion-start='top 90%'
          >
            {label}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2
            data-element-key='headline'
            data-motion='word-reveal'
            data-motion-duration='0.5'
            data-motion-stagger='0.03'
            data-motion-delay='0.1'
            data-motion-start='top 90%'
            className={selectableClass(
              activeKey === 'headline',
              'fwp-headline'
            )}
            style={composeStyle(HEADLINE_STYLE, styleOf('headline'))}
          >
            {headline}
          </h2>
          <hr
            data-fwp-hairline
            data-motion='line-draw'
            data-motion-axis='x'
            data-motion-trigger='in-view'
            data-motion-duration='3'
            data-motion-ease='power2.inOut'
            data-motion-start='top 80%'
            data-motion-trigger-target='root'
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
              // Defensive guard: STEP_POSITIONS chỉ có 3 entry khớp với 3 step
              // mặc định. Nếu content có > 3 step, các step dư xếp tuyến tính
              // dưới step cuối (top = lastTop + N*20%) thay vì đè lên
              // STEP_POSITIONS[0]. Nếu sau này có UI thêm step, hãy mở rộng
              // STEP_POSITIONS tương ứng.
              const basePos =
                STEP_POSITIONS[Math.min(idx, STEP_POSITIONS.length - 1)] ??
                STEP_POSITIONS[0];
              const extraOffset =
                Math.max(0, idx - (STEP_POSITIONS.length - 1)) * 20;
              const stepPositionStyle: React.CSSProperties = {
                top: `calc(${basePos.top} + ${extraOffset}%)`,
                ...(basePos.left !== undefined ? { left: basePos.left } : {}),
                ...(basePos.right !== undefined
                  ? { right: basePos.right }
                  : {}),
              };
              const parallaxDistance =
                STEP_PARALLAX_DISTANCE[
                  Math.min(idx, STEP_PARALLAX_DISTANCE.length - 1)
                ] ?? STEP_PARALLAX_DISTANCE[0];

              return (
                <div
                  key={`${step.number}-${idx}`}
                  data-fwp-step
                  data-element-key={stepKey}
                  data-fwp-align={basePos.left !== undefined ? 'left' : 'right'}
                  data-motion='parallax'
                  data-motion-distance={String(parallaxDistance)}
                  data-motion-scrub='0.6'
                  data-motion-trigger-target='root'
                  data-motion-start='top bottom'
                  data-motion-end='bottom top'
                  className={`fwp-step fwp-step-${idx} ${selectableClass(activeKey === stepKey)}`.trim()}
                  style={composeStyle(
                    STEP_CARD_STYLE,
                    stepPositionStyle,
                    styleOf(stepKey)
                  )}
                >
                  <div
                    data-motion='fade-up'
                    data-motion-distance='18'
                    data-motion-duration='1'
                    data-motion-ease='power2.out'
                    data-motion-start='top 100%'
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
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

                    <h3
                      data-element-key={`${stepKey}-title`}
                      className={selectableClass(
                        activeKey === `${stepKey}-title`,
                        'fwp-step-title'
                      )}
                      style={composeStyle(
                        STEP_TITLE_STYLE,
                        styleOf(`${stepKey}-title`)
                      )}
                    >
                      {step.title}
                    </h3>
                    <p
                      data-element-key={`${stepKey}-body`}
                      className={selectableClass(
                        activeKey === `${stepKey}-body`,
                        'fwp-step-body'
                      )}
                      style={composeStyle(
                        STEP_BODY_STYLE,
                        { color: bodyTextColor },
                        styleOf(`${stepKey}-body`)
                      )}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
