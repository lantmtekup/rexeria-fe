'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Play, Sparkles, X } from 'lucide-react';

import { cn } from '@/lib/cn';

import { motionRegistry } from '../registry';
import type {
  MotionCascade,
  MotionConfig,
  MotionIntensity,
  MotionPreset,
  MotionSpeed,
} from '../types';

import { KnobRow } from './KnobRow';
import { MotionPresetCard } from './MotionPresetCard';
import type { BlockType } from '../../types';

interface MotionPopoverProps {
  blockType: BlockType;
  config: MotionConfig | null;
  onChange: (next: MotionConfig | null) => void;
  onPreview?: () => void;
  /** Optional anchor — render as Popover.Content when absent, inline when present. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
}

const SPEED_OPTS: { value: MotionSpeed; label: string }[] = [
  { value: 'slow', label: 'Chậm' },
  { value: 'normal', label: 'Vừa' },
  { value: 'fast', label: 'Nhanh' },
];
const INTENSITY_OPTS: { value: MotionIntensity; label: string }[] = [
  { value: 'subtle', label: 'Nhẹ' },
  { value: 'normal', label: 'Vừa' },
  { value: 'dramatic', label: 'Mạnh' },
];
const CASCADE_OPTS: { value: MotionCascade; label: string }[] = [
  { value: 'off', label: 'Tắt' },
  { value: 'normal', label: 'Vừa' },
  { value: 'slow', label: 'Chậm' },
];

const CATEGORY_LABEL: Record<MotionPreset['category'], string> = {
  entrance: 'Xuất hiện',
  hover: 'Hover / Tương tác',
  ambient: 'Liên tục',
  scroll: 'Theo cuộn',
};

const CATEGORY_ORDER: MotionPreset['category'][] = [
  'entrance',
  'ambient',
  'scroll',
  'hover',
];

/**
 * Block-level motion picker. Shows preset gallery filtered by blockType,
 * grouped by category; bottom strip exposes 3 knobs + tắt motion + áp dụng.
 *
 * Pattern: imperative `onChange(null)` to disable motion entirely;
 * `onChange(config)` to apply/update.
 */
export function MotionPopover({
  blockType,
  config,
  onChange,
  onPreview,
  open,
  onOpenChange,
  trigger,
}: MotionPopoverProps) {
  // Local working copy — committed on close so UI feels responsive.
  const [local, setLocal] = React.useState<MotionConfig | null>(config);

  React.useEffect(() => {
    if (open) setLocal(config);
  }, [open, config]);

  const presets = React.useMemo(
    () => motionRegistry.list({ blockType }).filter(p => p.scope !== 'element'),
    [blockType]
  );

  const grouped = React.useMemo(() => {
    const map = new Map<MotionPreset['category'], MotionPreset[]>();
    for (const p of presets) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return map;
  }, [presets]);

  const activePreset = local ? motionRegistry.get(local.presetId) : undefined;

  const selectPreset = (preset: MotionPreset) => {
    setLocal({
      presetId: preset.id,
      speed: local?.speed ?? 'normal',
      intensity: local?.intensity ?? 'normal',
      cascade: local?.cascade ?? 'normal',
      enabled: true,
    });
  };

  const setKnob = <K extends keyof MotionConfig>(
    key: K,
    value: MotionConfig[K]
  ) => {
    if (!local) return;
    setLocal({ ...local, [key]: value });
  };

  const apply = () => {
    onChange(local);
    onOpenChange(false);
  };

  const disable = () => {
    onChange(null);
    setLocal(null);
    onOpenChange(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='end'
          sideOffset={8}
          className='z-50 w-[480px] rounded-lg border border-neutral-200/80 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.04)] outline-none'
          data-testid='motion-popover'
        >
          {/* Header */}
          <div className='flex items-center gap-2 border-b border-neutral-200/80 px-3 py-2.5'>
            <Sparkles className='size-3.5 text-indigo-500' />
            <span className='text-[10px] font-semibold tracking-[0.16em] text-neutral-700 uppercase'>
              Motion · {blockType.replace('_', ' ')}
            </span>
            {onPreview && (
              <button
                type='button'
                onClick={onPreview}
                title='Phát thử (Space)'
                data-testid='motion-popover-preview'
                className='ml-auto flex h-6 cursor-pointer items-center gap-1 rounded-md bg-neutral-900 px-2 text-[10px] font-semibold tracking-tight text-white transition-colors hover:bg-neutral-700'
              >
                <Play className='size-3' />
                Phát thử
              </button>
            )}
            <button
              type='button'
              onClick={() => onOpenChange(false)}
              aria-label='Đóng'
              className='flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
            >
              <X className='size-3.5' />
            </button>
          </div>

          {/* Gallery */}
          <div className='max-h-[300px] overflow-y-auto px-3 py-2'>
            {presets.length === 0 ? (
              <div className='py-8 text-center text-[11px] text-neutral-500'>
                Block này chưa có preset motion phù hợp.
              </div>
            ) : (
              CATEGORY_ORDER.map(cat => {
                const list = grouped.get(cat);
                if (!list || list.length === 0) return null;
                return (
                  <section
                    key={cat}
                    className='mb-3'
                    data-testid={`motion-category-${cat}`}
                  >
                    <h3 className='mb-1 font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase'>
                      {CATEGORY_LABEL[cat]}
                    </h3>
                    <div className='flex flex-wrap gap-1'>
                      {list.map(p => (
                        <MotionPresetCard
                          key={p.id}
                          preset={p}
                          active={local?.presetId === p.id}
                          onSelect={() => selectPreset(p)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </div>

          {/* Knobs */}
          {local && activePreset && (
            <div className='flex flex-col gap-2 border-t border-neutral-200/80 px-3 py-2.5'>
              <KnobRow
                label='Tốc độ'
                value={local.speed}
                options={SPEED_OPTS}
                disabled={!activePreset.knobs.speed}
                onChange={v => setKnob('speed', v)}
              />
              <KnobRow
                label='Cường độ'
                value={local.intensity}
                options={INTENSITY_OPTS}
                disabled={!activePreset.knobs.intensity}
                onChange={v => setKnob('intensity', v)}
              />
              <KnobRow
                label='Cascade'
                value={local.cascade}
                options={CASCADE_OPTS}
                disabled={!activePreset.knobs.cascade}
                onChange={v => setKnob('cascade', v)}
              />
            </div>
          )}

          {/* Footer actions */}
          <div className='flex items-center gap-2 border-t border-neutral-200/80 px-3 py-2.5'>
            <button
              type='button'
              onClick={disable}
              data-testid='motion-popover-disable'
              className={cn(
                'flex h-7 cursor-pointer items-center rounded-md px-2 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900',
                !config && 'opacity-50'
              )}
            >
              Tắt motion
            </button>
            <button
              type='button'
              onClick={apply}
              disabled={!local}
              data-testid='motion-popover-apply'
              className='ml-auto flex h-7 cursor-pointer items-center rounded-md bg-neutral-900 px-3 text-[11px] font-semibold tracking-tight text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40'
            >
              Áp dụng
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
