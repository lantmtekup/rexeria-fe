'use client';

import { useEffect, useRef, useMemo, createElement } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

const normalizeChildren = children => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children.map(normalizeChildren).join('');
  }
  return '';
};

const ScrollReveal = ({
  children,
  scrollContainerRef = null,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  stagger = 0.08,
  containerClassName = '',
  textClassName = '',
  start = 'top 95%',
  rotationEnd = 'top 40%',
  wordAnimationEnd = 'top 40%',
  as = 'h2',
  /** When false, only splits words — parent owns the ScrollTrigger timeline. */
  animate = true,
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = normalizeChildren(children).replace(/\s+/g, ' ').trim();
    if (!text) return null;
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className='word' key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const wordElements = el.querySelectorAll('.word');

    // Always set initial hidden + tilted state so parent timelines /
    // scrub don't flash full-opacity upright text on first paint.
    gsap.set(el, {
      // Left-edge origin = gentle lean-in (React Bits default), not spin-from-center
      transformOrigin: '0% 50%',
      rotate: baseRotation,
    });
    if (wordElements.length) {
      gsap.set(wordElements, {
        opacity: baseOpacity,
        filter: enableBlur ? `blur(${blurStrength}px)` : 'blur(0px)',
      });
    }

    if (!animate) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        ease: 'none',
        rotate: 0,
        scrollTrigger: {
          trigger: el,
          scroller,
          start,
          end: rotationEnd,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      if (wordElements.length) {
        gsap.to(wordElements, {
          ease: 'none',
          opacity: 1,
          stagger,
          scrollTrigger: {
            trigger: el,
            scroller,
            start,
            end: wordAnimationEnd,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        if (enableBlur) {
          gsap.to(wordElements, {
            ease: 'none',
            filter: 'blur(0px)',
            stagger,
            scrollTrigger: {
              trigger: el,
              scroller,
              start,
              end: wordAnimationEnd,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
        }
      }
    }, el);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    start,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
    stagger,
    animate,
  ]);

  return createElement(
    as,
    { ref: containerRef, className: `scroll-reveal ${containerClassName}` },
    createElement(
      'span',
      { className: `scroll-reveal-text ${textClassName}` },
      splitText
    )
  );
};

export default ScrollReveal;
