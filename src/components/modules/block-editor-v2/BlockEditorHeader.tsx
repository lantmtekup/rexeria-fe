'use client';

import * as React from 'react';
import Link from 'next/link';
import * as Popover from '@radix-ui/react-popover';
import {
  ArrowLeft,
  Bookmark,
  Copy,
  Eye,
  Globe2,
  ImagePlus,
  MoreHorizontal,
  Package,
  Redo2,
  Save,
  Undo2,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import { FLOATING, R_FLOATING, SEGMENT_ACTIVE } from './chrome';

import type { Lang } from '@/components/modules/block-editor/types';

export type HeaderTab = Lang | 'ai';

interface BlockEditorHeaderProps {
  blockName: string;
  lang: Lang;
  saving: boolean;
  dirty: boolean;
  duplicating?: boolean;
  onLangChange: (lang: Lang) => void;
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
  /** Không còn nút trong header (đã dời hẳn vào sidebar motion panel) — vẫn
   *  giữ trong props vì cả hai caller (`BlockEditorV2`, `CanvasTemplate`)
   *  đang truyền vào, xoá khỏi type sẽ đổi luôn API của cả hai chỗ đó. */
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
  /** Slot cho action riêng của route (vd "Tạo link demo" ở admin template
   *  edit). Render trong cụm tool bên phải, cạnh nút Xem trước — để route
   *  không phải dựng thanh bar riêng ăn mất chiều cao canvas. Style do route
   *  tự lo (giữ h-7 để khớp hàng tool). */
  headerActions?: React.ReactNode;
}

export function BlockEditorHeader({
  blockName,
  lang,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  saving,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dirty,
  duplicating,
  onLangChange,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transitionControl,
  committedVersion,
  onSaveVersion,
  savingVersion,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPlayMotionPreview,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onOpenMotionEditor,
  canUndo,
  canRedo,
  isPublished,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isMotionPreviewing,
  backHref = '/canvas-templates',
  onBack,
  headerActions,
}: BlockEditorHeaderProps) {
  // const status: SaveStatus = saving ? 'saving' : dirty ? 'dirty' : 'saved';

  const backClass =
    'flex size-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900';

  return (
    // Three columns so the name sits at the true centre of the header no matter
    // how wide the action cluster grows. A plain flex row drifted the title left
    // every time a tool was added.
    <header className='grid h-11 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2.5'>
      {/* ── LEFT · nav ────────────────────────────────────────────── */}
      <div className='flex min-w-0 items-center gap-1.5'>
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
        {/* {transitionControl && (
          <div className='min-w-0 shrink'>{transitionControl}</div>
        )} */}
      </div>

      {/* ── CENTRE · identity ─────────────────────────────────────── */}
      <div className='flex min-w-0 items-center justify-center gap-1.5'>
        <h1
          title={blockName}
          className='max-w-[10rem] truncate text-sm font-semibold tracking-tight text-neutral-900 sm:max-w-[16rem]'
        >
          {blockName}
        </h1>
        {/* <SaveDot status={status} /> */}
        {committedVersion !== undefined && (
          <VersionBadge version={committedVersion} />
        )}
      </div>

      {/* ── RIGHT · tools ─────────────────────────────────────────── */}
      <div className='flex items-center justify-end gap-0.5'>
        <IconBtn onClick={onUndo} disabled={!canUndo} label='Hoàn tác (⌘Z)'>
          <Undo2 className='size-3.5' />
        </IconBtn>
        <IconBtn onClick={onRedo} disabled={!canRedo} label='Làm lại (⌘⇧Z)'>
          <Redo2 className='size-3.5' />
        </IconBtn>

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

        <IconBtn onClick={onPreview} label='Xem trước'>
          <Eye className='size-3.5' />
        </IconBtn>

        {/* Everything you reach for once a session, not once a minute. Folded
            so the frequent tools stay reachable without the bar overflowing. */}
        <OverflowMenu
          items={[
            {
              icon: ImagePlus,
              label: 'Tạo block từ ảnh / Figma',
              onClick: onImportFromImage,
              testId: 'header-import-block',
            },
            {
              icon: Package,
              label: 'Áp dụng sản phẩm vào canvas',
              onClick: onApplyProduct,
            },
            ...(onDuplicate
              ? [
                  {
                    icon: Copy,
                    label: duplicating ? 'Đang nhân bản…' : 'Lưu thành của tôi',
                    onClick: onDuplicate,
                    disabled: duplicating,
                  },
                ]
              : []),
            ...(onSaveBlock
              ? [
                  {
                    icon: Bookmark,
                    label: saveBlockLabel ?? 'Lưu vào thư viện',
                    onClick: onSaveBlock,
                  },
                ]
              : []),
          ]}
        />

        {headerActions}

        {onPublish ? (
          <button
            type='button'
            onClick={onPublish}
            className={cn(
              'text-2xs ml-0.5 flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 font-semibold tracking-tight transition-colors',
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

type OverflowItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  testId?: string;
};

/** The `⋯` menu. Nothing lives only here that you need mid-edit. */
function OverflowMenu({ items }: { items: OverflowItem[] }) {
  const [open, setOpen] = React.useState(false);
  if (items.length === 0) return null;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label='Thêm hành động'
        title='Thêm hành động'
        data-testid='header-overflow'
        className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 data-[state=open]:bg-neutral-100 data-[state=open]:text-neutral-900'
      >
        <MoreHorizontal className='size-3.5' />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='end'
          sideOffset={6}
          className={cn(
            'z-50 w-56 bg-[var(--pv2-paper)] p-1',
            R_FLOATING,
            FLOATING
          )}
        >
          {items.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type='button'
                disabled={item.disabled}
                data-testid={item.testId}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className='flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
              >
                <Icon className='size-3.5 shrink-0' />
                <span className='truncate'>{item.label}</span>
              </button>
            );
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
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
        'inline-flex cursor-pointer items-center justify-center rounded-sm text-[var(--pv2-mut)] transition-colors hover:text-[var(--pv2-ink)]',
        active && SEGMENT_ACTIVE,
        className
      )}
      {...props}
    />
  );
}
