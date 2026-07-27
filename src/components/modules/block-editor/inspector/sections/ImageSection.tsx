'use client';

import * as React from 'react';

import { getContentAt, setContentAt } from '../../contentPath';
import { ImagePicker } from '../../ImagePicker';
import type { BlockContent, ImageTransform } from '../../types';
import { InspectorSection } from '../primitives/InspectorSection';

/** Only these two keys carry a sibling transform object today. */
function imageTransformKey(fieldKey: string): string | null {
  if (fieldKey === 'imageUrl') return 'imageTransform';
  if (fieldKey === 'backgroundUrl') return 'backgroundTransform';
  return null;
}

interface ImageSectionProps {
  fieldKey: string;
  content: BlockContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}

export function ImageSection({
  fieldKey,
  content,
  onContentChange,
}: ImageSectionProps) {
  const c = content as Record<string, unknown>;
  const url = (getContentAt(c, fieldKey) as string) ?? '';
  const transformKey = imageTransformKey(fieldKey);
  const transform = transformKey
    ? (c[transformKey] as ImageTransform | undefined)
    : undefined;

  return (
    <InspectorSection id='image' title='Ảnh'>
      <ImagePicker
        value={url}
        onChange={next =>
          onContentChange(setContentAt(c, fieldKey, next) as BlockContent)
        }
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
