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
  writeRaw(readRaw().map(e => (e.id === id ? { ...e, name: trimmed } : e)));
}

export function deleteSavedBlock(id: string): void {
  writeRaw(readRaw().filter(e => e.id !== id));
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
