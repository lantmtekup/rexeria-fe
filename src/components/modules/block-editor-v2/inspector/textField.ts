/**
 * Read/write a single text field on block content.
 *
 * Most keys are a plain path handled by `getContentAt`/`setContentAt`, but a
 * few PNJ blocks keep legacy shapes (`paragraph1`/`paragraph2` alongside
 * `paragraphs[]`) where a naive `setContentAt` would create a one-element
 * array and drop the sibling entries. These helpers centralise that handling
 * so the inspector and the legacy toolbar stay in agreement.
 */

import {
  PNJ_PARAGRAPH_KEY_RE,
  resolvePnjParagraphs,
  setPnjParagraphAt,
} from '@/components/modules/block-editor/blocks/PnjDetails';
import {
  PNJ_HERO_TITLE_LINE_KEY_RE,
  resolvePnjHeroTitleLines,
  setPnjHeroTitleLineAt,
} from '@/components/modules/block-editor/blocks/pnjHeroTitleLines';
import {
  PNJ_VARIANT_HIGHLIGHT_ITEM_KEY_RE,
  resolvePnjVariants,
  setPnjVariantHighlightItemAt,
} from '@/components/modules/block-editor/blocks/pnjVariantContent';
import { getContentAt, setContentAt } from '../contentPath';
import type {
  BlockContent,
  PnjDetailsContent,
  PnjHeroContent,
  PnjVariantContent,
} from '@/components/modules/block-editor/types';

type LegacyPnjDetails = PnjDetailsContent & {
  paragraph1?: string;
  paragraph2?: string;
};

export function readTextField(content: BlockContent, fieldKey: string): string {
  const paraMatch = fieldKey.match(PNJ_PARAGRAPH_KEY_RE);
  if (paraMatch) {
    return (
      resolvePnjParagraphs(content as LegacyPnjDetails)[Number(paraMatch[1])] ??
      ''
    );
  }

  const titleLineMatch = fieldKey.match(PNJ_HERO_TITLE_LINE_KEY_RE);
  if (titleLineMatch) {
    return (
      resolvePnjHeroTitleLines(content as PnjHeroContent)[
        Number(titleLineMatch[1])
      ] ?? ''
    );
  }

  const highlightMatch = fieldKey.match(PNJ_VARIANT_HIGHLIGHT_ITEM_KEY_RE);
  if (highlightMatch) {
    return (
      resolvePnjVariants(content as PnjVariantContent)[
        Number(highlightMatch[1])
      ]?.highlights[Number(highlightMatch[2])] ?? ''
    );
  }

  const raw = getContentAt(content as Record<string, unknown>, fieldKey);
  return typeof raw === 'string' ? raw : '';
}

export function writeTextField(
  fieldKey: string,
  next: string,
  onContentChange: (
    value: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void
): void {
  const paraMatch = fieldKey.match(PNJ_PARAGRAPH_KEY_RE);
  if (paraMatch) {
    onContentChange(
      prev =>
        setPnjParagraphAt(
          prev as LegacyPnjDetails,
          Number(paraMatch[1]),
          next
        ) as BlockContent
    );
    return;
  }

  const titleLineMatch = fieldKey.match(PNJ_HERO_TITLE_LINE_KEY_RE);
  if (titleLineMatch) {
    onContentChange(
      prev =>
        setPnjHeroTitleLineAt(
          prev as PnjHeroContent,
          Number(titleLineMatch[1]),
          next
        ) as BlockContent
    );
    return;
  }

  const highlightMatch = fieldKey.match(PNJ_VARIANT_HIGHLIGHT_ITEM_KEY_RE);
  if (highlightMatch) {
    onContentChange(
      prev =>
        setPnjVariantHighlightItemAt(
          prev as PnjVariantContent,
          Number(highlightMatch[1]),
          Number(highlightMatch[2]),
          next
        ) as BlockContent
    );
    return;
  }

  onContentChange(
    prev =>
      setContentAt(
        prev as Record<string, unknown>,
        fieldKey,
        next
      ) as BlockContent
  );
}
