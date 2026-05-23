'use client';

/**
 * Brand profile + members. Wires `/v1/portal/me/client` + `/portal/me/members`
 * (be-todo.md P0.3). Falls back to FAKE data if the endpoint isn't shipped
 * so the page still renders in dev environments without BE.
 */

import * as React from 'react';
import {
  AlertTriangle,
  Building2,
  Loader2,
  Mail,
  Save,
  Settings,
  User,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { PortalClient, PortalMember } from '@/services/rexer/types';

import { FAKE_BRAND, FAKE_CLIENT } from '../_data';
import { PortalShell } from '../_shell';

const ROLE_LABEL: Record<string, { label: string; chip: string }> = {
  brand_owner: { label: 'Owner', chip: 'bg-rose-100 text-rose-700' },
  brand_member: { label: 'Member', chip: 'bg-blue-100 text-blue-700' },
  brand_viewer: { label: 'Viewer', chip: 'bg-zinc-100 text-zinc-700' },
  staff: { label: 'Staff', chip: 'bg-violet-100 text-violet-700' },
};

const FALLBACK_CLIENT: PortalClient = {
  id: FAKE_CLIENT.id,
  name: FAKE_BRAND.name,
  legal_name: FAKE_CLIENT.legal_name,
  contact_email: FAKE_CLIENT.contact_email,
  contact_phone: FAKE_CLIENT.contact_phone,
  country_code: 'VN',
  plan: 'Phase 1 — Managed Service',
  status: 'active',
  member_count: 4,
  storage_used_gb: FAKE_CLIENT.storage_used_gb,
  storage_quota_gb: FAKE_CLIENT.storage_quota_gb,
  industry: FAKE_BRAND.industry,
  slug: FAKE_BRAND.slug,
};

const FALLBACK_MEMBERS: PortalMember[] = [
  {
    user_id: 'fake-1',
    email: 'an@cocacola.vn',
    display_name: 'An Nguyễn',
    role: 'brand_owner',
    joined_at: '2026-01-15T00:00:00Z',
  },
  {
    user_id: 'fake-2',
    email: 'linh@cocacola.vn',
    display_name: 'Linh Trần',
    role: 'brand_member',
    joined_at: '2026-02-03T00:00:00Z',
  },
  {
    user_id: 'fake-3',
    email: 'thu@cocacola.vn',
    display_name: 'Thu Phạm',
    role: 'brand_member',
    joined_at: '2026-03-18T00:00:00Z',
  },
  {
    user_id: 'fake-4',
    email: 'duc@cocacola.vn',
    display_name: 'Đức Lê',
    role: 'brand_viewer',
    joined_at: '2026-04-22T00:00:00Z',
  },
];

interface FormState {
  name: string;
  contact_email: string;
  contact_phone: string;
  industry: string;
}

export default function PortalProfilePage() {
  const [client, setClient] = React.useState<PortalClient | null>(null);
  const [members, setMembers] = React.useState<PortalMember[]>([]);
  const [loadingClient, setLoadingClient] = React.useState(true);
  const [loadingMembers, setLoadingMembers] = React.useState(true);
  const [pendingClientApi, setPendingClientApi] = React.useState(false);
  const [pendingMembersApi, setPendingMembersApi] = React.useState(false);
  const [form, setForm] = React.useState<FormState>({
    name: '',
    contact_email: '',
    contact_phone: '',
    industry: '',
  });
  const [saving, setSaving] = React.useState(false);

  // Load brand profile + members in parallel
  React.useEffect(() => {
    let cancelled = false;
    rexerApi.portal.me
      .client()
      .then(c => {
        if (cancelled) return;
        setClient(c);
        setForm({
          name: c.name || '',
          contact_email: c.contact_email || '',
          contact_phone: c.contact_phone || '',
          industry: c.industry || '',
        });
      })
      .catch(err => {
        if (cancelled) return;
        if (
          err instanceof RxApiError &&
          (err.status === 404 || err.status === 403)
        ) {
          setPendingClientApi(true);
        }
        setClient(FALLBACK_CLIENT);
        setForm({
          name: FALLBACK_CLIENT.name || '',
          contact_email: FALLBACK_CLIENT.contact_email || '',
          contact_phone: FALLBACK_CLIENT.contact_phone || '',
          industry: FALLBACK_CLIENT.industry || '',
        });
      })
      .finally(() => {
        if (!cancelled) setLoadingClient(false);
      });

    rexerApi.portal.me
      .members()
      .then(r => {
        if (cancelled) return;
        setMembers(r.items ?? []);
      })
      .catch(err => {
        if (cancelled) return;
        if (
          err instanceof RxApiError &&
          (err.status === 404 || err.status === 403)
        ) {
          setPendingMembersApi(true);
        }
        setMembers(FALLBACK_MEMBERS);
      })
      .finally(() => {
        if (!cancelled) setLoadingMembers(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (pendingClientApi) {
      toast.error('BE chưa ship endpoint PATCH /portal/me/client (P0.3)');
      return;
    }
    setSaving(true);
    try {
      const updated = await rexerApi.portal.me.updateClient({
        name: form.name.trim() || undefined,
        contact_email: form.contact_email.trim() || undefined,
        contact_phone: form.contact_phone.trim() || undefined,
        industry: form.industry.trim() || undefined,
      });
      setClient(updated);
      toast.success('Đã lưu thông tin brand');
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'SAVE_FAILED';
      toast.error(`Lưu thất bại: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalShell>
      <section>
        <div className='flex items-center gap-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
          <Settings className='size-3' /> Profile
        </div>
        <h1 className='mt-1 text-2xl font-bold tracking-tight'>
          Cài đặt brand
        </h1>
        <p className='mt-1 text-[13px] text-zinc-500'>
          Quản lý thông tin brand + thành viên có quyền truy cập portal.
        </p>
      </section>

      {(pendingClientApi || pendingMembersApi) && (
        <div className='mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-[12px] text-amber-900'>
          <AlertTriangle className='mt-0.5 size-3.5 shrink-0' />
          <div>
            BE chưa ship đủ endpoint <code>/portal/me/*</code> (P0.3) — đang
            hiển thị fallback. Save sẽ disable cho tới khi BE merge.
          </div>
        </div>
      )}

      <div className='mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]'>
        {/* Brand info form */}
        <section className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm'>
              <Building2 className='size-4' />
            </div>
            <h3 className='text-sm font-semibold'>Thông tin Brand</h3>
            {loadingClient && (
              <Loader2 className='ml-auto size-3.5 animate-spin text-zinc-400' />
            )}
          </div>
          <div className='space-y-3'>
            <Field
              label='Tên Brand'
              value={form.name}
              onChange={v => setForm(s => ({ ...s, name: v }))}
            />
            <Field
              label='Slug (URL identifier)'
              value={client?.slug ?? ''}
              hint='Cố định — không thể đổi sau khi tạo'
              readonly
            />
            <Field
              label='Email liên hệ'
              value={form.contact_email}
              onChange={v => setForm(s => ({ ...s, contact_email: v }))}
              hint='Email Rexer dùng để liên hệ về billing + support'
            />
            <Field
              label='Số điện thoại'
              value={form.contact_phone}
              onChange={v => setForm(s => ({ ...s, contact_phone: v }))}
            />
            <Field
              label='Industry'
              value={form.industry}
              onChange={v => setForm(s => ({ ...s, industry: v }))}
            />
            <Field
              label='Plan'
              value={client?.plan ?? '—'}
              hint='Đang chạy'
              readonly
            />
            <div className='pt-2'>
              <button
                type='button'
                onClick={handleSave}
                disabled={saving || pendingClientApi}
                className='inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {saving ? (
                  <Loader2 className='size-3.5 animate-spin' />
                ) : (
                  <Save className='size-3.5' />
                )}
                {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </section>

        {/* Brand logo + workspace id */}
        <aside className='space-y-4'>
          <div className='rounded-2xl border border-zinc-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm'>
            <div className='text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
              Logo
            </div>
            <div className='mt-3 flex items-center gap-3'>
              {client?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={client.logo_url}
                  alt={client.name}
                  className='size-16 rounded-2xl object-cover shadow-md'
                />
              ) : (
                <div
                  className={`flex size-16 items-center justify-center rounded-2xl ${FAKE_BRAND.logo_color} font-mono text-xl font-bold text-white shadow-md`}
                >
                  {FAKE_BRAND.logo_initial}
                </div>
              )}
              <div className='flex-1'>
                <button
                  type='button'
                  disabled={pendingClientApi}
                  onClick={() =>
                    toast.info(
                      'POST /portal/me/avatar — gửi multipart binary, FE sẽ wire khi BE confirm endpoint'
                    )
                  }
                  className='block rounded-lg border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium hover:bg-zinc-100 disabled:opacity-50'
                >
                  Upload logo mới
                </button>
                <p className='mt-1 text-[10px] text-zinc-500'>
                  PNG / SVG · ≤ 1MB · Vuông
                </p>
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm'>
            <div className='text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
              Client ID
            </div>
            <code className='mt-2 block rounded-lg bg-zinc-50 px-2 py-1.5 font-mono text-[11px] break-all text-zinc-600'>
              {client?.id ?? '—'}
            </code>
            <p className='mt-2 text-[11px] text-zinc-500'>
              Dùng khi liên hệ support hoặc tích hợp API.
            </p>
            {client && (
              <div className='mt-3 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 text-center'>
                <div>
                  <div className='font-mono text-[16px] font-bold text-zinc-900 tabular-nums'>
                    {client.member_count ?? '—'}
                  </div>
                  <div className='text-[10px] tracking-wider text-zinc-500 uppercase'>
                    Members
                  </div>
                </div>
                <div>
                  <div className='font-mono text-[16px] font-bold text-zinc-900 tabular-nums'>
                    {client.storage_used_gb ?? 0}
                    <span className='text-[11px] text-zinc-400'>
                      /{client.storage_quota_gb ?? '—'}
                    </span>
                  </div>
                  <div className='text-[10px] tracking-wider text-zinc-500 uppercase'>
                    GB
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Members */}
      <section className='mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm'>
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm'>
              <User className='size-4' />
            </div>
            <h3 className='text-sm font-semibold'>
              Thành viên ({members.length})
            </h3>
            {loadingMembers && (
              <Loader2 className='size-3.5 animate-spin text-zinc-400' />
            )}
          </div>
          <button
            type='button'
            disabled={pendingMembersApi}
            onClick={() =>
              toast.info(
                'Invite member sẽ wire khi BE merge POST /portal/me/members (P0.3)'
              )
            }
            className='flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50'
          >
            <UserPlus className='size-3' /> Invite member
          </button>
        </div>
        <div className='divide-y divide-zinc-100'>
          {members.length === 0 && !loadingMembers ? (
            <div className='py-6 text-center text-[12px] text-zinc-500'>
              Chưa có thành viên nào.
            </div>
          ) : (
            members.map(m => {
              const role = ROLE_LABEL[m.role] ?? {
                label: m.role,
                chip: 'bg-zinc-100 text-zinc-700',
              };
              const initials = m.display_name
                .split(' ')
                .map(s => s[0])
                .slice(0, 2)
                .join('');
              return (
                <div
                  key={m.user_id}
                  className='flex items-center gap-3 py-3 first:pt-0 last:pb-0'
                >
                  {m.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.avatar_url}
                      alt={m.display_name}
                      className='size-9 rounded-full object-cover shadow-sm'
                    />
                  ) : (
                    <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 font-mono text-[11px] font-bold text-white shadow-sm'>
                      {initials}
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    <div className='text-[13px] font-semibold'>
                      {m.display_name}
                    </div>
                    <div className='flex items-center gap-1.5 text-[10.5px] text-zinc-500'>
                      <Mail className='size-2.5' /> {m.email}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${role.chip}`}
                  >
                    {role.label}
                  </span>
                  <span className='font-mono text-[10px] text-zinc-400'>
                    từ {new Date(m.joined_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </PortalShell>
  );
}

function Field({
  label,
  value,
  hint,
  readonly,
  onChange,
}: {
  label: string;
  value: string;
  hint?: string;
  readonly?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label className='text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
        {label}
      </label>
      <input
        type='text'
        value={value}
        readOnly={readonly}
        onChange={e => onChange?.(e.target.value)}
        className={`mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-[13px] outline-none focus:border-zinc-400 ${
          readonly ? 'bg-zinc-50 text-zinc-500' : 'bg-white'
        }`}
      />
      {hint && <p className='mt-1 text-[10.5px] text-zinc-400'>{hint}</p>}
    </div>
  );
}
