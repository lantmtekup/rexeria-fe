/**
 * Curated free Google Fonts với hỗ trợ tiếng Việt đầy đủ (latin-extended +
 * vietnamese subset). Loaded once globally via the root layout `<link>` so
 * any component can apply by setting `font-family` — no per-component
 * dynamic loading needed.
 *
 * To add a new font:
 * 1. Verify it has a `vietnamese` subset on fonts.google.com.
 * 2. Add an entry below.
 * 3. Append its query to `GOOGLE_FONTS_HREF` (auto-derived from registry).
 */

export type FontCategory = 'sans' | 'serif' | 'display' | 'mono';

export interface FontDef {
  /** Stable id used in element style. */
  id: string;
  /** Display label in picker. */
  label: string;
  /** CSS `font-family` value (already includes fallback chain). */
  family: string;
  category: FontCategory;
  /** Weights available — used by Google Fonts query string. */
  weights: number[];
  /** Short note shown under the label in the picker (optional). */
  note?: string;
}

/**
 * Inter is the project's default — loaded by `next/font` in the root
 * layout. We expose it here so the picker can show / select it explicitly.
 */
const SYSTEM_FALLBACK_SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const SYSTEM_FALLBACK_SERIF =
  'ui-serif, Georgia, Cambria, "Times New Roman", serif';
const SYSTEM_FALLBACK_MONO =
  'ui-monospace, SFMono-Regular, "Roboto Mono", monospace';

export const FONTS: FontDef[] = [
  // ── Sans-serif (default + most popular) ──────────────────────────────
  {
    id: 'inter',
    label: 'Inter',
    family: `'Inter', ${SYSTEM_FALLBACK_SANS}`,
    category: 'sans',
    weights: [400, 500, 600, 700, 900],
    note: 'Default — UI / body',
  },
  {
    id: 'geist',
    label: 'Geist',
    family: `'Geist', ${SYSTEM_FALLBACK_SANS}`,
    category: 'sans',
    weights: [300, 400, 500, 600, 700, 800, 900],
    note: 'Framer template default — modern sans',
  },
  {
    id: 'be-vietnam-pro',
    label: 'Be Vietnam Pro',
    family: `'Be Vietnam Pro', ${SYSTEM_FALLBACK_SANS}`,
    category: 'sans',
    weights: [400, 500, 600, 700, 800],
    note: 'Thiết kế riêng cho tiếng Việt',
  },
  {
    id: 'roboto',
    label: 'Roboto',
    family: `'Roboto', ${SYSTEM_FALLBACK_SANS}`,
    category: 'sans',
    weights: [400, 500, 700, 900],
  },
  {
    id: 'open-sans',
    label: 'Open Sans',
    family: `'Open Sans', ${SYSTEM_FALLBACK_SANS}`,
    category: 'sans',
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: 'montserrat',
    label: 'Montserrat',
    family: `'Montserrat', ${SYSTEM_FALLBACK_SANS}`,
    category: 'sans',
    weights: [400, 500, 600, 700, 800, 900],
  },
  {
    id: 'nunito',
    label: 'Nunito',
    family: `'Nunito', ${SYSTEM_FALLBACK_SANS}`,
    category: 'sans',
    weights: [400, 600, 700, 800, 900],
    note: 'Bo tròn, thân thiện',
  },
  {
    id: 'manrope',
    label: 'Manrope',
    family: `'Manrope', ${SYSTEM_FALLBACK_SANS}`,
    category: 'sans',
    weights: [400, 500, 600, 700, 800],
  },
  {
    id: 'dm-sans',
    label: 'DM Sans',
    family: `'DM Sans', ${SYSTEM_FALLBACK_SANS}`,
    category: 'sans',
    weights: [400, 500, 700],
  },
  {
    id: 'lexend',
    label: 'Lexend',
    family: `'Lexend', ${SYSTEM_FALLBACK_SANS}`,
    category: 'sans',
    weights: [400, 500, 600, 700, 800],
    note: 'Dễ đọc',
  },

  // ── Serif ────────────────────────────────────────────────────────────
  {
    id: 'lora',
    label: 'Lora',
    family: `'Lora', ${SYSTEM_FALLBACK_SERIF}`,
    category: 'serif',
    weights: [400, 500, 600, 700],
  },
  {
    id: 'playfair',
    label: 'Playfair',
    family: `'Playfair', ${SYSTEM_FALLBACK_SERIF}`,
    category: 'serif',
    weights: [400, 500, 600, 700, 800, 900],
    note: 'Framer template default — editorial serif',
  },
  {
    id: 'playfair-display',
    label: 'Playfair Display',
    family: `'Playfair Display', ${SYSTEM_FALLBACK_SERIF}`,
    category: 'serif',
    weights: [400, 500, 600, 700, 800, 900],
    note: 'Editorial / luxury',
  },
  {
    id: 'merriweather',
    label: 'Merriweather',
    family: `'Merriweather', ${SYSTEM_FALLBACK_SERIF}`,
    category: 'serif',
    weights: [400, 700, 900],
  },

  // ── Display ──────────────────────────────────────────────────────────
  {
    id: 'quicksand',
    label: 'Quicksand',
    family: `'Quicksand', ${SYSTEM_FALLBACK_SANS}`,
    category: 'display',
    weights: [400, 500, 600, 700],
  },
  {
    id: 'aboreto',
    label: 'Aboreto',
    family: `'Aboreto', ${SYSTEM_FALLBACK_SANS}`,
    category: 'display',
    weights: [400],
    note: 'Cite Flow — amenity heading display',
  },
  {
    id: 'abril-fatface',
    label: 'Abril Fatface',
    family: `'Abril Fatface', Georgia, ${SYSTEM_FALLBACK_SERIF}`,
    category: 'display',
    weights: [400],
    note: 'Cite Flow — hero/stat display serif',
  },

  // ── Mono ─────────────────────────────────────────────────────────────
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    family: `'JetBrains Mono', ${SYSTEM_FALLBACK_MONO}`,
    category: 'mono',
    weights: [400, 500, 700],
  },
  {
    id: 'geist-mono',
    label: 'Geist Mono',
    family: `'Geist Mono', ${SYSTEM_FALLBACK_MONO}`,
    category: 'mono',
    weights: [400, 500, 700],
    note: 'Monospace editorial (sustainit)',
  },
];

export const DEFAULT_FONT_ID = 'inter';

export function findFont(id: string | undefined | null): FontDef {
  if (!id) return FONTS[0];
  return FONTS.find(f => f.id === id) ?? FONTS[0];
}

/**
 * Build the Google Fonts CSS2 URL — one stylesheet request covering every
 * font + weight in the registry. Inter is excluded because `next/font`
 * already serves it from the root layout.
 *
 * Pattern: `family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Roboto:wght@400;...`
 */
export const GOOGLE_FONTS_HREF = (() => {
  const families = FONTS.filter(f => f.id !== 'inter') // already loaded by next/font
    .map(f => {
      const name = f.label.replace(/\s+/g, '+');
      const weights = f.weights.join(';');
      return `family=${name}:wght@${weights}`;
    })
    .join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
})();
