'use client';

import * as React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Play, X } from 'lucide-react';

import { cn } from '@/lib/cn';

import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import {
  MotionBlockRoot,
  MotionProvider,
} from '@/components/modules/block-editor/motion/runtime';
import {
  BLOCK_ROOT_KEY,
  type BlockMotion,
} from '@/components/modules/block-editor/motion/types';
import {
  readVariant,
  type Block,
  type Device,
  type Lang,
} from '@/components/modules/block-editor/types';

import { BlockControlsBar } from './BlockControlsBar';
import { KeyframeInspector } from './KeyframeInspector';
import { TimelineRuler } from './TimelineRuler';
import { TrackRow } from './TrackRow';
import { AddTrackPopover } from './AddTrackPopover';
import {
  addKeyframe,
  addTrack,
  emptyMotion,
  patchKeyframe,
  removeKeyframe,
  removeTrack,
} from './utils';

interface MotionTimelineModalProps {
  open: boolean;
  block: Block;
  device: Device;
  lang: Lang;
  /** Stored motion for the current device variant (or undefined). */
  motion: BlockMotion | undefined;
  onChange: (next: BlockMotion | null) => void;
  onClose: () => void;
}

const TRANSITION_MS = 200;
const DEFAULT_PX_PER_MS = 0.4; // 400px per second

export function MotionTimelineModal({
  open,
  block,
  device,
  lang,
  motion,
  onChange,
  onClose,
}: MotionTimelineModalProps) {
  // Local working copy — autosave back via onChange on every mutation. Lets
  // us cheaply invalidate on close and avoid re-render loops while dragging
  // keyframes (the parent re-renders the modal on every keystroke otherwise).
  const [draft, setDraft] = React.useState<BlockMotion>(
    () => motion ?? emptyMotion()
  );
  const [closing, setClosing] = React.useState(false);
  const [playhead, setPlayhead] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [selected, setSelected] = React.useState<{
    elementKey: string;
    index: number;
  } | null>(null);
  const [pxPerMs, setPxPerMs] = React.useState(DEFAULT_PX_PER_MS);

  const overlayRef = React.useRef<HTMLDivElement>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const previewSurfaceRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);

  // Sync draft when modal reopens with a different block. Deliberately drops
  // `motion` from deps — once open, the draft is the source of truth and
  // commits flow back via onChange; re-running on every parent re-render
  // would clobber scrub/selection state mid-edit.
  React.useEffect(() => {
    if (!open) return;
    setDraft(motion ?? emptyMotion());
    setSelected(null);
    setPlayhead(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, block.id]);

  const stopPlay = React.useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setPlaying(false);
  }, []);

  const commit = React.useCallback(
    (next: BlockMotion) => {
      setDraft(next);
      // Strip out empty motion to undefined → BlockEditor drops the field.
      const isEmpty = next.tracks.length === 0 && next.duration === 0;
      onChange(isEmpty ? null : next);
    },
    [onChange]
  );

  const handleClose = React.useCallback(() => {
    stopPlay();
    setClosing(true);
  }, [stopPlay]);

  // Cleanup any in-flight playback when the modal unmounts.
  React.useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleScrub = React.useCallback((ms: number) => {
    // Scrubbing always wins over auto-play.
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      setPlaying(false);
    }
    setPlayhead(ms);
  }, []);

  const handleTogglePlay = React.useCallback(() => {
    // Pause
    if (rafRef.current != null) {
      stopPlay();
      return;
    }
    // Play — if we're at (or past) the end, restart from 0.
    const startMs = playhead >= draft.duration ? 0 : playhead;
    const startTs = performance.now();
    const totalMs = draft.duration;
    if (startMs !== playhead) setPlayhead(startMs);
    setPlaying(true);
    const loop = () => {
      const next = startMs + (performance.now() - startTs);
      if (next >= totalMs) {
        rafRef.current = null;
        setPlayhead(totalMs);
        setPlaying(false);
        return;
      }
      setPlayhead(next);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [playhead, draft.duration, stopPlay]);

  // Enter/exit animation
  useGSAP(
    () => {
      if (!open) return;
      if (!overlayRef.current || !sheetRef.current) return;
      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(sheetRef.current, { y: 18, autoAlpha: 0 });
      gsap
        .timeline()
        .to(overlayRef.current, {
          autoAlpha: 1,
          duration: TRANSITION_MS / 1000,
          ease: 'power2.out',
        })
        .to(
          sheetRef.current,
          {
            y: 0,
            autoAlpha: 1,
            duration: TRANSITION_MS / 1000,
            ease: 'power3.out',
          },
          '-=0.08'
        );
    },
    { dependencies: [open] }
  );

  useGSAP(
    () => {
      if (!closing) return;
      if (!overlayRef.current || !sheetRef.current) return;
      gsap
        .timeline({
          onComplete: () => {
            setClosing(false);
            onClose();
          },
        })
        .to(sheetRef.current, {
          y: 12,
          autoAlpha: 0,
          duration: TRANSITION_MS / 1000,
          ease: 'power2.in',
        })
        .to(
          overlayRef.current,
          {
            autoAlpha: 0,
            duration: TRANSITION_MS / 1000,
            ease: 'power2.in',
          },
          '-=0.06'
        );
    },
    { dependencies: [closing] }
  );

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selected &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        commit(removeKeyframe(draft, selected.elementKey, selected.index));
        setSelected(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleClose, selected, draft, commit]);

  // Compute available element keys from the live preview DOM. Re-run when
  // the modal opens so we pick up whatever the active block renders. Keys
  // already in tracks are excluded from the AddTrack list.
  const [availableKeys, setAvailableKeys] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!open) return;
    // Defer to the next tick so RenderBlock has mounted.
    const t = setTimeout(() => {
      if (!previewSurfaceRef.current) return;
      const found = new Set<string>();
      previewSurfaceRef.current
        .querySelectorAll<HTMLElement>('[data-element-key]')
        .forEach(el => {
          const k = el.getAttribute('data-element-key');
          if (!k || k.startsWith('__')) return; // skip system keys (__bg__, etc)
          found.add(k);
        });
      setAvailableKeys([BLOCK_ROOT_KEY, ...Array.from(found).sort()]);
    }, 50);
    return () => clearTimeout(t);
  }, [open, block.id, lang, device]);

  const langContent = lang === 'vi' ? block.contentVi : block.contentEn;
  const content = readVariant(langContent, device) ?? langContent.desktop;
  const styles = readVariant(block.elementStyles, device);
  const background = readVariant(block.background, device);
  const order = readVariant(block.elementOrder, device);

  const usedKeys = new Set(draft.tracks.map(t => t.elementKey));
  const addTrackOptions = availableKeys.filter(k => !usedKeys.has(k));

  const selectedKf =
    selected &&
    draft.tracks.find(t => t.elementKey === selected.elementKey)?.keyframes[
      selected.index
    ];

  if (!open && !closing) return null;

  return (
    <div
      ref={overlayRef}
      data-testid='motion-modal'
      className='fixed inset-0 z-[60] flex flex-col bg-neutral-950/80 backdrop-blur-sm'
    >
      <div ref={sheetRef} className='flex h-full flex-col bg-neutral-50'>
        <header className='flex h-12 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4'>
          <span className='text-3xs font-mono tracking-[0.18em] text-neutral-400 uppercase'>
            Motion timeline
          </span>
          <h2 className='truncate text-sm font-semibold tracking-tight text-neutral-900'>
            {block.name}
          </h2>
          <span className='text-3xs font-mono tracking-[0.12em] text-neutral-400 uppercase'>
            · {device}
          </span>
          <div className='flex-1' />
          <button
            type='button'
            onClick={handleClose}
            aria-label='Đóng'
            data-testid='motion-modal-close'
            className='flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
          >
            <X className='size-4' />
          </button>
        </header>

        <div className='flex min-h-0 flex-1 flex-col'>
          {/* ── Preview surface ─────────────────────────────────────── */}
          <div className='flex h-[280px] shrink-0 items-center justify-center overflow-hidden border-b border-neutral-200 bg-[#f3f1ec]'>
            <div
              ref={previewSurfaceRef}
              className='relative h-full w-full overflow-auto p-4'
            >
              <div className='@container mx-auto max-w-[680px]'>
                <MotionProvider
                  mode='preview'
                  motion={draft}
                  scrollerEl={previewSurfaceRef.current}
                  scrubMs={playhead}
                >
                  <MotionBlockRoot className='overflow-hidden rounded-md bg-white shadow-md ring-1 ring-black/5'>
                    <RenderBlock
                      block={block}
                      content={content}
                      styles={styles}
                      background={background}
                      order={order}
                    />
                  </MotionBlockRoot>
                </MotionProvider>
              </div>
            </div>
          </div>

          {/* ── Block controls + Play ───────────────────────────────── */}
          <BlockControlsBar
            motion={draft}
            onChange={next => commit(next)}
            playing={playing}
            onTogglePlay={handleTogglePlay}
            pxPerMs={pxPerMs}
            onPxPerMsChange={setPxPerMs}
          />

          {/* ── Ruler + Tracks ──────────────────────────────────────── */}
          <div className='flex min-h-0 flex-1 flex-col overflow-auto bg-white'>
            <TimelineRuler
              duration={draft.duration}
              pxPerMs={pxPerMs}
              playhead={playhead}
              onScrub={handleScrub}
            />
            <div className='flex flex-1 flex-col'>
              {draft.tracks.length === 0 ? (
                <div className='flex flex-col items-center gap-3 px-6 py-12 text-center text-xs text-neutral-500'>
                  <p>Chưa có track nào.</p>
                  <p className='text-neutral-400'>
                    Thêm track cho element bất kỳ để bắt đầu animate.
                  </p>
                </div>
              ) : (
                draft.tracks.map(track => (
                  <TrackRow
                    key={track.elementKey}
                    track={track}
                    duration={draft.duration}
                    pxPerMs={pxPerMs}
                    playhead={playhead}
                    selectedIndex={
                      selected?.elementKey === track.elementKey
                        ? selected.index
                        : null
                    }
                    onSelectKeyframe={i =>
                      setSelected({ elementKey: track.elementKey, index: i })
                    }
                    onMoveKeyframe={(i, time) =>
                      commit(
                        patchKeyframe(draft, track.elementKey, i, { time })
                      )
                    }
                    onAddKeyframe={() =>
                      commit(addKeyframe(draft, track.elementKey, playhead))
                    }
                    onRemoveTrack={() => {
                      commit(removeTrack(draft, track.elementKey));
                      setSelected(null);
                    }}
                  />
                ))
              )}
              <div className='border-t border-neutral-100 px-3 py-2'>
                <AddTrackPopover
                  options={addTrackOptions}
                  onPick={key => commit(addTrack(draft, key))}
                />
              </div>
            </div>
          </div>

          {/* ── Inspector ───────────────────────────────────────────── */}
          {selected && selectedKf && (
            <KeyframeInspector
              kf={selectedKf}
              maxTime={draft.duration}
              onChange={patch =>
                commit(
                  patchKeyframe(
                    draft,
                    selected.elementKey,
                    selected.index,
                    patch
                  )
                )
              }
              onDelete={() => {
                commit(
                  removeKeyframe(draft, selected.elementKey, selected.index)
                );
                setSelected(null);
              }}
            />
          )}
        </div>

        <footer className='text-3xs flex h-9 shrink-0 items-center gap-3 border-t border-neutral-200 bg-white px-4 text-neutral-500'>
          <span className='font-mono tracking-[0.14em] uppercase'>
            ⌘Drag · Click ruler · Del/Backspace
          </span>
          <div className='flex-1' />
          <button
            type='button'
            onClick={handleClose}
            className='text-2xs flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-neutral-900 px-3 font-semibold text-white hover:bg-neutral-700'
          >
            <Play className={cn('size-3', 'rotate-90')} />
            Xong
          </button>
        </footer>
      </div>
    </div>
  );
}
