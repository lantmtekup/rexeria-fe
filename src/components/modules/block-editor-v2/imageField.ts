/**
 * Read/write the image URL behind an element key.
 *
 * Every image surface in the editor goes through here — the on-canvas edit
 * chip, the inspector's `ImageSection`, the legacy `ElementToolbar`, and the
 * Media panel's pick handler. They used to each carry their own copy, and the
 * copies drifted: `handlePickMedia` never grew the `altura_olympus` branch, so
 * picking from the library on that block wrote a sparse array over the block's
 * defaults instead of replacing one slot.
 *
 * The altura branch exists because that block's `images` field is optional —
 * the rendered images come from `resolveAlturaOlympusImages`, which falls back
 * to the block's built-in list. Writing `images[2]` straight through
 * `setContentAt` on an absent field produces `[undefined, undefined, url]`,
 * blanking the other slots. Resolving first keeps them.
 */

import { getContentAt, setContentAt } from './contentPath';
import { resolveAlturaOlympusImages } from '@/components/modules/block-editor/blocks/_registry/defs/alturaOlympus';
import type {
  AlturaOlympusContent,
  BlockContent,
  BlockType,
} from '@/components/modules/block-editor/types';

/** Index of an `altura_olympus` `images[n]` key, or -1 for anything else. */
function alturaImageIndex(
  blockType: BlockType | undefined,
  elementKey: string
): number {
  if (blockType !== 'altura_olympus') return -1;
  const match = elementKey.match(/^images\[(\d+)\]$/);
  return match ? Number(match[1]) : -1;
}

export function readImageUrl(
  blockType: BlockType | undefined,
  content: BlockContent,
  elementKey: string
): string {
  const index = alturaImageIndex(blockType, elementKey);
  if (index >= 0) {
    const images = resolveAlturaOlympusImages(content as AlturaOlympusContent);
    return images[index] ?? '';
  }
  return (
    (getContentAt(content as Record<string, unknown>, elementKey) as string) ??
    ''
  );
}

export function writeImageUrl(
  blockType: BlockType | undefined,
  content: BlockContent,
  elementKey: string,
  url: string
): BlockContent {
  const index = alturaImageIndex(blockType, elementKey);
  if (index >= 0) {
    const list = [
      ...resolveAlturaOlympusImages(content as AlturaOlympusContent),
    ];
    while (list.length <= index) list.push('');
    list[index] = url;
    return {
      ...(content as AlturaOlympusContent),
      images: list,
    } as BlockContent;
  }
  return setContentAt(
    content as Record<string, unknown>,
    elementKey,
    url
  ) as BlockContent;
}
