'use client';

import { Sparkles, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  BrandCard,
  Field,
  ReadField,
  TextInput,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import {
  RoleTag,
  StatusPill,
} from '@/components/organisms/portal-v2/media/AssetPills';
import { AssetThumb } from '@/components/organisms/portal-v2/media/AssetThumb';
import {
  FUNNEL_ROLES,
  MEDIA_KINDS,
  MEDIA_STATUS,
} from '@/lib/portal-v2/media/constants';
import { homeLabel } from '@/lib/portal-v2/media/helpers';
import type {
  FunnelRoleId,
  MediaAsset,
  MediaStatusId,
} from '@/lib/portal-v2/media/types';
import { cn } from '@/lib/cn';

type AssetDetailModalProps = {
  asset: MediaAsset;
  editing: boolean;
  saving: boolean;
  onChange: (patch: Partial<MediaAsset>) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export const AssetDetailModal = ({
  asset,
  editing,
  saving,
  onChange,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onClose,
}: AssetDetailModalProps) => {
  const t = useTranslations('portalV2.media');
  const [tagDraft, setTagDraft] = useState('');
  const exp = asset.rights.expires;

  const addTag = () => {
    const value = tagDraft.trim();
    if (!value || asset.tags.includes(value)) {
      setTagDraft('');
      return;
    }
    onChange({ tags: [...asset.tags, value] });
    setTagDraft('');
  };

  const removeTag = (tag: string) => {
    onChange({ tags: asset.tags.filter(x => x !== tag) });
  };

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={editing ? t('editTitle', { name: asset.name }) : asset.name}
      subtitle={`${t(MEDIA_KINDS[asset.kind].labelKey)} · ${asset.dims} · ${asset.size} · v${asset.version} · ${asset.owner} · ${asset.updated}`}
      aria-label={t('detailAria', { name: asset.name })}
      footer={
        editing ? (
          <>
            <Button variant='ghost' disabled={saving} onClick={onCancel}>
              {t('cancel')}
            </Button>
            <Button
              variant='danger'
              size='sm'
              disabled={saving}
              onClick={onDelete}
            >
              <Trash2 className='size-[13px]' strokeWidth={2} aria-hidden />
              {t('delete')}
            </Button>
            <div className='grow' />
            <Button variant='primary' disabled={saving} onClick={onSave}>
              {t('saveChanges')}
            </Button>
          </>
        ) : (
          <>
            <Button variant='danger' size='sm' onClick={onDelete}>
              <Trash2 className='size-[13px]' strokeWidth={2} aria-hidden />
              {t('delete')}
            </Button>
            <div className='grow' />
            <Button variant='primary' onClick={onEdit}>
              {t('editMetadata')}
            </Button>
          </>
        )
      }
    >
      <div className='grid gap-6 lg:grid-cols-[1fr_280px]'>
        <div className='min-w-0'>
          <div className='relative mb-3.5 h-[200px] overflow-hidden rounded-[var(--pv2-r)]'>
            <AssetThumb
              asset={asset}
              className='h-full w-full'
              iconClassName='size-12'
            />
            <span className='absolute right-3 bottom-2.5 rounded-md bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm'>
              {asset.mime}
            </span>
          </div>

          <BrandCard title={t('sectionDescription')}>
            <Field label={t('fieldAlt')}>
              {editing ? (
                <TextTextarea
                  rows={2}
                  value={asset.alt}
                  onChange={e => onChange({ alt: e.target.value })}
                />
              ) : (
                <p className='text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                  {asset.alt}
                </p>
              )}
            </Field>
            <Field label={t('fieldCaption')} className='mb-0'>
              {editing ? (
                <TextInput
                  value={asset.caption}
                  onChange={e => onChange({ caption: e.target.value })}
                />
              ) : (
                <p className='text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                  {asset.caption}
                </p>
              )}
            </Field>
          </BrandCard>

          <BrandCard
            title={
              <span className='flex items-center justify-between gap-2'>
                {t('sectionTags')}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => toast.message(t('autoTagNotSupportedToast'))}
                >
                  <Sparkles className='size-3' strokeWidth={2.2} aria-hidden />
                  {t('retag')}
                </Button>
              </span>
            }
          >
            <div className='flex flex-wrap items-center gap-2'>
              {asset.tags.map(tag => (
                <span
                  key={tag}
                  className='inline-flex items-center gap-1 rounded-full bg-[var(--pv2-canvas)] px-2.5 py-1 text-[12px] font-medium text-[var(--pv2-ink)]'
                >
                  {tag}
                  {editing ? (
                    <button
                      type='button'
                      aria-label={t('removeTagAria', { tag })}
                      onClick={() => removeTag(tag)}
                      className='text-[var(--pv2-faint)] hover:text-[var(--pv2-error)]'
                    >
                      <X className='size-3' strokeWidth={2.4} aria-hidden />
                    </button>
                  ) : null}
                </span>
              ))}
              {editing ? (
                <input
                  value={tagDraft}
                  onChange={e => setTagDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  placeholder={t('addTagPlaceholder')}
                  className='min-w-[100px] flex-1 border-0 bg-transparent text-[12px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)]'
                />
              ) : null}
            </div>
          </BrandCard>

          <BrandCard
            title={t('sectionUsedIn')}
            hint={t('placesCount', { count: asset.links.length })}
          >
            {asset.links.length ? (
              <div className='divide-y divide-[var(--pv2-hair)] rounded-[12px] border border-[var(--pv2-hair)]'>
                {asset.links.map((link, i) => (
                  <div
                    key={`${link.type}-${i}`}
                    className='flex items-center gap-3 px-3.5 py-2.5'
                  >
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                        {link.label}
                      </span>
                      <span className='block truncate text-[11.5px] text-[var(--pv2-faint)]'>
                        {link.meta}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='rounded-[12px] bg-[var(--pv2-canvas)] px-4 py-5 text-[13px] text-[var(--pv2-faint)]'>
                {t('notUsedYet')}
              </div>
            )}
          </BrandCard>

          {asset.assisted ? (
            <div className='rounded-[var(--pv2-r)] bg-[var(--pv2-electric-soft)] px-4 py-4'>
              <div className='text-[10px] font-bold tracking-[0.06em] text-[var(--pv2-electric)] uppercase'>
                {t('assistedTag')}
              </div>
              <h3 className='mt-1 font-[family-name:var(--pv2-disp)] text-[15px] font-bold text-[var(--pv2-ink)]'>
                {t('assistedHeading', {
                  sessions: asset.assisted.sessions.toLocaleString(),
                  uses: asset.assisted.uses,
                })}
              </h3>
              <p className='mt-1.5 text-[12.5px] leading-relaxed text-[var(--pv2-ink)]'>
                {t('assistedBody', {
                  lift: `${asset.assisted.lift >= 0 ? '+' : '−'}${Math.abs(asset.assisted.lift * 100).toFixed(0)}%`,
                })}
              </p>
            </div>
          ) : (
            <div className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-4 py-4'>
              <h4 className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                {t('noSignalHeading')}
              </h4>
              <p className='mt-1 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {t('noSignalBody')}
              </p>
            </div>
          )}
        </div>

        <div className='min-w-0'>
          <BrandCard title={t('sectionStatus')}>
            {editing ? (
              <select
                value={asset.status}
                onChange={e =>
                  onChange({ status: e.target.value as MediaStatusId })
                }
                className={cn(
                  'w-full rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
                  'px-3.5 py-2.5 text-[14px] text-[var(--pv2-ink)] outline-none',
                  'focus:border-[var(--pv2-electric)] focus:ring-2 focus:ring-[var(--pv2-electric)]/15'
                )}
              >
                {Object.entries(MEDIA_STATUS).map(([id, meta]) => (
                  <option key={id} value={id}>
                    {t(meta.labelKey)}
                  </option>
                ))}
              </select>
            ) : (
              <StatusPill status={asset.status} />
            )}
            <div className='mt-3 space-y-2 text-[12.5px]'>
              <div className='flex justify-between gap-2'>
                <span className='text-[var(--pv2-mut)]'>{t('kvVersion')}</span>
                <span className='font-medium text-[var(--pv2-ink)]'>
                  v{asset.version}
                </span>
              </div>
              <div className='flex justify-between gap-2'>
                <span className='text-[var(--pv2-mut)]'>{t('kvOwner')}</span>
                <span className='font-medium text-[var(--pv2-ink)]'>
                  {asset.owner}
                </span>
              </div>
              <div className='flex justify-between gap-2'>
                <span className='text-[var(--pv2-mut)]'>{t('kvFolder')}</span>
                <span className='text-right font-medium text-[var(--pv2-ink)]'>
                  {homeLabel(asset)}
                </span>
              </div>
            </div>
          </BrandCard>

          <BrandCard title={t('sectionRights')}>
            <div className='space-y-2 text-[12.5px]'>
              <ReadField label={t('kvLicence')} value={asset.rights.licence} />
              <ReadField label={t('kvSource')} value={asset.rights.source} />
              <ReadField label={t('kvHolder')} value={asset.rights.holder} />
              <ReadField label={t('kvRelease')} value={asset.rights.release} />
              <ReadField
                label={t('kvTerritories')}
                value={asset.rights.territories}
              />
              <div>
                <span className='mb-1 block text-[13px] font-medium text-[var(--pv2-mut)]'>
                  {t('kvExpires')}
                </span>
                <span
                  className={cn(
                    'text-[14px] font-semibold',
                    exp
                      ? 'text-[var(--pv2-error)]'
                      : 'text-[var(--pv2-success)]'
                  )}
                >
                  {exp ?? t('kvNever')}
                </span>
              </div>
            </div>
            {exp ? (
              <p className='mt-3 rounded-[var(--pv2-r-sm)] bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--pv2-error)]'>
                {t('expiryWarning')}
              </p>
            ) : null}
          </BrandCard>

          <BrandCard title={t('sectionRole')}>
            {editing ? (
              <select
                value={asset.role}
                onChange={e =>
                  onChange({ role: e.target.value as FunnelRoleId })
                }
                className={cn(
                  'w-full rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
                  'px-3.5 py-2.5 text-[14px] text-[var(--pv2-ink)] outline-none',
                  'focus:border-[var(--pv2-electric)] focus:ring-2 focus:ring-[var(--pv2-electric)]/15'
                )}
              >
                {Object.entries(FUNNEL_ROLES).map(([id, meta]) => (
                  <option key={id} value={id}>
                    {t(meta.labelKey)}
                  </option>
                ))}
              </select>
            ) : (
              <RoleTag role={asset.role} />
            )}
            <p className='mt-2.5 text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('roleHint')}
            </p>
          </BrandCard>

          <BrandCard title={t('sectionTechnical')} last>
            <div className='space-y-2 text-[12.5px]'>
              <div className='flex justify-between gap-2'>
                <span className='text-[var(--pv2-mut)]'>{t('kvType')}</span>
                <span className='font-medium text-[var(--pv2-ink)]'>
                  {t(MEDIA_KINDS[asset.kind].labelKey)}
                </span>
              </div>
              <div className='flex justify-between gap-2'>
                <span className='text-[var(--pv2-mut)]'>{t('kvFormat')}</span>
                <span className='font-mono text-[11px] text-[var(--pv2-ink)]'>
                  {asset.mime}
                </span>
              </div>
              <div className='flex justify-between gap-2'>
                <span className='text-[var(--pv2-mut)]'>
                  {t('kvDimensions')}
                </span>
                <span className='font-medium text-[var(--pv2-ink)]'>
                  {asset.dims}
                </span>
              </div>
              <div className='flex justify-between gap-2'>
                <span className='text-[var(--pv2-mut)]'>{t('kvSize')}</span>
                <span className='font-medium text-[var(--pv2-ink)]'>
                  {asset.size}
                </span>
              </div>
            </div>
          </BrandCard>
        </div>
      </div>
    </Modal>
  );
};
