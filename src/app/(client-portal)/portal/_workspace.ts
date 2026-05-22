'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import {
  DEFAULT_WORKSPACE_ID,
  FAKE_CLIENT,
  FAKE_WORKSPACES,
  type Workspace,
} from './_data';

/**
 * Context published by `PortalShell` carrying the live list of workspaces
 * the user belongs to (from `/me/workspaces`). When the context is
 * `null` (shell hasn't hydrated yet, or consumer is outside the shell)
 * we fall back to `FAKE_WORKSPACES` so the demo path still renders.
 */
export const WorkspaceListContext = React.createContext<Workspace[] | null>(
  null
);

/**
 * Active workspace tracked via URL search param `?ws=<id>`.
 * Lookup order:
 *  1. Live workspaces from `WorkspaceListContext` (shell-provided).
 *  2. `FAKE_WORKSPACES` for the demo path.
 *  3. First workspace in the live list, then `FAKE_WORKSPACES[0]`.
 *
 * Without this, switching to a real BE workspace (e.g. "Landing page service")
 * left the URL stamped with the new id but `useActiveWorkspace` couldn't
 * find it in `FAKE_WORKSPACES` and silently fell back to `FAKE_WORKSPACES[0]`
 * — the chip in the header refused to update.
 */
export function useActiveWorkspace(): Workspace {
  const sp = useSearchParams();
  const live = React.useContext(WorkspaceListContext);
  const id = sp.get('ws') || DEFAULT_WORKSPACE_ID;

  if (live && live.length > 0) {
    return live.find(w => w.id === id) ?? live[0];
  }
  return FAKE_WORKSPACES.find(w => w.id === id) ?? FAKE_WORKSPACES[0];
}

/**
 * Append `?ws=<id>` to a relative path; useful for nav Links.
 */
export function withWorkspace(path: string, workspaceId: string): string {
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}ws=${workspaceId}`;
}

/**
 * Client info — currently single fake client; in real BE call /me to get.
 */
export function useActiveClient() {
  return FAKE_CLIENT;
}
