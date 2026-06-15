/**
 * Brand Kit — controlled design-token layer (Phase 1).
 *
 * A brand's active kit (colors/fonts/logo/tokens) comes from the BE on the
 * public page response and from the brand-kit API in the editor. At render time
 * it becomes CSS custom properties on a wrapper element (`--bk-color-*`,
 * `--bk-font-*`, `--bk-*`), and every block element style references a token via
 * the `token:<key>` value convention instead of a raw hex/font-id.
 *
 *   element color "token:primary"  → var(--bk-color-primary)
 *   element font  "token:heading"  → var(--bk-font-heading)
 *
 * Legacy free-form values (a raw `#hex` color or a font id) still resolve so
 * pages authored before the controlled switch keep rendering — but the editor
 * only ever writes `token:` values going forward.
 */

import type * as React from 'react';

import { findFont } from '@/lib/fonts';

const TOKEN_PREFIX = 'token:';

/** Active brand kit as delivered by the BE (`page.brand_kit`). */
export interface BrandKitData {
  /** Role → hex, e.g. {primary:"#1A73E8", text:"#111", bg:"#fff"}. */
  colors?: Record<string, string>;
  /** Role → font id (see src/lib/fonts.ts), e.g. {heading:"playfair-display"}. */
  fonts?: Record<string, string>;
  logo?: Record<string, unknown>;
  /** Misc scalar tokens, e.g. {radius:"12px"}. */
  tokens?: Record<string, string | number>;
}

/** True when a style value points at a brand token (`token:<key>`). */
export function isBrandToken(value: string | undefined): boolean {
  return typeof value === 'string' && value.startsWith(TOKEN_PREFIX);
}

/** Build a `token:<key>` value for storage in element styles. */
export function brandToken(key: string): string {
  return TOKEN_PREFIX + key;
}

/** Extract `<key>` from a `token:<key>` value (or null if not a token). */
export function brandTokenKey(value: string | undefined): string | null {
  return isBrandToken(value) ? value!.slice(TOKEN_PREFIX.length) : null;
}

/**
 * Resolve a stored element color value to a CSS color:
 *  - `token:primary` → `var(--bk-color-primary)`
 *  - legacy `#hex` / `rgb(...)` → returned unchanged
 */
export function resolveColorValue(value: string): string {
  const key = brandTokenKey(value);
  return key ? `var(--bk-color-${key})` : value;
}

/**
 * Resolve a stored element font value to a CSS font-family:
 *  - `token:heading` → `var(--bk-font-heading)`
 *  - legacy font id (e.g. `inter`) → its full family string
 */
export function resolveFontValue(value: string): string {
  const key = brandTokenKey(value);
  return key ? `var(--bk-font-${key})` : findFont(value).family;
}

/** A selectable brand token slot shown in the controlled pickers. */
export interface BrandRole {
  key: string;
  label: string;
}

/** Standard color token roles a block element style may reference. */
export const BRAND_COLOR_ROLES: BrandRole[] = [
  { key: 'primary', label: 'Chính' },
  { key: 'secondary', label: 'Phụ' },
  { key: 'accent', label: 'Nhấn' },
  { key: 'text', label: 'Chữ' },
  { key: 'bg', label: 'Nền' },
  { key: 'muted', label: 'Mờ' },
];

/** Standard font token roles. */
export const BRAND_FONT_ROLES: BrandRole[] = [
  { key: 'heading', label: 'Tiêu đề' },
  { key: 'body', label: 'Nội dung' },
];

/**
 * Preview-only kit used while authoring a (brand-agnostic) template — the real
 * per-brand kit fills these at render time. Lets authors see a sensible color
 * and font while they pick a token role.
 */
export const DEFAULT_PREVIEW_KIT: BrandKitData = {
  colors: {
    primary: '#1A73E8',
    secondary: '#7C3AED',
    accent: '#0EA5E9',
    text: '#111111',
    bg: '#FFFFFF',
    muted: '#6B7280',
  },
  fonts: { heading: 'playfair-display', body: 'inter' },
  tokens: { radius: '12px' },
};

/** Preview hex for a color role (editor display only). */
export function previewColor(roleKey: string): string {
  return DEFAULT_PREVIEW_KIT.colors?.[roleKey] ?? '#000000';
}

/**
 * Turn a brand kit into a CSS-variable style object to spread onto a wrapper
 * element. Custom properties cascade to every descendant block, so a single
 * wrapper styles the whole page. Returns an empty object when no kit is set
 * (the page falls back to the base theme).
 */
export function brandKitToCssVars(
  kit: BrandKitData | undefined
): React.CSSProperties {
  const vars: Record<string, string> = {};
  if (!kit) return vars as React.CSSProperties;
  for (const [key, hex] of Object.entries(kit.colors ?? {})) {
    if (typeof hex === 'string' && hex) vars[`--bk-color-${key}`] = hex;
  }
  for (const [key, fontId] of Object.entries(kit.fonts ?? {})) {
    if (typeof fontId === 'string' && fontId) {
      vars[`--bk-font-${key}`] = findFont(fontId).family;
    }
  }
  for (const [key, val] of Object.entries(kit.tokens ?? {})) {
    if (val !== undefined && val !== null) vars[`--bk-${key}`] = String(val);
  }
  return vars as React.CSSProperties;
}
