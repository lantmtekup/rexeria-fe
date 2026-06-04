'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  Award,
  Box,
  Building2,
  CheckCircle2,
  Compass,
  Diamond,
  Flame,
  Gift,
  Globe2,
  Handshake,
  Heart,
  Home,
  Leaf,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  TreePine,
  Trees,
  Truck,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/cn';

/**
 * Curated set of lucide icons most relevant to product features. Keeping the
 * list small + visible-by-default is better UX than searching the full 1500+
 * icon catalog. Add as `[name, Component]` pairs — name MUST match the lucide
 * icon name so renderers can look it up.
 */
const ICONS: Array<[string, LucideIcon]> = [
  ['Sparkles', Sparkles],
  ['Star', Star],
  ['Heart', Heart],
  ['Shield', Shield],
  ['ShieldCheck', ShieldCheck],
  ['CheckCircle2', CheckCircle2],
  ['Award', Award],
  ['Diamond', Diamond],
  ['Flame', Flame],
  ['Sun', Sun],
  ['Leaf', Leaf],
  ['TreePine', TreePine],
  ['Trees', Trees],
  ['Waves', Waves],
  ['Globe2', Globe2],
  ['Compass', Compass],
  ['Home', Home],
  ['Building2', Building2],
  ['Box', Box],
  ['Gift', Gift],
  ['Truck', Truck],
  ['Zap', Zap],
  ['Handshake', Handshake],
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(ICONS);

/**
 * Render a lucide icon by name. Returns null if name not in the curated map.
 * Use this from feature/cert renderers instead of a switch statement.
 */
export function IconByName({
  name,
  className,
}: {
  name: string | undefined;
  className?: string;
}) {
  if (!name) return null;
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

interface IconPickerProps {
  value?: string;
  onChange: (next: string | undefined) => void;
  /** Trigger label override; default shows icon name or placeholder. */
  label?: string;
}

/**
 * Compact popover icon picker with search + grid of curated lucide icons.
 * Used by feature editors to associate an icon with each feature row.
 */
export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICONS;
    return ICONS.filter(([name]) => name.toLowerCase().includes(q));
  }, [query]);

  const Active = value ? ICON_MAP[value] : undefined;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type='button'
          aria-label={value ? `Icon: ${value}` : 'Pick an icon'}
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900',
            !value && 'text-neutral-400'
          )}
        >
          {Active ? (
            <Active className='size-3.5' />
          ) : (
            <Sparkles className='size-3.5 text-neutral-300' />
          )}
          <span className='max-w-[120px] truncate'>
            {label ?? value ?? 'Chọn icon'}
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='start'
          sideOffset={6}
          className='z-50 w-72 rounded-md border border-neutral-200 bg-white p-2 shadow-xl ring-1 ring-black/5 outline-none'
        >
          <div className='mb-2 flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2'>
            <Search className='size-3.5 shrink-0 text-neutral-400' />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Tìm icon (vd: leaf, shield)…'
              className='h-7 flex-1 bg-transparent text-xs outline-none placeholder:text-neutral-400'
            />
            {value && (
              <button
                type='button'
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
                className='text-3xs font-medium text-neutral-500 hover:text-neutral-900'
              >
                Bỏ chọn
              </button>
            )}
          </div>
          <div className='grid max-h-60 grid-cols-6 gap-1 overflow-y-auto'>
            {filtered.map(([name, Icon]) => {
              const active = value === name;
              return (
                <button
                  key={name}
                  type='button'
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  title={name}
                  className={cn(
                    'flex aspect-square cursor-pointer flex-col items-center justify-center rounded transition-colors',
                    active
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                >
                  <Icon className='size-4' />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className='text-2xs col-span-6 py-3 text-center text-neutral-400'>
                Không tìm thấy icon
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Names of curated icons (for validation / autocomplete elsewhere). */
export const CURATED_ICON_NAMES = ICONS.map(([name]) => name);
