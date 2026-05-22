'use client';

/**
 * Hoists the live workspace list to the route-group layout so any portal
 * page can call `useActiveWorkspace()` at the top of its component and
 * actually see the BE state. PortalShell used to own this state, but the
 * pages call the hook BEFORE rendering PortalShell as a child — so the
 * context was always null from the page's view. Lifting one level up
 * makes the layout an ancestor of both PortalShell and the page.
 */

import * as React from 'react';

import { AuthHydrator } from '@/components/modules/Auth/AuthHydrator';

import { FAKE_WORKSPACES, type Workspace } from './portal/_data';
import { loadWorkspaces } from './portal/_remote';
import { WorkspaceListContext } from './portal/_workspace';

interface PortalDataContextValue {
  workspaces: Workspace[];
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  refreshWorkspaces: () => Promise<void>;
}

export const PortalDataContext =
  React.createContext<PortalDataContextValue | null>(null);

export function usePortalData(): PortalDataContextValue {
  const ctx = React.useContext(PortalDataContext);
  if (!ctx) {
    throw new Error('usePortalData must be called inside PortalDataProvider');
  }
  return ctx;
}

export function PortalDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspaces, setWorkspaces] =
    React.useState<Workspace[]>(FAKE_WORKSPACES);

  const refreshWorkspaces = React.useCallback(async () => {
    const r = await loadWorkspaces();
    if (r.source === 'live') setWorkspaces(r.data);
  }, []);

  React.useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  const value = React.useMemo(
    () => ({ workspaces, setWorkspaces, refreshWorkspaces }),
    [workspaces, refreshWorkspaces]
  );

  return (
    <PortalDataContext.Provider value={value}>
      <WorkspaceListContext.Provider value={workspaces}>
        <AuthHydrator />
        {children}
      </WorkspaceListContext.Provider>
    </PortalDataContext.Provider>
  );
}
