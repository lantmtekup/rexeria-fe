'use client';
import { motion, type MotionProps, type Variants } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

type Preset =
  | 'fade-up'
  | 'fade'
  | 'scale-in'
  | 'clip-reveal'
  | 'slide-left'
  | 'none';

interface MotionSectionProps extends MotionProps {
  children: ReactNode;
  /** Preset animation name (pulls from PRESETS). */
  preset?: Preset;
  /** Stagger children by this many seconds (0 = no stagger). */
  stagger?: number;
  /** Delay before firing (seconds). */
  delay?: number;
  /** Override preset duration (seconds). */
  duration?: number;
  /** Fire once (default true). Set false to re-fire on every enter. */
  once?: boolean;
  className?: string;
  style?: CSSProperties;
}

const EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1];
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT_CUBIC: [number, number, number, number] = [0.33, 1, 0.68, 1];

const PRESETS: Record<Preset, Variants> = {
  'fade-up': {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: EASE_OUT_QUART },
    },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.9, ease: EASE_OUT_CUBIC },
    },
  },
  'scale-in': {
    hidden: { opacity: 0, scale: 1.05 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.1, ease: EASE_OUT_EXPO },
    },
  },
  'clip-reveal': {
    hidden: { clipPath: 'inset(100% 0 0 0)' },
    visible: {
      clipPath: 'inset(0 0 0 0)',
      transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
    },
  },
  'slide-left': {
    hidden: { opacity: 0, x: -32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.9, ease: EASE_OUT_QUART },
    },
  },
  none: { hidden: {}, visible: {} },
};

/**
 * Wrap any section in a scroll-reveal with a preset animation. For custom
 * animations, pass `variants` / `initial` / `animate` directly — they
 * override the preset.
 */
export function MotionSection({
  children,
  preset = 'fade-up',
  stagger = 0,
  delay = 0,
  duration,
  once = true,
  className,
  style,
  ...rest
}: MotionSectionProps) {
  const base = PRESETS[preset];
  const v: Variants = {
    hidden: base.hidden,
    visible: {
      ...base.visible,
      transition: {
        ...(base.visible as Record<string, unknown>)?.transition,
        ...(duration ? { duration } : {}),
        ...(delay ? { delay } : {}),
        ...(stagger ? { staggerChildren: stagger } : {}),
      },
    },
  };
  return (
    <motion.section
      variants={v}
      initial='hidden'
      whileInView='visible'
      viewport={{ once, margin: '-10% 0px' }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
