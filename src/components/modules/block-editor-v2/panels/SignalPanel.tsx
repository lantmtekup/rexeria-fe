'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import type {
  Block,
  ComponentSignalConfig,
} from '@/components/modules/block-editor/types';
import { cn } from '@/lib/cn';

import { FieldRow } from '../inspector/primitives/FieldRow';
import { InspectorSection } from '../inspector/primitives/InspectorSection';
import { NumberField } from '../inspector/primitives/NumberField';
import { SegmentedControl } from '../inspector/primitives/SegmentedControl';
import {
  CONTROL_H,
  CONTROL_FOCUS,
  CONTROL_SURFACE,
  PANEL_PAD_X,
  TEXT_CONTROL,
  TEXT_META,
  TEXT_NUM,
} from '../inspector/tokens';
import {
  BLOCK_SIGNALS,
  COMP_EVENTS,
  CRM_ACTIONS,
  DEFAULT_BLOCK_SIGNALS,
  FUNNEL_STAGE_LABEL,
  PRIVACY,
  SIGNAL_OBJECTS,
  SIGNAL_TYPES,
  STRENGTHS,
  THRESHOLD_MAX,
  THRESHOLD_MIN,
  TYPES_FOR,
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
 * bg-step, row đang mở = đúng 1 ring electric.
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
  // Accordion nào đang mở — navigation, không phải edit: state cục bộ, không
  // vào history.
  const [openKey, setOpenKey] = React.useState<string | null>(null);

  const elements = React.useMemo(() => signalElementsOf(block), [block]);
  const coverage = React.useMemo(
    () => blockSignalCoverage(allBlocks),
    [allBlocks]
  );

  const tracked = block.signal?.track === true;
  const signals = block.signal?.signals ?? DEFAULT_BLOCK_SIGNALS;
  const enabledSignals = Object.values(signals).filter(Boolean).length;
  const trackedComps = elements.filter(
    el => block.signal?.components?.[el.key]?.track === true
  ).length;

  const toggleBlockTrack = () => {
    onEdit(b => {
      if (b.signal?.track) {
        b.signal.track = false;
        return;
      }
      // Bật lần đầu seed mặc định; bật lại giữ nguyên cấu hình cũ.
      b.signal = {
        track: true,
        signals: b.signal?.signals ?? { ...DEFAULT_BLOCK_SIGNALS },
        components: b.signal?.components ?? {},
      };
    });
  };

  const toggleBlockSignal = (key: string) => {
    onEdit(b => {
      if (!b.signal?.track) return;
      const next = { ...(b.signal.signals ?? DEFAULT_BLOCK_SIGNALS) };
      next[key] = !next[key];
      b.signal.signals = next;
    });
  };

  const toggleComponent = (
    key: string,
    kind: SignalComponentKind,
    label: string
  ) => {
    const turningOn = block.signal?.components?.[key]?.track !== true;
    onEdit(b => {
      if (!b.signal?.track) return;
      const comps = b.signal.components ?? {};
      const cur = comps[key];
      comps[key] = turningOn
        ? { ...ensureComponentSignal(cur, kind), track: true }
        : { ...cur, track: false };
      b.signal.components = comps;
    });
    if (turningOn) {
      setOpenKey(key);
      const cfg = ensureComponentSignal(block.signal?.components?.[key], kind);
      toast(meaningFrom({ ...cfg, track: true }, kind, label));
    } else {
      setOpenKey(prev => (prev === key ? null : prev));
      toast(`Đã ngừng theo dõi ${label}`);
    }
  };

  const patchComponent = (
    key: string,
    kind: SignalComponentKind,
    patch: Partial<ComponentSignalConfig>
  ) => {
    onEdit(b => {
      const cur = b.signal?.components?.[key];
      if (!b.signal?.components || !cur) return;
      b.signal.components[key] = {
        ...ensureComponentSignal(cur, kind),
        ...patch,
      };
    });
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
                  const stored = block.signal?.components?.[el.key];
                  const isTracked = stored?.track === true;
                  const cfg = ensureComponentSignal(stored, kind);
                  const isOpen = isTracked && openKey === el.key;
                  const typeDef = SIGNAL_TYPES[cfg.type ?? ''];
                  const Caret = isOpen ? ChevronDown : ChevronRight;
                  const ElIcon = el.icon;

                  return (
                    <div
                      key={el.key}
                      className={cn(
                        'rounded-md transition-colors',
                        isOpen
                          ? 'ring-1 ring-[var(--pv2-electric)]'
                          : 'hover:bg-[var(--pv2-canvas)]'
                      )}
                    >
                      <div className='flex items-center gap-1.5 px-1.5 py-1.5'>
                        <button
                          type='button'
                          onClick={() =>
                            isTracked &&
                            setOpenKey(prev =>
                              prev === el.key ? null : el.key
                            )
                          }
                          aria-expanded={isOpen}
                          aria-label={`Cấu hình điểm đo ${el.label}`}
                          className={cn(
                            'flex min-w-0 flex-1 items-center gap-1.5 text-left',
                            isTracked ? 'cursor-pointer' : 'cursor-default'
                          )}
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
                          {isTracked && (
                            <span
                              className={cn(
                                'max-w-[45%] shrink-0 truncate',
                                TEXT_META,
                                'text-[var(--pv2-mut)]'
                              )}
                            >
                              {typeDef?.n} · {cfg.event}
                            </span>
                          )}
                          {isTracked && (
                            <Caret className='size-3 shrink-0 text-[var(--pv2-mut)]' />
                          )}
                        </button>
                        <Switch
                          on={isTracked}
                          onToggle={() =>
                            toggleComponent(el.key, kind, el.label)
                          }
                          ariaLabel={`Theo dõi ${el.label}`}
                        />
                      </div>

                      {isOpen && (
                        <div className='mx-1.5 mb-1.5 flex flex-col gap-2 rounded-md bg-[var(--pv2-canvas)] p-2'>
                          {/* Câu nghĩa: kết quả cấu hình, cập nhật live. */}
                          <p className='text-2xs rounded-sm bg-[var(--pv2-electric-soft)] px-2 py-1.5 text-[var(--pv2-ink)]'>
                            {meaningFrom(cfg, kind, el.label)}
                          </p>

                          <FieldRow label='Loại tín hiệu' stacked>
                            <Select
                              ariaLabel={`Loại tín hiệu của ${el.label}`}
                              value={cfg.type ?? ''}
                              onChange={v =>
                                patchComponent(el.key, kind, { type: v })
                              }
                              options={TYPES_FOR[kind].map(t => ({
                                value: t,
                                label: SIGNAL_TYPES[t].n,
                              }))}
                            />
                            <Helper>
                              {typeDef
                                ? `${typeDef.d}. ${
                                    typeDef.r
                                      ? `Tính vào giai đoạn ${FUNNEL_STAGE_LABEL[typeDef.r]} của funnel.`
                                      : 'Không tính vào giai đoạn funnel nào.'
                                  }`
                                : null}
                            </Helper>
                          </FieldRow>

                          <FieldRow label='Kích hoạt khi' stacked>
                            <Select
                              ariaLabel={`Sự kiện kích hoạt của ${el.label}`}
                              value={cfg.event ?? ''}
                              onChange={v =>
                                patchComponent(el.key, kind, { event: v })
                              }
                              options={COMP_EVENTS[kind].map(e => ({
                                value: e,
                                label: e,
                              }))}
                            />
                          </FieldRow>

                          <FieldRow label='Đối tượng' stacked>
                            <Select
                              ariaLabel={`Đối tượng của ${el.label}`}
                              value={cfg.object ?? 'none'}
                              onChange={v =>
                                patchComponent(el.key, kind, { object: v })
                              }
                              options={Object.entries(SIGNAL_OBJECTS).map(
                                ([value, label]) => ({ value, label })
                              )}
                            />
                          </FieldRow>

                          <FieldRow label='Ngưỡng đếm' stacked>
                            <NumberField
                              ariaLabel={`Ngưỡng của ${el.label}`}
                              value={cfg.threshold}
                              min={THRESHOLD_MIN}
                              max={THRESHOLD_MAX}
                              unit={kind === 'text' ? 'giây' : 'lần'}
                              onChange={n =>
                                patchComponent(el.key, kind, {
                                  threshold: n ?? (kind === 'text' ? 3 : 1),
                                })
                              }
                            />
                          </FieldRow>

                          <FieldRow label='Trọng số intent' stacked>
                            <SegmentedControl
                              ariaLabel={`Trọng số intent của ${el.label}`}
                              value={cfg.strength}
                              onChange={n =>
                                patchComponent(el.key, kind, { strength: n })
                              }
                              options={[1, 2, 3].map(n => ({
                                value: n,
                                label: STRENGTHS[n],
                              }))}
                            />
                          </FieldRow>

                          <FieldRow label='Hành động CRM' stacked>
                            <Select
                              ariaLabel={`Hành động CRM của ${el.label}`}
                              value={cfg.crm ?? CRM_ACTIONS[0]}
                              onChange={v =>
                                patchComponent(el.key, kind, { crm: v })
                              }
                              options={CRM_ACTIONS.map(a => ({
                                value: a,
                                label: a,
                              }))}
                            />
                          </FieldRow>

                          <FieldRow label='Định danh' stacked>
                            <Select
                              ariaLabel={`Mức định danh của ${el.label}`}
                              value={cfg.privacy ?? 'pseudonymous'}
                              onChange={v =>
                                patchComponent(el.key, kind, { privacy: v })
                              }
                              options={Object.entries(PRIVACY).map(
                                ([value, def]) => ({ value, label: def.n })
                              )}
                            />
                            <Helper>
                              {PRIVACY[cfg.privacy ?? 'pseudonymous']?.d}
                            </Helper>
                          </FieldRow>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {elements.length > 0 && (
              <p className={cn(TEXT_META, 'text-[var(--pv2-faint)]')}>
                Mỗi điểm đo được lưu thành một hành vi đọc được (ví dụ:
                &ldquo;Khách hàng đã so sánh sản phẩm&rdquo;) thay vì mã sự kiện
                thô, nên dùng được trực tiếp cho intent score và CRM.
              </p>
            )}
          </InspectorSection>
        </>
      )}
    </div>
  );
}

/** Helper line dưới một control — mô tả của option đang chọn. */
function Helper({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className={cn('mt-1', TEXT_META, 'text-[var(--pv2-faint)]')}>
      {children}
    </p>
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

function Select({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={e => onChange(e.target.value)}
      // `text-2xs!`: globals.css có rule unlayered `select { font-size: 16px }`
      // (chống iOS zoom-on-focus) đè mọi utility trong @layer — cần !important
      // để control ăn đúng cỡ 11px của inspector.
      className={cn(
        'text-2xs! w-full min-w-0 cursor-pointer px-2',
        CONTROL_H,
        CONTROL_SURFACE,
        CONTROL_FOCUS,
        'text-[var(--pv2-ink)]'
      )}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
