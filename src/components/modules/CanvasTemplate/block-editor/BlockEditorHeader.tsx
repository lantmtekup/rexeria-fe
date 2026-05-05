'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  Eye,
  Globe2,
  Monitor,
  Package,
  Play,
  Redo2,
  Smartphone,
  Sparkles,
  Tablet,
  Undo2,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import { motionRegistry } from './motion/registry';
import type { MotionConfig } from './motion/types';
import { MotionPopover } from './motion/ui/MotionPopover';
import type { BlockType, Device, Lang } from './types';

export type HeaderTab = Lang | 'ai';

interface BlockEditorHeaderProps {
  blockName: string;
  blockType: BlockType;
  lang: Lang;
  device: Device;
  saving: boolean;
  dirty: boolean;
  duplicating?: boolean;
  /** Block-level motion config for the current device variant. */
  blockMotion: MotionConfig | null;
  onLangChange: (lang: Lang) => void;
  onDeviceChange: (device: Device) => void;
  onAi: () => void;
  onApplyProduct: () => void;
  onDuplicate: () => void;
  onPreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPublish: () => void;
  onChangeBlockMotion: (next: MotionConfig | null) => void;
  onPlayMotionPreview: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isPublished: boolean;
  isMotionPreviewing: boolean;
  backHref?: string;
}

const DEVICE_BUTTONS: {
  value: Device;
  icon: React.ElementType;
  label: string;
}[] = [
  { value: 'desktop', icon: Monitor, label: 'Desktop' },
  { value: 'tablet', icon: Tablet, label: 'Tablet' },
  { value: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export function BlockEditorHeader({
  blockName,
  blockType,
  lang,
  device,
  saving,
  dirty,
  duplicating,
  blockMotion,
  onLangChange,
  onDeviceChange,
  onAi,
  onApplyProduct,
  onDuplicate,
  onPreview,
  onUndo,
  onRedo,
  onPublish,
  onChangeBlockMotion,
  onPlayMotionPreview,
  canUndo,
  canRedo,
  isPublished,
  isMotionPreviewing,
  backHref = '/canvas-templates',
}: BlockEditorHeaderProps) {
  const status: SaveStatus = saving ? 'saving' : dirty ? 'dirty' : 'saved';
  const [motionOpen, setMotionOpen] = React.useState(false);
  const motionPresetName = blockMotion
    ? motionRegistry.get(blockMotion.presetId)?.name.vi
    : null;

  return (
    <header className='flex h-12 shrink-0 items-center gap-2.5 border-b border-neutral-200/80 bg-white px-3'>
      {/* ── LEFT · back + crumb + save dot ─────────────────────────── */}
      <Link
        href={backHref}
        aria-label='Quay lại'
        title='Quay lại'
        className='flex size-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
      >
        <ArrowLeft className='size-4' />
      </Link>

      <div className='flex min-w-0 items-baseline gap-2'>
        <span className='text-[10px] font-semibold tracking-[0.18em] text-neutral-400 uppercase'>
          Block
        </span>
        <h1 className='truncate text-[13px] font-semibold tracking-tight text-neutral-900'>
          {blockName}
        </h1>
      </div>
      <SaveDot status={status} />

      {/* push the rest right */}
      <div className='flex-1' />

      {/* ── CENTER · history + device + lang ───────────────────────── */}
      <div className='flex items-center'>
        <IconBtn onClick={onUndo} disabled={!canUndo} label='Hoàn tác (⌘Z)'>
          <Undo2 className='size-4' />
        </IconBtn>
        <IconBtn onClick={onRedo} disabled={!canRedo} label='Làm lại (⌘⇧Z)'>
          <Redo2 className='size-4' />
        </IconBtn>
      </div>

      <Divider />

      <SegmentedGroup ariaLabel='Thiết bị xem trước'>
        {DEVICE_BUTTONS.map(({ value, icon: Icon, label }) => (
          <SegmentedButton
            key={value}
            active={device === value}
            onClick={() => onDeviceChange(value)}
            aria-label={label}
            title={label}
            className='size-7'
          >
            <Icon className='size-3.5' />
          </SegmentedButton>
        ))}
      </SegmentedGroup>

      <SegmentedGroup ariaLabel='Chế độ chỉnh sửa'>
        <SegmentedButton
          active={lang === 'vi'}
          onClick={() => onLangChange('vi')}
          className='h-7 px-2 font-mono text-[10px] font-semibold tracking-[0.14em]'
        >
          VI
        </SegmentedButton>
        <SegmentedButton
          active={lang === 'en'}
          onClick={() => onLangChange('en')}
          className='h-7 px-2 font-mono text-[10px] font-semibold tracking-[0.14em]'
        >
          EN
        </SegmentedButton>
        <SegmentedButton
          onClick={onAi}
          aria-label='AI'
          className='h-7 px-2 font-mono text-[10px] font-semibold tracking-[0.14em]'
        >
          AI
        </SegmentedButton>
      </SegmentedGroup>

      <Divider />

      {/* ── MOTION · preset + preview ──────────────────────────────── */}
      <MotionPopover
        blockType={blockType}
        config={blockMotion}
        onChange={onChangeBlockMotion}
        onPreview={onPlayMotionPreview}
        open={motionOpen}
        onOpenChange={setMotionOpen}
        trigger={
          <button
            type='button'
            data-testid='header-motion-button'
            className={cn(
              'flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition-colors',
              blockMotion
                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
            )}
            title='Motion cho block (M)'
          >
            <Sparkles className='size-3.5' />
            <span className='max-w-[120px] truncate'>
              {motionPresetName ?? 'Motion'}
            </span>
          </button>
        }
      />

      <IconBtn
        onClick={onPlayMotionPreview}
        label='Phát thử motion (Space)'
        data-testid='header-motion-preview'
        className={cn(isMotionPreviewing && 'bg-indigo-100 text-indigo-700')}
      >
        <Play className='size-4' />
      </IconBtn>

      <Divider />

      {/* ── RIGHT · quick actions + publish CTA ────────────────────── */}
      <div className='flex items-center'>
        <IconBtn onClick={onApplyProduct} label='Áp dụng sản phẩm vào canvas'>
          <Package className='size-4' />
        </IconBtn>
        <IconBtn
          onClick={onDuplicate}
          disabled={duplicating}
          label={duplicating ? 'Đang nhân bản…' : 'Lưu thành của tôi'}
        >
          <Copy className='size-4' />
        </IconBtn>
        <IconBtn onClick={onPreview} label='Xem trước'>
          <Eye className='size-4' />
        </IconBtn>
      </div>

      <button
        type='button'
        onClick={onPublish}
        className={cn(
          'ml-1 flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-3 text-[11px] font-semibold tracking-tight transition-colors',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_0_rgba(0,0,0,0.04)]',
          isPublished
            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
            : 'bg-neutral-900 text-white hover:bg-neutral-700'
        )}
      >
        <Globe2 className='size-3.5' />
        {isPublished ? 'Đã xuất bản' : 'Xuất bản'}
      </button>
    </header>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────

type SaveStatus = 'saving' | 'dirty' | 'saved';

function SaveDot({ status }: { status: SaveStatus }) {
  const map: Record<SaveStatus, { dot: string; label: string; tone: string }> =
    {
      saving: {
        dot: 'bg-amber-400 animate-pulse',
        label: 'Đang lưu',
        tone: 'text-amber-700/70',
      },
      dirty: {
        dot: 'bg-amber-400',
        label: 'Chưa lưu',
        tone: 'text-amber-700/70',
      },
      saved: {
        dot: 'bg-emerald-500',
        label: 'Đã lưu',
        tone: 'text-neutral-400',
      },
    };
  const { dot, label, tone } = map[status];
  return (
    <span
      className='inline-flex shrink-0 items-center gap-1.5'
      aria-live='polite'
    >
      <span className={cn('size-1.5 rounded-full', dot)} aria-hidden />
      <span
        className={cn(
          'font-mono text-[10px] tracking-[0.04em] tabular-nums',
          tone
        )}
      >
        {label}
      </span>
    </span>
  );
}

function IconBtn({
  label,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }) {
  return (
    <button
      type='button'
      title={label}
      aria-label={label}
      className={cn(
        'flex size-8 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors',
        'enabled:hover:bg-neutral-100 enabled:hover:text-neutral-900',
        'disabled:cursor-not-allowed disabled:opacity-30',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className='mx-1 h-5 w-px shrink-0 bg-neutral-200' />;
}

function SegmentedGroup({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role='group'
      aria-label={ariaLabel}
      className='ml-1 flex items-center gap-0.5 rounded-md bg-neutral-100 p-0.5'
    >
      {children}
    </div>
  );
}

function SegmentedButton({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type='button'
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-[5px] text-neutral-500 transition-colors hover:text-neutral-900',
        active &&
          'bg-white text-neutral-900 shadow-[0_1px_0_rgba(0,0,0,0.04),0_0_0_0.5px_rgba(0,0,0,0.04)]',
        className
      )}
      {...props}
    />
  );
}
