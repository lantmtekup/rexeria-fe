'use client';

import { Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  BrandCard,
  Field,
  LineList,
  ReadField,
  TextInput,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import type {
  BrandColor,
  BrandData,
  BrandLogo,
} from '@/lib/portal-v2/brand/types';
import { errorMessage } from '@/services/portal-v2/_error';
import { fetchMediaByIds } from '@/services/portal-v2/mediaCatalog';
import { uploadMediaFile } from '@/services/portal-v2/mediaUpload';

type VisualPanelProps = {
  data: BrandData;
  editing: boolean;
  onChange: (next: BrandData) => void;
};

export const VisualPanel = ({ data, editing, onChange }: VisualPanelProps) => {
  const V = data.visual;
  /** Logo id currently mid-upload — disables its picker, shows a spinner. */
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  /**
   * Thumbnail (name + url) per logo id, keyed by MEDIA id (`BrandLogo.asset`)
   * — not logo id, so a logo already carrying an asset from a previous
   * session resolves to the same picture without a re-upload. A fresh upload
   * seeds this straight from `uploadMediaFile`'s response; an already-
   * attached logo (loaded from the saved profile, which only carries
   * `media_id` — see mapProfile.ts) resolves via the effect below.
   */
  const [previews, setPreviews] = useState<
    Record<string, { name: string; url?: string }>
  >({});
  const [lightbox, setLightbox] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const assetIds = [
    ...V.logos.map(l => l.asset),
    ...V.type.files,
    ...V.imagery.refs,
  ].filter((id): id is string => Boolean(id));
  const unresolvedIds = assetIds.filter(id => !(id in previews));
  // Re-run when the SET of unresolved ids changes, not on every `previews`
  // write from this same effect — a plain [assetIds] dep re-fires each
  // render (a new array), and depending on `previews` too would loop.
  const unresolvedKey = unresolvedIds.join(',');
  useEffect(() => {
    if (!unresolvedIds.length) return;
    let alive = true;
    void fetchMediaByIds(unresolvedIds).then(byId => {
      if (!alive) return;
      setPreviews(prev => {
        const next = { ...prev };
        for (const id of unresolvedIds) {
          const a = byId[id];
          next[id] = a ? { name: a.name, url: a.url } : { name: 'Attached' };
        }
        return next;
      });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unresolvedKey]);

  const patchVisual = (partial: Partial<typeof V>) => {
    onChange({ ...data, visual: { ...V, ...partial } });
  };

  const handleAddLogo = () => {
    const logo: BrandLogo = {
      id: `lg${Date.now()}`,
      n: '',
      use: '',
      asset: null,
    };
    patchVisual({ logos: [...V.logos, logo] });
  };

  /**
   * There used to be no picker here at all — just a read-only "no file
   * attached" badge — so a logo's `asset` could never become non-null, and
   * brandDataToPut() silently DROPS any logo without one (media_id is
   * required BE-side; the alternative was a 400 for the whole profile).
   * A user could type a name + "when it's used" and have it vanish on save
   * with zero indication why.
   */
  const handleAttachLogoFile = async (logoId: string, file: File) => {
    setUploadingId(logoId);
    try {
      const asset = await uploadMediaFile(file);
      const logos = V.logos.map(x =>
        x.id === logoId ? { ...x, asset: asset.id } : x
      );
      patchVisual({ logos });
      setPreviews(prev => ({
        ...prev,
        [asset.id]: { name: asset.name, url: asset.url },
      }));
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploadingId(null);
    }
  };

  /**
   * `type.files` (font files) và `imagery.refs` (ảnh tham chiếu) — trước đây
   * chỉ vẽ ra một badge "N attached"/"none attached" ĐỌC, không có input nào
   * để đính kèm: `BrandData` đã có chỗ lưu, chỉ thiếu đường vào. Cùng luồng
   * upload với logo (`uploadMediaFile`), khác ở chỗ đây là DANH SÁCH id, không
   * phải một slot.
   */
  const [uploadingList, setUploadingList] = useState<'files' | 'refs' | null>(
    null
  );
  const fontFilesInput = useRef<HTMLInputElement | null>(null);
  const refImagesInput = useRef<HTMLInputElement | null>(null);

  const handleAttachListFiles = async (
    list: 'files' | 'refs',
    files: FileList
  ) => {
    if (!files.length) return;
    setUploadingList(list);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(f => uploadMediaFile(f))
      );
      setPreviews(prev => {
        const next = { ...prev };
        for (const a of uploaded) next[a.id] = { name: a.name, url: a.url };
        return next;
      });
      const ids = uploaded.map(a => a.id);
      if (list === 'files') {
        patchVisual({ type: { ...V.type, files: [...V.type.files, ...ids] } });
      } else {
        patchVisual({
          imagery: { ...V.imagery, refs: [...V.imagery.refs, ...ids] },
        });
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploadingList(null);
    }
  };

  const handleRemoveListFile = (list: 'files' | 'refs', id: string) => {
    if (list === 'files') {
      patchVisual({
        type: { ...V.type, files: V.type.files.filter(x => x !== id) },
      });
    } else {
      patchVisual({
        imagery: { ...V.imagery, refs: V.imagery.refs.filter(x => x !== id) },
      });
    }
  };

  const handleAddColor = () => {
    const color: BrandColor = {
      id: `cl${Date.now()}`,
      n: '',
      hex: '#000000',
      role: '',
    };
    patchVisual({ colors: [...V.colors, color] });
  };

  return (
    <>
      <BrandCard
        title='Logos and variations'
        hint={
          <>
            One mark is not a system. Name each variation and say <b>when</b> it
            is used - an AI that is handed three files and no rule will pick the
            wrong one, confidently.
          </>
        }
      >
        <div className='flex flex-col gap-2'>
          {V.logos.map((l, i) => (
            <div
              key={l.id}
              className='flex items-center gap-3 rounded-[12px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3.5 py-3'
            >
              <span className='block h-16 w-[140px] shrink-0'>
                <input
                  ref={el => {
                    fileInputs.current[l.id] = el;
                  }}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={e => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) void handleAttachLogoFile(l.id, file);
                  }}
                />
                {l.asset && previews[l.asset]?.url ? (
                  <span className='group relative block size-full overflow-hidden rounded border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
                    <button
                      type='button'
                      onClick={() =>
                        setLightbox({
                          url: previews[l.asset!]!.url!,
                          name: previews[l.asset!]?.name || l.n || 'Logo',
                        })
                      }
                      className='block size-full cursor-zoom-in'
                      aria-label={`View full size — ${l.n || 'logo'}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previews[l.asset]!.url}
                        alt={l.n || previews[l.asset]?.name || ''}
                        className='size-full object-contain p-1'
                      />
                    </button>
                    {editing ? (
                      <button
                        type='button'
                        onClick={() => fileInputs.current[l.id]?.click()}
                        disabled={uploadingId === l.id}
                        aria-label={`Replace image — ${l.n || 'logo'}`}
                        className='absolute right-1 bottom-1 flex size-6 items-center justify-center rounded-full bg-[var(--pv2-ink)]/70 text-[var(--pv2-paper)] opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100'
                      >
                        {uploadingId === l.id ? (
                          <Loader2
                            className='size-3 animate-spin'
                            aria-hidden
                          />
                        ) : (
                          <Upload className='size-3' aria-hidden />
                        )}
                      </button>
                    ) : null}
                  </span>
                ) : editing ? (
                  <button
                    type='button'
                    onClick={() => fileInputs.current[l.id]?.click()}
                    disabled={uploadingId === l.id}
                    className='flex size-full items-center justify-center gap-1.5 truncate rounded border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2 py-1.5 text-[11.5px] font-semibold text-[var(--pv2-faint)] transition-colors hover:border-[var(--pv2-electric)] hover:text-[var(--pv2-electric)] disabled:opacity-60'
                  >
                    {uploadingId === l.id ? (
                      <Loader2 className='size-3.5 animate-spin' aria-hidden />
                    ) : (
                      <>
                        <Upload className='size-3 shrink-0' aria-hidden />
                        <span className='truncate'>
                          {l.asset
                            ? (previews[l.asset]?.name ?? 'Attached')
                            : 'Attach image'}
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className='flex size-full items-center truncate rounded border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2 py-1.5 text-[11.5px] font-semibold text-[var(--pv2-faint)]'>
                    {l.asset
                      ? (previews[l.asset]?.name ?? 'Attached')
                      : 'no file attached'}
                  </span>
                )}
              </span>
              <span className='flex min-w-0 flex-1 flex-col gap-1'>
                {editing ? (
                  <>
                    <TextInput
                      value={l.n}
                      placeholder='Name it'
                      className='py-1.5 text-[12.5px]'
                      onChange={e => {
                        const logos = V.logos.map((x, idx) =>
                          idx === i ? { ...x, n: e.target.value } : x
                        );
                        patchVisual({ logos });
                      }}
                    />
                    <TextInput
                      value={l.use}
                      placeholder='When is this one used?'
                      className='py-1.5 text-[12.5px]'
                      onChange={e => {
                        const logos = V.logos.map((x, idx) =>
                          idx === i ? { ...x, use: e.target.value } : x
                        );
                        patchVisual({ logos });
                      }}
                    />
                    {!l.asset ? (
                      <i className='text-[11px] text-[var(--pv2-warning)] not-italic'>
                        Attach an image to keep this — unattached variations are
                        not saved.
                      </i>
                    ) : null}
                  </>
                ) : (
                  <>
                    <b className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                      {l.n || (
                        <i className='font-normal text-[var(--pv2-faint)] not-italic'>
                          not set
                        </i>
                      )}
                    </b>
                    <i className='text-[11.5px] leading-snug text-[var(--pv2-mut)] not-italic'>
                      {l.use || '-'}
                    </i>
                  </>
                )}
              </span>
              {editing ? (
                <Button
                  variant='danger'
                  size='icon'
                  aria-label={`Delete ${l.n || 'logo'}`}
                  onClick={() =>
                    patchVisual({ logos: V.logos.filter(x => x.id !== l.id) })
                  }
                >
                  <Trash2 className='size-3.5' aria-hidden />
                </Button>
              ) : null}
            </div>
          ))}
          {editing ? (
            <Button variant='dashed' size='sm' onClick={handleAddLogo}>
              <Plus className='size-3.5' aria-hidden />
              Add a variation
            </Button>
          ) : null}
        </div>
        {!V.logos.length ? (
          <div className='mt-2 text-[13px] text-[var(--pv2-faint)]'>
            No marks on file. Every generated page will set your name in the
            body font.
          </div>
        ) : null}
      </BrandCard>

      <BrandCard
        title='Colour'
        hint={
          <>
            Give each one a <b>job</b>, not just a name. &quot;Accent&quot;
            tells the generator it may appear once; &quot;#C8785B&quot; tells it
            nothing at all.
          </>
        }
      >
        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
          {V.colors.map((c, i) => (
            <div
              key={c.id}
              className='flex items-center gap-2.5 rounded-[12px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-3'
            >
              <span
                className='size-[38px] shrink-0 rounded-[9px] border border-[var(--pv2-hair)]'
                style={{ background: c.hex }}
                aria-hidden
              />
              <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
                {editing ? (
                  <>
                    <TextInput
                      value={c.n}
                      placeholder='Name'
                      className='py-1 text-[12px]'
                      onChange={e => {
                        const colors = V.colors.map((x, idx) =>
                          idx === i ? { ...x, n: e.target.value } : x
                        );
                        patchVisual({ colors });
                      }}
                    />
                    <TextInput
                      value={c.hex}
                      placeholder='#000000'
                      className='py-1 font-mono text-[11px]'
                      onChange={e => {
                        const colors = V.colors.map((x, idx) =>
                          idx === i ? { ...x, hex: e.target.value } : x
                        );
                        patchVisual({ colors });
                      }}
                    />
                    <TextInput
                      value={c.role}
                      placeholder='What is it for?'
                      className='py-1 text-[12px]'
                      onChange={e => {
                        const colors = V.colors.map((x, idx) =>
                          idx === i ? { ...x, role: e.target.value } : x
                        );
                        patchVisual({ colors });
                      }}
                    />
                  </>
                ) : (
                  <>
                    <b className='text-[12.5px] font-semibold'>{c.n}</b>
                    <code className='font-mono text-[11px] text-[var(--pv2-mut)]'>
                      {c.hex}
                    </code>
                    <i className='text-[11px] text-[var(--pv2-faint)] not-italic'>
                      {c.role}
                    </i>
                  </>
                )}
              </span>
              {editing ? (
                <Button
                  variant='danger'
                  size='icon'
                  aria-label={`Delete ${c.n || 'colour'}`}
                  onClick={() =>
                    patchVisual({
                      colors: V.colors.filter(x => x.id !== c.id),
                    })
                  }
                >
                  <Trash2 className='size-3.5' aria-hidden />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        {editing ? (
          <Button
            variant='dashed'
            size='sm'
            className='mt-2.5'
            onClick={handleAddColor}
          >
            <Plus className='size-3.5' aria-hidden />
            Add a colour
          </Button>
        ) : null}
        {!V.colors.length ? (
          <div className='mt-2 text-[13px] text-[var(--pv2-faint)]'>
            No palette on file.
          </div>
        ) : null}
      </BrandCard>

      <BrandCard
        title='Typography'
        hint='The weights you name are the weights that exist. Everything you leave out is forbidden - which is the point.'
      >
        <div className='grid gap-0 sm:grid-cols-2 sm:gap-4'>
          {editing ? (
            <>
              <Field label='Display typeface'>
                <TextInput
                  value={V.type.display}
                  placeholder='Headlines and hooks'
                  onChange={e =>
                    patchVisual({
                      type: { ...V.type, display: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label='Body typeface'>
                <TextInput
                  value={V.type.body}
                  placeholder='Everything else'
                  onChange={e =>
                    patchVisual({ type: { ...V.type, body: e.target.value } })
                  }
                />
              </Field>
            </>
          ) : (
            <>
              <ReadField label='Display typeface' value={V.type.display} />
              <ReadField label='Body typeface' value={V.type.body} />
            </>
          )}
        </div>
        {editing ? (
          <>
            <Field label='Weights in use'>
              <TextInput
                value={V.type.weights}
                placeholder='Which cuts - and, by omission, which are forbidden'
                onChange={e =>
                  patchVisual({
                    type: { ...V.type, weights: e.target.value },
                  })
                }
              />
            </Field>
            <Field label='Type scale'>
              <TextInput
                value={V.type.scale}
                placeholder='The ratio, and how many sizes may appear on one screen'
                onChange={e =>
                  patchVisual({ type: { ...V.type, scale: e.target.value } })
                }
              />
            </Field>
          </>
        ) : (
          <>
            <ReadField label='Weights in use' value={V.type.weights} />
            <ReadField label='Type scale' value={V.type.scale} />
          </>
        )}
        <div>
          <span className='mb-1.5 block text-[11.5px] font-semibold tracking-[0.02em] text-[var(--pv2-mut)] uppercase'>
            Font files
          </span>
          <input
            ref={fontFilesInput}
            type='file'
            accept='.ttf,.otf,.woff,.woff2'
            multiple
            className='hidden'
            onChange={e => {
              const files = e.target.files;
              e.target.value = '';
              if (files?.length) void handleAttachListFiles('files', files);
            }}
          />
          <div className='flex flex-wrap items-center gap-1.5'>
            {V.type.files.map(id => (
              <span
                key={id}
                className='inline-flex items-center gap-1.5 rounded border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2 py-1.5 text-[11.5px] text-[var(--pv2-mut)]'
              >
                {previews[id]?.name ?? 'Attached'}
                {editing ? (
                  <button
                    type='button'
                    aria-label='Remove font file'
                    onClick={() => handleRemoveListFile('files', id)}
                    className='text-[var(--pv2-faint)] hover:text-[var(--pv2-error)]'
                  >
                    <Trash2 className='size-3' aria-hidden />
                  </button>
                ) : null}
              </span>
            ))}
            {!V.type.files.length && !editing ? (
              <span className='inline-flex items-center rounded border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2 py-1.5 text-[11.5px] text-[var(--pv2-faint)]'>
                none attached
              </span>
            ) : null}
            {editing ? (
              <Button
                variant='dashed'
                size='sm'
                disabled={uploadingList === 'files'}
                onClick={() => fontFilesInput.current?.click()}
              >
                {uploadingList === 'files' ? (
                  <Loader2 className='size-3 animate-spin' aria-hidden />
                ) : (
                  <Upload className='size-3' aria-hidden />
                )}
                Attach font file
              </Button>
            ) : null}
          </div>
        </div>
      </BrandCard>

      <BrandCard
        title='Layout principles'
        hint='The rules a page may not break. These are the most portable thing in this workspace - a principle survives a rebrand, a hex code does not.'
      >
        <LineList
          items={V.layout}
          editing={editing}
          hint='One principle per line · each becomes a constraint on every generated block'
          empty='Nothing on file. Every generated page will be laid out by whatever the model saw last.'
          onChange={lines => patchVisual({ layout: lines })}
        />
      </BrandCard>

      <BrandCard
        title='Imagery and art direction'
        hint='What a photograph must be, and what it must never be. The second half is the useful half.'
        last
      >
        {editing ? (
          <Field label='Art direction'>
            <TextTextarea
              rows={3}
              value={V.imagery.direction}
              onChange={e =>
                patchVisual({
                  imagery: { ...V.imagery, direction: e.target.value },
                })
              }
            />
          </Field>
        ) : (
          <ReadField label='Art direction' value={V.imagery.direction} />
        )}
        <div>
          <span className='mb-1.5 block text-[11.5px] font-semibold tracking-[0.02em] text-[var(--pv2-mut)] uppercase'>
            Reference images
          </span>
          <input
            ref={refImagesInput}
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            onChange={e => {
              const files = e.target.files;
              e.target.value = '';
              if (files?.length) void handleAttachListFiles('refs', files);
            }}
          />
          <div className='flex flex-wrap items-center gap-1.5'>
            {V.imagery.refs.map(id => {
              const preview = previews[id];
              return (
                <span
                  key={id}
                  className='group relative size-14 shrink-0 overflow-hidden rounded border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
                >
                  {preview?.url ? (
                    <button
                      type='button'
                      onClick={() =>
                        setLightbox({
                          url: preview.url!,
                          name: preview.name || 'Reference image',
                        })
                      }
                      className='block size-full cursor-zoom-in'
                      aria-label={`View full size — ${preview.name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className='size-full object-cover'
                      />
                    </button>
                  ) : (
                    <span className='flex size-full items-center justify-center px-1 text-center text-[9.5px] text-[var(--pv2-faint)]'>
                      {preview?.name ?? 'Attached'}
                    </span>
                  )}
                  {editing ? (
                    <button
                      type='button'
                      aria-label='Remove reference image'
                      onClick={() => handleRemoveListFile('refs', id)}
                      className='absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--pv2-ink)]/70 text-[var(--pv2-paper)] opacity-0 transition-opacity group-hover:opacity-100'
                    >
                      <Trash2 className='size-2.5' aria-hidden />
                    </button>
                  ) : null}
                </span>
              );
            })}
            {!V.imagery.refs.length && !editing ? (
              <span className='inline-flex items-center rounded border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2 py-1.5 text-[11.5px] text-[var(--pv2-faint)]'>
                none attached
              </span>
            ) : null}
            {editing ? (
              <button
                type='button'
                disabled={uploadingList === 'refs'}
                onClick={() => refImagesInput.current?.click()}
                className='flex size-14 shrink-0 items-center justify-center rounded border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-faint)] transition-colors hover:border-[var(--pv2-electric)] hover:text-[var(--pv2-electric)] disabled:opacity-60'
                aria-label='Attach reference image'
              >
                {uploadingList === 'refs' ? (
                  <Loader2 className='size-3.5 animate-spin' aria-hidden />
                ) : (
                  <Plus className='size-3.5' aria-hidden />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </BrandCard>

      {lightbox ? (
        <Modal
          open
          onClose={() => setLightbox(null)}
          title={lightbox.name}
          wide
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.url}
            alt={lightbox.name}
            className='max-h-[70vh] w-full rounded-[var(--pv2-r-sm)] object-contain'
          />
        </Modal>
      ) : null}
    </>
  );
};
