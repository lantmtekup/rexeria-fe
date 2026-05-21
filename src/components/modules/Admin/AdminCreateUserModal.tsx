'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';

import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Client } from '@/services/rexer/types';

type Role = 'admin' | 'staff' | 'client_user';

const ROLE_META: Record<
  Role,
  { label: string; description: string; color: string; icon: typeof UserPlus }
> = {
  admin: {
    label: 'Admin Rexer',
    description: 'Quản lý hệ thống, đổi role user khác, billing',
    color: 'bg-orange-500',
    icon: ShieldCheck,
  },
  staff: {
    label: 'Staff Rexer',
    description: 'Operator — design template, sửa canvas; không sửa role',
    color: 'bg-amber-500',
    icon: ShieldCheck,
  },
  client_user: {
    label: 'Brand Client',
    description: 'Khách hàng — xem analytics, upload assets, comment',
    color: 'bg-teal-500',
    icon: UserPlus,
  },
};

export function AdminCreateUserModal({
  open,
  clients,
  onClose,
  onCreated,
}: {
  open: boolean;
  clients: Client[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [role, setRole] = React.useState<Role>('client_user');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [clientId, setClientId] = React.useState<string>('');
  const [brandMode, setBrandMode] = React.useState<'new' | 'existing'>('new');
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setEmail('');
      setPassword('');
      setDisplayName('');
      setCompanyName('');
      setClientId(clients[0]?.id ?? '');
      setError(null);
    }
  }, [open, clients]);

  if (!open) return null;

  const validate = (): string | null => {
    if (!email.includes('@')) return 'Email không hợp lệ';
    if (password.length < 8) return 'Password tối thiểu 8 ký tự';
    if (!displayName.trim()) return 'Tên hiển thị không được rỗng';
    if (role === 'client_user') {
      if (brandMode === 'new' && !companyName.trim()) {
        return 'Tên brand (company) không được rỗng';
      }
      if (brandMode === 'existing' && !clientId) {
        return 'Chưa chọn brand';
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (role === 'client_user') {
        if (brandMode === 'new') {
          // Tạo brand + owner user (BE auto-creates client từ company_name)
          await rexerApi.auth.register({
            email,
            password,
            full_name: displayName,
            company_name: companyName,
          });
          toast.success(`Đã tạo brand "${companyName}" + owner user`, {
            description: email,
          });
        } else {
          // Add user vào client có sẵn
          await rexerApi.clients.inviteUser(clientId, {
            email,
            password,
            display_name: displayName,
          });
          const brandName =
            clients.find(c => c.id === clientId)?.name ?? clientId;
          toast.success(`Đã thêm user vào brand "${brandName}"`, {
            description: email,
          });
        }
      } else {
        // Admin / Staff: BE chưa có endpoint create với role param.
        // Tạm dùng /auth/register (sẽ thành client_user), warn user.
        await rexerApi.auth.register({
          email,
          password,
          full_name: displayName,
          company_name: 'Rexer Internal',
        });
        toast.warning(`Đã tạo user nhưng role mặc định = client_user`, {
          description: `Cần BE expose endpoint promote role → ${role}. Hiện chỉ có thể đổi qua DB.`,
        });
      }
      onCreated();
      onClose();
    } catch (err) {
      const code =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'CREATE_FAILED';
      setError(code);
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
        className='my-8 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-zinc-100 px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-sm'>
              <UserPlus className='size-4' />
            </div>
            <h3 className='text-[15px] leading-tight font-semibold'>
              Tạo user mới
            </h3>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'
            aria-label='Close'
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Body */}
        <div className='space-y-4 px-5 py-4'>
          {/* Role picker */}
          <div>
            <label className='block text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
              Role <span className='text-rose-500'>*</span>
            </label>
            <div className='mt-2 grid grid-cols-3 gap-2'>
              {(Object.keys(ROLE_META) as Role[]).map(r => {
                const meta = ROLE_META[r];
                const Icon = meta.icon;
                const active = role === r;
                return (
                  <button
                    key={r}
                    type='button'
                    onClick={() => setRole(r)}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all ${
                      active
                        ? 'border-zinc-900 bg-zinc-50 shadow-sm'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div
                      className={`flex size-7 items-center justify-center rounded-lg ${meta.color} text-white shadow-sm`}
                    >
                      <Icon className='size-3.5' />
                    </div>
                    <div className='text-[12.5px] font-semibold'>
                      {meta.label}
                    </div>
                    <div className='text-[10.5px] leading-snug text-zinc-500'>
                      {meta.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warning cho admin/staff */}
          {(role === 'admin' || role === 'staff') && (
            <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800'>
              <AlertCircle className='mt-0.5 size-3.5 shrink-0 text-amber-600' />
              <div>
                <span className='font-semibold'>BE chưa expose endpoint</span>{' '}
                tạo {role} qua API. User sẽ được tạo với role mặc định{' '}
                <code className='rounded bg-amber-100 px-1 font-mono'>
                  client_user
                </code>{' '}
                — cần promote qua DB hoặc nhờ BE team add endpoint.
              </div>
            </div>
          )}

          {/* Common fields */}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Field label='Email' required>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='user@example.com'
                className='w-full rounded-lg border border-zinc-200 px-3 py-2 text-[14px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
            </Field>
            <Field label='Tên hiển thị' required>
              <input
                type='text'
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder='Nguyễn Văn A'
                className='w-full rounded-lg border border-zinc-200 px-3 py-2 text-[14px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
            </Field>
          </div>

          <Field label='Password' required hint='Tối thiểu 8 ký tự'>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder='ít nhất 8 ký tự'
                className='w-full rounded-lg border border-zinc-200 px-3 py-2 pr-10 text-[14px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
              <button
                type='button'
                onClick={() => setShowPassword(s => !s)}
                className='absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-700'
                aria-label='Toggle password visibility'
              >
                {showPassword ? (
                  <EyeOff className='size-3.5' />
                ) : (
                  <Eye className='size-3.5' />
                )}
              </button>
            </div>
          </Field>

          {/* Brand-specific options */}
          {role === 'client_user' && (
            <div className='rounded-xl border border-teal-200 bg-teal-50/40 p-3'>
              <div className='mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-teal-700 uppercase'>
                <Building2 className='size-3' /> Brand
              </div>
              <div className='mb-2 flex gap-1.5'>
                <ModeBtn
                  active={brandMode === 'new'}
                  onClick={() => setBrandMode('new')}
                  label='Tạo brand mới'
                />
                <ModeBtn
                  active={brandMode === 'existing'}
                  onClick={() => setBrandMode('existing')}
                  label={`Brand có sẵn (${clients.length})`}
                  disabled={clients.length === 0}
                />
              </div>
              {brandMode === 'new' ? (
                <Field
                  label='Tên brand / Company'
                  hint='Tạo cùng workspace mới — user sẽ là Owner'
                  required
                >
                  <input
                    type='text'
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder='vd: ACME Beverage Group'
                    className='w-full rounded-lg border border-zinc-200 px-3 py-2 text-[14px] outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                  />
                </Field>
              ) : (
                <Field label='Chọn brand' required>
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                  >
                    {clients.length === 0 && (
                      <option value=''>Chưa có brand nào</option>
                    )}
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.id.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          )}

          {error && (
            <div className='flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800'>
              <AlertCircle className='mt-0.5 size-3.5 shrink-0 text-rose-600' />
              <div className='font-mono'>{error}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/50 px-5 py-3'>
          <p className='text-[11px] text-zinc-500'>
            {role === 'client_user' && brandMode === 'new' && (
              <>
                Endpoint:{' '}
                <code className='rounded bg-zinc-100 px-1'>
                  POST /v1/auth/register
                </code>
              </>
            )}
            {role === 'client_user' && brandMode === 'existing' && (
              <>
                Endpoint:{' '}
                <code className='rounded bg-zinc-100 px-1'>
                  POST /v1/clients/{'{id}'}/users
                </code>
              </>
            )}
            {(role === 'admin' || role === 'staff') && (
              <>
                Endpoint:{' '}
                <code className='rounded bg-zinc-100 px-1'>/auth/register</code>{' '}
                (fallback — cần promote sau)
              </>
            )}
          </p>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={onClose}
              disabled={submitting}
              className='rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50'
            >
              Hủy
            </button>
            <button
              type='button'
              onClick={handleSubmit}
              disabled={submitting}
              className='flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-60'
            >
              {submitting ? (
                <Loader2 className='size-3.5 animate-spin' />
              ) : (
                <UserPlus className='size-3.5' />
              )}
              {submitting ? 'Đang tạo...' : 'Tạo user'}
            </button>
          </div>
        </div>
      </div>
    </div>
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
      <label className='block text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
        {label} {required && <span className='text-rose-500'>*</span>}
      </label>
      <div className='mt-1'>{children}</div>
      {hint && <p className='mt-1 text-[10.5px] text-zinc-500'>{hint}</p>}
    </div>
  );
}

function ModeBtn({
  active,
  onClick,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 rounded-lg border px-2.5 py-1 text-[11.5px] font-medium transition-all disabled:opacity-40 ${
        active
          ? 'border-teal-500 bg-teal-100 text-teal-800'
          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
      }`}
    >
      {label}
    </button>
  );
}
