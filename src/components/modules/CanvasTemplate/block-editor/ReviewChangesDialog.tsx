'use client';

import * as React from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Image as ImageIcon,
  Layers,
  ListChecks,
  MousePointerClick,
  RotateCcw,
  Sparkles,
  Type,
  X,
} from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '@/components/atoms/dialog';
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

// Tally fields per group across the entire canvas — drives the stat chips
// in the header so the user sees at a glance "12 text · 4 ảnh · 2 list · 3 cta".
function tallyByGroup(diff: CanvasDiff): Record<DiffGroup, number> {
  const out: Record<DiffGroup, number> = { text: 0, image: 0, list: 0, cta: 0 };
  for (const b of diff.blocks) {
    for (const g of b.groups) {
      out[g.group] += g.fields.length;
    }
  }
  return out;
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
  const tally = tallyByGroup(diff);
  const progressPct =
    totalFields === 0 ? 0 : Math.round((acceptedFields / totalFields) * 100);

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
      <DialogContent
        showCloseButton={false}
        className='flex max-h-[88vh] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl'
      >
        {/* ─── Hero header ─────────────────────────────────────────────── */}
        <div className='relative shrink-0 overflow-hidden border-b border-stone-200 bg-stone-50'>
          {/* Subtle dotted texture for atmosphere — never overpowering. */}
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 opacity-[0.04]'
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '14px 14px',
            }}
          />

          <div className='relative px-8 pt-7 pb-5'>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
                {/* Eyebrow with AI badge — refined, no purple gradient. */}
                <div className='flex items-center gap-2'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-amber-800 uppercase ring-1 ring-amber-200/80'>
                    <Sparkles className='size-3' />
                    Curated by AI
                  </span>
                  <span className='text-[10px] tracking-widest text-stone-400 uppercase'>
                    Review · {progressPct}% accepted
                  </span>
                </div>

                {/* Display heading — serif, editorial. */}
                <DialogTitle asChild>
                  <h2 className='font-serif text-[28px] leading-[1.15] tracking-tight text-neutral-900'>
                    <span className='font-mono text-[18px] tracking-[-0.04em] text-stone-400'>
                      {totalFields}
                    </span>{' '}
                    thay đổi từ{' '}
                    <span className='text-neutral-700 italic'>
                      “{productName}”
                    </span>
                  </h2>
                </DialogTitle>
                <p className='max-w-2xl text-sm leading-relaxed text-stone-500'>
                  AI đã đề xuất nội dung mới cho{' '}
                  <strong className='font-semibold text-neutral-700'>
                    {diff.blocks.length} block
                  </strong>
                  . Bấm{' '}
                  <em className='text-emerald-700 not-italic'>
                    Áp dụng tất cả
                  </em>{' '}
                  nếu hài lòng, hoặc tinh chỉnh từng phần bên dưới.
                </p>
              </div>

              <button
                type='button'
                onClick={() => onOpenChange(false)}
                aria-label='Đóng'
                className='-mt-1 -mr-2 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-neutral-900'
              >
                <X className='size-4' />
              </button>
            </div>

            {/* Stat chips row — at-a-glance breakdown of change types. */}
            <ul className='mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4'>
              <StatChip
                icon={Type}
                label='Text'
                count={tally.text}
                tone='neutral'
              />
              <StatChip
                icon={ImageIcon}
                label='Ảnh'
                count={tally.image}
                tone='violet'
              />
              <StatChip
                icon={ListChecks}
                label='Danh sách'
                count={tally.list}
                tone='sky'
              />
              <StatChip
                icon={MousePointerClick}
                label='CTA'
                count={tally.cta}
                tone='amber'
              />
            </ul>
          </div>
        </div>

        {/* ─── Decision bar ─────────────────────────────────────────────── */}
        <div className='shrink-0 border-b border-stone-200 bg-white px-8 py-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <button
              type='button'
              onClick={setAllAccept}
              className={cn(
                'group inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs font-semibold tracking-tight transition-all duration-150',
                'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md active:translate-y-[0.5px]'
              )}
            >
              <CheckCircle2 className='size-3.5' />
              Áp dụng tất cả
            </button>
            <button
              type='button'
              onClick={setRejectAll}
              className='inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-neutral-900'
            >
              <RotateCcw className='size-3.5' />
              Giữ nguyên
            </button>

            <span className='mx-2 h-5 w-px bg-stone-200' aria-hidden />

            <span className='text-[10px] font-semibold tracking-widest text-stone-400 uppercase'>
              Lọc
            </span>
            <FilterPill
              icon={Type}
              label='Text'
              count={tally.text}
              onClick={() => setOnlyGroups(['text'])}
            />
            <FilterPill
              icon={ImageIcon}
              label='Ảnh'
              count={tally.image}
              onClick={() => setOnlyGroups(['image'])}
            />
            <FilterPill
              icon={ListChecks}
              label='List'
              count={tally.list}
              onClick={() => setOnlyGroups(['list'])}
            />
            <FilterPill
              icon={MousePointerClick}
              label='CTA'
              count={tally.cta}
              onClick={() => setOnlyGroups(['cta'])}
            />
          </div>
        </div>

        {/* ─── Diff list — scrollable, editorial chapter style ─────────── */}
        <div className='min-h-0 flex-1 overflow-y-auto bg-stone-50/40'>
          {diff.blocks.length === 0 ? (
            <EmptyDiff />
          ) : (
            <ol className='divide-y divide-stone-200'>
              {diff.blocks.map((b, idx) => (
                <BlockSection
                  key={b.blockId}
                  index={idx + 1}
                  total={diff.blocks.length}
                  block={b}
                  accepted={accept.get(b.blockId) ?? new Set()}
                  onToggleGroup={g => toggleGroup(b.blockId, g)}
                  onToggleBlock={() => toggleBlock(b)}
                />
              ))}
            </ol>
          )}
        </div>

        {/* ─── Sticky footer with progress bar + apply CTA ─────────────── */}
        <div className='shrink-0 border-t border-stone-200 bg-white'>
          {/* Progress bar — full-width hairline so user sees their decision. */}
          <div className='relative h-1 w-full bg-stone-100'>
            <div
              className='absolute inset-y-0 left-0 bg-emerald-500 transition-[width] duration-300 ease-out'
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3 px-8 py-3.5'>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 items-center gap-1.5 rounded-full bg-stone-100 px-3 font-mono text-xs tracking-tight text-neutral-700'>
                <span className='font-bold text-neutral-900'>
                  {acceptedFields}
                </span>
                <span className='text-stone-400'>/</span>
                <span className='text-stone-500'>{totalFields}</span>
              </div>
              <span className='text-xs text-stone-500'>
                {acceptedGroupPairs} nhóm trên {diff.blocks.length} block
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => onOpenChange(false)}
                className='inline-flex h-9 cursor-pointer items-center rounded-full px-4 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-neutral-900'
              >
                Huỷ
              </button>
              <button
                type='button'
                onClick={handleApply}
                disabled={acceptedFields === 0}
                className={cn(
                  'group inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-4 text-xs font-semibold tracking-tight transition-all duration-150',
                  acceptedFields === 0
                    ? 'cursor-not-allowed bg-stone-200 text-stone-400'
                    : 'bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 hover:shadow-md active:translate-y-[0.5px]'
                )}
              >
                Áp dụng {acceptedFields} thay đổi
                <ArrowRight className='size-3.5 transition-transform group-hover:translate-x-0.5' />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Stat chip (header) ───────────────────────────────────────────────────

function StatChip({
  icon: Icon,
  label,
  count,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  tone: 'neutral' | 'violet' | 'sky' | 'amber';
}) {
  const isEmpty = count === 0;
  // Tone determines the icon ring + counter color. Empty groups are muted.
  const toneClass = isEmpty
    ? 'text-stone-400 ring-stone-200 bg-stone-50/60'
    : {
        neutral: 'text-neutral-800 ring-neutral-200 bg-white',
        violet: 'text-violet-700 ring-violet-200 bg-white',
        sky: 'text-sky-700 ring-sky-200 bg-white',
        amber: 'text-amber-700 ring-amber-200 bg-white',
      }[tone];

  return (
    <li
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 ring-1 transition-colors',
        toneClass
      )}
    >
      <Icon className='size-4 shrink-0' />
      <div className='flex min-w-0 flex-1 items-baseline gap-1.5'>
        <span className='font-mono text-base leading-none font-bold tracking-tight'>
          {count}
        </span>
        <span className='truncate text-[11px] tracking-wide text-stone-500 uppercase'>
          {label}
        </span>
      </div>
    </li>
  );
}

// ─── Filter pill (decision bar) ──────────────────────────────────────────

function FilterPill({
  icon: Icon,
  label,
  count,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  onClick: () => void;
}) {
  const disabled = count === 0;
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-colors',
        disabled
          ? 'cursor-not-allowed border-stone-100 bg-stone-50 text-stone-300'
          : 'border-stone-200 bg-white text-stone-600 hover:border-neutral-400 hover:text-neutral-900'
      )}
    >
      <Icon className='size-3' />
      {label}
      <span className='font-mono text-[10px] text-stone-400'>{count}</span>
    </button>
  );
}

// ─── Block chapter section ───────────────────────────────────────────────

function BlockSection({
  index,
  total,
  block,
  accepted,
  onToggleGroup,
  onToggleBlock,
}: {
  index: number;
  total: number;
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
    <li
      className='relative px-8 py-6 transition-colors hover:bg-white'
      data-state={allOn ? 'all' : someOn ? 'some' : 'none'}
    >
      {/* Chapter header — number marker + block name in serif */}
      <div className='flex items-start gap-5'>
        {/* Numbered marker — editorial magazine style. */}
        <div className='flex shrink-0 flex-col items-center pt-1'>
          <span
            className={cn(
              'font-serif text-3xl leading-none tabular-nums',
              allOn
                ? 'text-emerald-600'
                : someOn
                  ? 'text-amber-600'
                  : 'text-stone-300'
            )}
          >
            {String(index).padStart(2, '0')}
          </span>
          <span className='mt-1 font-mono text-[9px] tracking-widest text-stone-400 uppercase'>
            / {String(total).padStart(2, '0')}
          </span>
        </div>

        {/* Block info + master toggle */}
        <div className='flex min-w-0 flex-1 flex-col gap-3'>
          <div className='flex flex-wrap items-center gap-3'>
            <button
              type='button'
              onClick={() => setOpen(o => !o)}
              className='group flex flex-1 cursor-pointer items-center gap-2 text-left'
            >
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 text-stone-400 transition-transform group-hover:text-neutral-900',
                  !open && '-rotate-90'
                )}
              />
              <h3 className='font-serif text-xl leading-tight tracking-tight text-neutral-900'>
                {block.blockName}
              </h3>
              <span className='inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 font-mono text-[9px] tracking-widest text-stone-500 uppercase'>
                {block.blockType.replace('_', ' ')}
              </span>
              {block.isNew && (
                <span className='inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[9px] tracking-widest text-emerald-700 uppercase ring-1 ring-emerald-200/60'>
                  + Mới
                </span>
              )}
              {block.isRemoved && (
                <span className='inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 font-mono text-[9px] tracking-widest text-rose-700 uppercase ring-1 ring-rose-200/60'>
                  − Bị xoá
                </span>
              )}
            </button>

            {totalGroups > 0 && (
              <div className='flex items-center gap-2'>
                <span className='font-mono text-[10px] tracking-tight text-stone-500'>
                  {acceptedCount}/{totalGroups}
                </span>
                <Switch
                  checked={allOn}
                  indeterminate={someOn}
                  onClick={onToggleBlock}
                  ariaLabel={`Toggle ${block.blockName}`}
                />
              </div>
            )}
          </div>

          {/* Groups (collapsible) */}
          {open && totalGroups > 0 && (
            <div className='flex flex-col gap-2.5'>
              {block.groups.map(g => (
                <GroupCard
                  key={g.group}
                  groupDiff={g}
                  accepted={accepted.has(g.group)}
                  onToggle={() => onToggleGroup(g.group)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

// ─── Group card (one of: Text / Ảnh / List / CTA) ────────────────────────

function GroupCard({
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
    <section
      className={cn(
        'overflow-hidden rounded-xl border bg-white transition-all duration-200',
        accepted
          ? 'border-emerald-200/80 shadow-[0_1px_0_0_rgba(16,185,129,0.08)]'
          : 'border-stone-200'
      )}
    >
      {/* Group header — icon + label + field count + switch */}
      <header
        className={cn(
          'flex items-center gap-3 border-b px-4 py-2.5 transition-colors',
          accepted
            ? 'border-emerald-100/60 bg-emerald-50/30'
            : 'border-stone-100 bg-stone-50/40'
        )}
      >
        <div
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-md transition-colors',
            accepted
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-stone-500 ring-1 ring-stone-200'
          )}
        >
          <Icon className='size-3.5' />
        </div>
        <div className='flex min-w-0 flex-1 items-baseline gap-2'>
          <span className='text-sm font-semibold tracking-tight text-neutral-900'>
            {GROUP_LABEL[groupDiff.group]}
          </span>
          <span className='font-mono text-[10px] tracking-tight text-stone-400'>
            · {groupDiff.fields.length} field
          </span>
        </div>
        <Switch
          checked={accepted}
          onClick={onToggle}
          ariaLabel={`Toggle ${GROUP_LABEL[groupDiff.group]}`}
        />
      </header>

      {/* Field rows — render style depends on group kind */}
      <ul className='flex flex-col divide-y divide-stone-100'>
        {groupDiff.fields.map(f => (
          <FieldRow key={f.key} field={f} group={groupDiff.group} />
        ))}
      </ul>
    </section>
  );
}

// ─── Field row — branches by group for premium visual diff ───────────────

function FieldRow({ field, group }: { field: FieldDiff; group: DiffGroup }) {
  const label = FIELD_LABEL[field.key] ?? field.key;

  if (group === 'image') {
    return (
      <li className='px-4 py-4'>
        <div className='mb-2 flex items-center gap-2'>
          <span className='font-mono text-[10px] tracking-widest text-stone-400 uppercase'>
            {label}
          </span>
        </div>
        <div className='grid grid-cols-2 gap-3 sm:gap-4'>
          <ImageDiffCard value={field.oldValue} side='old' />
          <ImageDiffCard value={field.newValue} side='new' />
        </div>
      </li>
    );
  }

  if (group === 'list') {
    return (
      <li className='px-4 py-3'>
        <div className='mb-1.5 flex items-center gap-2'>
          <span className='font-mono text-[10px] tracking-widest text-stone-400 uppercase'>
            {label}
          </span>
        </div>
        <div className='flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center'>
          <ListPreview value={field.oldValue} side='old' />
          <ArrowRight
            className='hidden size-3.5 shrink-0 self-center text-stone-300 sm:block'
            aria-hidden
          />
          <ListPreview value={field.newValue} side='new' />
        </div>
      </li>
    );
  }

  // Text + cta groups — side-by-side typographic diff.
  return (
    <li className='px-4 py-3'>
      <div className='mb-1.5 flex items-center gap-2'>
        <span className='font-mono text-[10px] tracking-widest text-stone-400 uppercase'>
          {label}
        </span>
      </div>
      <div className='flex flex-col gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center'>
        <TextValue value={field.oldValue} side='old' />
        <ArrowRight
          className='hidden size-3.5 shrink-0 self-center text-stone-300 sm:block'
          aria-hidden
        />
        <TextValue value={field.newValue} side='new' />
      </div>
    </li>
  );
}

// ─── Image diff card — premium side-by-side preview ──────────────────────

function ImageDiffCard({
  value,
  side,
}: {
  value: unknown;
  side: 'old' | 'new';
}) {
  const isUrl = typeof value === 'string' && /^https?:/.test(value);
  const labelText = side === 'old' ? 'Đang dùng' : 'Đề xuất';
  const tone = side === 'old' ? 'rose' : 'emerald';

  return (
    <figure
      className={cn(
        'group relative overflow-hidden rounded-lg ring-1 transition-all duration-200',
        'hover:-translate-y-0.5',
        side === 'old'
          ? 'bg-rose-50/30 ring-rose-200/50 hover:shadow-md hover:ring-rose-300/70'
          : 'bg-emerald-50/30 ring-emerald-200/50 hover:shadow-lg hover:ring-emerald-300/70'
      )}
    >
      {/* Corner label — small caps */}
      <span
        className={cn(
          'absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase shadow-sm backdrop-blur',
          tone === 'rose'
            ? 'bg-rose-50/90 text-rose-700 ring-1 ring-rose-200/70'
            : 'bg-emerald-50/90 text-emerald-700 ring-1 ring-emerald-200/70'
        )}
      >
        {side === 'new' && <Sparkles className='size-2.5' />}
        {labelText}
      </span>

      {/* Image area — square aspect for visual parity */}
      <div className='relative aspect-square w-full overflow-hidden bg-stone-100'>
        {isUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value as string}
            alt={labelText}
            className='size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]'
            draggable={false}
          />
        ) : (
          <div className='flex size-full items-center justify-center text-stone-300'>
            <ImageIcon className='size-8' />
          </div>
        )}

        {/* Bottom gradient + filename — only when URL */}
        {isUrl && (
          <div className='pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2'>
            <p className='truncate font-mono text-[9px] text-white/90'>
              {(value as string)
                .replace(/^https?:\/\//, '')
                .split('?')[0]
                .slice(0, 50)}
            </p>
          </div>
        )}

        {!isUrl && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='text-[10px] font-medium text-stone-400 italic'>
              {value === undefined || value === null || value === ''
                ? side === 'old'
                  ? '(không có ảnh)'
                  : '(xoá ảnh)'
                : 'Không phải URL'}
            </span>
          </div>
        )}
      </div>
    </figure>
  );
}

// ─── Text value cell — typographic diff ──────────────────────────────────

function TextValue({ value, side }: { value: unknown; side: 'old' | 'new' }) {
  const empty = value === undefined || value === null || value === '';
  const text = empty ? (side === 'old' ? '(trống)' : '(xoá)') : String(value);

  return (
    <div
      className={cn(
        'relative rounded-lg border px-3 py-2 transition-colors',
        side === 'old'
          ? empty
            ? 'border-stone-200 bg-stone-50/40 text-stone-400 italic'
            : 'border-rose-200/40 bg-rose-50/30 text-rose-900/80'
          : empty
            ? 'border-stone-200 bg-stone-50/40 text-stone-400 italic'
            : 'border-emerald-200/60 bg-white text-neutral-900'
      )}
    >
      {/* Side label — tiny corner badge */}
      <span
        className={cn(
          'absolute -top-2 left-2 px-1.5 font-mono text-[8px] font-bold tracking-widest uppercase',
          side === 'old'
            ? 'bg-stone-50/40 text-rose-500'
            : 'bg-stone-50/40 text-emerald-600'
        )}
      >
        {side === 'old' ? 'Đang dùng' : 'Đề xuất'}
      </span>
      <p
        className={cn(
          'pt-0.5 text-sm leading-relaxed',
          side === 'old' && !empty && 'line-through decoration-rose-400/50'
        )}
      >
        {text}
      </p>
    </div>
  );
}

// ─── List preview — chip row showing first 3 items + count ───────────────

function ListPreview({ value, side }: { value: unknown; side: 'old' | 'new' }) {
  const empty = !Array.isArray(value) || value.length === 0;
  const items = Array.isArray(value) ? value : [];
  const previews = items.slice(0, 4).map(v => {
    if (typeof v === 'string') return v;
    if (typeof v === 'object' && v !== null) {
      const vals = Object.values(v as Record<string, unknown>);
      const first = vals.find(x => typeof x === 'string' && x);
      return (first as string | undefined) ?? '…';
    }
    return String(v);
  });

  return (
    <div
      className={cn(
        'relative rounded-lg border px-3 py-2 transition-colors',
        side === 'old'
          ? 'border-rose-200/40 bg-rose-50/30'
          : 'border-emerald-200/60 bg-white'
      )}
    >
      <span
        className={cn(
          'absolute -top-2 left-2 px-1.5 font-mono text-[8px] font-bold tracking-widest uppercase',
          side === 'old'
            ? 'bg-stone-50/40 text-rose-500'
            : 'bg-stone-50/40 text-emerald-600'
        )}
      >
        {side === 'old' ? 'Đang dùng' : 'Đề xuất'}
      </span>
      {empty ? (
        <p className='pt-0.5 text-sm text-stone-400 italic'>
          {side === 'old' ? '(trống)' : '(xoá)'}
        </p>
      ) : (
        <div className='flex flex-col gap-1.5 pt-0.5'>
          <span
            className={cn(
              'font-mono text-[10px] font-bold',
              side === 'old' ? 'text-rose-700/70' : 'text-emerald-700'
            )}
          >
            {items.length} mục
          </span>
          <div className='flex flex-wrap gap-1'>
            {previews.map((p, i) => (
              <span
                key={i}
                className={cn(
                  'inline-flex max-w-[180px] items-center rounded-full px-2 py-0.5 text-[10px]',
                  side === 'old'
                    ? 'bg-white/70 text-rose-900/80 line-through decoration-rose-400/40'
                    : 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100'
                )}
              >
                <span className='truncate'>{p}</span>
              </span>
            ))}
            {items.length > 4 && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[9px]',
                  side === 'old' ? 'text-rose-500/70' : 'text-emerald-700'
                )}
              >
                +{items.length - 4} khác
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Switch — refined toggle (replaces checkbox) ─────────────────────────

function Switch({
  checked,
  indeterminate,
  onClick,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type='button'
      role='switch'
      aria-label={ariaLabel}
      aria-checked={indeterminate ? 'mixed' : checked}
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
        checked
          ? 'bg-emerald-600 hover:bg-emerald-700'
          : indeterminate
            ? 'bg-amber-500 hover:bg-amber-600'
            : 'bg-stone-300 hover:bg-stone-400'
      )}
    >
      <span
        className={cn(
          'inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out',
          checked
            ? 'translate-x-[18px]'
            : indeterminate
              ? 'translate-x-[9px]'
              : 'translate-x-[2px]'
        )}
      >
        {checked && (
          <Check
            className='absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 text-emerald-600'
            strokeWidth={3}
          />
        )}
      </span>
    </button>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────

function EmptyDiff() {
  return (
    <div className='flex flex-col items-center justify-center gap-3 py-20 text-center'>
      <div className='flex size-14 items-center justify-center rounded-full bg-stone-100 text-stone-400'>
        <Layers className='size-6' />
      </div>
      <p className='max-w-sm font-serif text-lg leading-snug text-neutral-700'>
        AI không tìm thấy điều gì để cải thiện
      </p>
      <p className='text-sm text-stone-500'>
        Canvas hiện tại đã khớp tốt với sản phẩm — không có thay đổi nào để áp
        dụng.
      </p>
    </div>
  );
}
