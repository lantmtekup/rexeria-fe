/**
 * Id generators for canvas entities.
 *
 * Deliberately its own module: `factory.ts` imports every block definition (and
 * through them, image assets), so importing it just to get an id pulls the
 * whole block library into the caller's bundle.
 */

/** Fresh block id. */
export function genId(): string {
  return `b_${Math.random().toString(36).slice(2, 10)}`;
}

/** Fresh `EditorPage` id (a page inside a template canvas, not a BE `Page`). */
export function genPageId(): string {
  return `p_${Math.random().toString(36).slice(2, 10)}`;
}
