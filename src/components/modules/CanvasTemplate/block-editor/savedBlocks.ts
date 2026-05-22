/**
 * User-curated "saved block" library. Lets a designer customise a block
 * (content + extra elements + element styles + motion) and persist it for
 * re-use in any other canvas template.
 *
 * Phase 1: client-side only — stored under `localStorage[STORAGE_KEY]`. A
 * future server-backed version will swap this layer for a BE call without
 * changing the consumer API.
 */

import type { Block } from './types';

export const STORAGE_KEY = 'rexer:saved-blocks';

export interface SavedBlock {
  id: string;
  /** User-facing label shown in the library. */
  name: string;
  /** Optional inline preview (data-url or remote). Phase 1: omitted. */
  thumbnail?: string;
  /** Block template — id is regenerated on insert so multiple copies coexist. */
  block: Block;
  /** ISO timestamp when saved. */
  createdAt: string;
  /** ISO timestamp of the last metadata change (rename, tag, duplicate-as). */
  updatedAt?: string;
  /**
   * Free-form tags for filtering in the /admin/blocks library page.
   * Lower-case kebab — UI displays them as chips.
   */
  tags?: string[];
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readRaw(): SavedBlock[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Lightweight runtime guard — drop entries missing the required shape.
    return parsed.filter(
      (e: unknown): e is SavedBlock =>
        !!e &&
        typeof e === 'object' &&
        typeof (e as SavedBlock).id === 'string' &&
        typeof (e as SavedBlock).name === 'string' &&
        !!(e as SavedBlock).block
    );
  } catch {
    return [];
  }
}

function writeRaw(items: SavedBlock[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  // Notify other listeners (e.g. AddBlockDialog open in another tab) so the
  // library refreshes without a full re-mount.
  window.dispatchEvent(new CustomEvent('rexer:saved-blocks:changed'));
}

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `sb_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  return `sb_${Math.random().toString(36).slice(2, 14)}`;
}

export function listSavedBlocks(): SavedBlock[] {
  // Newest first — designers usually want their latest save on top.
  return readRaw()
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function saveBlock(name: string, block: Block): SavedBlock {
  const entry: SavedBlock = {
    id: genId(),
    name: name.trim() || 'Saved block',
    block: structuredClone(block),
    createdAt: new Date().toISOString(),
  };
  const next = [...readRaw(), entry];
  writeRaw(next);
  return entry;
}

export function renameSavedBlock(id: string, name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  const now = new Date().toISOString();
  writeRaw(
    readRaw().map(e =>
      e.id === id ? { ...e, name: trimmed, updatedAt: now } : e
    )
  );
}

export function deleteSavedBlock(id: string): void {
  writeRaw(readRaw().filter(e => e.id !== id));
}

export function getSavedBlock(id: string): SavedBlock | undefined {
  return readRaw().find(e => e.id === id);
}

/**
 * Clone a saved block to a new entry. Block IDs (root + extras) are
 * regenerated so the new entry can coexist with the original in any
 * canvas. Name gets a `(copy)` suffix unless caller supplies one.
 */
export function duplicateSavedBlock(
  id: string,
  newName?: string
): SavedBlock | undefined {
  const source = getSavedBlock(id);
  if (!source) return undefined;
  const cloned = structuredClone(source.block);
  cloned.id = `b_${Math.random().toString(36).slice(2, 10)}`;
  if (cloned.extraElements?.length) {
    cloned.extraElements = cloned.extraElements.map(el => ({
      ...el,
      id: `el_${Math.random().toString(36).slice(2, 14)}`,
    }));
  }
  const now = new Date().toISOString();
  const entry: SavedBlock = {
    id: genId(),
    name: (newName ?? `${source.name} (copy)`).trim() || 'Saved block',
    block: cloned,
    createdAt: now,
    updatedAt: now,
    tags: source.tags ? [...source.tags] : undefined,
  };
  writeRaw([...readRaw(), entry]);
  return entry;
}

/**
 * Replace the tag list on a saved block. Empty array clears tags. Tags
 * are normalised (lower-case, deduped) at write time so UI doesn't have
 * to repeat the dance.
 */
export function updateSavedBlockTags(id: string, tags: string[]): void {
  const normalised = Array.from(
    new Set(
      tags
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0 && t.length <= 40)
    )
  );
  const now = new Date().toISOString();
  writeRaw(
    readRaw().map(e =>
      e.id === id ? { ...e, tags: normalised, updatedAt: now } : e
    )
  );
}

/**
 * Build a fresh Block to insert into a canvas — generates a new `id` and
 * (recursively) new ids for any `extraElements` so two copies of the same
 * saved block can coexist without colliding.
 */
export function instantiateSavedBlock(saved: SavedBlock): Block {
  const cloned = structuredClone(saved.block);
  cloned.id = `b_${Math.random().toString(36).slice(2, 10)}`;
  if (cloned.extraElements?.length) {
    cloned.extraElements = cloned.extraElements.map(el => ({
      ...el,
      id: `el_${Math.random().toString(36).slice(2, 14)}`,
    }));
  }
  return cloned;
}

/** Subscribe to library changes — returns an unsubscribe fn. */
export function subscribeSavedBlocks(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const onChange = () => cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener('rexer:saved-blocks:changed', onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('rexer:saved-blocks:changed', onChange);
    window.removeEventListener('storage', onStorage);
  };
}
