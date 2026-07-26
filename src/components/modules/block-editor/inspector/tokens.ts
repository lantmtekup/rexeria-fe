/**
 * Inspector design scale — one value per role.
 *
 * Everything under `inspector/` composes these instead of picking sizes ad hoc,
 * so every row lines up on the same baseline and nothing looks accidental.
 * Type sizes use the repo's canonical scale (`src/styles/globals.css`):
 * `text-3xs` 10px · `text-2xs` 11px · `text-xs` 12px — never `text-[Npx]`.
 *
 *   ┌─ 12px ─┬──── 76px ────┬─ 8px ─┬──── control ────┬─ 12px ─┐
 *   │  pad   │  label 11px  │  gap  │   h-7 / 11px    │  pad   │
 *
 * Vertical rhythm: 8px between rows, 10px above/below a section body.
 */

/** Every interactive control is 28px tall — inputs, selects, segmented, pickers. */
export const CONTROL_H = 'h-7';

/** Nested control inside a bordered shell (28px − 1px border − 1px pad). */
export const CONTROL_H_INNER = 'h-6';

/** Field labels and text inside controls — 11px. */
export const TEXT_CONTROL = 'text-2xs';

/** Numeric readouts — tabular mono so digits don't jitter while scrubbing. */
export const TEXT_NUM = 'font-mono text-2xs tabular-nums';

/** Section headings, badges, helper text — 10px. */
export const TEXT_META = 'text-3xs';

/** Standalone / illustrative icons (empty state) — 14px. */
export const ICON = 'size-3.5';

/** Every icon that sits inside a control or button — 12px. */
export const ICON_SM = 'size-3';

/** Label column of a side-by-side field row. */
export const LABEL_W = 'w-[76px]';

/** Colour swatch / picker square — 24px, matching an inner control. */
export const SWATCH = 'size-6';

/** Border + surface shared by every bordered control. */
export const CONTROL_SURFACE = 'border-border bg-background rounded-md border';

/** Focus treatment shared by every control. */
export const CONTROL_FOCUS =
  'focus:ring-foreground/15 focus:ring-2 focus:outline-none';

/** Same, for wrappers that host a borderless input. */
export const CONTROL_FOCUS_WITHIN =
  'focus-within:ring-foreground/15 focus-within:ring-2';

/** Horizontal padding of section bodies and the panel header. */
export const PANEL_PAD_X = 'px-3';

/** Gap between field rows inside a section. */
export const ROW_GAP = 'gap-2';
