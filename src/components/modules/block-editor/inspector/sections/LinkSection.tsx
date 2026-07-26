'use client';

import * as React from 'react';

import { LinkControls } from '../../links/LinkControls';
import type { BlockContent } from '../../types';
import { InspectorSection } from '../primitives/InspectorSection';

interface LinkSectionProps {
  fieldKey: string;
  content: BlockContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  /** Link fields open expanded; text elements keep it collapsed by default. */
  defaultCollapsed?: boolean;
}

export function LinkSection({
  fieldKey,
  content,
  onContentChange,
  defaultCollapsed = false,
}: LinkSectionProps) {
  return (
    <InspectorSection
      id='link'
      title='Liên kết'
      defaultCollapsed={defaultCollapsed}
    >
      <LinkControls
        fieldKey={fieldKey}
        content={content}
        onContentChange={onContentChange}
      />
    </InspectorSection>
  );
}
