'use client';

/**
 * Tab "Microsite" trong màn quản lý khách hàng. Mirror /portal/micro-sites —
 * Rexer code site riêng cho khách (a.com, b.com…); platform chỉ QUẢN LÝ danh
 * sách + thông tin chung + views. Staff đăng ký/sửa cho khách. Local demo;
 * BE chưa ship /portal/micro-sites + analytics theo micro_site_id.
 */

import * as React from 'react';
import { ExternalLink, Globe, Pencil, Plus, Trash2 } from 'lucide-react';
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

type SiteStatus = 'live' | 'dev' | 'paused';

interface MicroSite {
  id: string;
  name: string;
  url: string;
  status: SiteStatus;
  description?: string;
  views_30d: number;
}

const STATUS_META: Record<SiteStatus, { label: string; chip: string }> = {
  live: { label: 'Live', chip: 'bg-emerald-100 text-emerald-700' },
  dev: { label: 'Đang dev', chip: 'bg-amber-100 text-amber-700' },
  paused: { label: 'Tạm dừng', chip: 'bg-muted text-content-muted' },
};

const SEED: MicroSite[] = [
  {
    id: 'ms_abce',
    name: 'ABCe',
    url: 'https://abce.com',
    status: 'live',
    description: 'Micro-site thương hiệu ABCe — landing + catalog + booking.',
    views_30d: 482_140,
  },
  {
    id: 'ms_tet',
    name: 'Coca Tết 2026',
    url: 'https://tet.coca.vn',
    status: 'live',
    description: 'Campaign Tết — mini-site nhiều trang + lì xì game.',
    views_30d: 720_400,
  },
  {
    id: 'ms_sport',
    name: 'Sport 2026',
    url: '',
    status: 'dev',
    description: 'Cross-brand sự kiện thể thao 2026 — đang build.',
    views_30d: 0,
  },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export function MicroSitesTab({ onCount }: { onCount: (n: number) => void }) {
  const [sites, setSites] = React.useState<MicroSite[]>(SEED);
  const [editing, setEditing] = React.useState<MicroSite | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const onCountRef = React.useRef(onCount);
  onCountRef.current = onCount;
  React.useEffect(() => onCountRef.current(sites.length), [sites.length]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (s: MicroSite) => {
    setEditing(s);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<MicroSite, 'id' | 'views_30d'>) => {
    if (editing) {
      setSites(prev =>
        prev.map(s => (s.id === editing.id ? { ...s, ...data } : s))
      );
      toast.success(`Đã cập nhật "${data.name}"`);
    } else {
      setSites(prev => [
        ...prev,
        { ...data, id: `ms_${prev.length}_${prev.length + 1}`, views_30d: 0 },
      ]);
      toast.success(`Đã thêm micro-site "${data.name}"`);
    }
    setDialogOpen(false);
  };

  const handleDelete = (s: MicroSite) => {
    if (!window.confirm(`Xoá micro-site "${s.name}"?`)) return;
    setSites(prev => prev.filter(x => x.id !== s.id));
    toast.success('Đã xoá');
  };

  return (
    <div>
      <div className='border-border flex items-center justify-between border-b px-4 py-3'>
        <div className='text-content-muted text-xs'>
          Site Rexer code riêng cho khách (host riêng). Đăng ký để quản lý &
          theo dõi views.
        </div>
        <button
          type='button'
          onClick={openNew}
          className='inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700'
        >
          <Plus className='size-3.5' /> Thêm micro-site
        </button>
      </div>

      {sites.length === 0 ? (
        <div className='text-content-muted px-4 py-10 text-center text-sm'>
          Khách chưa có micro-site nào — bấm <strong>Thêm micro-site</strong>.
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
                      STATUS_META[s.status].chip
                    )}
                  >
                    {STATUS_META[s.status].label}
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
                  className='inline-flex size-7 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
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
  onSave: (data: Omit<MicroSite, 'id' | 'views_30d'>) => void;
}) {
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [status, setStatus] = React.useState<SiteStatus>('dev');
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setUrl(editing?.url ?? '');
    setStatus(editing?.status ?? 'dev');
    setDescription(editing?.description ?? '');
  }, [open, editing]);

  const submit = () => {
    if (!name.trim()) {
      toast.error('Nhập tên micro-site');
      return;
    }
    onSave({ name: name.trim(), url: url.trim(), status, description });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Sửa micro-site' : 'Thêm micro-site'}
          </DialogTitle>
          <p className='text-content-muted text-xs'>
            Site Rexer code riêng cho khách — nhập thông tin chung để quản lý.
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
                <button
                  key={s}
                  type='button'
                  onClick={() => setStatus(s)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                    status === s
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-border text-content-muted hover:bg-muted'
                  )}
                >
                  {STATUS_META[s].label}
                </button>
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
              className='border-border focus:border-primary mt-1 w-full resize-none rounded-md border bg-white px-3 py-2 text-sm outline-none'
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='pill-light'
            size='sm'
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button variant='pill' size='sm' onClick={submit}>
            {editing ? 'Lưu' : 'Thêm site'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
