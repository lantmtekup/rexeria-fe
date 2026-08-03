'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type { BlockContent } from '@/components/modules/block-editor/types';
import { InspectorSection } from '../primitives/InspectorSection';
import { readTextField, writeTextField } from '../textField';
import {
  CONTROL_FOCUS,
  CONTROL_H,
  CONTROL_SURFACE,
  TEXT_CONTROL,
} from '../tokens';

interface ContentSectionProps {
  fieldKey: string;
  /** Registry-driven: true = textarea, false = 1 dòng. undefined = đoán theo key. */
  multiline?: boolean;
  content: BlockContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}

export function ContentSection({
  fieldKey,
  multiline,
  content,
  onContentChange,
}: ContentSectionProps) {
  const value = readTextField(content, fieldKey);
  const isLong =
    multiline ??
    (fieldKey === 'description' ||
      fieldKey === 'subtitle' ||
      fieldKey === 'noteText');

  const setValue = (next: string) =>
    writeTextField(fieldKey, next, onContentChange);

  const shared = cn(
    'text-foreground placeholder:text-content-muted/60 w-full px-2',
    CONTROL_SURFACE,
    CONTROL_FOCUS,
    TEXT_CONTROL
  );

  return (
    <InspectorSection id='content' title='Nội dung'>
      {isLong ? (
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder='Nội dung…'
          className={cn(shared, 'min-h-24 resize-y py-1.5 leading-5')}
        />
      ) : (
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder='Nội dung…'
          className={cn(shared, CONTROL_H)}
        />
      )}
    </InspectorSection>
  );
}
