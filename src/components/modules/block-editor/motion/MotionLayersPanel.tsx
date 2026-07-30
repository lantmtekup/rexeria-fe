'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clapperboard,
  GripVertical,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import { elementsForType, type LayerElement } from '../LayersPanel';
import type { Block, Device } from '../types';

import { emptyMotion } from './timeline/utils';
import {
  applyPreset,
  DEFAULT_PRESET_DELAY_MS,
  DEFAULT_PRESET_DURATION_MS,
  detectPreset,
  PRESETS,
  presetLabel,
  type MotionPresetId,
} from './presets';
import type { BlockMotion, MotionTrigger } from './types';

interface MotionLayersPanelProps {
  block: Block;
  device: Device;
  motion: BlockMotion | undefined;
  onChange: (next: BlockMotion | null) => void;
  onOpenAdvanced: () => void;
  onPlayPreview?: () => void;
  /**
   * Audition just one element's animation on the canvas. Called when the
   * user picks a preset / tweaks delay-duration — lets them SEE what each
   * choice looks like before committing.
   */
  onPlayElementPreview?: (elementKey: string) => void;
  isPreviewing?: boolean;
}

const TRIGGERS: { value: MotionTrigger; label: string }[] = [
  { value: 'in-view', label: 'Khi vào view' },
  { value: 'load', label: 'Khi load' },
  { value: 'scroll-progress', label: 'Theo scroll' },
];

function useAnimatableElements(block: Block): LayerElement[] {
  return React.useMemo(() => {
    const content = block.contentVi?.desktop as
      Record<string, unknown> | undefined;
    const base = elementsForType(block.blockType, content);
    return base.filter(el => !el.key.startsWith('__'));
  }, [block.blockType, block.contentVi]);
}

export function MotionLayersPanel({
  block,
  motion,
  onChange,
  onOpenAdvanced,
  onPlayPreview,
  onPlayElementPreview,
  isPreviewing = false,
}: MotionLayersPanelProps) {
  const elements = useAnimatableElements(block);
  const current = motion ?? emptyMotion();

  const rowsByKey = React.useMemo(() => {
    const map = new Map<
      string,
      | {
          kind: 'preset';
          presetId: MotionPresetId;
          delay: number;
          duration: number;
        }
      | { kind: 'custom' }
    >();
    for (const track of current.tracks) {
      map.set(track.elementKey, detectPreset(track));
    }
    return map;
  }, [current.tracks]);

  // Which rows are expanded. Default: collapsed. We keep this local to the
  // component (not in BlockMotion) — it's pure UI state, not part of the
  // saved animation.
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());

  // Reset expansion when switching to a different block.
  React.useEffect(() => {
    setExpanded(new Set());
  }, [block.id]);

  const toggleRow = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allExpanded =
    elements.length > 0 && elements.every(el => expanded.has(el.key));
  const toggleAll = () => {
    setExpanded(allExpanded ? new Set() : new Set(elements.map(e => e.key)));
  };

  const patch = React.useCallback(
    (next: BlockMotion) => {
      const isEmpty = next.tracks.length === 0;
      onChange(isEmpty ? null : next);
    },
    [onChange]
  );

  const updatePreset = (
    elementKey: string,
    presetId: MotionPresetId,
    delay: number,
    duration: number
  ) => {
    patch(applyPreset(current, elementKey, presetId, delay, duration));
    // Auto-expand the row the user just edited so they see the delay/duration
    // they just affected. Otherwise the change feels invisible on a collapsed
    // row.
    setExpanded(prev => new Set(prev).add(elementKey));
    // Audition the change on the canvas — select + play that element's
    // animation in isolation so the user can see what each preset looks like.
    // We skip 'none' because there's nothing to audition.
    if (presetId !== 'none') {
      onPlayElementPreview?.(elementKey);
    }
  };

  const applyStaggerAll = (presetId: MotionPresetId, stagger = 100) => {
    let next = current;
    elements.forEach((el, i) => {
      next = applyPreset(
        next,
        el.key,
        presetId,
        i * stagger,
        DEFAULT_PRESET_DURATION_MS
      );
    });
    patch(next);
  };

  const hasCustomTrack = Array.from(rowsByKey.values()).some(
    r => r.kind === 'custom'
  );
  const enabled = current.enabled !== false;

  return (
    <div className='flex h-full flex-col'>
      {/* ── Block-level controls ───────────────────────────────────────── */}
      <div className='space-y-3 border-b border-neutral-200 bg-white px-4 py-4'>
        <label className='flex cursor-pointer items-center gap-2.5 text-sm font-medium tracking-tight text-neutral-900'>
          <input
            type='checkbox'
            checked={enabled}
            onChange={e => patch({ ...current, enabled: e.target.checked })}
            className='size-3.5 cursor-pointer accent-neutral-900'
          />
          Bật animation cho block
        </label>

        <Field label='Trigger'>
          <select
            value={current.trigger ?? 'in-view'}
            onChange={e =>
              patch({ ...current, trigger: e.target.value as MotionTrigger })
            }
            className='h-8 w-full cursor-pointer rounded-md border border-neutral-200 bg-white px-2.5 text-xs tracking-tight text-neutral-800 focus:border-neutral-400 focus:outline-none'
          >
            {TRIGGERS.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        {onPlayPreview && (
          <button
            type='button'
            onClick={onPlayPreview}
            data-testid='sidebar-play-motion-preview'
            aria-pressed={isPreviewing}
            className={cn(
              'flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold tracking-tight transition-colors',
              isPreviewing
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'bg-neutral-900 text-white hover:bg-neutral-700'
            )}
          >
            {isPreviewing ? (
              <Pause className='size-3.5' />
            ) : (
              <Play className='size-3.5' />
            )}
            {isPreviewing ? 'Đang phát…' : 'Phát preview'}
          </button>
        )}

        <div className='grid grid-cols-2 gap-2'>
          <button
            type='button'
            onClick={() => applyStaggerAll('fade-up', 100)}
            className='flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2 text-xs font-medium tracking-tight text-neutral-700 transition-colors hover:bg-neutral-100'
          >
            <Sparkles className='size-3.5' />
            Stagger all
          </button>
          <button
            type='button'
            onClick={onOpenAdvanced}
            data-testid='sidebar-open-motion-editor'
            className='flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium tracking-tight text-neutral-700 transition-colors hover:bg-neutral-50'
          >
            <Clapperboard className='size-3.5' />
            Timeline
          </button>
        </div>
      </div>

      {/* ── Section header: element group toggle ──────────────────────── */}
      {elements.length > 0 && (
        <div className='flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4 py-2'>
          <span className='text-2xs font-medium tracking-wide text-neutral-500'>
            Element ({elements.length})
          </span>
          <button
            type='button'
            onClick={toggleAll}
            data-testid='motion-toggle-all'
            className='text-2xs cursor-pointer font-medium tracking-tight text-neutral-500 hover:text-neutral-900'
          >
            {allExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
          </button>
        </div>
      )}

      {/* ── Per-element rows ───────────────────────────────────────────── */}
      <div className='flex-1 overflow-y-auto'>
        {elements.length === 0 ? (
          <div className='px-4 py-6 text-center text-xs text-neutral-400'>
            Block này chưa hỗ trợ motion theo element.
          </div>
        ) : (
          <ul className='divide-y divide-neutral-100'>
            {elements.map(el => {
              const row = rowsByKey.get(el.key);
              const presetId: MotionPresetId =
                row?.kind === 'preset' ? row.presetId : 'none';
              const delay =
                row?.kind === 'preset' ? row.delay : DEFAULT_PRESET_DELAY_MS;
              const duration =
                row?.kind === 'preset'
                  ? row.duration
                  : DEFAULT_PRESET_DURATION_MS;
              const isCustom = row?.kind === 'custom';
              const isOpen = expanded.has(el.key);
              const Icon = el.icon;

              return (
                <li
                  key={el.key}
                  className='bg-white'
                  data-testid={`motion-row-${el.key}`}
                  data-expanded={isOpen ? 'true' : 'false'}
                >
                  {/* Row header — always visible, click to toggle */}
                  <button
                    type='button'
                    onClick={() => toggleRow(el.key)}
                    data-testid={`motion-toggle-row-${el.key}`}
                    className='flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-neutral-50'
                  >
                    {isOpen ? (
                      <ChevronDown className='size-3.5 shrink-0 text-neutral-400' />
                    ) : (
                      <ChevronRight className='size-3.5 shrink-0 text-neutral-400' />
                    )}
                    <GripVertical className='size-3 shrink-0 text-neutral-300' />
                    <Icon className='size-4 shrink-0 text-neutral-500' />
                    <span className='truncate text-sm font-medium tracking-tight text-neutral-900'>
                      {el.label}
                    </span>
                    <span
                      className={cn(
                        'text-2xs ml-auto shrink-0 truncate tabular-nums',
                        isCustom
                          ? 'text-3xs rounded bg-amber-100 px-1.5 py-0.5 font-medium tracking-wide text-amber-700 uppercase'
                          : presetId === 'none'
                            ? 'text-neutral-400'
                            : 'text-neutral-500'
                      )}
                    >
                      {isCustom
                        ? 'Custom'
                        : presetId === 'none'
                          ? '—'
                          : `${presetLabel(presetId)} · ${delay}+${duration}ms`}
                    </span>
                  </button>

                  {/* Row body */}
                  {isOpen && (
                    <div className='px-4 pt-1 pb-3'>
                      {isCustom ? (
                        <p className='text-xs leading-relaxed text-neutral-500'>
                          Track này được chỉnh tay bằng timeline. Mở advanced
                          timeline để sửa.
                        </p>
                      ) : (
                        <div className='space-y-2.5'>
                          <Field label='Animate'>
                            <select
                              value={presetId}
                              onChange={e =>
                                updatePreset(
                                  el.key,
                                  e.target.value as MotionPresetId,
                                  delay,
                                  duration
                                )
                              }
                              data-testid={`motion-preset-${el.key}`}
                              className='h-8 w-full cursor-pointer rounded-md border border-neutral-200 bg-white px-2.5 text-xs tracking-tight text-neutral-800 focus:border-neutral-400 focus:outline-none'
                            >
                              {PRESETS.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.label}
                                </option>
                              ))}
                            </select>
                          </Field>

                          {presetId !== 'none' && (
                            <div className='grid grid-cols-2 gap-2'>
                              <Field label='Delay'>
                                <NumberInput
                                  value={delay}
                                  onCommit={v =>
                                    updatePreset(el.key, presetId, v, duration)
                                  }
                                />
                              </Field>
                              <Field label='Duration'>
                                <NumberInput
                                  value={duration}
                                  min={50}
                                  onCommit={v =>
                                    updatePreset(el.key, presetId, delay, v)
                                  }
                                />
                              </Field>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Footer: status line (FAB at bottom-right; keep generous padding) */}
      <div className='border-t border-neutral-200 bg-neutral-50 px-4 py-2 pb-20'>
        <p className='text-2xs text-center tracking-tight text-neutral-400'>
          {current.tracks.length} element đang animate
          {hasCustomTrack && ' · có track custom'}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className='flex flex-col gap-1'>
      <span className='text-3xs font-medium tracking-wide text-neutral-400 uppercase'>
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  min = 0,
  step = 50,
  onCommit,
}: {
  value: number;
  min?: number;
  step?: number;
  onCommit: (v: number) => void;
}) {
  const [local, setLocal] = React.useState(String(value));
  React.useEffect(() => {
    setLocal(String(value));
  }, [value]);
  return (
    <div className='flex h-8 items-center rounded-md border border-neutral-200 bg-white pr-2 focus-within:border-neutral-400'>
      <input
        type='number'
        min={min}
        step={step}
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => {
          const n = Number(local);
          if (Number.isFinite(n)) onCommit(Math.max(min, Math.round(n)));
          else setLocal(String(value));
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
        }}
        className='h-full flex-1 bg-transparent px-2.5 text-xs text-neutral-800 tabular-nums focus:outline-none'
      />
      <span className='text-3xs font-medium tracking-wide text-neutral-400'>
        ms
      </span>
    </div>
  );
}
