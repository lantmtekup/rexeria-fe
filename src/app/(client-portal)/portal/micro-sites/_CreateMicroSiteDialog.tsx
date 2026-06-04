'use client';

import { Globe } from 'lucide-react';
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

import {
  SITE_GRADIENTS,
  STATUS_META,
  type MicroSite,
  type MicroSiteStatus,
} from './_data';

const STATUSES: MicroSiteStatus[] = ['live', 'dev', 'paused'];

export function CreateMicroSiteDialog({
  open,
  site,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  /** null = tạo mới; có giá trị = sửa. */
  site: MicroSite | null;
  onOpenChange: (open: boolean) => void;
  onSave: (site: MicroSite) => void;
}) {
  const isEdit = !!site;
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState<MicroSiteStatus>('dev');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(site?.name ?? '');
    setUrl(site?.url ?? '');
    setBrand(site?.brand_name ?? '');
    setStatus(site?.status ?? 'dev');
    setDescription(site?.description ?? '');
  }, [open, site]);

  const submit = () => {
    if (!name.trim()) {
      toast.error('Tên micro site không được rỗng');
      return;
    }
    if (status === 'live' && !url.trim()) {
      toast.error('Site Live cần có URL');
      return;
    }
    const next: MicroSite = {
      id: site?.id ?? `ms_${Date.now().toString(36)}`,
      name: name.trim(),
      url: url.trim(),
      brand_name: brand.trim() || undefined,
      status,
      description: description.trim() || undefined,
      cover_gradient:
        site?.cover_gradient ??
        SITE_GRADIENTS[Math.floor(Math.random() * SITE_GRADIENTS.length)],
      views_30d: site?.views_30d ?? 0,
      views_trend_pct: site?.views_trend_pct ?? 0,
      created_at: site?.created_at ?? new Date().toISOString(),
    };
    onSave(next);
    onOpenChange(false);
    toast.success(isEdit ? `Đã lưu "${next.name}"` : `Đã thêm "${next.name}"`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <span className='flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white'>
              <Globe className='size-4' />
            </span>
            {isEdit ? 'Sửa micro site' : 'Thêm micro site'}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <Field label='Tên' required>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='vd: ABCe'
              autoFocus
              maxLength={120}
            />
          </Field>

          <Field
            label='Domain / URL'
            hint='Site khách do Rexer code + host riêng'
          >
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder='https://abce.com'
              inputMode='url'
            />
          </Field>

          <Field label='Khách / Brand'>
            <Input
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder='vd: ACME Beverage Group'
            />
          </Field>

          <div>
            <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
              Trạng thái
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

          <Field label='Mô tả'>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder='(tuỳ chọn)'
              className='border-border placeholder:text-content-muted focus:border-primary w-full resize-none rounded-md border bg-white px-3 py-2 text-sm outline-none'
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            variant='pill-light'
            size='sm'
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button
            variant='pill'
            size='sm'
            onClick={submit}
            disabled={!name.trim()}
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo micro site'}
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
