'use client';

import * as React from 'react';
import {
  Activity,
  FileText,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Package,
} from 'lucide-react';

import { cn } from '@/lib/cn';

/**
 * The editor's left navigation rail.
 *
 * Five destinations, one column. Everything that used to be scattered around
 * the chrome — the block filmstrip on the right, the page tabs across the top,
 * the layer tree inside the sidebar, and the product/media pickers that only
 * existed as modals — now lives behind one of these.
 *
 * Icon-only at 56px. The stacked label under each icon is what forced the rail
 * to 88px, and 88px of permanent chrome is expensive on a laptop — the canvas
 * is the thing being edited. The label survives as the tooltip and the
 * accessible name; the panel header repeats it once the panel is open.
 *
 * Clicking the ACTIVE tab collapses the panel column, which is how you get the
 * canvas back to full width without losing your place.
 */

export type EditorRailTab =
  | 'blocks'
  | 'layers'
  | 'media'
  | 'product'
  | 'pages'
  | 'signal';

type RailItem = {
  id: EditorRailTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Hidden in block-direct mode, where there is no template to page through. */
  templateOnly?: boolean;
};

export const EDITOR_RAIL_ITEMS: RailItem[] = [
  { id: 'blocks', label: 'Blocks', icon: LayoutGrid, templateOnly: true },
  { id: 'layers', label: 'Lớp', icon: Layers },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'product', label: 'Sản phẩm', icon: Package },
  { id: 'pages', label: 'Trang', icon: FileText, templateOnly: true },
  { id: 'signal', label: 'Signal', icon: Activity },
];

interface EditorRailProps {
  activeTab: EditorRailTab;
  /** False when the panel column is collapsed — the active tab reads as "off". */
  panelOpen: boolean;
  /** Block-direct mode has one block and no template: no Blocks, no Pages. */
  blockMode?: boolean;
  onSelect: (tab: EditorRailTab) => void;
}

export function EditorRail({
  activeTab,
  panelOpen,
  blockMode = false,
  onSelect,
}: EditorRailProps) {
  const items = blockMode
    ? EDITOR_RAIL_ITEMS.filter(i => !i.templateOnly)
    : EDITOR_RAIL_ITEMS;

  return (
    <nav
      aria-label='Bảng điều khiển canvas'
      data-testid='editor-rail'
      className='flex w-14 shrink-0 flex-col gap-0.5 border-r border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] p-1.5'
    >
      {items.map(item => {
        const Icon = item.icon;
        const active = panelOpen && activeTab === item.id;

        return (
          <button
            key={item.id}
            type='button'
            data-testid={`editor-rail-${item.id}`}
            aria-current={active ? 'page' : undefined}
            aria-label={item.label}
            title={item.label}
            onClick={() => onSelect(item.id)}
            className={cn(
              'flex size-11 cursor-pointer items-center justify-center self-center rounded-md',
              'transition-colors',
              active
                ? 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
                : 'text-[var(--pv2-mut)] hover:bg-[var(--pv2-paper)] hover:text-[var(--pv2-ink)]'
            )}
          >
            <Icon className='size-4.5 shrink-0' />
          </button>
        );
      })}
    </nav>
  );
}
