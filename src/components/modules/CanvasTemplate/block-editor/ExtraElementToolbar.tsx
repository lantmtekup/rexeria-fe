'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  BarChart3,
  Image as ImageIcon,
  TextCursorInput,
  Trash2,
  Type,
  Video,
  X,
} from 'lucide-react';

import { FontPicker } from '@/components/molecules/FontPicker';
import { cn } from '@/lib/cn';

import { ImagePicker } from './ImagePicker';
import type {
  EditTextExtraElement,
  ExtraElement,
  ExtraElementKind,
  ExtraElementTracking,
  PhotoExtraElement,
  TextExtraElement,
  VideoExtraElement,
} from './types';

interface Props {
  element: ExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
  onDelete: () => void;
  onClose: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

const KIND_LABEL: Record<ExtraElementKind, string> = {
  text: 'Text',
  edit_text: 'Edit text',
  photo: 'Photo',
  video: 'Video',
};

const KIND_ICON: Record<ExtraElementKind, React.ElementType> = {
  text: Type,
  edit_text: TextCursorInput,
  photo: ImageIcon,
  video: Video,
};

export function ExtraElementToolbar({
  element,
  onChange,
  onDelete,
  onClose,
  onBringToFront,
  onSendToBack,
}: Props) {
  const Icon = KIND_ICON[element.kind];
  return (
    <div className='flex h-10 shrink-0 items-center gap-2 border-b border-sky-200/80 bg-sky-50/60 px-3 text-xs'>
      <span className='inline-flex items-center gap-1.5 font-semibold text-sky-900'>
        <Icon className='size-3.5' />
        {KIND_LABEL[element.kind]}
      </span>
      <Sep />

      {element.kind === 'text' ? (
        <TextEditor el={element} onChange={onChange} />
      ) : element.kind === 'edit_text' ? (
        <EditTextEditor el={element} onChange={onChange} />
      ) : element.kind === 'photo' ? (
        <PhotoEditor el={element} onChange={onChange} />
      ) : (
        <VideoEditor el={element} onChange={onChange} />
      )}

      <Sep />
      <SizeEditor element={element} onChange={onChange} />

      <Sep />
      <TrackingPopover
        tracking={element.tracking}
        onChange={tracking => onChange({ tracking })}
      />

      <Sep />
      <ToolbarBtn onClick={onBringToFront} label='Đưa lên trước'>
        <ArrowUpToLine className='size-3.5' />
      </ToolbarBtn>
      <ToolbarBtn onClick={onSendToBack} label='Đưa xuống sau'>
        <ArrowDownToLine className='size-3.5' />
      </ToolbarBtn>

      <Sep />
      <ToolbarBtn onClick={onDelete} label='Xoá element' tone='danger'>
        <Trash2 className='size-3.5' />
      </ToolbarBtn>
      <button
        type='button'
        onClick={onClose}
        className='ml-auto inline-flex size-7 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700'
        aria-label='Bỏ chọn'
      >
        <X className='size-3.5' />
      </button>
    </div>
  );
}

// ── Per-kind editors ───────────────────────────────────────────────────────

function TextEditor({
  el,
  onChange,
}: {
  el: TextExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  return (
    <>
      <input
        value={el.content.text}
        onChange={e =>
          onChange({ content: { ...el.content, text: e.target.value } })
        }
        placeholder='Nội dung…'
        className='h-7 w-48 rounded-md bg-white px-2 text-xs ring-1 ring-neutral-200 placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900/15 focus:outline-none'
      />
      <Sep />
      <StyleControls el={el} onChange={onChange} />
    </>
  );
}

function EditTextEditor({
  el,
  onChange,
}: {
  el: EditTextExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  return (
    <>
      <InlineLabel label='Placeholder'>
        <input
          value={el.content.placeholder}
          onChange={e =>
            onChange({
              content: { ...el.content, placeholder: e.target.value },
            })
          }
          className='h-7 w-44 rounded-md bg-white px-2 text-xs ring-1 ring-neutral-200 focus:ring-2 focus:ring-neutral-900/15 focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Field'>
        <input
          value={el.content.fieldName}
          onChange={e =>
            onChange({ content: { ...el.content, fieldName: e.target.value } })
          }
          className='h-7 w-32 rounded-md bg-white px-2 font-mono text-[11px] ring-1 ring-neutral-200 focus:ring-2 focus:ring-neutral-900/15 focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Loại'>
        <select
          value={el.content.inputType}
          onChange={e =>
            onChange({
              content: {
                ...el.content,
                inputType: e.target
                  .value as EditTextExtraElement['content']['inputType'],
              },
            })
          }
          className='h-7 rounded-md bg-white px-2 text-xs ring-1 ring-neutral-200 focus:outline-none'
        >
          <option value='text'>text</option>
          <option value='email'>email</option>
          <option value='tel'>tel</option>
          <option value='number'>number</option>
          <option value='textarea'>textarea</option>
        </select>
      </InlineLabel>
      <label className='inline-flex items-center gap-1 text-[11px] text-neutral-600'>
        <input
          type='checkbox'
          checked={el.content.isRequired}
          onChange={e =>
            onChange({
              content: { ...el.content, isRequired: e.target.checked },
            })
          }
        />
        Bắt buộc
      </label>
    </>
  );
}

function PhotoEditor({
  el,
  onChange,
}: {
  el: PhotoExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  return (
    <>
      {/* ImagePicker currently returns a URL string — phase 1 stores that
          in `mediaId`. When BE media-upload pipeline lands, swap to the
          real media id from the upload response. */}
      <ImagePicker
        value={el.content.mediaId}
        onChange={url => onChange({ content: { ...el.content, mediaId: url } })}
      />
      <InlineLabel label='Alt'>
        <input
          value={el.content.alt ?? ''}
          onChange={e =>
            onChange({ content: { ...el.content, alt: e.target.value } })
          }
          className='h-7 w-40 rounded-md bg-white px-2 text-xs ring-1 ring-neutral-200 focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Fit'>
        <select
          value={el.style?.objectFit ?? 'cover'}
          onChange={e =>
            onChange({
              style: {
                ...el.style,
                objectFit: e.target.value as NonNullable<
                  ExtraElement['style']
                >['objectFit'],
              },
            })
          }
          className='h-7 rounded-md bg-white px-2 text-xs ring-1 ring-neutral-200 focus:outline-none'
        >
          <option value='cover'>cover</option>
          <option value='contain'>contain</option>
          <option value='fill'>fill</option>
          <option value='none'>none</option>
        </select>
      </InlineLabel>
    </>
  );
}

function VideoEditor({
  el,
  onChange,
}: {
  el: VideoExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  return (
    <>
      <InlineLabel label='Nguồn'>
        <select
          value={el.content.source}
          onChange={e =>
            onChange({
              content: {
                ...el.content,
                source: e.target.value as 'url' | 'media',
              },
            })
          }
          className='h-7 rounded-md bg-white px-2 text-xs ring-1 ring-neutral-200 focus:outline-none'
        >
          <option value='url'>URL</option>
          <option value='media'>Media</option>
        </select>
      </InlineLabel>
      {el.content.source === 'url' ? (
        <InlineLabel label='URL'>
          <input
            value={el.content.url ?? ''}
            onChange={e =>
              onChange({ content: { ...el.content, url: e.target.value } })
            }
            placeholder='https://youtube.com/embed/…'
            className='h-7 w-64 rounded-md bg-white px-2 text-xs ring-1 ring-neutral-200 focus:outline-none'
          />
        </InlineLabel>
      ) : (
        <ImagePicker
          value={el.content.mediaId ?? ''}
          onChange={url =>
            onChange({ content: { ...el.content, mediaId: url } })
          }
        />
      )}
      <label className='inline-flex items-center gap-1 text-[11px] text-neutral-600'>
        <input
          type='checkbox'
          checked={el.style?.controls ?? true}
          onChange={e =>
            onChange({ style: { ...el.style, controls: e.target.checked } })
          }
        />
        Controls
      </label>
      <label className='inline-flex items-center gap-1 text-[11px] text-neutral-600'>
        <input
          type='checkbox'
          checked={el.style?.autoplay ?? false}
          onChange={e =>
            onChange({ style: { ...el.style, autoplay: e.target.checked } })
          }
        />
        Autoplay
      </label>
    </>
  );
}

// ── Shared sub-controls ────────────────────────────────────────────────────

function StyleControls({
  el,
  onChange,
}: {
  el: ExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  const s = el.style ?? {};
  return (
    <>
      <InlineLabel label='Font'>
        <FontPicker
          value={s.fontFamily}
          onChange={fontId => onChange({ style: { ...s, fontFamily: fontId } })}
        />
      </InlineLabel>
      <InlineLabel label='Cỡ'>
        <input
          type='number'
          min={10}
          max={120}
          value={s.fontSize ?? ''}
          onChange={e => {
            const n = Number(e.target.value);
            if (Number.isNaN(n)) return;
            onChange({ style: { ...s, fontSize: n } });
          }}
          placeholder='—'
          className='h-7 w-12 rounded-md bg-white px-1.5 text-center font-mono text-[11px] ring-1 ring-neutral-200 focus:outline-none'
        />
      </InlineLabel>
      <input
        type='color'
        value={s.color ?? '#000000'}
        onChange={e => onChange({ style: { ...s, color: e.target.value } })}
        className='size-7 cursor-pointer rounded-md bg-white p-0.5 ring-1 ring-neutral-200'
        aria-label='Màu chữ'
      />
    </>
  );
}

function SizeEditor({
  element,
  onChange,
}: {
  element: ExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  return (
    <>
      <InlineLabel label='W'>
        <input
          type='number'
          min={1}
          value={element.size.width}
          onChange={e =>
            onChange({
              size: { ...element.size, width: Number(e.target.value) || 1 },
            })
          }
          className='h-7 w-14 rounded-md bg-white px-1.5 text-center font-mono text-[11px] ring-1 ring-neutral-200 focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='H'>
        <input
          type='number'
          min={1}
          value={element.size.height}
          onChange={e =>
            onChange({
              size: { ...element.size, height: Number(e.target.value) || 1 },
            })
          }
          className='h-7 w-14 rounded-md bg-white px-1.5 text-center font-mono text-[11px] ring-1 ring-neutral-200 focus:outline-none'
        />
      </InlineLabel>
    </>
  );
}

function InlineLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className='inline-flex items-center gap-1 text-[10px] tracking-wide text-neutral-500 uppercase'>
      {label}
      {children}
    </span>
  );
}

function Sep() {
  return <span className='h-4 w-px bg-neutral-200' aria-hidden />;
}

function TrackingPopover({
  tracking,
  onChange,
}: {
  tracking: ExtraElementTracking | undefined;
  onChange: (next: ExtraElementTracking | undefined) => void;
}) {
  const enabled = tracking?.enabled ?? !!tracking?.eventName;
  const set = (patch: Partial<ExtraElementTracking>) => {
    const next: ExtraElementTracking = { ...(tracking ?? {}), ...patch };
    onChange(next);
  };
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type='button'
          title='Tracking'
          aria-label='Tracking'
          className={cn(
            'inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium ring-1 transition-colors',
            enabled
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              : 'bg-white text-neutral-700 ring-neutral-200 hover:ring-neutral-300'
          )}
        >
          <BarChart3 className='size-3.5' />
          Tracking
          {enabled ? (
            <span className='size-1.5 rounded-full bg-emerald-500' />
          ) : null}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align='end'
          sideOffset={6}
          className='bg-background animate-in fade-in zoom-in-95 z-50 w-72 rounded-lg border shadow-lg'
        >
          <div className='flex items-center justify-between border-b px-3 py-2'>
            <span className='text-xs font-semibold'>Tracking event</span>
            <label className='inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-neutral-600'>
              <input
                type='checkbox'
                checked={enabled}
                onChange={e => set({ enabled: e.target.checked })}
              />
              Bật
            </label>
          </div>
          <div className='flex flex-col gap-2 p-3'>
            <label className='flex flex-col gap-1'>
              <span className='text-[10px] tracking-wide text-neutral-500 uppercase'>
                Tên sự kiện (event_name)
              </span>
              <input
                value={tracking?.eventName ?? ''}
                onChange={e => set({ eventName: e.target.value })}
                placeholder='vd: cta_click_hero'
                className='h-8 rounded-md bg-white px-2 font-mono text-[11px] ring-1 ring-neutral-200 placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900/15 focus:outline-none'
              />
            </label>
            <label className='flex flex-col gap-1'>
              <span className='text-[10px] tracking-wide text-neutral-500 uppercase'>
                Danh mục (category)
              </span>
              <input
                value={tracking?.eventCategory ?? ''}
                onChange={e => set({ eventCategory: e.target.value })}
                placeholder='engagement / cta / form_submit'
                className='h-8 rounded-md bg-white px-2 text-[11px] ring-1 ring-neutral-200 focus:ring-2 focus:ring-neutral-900/15 focus:outline-none'
              />
            </label>
            <p className='text-[10px] leading-4 text-neutral-500'>
              Khi public view tương tác element này, FE dispatch{' '}
              <code className='bg-neutral-100 px-1'>rexer:track</code> với{' '}
              <code className='bg-neutral-100 px-1'>detail.eventName</code>.
              Analytics provider (GA, Posthog…) subscribe để forward.
            </p>
            {tracking ? (
              <button
                type='button'
                onClick={() => onChange(undefined)}
                className='self-end text-[11px] text-red-600 hover:underline'
              >
                Xoá tracking
              </button>
            ) : null}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function ToolbarBtn({
  onClick,
  label,
  tone,
  children,
}: {
  onClick: () => void;
  label: string;
  tone?: 'danger';
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-md ring-1 transition-colors',
        tone === 'danger'
          ? 'bg-white text-red-600 ring-neutral-200 hover:bg-red-50 hover:ring-red-300'
          : 'bg-white text-neutral-700 ring-neutral-200 hover:bg-neutral-50 hover:ring-neutral-300'
      )}
    >
      {children}
    </button>
  );
}
