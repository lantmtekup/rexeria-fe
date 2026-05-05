'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import { RenderBlock } from './blocks/renderBlock';
import { MotionBlockRoot, MotionProvider } from './motion/runtime';
import type { BlockMotionMap, EditorMode, MotionConfig } from './motion/types';
import { readVariant, type Block, type Device, type Lang } from './types';

interface BlockPreviewProps {
  block: Block;
  lang: Lang;
  device: Device;
  zoom: number;
  selectedElementKey: string | null;
  /** Key currently being edited inline (double-click). Null when not editing. */
  editingKey: string | null;
  onSelectElement: (key: string | null, rect: DOMRect | null) => void;
  /** Triggered by double-click on a text element. */
  onStartInlineEdit: (key: string) => void;
  /** Called on blur / Enter / Esc with the final string value. */
  onCommitInlineEdit: (key: string, value: string) => void;
  onCancelInlineEdit: () => void;
  /** Editor lifecycle for motion subsystem. Default 'edit' (no-op). */
  motionMode?: EditorMode;
}

const DEVICE_WIDTH: Record<Device, number> = {
  desktop: 1280,
  tablet: 834,
  mobile: 390,
};

/** Element keys that map to a single string field — eligible for inline edit. */
const TEXT_KEYS = new Set([
  'eyebrow',
  'title',
  'tag',
  'description',
  'subtitle',
  'ctaText',
  'submitText',
  'noteText',
  'primaryText',
  'secondaryText',
]);

export function BlockPreview({
  block,
  lang,
  device,
  zoom,
  selectedElementKey,
  editingKey,
  onSelectElement,
  onStartInlineEdit,
  onCommitInlineEdit,
  onCancelInlineEdit,
  motionMode = 'edit',
}: BlockPreviewProps) {
  const langContent = lang === 'vi' ? block.contentVi : block.contentEn;
  const content = readVariant(langContent, device) ?? langContent.desktop;
  const styles = readVariant(block.elementStyles, device);
  const background = readVariant(block.background, device);
  const order = readVariant(block.elementOrder, device);
  const baseWidth = DEVICE_WIDTH[device];
  const scale = zoom / 100;
  const surfaceRef = React.useRef<HTMLDivElement>(null);

  // Resolve motion config for this device + an editor-mode override. URL
  // param `?testMotion=<presetId>` forces preview mode and synthesises a
  // block-level motion config so we can PoC the runtime without a UI yet.
  // Strip this branch when the editing UI ships.
  const { motionForDevice, effectiveMode } = React.useMemo<{
    motionForDevice: BlockMotionMap | undefined;
    effectiveMode: EditorMode;
  }>(() => {
    const testParam =
      typeof window === 'undefined'
        ? null
        : new URLSearchParams(window.location.search).get('testMotion');
    if (testParam) {
      const synth: MotionConfig = {
        presetId: testParam,
        speed: 'normal',
        intensity: 'normal',
        cascade: 'normal',
        enabled: true,
      };
      return {
        motionForDevice: { block: synth },
        effectiveMode: 'preview',
      };
    }
    const stored = readVariant(block.motion, device);
    return {
      motionForDevice: stored as BlockMotionMap | undefined,
      effectiveMode: motionMode,
    };
  }, [block.motion, device, motionMode]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Clicks inside an actively-editing element should NOT change selection
    // (user is positioning caret / selecting text within the editable region).
    if (editingKey) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-inline-editing="true"]')) return;
    }
    const target = e.target as HTMLElement;
    const el = target.closest<HTMLElement>('[data-element-key]');
    if (el && surfaceRef.current?.contains(el)) {
      const key = el.getAttribute('data-element-key');
      if (!key) return;
      onSelectElement(key, el.getBoundingClientRect());
      return;
    }
    onSelectElement(null, null);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const el = target.closest<HTMLElement>('[data-element-key]');
    if (!el || !surfaceRef.current?.contains(el)) return;
    const key = el.getAttribute('data-element-key');
    if (!key || !TEXT_KEYS.has(key)) return;
    onStartInlineEdit(key);
  };

  // Drive contenteditable via DOM when entering edit mode. Pure DOM manipulation
  // keeps each block component dumb (no editing concerns).
  React.useEffect(() => {
    if (!editingKey || !surfaceRef.current) return;
    const el = surfaceRef.current.querySelector<HTMLElement>(
      `[data-element-key="${CSS.escape(editingKey)}"]`
    );
    if (!el) return;

    el.setAttribute('contenteditable', 'plaintext-only');
    el.setAttribute('data-inline-editing', 'true');
    el.spellcheck = false;
    el.focus();

    // Select all text so user can immediately overwrite by typing.
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    const commit = () => {
      const next = (el.textContent ?? '').trim();
      onCommitInlineEdit(editingKey, next);
    };
    const cancel = () => onCancelInlineEdit();

    const onBlur = () => commit();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        // Commit on Enter; Shift+Enter inserts a soft newline (browser default).
        e.preventDefault();
        commit();
      }
    };

    el.addEventListener('blur', onBlur);
    el.addEventListener('keydown', onKey);

    return () => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-inline-editing');
      el.removeEventListener('blur', onBlur);
      el.removeEventListener('keydown', onKey);
    };
  }, [editingKey, onCommitInlineEdit, onCancelInlineEdit]);

  return (
    <div
      ref={surfaceRef}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className='relative flex flex-1 items-center justify-center overflow-auto bg-[#f3f1ec] p-8 [&_[data-inline-editing=true]]:cursor-text [&_[data-inline-editing=true]]:rounded-sm [&_[data-inline-editing=true]]:bg-sky-50/80 [&_[data-inline-editing=true]]:outline [&_[data-inline-editing=true]]:outline-2 [&_[data-inline-editing=true]]:outline-offset-2 [&_[data-inline-editing=true]]:outline-sky-500'
    >
      <div
        // `shrink-0` keeps the declared `width` honoured inside the flex
        // parent — without it, flex shrinks the frame below 1280/834/390,
        // which makes container queries (`@2xl:` / `@4xl:`) misfire and
        // desktop blocks render at tablet text scale.
        className='@container shrink-0 origin-center transition-transform duration-150'
        style={{
          width: baseWidth,
          transform: `scale(${scale})`,
        }}
      >
        <div
          data-element-key='__background__'
          className={cn(
            'w-full overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-black/5',
            selectedElementKey === '__background__' &&
              'outline outline-2 outline-offset-2 outline-sky-500'
          )}
        >
          <MotionProvider
            mode={effectiveMode}
            device={device}
            motion={motionForDevice}
            scrollerEl={surfaceRef.current}
          >
            <MotionBlockRoot>
              {/*
                Re-mount RenderBlock when block/device/lang change so the
                CSS `animate-in` keyframes fire fresh on every tab switch
                (otherwise React reconciles same nodes → no animation).
              */}
              <RenderBlock
                key={`${block.id}:${device}:${lang}`}
                block={block}
                content={content}
                styles={styles}
                background={background}
                order={order}
                activeKey={selectedElementKey}
              />
            </MotionBlockRoot>
          </MotionProvider>
        </div>
      </div>
    </div>
  );
}
