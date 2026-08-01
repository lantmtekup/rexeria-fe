'use client';

/**
 * The floating UI that follows the current element selection: the hover edit
 * chip and the docked selection toolbar.
 *
 * Both surfaces (`BlockPreview` artboard, `PageCanvas` full page) render this
 * from the same `useCanvasElementLayer` output, so the affordances can never
 * drift between the two modes.
 *
 * They are split into two pieces because they anchor to different things. The
 * chip anchors to an element, so it must live INSIDE the surface and scroll
 * with the content. The toolbar is docked to a corner of the viewport, so on a
 * scrolling surface it has to sit OUTSIDE the scroller or it scrolls away.
 * The artboard never scrolls and renders both together via
 * `CanvasElementChrome`.
 */

import * as React from 'react';

import { CanvasElementEditChip } from './CanvasElementEditChip';
import { SelectionToolbar } from './inspector/SelectionToolbar';
import type { CanvasElementLayer } from './hooks/useCanvasElementLayer';

/** Element-anchored edit chip. Must be a child of the canvas surface. */
export function CanvasElementChip({ layer }: { layer: CanvasElementLayer }) {
  const { chip } = layer;
  if (!chip) return null;
  return (
    <CanvasElementEditChip
      elementKey={chip.elementKey}
      meta={chip.meta}
      rect={chip.rect}
      surfaceEl={chip.surfaceEl}
      content={chip.content}
      blockType={chip.blockType}
      imageOpen={chip.imageOpen}
      onImageOpenChange={chip.onImageOpenChange}
      linkOpen={chip.linkOpen}
      onLinkOpenChange={chip.onLinkOpenChange}
      linkFieldKey={chip.linkFieldKey}
      siblingLinkKey={chip.siblingLinkKey}
      onOpenLink={chip.onOpenLink}
      onActivate={chip.onActivate}
      onContentChange={chip.onContentChange}
      onChipPointerEnter={chip.onChipPointerEnter}
      onChipPointerLeave={chip.onChipPointerLeave}
    />
  );
}

/** Corner-docked actions for the selection. Must be a child of a `relative`
 *  box that does NOT scroll. */
export function CanvasSelectionToolbarDock({
  layer,
}: {
  layer: CanvasElementLayer;
}) {
  const bar = layer.selectionToolbar;
  if (!bar) return null;
  return (
    <div
      data-canvas-edit-chip-root='true'
      className='absolute top-3 left-3 z-30'
      // A bare pointerdown out here reads as "empty canvas" and starts a pan.
      onPointerDown={e => e.stopPropagation()}
    >
      <SelectionToolbar
        block={bar.block}
        lang={bar.lang}
        content={bar.content}
        selectedKey={bar.selectedKey}
        kind={bar.kind}
        label={bar.label}
        onContentChange={bar.onContentChange}
        onUpdateBackground={bar.onUpdateBackground}
        onResetStyle={bar.onResetStyle}
        onClose={bar.onClose}
      />
    </div>
  );
}

/** Both pieces at once — for surfaces that don't scroll. */
export function CanvasElementChrome({ layer }: { layer: CanvasElementLayer }) {
  return (
    <>
      <CanvasElementChip layer={layer} />
      <CanvasSelectionToolbarDock layer={layer} />
    </>
  );
}
