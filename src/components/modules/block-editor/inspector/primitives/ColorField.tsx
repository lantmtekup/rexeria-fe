'use client';

import * as React from 'react';
import { Ban } from 'lucide-react';

import {
  BRAND_COLOR_ROLES,
  brandToken,
  brandTokenKey,
  previewColor,
} from '@/lib/brand-kit';
import { cn } from '@/lib/cn';

import {
  CONTROL_FOCUS,
  CONTROL_H,
  CONTROL_SURFACE,
  ICON_SM,
  SWATCH,
  TEXT_NUM,
} from '../tokens';

/**
 * Accepts `#rgb`, `#rrggbb`, `#rrggbbaa` and any `rgb()/rgba()/hsl()/hsla()`
 * form. Returns null when the string isn't a usable CSS color yet — callers
 * treat that as "still typing" rather than an error while the field is focused.
 */
export function normalizeCssColor(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^(rgb|rgba|hsl|hsla)\(/i.test(s)) return s;
  const withHash = s.startsWith('#') ? s : `#${s}`;
  if (/^#([0-9a-fA-F]{3})$/.test(withHash)) {
    const [, a, b, c] = withHash.match(/^#(.)(.)(.)$/)!;
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
  }
  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(withHash)) {
    return withHash.toLowerCase();
  }
  return null;
}

/** Display value for the hex field — raw color as-is, token → preview hex. */
function colorInputDisplay(value: string): string {
  const role = brandTokenKey(value);
  if (role) return previewColor(role);
  if (/^#|^rgb|^hsl/i.test(value.trim())) return value.trim();
  return value;
}

interface ColorFieldProps {
  /** Stored value: `token:<role>` or a raw CSS color. Empty = unset. */
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  /** Fallback shown in the picker when `value` is empty. */
  fallback?: string;
  /** Render a "no color" option (used for optional fills). */
  allowUnset?: boolean;
  ariaLabel: string;
}

/**
 * Brand-token swatches + native picker + free-form hex, laid out for a vertical
 * inspector. Tokens store `token:<role>` so the brand kit can restyle a page
 * centrally; custom colors store raw CSS and pass through `resolveColorValue`.
 */
export function ColorField({
  value,
  onChange,
  fallback = '#111111',
  allowUnset = false,
  ariaLabel,
}: ColorFieldProps) {
  const effective = value || fallback;
  const activeRole = brandTokenKey(value);
  const isCustom = !!value && !activeRole;

  const [draft, setDraft] = React.useState(() => colorInputDisplay(effective));
  const [hexError, setHexError] = React.useState(false);

  const valueRef = React.useRef(effective);
  const draftRef = React.useRef(draft);
  const onChangeRef = React.useRef(onChange);
  valueRef.current = effective;
  draftRef.current = draft;
  onChangeRef.current = onChange;

  React.useEffect(() => {
    setDraft(colorInputDisplay(effective));
    setHexError(false);
  }, [effective]);

  // Commit a pending hex on unmount — selecting another element unmounts the
  // field without firing blur, which used to silently drop the typed color.
  React.useEffect(() => {
    return () => {
      const next = normalizeCssColor(draftRef.current);
      if (!next) return;
      if (next === valueRef.current) return;
      if (next === colorInputDisplay(valueRef.current)) return;
      onChangeRef.current(next);
    };
  }, []);

  const commitHex = (raw: string, { soft = false } = {}) => {
    const next = normalizeCssColor(raw);
    if (!next) {
      if (!soft) {
        setHexError(true);
        setDraft(colorInputDisplay(effective));
      }
      return;
    }
    setHexError(false);
    if (next !== value) onChange(next);
  };

  const nativeColor =
    normalizeCssColor(colorInputDisplay(effective))?.slice(0, 7) ?? '#111111';

  return (
    <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
      <div className='flex items-center gap-1'>
        {allowUnset && (
          <button
            type='button'
            onClick={() => onChange(undefined)}
            title='Không đặt màu'
            aria-label={`${ariaLabel}: không đặt màu`}
            className={cn(
              'text-content-muted flex shrink-0 cursor-pointer items-center justify-center rounded ring-1 ring-black/10 transition',
              SWATCH,
              !value && 'ring-2 ring-sky-500 ring-offset-1'
            )}
          >
            <Ban className={ICON_SM} />
          </button>
        )}
        {BRAND_COLOR_ROLES.map(role => (
          <button
            key={role.key}
            type='button'
            onClick={() => onChange(brandToken(role.key))}
            title={role.label}
            aria-label={`${ariaLabel}: ${role.label}`}
            className={cn(
              'shrink-0 cursor-pointer rounded ring-1 ring-black/10 transition',
              SWATCH,
              activeRole === role.key && 'ring-2 ring-sky-500 ring-offset-1'
            )}
            style={{ backgroundColor: previewColor(role.key) }}
          />
        ))}
      </div>

      <div className={cn('flex items-center gap-1.5', CONTROL_H)}>
        <label
          className={cn(
            'relative shrink-0 cursor-pointer overflow-hidden rounded ring-1 ring-black/10',
            SWATCH
          )}
        >
          <span
            className='pointer-events-none absolute inset-0'
            style={{ backgroundColor: nativeColor }}
            aria-hidden
          />
          <input
            type='color'
            value={nativeColor}
            onChange={e => onChange(e.target.value.toLowerCase())}
            aria-label={`${ariaLabel}: chọn màu`}
            className='absolute inset-0 cursor-pointer opacity-0'
          />
        </label>
        <input
          value={draft}
          onChange={e => {
            const next = e.target.value;
            setDraft(next);
            setHexError(false);
            // Live-apply once the typed value is already a complete color.
            commitHex(next, { soft: true });
          }}
          onBlur={() => commitHex(draft)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitHex(draft);
            }
          }}
          placeholder='#hex'
          spellCheck={false}
          aria-label={`${ariaLabel}: mã màu`}
          aria-invalid={hexError}
          className={cn(
            'h-full min-w-0 flex-1 px-1.5 tracking-tight',
            CONTROL_SURFACE,
            CONTROL_FOCUS,
            TEXT_NUM,
            isCustom && 'ring-1 ring-sky-400/60',
            hexError && 'border-red-400 text-red-600'
          )}
        />
      </div>
    </div>
  );
}
