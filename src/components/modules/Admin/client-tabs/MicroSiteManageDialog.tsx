'use client';

/**
 * Quản lý nội dung 1 micro-site: danh sách **page** + **số liệu nhập tay**.
 * Wire BE (commit 413b173, spec §A/§B):
 *   pages   GET /portal/micro-sites/{id}/pages · POST/PATCH/DELETE /admin/...
 *   metrics PUT /admin/micro-sites/{id}/metrics → trả merged analytics (source).
 */

import * as React from 'react';
import {
  CalendarDays,
  FileText,
  LineChart,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  MicroSiteAnalytics,
  MicroSitePage,
  MicroSitePageStatus,
  UpsertMicroSiteMetricDaily,
} from '@/services/rexer/types';

const PAGE_STATUS_META: Record<
  MicroSitePageStatus,
  { label: string; chip: string }
> = {
  live: { label: 'Live', chip: 'bg-emerald-100 text-emerald-700' },
  dev: { label: 'Đang dev', chip: 'bg-amber-100 text-amber-700' },
  paused: { label: 'Tạm dừng', chip: 'bg-muted text-content-muted' },
};

function pageStatusMeta(s: string) {
  return PAGE_STATUS_META[
    (s as MicroSitePageStatus) in PAGE_STATUS_META
      ? (s as MicroSitePageStatus)
      : 'dev'
  ];
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function daysBetween(from: string, to: string): string[] {
  if (!from || !to) return [];
  const out: string[] = [];
  const d = new Date(from);
  const end = new Date(to);
  if (isNaN(d.getTime()) || isNaN(end.getTime()) || d > end) return [];
  for (let i = 0; i < 92 && d <= end; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function MicroSiteManageDialog({
  open,
  siteId,
  siteName,
  onOpenChange,
  onChanged,
}: {
  open: boolean;
  siteId: string;
  siteName: string;
  onOpenChange: (o: boolean) => void;
  onChanged?: () => void;
}) {
  const [tab, setTab] = React.useState<'pages' | 'stats'>('pages');

  React.useEffect(() => {
    if (open) setTab('pages');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[88vh] overflow-hidden sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Quản lý micro-site: {siteName}</DialogTitle>
          <p className='text-content-muted text-xs'>
            Danh sách page + số liệu cơ bản, lưu trên BE.
          </p>
        </DialogHeader>

        <div className='border-border bg-muted inline-flex rounded-lg border p-0.5 text-xs'>
          {(
            [
              { k: 'pages', label: 'Pages', icon: FileText },
              { k: 'stats', label: 'Số liệu', icon: LineChart },
            ] as const
          ).map(t => (
            <button
              key={t.k}
              type='button'
              onClick={() => setTab(t.k)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors',
                tab === t.k
                  ? 'text-foreground bg-white shadow-sm'
                  : 'text-content-muted'
              )}
            >
              <t.icon className='size-3.5' /> {t.label}
            </button>
          ))}
        </div>

        <div className='-mr-1 max-h-[60vh] overflow-y-auto pr-1'>
          {tab === 'pages' ? (
            <PagesPanel siteId={siteId} onChanged={onChanged} />
          ) : (
            <StatsPanel siteId={siteId} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Pages ──────────────────────────────────────────────────────────────── */

interface PageForm {
  name: string;
  path: string;
  status: MicroSitePageStatus;
}

const BLANK_PAGE: PageForm = { name: '', path: '/', status: 'dev' };

function PagesPanel({
  siteId,
  onChanged,
}: {
  siteId: string;
  onChanged?: () => void;
}) {
  const [pages, setPages] = React.useState<MicroSitePage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<MicroSitePage | null>(null);
  const [form, setForm] = React.useState<PageForm>(BLANK_PAGE);
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    rexerApi.microSites
      .listPages(siteId)
      .then(items => !cancelled && setPages(items))
      .catch(() => !cancelled && toast.error('Không tải được danh sách page'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  const openNew = () => {
    setEditing(null);
    setForm(BLANK_PAGE);
    setShowForm(true);
  };
  const openEdit = (p: MicroSitePage) => {
    setEditing(p);
    setForm({
      name: p.name,
      path: p.path,
      status: (p.status as MicroSitePageStatus) ?? 'dev',
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Nhập tên page');
    const path = form.path.trim().startsWith('/')
      ? form.path.trim()
      : `/${form.path.trim()}`;
    setSaving(true);
    try {
      if (editing) {
        const updated = await rexerApi.microSites.updatePage(
          siteId,
          editing.id,
          {
            name: form.name.trim(),
            path,
            status: form.status,
          }
        );
        setPages(prev => prev.map(p => (p.id === editing.id ? updated : p)));
        toast.success('Đã cập nhật page');
      } else {
        const created = await rexerApi.microSites.createPage(siteId, {
          name: form.name.trim(),
          path,
          status: form.status,
        });
        setPages(prev => [...prev, created]);
        toast.success('Đã thêm page');
      }
      setShowForm(false);
      onChanged?.();
    } catch {
      toast.error(
        'Lưu page thất bại, kiểm tra path (duy nhất, bắt đầu bằng /)'
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: MicroSitePage) => {
    if (!window.confirm(`Xoá page "${p.name}"?`)) return;
    try {
      await rexerApi.microSites.removePage(siteId, p.id);
      setPages(prev => prev.filter(x => x.id !== p.id));
      toast.success('Đã xoá page');
      onChanged?.();
    } catch {
      toast.error('Xoá page thất bại');
    }
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <span className='text-content-muted text-xs'>
          {pages.length} page · cấu trúc các trang của micro-site
        </span>
        <Button size='sm' onClick={openNew}>
          <Plus className='size-3.5' /> Thêm page
        </Button>
      </div>

      {showForm && (
        <div className='border-border bg-muted/40 space-y-3 rounded-xl border p-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold'>
              {editing ? 'Sửa page' : 'Page mới'}
            </span>
            <button
              type='button'
              onClick={() => setShowForm(false)}
              className='text-content-muted hover:text-foreground'
            >
              <X className='size-4' />
            </button>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
                Tên page
              </Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder='VD: Trang đặt lịch'
                className='mt-1'
              />
            </div>
            <div>
              <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
                Path
              </Label>
              <Input
                value={form.path}
                onChange={e => setForm(f => ({ ...f, path: e.target.value }))}
                placeholder='/booking'
                className='mt-1 font-mono'
              />
            </div>
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
                  selected={form.status === s}
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                >
                  {PAGE_STATUS_META[s].label}
                </Chip>
              ))}
            </div>
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              variant='neutral'
              size='sm'
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              Huỷ
            </Button>
            <Button size='sm' onClick={save} disabled={saving}>
              {saving ? 'Đang lưu…' : editing ? 'Lưu' : 'Thêm'}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className='text-content-muted flex items-center justify-center gap-2 py-8 text-xs'>
          <Loader2 className='size-4 animate-spin' /> Đang tải page…
        </div>
      ) : pages.length === 0 && !showForm ? (
        <div className='text-content-muted border-border rounded-xl border border-dashed px-4 py-8 text-center text-xs'>
          Chưa có page nào, bấm <strong>Thêm page</strong> để dựng cấu trúc.
        </div>
      ) : (
        <div className='border-border divide-border divide-y overflow-hidden rounded-xl border'>
          {pages.map(p => (
            <div
              key={p.id}
              className='hover:bg-muted/40 flex items-center gap-3 px-3 py-2'
            >
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{p.name}</span>
                  <span
                    className={cn(
                      'text-3xs rounded-full px-2 py-0.5 font-bold tracking-wider uppercase',
                      pageStatusMeta(p.status).chip
                    )}
                  >
                    {pageStatusMeta(p.status).label}
                  </span>
                </div>
                <span className='text-3xs text-content-muted font-mono'>
                  {p.path}
                </span>
              </div>
              <div className='shrink-0 text-right'>
                <div className='font-mono text-sm font-bold tabular-nums'>
                  {fmt(p.views_30d)}
                </div>
                <div className='text-3xs text-muted-foreground'>views 30d</div>
              </div>
              <div className='flex shrink-0 items-center gap-1'>
                <button
                  type='button'
                  onClick={() => openEdit(p)}
                  className='text-content-muted hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md'
                  aria-label='Sửa'
                >
                  <Pencil className='size-3.5' />
                </button>
                <button
                  type='button'
                  onClick={() => remove(p)}
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
    </div>
  );
}

/* ── Stats ──────────────────────────────────────────────────────────────── */

const SOURCE_META: Record<string, { label: string; chip: string }> = {
  ingest: { label: 'Script đo', chip: 'bg-emerald-100 text-emerald-700' },
  manual: { label: 'Nhập tay', chip: 'bg-violet-100 text-violet-700' },
  mixed: { label: 'Trộn', chip: 'bg-sky-100 text-sky-700' },
};

function StatsPanel({ siteId }: { siteId: string }) {
  const [analytics, setAnalytics] = React.useState<MicroSiteAnalytics | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [views, setViews] = React.useState('');
  const [visitors, setVisitors] = React.useState('');
  const [avgTime, setAvgTime] = React.useState('');
  const [bounce, setBounce] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    rexerApi.microSites
      .analytics(siteId)
      .then(a => !cancelled && setAnalytics(a))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  const num = (v: string) => Number(v.replace(/[^\d.]/g, '')) || 0;

  const save = async () => {
    const days = daysBetween(from, to);
    if (days.length === 0)
      return toast.error('Chọn khoảng ngày hợp lệ (từ ≤ đến, tối đa 92 ngày)');
    const n = days.length;
    const totalViews = num(views);
    const totalVisitors = num(visitors);
    const avg = num(avgTime);
    const bnc = num(bounce);
    const daily: UpsertMicroSiteMetricDaily[] = days.map(date => ({
      date,
      views: Math.round(totalViews / n),
      visitors: Math.round(totalVisitors / n),
      avg_time_s: avg,
      bounce_pct: bnc,
    }));
    setSaving(true);
    try {
      const refreshed = await rexerApi.microSites.upsertMetrics(siteId, {
        from,
        to,
        mode: 'range',
        daily,
      });
      setAnalytics(refreshed);
      toast.success('Đã lưu số liệu');
    } catch {
      toast.error('Lưu số liệu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const s = analytics?.summary;
  const sourceMeta = analytics?.source
    ? SOURCE_META[analytics.source]
    : undefined;

  return (
    <div className='space-y-4'>
      <div className='flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-2 text-xs text-sky-800'>
        <span className='mt-0.5 inline-block size-2 shrink-0 rounded-full bg-sky-500' />
        Nhập tay để seed/override khi chưa có script đo. BE tự trộn: ngày nào có
        ingest thật thì ưu tiên ingest, còn lại dùng số nhập tay.
      </div>

      {loading ? (
        <div className='text-content-muted flex items-center justify-center gap-2 py-6 text-xs'>
          <Loader2 className='size-4 animate-spin' /> Đang tải số liệu…
        </div>
      ) : (
        s && (
          <div>
            {sourceMeta && (
              <div className='mb-2 flex items-center gap-1.5'>
                <span className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
                  Nguồn
                </span>
                <span
                  className={cn(
                    'text-3xs rounded-full px-2 py-0.5 font-bold',
                    sourceMeta.chip
                  )}
                >
                  {sourceMeta.label}
                </span>
              </div>
            )}
            <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
              <Stat label='Lượt xem' value={fmt(s.views)} />
              <Stat label='Người dùng' value={fmt(s.visitors)} />
              <Stat label='Thời gian TB' value={`${s.avg_time_s}s`} />
              <Stat label='Bounce' value={`${s.bounce_pct.toFixed(1)}%`} />
            </div>
          </div>
        )
      )}

      <div className='border-border space-y-3 rounded-xl border p-3'>
        <div className='text-xs font-semibold'>Cập nhật theo khoảng ngày</div>
        <div className='grid grid-cols-2 gap-3'>
          <DateField label='Từ ngày' value={from} onChange={setFrom} />
          <DateField label='Đến ngày' value={to} min={from} onChange={setTo} />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <NumField label='Lượt xem (tổng)' value={views} onChange={setViews} />
          <NumField
            label='Người dùng (tổng)'
            value={visitors}
            onChange={setVisitors}
          />
          <NumField
            label='Thời gian TB (giây)'
            value={avgTime}
            onChange={setAvgTime}
          />
          <NumField label='Bounce (%)' value={bounce} onChange={setBounce} />
        </div>
        <div className='flex justify-end'>
          <Button size='sm' onClick={save} disabled={saving}>
            {saving ? 'Đang lưu…' : 'Lưu số liệu'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className='border-border rounded-xl border bg-gradient-to-br from-indigo-50/60 to-white p-3 shadow-sm'>
      <div className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
        {label}
      </div>
      <div className='text-foreground mt-0.5 font-mono text-lg font-bold'>
        {value}
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
        {label}
      </Label>
      <Input
        inputMode='numeric'
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder='0'
        className='mt-1 font-mono'
      />
    </div>
  );
}

function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
        {label}
      </Label>
      <div className='border-border focus-within:border-primary mt-1 flex items-center gap-2 rounded-md border bg-white px-2.5 py-2'>
        <CalendarDays className='text-content-muted size-3.5' />
        <input
          type='date'
          value={value}
          min={min || undefined}
          onChange={e => onChange(e.target.value)}
          className='w-full bg-transparent text-sm outline-none'
        />
      </div>
    </div>
  );
}
