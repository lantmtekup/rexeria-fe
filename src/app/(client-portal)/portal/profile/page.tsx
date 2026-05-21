'use client';

import { Building2, Mail, Settings, User, UserPlus } from 'lucide-react';

import { FAKE_BRAND, FAKE_CLIENT } from '../_data';
import { PortalShell } from '../_shell';

const FAKE_MEMBERS = [
  {
    name: 'An Nguyễn',
    email: 'an@cocacola.vn',
    role: 'brand_owner',
    joined: '2026-01-15',
  },
  {
    name: 'Linh Trần',
    email: 'linh@cocacola.vn',
    role: 'brand_member',
    joined: '2026-02-03',
  },
  {
    name: 'Thu Phạm',
    email: 'thu@cocacola.vn',
    role: 'brand_member',
    joined: '2026-03-18',
  },
  {
    name: 'Đức Lê',
    email: 'duc@cocacola.vn',
    role: 'brand_viewer',
    joined: '2026-04-22',
  },
];

const ROLE_LABEL: Record<string, { label: string; chip: string }> = {
  brand_owner: { label: 'Owner', chip: 'bg-rose-100 text-rose-700' },
  brand_member: { label: 'Member', chip: 'bg-blue-100 text-blue-700' },
  brand_viewer: { label: 'Viewer', chip: 'bg-zinc-100 text-zinc-700' },
};

export default function PortalProfilePage() {
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

      <div className='mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]'>
        {/* Brand info */}
        <section className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm'>
          <div className='mb-3 flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm'>
              <Building2 className='size-4' />
            </div>
            <h3 className='text-sm font-semibold'>Thông tin Brand</h3>
          </div>
          <div className='space-y-3'>
            <Field
              label='Tên Brand'
              value={FAKE_BRAND.name}
              hint='Chỉ Staff Rexer có thể đổi'
              readonly
            />
            <Field
              label='Slug (URL identifier)'
              value={FAKE_BRAND.slug}
              hint='Cố định — không thể đổi sau khi tạo'
              readonly
            />
            <Field
              label='Email liên hệ (Client)'
              value={FAKE_CLIENT.contact_email}
            />
            <Field label='Industry' value={FAKE_BRAND.industry ?? ''} />
            <Field
              label='Plan'
              value='Phase 1 — Managed Service'
              hint='Đang chạy'
              readonly
            />
            <div className='pt-2'>
              <button className='rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </section>

        {/* Brand logo + plan info */}
        <aside className='space-y-4'>
          <div className='rounded-2xl border border-zinc-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm'>
            <div className='text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
              Logo
            </div>
            <div className='mt-3 flex items-center gap-3'>
              <div
                className={`flex size-16 items-center justify-center rounded-2xl ${FAKE_BRAND.logo_color} font-mono text-xl font-bold text-white shadow-md`}
              >
                {FAKE_BRAND.logo_initial}
              </div>
              <div className='flex-1'>
                <button className='block rounded-lg border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium hover:bg-zinc-100'>
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
              Workspace ID
            </div>
            <code className='mt-2 block rounded-lg bg-zinc-50 px-2 py-1.5 font-mono text-[11px] break-all text-zinc-600'>
              {FAKE_BRAND.id}
            </code>
            <p className='mt-2 text-[11px] text-zinc-500'>
              Dùng khi liên hệ support hoặc tích hợp API.
            </p>
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
              Thành viên ({FAKE_MEMBERS.length})
            </h3>
          </div>
          <button className='flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600'>
            <UserPlus className='size-3' /> Invite member
          </button>
        </div>
        <div className='divide-y divide-zinc-100'>
          {FAKE_MEMBERS.map(m => {
            const role = ROLE_LABEL[m.role];
            return (
              <div
                key={m.email}
                className='flex items-center gap-3 py-3 first:pt-0 last:pb-0'
              >
                <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 font-mono text-[11px] font-bold text-white shadow-sm'>
                  {m.name
                    .split(' ')
                    .map(s => s[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='text-[13px] font-semibold'>{m.name}</div>
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
                  từ {m.joined}
                </span>
              </div>
            );
          })}
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
}: {
  label: string;
  value: string;
  hint?: string;
  readonly?: boolean;
}) {
  return (
    <div>
      <label className='text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
        {label}
      </label>
      <input
        type='text'
        defaultValue={value}
        readOnly={readonly}
        className={`mt-1 w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-[13px] outline-none focus:border-zinc-400 ${
          readonly ? 'bg-zinc-50 text-zinc-500' : 'bg-white'
        }`}
      />
      {hint && <p className='mt-1 text-[10.5px] text-zinc-400'>{hint}</p>}
    </div>
  );
}
