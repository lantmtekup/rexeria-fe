'use client';

/**
 * Tab "Microsite" trong màn quản lý khách hàng. Mirror /portal/micro-sites —
 * Rexer code site riêng cho khách (a.com, b.com…); platform chỉ QUẢN LÝ danh
 * sách + thông tin chung + views. Staff đăng ký/sửa cho khách.
 * BE: spec §B — list /portal/micro-sites?brand_id; write /admin/micro-sites.
 */

import * as React from 'react';
import {
  ExternalLink,
  Globe,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
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

import { MicroSiteManageDialog } from './MicroSiteManageDialog';

interface MicroSiteForm {
  name: string;
  url: string;
  status: MicroSiteStatus;
  description: string;
}

const STATUS_META: Record<MicroSiteStatus, { label: string; chip: string }> = {
  live: { label: 'Live', chip: 'bg-emerald-100 text-emerald-700' },
  dev: { label: 'Đang dev', chip: 'bg-amber-100 text-amber-700' },
  paused: { label: 'Tạm dừng', chip: 'bg-muted text-content-muted' },
};

function statusMeta(s: string) {
  return STATUS_META[
    (s as MicroSiteStatus) in STATUS_META ? (s as MicroSiteStatus) : 'dev'
  ];
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export function MicroSitesTab({
  clientId,
  onCount,
}: {
  clientId: string;
  onCount: (n: number) => void;
}) {
  const [sites, setSites] = React.useState<MicroSite[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<MicroSite | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [managing, setManaging] = React.useState<MicroSite | null>(null);
  // Page-count badges — fetched per site from /portal/micro-sites/{id}/pages.
  const [pageCounts, setPageCounts] = React.useState<Record<string, number>>(
    {}
  );

  const refreshPageCounts = React.useCallback(async (list: MicroSite[]) => {
    const entries = await Promise.all(
      list.map(async s => {
        try {
          const pages = await rexerApi.microSites.listPages(s.id);
          return [s.id, pages.length] as const;
        } catch {
          return [s.id, 0] as const;
        }
      })
    );
    setPageCounts(Object.fromEntries(entries));
  }, []);

  const onCountRef = React.useRef(onCount);
  onCountRef.current = onCount;
  React.useEffect(() => onCountRef.current(sites.length), [sites.length]);

  const reload = React.useCallback(() => {
    setLoading(true);
    rexerApi.microSites
      .list({ brand_id: clientId, limit: 100 })
      .then(res => {
        const items = res.items ?? [];
        setSites(items);
        refreshPageCounts(items);
      })
      .catch(() => toast.error('Không tải được danh sách micro-site'))
      .finally(() => setLoading(false));
  }, [clientId, refreshPageCounts]);

  React.useEffect(() => reload(), [reload]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (s: MicroSite) => {
    setEditing(s);
    setDialogOpen(true);
  };

  const handleSave = async (data: MicroSiteForm) => {
    try {
      if (editing) {
        const updated = await rexerApi.microSites.update(editing.id, data);
        setSites(prev => prev.map(s => (s.id === editing.id ? updated : s)));
        toast.success(`Đã cập nhật "${updated.name}"`);
      } else {
        const created = await rexerApi.microSites.create({
          brand_id: clientId,
          ...data,
        });
        setSites(prev => [created, ...prev]);
        toast.success(`Đã thêm micro-site "${created.name}"`);
      }
      setDialogOpen(false);
    } catch {
      toast.error('Lưu thất bại, kiểm tra lại thông tin');
    }
  };

  const handleDelete = async (s: MicroSite) => {
    if (!window.confirm(`Xoá micro-site "${s.name}"?`)) return;
    try {
      await rexerApi.microSites.remove(s.id);
      setSites(prev => prev.filter(x => x.id !== s.id));
      toast.success('Đã xoá');
    } catch {
      toast.error('Xoá thất bại');
    }
  };

  return (
    <div>
      <div className='border-border flex items-center justify-between border-b px-4 py-3'>
        <div className='text-content-muted text-xs'>
          Site Rexer code riêng cho khách (host riêng). Đăng ký để quản lý &
          theo dõi views.
        </div>
        <Button size='sm' className='shrink-0' onClick={openNew}>
          <Plus className='size-3.5' /> Thêm micro-site
        </Button>
      </div>

      {loading ? (
        <div className='text-content-muted flex items-center justify-center gap-2 px-4 py-10 text-sm'>
          <Loader2 className='size-4 animate-spin' /> Đang tải…
        </div>
      ) : sites.length === 0 ? (
        <div className='text-content-muted px-4 py-10 text-center text-sm'>
          Khách chưa có micro-site nào, bấm <strong>Thêm micro-site</strong>.
        </div>
      ) : (
        <div>
          {sites.map(s => (
            <div
              key={s.id}
              className='border-border hover:bg-muted/40 flex items-start gap-3 border-b px-4 py-3 last:border-0'
            >
              <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm'>
                <Globe className='size-5' />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-foreground text-sm font-semibold'>
                    {s.name}
                  </span>
                  <span
                    className={cn(
                      'text-3xs rounded-full px-2 py-0.5 font-bold tracking-wider uppercase',
                      statusMeta(s.status).chip
                    )}
                  >
                    {statusMeta(s.status).label}
                  </span>
                </div>
                {s.url ? (
                  <a
                    href={s.url}
                    target='_blank'
                    rel='noreferrer'
                    className='text-3xs text-content-muted hover:text-foreground mt-0.5 inline-flex items-center gap-1 font-mono hover:underline'
                  >
                    {s.url} <ExternalLink className='size-2.5' />
                  </a>
                ) : (
                  <span className='text-3xs text-muted-foreground mt-0.5 block font-mono'>
                    chưa có URL
                  </span>
                )}
                {s.description && (
                  <p className='text-2xs text-content-muted mt-1 line-clamp-1'>
                    {s.description}
                  </p>
                )}
              </div>
              <div className='shrink-0 text-right'>
                <div className='text-foreground font-mono text-sm font-bold tabular-nums'>
                  {fmt(s.views_30d)}
                </div>
                <div className='text-3xs text-muted-foreground'>views 30d</div>
              </div>
              <div className='flex shrink-0 items-center gap-1'>
                <Button
                  variant='neutral'
                  size='xs'
                  onClick={() => setManaging(s)}
                  aria-label='Quản lý page & số liệu'
                >
                  <Layers className='size-3.5' /> Quản lý
                  {pageCounts[s.id] ? (
                    <span className='bg-muted text-3xs ml-0.5 rounded-full px-1.5 py-0.5 font-bold'>
                      {pageCounts[s.id]}
                    </span>
                  ) : null}
                </Button>
                <button
                  type='button'
                  onClick={() => openEdit(s)}
                  className='text-content-muted hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md'
                  aria-label='Sửa'
                >
                  <Pencil className='size-3.5' />
                </button>
                <button
                  type='button'
                  onClick={() => handleDelete(s)}
                  className='text-destructive hover:bg-danger-bg inline-flex size-7 items-center justify-center rounded-md'
                  aria-label='Xoá'
                >
                  <Trash2 className='size-3.5' />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MicroSiteDialog
        open={dialogOpen}
        editing={editing}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />

      {managing && (
        <MicroSiteManageDialog
          open={!!managing}
          siteId={managing.id}
          siteName={managing.name}
          onOpenChange={o => !o && setManaging(null)}
          onChanged={() => refreshPageCounts(sites)}
        />
      )}
    </div>
  );
}

function MicroSiteDialog({
  open,
  editing,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  editing: MicroSite | null;
  onOpenChange: (o: boolean) => void;
  onSave: (data: MicroSiteForm) => void | Promise<void>;
}) {
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [status, setStatus] = React.useState<MicroSiteStatus>('dev');
  const [description, setDescription] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setUrl(editing?.url ?? '');
    setStatus((editing?.status as MicroSiteStatus) ?? 'dev');
    setDescription(editing?.description ?? '');
    setSaving(false);
  }, [open, editing]);

  const submit = async () => {
    if (!name.trim()) {
      toast.error('Nhập tên micro-site');
      return;
    }
    setSaving(true);
    await onSave({
      name: name.trim(),
      url: url.trim(),
      status,
      description: description.trim(),
    });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Sửa micro-site' : 'Thêm micro-site'}
          </DialogTitle>
          <p className='text-content-muted text-xs'>
            Site Rexer code riêng cho khách, nhập thông tin chung để quản lý.
          </p>
        </DialogHeader>

        <div className='space-y-3'>
          <div>
            <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
              Tên site
            </Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='VD: ABCe'
              className='mt-1'
            />
          </div>
          <div>
            <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
              URL public
            </Label>
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder='https://abce.com'
              className='mt-1 font-mono'
            />
          </div>
          <div>
            <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
              Trạng thái
            </Label>
            <div className='mt-1 inline-flex gap-1'>
              {(['dev', 'live', 'paused'] as const).map(s => (
                <Chip
                  key={s}
                  size='md'
                  selected={status === s}
                  onClick={() => setStatus(s)}
                >
                  {STATUS_META[s].label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
              Mô tả
            </Label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Mô tả ngắn về micro-site…'
              rows={2}
              className='border-border focus:border-primary bg-background mt-1 w-full resize-none rounded-md border px-3 py-2 text-sm outline-none'
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='neutral'
            size='sm'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Huỷ
          </Button>
          <Button size='sm' onClick={submit} disabled={saving}>
            {saving ? 'Đang lưu…' : editing ? 'Lưu' : 'Thêm site'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
