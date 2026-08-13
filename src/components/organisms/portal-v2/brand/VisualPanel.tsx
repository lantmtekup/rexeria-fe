'use client';

import { Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useRef, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  BrandCard,
  Field,
  LineList,
  ReadField,
  TextInput,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import { cn } from '@/lib/cn';
import type {
  BrandColor,
  BrandData,
  BrandLogo,
} from '@/lib/portal-v2/brand/types';
import { errorMessage } from '@/services/portal-v2/_error';
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
   * Uploaded filename per logo id, THIS SESSION ONLY. `BrandLogo.asset` is
   * just the media id (mapProfile ↔ BE `media_id`) — the profile round-trip
   * carries no filename, so after a reload the badge falls back to "Attached".
   */
  const [names, setNames] = useState<Record<string, string>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

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
      setNames(prev => ({ ...prev, [logoId]: asset.name }));
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploadingId(null);
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
              <span className='w-[140px] shrink-0'>
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
                {editing ? (
                  <button
                    type='button'
                    onClick={() => fileInputs.current[l.id]?.click()}
                    disabled={uploadingId === l.id}
                    className='flex w-full items-center justify-center gap-1.5 truncate rounded border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2 py-1.5 text-[11.5px] font-semibold text-[var(--pv2-faint)] transition-colors hover:border-[var(--pv2-electric)] hover:text-[var(--pv2-electric)] disabled:opacity-60'
                  >
                    {uploadingId === l.id ? (
                      <Loader2 className='size-3.5 animate-spin' aria-hidden />
                    ) : (
                      <>
                        <Upload className='size-3 shrink-0' aria-hidden />
                        <span className='truncate'>
                          {l.asset
                            ? (names[l.id] ?? 'Attached')
                            : 'Attach image'}
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className='block truncate rounded border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2 py-1.5 text-[11.5px] font-semibold text-[var(--pv2-faint)]'>
                    {l.asset ? (names[l.id] ?? 'Attached') : 'no file attached'}
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
          <span
            className={cn(
              'inline-flex items-center rounded border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2 py-1.5 text-[11.5px] text-[var(--pv2-faint)]'
            )}
          >
            {V.type.files.length
              ? `${V.type.files.length} attached`
              : 'none attached'}
          </span>
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
          <span className='inline-flex items-center rounded border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2 py-1.5 text-[11.5px] text-[var(--pv2-faint)]'>
            {V.imagery.refs.length
              ? `${V.imagery.refs.length} attached`
              : 'none attached'}
          </span>
        </div>
      </BrandCard>
    </>
  );
};
