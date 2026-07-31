'use client';

import * as React from 'react';

import { EDITOR_RAIL_ITEMS, type EditorRailTab } from './EditorRail';

/**
 * The column the rail fills. Chrome only — each destination brings its own body.
 *
 * Fixed 240px. It was 280px to fit a legible full-width 16:9 block thumbnail;
 * the block list is rows now, so only the media grid still sets the floor, and
 * two columns of ~108px tiles hold up fine here.
 */

interface EditorPanelProps {
  tab: EditorRailTab;
  children: React.ReactNode;
}

export function EditorPanel({ tab, children }: EditorPanelProps) {
  const meta = EDITOR_RAIL_ITEMS.find(i => i.id === tab);

  return (
    <aside
      data-testid='editor-panel'
      data-panel-tab={tab}
      className='flex w-60 shrink-0 flex-col border-r border-[var(--pv2-hair)] bg-white'
    >
      <div className='flex h-9 shrink-0 items-center border-b border-[var(--pv2-hair)] px-3'>
        <span className='text-3xs font-semibold tracking-wide text-[var(--pv2-mut)] uppercase'>
          {meta?.label ?? tab}
        </span>
      </div>
      {/* key: a fresh subtree per destination, so scroll position and any
          in-panel state don't bleed from one tab into the next. */}
      <div key={tab} className='flex min-h-0 flex-1 flex-col'>
        {children}
      </div>
    </aside>
  );
}
