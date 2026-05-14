'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';

import { cn } from '@/lib/cn';
import { DEFAULT_FONT_ID, FONTS, findFont, type FontDef } from '@/lib/fonts';

interface Props {
  value: string | undefined;
  onChange: (fontId: string) => void;
  /** Render a compact trigger (square icon) instead of the default labelled chip. */
  compact?: boolean;
}

const CATEGORY_LABEL: Record<FontDef['category'], string> = {
  sans: 'Sans-serif',
  serif: 'Serif',
  display: 'Display',
  mono: 'Mono',
};

/**
 * Vietnamese-friendly font picker. Renders each option in its own family
 * for instant visual preview. The Google Fonts stylesheet is preloaded in
 * the root layout so selection is immediate (no FOUT after the first
 * paint).
 */
export function FontPicker({ value, onChange, compact }: Props) {
  const current = findFont(value ?? DEFAULT_FONT_ID);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!query.trim()) return FONTS;
    const q = query.trim().toLowerCase();
    return FONTS.filter(
      f =>
        f.label.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        CATEGORY_LABEL[f.category].toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = React.useMemo(() => {
    const buckets: Record<FontDef['category'], FontDef[]> = {
      sans: [],
      serif: [],
      display: [],
      mono: [],
    };
    for (const f of filtered) buckets[f.category].push(f);
    return buckets;
  }, [filtered]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type='button'
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md bg-white px-2 text-xs text-neutral-900 ring-1 ring-neutral-200/80 transition-shadow hover:ring-neutral-300 focus:ring-2 focus:ring-neutral-900/15 focus:outline-none',
            compact ? 'h-7 w-7 justify-center px-0' : 'h-7'
          )}
          title={`Font: ${current.label}`}
        >
          <span
            className='truncate'
            style={{ fontFamily: current.family, maxWidth: compact ? 0 : 110 }}
          >
            {compact ? 'Aa' : current.label}
          </span>
          {!compact ? (
            <ChevronDown className='size-3 text-neutral-500' />
          ) : null}
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align='start'
          sideOffset={6}
          className='bg-background animate-in fade-in zoom-in-95 z-50 max-h-80 w-64 overflow-hidden rounded-lg border shadow-lg'
        >
          <div className='border-b p-2'>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Tìm font…'
              className='h-8 w-full rounded-md bg-neutral-50 px-2 text-xs ring-1 ring-neutral-200 placeholder:text-neutral-400 focus:bg-white focus:ring-neutral-300 focus:outline-none'
            />
          </div>
          <div className='max-h-64 overflow-y-auto py-1'>
            {(['sans', 'serif', 'display', 'mono'] as const).map(cat => {
              const items = grouped[cat];
              if (items.length === 0) return null;
              return (
                <div key={cat} className='py-1'>
                  <div className='text-muted-foreground px-3 pb-1 text-[10px] font-semibold tracking-wide uppercase'>
                    {CATEGORY_LABEL[cat]}
                  </div>
                  {items.map(f => {
                    const selected = f.id === current.id;
                    return (
                      <button
                        key={f.id}
                        type='button'
                        onClick={() => {
                          onChange(f.id);
                          setOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-neutral-100',
                          selected && 'bg-neutral-100'
                        )}
                      >
                        <span className='min-w-0 flex-1 truncate'>
                          <span
                            className='block truncate text-sm leading-5'
                            style={{ fontFamily: f.family }}
                          >
                            {f.label}
                          </span>
                          {f.note ? (
                            <span className='text-muted-foreground block text-[10px]'>
                              {f.note}
                            </span>
                          ) : null}
                        </span>
                        {selected ? (
                          <Check className='text-primary size-3.5 shrink-0' />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {filtered.length === 0 ? (
              <p className='text-muted-foreground px-3 py-4 text-center text-xs'>
                Không tìm thấy font.
              </p>
            ) : null}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
