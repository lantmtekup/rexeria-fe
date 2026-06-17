'use client';

/**
 * Tab "Tracking keys" trong màn quản lý brand. Credential `pk_live_…` cho
 * website ngoài gửi analytics về ReXeR (scope theo brand).
 *
 * Phân quyền (FE handoff §1): đọc = brand-user/staff; ghi (create/edit/rotate/
 * revoke) = staff/admin only → nút ghi chỉ hiện khi `isInternal`.
 * Plaintext key chỉ hiện 1 lần ở modal sau create/rotate (BE không lưu lại).
 * BE spec: docs/be-spec-tracking-keys-2026-06-05.md.
 */

import * as React from 'react';
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  Power,
  RotateCw,
  Trash2,
  TriangleAlert,
  X,
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
import { useAuthRole } from '@/hooks/useAuthRole';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  CreateTrackingKeyResponse,
  TrackingKey,
  Workspace,
} from '@/services/rexer/types';

const STATUS_META: Record<string, { label: string; chip: string }> = {
  active: { label: 'Active', chip: 'bg-emerald-100 text-emerald-700' },
  disabled: { label: 'Tạm tắt', chip: 'bg-muted text-content-muted' },
  revoked: { label: 'Đã thu hồi', chip: 'bg-danger-bg text-destructive' },
};

function statusMeta(s: string) {
  return STATUS_META[s] ?? STATUS_META.disabled;
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? '-'
    : d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
}

function copy(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`Đã copy ${label}`))
    .catch(() => toast.error('Copy thất bại'));
}

export function TrackingKeysTab({
  clientId,
  onCount,
}: {
  clientId: string;
  onCount: (n: number) => void;
}) {
  const { isInternal } = useAuthRole();
  const [keys, setKeys] = React.useState<TrackingKey[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TrackingKey | null>(null);
  const [reveal, setReveal] = React.useState<CreateTrackingKeyResponse | null>(
    null
  );
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const onCountRef = React.useRef(onCount);
  onCountRef.current = onCount;
  React.useEffect(() => onCountRef.current(keys.length), [keys.length]);

  const reload = React.useCallback(() => {
    setLoading(true);
    rexerApi.trackingKeys
      .list({ brand_id: clientId, limit: 50 })
      .then(res => setKeys(res.items ?? []))
      .catch(() => toast.error('Không tải được tracking keys'))
      .finally(() => setLoading(false));
  }, [clientId]);

  React.useEffect(() => reload(), [reload]);

  // Workspaces cho dropdown form (staff tạo key có thể gắn workspace).
  React.useEffect(() => {
    if (!isInternal) return;
    rexerApi.brands.workspaces
      .list(clientId)
      .then(res => setWorkspaces(res.items ?? []))
      .catch(() => setWorkspaces([]));
  }, [clientId, isInternal]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (k: TrackingKey) => {
    setEditing(k);
    setFormOpen(true);
  };

  const toggleStatus = async (k: TrackingKey) => {
    const next: 'active' | 'disabled' =
      k.status === 'active' ? 'disabled' : 'active';
    setBusyId(k.id);
    try {
      const updated = await rexerApi.trackingKeys.update(k.id, {
        status: next,
      });
      setKeys(prev => prev.map(x => (x.id === k.id ? updated : x)));
      toast.success(next === 'active' ? 'Đã bật key' : 'Đã tắt key');
    } catch {
      toast.error('Đổi trạng thái thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const rotate = async (k: TrackingKey) => {
    if (
      !window.confirm(
        `Rotate key "${k.name}"? Key cũ sẽ ngừng hoạt động NGAY và không khôi phục được.`
      )
    )
      return;
    setBusyId(k.id);
    try {
      const res = await rexerApi.trackingKeys.rotate(k.id);
      setReveal(res);
      reload();
    } catch {
      toast.error('Rotate thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async (k: TrackingKey) => {
    if (
      !window.confirm(
        `Thu hồi vĩnh viễn key "${k.name}"? Không hoàn tác, site đang dùng key này sẽ ngừng gửi được analytics.`
      )
    )
      return;
    setBusyId(k.id);
    try {
      await rexerApi.trackingKeys.revoke(k.id);
      setKeys(prev => prev.filter(x => x.id !== k.id));
      toast.success('Đã thu hồi key');
    } catch {
      toast.error('Thu hồi thất bại');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className='border-border flex items-center justify-between gap-3 border-b px-4 py-3'>
        <div className='text-content-muted text-xs'>
          Credential <code className='font-mono'>pk_live_…</code> cho website
          ngoài gửi analytics về ReXeR (scope theo brand này).
        </div>
        {isInternal && (
          <Button size='sm' className='shrink-0' onClick={openCreate}>
            <Plus className='size-3.5' /> Tạo key
          </Button>
        )}
      </div>

      {loading ? (
        <div className='text-content-muted flex items-center justify-center gap-2 px-4 py-10 text-sm'>
          <Loader2 className='size-4 animate-spin' /> Đang tải…
        </div>
      ) : keys.length === 0 ? (
        <div className='text-content-muted px-4 py-10 text-center text-sm'>
          Chưa có tracking key nào.
          {isInternal && (
            <>
              {' '}
              Bấm <strong>Tạo key</strong> để cấp credential cho site ngoài.
            </>
          )}
        </div>
      ) : (
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-border text-content-muted text-2xs border-b text-left tracking-wider uppercase'>
              <th className='px-4 py-2.5 font-semibold'>Tên / Key</th>
              <th className='px-3 py-2.5 font-semibold'>Trạng thái</th>
              <th className='px-3 py-2.5 font-semibold'>Origins</th>
              <th className='px-3 py-2.5 font-semibold'>Dùng lần cuối</th>
              <th className='px-3 py-2.5 font-semibold'>Tạo lúc</th>
              {isInternal && <th className='px-3 py-2.5' />}
            </tr>
          </thead>
          <tbody>
            {keys.map(k => {
              const sm = statusMeta(k.status);
              const busy = busyId === k.id;
              return (
                <tr
                  key={k.id}
                  className='border-border/60 hover:bg-muted/40 border-b last:border-0'
                >
                  <td className='px-4 py-2.5'>
                    <div className='flex items-center gap-2 font-medium'>
                      <KeyRound className='text-content-muted size-3.5' />
                      {k.name}
                    </div>
                    <code className='text-3xs text-content-muted mt-0.5 block font-mono'>
                      {k.key_prefix}
                      <span className='text-muted-foreground'>…</span>
                    </code>
                  </td>
                  <td className='px-3 py-2.5'>
                    <span
                      className={cn(
                        'text-3xs rounded-full px-2 py-0.5 font-bold tracking-wider uppercase',
                        sm.chip
                      )}
                    >
                      {sm.label}
                    </span>
                  </td>
                  <td className='px-3 py-2.5'>
                    <OriginChips origins={k.allowed_origins} />
                  </td>
                  <td className='text-content-muted text-3xs px-3 py-2.5 font-mono'>
                    {k.last_used_at ? fmtDate(k.last_used_at) : 'Chưa dùng'}
                  </td>
                  <td className='text-content-muted text-3xs px-3 py-2.5 font-mono'>
                    {fmtDate(k.created_at)}
                  </td>
                  {isInternal && (
                    <td className='px-3 py-2.5'>
                      <div className='flex items-center justify-end gap-1'>
                        <IconBtn
                          title={k.status === 'active' ? 'Tắt key' : 'Bật key'}
                          onClick={() => toggleStatus(k)}
                          disabled={busy}
                          className={
                            k.status === 'active'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-content-muted hover:bg-muted'
                          }
                        >
                          <Power className='size-3.5' />
                        </IconBtn>
                        <IconBtn
                          title='Sửa (tên / origins)'
                          onClick={() => openEdit(k)}
                          disabled={busy}
                        >
                          <Pencil className='size-3.5' />
                        </IconBtn>
                        <IconBtn
                          title='Rotate (đổi secret mới)'
                          onClick={() => rotate(k)}
                          disabled={busy}
                        >
                          <RotateCw className='size-3.5' />
                        </IconBtn>
                        <IconBtn
                          title='Thu hồi vĩnh viễn'
                          onClick={() => revoke(k)}
                          disabled={busy}
                          className='text-destructive hover:bg-danger-bg'
                        >
                          <Trash2 className='size-3.5' />
                        </IconBtn>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {isInternal && (
        <TrackingKeyFormDialog
          open={formOpen}
          editing={editing}
          clientId={clientId}
          workspaces={workspaces}
          onOpenChange={setFormOpen}
          onCreated={res => {
            setFormOpen(false);
            setReveal(res);
            reload();
          }}
          onUpdated={updated => {
            setFormOpen(false);
            setKeys(prev => prev.map(x => (x.id === updated.id ? updated : x)));
          }}
        />
      )}

      <RevealKeyModal data={reveal} onClose={() => setReveal(null)} />
    </div>
  );
}

function IconBtn({
  title,
  onClick,
  disabled,
  className,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'text-content-muted hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md disabled:opacity-40',
        className
      )}
    >
      {children}
    </button>
  );
}

function OriginChips({ origins }: { origins: string[] }) {
  if (!origins || origins.length === 0)
    return (
      <span className='text-3xs text-muted-foreground italic'>Mọi origin</span>
    );
  return (
    <div className='flex flex-wrap gap-1'>
      {origins.slice(0, 3).map(o => (
        <span
          key={o}
          className='bg-muted text-3xs text-content-muted rounded px-1.5 py-0.5 font-mono'
        >
          {o.replace(/^https?:\/\//, '')}
        </span>
      ))}
      {origins.length > 3 && (
        <span className='text-3xs text-muted-foreground'>
          +{origins.length - 3}
        </span>
      )}
    </div>
  );
}

/* ── Form dialog (create / edit) ─────────────────────────────────────────── */

function TrackingKeyFormDialog({
  open,
  editing,
  clientId,
  workspaces,
  onOpenChange,
  onCreated,
  onUpdated,
}: {
  open: boolean;
  editing: TrackingKey | null;
  clientId: string;
  workspaces: Workspace[];
  onOpenChange: (o: boolean) => void;
  onCreated: (res: CreateTrackingKeyResponse) => void;
  onUpdated: (k: TrackingKey) => void;
}) {
  const [name, setName] = React.useState('');
  const [origins, setOrigins] = React.useState<string[]>([]);
  const [workspaceId, setWorkspaceId] = React.useState<string>('');
  const [status, setStatus] = React.useState<'active' | 'disabled'>('active');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? '');
    setOrigins(editing?.allowed_origins ?? []);
    setWorkspaceId(editing?.workspace_id ?? '');
    setStatus(
      (editing?.status as 'active' | 'disabled') === 'disabled'
        ? 'disabled'
        : 'active'
    );
    setSaving(false);
  }, [open, editing]);

  const submit = async () => {
    if (!name.trim()) {
      toast.error('Nhập tên key');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await rexerApi.trackingKeys.update(editing.id, {
          name: name.trim(),
          allowed_origins: origins,
          status,
        });
        onUpdated(updated);
        toast.success('Đã cập nhật key');
      } else {
        const res = await rexerApi.trackingKeys.create({
          brand_id: clientId,
          workspace_id: workspaceId || null,
          name: name.trim(),
          allowed_origins: origins,
        });
        onCreated(res);
      }
    } catch {
      toast.error('Lưu thất bại, kiểm tra tên / origins hợp lệ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{editing ? 'Sửa key' : 'Tạo tracking key'}</DialogTitle>
          <p className='text-content-muted text-xs'>
            {editing
              ? 'Đổi tên, origins cho phép, hoặc bật/tắt key.'
              : 'Cấp credential cho 1 website ngoài gửi analytics về ReXeR.'}
          </p>
        </DialogHeader>

        <div className='space-y-3'>
          <div>
            <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
              Tên key
            </Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='VD: Website tekup.vn'
              className='mt-1'
            />
          </div>

          <div>
            <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
              Allowed origins
            </Label>
            <OriginTagInput value={origins} onChange={setOrigins} />
            <p className='text-3xs text-muted-foreground mt-1'>
              Để trống = chấp nhận mọi origin. Enter để thêm.
            </p>
          </div>

          {editing ? (
            <div>
              <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
                Trạng thái
              </Label>
              <div className='mt-1 inline-flex gap-1'>
                {(['active', 'disabled'] as const).map(s => (
                  <Chip
                    key={s}
                    size='md'
                    selected={status === s}
                    onClick={() => setStatus(s)}
                  >
                    {s === 'active' ? 'Active' : 'Tạm tắt'}
                  </Chip>
                ))}
              </div>
            </div>
          ) : (
            workspaces.length > 0 && (
              <div>
                <Label className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
                  Workspace (tuỳ chọn)
                </Label>
                <select
                  value={workspaceId}
                  onChange={e => setWorkspaceId(e.target.value)}
                  className='border-border bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none'
                >
                  <option value=''>Không gắn workspace</option>
                  {workspaces.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )
          )}
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
            {saving ? 'Đang lưu…' : editing ? 'Lưu' : 'Tạo key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OriginTagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = React.useState('');

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (!value.includes(v)) onChange([...value, v]);
    setDraft('');
  };

  return (
    <div className='border-border focus-within:border-primary bg-background mt-1 flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5'>
      {value.map(o => (
        <span
          key={o}
          className='bg-muted text-2xs inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono'
        >
          {o}
          <button
            type='button'
            onClick={() => onChange(value.filter(x => x !== o))}
            className='text-content-muted hover:text-foreground'
            aria-label={`Bỏ ${o}`}
          >
            <X className='size-3' />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={value.length ? '' : 'https://tekup.vn'}
        className='min-w-[8rem] flex-1 bg-transparent text-sm outline-none'
      />
    </div>
  );
}

/* ── Reveal modal (plaintext key — chỉ 1 lần) ────────────────────────────── */

function RevealKeyModal({
  data,
  onClose,
}: {
  data: CreateTrackingKeyResponse | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!data} onOpenChange={o => !o && onClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Lưu key ngay</DialogTitle>
        </DialogHeader>

        {data && (
          <div className='min-w-0 space-y-4'>
            <div className='flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800'>
              <TriangleAlert className='mt-0.5 size-4 shrink-0' />
              <span>
                Key chỉ hiển thị <strong>một lần duy nhất</strong>, không xem
                lại được. Copy & lưu ngay; mất thì phải <strong>rotate</strong>.
              </span>
            </div>

            <CopyField
              label='Tracking key'
              value={data.key}
              mono
              copyLabel='key'
            />
            <CopyField
              label='Mã nhúng (snippet)'
              value={data.snippet}
              multiline
              copyLabel='snippet'
            />
            <p className='text-3xs text-muted-foreground'>
              Dán snippet vào website (thay <code>PAGE_ID</code> nếu cần). Chi
              tiết: <code>be-tracking-key-integration-guide.md</code>.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button size='sm' onClick={onClose}>
            Đã lưu, đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CopyField({
  label,
  value,
  mono,
  multiline,
  copyLabel,
}: {
  label: string;
  value: string;
  mono?: boolean;
  multiline?: boolean;
  copyLabel: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const onCopy = () => {
    copy(value, copyLabel);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className='min-w-0'>
      <div className='mb-1 flex items-center justify-between gap-2'>
        <Label className='text-2xs text-content-muted truncate font-semibold tracking-wider uppercase'>
          {label}
        </Label>
        <button
          type='button'
          onClick={onCopy}
          className='text-2xs text-content-muted hover:text-foreground inline-flex shrink-0 items-center gap-1 font-medium'
        >
          {copied ? (
            <Check className='size-3 text-emerald-600' />
          ) : (
            <Copy className='size-3' />
          )}
          {copied ? 'Đã copy' : 'Copy'}
        </button>
      </div>
      {multiline ? (
        <pre className='border-border bg-muted/60 max-h-40 overflow-auto rounded-md border p-2.5 text-[11px] leading-relaxed break-all whitespace-pre-wrap'>
          {value}
        </pre>
      ) : (
        <div
          className={cn(
            'border-border bg-muted/60 rounded-md border px-3 py-2 text-sm break-all',
            mono && 'font-mono'
          )}
        >
          {value}
        </div>
      )}
    </div>
  );
}
