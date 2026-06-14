'use client';

import { Globe, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type { MicroSite, MicroSiteStatus } from '@/services/rexer/types';

import { STATUS_META } from './_data';

const STATUSES: MicroSiteStatus[] = ['live', 'dev', 'paused'];

/**
 * Dialog tạo/sửa micro-site — gọi **API thật** (`create`/`update`). `brandId` cần
 * cho tạo mới (endpoint yêu cầu brand_id); parent truyền brand của workspace đang
 * active. Khi lưu xong trả `MicroSite` thật về parent qua `onSaved`.
 */
export function CreateMicroSiteDialog({
  open,
  site,
  brandId,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  /** null = tạo mới; có giá trị = sửa. */
  site: MicroSite | null;
  brandId: string;
  onOpenChange: (open: boolean) => void;
  onSaved: (site: MicroSite) => void;
}) {
  const t = useTranslations('portal');
  const isEdit = !!site;
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<MicroSiteStatus>('dev');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(site?.name ?? '');
    setUrl(site?.url ?? '');
    setStatus((site?.status as MicroSiteStatus) ?? 'dev');
    setDescription(site?.description ?? '');
  }, [open, site]);

  const submit = async () => {
    if (!name.trim()) {
      toast.error(t('microSitesCreateMicroSiteDialog.nameRequired'));
      return;
    }
    if (status === 'live' && !url.trim()) {
      toast.error(t('microSitesCreateMicroSiteDialog.liveNeedsUrl'));
      return;
    }
    if (!isEdit && !brandId) {
      toast.error(t('microSitesCreateMicroSiteDialog.noBrand'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        url: url.trim() || undefined,
        status,
        description: description.trim() || undefined,
      };
      const saved = isEdit
        ? await rexerApi.microSites.update(site!.id, payload)
        : await rexerApi.microSites.create({ brand_id: brandId, ...payload });
      onSaved(saved);
      onOpenChange(false);
      toast.success(
        isEdit
          ? t('microSitesCreateMicroSiteDialog.savedToast', {
              name: saved.name,
            })
          : t('microSitesCreateMicroSiteDialog.addedToast', {
              name: saved.name,
            })
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t('microSitesCreateMicroSiteDialog.saveFailed')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <span className='flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white'>
              <Globe className='size-4' />
            </span>
            {isEdit
              ? t('microSitesCreateMicroSiteDialog.titleEdit')
              : t('microSitesCreateMicroSiteDialog.titleCreate')}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <Field
            label={t('microSitesCreateMicroSiteDialog.nameLabel')}
            required
          >
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('microSitesCreateMicroSiteDialog.namePlaceholder')}
              autoFocus
              maxLength={120}
            />
          </Field>

          <Field
            label={t('microSitesCreateMicroSiteDialog.urlLabel')}
            hint={t('microSitesCreateMicroSiteDialog.urlHint')}
          >
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder='https://abce.com'
              inputMode='url'
            />
          </Field>

          <div>
            <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
              {t('microSitesCreateMicroSiteDialog.statusLabel')}
            </Label>
            <div className='mt-1.5 grid grid-cols-3 gap-2'>
              {STATUSES.map(s => {
                const meta = STATUS_META[s];
                const active = status === s;
                return (
                  <button
                    key={s}
                    type='button'
                    onClick={() => setStatus(s)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                      active
                        ? 'border-primary bg-primary/5 text-foreground ring-primary/15 ring-2'
                        : 'border-border text-content-muted hover:bg-muted'
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', meta.dot)} />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label={t('microSitesCreateMicroSiteDialog.descriptionLabel')}>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder={t(
                'microSitesCreateMicroSiteDialog.descriptionPlaceholder'
              )}
              className='border-border placeholder:text-content-muted focus:border-primary w-full resize-none rounded-md border bg-white px-3 py-2 text-sm outline-none'
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            variant='pill-light'
            size='sm'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t('microSitesCreateMicroSiteDialog.cancel')}
          </Button>
          <Button
            variant='pill'
            size='sm'
            onClick={submit}
            disabled={!name.trim() || saving}
          >
            {saving && <Loader2 className='size-3.5 animate-spin' />}
            {isEdit
              ? t('microSitesCreateMicroSiteDialog.saveChanges')
              : t('microSitesCreateMicroSiteDialog.createButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
        {label} {required && <span className='text-rose-500'>*</span>}
      </Label>
      <div className='mt-1.5'>{children}</div>
      {hint && <p className='text-3xs text-content-muted mt-1'>{hint}</p>}
    </div>
  );
}
