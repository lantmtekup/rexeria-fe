'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  BarChart3,
  Crosshair,
  Eraser,
  Hourglass,
  Image as ImageIcon,
  RotateCcw,
  SlidersHorizontal,
  SplitSquareHorizontal,
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
  CompareExtraElement,
  CountdownExtraElement,
  EditTextExtraElement,
  ExtraElement,
  ExtraElementKind,
  ExtraElementTracking,
  HotspotExtraElement,
  PhotoExtraElement,
  RangeExtraElement,
  RevealExtraElement,
  SpinWheelExtraElement,
  TextExtraElement,
  VideoExtraElement,
} from '@/components/modules/block-editor/types';

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
  hotspot: 'Hotspot',
  compare: 'So sánh ảnh',
  range: 'Slider giá trị',
  countdown: 'Countdown',
  reveal: 'Reveal',
  spin_wheel: 'Vòng quay',
};

const KIND_ICON: Record<
  ExtraElementKind,
  React.ComponentType<{ className?: string }>
> = {
  text: Type,
  edit_text: TextCursorInput,
  photo: ImageIcon,
  video: Video,
  hotspot: Crosshair,
  compare: SplitSquareHorizontal,
  range: SlidersHorizontal,
  countdown: Hourglass,
  reveal: Eraser,
  spin_wheel: RotateCcw,
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
    <div className='mx-3 mt-3 flex h-11 items-center gap-2.5 rounded-xl bg-[var(--pv2-paper)] px-3.5 text-xs shadow-[var(--pv2-sh-soft)] ring-1 ring-black/5 backdrop-blur-md'>
      <span className='inline-flex items-center gap-1.5 font-semibold text-[var(--pv2-electric)]'>
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
      ) : element.kind === 'video' ? (
        <VideoEditor el={element} onChange={onChange} />
      ) : element.kind === 'hotspot' ? (
        <HotspotEditor el={element} onChange={onChange} />
      ) : element.kind === 'compare' ? (
        <CompareEditor el={element} onChange={onChange} />
      ) : element.kind === 'range' ? (
        <RangeEditor el={element} onChange={onChange} />
      ) : element.kind === 'countdown' ? (
        <CountdownEditor el={element} onChange={onChange} />
      ) : element.kind === 'reveal' ? (
        <RevealEditor el={element} onChange={onChange} />
      ) : (
        <SpinWheelEditor el={element} onChange={onChange} />
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
        className='ml-auto inline-flex size-7 items-center justify-center rounded-md text-[var(--pv2-mut)] hover:bg-[var(--pv2-hair)] hover:text-[var(--pv2-ink)]'
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
  const patchContent = (p: Partial<TextExtraElement['content']>) =>
    onChange({ content: { ...el.content, ...p } });

  // Mode selector: plain | animation | counter | marquee — single dropdown
  // even though they map to different content fields, because they're
  // mutually exclusive in the renderer.
  const mode = el.content.counter
    ? 'counter'
    : el.content.marquee
      ? 'marquee'
      : el.content.animation && el.content.animation !== 'none'
        ? el.content.animation
        : 'none';
  return (
    <>
      <input
        value={el.content.text}
        onChange={e => patchContent({ text: e.target.value })}
        placeholder='Nội dung…'
        className='h-7 w-48 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] placeholder:text-[var(--pv2-faint)] focus:ring-2 focus:ring-[var(--pv2-electric)]/25 focus:outline-none'
      />
      <InlineLabel label='Hiệu ứng'>
        <select
          value={mode}
          onChange={e => {
            const v = e.target.value;
            // Switching modes wipes the OTHER mode's fields so they don't
            // linger in the payload after the user picks something else.
            if (v === 'counter') {
              patchContent({
                animation: undefined,
                marquee: undefined,
                counter: el.content.counter ?? { to: 100 },
              });
            } else if (v === 'marquee') {
              patchContent({
                animation: undefined,
                counter: undefined,
                marquee: el.content.marquee ?? {
                  speedSec: 12,
                  direction: 'left',
                },
              });
            } else if (v === 'none') {
              patchContent({
                animation: undefined,
                counter: undefined,
                marquee: undefined,
              });
            } else {
              patchContent({
                counter: undefined,
                marquee: undefined,
                animation: v as TextExtraElement['content']['animation'],
              });
            }
          }}
          className='h-7 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        >
          <option value='none'>Không</option>
          <option value='fade-up'>Fade up</option>
          <option value='typewriter'>Typewriter</option>
          <option value='split-slide-up'>Split slide-up</option>
          <option value='counter'>Counter</option>
          <option value='marquee'>Marquee</option>
        </select>
      </InlineLabel>
      {el.content.counter ? (
        <>
          <InlineLabel label='Từ'>
            <input
              type='number'
              value={el.content.counter.from ?? 0}
              onChange={e =>
                patchContent({
                  counter: {
                    ...el.content.counter!,
                    from: Number(e.target.value),
                  },
                })
              }
              className='h-7 w-20 rounded-md bg-[var(--pv2-paper)] px-2 text-xs tabular-nums ring-1 ring-[var(--pv2-hair)] focus:outline-none'
            />
          </InlineLabel>
          <InlineLabel label='Đến'>
            <input
              type='number'
              value={el.content.counter.to}
              onChange={e =>
                patchContent({
                  counter: {
                    ...el.content.counter!,
                    to: Number(e.target.value),
                  },
                })
              }
              className='h-7 w-24 rounded-md bg-[var(--pv2-paper)] px-2 text-xs tabular-nums ring-1 ring-[var(--pv2-hair)] focus:outline-none'
            />
          </InlineLabel>
          <InlineLabel label='Hậu tố'>
            <input
              value={el.content.counter.suffix ?? ''}
              onChange={e =>
                patchContent({
                  counter: { ...el.content.counter!, suffix: e.target.value },
                })
              }
              placeholder='+, %, ₫'
              className='h-7 w-16 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
            />
          </InlineLabel>
        </>
      ) : null}
      {el.content.marquee ? (
        <>
          <InlineLabel label='Speed (s)'>
            <input
              type='number'
              min={1}
              value={el.content.marquee.speedSec ?? 12}
              onChange={e =>
                patchContent({
                  marquee: {
                    ...el.content.marquee!,
                    speedSec: Number(e.target.value),
                  },
                })
              }
              className='h-7 w-16 rounded-md bg-[var(--pv2-paper)] px-2 text-xs tabular-nums ring-1 ring-[var(--pv2-hair)] focus:outline-none'
            />
          </InlineLabel>
          <InlineLabel label='Chiều'>
            <select
              value={el.content.marquee.direction ?? 'left'}
              onChange={e =>
                patchContent({
                  marquee: {
                    ...el.content.marquee!,
                    direction: e.target.value as 'left' | 'right',
                  },
                })
              }
              className='h-7 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
            >
              <option value='left'>← Trái</option>
              <option value='right'>→ Phải</option>
            </select>
          </InlineLabel>
        </>
      ) : null}
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
          className='h-7 w-44 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:ring-2 focus:ring-[var(--pv2-electric)]/25 focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Field'>
        <input
          value={el.content.fieldName}
          onChange={e =>
            onChange({ content: { ...el.content, fieldName: e.target.value } })
          }
          className='text-2xs h-7 w-32 rounded-md bg-[var(--pv2-paper)] px-2 font-mono ring-1 ring-[var(--pv2-hair)] focus:ring-2 focus:ring-[var(--pv2-electric)]/25 focus:outline-none'
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
          className='h-7 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        >
          <option value='text'>text</option>
          <option value='email'>email</option>
          <option value='tel'>tel</option>
          <option value='number'>number</option>
          <option value='textarea'>textarea</option>
        </select>
      </InlineLabel>
      <label className='text-2xs inline-flex items-center gap-1 text-[var(--pv2-mut)]'>
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
          className='h-7 w-40 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Mặt sau (flip)'>
        <ImagePicker
          value={el.content.flipMediaId ?? ''}
          onChange={url =>
            onChange({
              content: {
                ...el.content,
                flipMediaId: url || undefined,
              },
            })
          }
        />
      </InlineLabel>
      {el.content.flipMediaId ? (
        <InlineLabel label='Flip'>
          <select
            value={el.content.flipMode ?? 'tap'}
            onChange={e =>
              onChange({
                content: {
                  ...el.content,
                  flipMode: e.target.value as 'tap' | 'hover',
                },
              })
            }
            className='h-7 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
          >
            <option value='tap'>Tap để lật</option>
            <option value='hover'>Hover</option>
          </select>
        </InlineLabel>
      ) : null}
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
          className='h-7 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
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
          className='h-7 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
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
            className='h-7 w-64 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
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
      <label className='text-2xs inline-flex items-center gap-1 text-[var(--pv2-mut)]'>
        <input
          type='checkbox'
          checked={el.style?.controls ?? true}
          onChange={e =>
            onChange({ style: { ...el.style, controls: e.target.checked } })
          }
        />
        Controls
      </label>
      <label className='text-2xs inline-flex items-center gap-1 text-[var(--pv2-mut)]'>
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

function HotspotEditor({
  el,
  onChange,
}: {
  el: HotspotExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  return (
    <>
      <InlineLabel label='Pin'>
        <input
          value={el.content.pinLabel ?? ''}
          onChange={e =>
            onChange({ content: { ...el.content, pinLabel: e.target.value } })
          }
          placeholder='+'
          maxLength={3}
          className='h-7 w-10 rounded-md bg-[var(--pv2-paper)] px-1.5 text-center text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Tiêu đề'>
        <input
          value={el.content.title}
          onChange={e =>
            onChange({ content: { ...el.content, title: e.target.value } })
          }
          placeholder='Title popup'
          className='h-7 w-44 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Body'>
        <input
          value={el.content.body ?? ''}
          onChange={e =>
            onChange({ content: { ...el.content, body: e.target.value } })
          }
          placeholder='Nội dung popup'
          className='h-7 w-52 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Ảnh'>
        <input
          value={el.content.imageUrl ?? ''}
          onChange={e =>
            onChange({ content: { ...el.content, imageUrl: e.target.value } })
          }
          placeholder='https://...png'
          className='h-7 w-40 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='CTA'>
        <input
          value={el.content.ctaText ?? ''}
          onChange={e =>
            onChange({ content: { ...el.content, ctaText: e.target.value } })
          }
          placeholder='Nút (vd: Xem chi tiết)'
          className='h-7 w-32 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='URL'>
        <input
          value={el.content.ctaUrl ?? ''}
          onChange={e =>
            onChange({ content: { ...el.content, ctaUrl: e.target.value } })
          }
          placeholder='https://…'
          className='h-7 w-40 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <input
        type='color'
        value={el.style?.backgroundColor ?? '#ffffff'}
        onChange={e =>
          onChange({
            style: { ...el.style, backgroundColor: e.target.value },
          })
        }
        className='size-7 cursor-pointer rounded-md bg-[var(--pv2-paper)] p-0.5 ring-1 ring-[var(--pv2-hair)]'
        aria-label='Màu pin'
      />
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
          className='text-2xs h-7 w-12 rounded-md bg-[var(--pv2-paper)] px-1.5 text-center font-mono ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <input
        type='color'
        value={s.color ?? '#000000'}
        onChange={e => onChange({ style: { ...s, color: e.target.value } })}
        className='size-7 cursor-pointer rounded-md bg-[var(--pv2-paper)] p-0.5 ring-1 ring-[var(--pv2-hair)]'
        aria-label='Màu chữ'
      />
      <label
        className='text-2xs inline-flex items-center gap-1 text-[var(--pv2-mut)]'
        title='Glassmorphism — backdrop blur + tint trong'
      >
        <input
          type='checkbox'
          checked={!!s.glass}
          onChange={e => onChange({ style: { ...s, glass: e.target.checked } })}
        />
        Glass
      </label>
      <InlineLabel label='Beam'>
        <input
          type='color'
          value={s.beamColor ?? '#0ea5e9'}
          onChange={e =>
            onChange({ style: { ...s, beamColor: e.target.value } })
          }
          disabled={!s.beamColor}
          className='size-7 cursor-pointer rounded-md bg-[var(--pv2-paper)] p-0.5 ring-1 ring-[var(--pv2-hair)] disabled:opacity-40'
          aria-label='Màu beam'
        />
        <button
          type='button'
          onClick={() =>
            onChange({
              style: { ...s, beamColor: s.beamColor ? undefined : '#0ea5e9' },
            })
          }
          className={cn(
            'text-2xs h-7 cursor-pointer rounded-md px-2 ring-1',
            s.beamColor
              ? 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)] ring-[var(--pv2-electric)]'
              : 'bg-[var(--pv2-paper)] text-[var(--pv2-mut)] ring-[var(--pv2-hair)]'
          )}
        >
          {s.beamColor ? 'On' : 'Off'}
        </button>
      </InlineLabel>
    </>
  );
}

function CompareEditor({
  el,
  onChange,
}: {
  el: CompareExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  return (
    <>
      <InlineLabel label='Trước'>
        <input
          value={el.content.beforeUrl}
          onChange={e =>
            onChange({ content: { ...el.content, beforeUrl: e.target.value } })
          }
          placeholder='https://...png'
          className='h-7 w-40 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Sau'>
        <input
          value={el.content.afterUrl}
          onChange={e =>
            onChange({ content: { ...el.content, afterUrl: e.target.value } })
          }
          placeholder='https://...png'
          className='h-7 w-40 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Tỉ lệ %'>
        <input
          type='number'
          min={0}
          max={100}
          value={Math.round((el.content.defaultRatio ?? 0.5) * 100)}
          onChange={e => {
            const v = Math.max(0, Math.min(100, Number(e.target.value)));
            onChange({
              content: { ...el.content, defaultRatio: v / 100 },
            });
          }}
          className='h-7 w-16 rounded-md bg-[var(--pv2-paper)] px-2 text-xs tabular-nums ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
    </>
  );
}

function RangeEditor({
  el,
  onChange,
}: {
  el: RangeExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  const patch = (p: Partial<RangeExtraElement['content']>) =>
    onChange({ content: { ...el.content, ...p } });
  return (
    <>
      <InlineLabel label='Field'>
        <input
          value={el.content.fieldName}
          onChange={e => patch({ fieldName: e.target.value })}
          placeholder='range_value'
          className='h-7 w-32 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Label'>
        <input
          value={el.content.label ?? ''}
          onChange={e => patch({ label: e.target.value })}
          placeholder='Giá trị'
          className='h-7 w-28 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Min'>
        <input
          type='number'
          value={el.content.min}
          onChange={e => patch({ min: Number(e.target.value) })}
          className='h-7 w-16 rounded-md bg-[var(--pv2-paper)] px-2 text-xs tabular-nums ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Max'>
        <input
          type='number'
          value={el.content.max}
          onChange={e => patch({ max: Number(e.target.value) })}
          className='h-7 w-16 rounded-md bg-[var(--pv2-paper)] px-2 text-xs tabular-nums ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Step'>
        <input
          type='number'
          value={el.content.step ?? 1}
          onChange={e => patch({ step: Number(e.target.value) })}
          className='h-7 w-16 rounded-md bg-[var(--pv2-paper)] px-2 text-xs tabular-nums ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Default'>
        <input
          type='number'
          value={el.content.defaultValue ?? el.content.min}
          onChange={e => patch({ defaultValue: Number(e.target.value) })}
          className='h-7 w-16 rounded-md bg-[var(--pv2-paper)] px-2 text-xs tabular-nums ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Unit'>
        <input
          value={el.content.unit ?? ''}
          onChange={e => patch({ unit: e.target.value })}
          placeholder='m²'
          className='h-7 w-16 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
    </>
  );
}

function CountdownEditor({
  el,
  onChange,
}: {
  el: CountdownExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  const patch = (p: Partial<CountdownExtraElement['content']>) =>
    onChange({ content: { ...el.content, ...p } });
  // <input type="datetime-local"> wants a value in local time, no tz; we
  // store ISO with tz. Convert in both directions.
  const localValue = React.useMemo(() => {
    const d = new Date(el.content.targetIso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, [el.content.targetIso]);

  return (
    <>
      <InlineLabel label='Target'>
        <input
          type='datetime-local'
          value={localValue}
          onChange={e => {
            const d = new Date(e.target.value);
            if (Number.isNaN(d.getTime())) return;
            patch({ targetIso: d.toISOString() });
          }}
          className='h-7 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Label'>
        <input
          value={el.content.label ?? ''}
          onChange={e => patch({ label: e.target.value })}
          placeholder='Còn lại'
          className='h-7 w-28 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Hiển thị'>
        <select
          value={(
            el.content.units ?? ['days', 'hours', 'minutes', 'seconds']
          ).join(',')}
          onChange={e =>
            patch({
              units: e.target.value.split(
                ','
              ) as CountdownExtraElement['content']['units'],
            })
          }
          className='h-7 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        >
          <option value='days,hours,minutes,seconds'>Đầy đủ</option>
          <option value='days,hours,minutes'>Ngày · Giờ · Phút</option>
          <option value='hours,minutes,seconds'>Giờ · Phút · Giây</option>
          <option value='minutes,seconds'>Phút · Giây</option>
        </select>
      </InlineLabel>
      <InlineLabel label='Style'>
        <select
          value={el.content.style ?? 'flat'}
          onChange={e => patch({ style: e.target.value as 'flat' | 'flip' })}
          className='h-7 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        >
          <option value='flat'>Flat</option>
          <option value='flip'>Flip card</option>
        </select>
      </InlineLabel>
      <InlineLabel label='Hết hạn'>
        <input
          value={el.content.expiredText ?? ''}
          onChange={e => patch({ expiredText: e.target.value })}
          placeholder='Đã kết thúc'
          className='h-7 w-32 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
    </>
  );
}

function RevealEditor({
  el,
  onChange,
}: {
  el: RevealExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  const patch = (p: Partial<RevealExtraElement['content']>) =>
    onChange({ content: { ...el.content, ...p } });
  return (
    <>
      <InlineLabel label='Cover'>
        <input
          value={el.content.coverUrl}
          onChange={e => patch({ coverUrl: e.target.value })}
          placeholder='https://...png'
          className='h-7 w-40 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Reveal'>
        <input
          value={el.content.revealUrl}
          onChange={e => patch({ revealUrl: e.target.value })}
          placeholder='https://...png'
          className='h-7 w-40 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Mode'>
        <select
          value={el.content.mode}
          onChange={e =>
            patch({
              mode: e.target.value as RevealExtraElement['content']['mode'],
            })
          }
          className='h-7 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        >
          <option value='scratch'>Scratch (cào)</option>
          <option value='peel'>Peel (lột)</option>
          <option value='spotlight'>Spotlight</option>
          <option value='tap'>Tap để hiện</option>
        </select>
      </InlineLabel>
      <InlineLabel label='Brush (px)'>
        <input
          type='number'
          min={10}
          max={200}
          value={el.content.brushSize ?? 60}
          onChange={e => patch({ brushSize: Number(e.target.value) })}
          className='h-7 w-16 rounded-md bg-[var(--pv2-paper)] px-2 text-xs tabular-nums ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
    </>
  );
}

function SpinWheelEditor({
  el,
  onChange,
}: {
  el: SpinWheelExtraElement;
  onChange: (patch: Partial<ExtraElement>) => void;
}) {
  const patchSeg = (
    i: number,
    p: Partial<SpinWheelExtraElement['content']['segments'][number]>
  ) => {
    const next = el.content.segments.map((s, idx) =>
      idx === i ? { ...s, ...p } : s
    );
    onChange({ content: { ...el.content, segments: next } });
  };
  const removeSeg = (i: number) => {
    const next = el.content.segments.filter((_, idx) => idx !== i);
    onChange({ content: { ...el.content, segments: next } });
  };
  const addSeg = () => {
    const next = [
      ...el.content.segments,
      {
        id: `s_${Math.random().toString(36).slice(2, 7)}`,
        label: 'Mới',
        color: '#94a3b8',
      },
    ];
    onChange({ content: { ...el.content, segments: next } });
  };
  return (
    <>
      <InlineLabel label='Nút'>
        <input
          value={el.content.buttonLabel ?? ''}
          onChange={e =>
            onChange({
              content: { ...el.content, buttonLabel: e.target.value },
            })
          }
          placeholder='Quay'
          className='h-7 w-24 rounded-md bg-[var(--pv2-paper)] px-2 text-xs ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      <InlineLabel label='Spin (ms)'>
        <input
          type='number'
          min={500}
          step={500}
          value={el.content.spinDurationMs ?? 4000}
          onChange={e =>
            onChange({
              content: {
                ...el.content,
                spinDurationMs: Number(e.target.value),
              },
            })
          }
          className='h-7 w-20 rounded-md bg-[var(--pv2-paper)] px-2 text-xs tabular-nums ring-1 ring-[var(--pv2-hair)] focus:outline-none'
        />
      </InlineLabel>
      {/* Compact segment editor inline. For 6+ segments we'd want a popover
          but keeping it linear matches the rest of the toolbar's UX. */}
      <div className='flex items-center gap-1 overflow-x-auto'>
        {el.content.segments.map((s, i) => (
          <div
            key={s.id}
            className='flex items-center gap-1 rounded bg-[var(--pv2-paper)] px-1.5 py-0.5 ring-1 ring-[var(--pv2-hair)]'
          >
            <input
              type='color'
              value={s.color ?? '#94a3b8'}
              onChange={e => patchSeg(i, { color: e.target.value })}
              className='size-4 cursor-pointer rounded'
              aria-label={`Màu ô ${i + 1}`}
            />
            <input
              value={s.label}
              onChange={e => patchSeg(i, { label: e.target.value })}
              className='text-2xs h-5 w-16 bg-transparent focus:outline-none'
              placeholder={`Ô ${i + 1}`}
            />
            <input
              value={s.prize ?? ''}
              onChange={e => patchSeg(i, { prize: e.target.value })}
              className='text-3xs h-5 w-20 bg-transparent text-[var(--pv2-mut)] focus:outline-none'
              placeholder='prize'
            />
            <button
              type='button'
              onClick={() => removeSeg(i)}
              className='text-[var(--pv2-faint)] hover:text-[var(--pv2-error)]'
              aria-label={`Xoá ô ${i + 1}`}
            >
              <X className='size-3' />
            </button>
          </div>
        ))}
        <button
          type='button'
          onClick={addSeg}
          className='text-2xs h-6 rounded-md bg-[var(--pv2-canvas)] px-2 hover:bg-[var(--pv2-hair)]'
        >
          + Ô
        </button>
      </div>
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
          className='text-2xs h-7 w-14 rounded-md bg-[var(--pv2-paper)] px-1.5 text-center font-mono ring-1 ring-[var(--pv2-hair)] focus:outline-none'
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
          className='text-2xs h-7 w-14 rounded-md bg-[var(--pv2-paper)] px-1.5 text-center font-mono ring-1 ring-[var(--pv2-hair)] focus:outline-none'
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
    <span className='text-3xs inline-flex items-center gap-1 tracking-wide text-[var(--pv2-mut)] uppercase'>
      {label}
      {children}
    </span>
  );
}

function Sep() {
  return <span className='h-4 w-px bg-[var(--pv2-hair)]' aria-hidden />;
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
            'text-2xs inline-flex h-7 items-center gap-1 rounded-md px-2 font-medium ring-1 transition-colors',
            enabled
              ? 'bg-[color-mix(in_srgb,var(--pv2-success)_12%,transparent)] text-[var(--pv2-success)] ring-emerald-200'
              : 'bg-[var(--pv2-paper)] text-[var(--pv2-ink)] ring-[var(--pv2-hair)] hover:ring-[var(--pv2-slate-300)]'
          )}
        >
          <BarChart3 className='size-3.5' />
          Tracking
          {enabled ? (
            <span className='size-1.5 rounded-full bg-[var(--pv2-success)]' />
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
            <label className='text-2xs inline-flex cursor-pointer items-center gap-1.5 text-[var(--pv2-mut)]'>
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
              <span className='text-3xs tracking-wide text-[var(--pv2-mut)] uppercase'>
                Tên sự kiện (event_name)
              </span>
              <input
                value={tracking?.eventName ?? ''}
                onChange={e => set({ eventName: e.target.value })}
                placeholder='vd: cta_click_hero'
                className='text-2xs h-8 rounded-md bg-[var(--pv2-paper)] px-2 font-mono ring-1 ring-[var(--pv2-hair)] placeholder:text-[var(--pv2-faint)] focus:ring-2 focus:ring-[var(--pv2-electric)]/25 focus:outline-none'
              />
            </label>
            <label className='flex flex-col gap-1'>
              <span className='text-3xs tracking-wide text-[var(--pv2-mut)] uppercase'>
                Danh mục (category)
              </span>
              <input
                value={tracking?.eventCategory ?? ''}
                onChange={e => set({ eventCategory: e.target.value })}
                placeholder='engagement / cta / form_submit'
                className='text-2xs h-8 rounded-md bg-[var(--pv2-paper)] px-2 ring-1 ring-[var(--pv2-hair)] focus:ring-2 focus:ring-[var(--pv2-electric)]/25 focus:outline-none'
              />
            </label>
            <p className='text-3xs leading-4 text-[var(--pv2-mut)]'>
              Khi public view tương tác element này, FE dispatch{' '}
              <code className='bg-[var(--pv2-canvas)] px-1'>rexer:track</code>{' '}
              với{' '}
              <code className='bg-[var(--pv2-canvas)] px-1'>
                detail.eventName
              </code>
              . Analytics provider (GA, Posthog…) subscribe để forward.
            </p>
            {tracking ? (
              <button
                type='button'
                onClick={() => onChange(undefined)}
                className='text-2xs self-end text-red-600 hover:underline'
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
          ? 'bg-[var(--pv2-paper)] text-red-600 ring-[var(--pv2-hair)] hover:bg-red-50 hover:ring-red-300'
          : 'bg-[var(--pv2-paper)] text-[var(--pv2-ink)] ring-[var(--pv2-hair)] hover:bg-[var(--pv2-canvas)] hover:ring-[var(--pv2-slate-300)]'
      )}
    >
      {children}
    </button>
  );
}
