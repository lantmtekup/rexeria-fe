'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  Clapperboard,
  Copy,
  Eye,
  Globe2,
  ImagePlus,
  Package,
  Play,
  Redo2,
  Save,
  Undo2,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import { DeviceSwitcher } from './DeviceSwitcher';
import type { Device, Lang } from './types';

export type HeaderTab = Lang | 'ai';

interface BlockEditorHeaderProps {
  blockName: string;
  lang: Lang;
  device: Device;
  saving: boolean;
  dirty: boolean;
  duplicating?: boolean;
  onLangChange: (lang: Lang) => void;
  onDeviceChange: (device: Device) => void;
  onAi: () => void;
  onApplyProduct: () => void;
  onImportFromImage: () => void;
  /** Optional — ẩn nút Duplicate khi không khả dụng (vd block-direct mode). */
  onDuplicate?: () => void;
  onPreview: () => void;
  onUndo: () => void;
  onRedo: () => void;
  /** Optional — chỉ truyền khi editor ở context page có thể publish (có
   *  pageId). Template-only mode (catalog preset) không có public page nên
   *  bỏ qua → nút "Xuất bản" ẩn (xem BlockEditor: publish chỉ work qua
   *  /p/{slug} của page instance; share-token legacy đã bị BE gỡ). */
  onPublish?: () => void;
  onSaveBlock?: () => void;
  /** Nhãn cho icon Bookmark — block mode dùng "Đổi tên & lưu…" để phân biệt
   *  với nút primary "Lưu block". Mặc định "Lưu block vào thư viện". */
  saveBlockLabel?: string;
  /** Block-direct mode: ghi đè block thẳng (không qua dialog). Khi set →
   *  header hiện nút primary "Lưu block" ở slot CTA (thay nút Xuất bản, vốn
   *  vắng mặt trong block mode vì không có page để publish). */
  onSaveBlockDirect?: () => void;
  savingBlockDirect?: boolean;
  /** Control transition (cấp template) — render cạnh trạng thái lưu. */
  transitionControl?: React.ReactNode;
  /** Template version đã commit (vd "1.0.0"). Null = chưa có version. */
  committedVersion?: string | null;
  /** Commit draft → immutable version (template mode). */
  onSaveVersion?: () => void;
  savingVersion?: boolean;
  onPlayMotionPreview: () => void;
  onOpenMotionEditor: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isPublished: boolean;
  isMotionPreviewing: boolean;
  backHref?: string;
  /** Nếu set → nút back gọi hàm này (vd router.back về màn trước) thay vì đi
   *  `backHref`. Ưu tiên hơn backHref. */
  onBack?: () => void;
}

export function BlockEditorHeader({
  blockName,
  lang,
  device,
  saving,
  dirty,
  duplicating,
  onLangChange,
  onDeviceChange,
  onAi,
  onApplyProduct,
  onImportFromImage,
  onDuplicate,
  onPreview,
  onUndo,
  onRedo,
  onPublish,
  onSaveBlock,
  saveBlockLabel = 'Lưu block vào thư viện',
  onSaveBlockDirect,
  savingBlockDirect,
  transitionControl,
  committedVersion,
  onSaveVersion,
  savingVersion,
  onPlayMotionPreview,
  onOpenMotionEditor,
  canUndo,
  canRedo,
  isPublished,
  isMotionPreviewing,
  backHref = '/canvas-templates',
  onBack,
}: BlockEditorHeaderProps) {
  const status: SaveStatus = saving ? 'saving' : dirty ? 'dirty' : 'saved';

  const backClass =
    'flex size-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900';

  return (
    <header className='flex h-11 shrink-0 items-center gap-1.5 border-b border-neutral-200/80 bg-white px-2.5'>
      {/* ── LEFT · nav + meta ─────────────────────────────────────── */}
      {onBack ? (
        <button
          type='button'
          onClick={onBack}
          aria-label='Quay lại'
          title='Quay lại'
          className={backClass}
        >
          <ArrowLeft className='size-4' />
        </button>
      ) : (
        <Link
          href={backHref}
          aria-label='Quay lại'
          title='Quay lại'
          className={backClass}
        >
          <ArrowLeft className='size-4' />
        </Link>
      )}

      <div className='flex min-w-0 items-center gap-1.5'>
        <h1 className='max-w-[8rem] truncate text-sm font-semibold tracking-tight text-neutral-900 sm:max-w-[10rem]'>
          {blockName}
        </h1>
        <SaveDot status={status} />
        {committedVersion !== undefined && (
          <VersionBadge version={committedVersion} />
        )}
      </div>

      {transitionControl && <div className='shrink-0'>{transitionControl}</div>}

      {/* ── RIGHT · tools (không flex-1 — tránh khoảng trống giữa) ── */}
      <div className='ml-auto flex items-center gap-0.5'>
        <IconBtn onClick={onUndo} disabled={!canUndo} label='Hoàn tác (⌘Z)'>
          <Undo2 className='size-3.5' />
        </IconBtn>
        <IconBtn onClick={onRedo} disabled={!canRedo} label='Làm lại (⌘⇧Z)'>
          <Redo2 className='size-3.5' />
        </IconBtn>

        <Divider />

        <DeviceSwitcher
          device={device}
          onChange={onDeviceChange}
          variant='editor'
        />

        <Divider />

        <SegmentedGroup ariaLabel='Chế độ chỉnh sửa'>
          <SegmentedButton
            active={lang === 'vi'}
            onClick={() => onLangChange('vi')}
            className='text-3xs h-6 px-1.5 font-mono font-semibold tracking-[0.12em]'
          >
            VI
          </SegmentedButton>
          <SegmentedButton
            active={lang === 'en'}
            onClick={() => onLangChange('en')}
            className='text-3xs h-6 px-1.5 font-mono font-semibold tracking-[0.12em]'
          >
            EN
          </SegmentedButton>
          <SegmentedButton
            onClick={onAi}
            aria-label='AI'
            className='text-3xs h-6 px-1.5 font-mono font-semibold tracking-[0.12em]'
          >
            AI
          </SegmentedButton>
        </SegmentedGroup>

        <Divider />

        <IconBtn
          onClick={onOpenMotionEditor}
          label='Mở trình chỉnh motion'
          data-testid='header-motion-editor'
        >
          <Clapperboard className='size-3.5' />
        </IconBtn>
        <IconBtn
          onClick={onPlayMotionPreview}
          label='Phát thử motion (Space)'
          data-testid='header-motion-preview'
          className={cn(isMotionPreviewing && 'bg-indigo-100 text-indigo-700')}
        >
          <Play className='size-3.5' />
        </IconBtn>

        <Divider />

        <IconBtn
          onClick={onImportFromImage}
          label='Tạo block từ ảnh / Figma'
          data-testid='header-import-block'
        >
          <ImagePlus className='size-3.5' />
        </IconBtn>
        <IconBtn onClick={onApplyProduct} label='Áp dụng sản phẩm vào canvas'>
          <Package className='size-3.5' />
        </IconBtn>
        {onDuplicate && (
          <IconBtn
            onClick={onDuplicate}
            disabled={duplicating}
            label={duplicating ? 'Đang nhân bản…' : 'Lưu thành của tôi'}
          >
            <Copy className='size-3.5' />
          </IconBtn>
        )}
        {onSaveBlock ? (
          <IconBtn onClick={onSaveBlock} label={saveBlockLabel}>
            <Bookmark className='size-3.5' />
          </IconBtn>
        ) : null}

        <Divider />

        <IconBtn onClick={onPreview} label='Xem trước'>
          <Eye className='size-3.5' />
        </IconBtn>

        {onPublish ? (
          <button
            type='button'
            onClick={onPublish}
            className={cn(
              'text-2xs ml-0.5 flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 font-semibold tracking-tight transition-colors',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_0_rgba(0,0,0,0.04)]',
              isPublished
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-neutral-900 text-white hover:bg-neutral-700'
            )}
          >
            <Globe2 className='size-3.5' />
            <span className='hidden sm:inline'>
              {isPublished ? 'Đã xuất bản' : 'Xuất bản'}
            </span>
          </button>
        ) : null}

        {onSaveBlockDirect ? (
          <button
            type='button'
            onClick={onSaveBlockDirect}
            disabled={savingBlockDirect}
            title='Ghi đè block hiện tại trong thư viện'
            className={cn(
              'text-2xs ml-0.5 flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 font-semibold tracking-tight transition-colors',
              'bg-neutral-900 text-white hover:bg-neutral-700',
              'disabled:cursor-wait disabled:opacity-60'
            )}
          >
            <Save className='size-3.5' />
            {savingBlockDirect ? 'Đang lưu…' : 'Lưu block'}
          </button>
        ) : null}

        {onSaveVersion ? (
          <button
            type='button'
            onClick={onSaveVersion}
            disabled={savingVersion}
            title={
              committedVersion
                ? 'Tạo immutable version mới'
                : 'Commit version đầu tiên (v1.0.0)'
            }
            className={cn(
              'text-2xs ml-0.5 flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 font-semibold tracking-tight transition-colors',
              'bg-neutral-900 text-white hover:bg-neutral-700',
              'disabled:cursor-wait disabled:opacity-60'
            )}
          >
            <Save className='size-3.5' />
            {savingVersion ? 'Đang commit…' : 'Save Version'}
          </button>
        ) : null}
      </div>
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
      className='inline-flex shrink-0 items-center gap-1'
      aria-live='polite'
      title={label}
    >
      <span className={cn('size-1.5 rounded-full', dot)} aria-hidden />
      <span
        className={cn(
          'text-3xs hidden font-mono tracking-[0.04em] tabular-nums sm:inline',
          tone
        )}
      >
        {label}
      </span>
    </span>
  );
}

function VersionBadge({ version }: { version: string | null }) {
  if (version) {
    return (
      <code
        className='text-3xs text-content-muted hidden rounded bg-neutral-100 px-1.5 py-0.5 font-mono ring-1 ring-neutral-200/80 sm:inline'
        title='Version đã commit'
      >
        v{version}
      </code>
    );
  }
  return (
    <span
      className='text-3xs hidden rounded bg-amber-50 px-1.5 py-0.5 font-mono text-amber-800 ring-1 ring-amber-200/80 sm:inline'
      title='Chưa có version immutable — chỉ có draft autosave'
    >
      Draft
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
        'flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors',
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
  return <div className='mx-0.5 h-4 w-px shrink-0 bg-neutral-200' />;
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
      className='flex items-center gap-0.5 rounded-md bg-neutral-100 p-0.5'
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
