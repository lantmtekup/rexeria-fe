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
  Check,
  Copy,
  KeyRound,
  Loader2,
  Mail,
  Save,
  Settings,
  Trash2,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useAppSelector } from '@/hooks/useRedux';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  InvitePortalMemberRequest,
  PortalClient,
  PortalMember,
  PortalMemberRole,
} from '@/services/rexer/types';

import { FAKE_BRAND, FAKE_CLIENT } from '../_data';
import { PortalShell } from '../_shell';

const ROLE_LABEL: Record<string, { label: string; chip: string }> = {
  brand_owner: { label: 'Owner', chip: 'bg-rose-100 text-rose-700' },
  brand_member: { label: 'Member', chip: 'bg-blue-100 text-blue-700' },
  brand_viewer: { label: 'Viewer', chip: 'bg-muted text-content-muted' },
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
  const t = useTranslations('portal');
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
  const [inviteOpen, setInviteOpen] = React.useState(false);
  // Credential vừa tạo (BE tự sinh password) — hiển thị 1 lần cho owner copy.
  const [createdCred, setCreatedCred] = React.useState<{
    email: string;
    display_name: string;
    password: string;
  } | null>(null);
  const [busyMember, setBusyMember] = React.useState<string | null>(null);

  // Role workspace của user hiện tại được suy ra từ chính entry của họ trong
  // members list (users.role tier nền-tảng KHÔNG phân biệt brand_owner). Chỉ
  // `brand_owner` mới được tạo/sửa/xoá member (member/viewer gọi sẽ 403).
  const meId = useAppSelector(s => s.auth.user?.id);
  const isOwner = React.useMemo(() => {
    if (pendingMembersApi) return true; // BE chưa ship → không chặn dev
    // BE (F6): brand role nằm ở `workspace_role`; `role` là tier (client_user…).
    // Fallback 'brand_member' khi thiếu workspace_role — KHÔNG fallback về `role`
    // (client_user không phải brand role hợp lệ → gating sai).
    return members.some(
      m =>
        m.user_id === meId &&
        (m.workspace_role ?? 'brand_member') === 'brand_owner'
    );
  }, [members, meId, pendingMembersApi]);

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
      toast.error(t('profile.saveBeNotReady'));
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
      toast.success(t('profile.savedToast'));
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'SAVE_FAILED';
      toast.error(t('profile.saveFailed', { msg }));
    } finally {
      setSaving(false);
    }
  };

  // Tạo member mới. BE trả `{ member, generated_password? }` (top-level, không
  // bọc {data}); `generated_password` chỉ có khi không gửi password — đây là
  // cách DUY NHẤT owner lấy mật khẩu đưa member (BE không gửi email mời).
  // KHÔNG optimistic-add nữa — để BE là source of truth (409/403/400).
  const handleInvite = async (payload: InvitePortalMemberRequest) => {
    const res = await rexerApi.portal.me.inviteMember(payload);
    setMembers(prev => [...prev, res.member]);
    setInviteOpen(false);
    if (res.generated_password) {
      setCreatedCred({
        email: res.member.email,
        display_name: res.member.display_name,
        password: res.generated_password,
      });
    } else {
      toast.success(
        t('profile.memberCreatedToast', {
          name: res.member.display_name || res.member.email,
        })
      );
    }
  };

  const handleRoleChange = async (m: PortalMember, role: PortalMemberRole) => {
    const prev = members;
    setBusyMember(m.user_id);
    setMembers(list =>
      list.map(x =>
        x.user_id === m.user_id ? { ...x, workspace_role: role } : x
      )
    );
    try {
      await rexerApi.portal.me.updateMemberRole(m.user_id, { role });
      toast.success(
        t('profile.roleChangedToast', { name: m.display_name || m.email })
      );
    } catch (err) {
      setMembers(prev); // rollback
      const code =
        err instanceof RxApiError ? err.code || err.message : 'UNKNOWN';
      toast.error(t('profile.roleChangeFailed', { code }));
    } finally {
      setBusyMember(null);
    }
  };

  const handleRemoveMember = async (m: PortalMember) => {
    if (
      !window.confirm(
        t('profile.removeConfirm', { name: m.display_name || m.email })
      )
    ) {
      return;
    }
    const prev = members;
    setBusyMember(m.user_id);
    setMembers(list => list.filter(x => x.user_id !== m.user_id));
    try {
      await rexerApi.portal.me.removeMember(m.user_id);
      toast.success(
        t('profile.memberRemovedToast', { name: m.display_name || m.email })
      );
    } catch (err) {
      setMembers(prev); // rollback
      const code =
        err instanceof RxApiError ? err.code || err.message : 'UNKNOWN';
      toast.error(t('profile.removeFailed', { code }));
    } finally {
      setBusyMember(null);
    }
  };

  return (
    <PortalShell>
      <section>
        <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
          <Settings className='size-3' /> Profile
        </div>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h1 className='mt-1 text-2xl font-bold tracking-tight'>
              {t('profile.title')}
            </h1>
            <p className='text-content-muted mt-1 text-sm'>
              {t('profile.subtitle')}
            </p>
          </div>
          <a
            href='/portal/profile/domains'
            className='border-border text-content-muted hover:border-border hover:bg-muted inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium shadow-sm'
          >
            🌐 {t('profile.customDomains')}
          </a>
        </div>
      </section>

      {(pendingClientApi || pendingMembersApi) && (
        <div className='mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-xs text-amber-900'>
          <AlertTriangle className='mt-0.5 size-3.5 shrink-0' />
          <div>
            {t('profile.beFallbackPre')} <code>/portal/me/*</code>{' '}
            {t('profile.beFallbackPost')}
          </div>
        </div>
      )}

      <div className='mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]'>
        {/* Brand info form */}
        <section className='border-border rounded-2xl border bg-white p-5 shadow-sm'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm'>
              <Building2 className='size-4' />
            </div>
            <h3 className='text-sm font-semibold'>
              {t('profile.brandInfoHeading')}
            </h3>
            {loadingClient && (
              <Loader2 className='text-muted-foreground ml-auto size-3.5 animate-spin' />
            )}
          </div>
          <div className='space-y-3'>
            <Field
              label={t('profile.fieldBrandName')}
              value={form.name}
              onChange={v => setForm(s => ({ ...s, name: v }))}
            />
            <Field
              label={t('profile.fieldSlug')}
              value={client?.slug ?? ''}
              hint={t('profile.fieldSlugHint')}
              readonly
            />
            <Field
              label={t('profile.fieldContactEmail')}
              value={form.contact_email}
              onChange={v => setForm(s => ({ ...s, contact_email: v }))}
              hint={t('profile.fieldContactEmailHint')}
            />
            <Field
              label={t('profile.fieldPhone')}
              value={form.contact_phone}
              onChange={v => setForm(s => ({ ...s, contact_phone: v }))}
            />
            <Field
              label={t('profile.fieldIndustry')}
              value={form.industry}
              onChange={v => setForm(s => ({ ...s, industry: v }))}
            />
            <Field
              label={t('profile.fieldPlan')}
              value={client?.plan ?? '—'}
              hint={t('profile.fieldPlanHint')}
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
                {saving ? t('profile.saving') : t('profile.saveChanges')}
              </button>
            </div>
          </div>
        </section>

        {/* Brand logo + workspace id */}
        <aside className='space-y-4'>
          <div className='border-border rounded-2xl border bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm'>
            <div className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
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
                <div className='flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 font-mono text-xl font-bold text-white shadow-md'>
                  {brandInitials(client?.name)}
                </div>
              )}
              <div className='flex-1'>
                <button
                  type='button'
                  disabled={pendingClientApi}
                  onClick={() => toast.info(t('profile.avatarTodoToast'))}
                  className='text-2xs border-border hover:bg-muted block rounded-lg border bg-white px-3 py-1 font-medium disabled:opacity-50'
                >
                  {t('profile.uploadLogo')}
                </button>
                <p className='text-3xs text-content-muted mt-1'>
                  {t('profile.logoHint')}
                </p>
              </div>
            </div>
          </div>

          <div className='border-border rounded-2xl border bg-white p-5 shadow-sm'>
            <div className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
              Client ID
            </div>
            <code className='text-2xs bg-muted text-content-muted mt-2 block rounded-lg px-2 py-1.5 font-mono break-all'>
              {client?.id ?? '—'}
            </code>
            <p className='text-2xs text-content-muted mt-2'>
              {t('profile.clientIdHint')}
            </p>
            {client && (
              <div className='border-border mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-center'>
                <div>
                  <div className='text-foreground font-mono text-base font-bold tabular-nums'>
                    {client.member_count ?? '—'}
                  </div>
                  <div className='text-3xs text-content-muted tracking-wider uppercase'>
                    Members
                  </div>
                </div>
                <div>
                  <div className='text-foreground font-mono text-base font-bold tabular-nums'>
                    {client.storage_used_gb ?? 0}
                    <span className='text-2xs text-muted-foreground'>
                      /{client.storage_quota_gb ?? '—'}
                    </span>
                  </div>
                  <div className='text-3xs text-content-muted tracking-wider uppercase'>
                    GB
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Members */}
      <section className='border-border mt-6 rounded-2xl border bg-white p-5 shadow-sm'>
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm'>
              <User className='size-4' />
            </div>
            <h3 className='text-sm font-semibold'>
              {t('profile.membersHeading', { count: members.length })}
            </h3>
            {loadingMembers && (
              <Loader2 className='text-muted-foreground size-3.5 animate-spin' />
            )}
          </div>
          {isOwner && (
            <button
              type='button'
              onClick={() => setInviteOpen(true)}
              className='flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50'
            >
              <UserPlus className='size-3' /> {t('profile.addMember')}
            </button>
          )}
        </div>
        <div className='divide-y divide-zinc-100'>
          {members.length === 0 && !loadingMembers ? (
            <div className='text-content-muted py-6 text-center text-xs'>
              {t('profile.emptyMembers')}
            </div>
          ) : (
            members.map(m => {
              // BE (F6): brand role ở `workspace_role`; `role` là tier nền-tảng.
              // Fallback 'brand_member' (không dùng `role`) — xem isOwner.
              const brandRole = m.workspace_role ?? 'brand_member';
              const role = ROLE_LABEL[brandRole] ?? {
                label: brandRole,
                chip: 'bg-muted text-content-muted',
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
                    <div className='text-2xs flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 font-mono font-bold text-white shadow-sm'>
                      {initials}
                    </div>
                  )}
                  <div className='min-w-0 flex-1'>
                    <div className='text-sm font-semibold'>
                      {m.display_name}
                    </div>
                    <div className='text-3xs text-content-muted flex items-center gap-1.5'>
                      <Mail className='size-2.5' /> {m.email}
                    </div>
                  </div>
                  {/* Owner đổi role/xoá member khác; không thao tác trên chính
                      mình hoặc trên `staff` (do Rexer quản lý). */}
                  {isOwner && m.user_id !== meId && brandRole !== 'staff' ? (
                    <>
                      <select
                        value={brandRole}
                        disabled={busyMember === m.user_id}
                        onChange={e =>
                          handleRoleChange(
                            m,
                            e.target.value as PortalMemberRole
                          )
                        }
                        aria-label={t('profile.roleAria', {
                          name: m.display_name,
                        })}
                        className='text-2xs border-border text-content-muted rounded-lg border bg-white px-2 py-1 font-medium outline-none focus:border-blue-400 disabled:opacity-50'
                      >
                        <option value='brand_owner'>Owner</option>
                        <option value='brand_member'>Member</option>
                        <option value='brand_viewer'>Viewer</option>
                      </select>
                      <button
                        type='button'
                        onClick={() => handleRemoveMember(m)}
                        disabled={busyMember === m.user_id}
                        aria-label={t('profile.removeAria', {
                          name: m.display_name,
                        })}
                        className='text-muted-foreground rounded-lg p-1.5 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50'
                      >
                        {busyMember === m.user_id ? (
                          <Loader2 className='size-3.5 animate-spin' />
                        ) : (
                          <Trash2 className='size-3.5' />
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className={`text-3xs rounded-full px-2 py-0.5 font-bold ${role.chip}`}
                      >
                        {role.label}
                      </span>
                      <span className='text-3xs text-muted-foreground font-mono'>
                        {formatJoined(m.joined_at ?? m.created_at, t)}
                      </span>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      <InviteMemberDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />

      {createdCred && (
        <MemberCredentialDialog
          cred={createdCred}
          onClose={() => setCreatedCred(null)}
        />
      )}
    </PortalShell>
  );
}

/** Initials viết tắt từ tên brand (vd "Tekup Solutions" → "TS"). */
function brandInitials(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  return parts
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Format `joined_at` defensively — BE sometimes returns an empty/invalid date. */
function formatJoined(
  iso: string | undefined,
  t: ReturnType<typeof useTranslations>
): string {
  if (!iso) return t('profile.joinedMember');
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? t('profile.joinedMember')
    : t('profile.joinedSince', { date: d.toLocaleDateString('vi-VN') });
}

const INVITE_ROLES: {
  value: PortalMemberRole;
  label: string;
  descKey: string;
}[] = [
  {
    value: 'brand_member',
    label: 'Member',
    descKey: 'profile.inviteRoleMemberDesc',
  },
  {
    value: 'brand_viewer',
    label: 'Viewer',
    descKey: 'profile.inviteRoleViewerDesc',
  },
  {
    value: 'brand_owner',
    label: 'Owner',
    descKey: 'profile.inviteRoleOwnerDesc',
  },
];

function InviteMemberDialog({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (payload: InvitePortalMemberRequest) => Promise<void>;
}) {
  const t = useTranslations('portal');
  const [email, setEmail] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<PortalMemberRole>('brand_member');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setEmail('');
      setDisplayName('');
      setPassword('');
      setRole('brand_member');
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit =
    emailValid &&
    displayName.trim().length > 0 &&
    (password.trim().length === 0 || password.trim().length >= 8);

  const submit = async () => {
    if (!emailValid) {
      toast.error(t('profile.invalidEmail'));
      return;
    }
    if (!displayName.trim()) {
      toast.error(t('profile.emptyDisplayName'));
      return;
    }
    if (password.trim() && password.trim().length < 8) {
      toast.error(t('profile.passwordTooShort'));
      return;
    }
    setSubmitting(true);
    try {
      await onInvite({
        email: email.trim(),
        display_name: displayName.trim(),
        role,
        ...(password.trim() ? { password: password.trim() } : {}),
      });
    } catch (err) {
      // BE là source of truth: phân nhánh 409 (email trùng) / 403 (không phải
      // owner) / còn lại. KHÔNG đóng dialog để user sửa lại.
      if (err instanceof RxApiError) {
        if (err.status === 409 || err.code === 'ERR_CLIENT_USER_DUPLICATE') {
          toast.error(t('profile.inviteDuplicate'));
        } else if (err.status === 403) {
          toast.error(t('profile.inviteForbidden'));
        } else {
          toast.error(
            t('profile.inviteFailedCode', { code: err.code || err.message })
          );
        }
      } else {
        toast.error(t('profile.inviteFailed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='my-12 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='border-border flex items-center justify-between gap-3 border-b px-5 py-3.5'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm'>
              <UserPlus className='size-4' />
            </div>
            <div>
              <h3 className='text-base leading-tight font-semibold'>
                {t('profile.inviteTitle')}
              </h3>
              <p className='text-2xs text-content-muted mt-0.5'>
                {t('profile.inviteSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:bg-muted hover:text-content-muted rounded-lg p-1.5'
            aria-label='Close'
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Body */}
        <div className='space-y-4 px-5 py-4'>
          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              Email <span className='text-rose-500'>*</span>
            </label>
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder={t('profile.emailPlaceholder')}
              autoFocus
              className='border-border mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
            />
          </div>

          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              {t('profile.displayNameLabel')}{' '}
              <span className='text-rose-500'>*</span>
            </label>
            <input
              type='text'
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder={t('profile.displayNamePlaceholder')}
              className='border-border mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
            />
          </div>

          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              {t('profile.passwordLabel')}
            </label>
            <input
              type='text'
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder={t('profile.passwordPlaceholder')}
              autoComplete='off'
              className='border-border mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
            />
            <p className='text-3xs text-muted-foreground mt-1'>
              {t('profile.passwordHint')}
            </p>
          </div>

          <div>
            <label className='text-3xs text-content-muted mb-1.5 block font-semibold tracking-wider uppercase'>
              {t('profile.roleLabel')}
            </label>
            <div className='space-y-1.5'>
              {INVITE_ROLES.map(r => (
                <button
                  key={r.value}
                  type='button'
                  onClick={() => setRole(r.value)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    role === r.value
                      ? 'border-blue-400 bg-blue-50/60 ring-2 ring-blue-100'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      role === r.value ? 'border-blue-500' : 'border-border'
                    }`}
                  >
                    {role === r.value && (
                      <span className='size-2 rounded-full bg-blue-500' />
                    )}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='text-foreground block text-sm font-semibold'>
                      {r.label}
                    </span>
                    <span className='text-2xs text-content-muted block'>
                      {t(r.descKey)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='border-border bg-muted/50 flex items-center justify-end gap-2 border-t px-5 py-3'>
          <button
            type='button'
            onClick={onClose}
            disabled={submitting}
            className='border-border text-content-muted hover:bg-muted rounded-lg border bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-50'
          >
            {t('profile.cancel')}
          </button>
          <button
            type='button'
            onClick={submit}
            disabled={submitting || !canSubmit}
            className='flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50'
          >
            {submitting ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <UserPlus className='size-3.5' />
            )}
            {submitting ? t('profile.creating') : t('profile.createMember')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hiển thị credential vừa tạo (BE tự sinh password). BE KHÔNG gửi email mời nên
 * đây là cách DUY NHẤT owner lấy mật khẩu — chỉ hiện 1 lần.
 */
function MemberCredentialDialog({
  cred,
  onClose,
}: {
  cred: { email: string; display_name: string; password: string };
  onClose: () => void;
}) {
  const t = useTranslations('portal');
  const [copied, setCopied] = React.useState<'password' | 'all' | null>(null);

  const copy = async (value: string, key: 'password' | 'all') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success(
        key === 'all' ? t('profile.copiedAll') : t('profile.copiedPassword')
      );
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error(t('profile.copyFailed'));
    }
  };

  const summary = [
    `${t('profile.summaryEmail')}: ${cred.email}`,
    `${t('profile.summaryPassword')}: ${cred.password}`,
    `${t('profile.summaryName')}: ${cred.display_name}`,
    `${t('profile.summaryLogin')}: ${typeof window !== 'undefined' ? window.location.origin : ''}/sign-in`,
  ].join('\n');

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='my-12 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        <div className='border-border flex items-center justify-between gap-3 border-b px-5 py-3.5'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm'>
              <Check className='size-4' />
            </div>
            <h3 className='text-base leading-tight font-semibold'>
              {t('profile.credCreatedTitle', { name: cred.display_name })}
            </h3>
          </div>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:bg-muted hover:text-content-muted rounded-lg p-1.5'
            aria-label='Close'
          >
            <X className='size-4' />
          </button>
        </div>

        <div className='space-y-4 px-5 py-4'>
          <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900'>
            <KeyRound className='mt-0.5 size-3.5 shrink-0 text-amber-600' />
            <div>
              <span className='font-semibold'>{t('profile.savePassword')}</span>{' '}
              {t('profile.savePasswordHint')}
            </div>
          </div>

          <div className='space-y-1'>
            <div className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
              Email
            </div>
            <div className='border-border bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm'>
              <Mail className='text-muted-foreground size-3.5' />
              {cred.email}
            </div>
          </div>

          <div className='space-y-1'>
            <div className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
              {t('profile.passwordLabel')}
            </div>
            <div className='flex items-center gap-2'>
              <code className='border-border flex-1 truncate rounded-lg border bg-white px-3 py-2 font-mono text-sm'>
                {cred.password}
              </code>
              <button
                type='button'
                onClick={() => copy(cred.password, 'password')}
                className={`text-2xs flex items-center gap-1 rounded-lg border px-2.5 py-2 font-medium ${
                  copied === 'password'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-border text-content-muted hover:bg-muted bg-white'
                }`}
              >
                {copied === 'password' ? (
                  <Check className='size-3.5' />
                ) : (
                  <Copy className='size-3.5' />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className='border-border bg-muted/50 flex items-center justify-between gap-2 border-t px-5 py-3'>
          <button
            type='button'
            onClick={() => copy(summary, 'all')}
            className='border-border text-content-muted hover:bg-muted flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium'
          >
            {copied === 'all' ? (
              <Check className='size-3.5 text-emerald-500' />
            ) : (
              <Copy className='size-3.5' />
            )}
            {t('profile.copyAll')}
          </button>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'
          >
            {t('profile.done')}
          </button>
        </div>
      </div>
    </div>
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
      <label className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
        {label}
      </label>
      <input
        type='text'
        value={value}
        readOnly={readonly}
        onChange={e => onChange?.(e.target.value)}
        className={`border-border mt-1 w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-zinc-400 ${
          readonly ? 'bg-muted text-content-muted' : 'bg-white'
        }`}
      />
      {hint && <p className='text-3xs text-muted-foreground mt-1'>{hint}</p>}
    </div>
  );
}
