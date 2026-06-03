import * as React from 'react';

import { getLegacyBlock } from '@/blocks/registry';

import type { LegacyEmbedContent } from '../types';

/**
 * Render a legacy/framer registry block inside a canvas page. The block is a
 * pre-designed full-section React component looked up by `schemaId`; it renders
 * its own default content (not inline-editable in the canvas for now).
 *
 * Same lookup as the admin catalog (`LegacyBlockThumbnail`), but full-size.
 */
export function LegacyEmbed({ content }: { content: LegacyEmbedContent }) {
  const entry = getLegacyBlock(content.schemaId);
  if (!entry) {
    return (
      <div className='flex min-h-[160px] items-center justify-center bg-zinc-50 text-sm text-zinc-400'>
        Legacy block không tìm thấy: {content.schemaId || '(trống)'}
      </div>
    );
  }
  const { schema, Component } = entry;
  const data = (schema.defaults.vi ?? schema.defaults.en ?? {}) as Record<
    string,
    unknown
  >;
  return <Component content={data} editable={false} />;
}
