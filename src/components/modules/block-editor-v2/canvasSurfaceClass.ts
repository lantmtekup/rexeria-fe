/**
 * Canvas-only chrome painted through descendant selectors on the surface.
 *
 * It lives here rather than inside the block components because the very same
 * components render on the public `/p` page, where an editing outline would be
 * a bug. Hover is driven by the `data-canvas-hovered` attribute that
 * `useCanvasElementLayer` stamps on the DOM (not `:hover`), so keys containing
 * brackets — `features[0].label` — can't break the class name.
 *
 * Shared by both canvas surfaces: the artboard (`BlockPreview`) and the
 * full-page stage (`PageCanvas`).
 */
export const CANVAS_SURFACE_CHROME_CLASS = [
  '[&_[data-inline-editing=true]]:cursor-text',
  '[&_[data-inline-editing=true]]:rounded-sm',
  '[&_[data-inline-editing=true]]:bg-sky-50/80',
  '[&_[data-inline-editing=true]]:outline',
  '[&_[data-inline-editing=true]]:outline-2',
  '[&_[data-inline-editing=true]]:outline-offset-2',
  '[&_[data-inline-editing=true]]:outline-sky-500',
  '[&_[data-canvas-hovered=true]]:cursor-pointer',
  '[&_[data-canvas-hovered=true]]:outline',
  '[&_[data-canvas-hovered=true]]:outline-1',
  '[&_[data-canvas-hovered=true]]:outline-offset-2',
  '[&_[data-canvas-hovered=true]]:outline-sky-400/70',
].join(' ');
