'use client';

import * as React from 'react';
import { Info, Loader2, Paperclip, Plus, Upload, X } from 'lucide-react';

import { cn } from '@/lib/cn';

type DivAttrs = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title' | 'onChange'
>;

export interface FeatureAttachment {
  name: string;
  url?: string;
}

export interface FeatureFieldProps extends DivAttrs {
  label: string;
  /** Initial text shown in the textarea (uncontrolled mode). */
  description?: string;
  /** Controlled value — when set, caller manages state via `onChange`. */
  value?: string;
  /** Controlled change handler — receives the new full text. */
  onChange?: (next: string) => void;
  placeholder?: string;
  /** Render the "+ Add more feature" button below the description box */
  showAddMore?: boolean;
  showUpload?: boolean;
  /** Render slot on the right of the label */
  info?: boolean;
  /** Tooltip hiện khi hover icon ⓘ (cần `info` bật). */
  infoText?: string;
  disabled?: boolean;
  rows?: number;
  /** Fired when user clicks "+ Add more feature". */
  onAddMore?: () => void;
  /** Khi set, icon upload mở file picker và trả files về caller. */
  onPickFiles?: (files: File[]) => void;
  /** Spinner trên icon upload trong lúc caller xử lý file. */
  uploading?: boolean;
  /** File đính kèm hiển thị dạng chip dưới textarea. */
  attachments?: FeatureAttachment[];
  onRemoveAttachment?: (index: number) => void;
  /** Khi set, hiện nút ✕ góc phải ô để xoá field này (ô "feature" thêm). */
  onRemove?: () => void;
  /** Thu gọn nội dung dài còn `rows` dòng, kèm nút See More / See Less. */
  collapsible?: boolean;
}

/** Icon ⓘ kèm tooltip hover — dùng chung cho FeatureField + Assets. */
export function InfoTip({ text }: { text?: string }) {
  if (!text) return <Info className='text-content-muted size-3.5' />;
  return (
    <span className='group/tip relative inline-flex'>
      <Info className='text-content-muted hover:text-foreground size-3.5 cursor-help' />
      <span
        role='tooltip'
        className='bg-foreground text-background text-2xs pointer-events-none absolute top-full left-1/2 z-20 mt-1.5 hidden w-56 -translate-x-1/2 rounded-lg px-3 py-2 font-normal shadow-lg group-hover/tip:block'
      >
        {text}
      </span>
    </span>
  );
}

/**
 * Editable multi-line text field used across Marketing Discovery / Concept /
 * Assets. Pages can pass `description` (uncontrolled — internal state seeds
 * from prop) or `value` + `onChange` (controlled). Layout matches Figma:
 * left label column, right rounded box with textarea + upload + add-more.
 */
function FeatureField({
  label,
  description,
  value,
  onChange,
  placeholder = 'Describe something',
  showAddMore = false,
  showUpload = true,
  info = true,
  infoText,
  disabled = false,
  rows = 4,
  onAddMore,
  onPickFiles,
  uploading = false,
  attachments,
  onRemoveAttachment,
  onRemove,
  collapsible = false,
  className,
  ...props
}: FeatureFieldProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<string>(description ?? '');
  const fileRef = React.useRef<HTMLInputElement>(null);
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const [expanded, setExpanded] = React.useState(false);
  const [overflowing, setOverflowing] = React.useState(false);

  // Reset internal state when the upstream `description` (mock per route)
  // changes. Skip for controlled mode — caller owns state.
  React.useEffect(() => {
    if (!isControlled) setInternal(description ?? '');
  }, [description, isControlled]);

  const text = isControlled ? (value ?? '') : internal;
  const setText = (next: string) => {
    if (isControlled) onChange?.(next);
    else setInternal(next);
  };

  // See More: thu gọn về `rows` dòng; mở rộng grow theo scrollHeight. Đo
  // overflow mỗi khi text/expand đổi để chỉ hiện nút khi nội dung tràn.
  React.useEffect(() => {
    const ta = taRef.current;
    if (!ta || !collapsible) return;
    if (expanded) {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    } else {
      ta.style.height = '';
      setOverflowing(ta.scrollHeight > ta.clientHeight + 2);
    }
  }, [text, expanded, collapsible, rows]);

  return (
    <div
      className={cn('grid grid-cols-[140px_1fr] items-start gap-4', className)}
      {...props}
    >
      <div className='text-foreground flex items-center gap-1 pt-2 text-sm font-semibold'>
        {label}
        {info && <InfoTip text={infoText} />}
      </div>
      <div className='flex flex-col gap-3'>
        <div className='border-border bg-background focus-within:border-foreground/40 relative rounded-xl border p-4 transition-colors'>
          <div className='mb-1 flex items-center justify-between'>
            <span className='text-content-muted text-xs font-semibold'>
              Description
            </span>
            {onRemove && (
              <button
                type='button'
                aria-label='Xoá mục này'
                onClick={onRemove}
                className='text-content-muted hover:text-destructive -mt-1 -mr-1'
              >
                <X className='size-4' />
              </button>
            )}
          </div>
          <textarea
            ref={taRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn(
              'text-foreground placeholder:text-content-muted w-full border-0 bg-transparent p-0 text-sm leading-6 outline-none disabled:opacity-60',
              collapsible ? 'resize-none' : 'resize-y',
              collapsible && !expanded && 'overflow-hidden'
            )}
          />
          {collapsible && (overflowing || expanded) && (
            <button
              type='button'
              onClick={() => setExpanded(e => !e)}
              className='bg-muted text-foreground hover:bg-muted/70 mt-1.5 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold transition-colors'
            >
              {expanded ? 'See Less' : 'See More'}
            </button>
          )}
          {!!attachments?.length && (
            <ul className='mt-2 flex flex-wrap gap-1.5'>
              {attachments.map((a, i) => (
                <li
                  key={`${a.name}-${i}`}
                  className='bg-muted text-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs'
                >
                  <Paperclip className='size-3' />
                  {a.url ? (
                    <a
                      href={a.url}
                      target='_blank'
                      rel='noreferrer'
                      className='hover:underline'
                    >
                      {a.name}
                    </a>
                  ) : (
                    a.name
                  )}
                  {onRemoveAttachment && (
                    <button
                      type='button'
                      aria-label={`Xoá ${a.name}`}
                      onClick={() => onRemoveAttachment(i)}
                      className='text-content-muted hover:text-destructive'
                    >
                      <X className='size-3' />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {showUpload && (
            <div className='mt-3 flex items-center'>
              <button
                type='button'
                aria-label='Đính kèm file tham khảo'
                title='Đính kèm file tham khảo cho mục này'
                disabled={uploading || disabled}
                onClick={() => onPickFiles && fileRef.current?.click()}
                className='text-content-muted hover:text-foreground inline-flex size-6 cursor-pointer items-center justify-center disabled:opacity-60'
              >
                {uploading ? (
                  <Loader2 className='size-4 animate-spin' />
                ) : (
                  <Upload className='size-4' />
                )}
              </button>
              {onPickFiles && (
                <input
                  ref={fileRef}
                  type='file'
                  multiple
                  hidden
                  onChange={e => {
                    // Copy ra array trước khi reset input — FileList là live.
                    const files = Array.from(e.target.files ?? []);
                    e.target.value = '';
                    if (files.length) onPickFiles(files);
                  }}
                />
              )}
            </div>
          )}
        </div>
        {showAddMore && (
          <button
            type='button'
            onClick={onAddMore}
            className='rounded-pill text-neutral-0 inline-flex h-8 w-fit cursor-pointer items-center gap-1 bg-neutral-900 px-3 text-xs font-semibold hover:bg-neutral-800'
          >
            <Plus className='size-3.5' /> Add more feature
          </button>
        )}
      </div>
    </div>
  );
}

export { FeatureField };
