'use client';

import * as React from 'react';
import { toast } from 'sonner';

import type { Block } from '@/components/modules/block-editor/types';
import { cn } from '@/lib/cn';

import { InspectorSection } from '../inspector/primitives/InspectorSection';
import {
  PANEL_PAD_X,
  TEXT_CONTROL,
  TEXT_META,
  TEXT_NUM,
} from '../inspector/tokens';
import {
  BLOCK_SIGNALS,
  DEFAULT_BLOCK_SIGNALS,
  blockSignalCoverage,
  coarseKindOf,
  ensureComponentSignal,
  meaningFrom,
  signalElementsOf,
} from '../signal/vocabulary';
import type { SignalComponentKind } from '../signal/vocabulary';

/**
 * Signal capture — instrumentation của block đang chọn, một block một lần.
 *
 * Hai tầng: tín hiệu cấp block (dwell, scroll, tap…) và điểm đo per component
 * (khai báo Ý NGHĨA: "Khách hàng đã so sánh sản phẩm", không phải
 * "button_click_id_47"). Ghi vào `block.signal`, persist qua canvas_blueprint
 * autosave như mọi edit khác — undo/redo dùng chung history.
 *
 * `block.signal === undefined` nghĩa là block CHƯA từng được instrument
 * ("born untracked") — panel hiển thị đúng trạng thái đó thay vì giả một
 * con số 0.
 *
 * Chrome: Level 0 (chrome.ts) — không viền chồng viền; row phẳng, hover bằng
 * bg-step.
 */

type BlockRecipe = (b: Block) => void;

interface SignalPanelProps {
  block: Block;
  /** Cả canvas — cho chỉ số coverage tổng ở đầu panel. */
  allBlocks: Block[];
  /** `mutateActive` + `markDirty` — caller quyết định persist thế nào. */
  onEdit: (recipe: BlockRecipe) => void;
}

export function SignalPanel({ block, allBlocks, onEdit }: SignalPanelProps) {
  const elements = React.useMemo(() => signalElementsOf(block), [block]);
  const coverage = React.useMemo(
    () => blockSignalCoverage(allBlocks),
    [allBlocks]
  );

  // Default-on: block chưa cấu hình vẫn đang đo tín hiệu cơ bản. Chỉ
  // `track === false` (tắt tường minh) mới coi là off. Đồng bộ blockIsTrackable
  // trong use-tracker.ts.
  const tracked = block.signal?.track !== false;
  const signals = block.signal?.signals ?? DEFAULT_BLOCK_SIGNALS;
  const enabledSignals = Object.values(signals).filter(Boolean).length;
  const trackedComps = elements.filter(
    el => block.signal?.components?.[el.key]?.track === true
  ).length;

  const toggleBlockTrack = () => {
    onEdit(b => {
      // Default-on: đang đo (undefined hoặc track!==false) ⇒ tắt tường minh.
      const effectivelyOn = b.signal?.track !== false;
      b.signal = {
        track: !effectivelyOn,
        signals: b.signal?.signals ?? { ...DEFAULT_BLOCK_SIGNALS },
        components: b.signal?.components ?? {},
      };
    });
  };

  /**
   * Bảo đảm `b.signal` tồn tại trước khi chỉnh tín hiệu/điểm đo. Cần vì
   * default-on: block đang đo nhưng `signal === undefined` — không seed thì
   * toggle rơi vào no-op và người dùng bấm không thấy gì (bug đã gặp).
   */
  const ensureSignal = (b: Block) => {
    if (!b.signal) {
      b.signal = {
        track: true,
        signals: { ...DEFAULT_BLOCK_SIGNALS },
        components: {},
      };
    }
    return b.signal;
  };

  const toggleBlockSignal = (key: string) => {
    onEdit(b => {
      const sig = ensureSignal(b);
      const next = { ...(sig.signals ?? DEFAULT_BLOCK_SIGNALS) };
      next[key] = !next[key];
      sig.signals = next;
    });
  };

  const toggleComponent = (
    key: string,
    kind: SignalComponentKind,
    label: string
  ) => {
    const turningOn = block.signal?.components?.[key]?.track !== true;
    onEdit(b => {
      const sig = ensureSignal(b);
      const comps = sig.components ?? {};
      const cur = comps[key];
      comps[key] = turningOn
        ? { ...ensureComponentSignal(cur, kind), track: true }
        : { ...cur, track: false };
      sig.components = comps;
    });
    if (turningOn) {
      const cfg = ensureComponentSignal(block.signal?.components?.[key], kind);
      toast(meaningFrom({ ...cfg, track: true }, kind, label));
    } else {
      toast(`Đã ngừng theo dõi ${label}`);
    }
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      {/* ── Coverage: % là con số chính, mọi surface khác đọc từ đây ──── */}
      <div
        className={cn('border-b border-[var(--pv2-hair)] py-2.5', PANEL_PAD_X)}
      >
        <div className='flex items-baseline justify-between gap-2'>
          <span className={cn(TEXT_META, 'text-[var(--pv2-mut)]')}>
            Đo lường trang
          </span>
          <span
            className={cn(
              TEXT_NUM,
              'text-sm font-semibold text-[var(--pv2-ink)]'
            )}
          >
            {coverage.pct}%
          </span>
        </div>
        <div className='mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--pv2-hair)]'>
          <div
            className='h-full rounded-full bg-[var(--pv2-success)] transition-[width]'
            style={{ width: `${coverage.pct}%` }}
          />
        </div>
        <p className={cn('mt-1', TEXT_META, 'text-[var(--pv2-faint)]')}>
          {coverage.trackedComps}/{coverage.comps} thành phần ·{' '}
          {coverage.trackedBlocks}/{coverage.blocks} block
        </p>
      </div>

      {/* ── Block đang chọn + công tắc tổng ───────────────────────────── */}
      <div
        className={cn('border-b border-[var(--pv2-hair)] py-2.5', PANEL_PAD_X)}
      >
        <div className='flex items-center gap-2'>
          <p className='min-w-0 flex-1 truncate text-xs font-medium text-[var(--pv2-ink)]'>
            {block.name}
          </p>
          <Switch
            on={tracked}
            onToggle={toggleBlockTrack}
            ariaLabel='Đo hành vi người xem trong block này'
          />
        </div>
        <p className={cn('mt-1', TEXT_META, 'text-[var(--pv2-faint)]')}>
          {tracked
            ? 'Đang ghi nhận hành vi người xem trong block này.'
            : 'Bật để ghi nhận hành vi người xem (dừng, cuộn, chạm…).'}
        </p>
      </div>

      {tracked && (
        <>
          {/* ── Tầng 1: chỉ số cấp block ──────────────────────────────── */}
          <InspectorSection
            id='signal-block-metrics'
            title='Tín hiệu cấp block'
            overrideCount={enabledSignals}
          >
            <div className='-mx-1.5 flex flex-col'>
              {Object.entries(BLOCK_SIGNALS).map(([key, def]) => (
                <label
                  key={key}
                  title={def.d}
                  className='flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-[var(--pv2-canvas)]'
                >
                  <input
                    type='checkbox'
                    checked={signals[key] === true}
                    onChange={() => toggleBlockSignal(key)}
                    className='size-3.5 shrink-0 accent-[var(--pv2-electric)]'
                  />
                  <span className={cn(TEXT_CONTROL, 'text-[var(--pv2-ink)]')}>
                    {def.n}
                  </span>
                </label>
              ))}
            </div>
          </InspectorSection>

          {/* ── Tầng 2: điểm đo per component ─────────────────────────── */}
          <InspectorSection
            id='signal-tracking-points'
            title='Điểm đo thành phần'
            overrideCount={trackedComps}
          >
            {elements.length === 0 ? (
              <p className={cn(TEXT_META, 'text-[var(--pv2-mut)]')}>
                Block này không có thành phần nào để gắn điểm đo.
              </p>
            ) : (
              <div className='-mx-1.5 flex flex-col gap-0.5'>
                {elements.map(el => {
                  const kind = coarseKindOf(block, el.key);
                  const isTracked =
                    block.signal?.components?.[el.key]?.track === true;
                  const ElIcon = el.icon;

                  return (
                    <div
                      key={el.key}
                      className='flex items-center gap-1.5 rounded-md px-1.5 py-1.5 hover:bg-[var(--pv2-canvas)]'
                    >
                      <ElIcon className='size-3.5 shrink-0 text-[var(--pv2-mut)]' />
                      <span
                        className={cn(
                          'min-w-0 flex-1 truncate',
                          TEXT_CONTROL,
                          'text-[var(--pv2-ink)]'
                        )}
                      >
                        {el.label}
                      </span>
                      <Switch
                        on={isTracked}
                        onToggle={() => toggleComponent(el.key, kind, el.label)}
                        ariaLabel={`Theo dõi ${el.label}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* {elements.length > 0 && (
              <p className={cn(TEXT_META, 'text-[var(--pv2-faint)]')}>
                Mỗi điểm đo được lưu thành một hành vi đọc được (ví dụ:
                &ldquo;Khách hàng đã so sánh sản phẩm&rdquo;) thay vì mã sự kiện
                thô, nên dùng được trực tiếp cho intent score và CRM.
              </p>
            )} */}
          </InspectorSection>
        </>
      )}
    </div>
  );
}

/**
 * Toggle một cỡ duy nhất. Track 16×28px nhưng hit area 24×36px nhờ padding
 * (bù bằng -m để layout không phình).
 */
function Switch({
  on,
  onToggle,
  ariaLabel,
}: {
  on: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={onToggle}
      className='-m-1 shrink-0 cursor-pointer rounded-full p-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)]/40'
    >
      <span
        className={cn(
          'relative block h-4 w-7 rounded-full transition-colors',
          on ? 'bg-[var(--pv2-electric)]' : 'bg-[var(--pv2-hair)]'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-3 rounded-full bg-white transition-all',
            on ? 'left-3.5' : 'left-0.5'
          )}
        />
      </span>
    </button>
  );
}
