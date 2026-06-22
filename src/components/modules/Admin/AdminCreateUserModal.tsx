'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Building2,
  Check,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Brand } from '@/services/rexer/types';

type Role = 'admin' | 'staff' | 'client_user';

type CreatedCredentials = {
  email: string;
  password: string;
  displayName: string;
  role: Role;
  brandName?: string;
  /** True when password came from BE (invite auto-gen). */
  passwordFromBE: boolean;
};

/**
 * Copy text robust — thử Clipboard API (cần secure context), fallback
 * textarea + execCommand khi clipboard không khả dụng/bị chặn. Trả true nếu OK.
 */
async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* rơi xuống fallback */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Strong random password: 16 chars from a charset that guarantees at least
 * one lowercase, uppercase, digit, and symbol. Avoids ambiguous chars
 * (`l`, `1`, `O`, `0`) so people can read it off a screen.
 */
function generatePassword(): string {
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '!@#$%^&*-_=+';
  const all = lowers + uppers + digits + symbols;
  const random = (n: number) => {
    const arr = new Uint32Array(n);
    crypto.getRandomValues(arr);
    return arr;
  };
  // Guarantee one of each, then fill the rest from the union.
  const buckets = [lowers, uppers, digits, symbols];
  const seed = random(16);
  const chars = buckets.map((b, i) => b[seed[i] % b.length]);
  for (let i = 4; i < 16; i++) chars.push(all[seed[i] % all.length]);
  // Fisher-Yates shuffle so positions of the guarantee chars aren't fixed.
  const shuffle = random(16);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffle[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

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
    description: 'Operator, design template, sửa canvas; không sửa role',
    color: 'bg-amber-500',
    icon: ShieldCheck,
  },
  client_user: {
    label: 'Brand Client',
    description: 'Khách hàng, xem analytics, upload assets, comment',
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
  clients: Brand[];
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
  const [autoGenPassword, setAutoGenPassword] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<CreatedCredentials | null>(null);

  // Reset CHỈ khi modal mở (open false→true). KHÔNG phụ thuộc `clients`:
  // sau khi tạo, onCreated reload list → clients đổi → nếu để trong deps effect
  // chạy lại + setCreated(null) → màn success bị nuốt sau ~vài giây.
  React.useEffect(() => {
    if (open) {
      setEmail('');
      setPassword('');
      setDisplayName('');
      setCompanyName('');
      setClientId(clients[0]?.id ?? '');
      setAutoGenPassword(true);
      setError(null);
      setCreated(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  // Mode "Brand có sẵn" chỉ LINK user (2B) — không đụng tới password.
  const isLinkExisting = role === 'client_user' && brandMode === 'existing';

  const validate = (): string | null => {
    if (!email.includes('@')) return 'Email không hợp lệ';
    if (!isLinkExisting && !autoGenPassword && password.length < 8) {
      return 'Password tối thiểu 8 ký tự (hoặc bật auto-generate)';
    }
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
      // ── 2B: gán user ĐÃ TỒN TẠI vào brand có sẵn ──────────────────────────
      // `POST /v1/brands/:id/users` chỉ LINK user (canonical
      // be-response-to-fe-qa-2026-06-03). KHÔNG tạo user, KHÔNG sinh password.
      // Email chưa tồn tại → 404 ERR_USER_NOT_FOUND.
      if (role === 'client_user' && brandMode === 'existing') {
        const brandName =
          clients.find(c => c.id === clientId)?.name ?? clientId;
        try {
          await rexerApi.brands.inviteUser(clientId, {
            email,
            display_name: displayName,
            role: 'brand_admin',
          });
        } catch (err) {
          if (
            err instanceof RxApiError &&
            (err.status === 404 || err.code === 'ERR_USER_NOT_FOUND')
          ) {
            setError(
              'User này chưa có tài khoản. Endpoint "Brand có sẵn" chỉ gán user ĐÃ TỒN TẠI, hãy tạo user trước (mode "Tạo brand mới") hoặc để họ tự đăng ký, rồi mới gán vào brand.'
            );
            return;
          }
          throw err;
        }
        toast.success(`Đã gán user vào brand "${brandName}"`, {
          description: email,
        });
        onCreated();
        onClose();
        return;
      }

      // ── Các mode còn lại đều qua /auth/register (FE tự sinh password) ──────
      const effectivePassword = autoGenPassword ? generatePassword() : password;
      let brandName: string | undefined;

      if (role === 'client_user') {
        // brandMode === 'new'
        await rexerApi.auth.register({
          email,
          password: effectivePassword,
          full_name: displayName,
          company_name: companyName,
        });
        brandName = companyName;
        toast.success(`Đã tạo brand "${companyName}" + owner user`, {
          description: email,
        });
      } else {
        // role === 'admin' || 'staff' → BE-canonical internal-user endpoint.
        // POST /v1/admin/users sets principal_type + role đúng (staff →
        // principal_type='user'+role='staff', admin → cả hai 'admin'), nên
        // user vào được /admin. Thay cho /auth/register cũ (luôn ra client_user).
        await rexerApi.adminUsers.create({
          email,
          display_name: displayName,
          role,
          password: effectivePassword,
        });
        toast.success(`Đã tạo ${ROLE_META[role].label}`, {
          description: email,
        });
      }

      setCreated({
        email,
        password: effectivePassword,
        displayName,
        role,
        brandName,
        passwordFromBE: false,
      });
      onCreated();
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

  // Once we have credentials to show, render the success view inside the
  // same modal (keeps focus + backdrop).
  if (created) {
    return (
      <CredentialsResultModal
        creds={created}
        onClose={() => {
          setCreated(null);
          onClose();
        }}
      />
    );
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='bg-card my-8 w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='border-border flex items-center justify-between border-b px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-sm'>
              <UserPlus className='size-4' />
            </div>
            <h3 className='text-base leading-tight font-semibold'>
              Tạo user mới
            </h3>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='text-muted-foreground hover:text-content-muted size-7'
            aria-label='Close'
          >
            <X className='size-4' />
          </Button>
        </div>

        {/* Body */}
        <div className='space-y-4 px-5 py-4'>
          {/* Role picker */}
          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
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
                        ? 'bg-muted border-foreground shadow-sm'
                        : 'border-border hover:bg-muted bg-background'
                    }`}
                  >
                    <div
                      className={`flex size-7 items-center justify-center rounded-lg ${meta.color} text-white shadow-sm`}
                    >
                      <Icon className='size-3.5' />
                    </div>
                    <div className='text-xs font-semibold'>{meta.label}</div>
                    <div className='text-3xs text-content-muted leading-snug'>
                      {meta.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Common fields */}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Field label='Email' required>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='user@example.com'
                className='border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
            </Field>
            <Field label='Tên hiển thị' required>
              <input
                type='text'
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder='Nguyễn Văn A'
                className='border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
              />
            </Field>
          </div>

          {!isLinkExisting && (
            <Field
              label='Password'
              required={!autoGenPassword}
              hint={
                autoGenPassword
                  ? 'FE sinh 16 ký tự mạnh, hiện sau khi tạo xong'
                  : 'Tối thiểu 8 ký tự'
              }
            >
              <div className='mb-2 flex items-center gap-2'>
                <label className='text-content-muted flex cursor-pointer items-center gap-2 text-xs'>
                  <input
                    type='checkbox'
                    checked={autoGenPassword}
                    onChange={e => setAutoGenPassword(e.target.checked)}
                    className='border-border size-3.5 rounded'
                  />
                  <Sparkles className='size-3.5 text-violet-500' />
                  Auto-generate password
                </label>
              </div>
              {!autoGenPassword && (
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder='ít nhất 8 ký tự'
                    className='border-border w-full rounded-lg border px-3 py-2 pr-20 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  />
                  <div className='absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-0.5'>
                    <button
                      type='button'
                      onClick={() => {
                        setPassword(generatePassword());
                        setShowPassword(true);
                      }}
                      className='text-muted-foreground hover:bg-muted rounded p-1 hover:text-violet-600'
                      aria-label='Generate random password'
                      title='Sinh password ngẫu nhiên'
                    >
                      <RefreshCcw className='size-3.5' />
                    </button>
                    <button
                      type='button'
                      onClick={() => setShowPassword(s => !s)}
                      className='text-muted-foreground hover:text-content-muted rounded p-1'
                      aria-label='Toggle password visibility'
                    >
                      {showPassword ? (
                        <EyeOff className='size-3.5' />
                      ) : (
                        <Eye className='size-3.5' />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </Field>
          )}

          {/* Brand-specific options */}
          {role === 'client_user' && (
            <div className='rounded-xl border border-teal-200 bg-teal-50/40 p-3'>
              <div className='text-2xs mb-2 flex items-center gap-1.5 font-semibold tracking-wider text-teal-700 uppercase'>
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
                  hint='Tạo cùng workspace mới, user sẽ là Owner'
                  required
                >
                  <input
                    type='text'
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder='vd: ACME Beverage Group'
                    className='border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                  />
                </Field>
              ) : (
                <Field
                  label='Chọn brand'
                  required
                  hint='Chỉ GÁN user ĐÃ TỒN TẠI vào brand (không tạo user / không cấp password). Email chưa có tài khoản sẽ báo lỗi.'
                >
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className='border-border bg-background w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                  >
                    {clients.length === 0 && (
                      <option value=''>Chưa có brand nào</option>
                    )}
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.id.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          )}

          {error && (
            <div className='border-destructive/20 bg-danger-bg text-destructive flex items-start gap-2 rounded-lg border px-3 py-2 text-xs'>
              <AlertCircle className='text-destructive mt-0.5 size-3.5 shrink-0' />
              <div className='font-mono'>{error}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-border bg-muted/50 flex items-center justify-between gap-3 border-t px-5 py-3'>
          <p className='text-2xs text-content-muted'>
            {role === 'client_user' && brandMode === 'new' && (
              <>
                Endpoint:{' '}
                <code className='bg-muted rounded px-1'>
                  POST /v1/auth/register
                </code>
              </>
            )}
            {role === 'client_user' && brandMode === 'existing' && (
              <>
                Endpoint:{' '}
                <code className='bg-muted rounded px-1'>
                  POST /v1/brands/{'{id}'}/users
                </code>{' '}
                (link-only)
              </>
            )}
            {(role === 'admin' || role === 'staff') && (
              <>
                Endpoint:{' '}
                <code className='bg-muted rounded px-1'>
                  POST /v1/admin/users
                </code>
              </>
            )}
          </p>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='neutral'
              size='sm'
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className='size-3.5 animate-spin' />
              ) : (
                <UserPlus className='size-3.5' />
              )}
              {submitting ? 'Đang tạo...' : 'Tạo user'}
            </Button>
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
      <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
        {label} {required && <span className='text-rose-500'>*</span>}
      </label>
      <div className='mt-1'>{children}</div>
      {hint && <p className='text-3xs text-content-muted mt-1'>{hint}</p>}
    </div>
  );
}

function CredentialsResultModal({
  creds,
  onClose,
}: {
  creds: CreatedCredentials;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState<
    'email' | 'password' | 'all' | null
  >(null);
  const meta = ROLE_META[creds.role];

  const copy = async (value: string, key: 'email' | 'password' | 'all') => {
    const ok = await copyText(value);
    if (ok) {
      setCopied(key);
      toast.success(
        key === 'all' ? 'Đã copy email + password' : `Đã copy ${key}`
      );
      setTimeout(() => setCopied(null), 1500);
    } else {
      toast.error('Copy thất bại, bôi đen rồi Cmd/Ctrl+C nhé');
    }
  };

  const summary = [
    `Email: ${creds.email}`,
    `Password: ${creds.password}`,
    `Tên: ${creds.displayName}`,
    creds.brandName ? `Brand: ${creds.brandName}` : null,
    `Login URL: ${typeof window !== 'undefined' ? window.location.origin : ''}/sign-in`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='bg-card my-8 w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        <div className='border-border flex items-center justify-between border-b px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm'>
              <Check className='size-4' />
            </div>
            <h3 className='text-base leading-tight font-semibold'>
              Đã tạo user thành công
            </h3>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='text-muted-foreground hover:text-content-muted size-7'
            aria-label='Close'
          >
            <X className='size-4' />
          </Button>
        </div>

        <div className='space-y-4 px-5 py-4'>
          <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
            <div className='flex items-start gap-2 text-xs text-amber-900'>
              <AlertCircle className='mt-0.5 size-3.5 shrink-0 text-amber-600' />
              <div>
                <span className='font-semibold'>Lưu ngay password</span>, chỉ
                hiện 1 lần ở đây. Đóng modal là mất, BE không có endpoint xem
                lại password cũ.
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <CredField
              label='Email'
              value={creds.email}
              copied={copied === 'email'}
              onCopy={() => copy(creds.email, 'email')}
              icon={<Mail className='text-content-muted size-3.5' />}
            />
            <CredField
              label={
                creds.passwordFromBE ? 'Password (BE auto-gen)' : 'Password'
              }
              value={creds.password}
              copied={copied === 'password'}
              onCopy={() => copy(creds.password, 'password')}
              icon={<Sparkles className='size-3.5 text-violet-500' />}
              mono
            />
          </div>

          <div className='text-content-muted flex flex-wrap items-center gap-2 text-xs'>
            <span>Tên:</span>
            <code className='bg-muted text-foreground rounded px-1.5 py-0.5'>
              {creds.displayName}
            </code>
            {creds.brandName && (
              <>
                <span>·</span>
                <span>Brand:</span>
                <code className='bg-muted text-foreground rounded px-1.5 py-0.5'>
                  {creds.brandName}
                </code>
              </>
            )}
            <span>·</span>
            <span>Role:</span>
            <span
              className={`rounded-full ${meta.color} text-3xs px-2 py-0.5 font-bold text-white`}
            >
              {meta.label}
            </span>
          </div>
        </div>

        <div className='border-border bg-muted/50 flex items-center justify-between gap-3 border-t px-5 py-3'>
          <Button
            type='button'
            variant='neutral'
            size='sm'
            onClick={() => copy(summary, 'all')}
          >
            {copied === 'all' ? (
              <Check className='size-3.5 text-emerald-500' />
            ) : (
              <Copy className='size-3.5' />
            )}
            Copy tất cả
          </Button>
          <Button type='button' size='sm' onClick={onClose}>
            Xong
          </Button>
        </div>
      </div>
    </div>
  );
}

function CredField({
  label,
  value,
  copied,
  onCopy,
  icon,
  mono,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className='border-border bg-muted/60 rounded-lg border p-2.5'>
      <div className='text-3xs text-content-muted flex items-center gap-1.5 font-semibold tracking-wider uppercase'>
        {icon}
        {label}
      </div>
      <div className='mt-1 flex items-center gap-2'>
        <div
          className={`border-border bg-background flex-1 truncate rounded border px-2 py-1.5 text-sm select-all ${
            mono ? 'font-mono' : ''
          }`}
          title={value}
        >
          {value || <span className='text-muted-foreground'>-</span>}
        </div>
        <button
          type='button'
          onClick={onCopy}
          className={`text-2xs flex items-center gap-1 rounded border px-2 py-1.5 font-medium transition-colors ${
            copied
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-border text-content-muted hover:bg-muted bg-background'
          }`}
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className='size-3.5' />
          ) : (
            <Copy className='size-3.5' />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
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
      className={`text-2xs flex-1 rounded-lg border px-2.5 py-1 font-medium transition-all disabled:opacity-40 ${
        active
          ? 'border-teal-500 bg-teal-100 text-teal-800'
          : 'border-border text-content-muted hover:bg-muted bg-background'
      }`}
    >
      {label}
    </button>
  );
}
