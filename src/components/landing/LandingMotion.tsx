'use client';

/**
 * Animation primitives — giá trị lấy từ CDP capture site gốc (framer-recon):
 *  - Text reveal: span 400ms ease-out, stagger theo từ
 *  - Element reveal: ~1000ms easing expo-out (spring approx trong bundle)
 *  - Hero load cascade: delay 0.5s → 1.6s, bước ~0.1s
 * Tôn trọng prefers-reduced-motion qua useReducedMotion.
 */

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const EXPO_OUT = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  /** Giây — khớp cascade 0.5→1.6s của hero gốc. */
  delay?: number;
  /** 'load' = animate ngay khi mount (hero); 'view' = khi scroll tới. */
  on?: 'load' | 'view';
  className?: string;
}

/** Fade-up 1000ms expo-out — pattern element reveal của site gốc. */
export function FadeUp({ children, delay = 0, on = 'view', className }: RevealProps) {
  const reduce = useReducedMotion();
  const props =
    on === 'load'
      ? { initial: 'hidden' as const, animate: 'show' as const }
      : {
          initial: 'hidden' as const,
          whileInView: 'show' as const,
          viewport: { once: true, amount: 0.25 },
        };
  return (
    <motion.div
      {...props}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 36 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 1, ease: EXPO_OUT, delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface WordRevealProps {
  text: string;
  delay?: number;
  on?: 'load' | 'view';
  className?: string;
  /** Index của từ render serif-italic (serializable — dùng được từ server component). */
  italic?: number;
}

/** Heading reveal theo từng từ — span 400ms ease-out + stagger (82 anim trong capture). */
export function WordReveal({ text, delay = 0, on = 'view', className, italic }: WordRevealProps) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  const props =
    on === 'load'
      ? { initial: 'hidden' as const, animate: 'show' as const }
      : {
          initial: 'hidden' as const,
          whileInView: 'show' as const,
          viewport: { once: true, amount: 0.5 },
        };
  return (
    <motion.span
      {...props}
      variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: delay } } }}
      className={className}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className='inline-block overflow-hidden align-bottom'>
          <motion.span
            className='inline-block'
            variants={{
              hidden: { y: reduce ? 0 : '110%' },
              show: { y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
            }}
          >
            {i === italic ? <em className='font-serif font-light'>{w}</em> : w}
          </motion.span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </motion.span>
  );
}

/** Ảnh scale-in nhẹ (1.08→1) + fade — pattern media reveal. */
export function ScaleIn({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        hidden: { opacity: 0, scale: reduce ? 1 : 1.08 },
        show: {
          opacity: 1,
          scale: 1,
          transition: { duration: 1.2, ease: EXPO_OUT, delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container — con dùng <FadeUpItem>. */
export function StaggerGroup({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.2 }}
      variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: delay } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeUpItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 36 },
        show: { opacity: 1, y: 0, transition: { duration: 1, ease: EXPO_OUT } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Counter đếm lên khi vào viewport — cho block stats 17/75/70/24. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, mv, value]);

  useEffect(() => {
    const unsub = spring.on('change', v => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return (
    <span ref={ref} className={className}>
      {reduce ? value : display}
    </span>
  );
}
