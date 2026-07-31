'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/cn';

import { ICON_SM, PANEL_PAD_X, ROW_GAP, TEXT_META } from '../tokens';

const STORAGE_KEY = 'rexer.inspector.sections';

/**
 * Read the collapsed-section map from localStorage. Returns an empty map on
 * SSR or when the stored value is corrupt — a broken preference must never
 * take the inspector down.
 */
function readCollapsed(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, boolean>;
  } catch {
    return {};
  }
}

function writeCollapsed(next: Record<string, boolean>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota — the section still toggles for this session.
  }
}

interface InspectorSectionProps {
  /** Stable id used as the localStorage key. */
  id: string;
  title: string;
  /** Collapsed on first visit (before the user has ever toggled it). */
  defaultCollapsed?: boolean;
  /**
   * How many fields in this section currently carry an override. Rendered as a
   * count badge so the user can spot edited sections without opening them.
   */
  overrideCount?: number;
  children: React.ReactNode;
}

export function InspectorSection({
  id,
  title,
  defaultCollapsed = false,
  overrideCount = 0,
  children,
}: InspectorSectionProps) {
  // Read on mount, not during render, so server and first client paint agree.
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  React.useEffect(() => {
    const stored = readCollapsed()[id];
    if (typeof stored === 'boolean') setCollapsed(stored);
  }, [id]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    writeCollapsed({ ...readCollapsed(), [id]: next });
  };

  const contentId = `inspector-section-${id}`;

  return (
    <section className='border-border/60 border-b last:border-b-0'>
      <h3>
        <button
          type='button'
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-controls={contentId}
          className={cn(
            'text-content-muted hover:text-foreground flex h-9 w-full cursor-pointer items-center gap-1.5 text-left transition-colors',
            PANEL_PAD_X
          )}
        >
          <ChevronDown
            className={cn(
              'shrink-0 transition-transform duration-150',
              ICON_SM,
              collapsed && '-rotate-90'
            )}
            aria-hidden
          />
          <span
            className={cn('font-semibold tracking-wider uppercase', TEXT_META)}
          >
            {title}
          </span>
          {overrideCount > 0 && (
            <span
              title={`${overrideCount} thuộc tính đã chỉnh`}
              className={cn(
                'ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500/15 px-1 font-mono text-sky-600 tabular-nums',
                TEXT_META
              )}
            >
              {overrideCount}
            </span>
          )}
        </button>
      </h3>
      {!collapsed && (
        <div
          id={contentId}
          className={cn('flex flex-col pb-3', ROW_GAP, PANEL_PAD_X)}
        >
          {children}
        </div>
      )}
    </section>
  );
}
