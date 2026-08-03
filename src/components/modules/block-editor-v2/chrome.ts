/**
 * Shared surface rules for the editor chrome — rail, panels, header, floating
 * bars and popovers. Not for block content: what the author builds on the
 * canvas has its own style system and its own shadow presets.
 *
 * ELEVATION HAS TWO LEVELS, AND THERE IS NO THIRD.
 *
 *   Level 0 — anything in the layout flow (rail, panel, header, inspector,
 *   rows, cards, tiles, buttons, segmented controls). NO shadow. Separate with
 *   a 1px `--pv2-hair` hairline or a background step (`--pv2-canvas` against
 *   `--pv2-paper`). Selection is ONE ring in `--pv2-electric` — never a border
 *   and a ring and a shadow on the same element.
 *
 *   Level 1 — anything floating above the canvas (popover, menu, drag ghost,
 *   floating toolbar, zoom bar, edit chip, dialog). Exactly `FLOATING`, and no
 *   border: the shadow already describes the edge. Keep a `ring-1 ring-black/5`
 *   only where the surface sits directly on the dotted canvas and needs a
 *   defined edge against arbitrary block colours.
 *
 * Before adding a `shadow-*` class here, check which level the element is at.
 * Four disconnected shadow scales used to coexist in this module because the
 * rule was never written down.
 */

/** Level 1 elevation. The only shadow the chrome is allowed to use. */
export const FLOATING = 'shadow-[var(--pv2-sh-soft)]';

/**
 * Radius. Three steps, taken from the project scale in `globals.css`
 * (`sm 4px / md 8px / lg 12px`, where 4 and 12 are `--pv2-r-sm` and `--pv2-r`)
 * so the chrome rounds the same as the rest of portal-v2:
 *
 *   `rounded-sm`  inner bits — thumbs, segments inside a track
 *   `R_CONTROL`   rows, buttons, tiles, panels in flow
 *   `R_FLOATING`  anything at Level 1
 */
export const R_CONTROL = 'rounded-md';
export const R_FLOATING = 'rounded-lg';

/**
 * The raised segment of a segmented control (device switcher, header toggles).
 * A background step against the track is enough to read as raised — the two
 * hand-rolled `0 1px 0 / 0 0 0 0.5px` shadows this replaces were doing the same
 * job twice, in two files, with two slightly different values.
 */
export const SEGMENT_ACTIVE = 'bg-[var(--pv2-paper)] text-[var(--pv2-ink)]';
