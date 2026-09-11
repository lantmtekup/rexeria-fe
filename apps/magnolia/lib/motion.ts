import type { Transition, Variants } from 'framer-motion';

/** Shared ease (== Tailwind `ease-luxe`). */
export const VR = [0.22, 1, 0.36, 1] as const;

export const pB: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: VR } },
};

export const EY = (stagger = 0.1, delay = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** Default whileInView viewport. */
export const d1 = { once: true, amount: 0.28 } as const;

/** Hero idle bob. */
export const Fv = { y: [0, -10, 0], scale: [1, 1.006, 1] };
export const V1: Transition = { duration: 0.58, times: [0, 0.45, 1], ease: VR };
export const gT = { once: false, amount: 0.98 } as const;

/** GSAP parallax depth (yPercent = ±100·depth). */
export const UQ = { subtle: 0.05, base: 0.08, strong: 0.12 } as const;
