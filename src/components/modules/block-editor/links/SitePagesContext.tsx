'use client';

import * as React from 'react';

import type { EditorPage } from '../serialize';
import type { Block } from '../types';

/**
 * Pages of the template being edited, exposed to deep toolbar controls.
 *
 * A context rather than props because the consumers are scattered
 * (`LinkControls` inside `ElementToolbar`, the canvas edit chip, preview) and
 * threading `pages` through every intermediate component would be noise.
 *
 * Empty by default so components mounted outside the editor (`/dev/blocks`,
 * public render) keep working — the link picker just shows no internal pages.
 */

export interface SitePagesContextValue {
  pages: EditorPage[];
  activePageId: string | null;
  /** Blocks of the active page — targets for "scroll to block". */
  blocks: Block[];
}

const EMPTY: SitePagesContextValue = {
  pages: [],
  activePageId: null,
  blocks: [],
};

const SitePagesContext = React.createContext<SitePagesContextValue>(EMPTY);

export function SitePagesProvider({
  pages,
  activePageId,
  blocks,
  children,
}: SitePagesContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ pages, activePageId, blocks }),
    [pages, activePageId, blocks]
  );
  return (
    <SitePagesContext.Provider value={value}>
      {children}
    </SitePagesContext.Provider>
  );
}

export function useSitePages(): SitePagesContextValue {
  return React.useContext(SitePagesContext);
}
