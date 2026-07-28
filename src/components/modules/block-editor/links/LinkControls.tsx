'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  ChevronDown,
  ExternalLink,
  Home,
  Link2,
  MoveDown,
  Ban,
} from 'lucide-react';

import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/cn';

import { getContentAt, setContentAt } from '../contentPath';
import type { BlockContent } from '../types';
import {
  formatBlockLink,
  formatPageLink,
  parseLink,
  type ParsedLink,
} from './linkToken';
import { useSitePages } from './SitePagesContext';

/**
 * Link picker for a content field.
 *
 * Backward compatible by construction: the stored value is still a plain
 * string, and any value the picker doesn't recognise lands in "URL ngoài" and
 * round-trips untouched. So the ~45 link fields still declared as
 * `fieldType: 'text'` keep working, and can be migrated to `'link'` one
 * registry def at a time.
 */

type LinkMode = 'none' | 'page' | 'block' | 'external';

const MODES: { value: LinkMode; label: string; icon: typeof Link2 }[] = [
  { value: 'none', label: 'Không có link', icon: Ban },
  { value: 'page', label: 'Trang trong template', icon: Home },
  { value: 'block', label: 'Cuộn tới block', icon: MoveDown },
  { value: 'external', label: 'URL ngoài', icon: ExternalLink },
];

function modeOf(parsed: ParsedLink): LinkMode {
  return parsed.kind;
}

interface LinkControlsProps {
  fieldKey: string;
  content: BlockContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}

export function LinkControls({
  fieldKey,
  content,
  onContentChange,
}: LinkControlsProps) {
  const { pages, activePageId, blocks } = useSitePages();
  const [open, setOpen] = React.useState(false);

  // Same cast the rest of ElementToolbar uses — BlockContent is a union of
  // concrete interfaces without an index signature.
  const raw = getContentAt(content as Record<string, unknown>, fieldKey);
  const value = typeof raw === 'string' ? raw : '';
  const parsed = parseLink(value);
  const mode = modeOf(parsed);

  const write = (next: string) =>
    onContentChange(
      prev =>
        setContentAt(
          prev as Record<string, unknown>,
          fieldKey,
          next
        ) as BlockContent
    );

  const handleMode = (next: LinkMode) => {
    if (next === mode) return;
    if (next === 'none') return write('');
    if (next === 'page') {
      const first = pages.find(p => p.id !== activePageId) ?? pages[0];
      return write(first ? formatPageLink(first.id) : '');
    }
    if (next === 'block') {
      return write(blocks[0] ? formatBlockLink(blocks[0].id) : '');
    }
    write('https://');
  };

  const summary = (() => {
    if (parsed.kind === 'page') {
      const p = pages.find(x => x.id === parsed.pageId);
      return p ? p.name : 'Trang đã xoá';
    }
    if (parsed.kind === 'block') {
      const b = blocks.find(x => x.id === parsed.blockId);
      return b ? b.name : 'Block đã xoá';
    }
    if (parsed.kind === 'external') return parsed.href;
    return 'Chưa đặt';
  })();

  const broken =
    (parsed.kind === 'page' && !pages.some(p => p.id === parsed.pageId)) ||
    (parsed.kind === 'block' && !blocks.some(b => b.id === parsed.blockId));

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={cn(
          'text-2xs border-border hover:bg-muted inline-flex h-7 max-w-[220px] items-center gap-1.5 rounded-md border px-2 transition-colors',
          broken && 'border-red-300 text-red-600'
        )}
      >
        <Link2 className='size-3 shrink-0' />
        <span className='truncate'>{summary}</span>
        <ChevronDown className='size-3 shrink-0 opacity-50' />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='start'
          sideOffset={6}
          className='border-border bg-background z-50 w-72 space-y-2 rounded-lg border p-2 shadow-lg'
        >
          <div className='grid grid-cols-2 gap-1'>
            {MODES.map(m => (
              <button
                key={m.value}
                type='button'
                onClick={() => handleMode(m.value)}
                className={cn(
                  'text-2xs flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors',
                  mode === m.value
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-content-muted hover:bg-muted/60'
                )}
              >
                <m.icon className='size-3' />
                {m.label}
              </button>
            ))}
          </div>

          {mode === 'page' && (
            <select
              value={parsed.kind === 'page' ? parsed.pageId : ''}
              onChange={e => write(formatPageLink(e.target.value))}
              className='border-border bg-background h-8 w-full rounded-md border px-2 text-xs'
            >
              {pages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.isHome ? ' (trang chủ)' : ` — /${p.slug}`}
                </option>
              ))}
            </select>
          )}

          {mode === 'block' && (
            <select
              value={parsed.kind === 'block' ? parsed.blockId : ''}
              onChange={e => write(formatBlockLink(e.target.value))}
              className='border-border bg-background h-8 w-full rounded-md border px-2 text-xs'
            >
              {blocks.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {mode === 'external' && (
            <Input
              value={parsed.kind === 'external' ? parsed.href : ''}
              onChange={e => write(e.target.value)}
              placeholder='https://… hoặc mailto:…'
              className='h-8 text-xs'
            />
          )}

          {broken && (
            <p className='text-2xs text-red-600'>
              Đích của link không còn tồn tại — chọn lại.
            </p>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
