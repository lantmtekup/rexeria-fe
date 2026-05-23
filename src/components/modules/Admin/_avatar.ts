/**
 * Deterministic initials avatar for entities that don't ship `avatar_url`
 * (Client, Workspace, etc). Same id → same gradient + same initials, so a
 * given customer's swatch is recognisable across the admin surface.
 */

const GRADIENTS = [
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-fuchsia-400 to-pink-500',
  'from-cyan-400 to-blue-500',
  'from-indigo-400 to-violet-500',
  'from-lime-400 to-emerald-500',
  'from-orange-400 to-red-500',
];

export function initialsOf(name: string): string {
  const clean = (name ?? '').trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** FNV-1a 32-bit so a given id hashes to the same gradient on every render. */
export function gradientForId(id: string): string {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % GRADIENTS.length;
  return GRADIENTS[idx]!;
}
