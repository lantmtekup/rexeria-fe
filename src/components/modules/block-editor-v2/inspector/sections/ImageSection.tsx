'use client';

import * as React from 'react';

import { ImagePicker } from '../../ImagePicker';
import { readImageUrl, writeImageUrl } from '../../imageField';
import type {
  BlockContent,
  BlockType,
  ImageTransform,
} from '@/components/modules/block-editor/types';
import { InspectorSection } from '../primitives/InspectorSection';

/** Only these two keys carry a sibling transform object today. */
function imageTransformKey(fieldKey: string): string | null {
  if (fieldKey === 'imageUrl') return 'imageTransform';
  if (fieldKey === 'backgroundUrl') return 'backgroundTransform';
  return null;
}

interface ImageSectionProps {
  fieldKey: string;
  /** Needed by `writeImageUrl` — a few blocks store images off-path. */
  blockType?: BlockType;
  content: BlockContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  /** Open the Media tab on the left rail, targeting this field. */
  onBrowseLibrary?: () => void;
}

export function ImageSection({
  fieldKey,
  blockType,
  content,
  onContentChange,
  onBrowseLibrary,
}: ImageSectionProps) {
  const c = content as Record<string, unknown>;
  const url = readImageUrl(blockType, content, fieldKey);
  const transformKey = imageTransformKey(fieldKey);
  const transform = transformKey
    ? (c[transformKey] as ImageTransform | undefined)
    : undefined;

  return (
    <InspectorSection id='image' title='Ảnh'>
      <ImagePicker
        value={url}
        onChange={next =>
          onContentChange(prev =>
            writeImageUrl(blockType, prev, fieldKey, next)
          )
        }
        onBrowseLibrary={onBrowseLibrary}
        transform={transform}
        onTransformChange={
          transformKey
            ? next =>
                onContentChange({
                  ...c,
                  [transformKey]: next,
                } as BlockContent)
            : undefined
        }
      />
    </InspectorSection>
  );
}
