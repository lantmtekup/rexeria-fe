'use client';

import * as React from 'react';

import { motionRegistry } from '../registry';
import type { MotionConfig, MotionPreset } from '../types';
import type { BlockType } from '../../types';

import { KnobRow } from './KnobRow';
import { MotionPresetCard } from './MotionPresetCard';

interface MotionPanelProps {
  blockType: BlockType;
  /** Element key currently selected in BlockEditor; null = no selection. */
  selectedElementKey: string | null;
  /** Block-level config (for inheritance display). */
  blockConfig: MotionConfig | null;
  /** Element-level override (if any). */
  elementConfig: MotionConfig | null;
  onApplyElement: (next: MotionConfig | null) => void;
}

/**
 * Sidebar Motion tab — element-level override editor. When no element is
 * selected, prompts the user. When selected, shows inheritance state from
 * block-level + lets the user override with an element-scope preset.
 */
export function MotionPanel({
  blockType,
  selectedElementKey,
  blockConfig,
  elementConfig,
  onApplyElement,
}: MotionPanelProps) {
  if (!selectedElementKey) {
    return (
      <div
        className='flex flex-col gap-3 px-4 py-5 text-[11px] text-neutral-600'
        data-testid='motion-panel-empty'
      >
        <p className='leading-relaxed'>
          Chọn một element trên canvas (hoặc tab <strong>LỚP</strong>) để chỉnh
          motion riêng cho element đó.
        </p>
        {blockConfig && (
          <div className='rounded-md bg-neutral-50 p-2.5 ring-1 ring-neutral-200'>
            <span className='font-mono text-[10px] tracking-[0.08em] text-neutral-400 uppercase'>
              Block đang dùng
            </span>
            <p className='mt-1 text-[12px] font-semibold text-neutral-900'>
              🎬{' '}
              {motionRegistry.get(blockConfig.presetId)?.name.vi ??
                blockConfig.presetId}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <ElementMotionEditor
      blockType={blockType}
      elementKey={selectedElementKey}
      blockConfig={blockConfig}
      elementConfig={elementConfig}
      onApply={onApplyElement}
    />
  );
}

function ElementMotionEditor({
  blockType,
  elementKey,
  blockConfig,
  elementConfig,
  onApply,
}: {
  blockType: BlockType;
  elementKey: string;
  blockConfig: MotionConfig | null;
  elementConfig: MotionConfig | null;
  onApply: (next: MotionConfig | null) => void;
}) {
  const [local, setLocal] = React.useState<MotionConfig | null>(elementConfig);

  React.useEffect(() => {
    setLocal(elementConfig);
  }, [elementConfig]);

  const presets = React.useMemo(
    () =>
      motionRegistry
        .list({ blockType })
        .filter(p => p.scope === 'element' || p.scope === 'children'),
    [blockType]
  );

  const activePreset = local ? motionRegistry.get(local.presetId) : undefined;

  if (!elementConfig && !local) {
    // Inherit state — show block-level + Override CTA.
    const blockPreset = blockConfig
      ? motionRegistry.get(blockConfig.presetId)
      : null;
    return (
      <div className='flex flex-col gap-3 px-4 py-4'>
        <div>
          <span className='font-mono text-[10px] tracking-[0.08em] text-neutral-400 uppercase'>
            Element
          </span>
          <h3 className='mt-0.5 text-[13px] font-semibold text-neutral-900'>
            {elementKey}
          </h3>
        </div>
        <div className='rounded-md bg-emerald-50/60 p-2.5 ring-1 ring-emerald-200/60'>
          <span className='font-mono text-[10px] tracking-[0.08em] text-emerald-700 uppercase'>
            ✓ Đang kế thừa từ block
          </span>
          <p className='mt-1 text-[12px] font-semibold text-neutral-900'>
            {blockPreset?.name.vi ?? blockConfig?.presetId ?? 'Không có'}
          </p>
        </div>
        <button
          type='button'
          onClick={() =>
            setLocal({
              presetId: presets[0]?.id ?? '',
              speed: 'normal',
              intensity: 'normal',
              cascade: 'normal',
              enabled: true,
            })
          }
          disabled={!presets.length}
          data-testid='motion-panel-override'
          className='flex h-8 cursor-pointer items-center justify-center rounded-md bg-neutral-900 px-3 text-[11px] font-semibold tracking-tight text-white transition-colors hover:bg-neutral-700 disabled:opacity-40'
        >
          Override motion cho element này
        </button>
      </div>
    );
  }

  // Editing override
  return (
    <div className='flex flex-col gap-3 px-4 py-4'>
      <div className='flex items-center gap-2'>
        <div className='min-w-0'>
          <span className='font-mono text-[10px] tracking-[0.08em] text-neutral-400 uppercase'>
            Element
          </span>
          <h3 className='mt-0.5 truncate text-[13px] font-semibold text-neutral-900'>
            {elementKey}
          </h3>
        </div>
        <button
          type='button'
          onClick={() => {
            setLocal(null);
            onApply(null);
          }}
          data-testid='motion-panel-reset'
          className='ml-auto flex h-7 cursor-pointer items-center rounded-md px-2 text-[10px] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
        >
          ↺ Reset
        </button>
      </div>

      <div>
        <span className='mb-1 block font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase'>
          Preset
        </span>
        <div className='flex flex-wrap gap-1'>
          {presets.map(p => (
            <MotionPresetCard
              key={p.id}
              preset={p as MotionPreset}
              active={local?.presetId === p.id}
              onSelect={() => {
                const next: MotionConfig = {
                  presetId: p.id,
                  speed: local?.speed ?? 'normal',
                  intensity: local?.intensity ?? 'normal',
                  cascade: local?.cascade ?? 'normal',
                  enabled: true,
                };
                setLocal(next);
                onApply(next);
              }}
            />
          ))}
        </div>
      </div>

      {local && activePreset && (
        <div className='flex flex-col gap-2'>
          <KnobRow
            label='Tốc độ'
            value={local.speed}
            options={[
              { value: 'slow', label: 'Chậm' },
              { value: 'normal', label: 'Vừa' },
              { value: 'fast', label: 'Nhanh' },
            ]}
            disabled={!activePreset.knobs.speed}
            onChange={v => {
              const next = { ...local, speed: v };
              setLocal(next);
              onApply(next);
            }}
          />
          <KnobRow
            label='Cường độ'
            value={local.intensity}
            options={[
              { value: 'subtle', label: 'Nhẹ' },
              { value: 'normal', label: 'Vừa' },
              { value: 'dramatic', label: 'Mạnh' },
            ]}
            disabled={!activePreset.knobs.intensity}
            onChange={v => {
              const next = { ...local, intensity: v };
              setLocal(next);
              onApply(next);
            }}
          />
        </div>
      )}
    </div>
  );
}
