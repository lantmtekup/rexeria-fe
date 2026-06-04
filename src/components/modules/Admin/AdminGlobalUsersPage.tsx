'use client';

/**
 * Admin global user list — `/admin/users-global`.
 *
 * Cross-brand list of every User in the system (admin/staff + brand_user).
 * Distinct from `/admin/users` (brand list at /admin/brands, legacy route).
 *
 * BE endpoint (shipped 2026-05-24):
 *   GET /v1/admin/users?role=&status=&q=&page=&limit=
 */

import * as React from 'react';
import Link from 'next/link';
import {
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  UserCog,
  Users,
} from 'lucide-react';

import { Input } from '@/components/atoms/input';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { AdminUser } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

import { gradientForId, initialsOf } from './_avatar';

type RoleFilter = 'all' | 'admin' | 'staff' | 'brand_user' | 'client_user';
type StatusFilter = 'all' | 'active' | 'pending' | 'disabled';

const ROLE_META: Record<
  string,
  { label: string; chip: string; icon: React.ElementType }
> = {
  admin: {
    label: 'Admin',
    chip: 'bg-rose-100 text-rose-700',
    icon: ShieldCheck,
  },
  staff: {
    label: 'Staff',
    chip: 'bg-violet-100 text-violet-700',
    icon: UserCog,
  },
  brand_user: {
    label: 'Brand user',
    chip: 'bg-blue-100 text-blue-700',
    icon: User,
  },
  client_user: {
    label: 'Brand user',
    chip: 'bg-blue-100 text-blue-700',
    icon: User,
  },
};

const STATUS_CHIP: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  disabled: 'bg-zinc-100 text-zinc-500',
};

const PAGE_SIZES = [10, 20, 50];

export function AdminGlobalUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [role, setRole] = React.useState<RoleFilter>('all');
  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, status, pageSize]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.adminUsers.list({
        role: role === 'all' ? undefined : role,
        status: status === 'all' ? undefined : status,
        q: debouncedSearch.trim() || undefined,
        page,
        limit: pageSize,
      });
      setUsers(r.items ?? []);
      setTotal(r.total ?? r.items?.length ?? 0);
    } catch (err) {
      setError(
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
      );
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, role, status, page, pageSize]);

  React.useEffect(() => {
    load();
  }, [load]);

  const counts = React.useMemo(() => {
    const m = { admin: 0, staff: 0, brand: 0 };
    for (const u of users) {
      if (u.role === 'admin') m.admin += 1;
      else if (u.role === 'staff') m.staff += 1;
      else m.brand += 1;
    }
    return m;
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <div className='text-3xs flex items-center gap-2 font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
            <Users className='size-3' /> Global users
          </div>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
            Người dùng toàn hệ thống
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            List mọi user trong Rexer — admin/staff + brand users. Quản lý brand
            profile ở{' '}
            <Link
              href='/admin/users'
              className='text-zinc-900 underline hover:text-zinc-700'
            >
              /admin/users
            </Link>{' '}
            (Khách hàng).
          </p>
        </div>
        <button
          type='button'
          onClick={load}
          disabled={loading}
          className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50'
        >
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Counts strip */}
      <div className='grid grid-cols-3 gap-3'>
        <StatCard
          label='Admin'
          value={counts.admin}
          icon={<ShieldCheck className='size-3.5' />}
          accent='rose'
        />
        <StatCard
          label='Staff'
          value={counts.staff}
          icon={<UserCog className='size-3.5' />}
          accent='violet'
        />
        <StatCard
          label='Brand users'
          value={counts.brand}
          icon={<User className='size-3.5' />}
          accent='blue'
        />
      </div>

      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400' />
          <Input
            placeholder='Tìm theo email / display_name…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-9'
          />
        </div>
        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className='rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50'
        >
          {PAGE_SIZES.map(s => (
            <option key={s} value={s}>
              {s}/trang
            </option>
          ))}
        </select>
      </div>

      {/* Filter chips */}
      <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
        <FilterGroup label='Role' icon={<Filter className='size-3' />}>
          <Chip
            active={role === 'all'}
            onClick={() => setRole('all')}
            label='Tất cả'
          />
          <Chip
            active={role === 'admin'}
            onClick={() => setRole('admin')}
            label='Admin'
            accent='rose'
          />
          <Chip
            active={role === 'staff'}
            onClick={() => setRole('staff')}
            label='Staff'
            accent='violet'
          />
          <Chip
            active={role === 'brand_user' || role === 'client_user'}
            onClick={() => setRole('brand_user')}
            label='Brand user'
            accent='blue'
          />
        </FilterGroup>

        <span className='hidden h-4 w-px bg-zinc-200 sm:block' />

        <FilterGroup label='Status'>
          <Chip
            active={status === 'all'}
            onClick={() => setStatus('all')}
            label='Tất cả'
          />
          <Chip
            active={status === 'active'}
            onClick={() => setStatus('active')}
            label='Active'
            accent='emerald'
          />
          <Chip
            active={status === 'pending'}
            onClick={() => setStatus('pending')}
            label='Pending'
            accent='amber'
          />
          <Chip
            active={status === 'disabled'}
            onClick={() => setStatus('disabled')}
            label='Disabled'
          />
        </FilterGroup>
      </div>

      {error && (
        <div className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800'>
          {error}
        </div>
      )}

      {/* Table */}
      {loading && users.length === 0 ? (
        <div className='flex items-center justify-center py-16 text-sm text-zinc-500'>
          <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải users…
        </div>
      ) : users.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center'>
          <Users className='mx-auto size-8 text-zinc-300' />
          <p className='mt-3 text-sm font-semibold text-zinc-700'>
            Không có user khớp filter
          </p>
        </div>
      ) : (
        <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='text-3xs border-b border-zinc-100 bg-zinc-50/50 text-left font-semibold tracking-[0.15em] text-zinc-500 uppercase'>
                <th className='w-14 px-4 py-2' />
                <th className='px-4 py-2'>User</th>
                <th className='w-32 px-4 py-2'>Role</th>
                <th className='w-32 px-4 py-2'>Status</th>
                <th className='w-44 px-4 py-2'>Brand</th>
                <th className='w-40 px-4 py-2'>Last login</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const roleMeta = ROLE_META[u.role] ?? {
                  label: u.role,
                  chip: 'bg-zinc-100 text-zinc-700',
                  icon: User,
                };
                const statusClass =
                  STATUS_CHIP[u.status] ?? 'bg-zinc-100 text-zinc-600';
                return (
                  <tr
                    key={u.id}
                    className='border-b border-zinc-100 last:border-0 hover:bg-zinc-50/40'
                  >
                    <td className='px-4 py-2'>
                      {u.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatar_url}
                          alt={u.display_name ?? u.email}
                          className='size-8 rounded-full object-cover'
                        />
                      ) : (
                        <div
                          className={cn(
                            'text-3xs flex size-8 items-center justify-center rounded-full bg-gradient-to-br font-mono font-bold text-white shadow-sm',
                            gradientForId(u.id)
                          )}
                        >
                          {initialsOf(u.display_name ?? u.email)}
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-2'>
                      <div className='font-medium text-zinc-900'>
                        {u.display_name ?? '(no name)'}
                      </div>
                      <div className='text-content-muted text-3xs font-mono'>
                        {u.email}
                      </div>
                    </td>
                    <td className='px-4 py-2'>
                      <span
                        className={cn(
                          'text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                          roleMeta.chip
                        )}
                      >
                        <roleMeta.icon className='size-3' />
                        {roleMeta.label}
                      </span>
                    </td>
                    <td className='px-4 py-2'>
                      <span
                        className={cn(
                          'text-3xs rounded-full px-2 py-0.5 font-medium',
                          statusClass
                        )}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className='text-2xs px-4 py-2'>
                      {u.brand_id ? (
                        <Link
                          href={`/admin/users/${u.brand_id}`}
                          className='text-zinc-700 hover:underline'
                        >
                          {u.brand_name ?? (
                            <code className='font-mono'>
                              {u.brand_id.slice(0, 8)}…
                            </code>
                          )}
                        </Link>
                      ) : (
                        <span className='text-zinc-300'>—</span>
                      )}
                    </td>
                    <td className='text-3xs px-4 py-2 font-mono text-zinc-500'>
                      {u.last_login_at
                        ? new Date(u.last_login_at).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {users.length > 0 && totalPages > 1 && (
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 shadow-sm'>
          <span className='text-2xs text-zinc-500'>
            Trang {page}/{totalPages} · {total} users
          </span>
          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className='text-2xs rounded-md border border-zinc-200 px-2 py-1 hover:bg-zinc-50 disabled:opacity-40'
            >
              ‹ Trước
            </button>
            <button
              type='button'
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className='text-2xs rounded-md border border-zinc-200 px-2 py-1 hover:bg-zinc-50 disabled:opacity-40'
            >
              Sau ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Bits ───────────────────────────────────────────────────────────── */

function FilterGroup({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className='inline-flex items-center gap-1.5'>
      <span className='text-3xs inline-flex items-center gap-1 font-semibold tracking-[0.18em] text-zinc-400 uppercase'>
        {icon}
        {label}
      </span>
      <div className='inline-flex flex-wrap items-center gap-1'>{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  accent?: 'rose' | 'violet' | 'blue' | 'emerald' | 'amber';
}) {
  const accentActive: Record<NonNullable<typeof accent>, string> = {
    rose: 'bg-rose-600 text-white shadow-sm',
    violet: 'bg-violet-600 text-white shadow-sm',
    blue: 'bg-blue-600 text-white shadow-sm',
    emerald: 'bg-emerald-600 text-white shadow-sm',
    amber: 'bg-amber-500 text-white shadow-sm',
  };
  const cls = active
    ? accent
      ? accentActive[accent]
      : 'bg-zinc-900 text-white shadow-sm'
    : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50';
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'text-2xs rounded-full px-2.5 py-1 font-medium transition-colors',
        cls
      )}
    >
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: 'rose' | 'violet' | 'blue';
}) {
  const palette: Record<typeof accent, string> = {
    rose: 'border-rose-100 bg-rose-50/40 text-rose-700',
    violet: 'border-violet-100 bg-violet-50/40 text-violet-700',
    blue: 'border-blue-100 bg-blue-50/40 text-blue-700',
  };
  return (
    <div
      className={cn('rounded-2xl border px-4 py-3 shadow-sm', palette[accent])}
    >
      <div className='text-3xs flex items-center gap-1.5 font-semibold tracking-[0.18em] uppercase opacity-75'>
        {icon}
        {label}
      </div>
      <div className='mt-1 font-mono text-xl font-bold text-zinc-900 tabular-nums'>
        {value}
      </div>
    </div>
  );
}
