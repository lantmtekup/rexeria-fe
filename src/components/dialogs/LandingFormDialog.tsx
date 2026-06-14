'use client';

/**
 * Tạo / Sửa landing page (admin) — 2 chế độ:
 *  - Từ template: chọn template landing → BE tạo page từ template (canvas).
 *  - External link: nhập URL domain ngoài → page chỉ là link, click mở URL đó.
 *
 * External mode cần BE hỗ trợ `external_url` + cho tạo page không template
 * (docs/be-spec-external-landing-2026-06-07.md). Mode "từ template" chạy ngay.
 */

import * as React from 'react';
import { ExternalLink, LayoutTemplate } from 'lucide-react';
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
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Brand, Page, Template, Workspace } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

type Mode = 'template' | 'external';

function rxMsg(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Lỗi không xác định';
}

function isValidUrl(v: string): boolean {
  return /^https?:\/\/.+/i.test(v.trim());
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex-1 rounded-xl border p-3 text-left transition-colors',
        active
          ? 'border-zinc-900 bg-zinc-900 text-white'
          : 'border-border text-content-muted hover:bg-muted bg-white'
      )}
    >
      <div className='flex items-center gap-1.5 text-sm font-semibold'>
        {icon}
        {label}
      </div>
      <p
        className={cn(
          'text-3xs mt-0.5',
          active ? 'text-white/70' : 'text-muted-foreground'
        )}
      >
        {hint}
      </p>
    </button>
  );
}

/* ── Create ──────────────────────────────────────────────────────────────── */

export function CreateLandingDialog({
  open,
  brands,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  brands: Brand[];
  onOpenChange: (o: boolean) => void;
  onCreated: (page: Page) => void;
}) {
  const [mode, setMode] = React.useState<Mode>('template');
  const [name, setName] = React.useState('');
  const [brandId, setBrandId] = React.useState('');
  const [workspaceId, setWorkspaceId] = React.useState('');
  const [templateId, setTemplateId] = React.useState('');
  const [externalUrl, setExternalUrl] = React.useState('');

  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setMode('template');
    setName('');
    setBrandId('');
    setWorkspaceId('');
    setTemplateId('');
    setExternalUrl('');
    setWorkspaces([]);
    // Templates load 1 lần khi mở.
    rexerApi.templates
      .list({ limit: 200, status: 'active' })
      .then(r => setTemplates(r.items ?? []))
      .catch(() => setTemplates([]));
  }, [open]);

  // Brand đổi → load workspaces.
  React.useEffect(() => {
    if (!brandId) {
      setWorkspaces([]);
      setWorkspaceId('');
      return;
    }
    rexerApi.brands.workspaces
      .list(brandId)
      .then(r => {
        const items = r.items ?? [];
        setWorkspaces(items);
        // auto-chọn workspace mặc định / đầu tiên.
        const def = items.find(w => w.is_default) ?? items[0];
        setWorkspaceId(def?.id ?? '');
      })
      .catch(() => setWorkspaces([]));
  }, [brandId]);

  const submit = async () => {
    if (!name.trim()) return toast.error('Nhập tên landing');
    if (!brandId) return toast.error('Chọn brand');
    if (!workspaceId) return toast.error('Brand chưa có workspace');
    if (mode === 'template' && !templateId) return toast.error('Chọn template');
    if (mode === 'external' && !isValidUrl(externalUrl))
      return toast.error('Nhập URL hợp lệ (http/https)');

    setSaving(true);
    try {
      const page = await rexerApi.pages.create(workspaceId, {
        type: 'landing',
        name: name.trim(),
        ...(mode === 'template'
          ? { template_id: templateId }
          : { external_url: externalUrl.trim() }),
      });
      toast.success(`Đã tạo landing "${page.name}"`);
      onCreated(page);
      onOpenChange(false);
    } catch (err) {
      toast.error(`Tạo thất bại: ${rxMsg(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Tạo landing page</DialogTitle>
          <p className='text-content-muted text-xs'>
            Dựng từ template có canvas, hoặc đăng ký 1 link domain ngoài.
          </p>
        </DialogHeader>

        <div className='min-w-0 space-y-3'>
          {/* Mode */}
          <div className='flex gap-2'>
            <ModeTab
              active={mode === 'template'}
              onClick={() => setMode('template')}
              icon={<LayoutTemplate className='size-4' />}
              label='Từ template'
              hint='Dựng nội dung trong ReXeR'
            />
            <ModeTab
              active={mode === 'external'}
              onClick={() => setMode('external')}
              icon={<ExternalLink className='size-4' />}
              label='External link'
              hint='Trỏ tới domain có sẵn'
            />
          </div>

          <Field label='Tên landing'>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='VD: Tết 2026 — Mega Sale'
              className='mt-1'
            />
          </Field>

          <div className='grid grid-cols-2 gap-3'>
            <Field label='Brand'>
              <select
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
                className='border-border mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none'
              >
                <option value=''>Chọn brand…</option>
                {brands
                  // Chỉ brand đang hoạt động — ẩn suspended/inactive/deleted.
                  .filter(b => {
                    const s = b.status?.toLowerCase();
                    return !s || s === 'active';
                  })
                  .map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label='Workspace'>
              <select
                value={workspaceId}
                onChange={e => setWorkspaceId(e.target.value)}
                disabled={!brandId || workspaces.length === 0}
                className='border-border mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none disabled:opacity-50'
              >
                {workspaces.length === 0 ? (
                  <option value=''>—</option>
                ) : (
                  workspaces.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))
                )}
              </select>
            </Field>
          </div>

          {mode === 'template' ? (
            <Field label='Template'>
              <select
                value={templateId}
                onChange={e => setTemplateId(e.target.value)}
                className='border-border mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none'
              >
                <option value=''>Chọn template…</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label='Link domain'>
              <Input
                value={externalUrl}
                onChange={e => setExternalUrl(e.target.value)}
                placeholder='https://promo.tekup.vn'
                className='mt-1 font-mono'
              />
              <p className='text-3xs text-muted-foreground mt-1'>
                Click landing trong danh sách sẽ mở URL này (tab mới).
              </p>
            </Field>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='pill-light'
            size='sm'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Huỷ
          </Button>
          <Button variant='pill' size='sm' onClick={submit} disabled={saving}>
            {saving ? 'Đang tạo…' : 'Tạo landing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Edit ────────────────────────────────────────────────────────────────── */

export function EditLandingDialog({
  open,
  page,
  onOpenChange,
  onUpdated,
}: {
  open: boolean;
  page: Page | null;
  onOpenChange: (o: boolean) => void;
  onUpdated: (page: Page) => void;
}) {
  const isExternal = !!page?.external_url;
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [externalUrl, setExternalUrl] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open || !page) return;
    setName(page.name ?? '');
    setSlug(page.slug ?? '');
    setExternalUrl(page.external_url ?? '');
    setSaving(false);
  }, [open, page]);

  const submit = async () => {
    if (!page) return;
    if (!name.trim()) return toast.error('Nhập tên landing');
    if (isExternal && !isValidUrl(externalUrl))
      return toast.error('Nhập URL hợp lệ (http/https)');

    setSaving(true);
    try {
      const updated = await rexerApi.pages.update(page.id, {
        name: name.trim(),
        ...(slug.trim() ? { slug: slug.trim() } : {}),
        ...(isExternal ? { external_url: externalUrl.trim() } : {}),
      });
      toast.success('Đã cập nhật landing');
      onUpdated(updated);
      onOpenChange(false);
    } catch (err) {
      toast.error(`Lưu thất bại: ${rxMsg(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Sửa landing page</DialogTitle>
          <p className='text-content-muted text-xs'>
            {isExternal
              ? 'External landing — đổi tên / link domain.'
              : 'Đổi tên / slug. Nội dung sửa trong editor ("Mở landing").'}
          </p>
        </DialogHeader>

        <div className='min-w-0 space-y-3'>
          <Field label='Tên landing'>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className='mt-1'
            />
          </Field>

          {isExternal ? (
            <Field label='Link domain'>
              <Input
                value={externalUrl}
                onChange={e => setExternalUrl(e.target.value)}
                placeholder='https://promo.tekup.vn'
                className='mt-1 font-mono'
              />
            </Field>
          ) : (
            <Field label='Slug'>
              <Input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder='tet-2026-mega-sale'
                className='mt-1 font-mono'
              />
              <p className='text-3xs text-muted-foreground mt-1'>
                URL công khai: /p/{slug || '…'}
              </p>
            </Field>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='pill-light'
            size='sm'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Huỷ
          </Button>
          <Button variant='pill' size='sm' onClick={submit} disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
        {label}
      </Label>
      {children}
    </div>
  );
}
