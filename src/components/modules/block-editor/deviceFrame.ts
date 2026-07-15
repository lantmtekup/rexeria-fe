import type { Device } from './types';

/**
 * Logical device frame widths for the block editor canvas + preview overlay.
 * Matches docs/canvas-block-responsive-spec.md §R2 / §R9:
 *  - mobile  390px  → base styles (no @ prefix)
 *  - tablet  834px  → @2xl: (≥672px)
 *  - desktop 1280px → @4xl: (≥896px)
 *
 * Always set as a fixed `width` on the `@container` wrapper — never `maxWidth`
 * alone — so container queries and `useContainerMobile` measure the intended
 * device, independent of the browser viewport.
 */
export const DEVICE_FRAME_WIDTH = {
  desktop: 1280,
  tablet: 834,
  mobile: 390,
} as const satisfies Record<Device, number>;

/** Container breakpoint matching Tailwind `@2xl:` (42rem = 672px). */
export const CONTAINER_MOBILE_BREAKPOINT = 672;
