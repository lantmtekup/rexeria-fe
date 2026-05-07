'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronRight,
  CircleDot,
  Image as ImageIcon,
  Layers,
  ListChecks,
  MousePointerClick,
  Sparkles,
  Type,
} from 'lucide-react';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { cn } from '@/lib/cn';

import {
  FIELD_LABEL,
  GROUP_LABEL,
  type BlockDiff,
  type CanvasDiff,
  type DiffGroup,
  type FieldDiff,
} from './diffCanvas';
import type { AcceptMap } from './mergeAcceptedChanges';

export interface ReviewChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diff: CanvasDiff | null;
  productName: string;
  /** Called when user clicks "Apply N/M". Caller merges + saves. */
  onApply: (accept: AcceptMap) => void;
}

const GROUP_ICON: Record<DiffGroup, React.ElementType> = {
  text: Type,
  image: ImageIcon,
  list: ListChecks,
  cta: MousePointerClick,
};

// ─── Helpers — build initial / preset accept maps ─────────────────────────

function allGroupsFromDiff(diff: CanvasDiff): AcceptMap {
  const m: AcceptMap = new Map();
  for (const b of diff.blocks) {
    if (b.groups.length === 0) continue;
    m.set(b.blockId, new Set(b.groups.map(g => g.group)));
  }
  return m;
}

function emptyAcceptFromDiff(diff: CanvasDiff): AcceptMap {
  return new Map(diff.blocks.map(b => [b.blockId, new Set<DiffGroup>()]));
}

function onlyGroupsFromDiff(diff: CanvasDiff, groups: DiffGroup[]): AcceptMap {
  const allow = new Set(groups);
  const m: AcceptMap = new Map();
  for (const b of diff.blocks) {
    const accepted = new Set(
      b.groups.map(g => g.group).filter(g => allow.has(g))
    );
    m.set(b.blockId, accepted);
  }
  return m;
}

// Count accepted (block, group) pairs and compute total available pairs.
function countAccepts(
  diff: CanvasDiff,
  accept: AcceptMap
): {
  acceptedFields: number;
  totalFields: number;
  acceptedGroupPairs: number;
} {
  let acceptedFields = 0;
  let acceptedGroupPairs = 0;
  for (const b of diff.blocks) {
    const groups = accept.get(b.blockId);
    if (!groups) continue;
    for (const g of b.groups) {
      if (groups.has(g.group)) {
        acceptedGroupPairs++;
        acceptedFields += g.fields.length;
      }
    }
  }
  return {
    acceptedFields,
    totalFields: diff.totalChanges,
    acceptedGroupPairs,
  };
}

// ─── Main dialog ──────────────────────────────────────────────────────────

export function ReviewChangesDialog({
  open,
  onOpenChange,
  diff,
  productName,
  onApply,
}: ReviewChangesDialogProps) {
  const [accept, setAccept] = React.useState<AcceptMap>(new Map());

  // Reset to "accept all" each time the dialog opens with a new diff.
  React.useEffect(() => {
    if (open && diff) setAccept(allGroupsFromDiff(diff));
  }, [open, diff]);

  if (!diff) return null;

  const { acceptedFields, totalFields, acceptedGroupPairs } = countAccepts(
    diff,
    accept
  );

  const toggleGroup = (blockId: string, group: DiffGroup) => {
    setAccept(prev => {
      const next = new Map(prev);
      const set = new Set(next.get(blockId) ?? []);
      if (set.has(group)) set.delete(group);
      else set.add(group);
      next.set(blockId, set);
      return next;
    });
  };

  const toggleBlock = (block: BlockDiff) => {
    setAccept(prev => {
      const next = new Map(prev);
      const current = next.get(block.blockId) ?? new Set();
      const blockGroups = block.groups.map(g => g.group);
      const allOn = blockGroups.every(g => current.has(g));
      next.set(block.blockId, allOn ? new Set() : new Set(blockGroups));
      return next;
    });
  };

  const setAllAccept = () => setAccept(allGroupsFromDiff(diff));
  const setRejectAll = () => setAccept(emptyAcceptFromDiff(diff));
  const setOnlyGroups = (groups: DiffGroup[]) =>
    setAccept(onlyGroupsFromDiff(diff, groups));

  const handleApply = () => {
    onApply(accept);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[85vh] max-w-3xl flex-col gap-3 p-0'>
        <DialogHeader className='shrink-0 border-b border-neutral-200 bg-white px-6 pt-5 pb-3'>
          <DialogTitle className='flex items-center gap-2 text-base'>
            <Sparkles className='size-4 text-violet-500' />
            Review thay đổi từ AI
          </DialogTitle>
          <p className='text-xs text-neutral-500'>
            AI đã đề xuất{' '}
            <strong className='text-neutral-700'>{totalFields}</strong> thay đổi
            cho{' '}
            <strong className='text-neutral-700'>{diff.blocks.length}</strong>{' '}
            block từ sản phẩm{' '}
            <strong className='text-neutral-700'>{productName}</strong>. Tick
            vào nhóm bạn muốn áp dụng.
          </p>
        </DialogHeader>

        {/* Quick action bar — accept all / reject all / preset filters */}
        <div className='flex flex-wrap items-center gap-1.5 border-b border-neutral-100 px-6 pb-2'>
          <QuickBtn label='Accept tất cả' onClick={setAllAccept} primary />
          <QuickBtn label='Reject tất cả' onClick={setRejectAll} />
          <span className='mx-1 h-4 w-px bg-neutral-200' aria-hidden />
          <QuickBtn label='Chỉ Text' onClick={() => setOnlyGroups(['text'])} />
          <QuickBtn label='Chỉ Ảnh' onClick={() => setOnlyGroups(['image'])} />
          <QuickBtn label='Chỉ List' onClick={() => setOnlyGroups(['list'])} />
          <QuickBtn label='Chỉ CTA' onClick={() => setOnlyGroups(['cta'])} />
        </div>

        {/* Scrollable diff list */}
        <div className='min-h-0 flex-1 overflow-y-auto px-6 py-2'>
          {diff.blocks.length === 0 ? (
            <div className='flex flex-col items-center gap-2 py-12 text-center text-sm text-neutral-500'>
              <Layers className='size-8 text-neutral-300' />
              <span>AI không đề xuất thay đổi nào — canvas giữ nguyên.</span>
            </div>
          ) : (
            <ul className='flex flex-col gap-2'>
              {diff.blocks.map(b => (
                <BlockDiffRow
                  key={b.blockId}
                  block={b}
                  accepted={accept.get(b.blockId) ?? new Set()}
                  onToggleGroup={g => toggleGroup(b.blockId, g)}
                  onToggleBlock={() => toggleBlock(b)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className='flex shrink-0 items-center justify-between gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-3'>
          <span className='text-[11px] text-neutral-500'>
            Đã chọn{' '}
            <strong className='text-neutral-900'>
              {acceptedFields}/{totalFields}
            </strong>{' '}
            thay đổi · {acceptedGroupPairs} nhóm
          </span>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button
              type='button'
              variant='primary'
              size='sm'
              onClick={handleApply}
              disabled={acceptedFields === 0}
            >
              Apply {acceptedFields}/{totalFields}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Block accordion row ──────────────────────────────────────────────────

function BlockDiffRow({
  block,
  accepted,
  onToggleGroup,
  onToggleBlock,
}: {
  block: BlockDiff;
  accepted: Set<DiffGroup>;
  onToggleGroup: (group: DiffGroup) => void;
  onToggleBlock: () => void;
}) {
  const [open, setOpen] = React.useState(true);
  const totalGroups = block.groups.length;
  const acceptedCount = block.groups.filter(g => accepted.has(g.group)).length;
  const allOn = acceptedCount === totalGroups && totalGroups > 0;
  const someOn = acceptedCount > 0 && !allOn;

  return (
    <li className='border-border overflow-hidden rounded-md border bg-white'>
      {/* Block header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 transition-colors',
          allOn
            ? 'bg-emerald-50/60'
            : someOn
              ? 'bg-amber-50/40'
              : 'bg-neutral-50/40'
        )}
      >
        <button
          type='button'
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Thu gọn' : 'Mở rộng'}
          className='flex size-5 cursor-pointer items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700'
        >
          {open ? (
            <ChevronDown className='size-3.5' />
          ) : (
            <ChevronRight className='size-3.5' />
          )}
        </button>
        <Checkbox
          checked={allOn}
          indeterminate={someOn}
          onClick={onToggleBlock}
          aria-label={`Toggle ${block.blockName}`}
        />
        <div className='flex min-w-0 flex-1 flex-col'>
          <span className='truncate text-sm font-semibold text-neutral-900'>
            {block.blockName}
          </span>
          <span className='text-[10px] tracking-wider text-neutral-400 uppercase'>
            {block.blockType.replace('_', ' ')}
            {block.isNew && ' · MỚI'}
            {block.isRemoved && ' · BỊ XOÁ'}
          </span>
        </div>
        <span className='font-mono text-[10px] text-neutral-400'>
          {acceptedCount}/{totalGroups} nhóm
        </span>
      </div>

      {/* Groups */}
      {open && totalGroups > 0 && (
        <ul className='flex flex-col gap-2 border-t border-neutral-100 bg-white p-3'>
          {block.groups.map(g => (
            <GroupRow
              key={g.group}
              groupDiff={g}
              accepted={accepted.has(g.group)}
              onToggle={() => onToggleGroup(g.group)}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── Group accordion item ────────────────────────────────────────────────

function GroupRow({
  groupDiff,
  accepted,
  onToggle,
}: {
  groupDiff: { group: DiffGroup; fields: FieldDiff[] };
  accepted: boolean;
  onToggle: () => void;
}) {
  const Icon = GROUP_ICON[groupDiff.group];
  return (
    <li
      className={cn(
        'flex flex-col gap-1.5 rounded-md border bg-white px-2.5 py-2 transition-colors',
        accepted ? 'border-emerald-200 bg-emerald-50/40' : 'border-neutral-200'
      )}
    >
      <button
        type='button'
        onClick={onToggle}
        className='flex cursor-pointer items-center gap-2 text-left'
      >
        <Checkbox checked={accepted} onClick={onToggle} aria-label='Accept' />
        <Icon className='size-3.5 text-neutral-500' />
        <span className='text-xs font-semibold text-neutral-800'>
          {GROUP_LABEL[groupDiff.group]}
        </span>
        <span className='font-mono text-[10px] text-neutral-400'>
          {groupDiff.fields.length} field
        </span>
      </button>

      {/* Field-level diff */}
      <ul className='flex flex-col gap-1 pl-7'>
        {groupDiff.fields.map(f => (
          <FieldDiffRow key={f.key} field={f} group={groupDiff.group} />
        ))}
      </ul>
    </li>
  );
}

// ─── Field diff cell — old vs new ────────────────────────────────────────

function FieldDiffRow({
  field,
  group,
}: {
  field: FieldDiff;
  group: DiffGroup;
}) {
  const label = FIELD_LABEL[field.key] ?? field.key;
  return (
    <li className='flex flex-col gap-0.5'>
      <span className='text-[10px] font-semibold tracking-wider text-neutral-500 uppercase'>
        {label}
      </span>
      <div className='grid grid-cols-2 gap-2'>
        <ValueCell
          value={field.oldValue}
          group={group}
          tone='old'
          empty='(trống)'
        />
        <ValueCell
          value={field.newValue}
          group={group}
          tone='new'
          empty='(xoá)'
        />
      </div>
    </li>
  );
}

function ValueCell({
  value,
  group,
  tone,
  empty,
}: {
  value: unknown;
  group: DiffGroup;
  tone: 'old' | 'new';
  empty: string;
}) {
  const baseClass = cn(
    'min-h-7 rounded-sm border px-2 py-1 text-[11px]',
    tone === 'old'
      ? 'border-rose-200/60 bg-rose-50/30 text-rose-900'
      : 'border-emerald-200/60 bg-emerald-50/30 text-emerald-900'
  );

  if (value === undefined || value === null || value === '') {
    return (
      <div className={cn(baseClass, 'text-neutral-400 italic')}>{empty}</div>
    );
  }

  // Image: show thumbnail if value is a URL (string starting with http).
  if (
    group === 'image' &&
    typeof value === 'string' &&
    /^https?:/.test(value)
  ) {
    return (
      <div className={cn(baseClass, 'flex items-center gap-1.5 p-1')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt=''
          className='size-12 shrink-0 rounded-sm object-cover'
        />
        <span className='truncate font-mono text-[10px]'>
          {value.replace(/^https?:\/\//, '').slice(0, 40)}…
        </span>
      </div>
    );
  }

  // List: render as compact JSON preview.
  if (Array.isArray(value)) {
    return (
      <div className={baseClass}>
        <span className='font-medium'>{value.length} mục:</span>{' '}
        <span className='text-neutral-600'>
          {value
            .slice(0, 3)
            .map(v =>
              typeof v === 'object' && v !== null
                ? (Object.values(v as Record<string, unknown>)[0] ?? '…')
                : String(v)
            )
            .join(', ')}
          {value.length > 3 && '…'}
        </span>
      </div>
    );
  }

  return <div className={baseClass}>{String(value)}</div>;
}

// ─── Quick action button ─────────────────────────────────────────────────

function QuickBtn({
  label,
  onClick,
  primary,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'inline-flex h-7 cursor-pointer items-center rounded-md border px-2.5 text-[11px] font-medium transition-colors',
        primary
          ? 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
          : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900'
      )}
    >
      {label}
    </button>
  );
}

// ─── Tristate checkbox (simple) ───────────────────────────────────────────

function Checkbox({
  checked,
  indeterminate,
  onClick,
  ...props
}: {
  checked: boolean;
  indeterminate?: boolean;
  onClick: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type='button'
      role='checkbox'
      aria-checked={indeterminate ? 'mixed' : checked}
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'flex size-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors',
        checked || indeterminate
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-neutral-300 bg-white hover:border-neutral-500'
      )}
      {...props}
    >
      {indeterminate ? (
        <CircleDot className='size-2.5' />
      ) : checked ? (
        <svg viewBox='0 0 12 12' className='size-3' fill='none'>
          <path
            d='M2 6L5 9L10 3'
            stroke='currentColor'
            strokeWidth='1.6'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      ) : null}
    </button>
  );
}
