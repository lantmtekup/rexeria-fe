'use client';

import { useSearchParams } from 'next/navigation';

import {
  DEFAULT_WORKSPACE_ID,
  FAKE_CLIENT,
  FAKE_WORKSPACES,
  type Workspace,
} from './_data';

/**
 * Active workspace tracked via URL search param `?ws=<id>`.
 * - Default → first workspace.
 * - Always returns a valid workspace (fallback to first if id invalid).
 */
export function useActiveWorkspace(): Workspace {
  const sp = useSearchParams();
  const id = sp.get('ws') || DEFAULT_WORKSPACE_ID;
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
