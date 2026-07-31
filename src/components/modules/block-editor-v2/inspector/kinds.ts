import type { ElementKind } from '../resolveElementKind';

/**
 * Element kinds served by the vertical inspector panel.
 *
 * Migration boundary — everything NOT listed here still renders the legacy
 * horizontal `ElementToolbar` pinned above the canvas. The remaining kinds are
 * all list managers (add/remove/reorder items), which need a different layout
 * than a property inspector and move over in a later pass.
 */
export const INSPECTOR_KINDS: ReadonlySet<ElementKind> = new Set<ElementKind>([
  'text',
  'link',
  'image',
  'fill',
  'background',
  'mintDiscoverSurface',
]);

export function isInspectorKind(kind: ElementKind): boolean {
  return INSPECTOR_KINDS.has(kind);
}
