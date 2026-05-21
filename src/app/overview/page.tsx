'use client';

import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Clock,
  Compass,
  Copy,
  Cpu,
  Database,
  Inbox,
  LayoutGrid,
  LayoutTemplate,
  MousePointerClick,
  PenLine,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Table,
  TrendingUp,
  Users,
  Wallet,
  Wand2,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  MockAdminDash,
  MockAIGen,
  MockAITemplates,
  MockAIUsage,
  MockArchitecture,
  MockAuth,
  MockCanvasEditor,
  MockCanvasList,
  MockCollections,
  MockExtraElements,
  MockMasterData,
  MockNotifications,
  MockOverview,
  MockProducts,
  MockRoles,
  MockSavedBlocks,
  MockSettings,
} from './_mockups';

/* ---------- accents ---------- */

type Accent =
  | 'slate'
  | 'rose'
  | 'emerald'
  | 'violet'
  | 'fuchsia'
  | 'blue'
  | 'cyan'
  | 'sky'
  | 'amber'
  | 'orange'
  | 'zinc'
  | 'indigo';

const ACCENT: Record<
  Accent,
  {
    bg: string;
    bgSoft: string;
    border: string;
    text: string;
    chip: string;
    gradient: string;
  }
> = {
  slate: {
    bg: 'bg-slate-500',
    bgSoft: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    chip: 'bg-slate-100 text-slate-700',
    gradient: 'from-slate-100 to-white',
  },
  rose: {
    bg: 'bg-rose-500',
    bgSoft: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-600',
    chip: 'bg-rose-100 text-rose-700',
    gradient: 'from-rose-100 to-white',
  },
  emerald: {
    bg: 'bg-emerald-500',
    bgSoft: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    chip: 'bg-emerald-100 text-emerald-700',
    gradient: 'from-emerald-100 to-white',
  },
  violet: {
    bg: 'bg-violet-500',
    bgSoft: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-600',
    chip: 'bg-violet-100 text-violet-700',
    gradient: 'from-violet-100 to-white',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500',
    bgSoft: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    text: 'text-fuchsia-600',
    chip: 'bg-fuchsia-100 text-fuchsia-700',
    gradient: 'from-fuchsia-100 to-white',
  },
  blue: {
    bg: 'bg-blue-500',
    bgSoft: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    chip: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-100 to-white',
  },
  cyan: {
    bg: 'bg-cyan-500',
    bgSoft: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    chip: 'bg-cyan-100 text-cyan-700',
    gradient: 'from-cyan-100 to-white',
  },
  sky: {
    bg: 'bg-sky-500',
    bgSoft: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-600',
    chip: 'bg-sky-100 text-sky-700',
    gradient: 'from-sky-100 to-white',
  },
  amber: {
    bg: 'bg-amber-500',
    bgSoft: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    chip: 'bg-amber-100 text-amber-700',
    gradient: 'from-amber-100 to-white',
  },
  orange: {
    bg: 'bg-orange-500',
    bgSoft: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    chip: 'bg-orange-100 text-orange-700',
    gradient: 'from-orange-100 to-white',
  },
  zinc: {
    bg: 'bg-zinc-500',
    bgSoft: 'bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-600',
    chip: 'bg-zinc-100 text-zinc-700',
    gradient: 'from-zinc-100 to-white',
  },
  indigo: {
    bg: 'bg-indigo-500',
    bgSoft: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    chip: 'bg-indigo-100 text-indigo-700',
    gradient: 'from-indigo-100 to-white',
  },
};

/* ---------- use case helpers ---------- */

type ActorName = 'Admin' | 'BrandClient' | 'User' | 'Guest' | 'AI' | 'System';

const ALL_ACTORS: ActorName[] = [
  'Admin',
  'BrandClient',
  'User',
  'Guest',
  'AI',
  'System',
];

const ACTOR_COLOR: Record<ActorName, string> = {
  Admin: 'bg-orange-500',
  BrandClient: 'bg-teal-500',
  User: 'bg-blue-500',
  Guest: 'bg-zinc-500',
  AI: 'bg-fuchsia-500',
  System: 'bg-indigo-500',
};

function ActorBadge({ actor }: { actor: ActorName }) {
  return (
    <span
      className={`shrink-0 rounded ${ACTOR_COLOR[actor]} px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide text-white`}
    >
      {actor.toUpperCase()}
    </span>
  );
}

type UC = {
  id: string;
  actor: ActorName;
  title: string;
  goal?: string;
  steps: React.ReactNode[];
};

function UseCaseCard({ uc }: { uc: UC }) {
  return (
    <div className='rounded-xl border border-zinc-200 bg-white/70 p-3 transition-colors hover:bg-white'>
      <div className='mb-2 flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <span className='rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white'>
              UC-{uc.id}
            </span>
            <h3 className='text-[13.5px] font-semibold text-zinc-900'>
              {uc.title}
            </h3>
          </div>
          {uc.goal && (
            <p className='mt-1 text-[11.5px] text-zinc-500 italic'>
              <span className='font-medium not-italic'>Mục tiêu:</span>{' '}
              {uc.goal}
            </p>
          )}
        </div>
        <ActorBadge actor={uc.actor} />
      </div>
      <ol className='space-y-1 text-[13px] leading-snug text-zinc-700 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[11.5px]'>
        {uc.steps.map((s, i) => (
          <li key={i} className='flex gap-2'>
            <span className='mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-zinc-100 font-mono text-[9px] font-bold text-zinc-600'>
              {i + 1}
            </span>
            <span className='flex-1'>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function UseCaseList({ items }: { items: UC[] }) {
  return (
    <div className='grid grid-cols-1 gap-2.5 md:grid-cols-2'>
      {items.map(uc => (
        <UseCaseCard key={uc.id} uc={uc} />
      ))}
    </div>
  );
}

/* ---------- modules ---------- */

type Module = {
  id: string;
  num: string;
  label: string;
  short: string;
  icon: LucideIcon;
  accent: Accent;
  mockup: React.ComponentType;
  intro?: React.ReactNode;
  cases?: UC[];
};

const MODULES: Module[] = [
  {
    id: 'overview',
    num: 'I',
    label: 'Tổng quan hệ thống',
    short: 'Kiến trúc multi-actor, AI-first',
    icon: Compass,
    accent: 'slate',
    mockup: MockOverview,
    intro: (
      <>
        <p>
          <strong>Rexer AI</strong> là nền tảng{' '}
          <em>AI-powered canvas / template builder</em>: nhập prompt → Claude
          sinh blocks → user edit trên canvas Fabric.js → publish &amp; tái sử
          dụng cho catalog sản phẩm.
        </p>
        <p>
          Tài liệu này mô tả hệ thống dưới dạng <strong>use case</strong> theo
          từng actor (Admin / User / Guest / AI). Mỗi UC có{' '}
          <code>ID · Actor · Mục tiêu · Steps</code>.
        </p>
      </>
    ),
  },

  {
    id: 'roles',
    num: 'II',
    label: 'Roles & quyền',
    short: 'Admin / User / Guest',
    icon: Users,
    accent: 'rose',
    mockup: MockRoles,
    cases: [
      {
        id: 'II.01',
        actor: 'Admin',
        title: 'Promote User lên Admin',
        goal: 'Cấp quyền quản trị cho thành viên mới.',
        steps: [
          <>
            Vào <code>/admin/users</code>, tìm user theo email.
          </>,
          <>
            Mở popup chi tiết → đổi role từ <code>USER</code> sang{' '}
            <code>ADMIN</code>.
          </>,
          <>User được promote thấy menu Admin ngay lần đăng nhập kế.</>,
        ],
      },
      {
        id: 'II.02',
        actor: 'Guest',
        title: 'Sign-up thành User',
        goal: 'Chuyển từ khách thành creator.',
        steps: [
          <>
            Bấm <em>Sign-up</em> tại landing → điền email + password.
          </>,
          <>
            Hệ thống tạo account với role <code>USER</code> mặc định.
          </>,
          <>
            Auto sign-in, redirect về <code>/home</code>.
          </>,
        ],
      },
      {
        id: 'II.03',
        actor: 'User',
        title: 'Cố truy cập route Admin',
        goal: 'Middleware bảo vệ tài nguyên không phận sự.',
        steps: [
          <>
            User gõ <code>/admin</code> trên URL bar.
          </>,
          <>
            Middleware check role → không phải Admin → redirect{' '}
            <code>/sign-in</code>.
          </>,
          <>User thấy toast &quot;Bạn không có quyền&quot;.</>,
        ],
      },
    ],
  },

  {
    id: 'auth',
    num: 'III',
    label: 'Tài khoản & Auth',
    short: 'JWT · cookie httpOnly',
    icon: ShieldCheck,
    accent: 'rose',
    mockup: MockAuth,
    cases: [
      {
        id: 'III.01',
        actor: 'User',
        title: 'Đăng nhập bằng email + password',
        steps: [
          <>
            Vào <code>/sign-in</code>, nhập email + password.
          </>,
          <>BE verify, ký JWT (jose) → set cookie httpOnly.</>,
          <>
            Redirect <code>/home</code>; các request sau đính kèm cookie tự
            động.
          </>,
        ],
      },
      {
        id: 'III.02',
        actor: 'User',
        title: 'Quên mật khẩu → đặt lại',
        goal: 'Khôi phục quyền truy cập khi quên password.',
        steps: [
          <>
            Bấm <em>Forgot password</em> → nhập email.
          </>,
          <>Nhận mail chứa link reset token.</>,
          <>Click link, nhập password mới → tự động sign-in.</>,
        ],
      },
      {
        id: 'III.03',
        actor: 'Guest',
        title: 'Sign-up tài khoản mới',
        steps: [
          <>Nhập email + password (zod validate).</>,
          <>
            BE hash password (bcryptjs), lưu DB, role = <code>USER</code>.
          </>,
          <>
            Cấp JWT + redirect <code>/home</code>.
          </>,
        ],
      },
      {
        id: 'III.04',
        actor: 'System',
        title: 'Khởi tạo Admin lần đầu',
        goal: 'Auto-seed admin khi deploy môi trường mới.',
        steps: [
          <>
            Đọc <code>INIT_ADMIN_USERNAME / EMAIL / PASSWORD</code> khi server
            start.
          </>,
          <>
            Nếu chưa có admin → tạo account role <code>ADMIN</code>.
          </>,
          <>
            Log <code>[ensureInitialAdmin] Created</code> ra console.
          </>,
        ],
      },
    ],
  },

  {
    id: 'master-data',
    num: 'IV',
    label: 'Master data',
    short: 'Products · Collections · AI Templates',
    icon: Database,
    accent: 'emerald',
    mockup: MockMasterData,
    cases: [
      {
        id: 'IV.01',
        actor: 'Admin',
        title: 'Tạo Product mới làm input cho canvas',
        steps: [
          <>
            Vào <code>/admin/products</code> → <em>Create</em>.
          </>,
          <>Nhập name, description, category, pricing, upload ảnh lên S3.</>,
          <>
            Save → product xuất hiện trong showcase cho User dùng làm template.
          </>,
        ],
      },
      {
        id: 'IV.02',
        actor: 'User',
        title: 'Clone Collection mẫu',
        goal: 'Có sẵn schema booking / contact để dùng nhanh.',
        steps: [
          <>
            Vào <code>/collections</code> → tab <em>Templates</em>.
          </>,
          <>
            Pick collection có <code>is_template = true</code> → bấm{' '}
            <em>Clone</em>.
          </>,
          <>Hệ thống copy schema + records vào workspace cá nhân.</>,
        ],
      },
      {
        id: 'IV.03',
        actor: 'User',
        title: 'Dùng Collection làm data source',
        steps: [
          <>
            Mở canvas, thêm block <code>BookingForm</code>.
          </>,
          <>
            Trong settings, chọn collection → map field schema vào form field.
          </>,
          <>Khi visitor submit form, record được lưu vào collection.</>,
        ],
      },
    ],
  },

  {
    id: 'ai-templates',
    num: 'V',
    label: 'AI Templates (định nghĩa)',
    short: 'Prompt + form + block schema',
    icon: Wand2,
    accent: 'violet',
    mockup: MockAITemplates,
    cases: [
      {
        id: 'V.01',
        actor: 'Admin',
        title: 'Tạo AI template mới',
        goal: 'Cung cấp template AI cho User sinh nội dung.',
        steps: [
          <>
            Vào <code>/admin/ai-templates</code> → <em>Create</em>.
          </>,
          <>
            Định nghĩa <strong>form fields</strong> User sẽ điền (tên sản phẩm,
            mô tả, style…).
          </>,
          <>
            Viết <strong>prompt template</strong> chèn <code>{'{{biến}}'}</code>{' '}
            từ form.
          </>,
          <>Map block schema (hero / features / CTA…) Claude phải trả về.</>,
          <>
            <em>Publish</em> → template xuất hiện ở <code>/ai-templates</code>{' '}
            cho User.
          </>,
        ],
      },
      {
        id: 'V.02',
        actor: 'Admin',
        title: 'Test prompt với sample',
        goal: 'Đảm bảo output đúng schema trước khi publish.',
        steps: [
          <>Mở AI template ở chế độ edit.</>,
          <>
            Điền sample data vào form → bấm <em>Test generate</em>.
          </>,
          <>Xem JSON Claude trả về; điều chỉnh prompt cho tới khi pass.</>,
        ],
      },
      {
        id: 'V.03',
        actor: 'Admin',
        title: 'Disable template lỗi thời',
        steps: [
          <>
            Toggle <code>is_active = false</code> trên template.
          </>,
          <>Template ẩn khỏi list User, lịch sử generation vẫn giữ.</>,
        ],
      },
    ],
  },

  {
    id: 'ai-generation',
    num: 'VI',
    label: 'AI Generation Engine',
    short: 'Claude · versions · regen',
    icon: Sparkles,
    accent: 'fuchsia',
    mockup: MockAIGen,
    cases: [
      {
        id: 'VI.01',
        actor: 'User',
        title: 'Submit form → AI sinh blocks',
        goal: 'Có draft template chỉ trong vài giây.',
        steps: [
          <>
            Chọn AI template tại <code>/ai-templates/[id]</code>.
          </>,
          <>
            Điền form fields → bấm <em>Generate</em>.
          </>,
          <>
            BE gọi Claude (<code>@anthropic-ai/sdk</code>) với prompt + biến.
          </>,
          <>
            Claude trả ~4–6 blocks + image suggestions; lưu vào{' '}
            <code>AIGenerationVersion</code> (kind: <code>initial</code>).
          </>,
          <>Redirect trang review để User xem từng block.</>,
        ],
      },
      {
        id: 'VI.02',
        actor: 'User',
        title: 'Regenerate 1 block không vừa ý',
        goal: 'Sửa cục bộ thay vì gen lại toàn bộ.',
        steps: [
          <>
            Hover block trong trang review → bấm <em>Regenerate</em>.
          </>,
          <>
            Optional: thêm hint &quot;ngắn gọn hơn&quot; / &quot;thêm CTA&quot;…
          </>,
          <>
            BE gọi Claude chỉ cho block đó (kind: <code>regen</code>).
          </>,
          <>
            Tăng counter; chạm <strong>10 / session</strong> → block button.
          </>,
        ],
      },
      {
        id: 'VI.03',
        actor: 'User',
        title: 'Rollback về version trước',
        steps: [
          <>
            Mở version history (dropdown <em>v1 / v2 / v3</em>).
          </>,
          <>
            Chọn version cũ → preview → <em>Restore</em>.
          </>,
          <>Block hiện tại được thay bằng nội dung version cũ.</>,
        ],
      },
      {
        id: 'VI.04',
        actor: 'User',
        title: 'Chọn ảnh từ image suggestions',
        steps: [
          <>
            Trong block có ảnh, mở panel <em>Suggested images</em>.
          </>,
          <>Pick ảnh phù hợp → áp dụng vào block.</>,
          <>
            Asset url được lưu vào <code>image_media_ids</code> của block.
          </>,
        ],
      },
    ],
  },

  {
    id: 'canvas-editor',
    num: 'VII',
    label: 'Canvas Editor & Blocks',
    short: 'Fabric.js · drag · layers',
    icon: LayoutTemplate,
    accent: 'blue',
    mockup: MockCanvasEditor,
    cases: [
      {
        id: 'VII.01',
        actor: 'User',
        title: 'Thêm block vào canvas',
        steps: [
          <>
            Trong <code>/template/[id]</code> → bấm <em>Add block</em>.
          </>,
          <>
            Chọn loại block (HeroSplit, FeatureSection, BookingForm…) hoặc tab{' '}
            <em>Saved</em>.
          </>,
          <>Block append vào canvas; tự focus, hiện toolbar.</>,
        ],
      },
      {
        id: 'VII.02',
        actor: 'User',
        title: 'Chỉnh text / image trong block',
        steps: [
          <>
            Double-click element → inline edit text, hoặc mở dialog upload ảnh.
          </>,
          <>Thay đổi sync vào state Redux + autosave JSON canvas.</>,
        ],
      },
      {
        id: 'VII.03',
        actor: 'User',
        title: 'Reorder block qua LayersPanel',
        steps: [
          <>
            Mở <em>Layers</em> panel bên phải.
          </>,
          <>Drag-and-drop block để đổi thứ tự (z-index).</>,
          <>Canvas re-render theo thứ tự mới ngay lập tức.</>,
        ],
      },
      {
        id: 'VII.04',
        actor: 'User',
        title: 'Regenerate 1 block bằng AI từ canvas',
        steps: [
          <>
            Click block → toolbar → <em>Regenerate</em>.
          </>,
          <>
            Mở <code>RegenerateBlockDialog</code>, nhập hint mới.
          </>,
          <>AI trả block mới → thay block hiện tại (giữ position).</>,
        ],
      },
    ],
  },

  {
    id: 'extra-elements',
    num: 'VIII',
    label: 'Extra Elements',
    short: 'Hotspot · carousel · motion',
    icon: MousePointerClick,
    accent: 'cyan',
    mockup: MockExtraElements,
    cases: [
      {
        id: 'VIII.01',
        actor: 'User',
        title: 'Thêm hotspot vào hero image',
        goal: 'Điểm tương tác trên ảnh để gắn link / tooltip.',
        steps: [
          <>
            Click ảnh trong hero block → <em>Add hotspot</em> trên overlay
            toolbar.
          </>,
          <>Drag hotspot tới vị trí; cấu hình tooltip / link.</>,
          <>Save → hotspot hiển thị khi publish.</>,
        ],
      },
      {
        id: 'VIII.02',
        actor: 'User',
        title: 'Cấu hình motion cho block',
        steps: [
          <>
            Select block → mở <em>Motion timeline</em> (BlockControlsBar).
          </>,
          <>Drag keyframe: fade-in, slide, scale…</>,
          <>Preview play → save; motion chạy trên trang public.</>,
        ],
      },
      {
        id: 'VIII.03',
        actor: 'User',
        title: 'Chỉnh từng slide trong Carousel',
        steps: [
          <>
            Mở block <code>ImageCarousel</code> → tab <em>Slides</em>.
          </>,
          <>Thêm / xoá slide; mỗi slide có ảnh + caption riêng.</>,
          <>Đổi thứ tự bằng drag.</>,
        ],
      },
      {
        id: 'VIII.04',
        actor: 'User',
        title: 'Bật analytics cho element',
        steps: [
          <>
            Select element → tab <em>Analytics</em>.
          </>,
          <>
            Bật <em>Track click</em>, đặt event name.
          </>,
          <>Event ghi nhận khi visitor click trên trang public.</>,
        ],
      },
    ],
  },

  {
    id: 'saved-blocks',
    num: 'IX',
    label: 'Saved Blocks Library',
    short: 'Lưu & tái sử dụng block',
    icon: Boxes,
    accent: 'sky',
    mockup: MockSavedBlocks,
    cases: [
      {
        id: 'IX.01',
        actor: 'User',
        title: 'Lưu block hiện tại làm template',
        goal: 'Tái sử dụng block đẹp ở các canvas khác.',
        steps: [
          <>
            Click block → menu <em>Save as block</em>.
          </>,
          <>Đặt tên, optional cover; BE capture JSON + thumbnail.</>,
          <>
            Block xuất hiện ở tab <em>Saved</em> trong AddBlockDialog.
          </>,
        ],
      },
      {
        id: 'IX.02',
        actor: 'User',
        title: 'Chèn saved block vào canvas khác',
        steps: [
          <>
            Mở canvas khác → <em>Add block</em> → tab <em>Saved</em>.
          </>,
          <>
            Pick saved block → preview → <em>Insert</em>.
          </>,
          <>Block clone vào canvas; chỉnh sửa độc lập với bản gốc.</>,
        ],
      },
      {
        id: 'IX.03',
        actor: 'Admin',
        title: 'Duyệt saved block public',
        steps: [
          <>
            Vào <code>/admin/saved-blocks</code>.
          </>,
          <>Approve hoặc xoá block do User đề xuất share.</>,
          <>
            Block approved hiện cho mọi User trong tab <em>Community</em>.
          </>,
        ],
      },
    ],
  },

  {
    id: 'canvas-templates',
    num: 'X',
    label: 'Canvas Templates',
    short: 'List · share · use',
    icon: LayoutGrid,
    accent: 'blue',
    mockup: MockCanvasList,
    cases: [
      {
        id: 'X.01',
        actor: 'User',
        title: 'Browse template đã có',
        steps: [
          <>
            Vào <code>/canvas-templates</code>.
          </>,
          <>Filter theo nguồn: AI-generated / Manual / Shared.</>,
          <>
            Click thumbnail → mở <code>/template/[id]</code> để edit.
          </>,
        ],
      },
      {
        id: 'X.02',
        actor: 'User',
        title: 'Share template public',
        goal: 'Gửi khách xem mà không cần login.',
        steps: [
          <>
            Trong editor → <em>Share</em> → bật <em>Public URL</em>.
          </>,
          <>
            Copy link <code>/p/[slug]</code> gửi khách.
          </>,
          <>Khách xem read-only, không edit được.</>,
        ],
      },
      {
        id: 'X.03',
        actor: 'User',
        title: 'Dùng template từ product showcase',
        steps: [
          <>
            Vào trang sản phẩm → bấm <em>Use Template</em>.
          </>,
          <>Hệ thống nhân bản template, prefill data từ product.</>,
          <>User được đưa vào canvas edit để tinh chỉnh.</>,
        ],
      },
    ],
  },

  {
    id: 'collections',
    num: 'XI',
    label: 'Collections (data tables)',
    short: 'Airtable-style · schema động',
    icon: Table,
    accent: 'emerald',
    mockup: MockCollections,
    cases: [
      {
        id: 'XI.01',
        actor: 'User',
        title: 'Tạo Collection với schema tuỳ chỉnh',
        steps: [
          <>
            Vào <code>/collections</code> → <em>New</em>, đặt tên + slug.
          </>,
          <>Add field: text, number, dropdown, date, file, relation…</>,
          <>Save schema → bắt đầu thêm records.</>,
        ],
      },
      {
        id: 'XI.02',
        actor: 'User',
        title: 'Import records từ CSV',
        steps: [
          <>
            Trong collection detail → <em>Import</em>.
          </>,
          <>Upload CSV; map column với field schema.</>,
          <>BE validate, lưu hàng loạt, hiển thị summary lỗi nếu có.</>,
        ],
      },
      {
        id: 'XI.03',
        actor: 'User',
        title: 'Nối Collection với BookingForm',
        steps: [
          <>
            Trong block <code>BookingForm</code> → settings → chọn collection.
          </>,
          <>Map field form với field schema collection.</>,
          <>Submit form trên trang public → record được lưu.</>,
        ],
      },
    ],
  },

  {
    id: 'products',
    num: 'XII',
    label: 'Products & Showcase',
    short: 'Catalog · use-template flow',
    icon: ShoppingBag,
    accent: 'emerald',
    mockup: MockProducts,
    cases: [
      {
        id: 'XII.01',
        actor: 'User',
        title: 'Xem product → bấm Use Template',
        steps: [
          <>
            Vào <code>/product/[id]</code> ở public hoặc trong workspace.
          </>,
          <>
            Bấm <em>Use Template</em>; hệ thống prefill canvas với data product.
          </>,
          <>User tinh chỉnh và publish.</>,
        ],
      },
      {
        id: 'XII.02',
        actor: 'User',
        title: 'Save trang sản phẩm hiện tại làm template',
        steps: [
          <>
            Mở canvas đang gắn product → menu <em>Save as Template</em>.
          </>,
          <>Đặt tên + tags; template xuất hiện trong list của User.</>,
        ],
      },
      {
        id: 'XII.03',
        actor: 'Admin',
        title: 'Quản lý catalog Products',
        steps: [
          <>
            Vào <code>/admin/products</code>: list / search / filter.
          </>,
          <>Tạo / sửa / xoá; toggle hiển thị public.</>,
        ],
      },
    ],
  },

  {
    id: 'notifications',
    num: 'XIII',
    label: 'Notifications & Feedback',
    short: 'Toast · FAB · /notification',
    icon: Bell,
    accent: 'amber',
    mockup: MockNotifications,
    cases: [
      {
        id: 'XIII.01',
        actor: 'User',
        title: 'Nhận toast khi save thành công',
        steps: [
          <>
            Bấm <em>Save</em> trên canvas.
          </>,
          <>
            BE response 200 → trigger toast <code>Sonner</code> &quot;Đã
            lưu&quot;.
          </>,
          <>Toast auto-dismiss sau 3s.</>,
        ],
      },
      {
        id: 'XIII.02',
        actor: 'User',
        title: 'Gửi feedback qua FAB',
        goal: 'Báo bug hoặc đề xuất feature trực tiếp.',
        steps: [
          <>Click nút FAB (góc dưới-phải mọi trang).</>,
          <>Chọn loại: Bug / Suggestion / Question; viết nội dung.</>,
          <>
            Submit → feedback vào <code>/admin/feedback</code>.
          </>,
        ],
      },
      {
        id: 'XIII.03',
        actor: 'Admin',
        title: 'Duyệt feedback',
        steps: [
          <>
            Vào <code>/admin/feedback</code>; list theo trạng thái.
          </>,
          <>
            Mở chi tiết, reply hoặc đánh dấu <em>Resolved</em>.
          </>,
        ],
      },
    ],
  },

  {
    id: 'admin',
    num: 'XIV',
    label: 'Admin Dashboard',
    short: '8 tabs · stats · CRUD',
    icon: LayoutGrid,
    accent: 'orange',
    mockup: MockAdminDash,
    cases: [
      {
        id: 'XIV.01',
        actor: 'Admin',
        title: 'Nắm tình trạng hệ thống trong 30 giây',
        steps: [
          <>
            Vào <code>/admin</code> → trang Overview.
          </>,
          <>Đọc 4 stat cards: products, templates, users, AI usage.</>,
          <>Bấm quick action: tạo product / template mới.</>,
        ],
      },
      {
        id: 'XIV.02',
        actor: 'Admin',
        title: 'Tìm & sửa nhanh 1 product',
        steps: [
          <>
            Tab <em>Products</em> → search theo name / slug.
          </>,
          <>Click row → edit inline hoặc mở form chi tiết.</>,
          <>Save; thay đổi thấy ngay ở showcase.</>,
        ],
      },
      {
        id: 'XIV.03',
        actor: 'Admin',
        title: 'Quản lý Users',
        steps: [
          <>
            Tab <em>Users</em>: list, filter theo role, ngày tạo.
          </>,
          <>Mở user → xem usage stats; ban / unban; reset password.</>,
        ],
      },
    ],
  },

  {
    id: 'ai-usage',
    num: 'XV',
    label: 'AI Usage Analytics',
    short: 'Requests · tokens · quotas',
    icon: BarChart3,
    accent: 'amber',
    mockup: MockAIUsage,
    cases: [
      {
        id: 'XV.01',
        actor: 'Admin',
        title: 'Theo dõi AI request theo ngày',
        steps: [
          <>
            Vào <code>/admin/ai-usage</code>.
          </>,
          <>Xem biểu đồ request, token cost theo tuần / tháng.</>,
          <>Filter theo template để biết cái nào dùng nhiều nhất.</>,
        ],
      },
      {
        id: 'XV.02',
        actor: 'Admin',
        title: 'Phát hiện User dùng quá nhiều',
        steps: [
          <>
            Mở tab <em>Top users</em>.
          </>,
          <>Sort theo regenerate count / token.</>,
          <>Liên hệ user hoặc đặt hạn mức tuỳ chỉnh.</>,
        ],
      },
      {
        id: 'XV.03',
        actor: 'User',
        title: 'Chạm quota regenerate',
        steps: [
          <>User regenerate lần thứ 10 trong session.</>,
          <>
            BE trả lỗi <code>QuotaExceeded</code>; FE block nút.
          </>,
          <>Toast hướng dẫn refresh / sang session mới.</>,
        ],
      },
    ],
  },

  {
    id: 'settings',
    num: 'XVI',
    label: 'Settings & i18n',
    short: 'Profile · locale · theme',
    icon: Settings,
    accent: 'zinc',
    mockup: MockSettings,
    cases: [
      {
        id: 'XVI.01',
        actor: 'User',
        title: 'Đổi mật khẩu',
        steps: [
          <>
            Vào <code>/setting</code> → tab <em>Security</em>.
          </>,
          <>Nhập password cũ + password mới (zod validate độ mạnh).</>,
          <>Save → toast thành công; session vẫn giữ.</>,
        ],
      },
      {
        id: 'XVI.02',
        actor: 'User',
        title: 'Chuyển ngôn ngữ EN ↔ VI',
        steps: [
          <>Bấm language switcher ở header.</>,
          <>
            Set cookie <code>LANGUAGE</code>; next-intl reload messages.
          </>,
          <>Toàn bộ UI dịch lại không cần refresh thủ công.</>,
        ],
      },
      {
        id: 'XVI.03',
        actor: 'User',
        title: 'Bật Dark mode',
        steps: [
          <>Toggle theme ở header.</>,
          <>
            <code>next-themes</code> set class <code>dark</code> trên html.
          </>,
          <>Lưu vào localStorage; áp dụng lần sau.</>,
        ],
      },
    ],
  },

  {
    id: 'client-portal',
    num: 'XVII',
    label: 'Brand Client Portal (Phase 1)',
    short: 'Managed service · brand workspace',
    icon: Boxes,
    accent: 'cyan',
    mockup: MockAdminDash,
    intro: (
      <>
        <p>
          <strong>Phase 1 business model</strong>: Rexer cung cấp dịch vụ quản
          lý cho brand lớn — Staff làm hết template, AI, design. Brand chỉ login
          để xem kết quả + cung cấp content. Cần workspace + role mới.
        </p>
      </>
    ),
    cases: [
      {
        id: 'XVII.01',
        actor: 'Admin',
        title: 'Onboard brand mới',
        goal: 'Tạo workspace + cấp account cho khách hàng.',
        steps: [
          <>
            Staff Rexer vào <code>/admin/workspaces</code> → <em>Create</em>.
          </>,
          <>Nhập tên brand, slug, logo, contact email.</>,
          <>Invite Brand Client qua email — hệ thống gửi link set password.</>,
          <>
            Brand login vào <code>/portal</code> với scope = workspace của họ.
          </>,
        ],
      },
      {
        id: 'XVII.02',
        actor: 'BrandClient',
        title: 'Xem dashboard analytics của brand',
        goal: 'Theo dõi performance landing pages mà Rexer làm.',
        steps: [
          <>
            Login vào <code>/portal</code>.
          </>,
          <>
            Dashboard hiển thị 6 stat: templates đã làm, lượt xem, visitor,
            click, lead, asset.
          </>,
          <>Recent activity: Rexer mới publish/sửa template gì.</>,
          <>Click stat → trang chi tiết tương ứng.</>,
        ],
      },
      {
        id: 'XVII.03',
        actor: 'BrandClient',
        title: 'Upload tài liệu / hình ảnh cho Rexer',
        goal: 'Cung cấp content để Staff dùng làm input AI / canvas.',
        steps: [
          <>
            Vào <code>/portal/assets</code>.
          </>,
          <>Kéo-thả file vào dropzone (image, video, PDF, doc).</>,
          <>Hệ thống upload S3, tag với brand_id + optional campaign.</>,
          <>Staff Rexer nhận notification → dùng asset trong canvas editor.</>,
        ],
      },
      {
        id: 'XVII.04',
        actor: 'BrandClient',
        title: 'Comment trên template để yêu cầu sửa',
        steps: [
          <>
            Mở template trong <code>/portal/templates/[id]</code>.
          </>,
          <>
            Nhập comment: &quot;đổi màu CTA sang xanh&quot;, &quot;text hero cần
            ngắn hơn&quot;.
          </>,
          <>Staff nhận notification, sửa template, mark resolved.</>,
        ],
      },
      {
        id: 'XVII.05',
        actor: 'Admin',
        title: 'Xem queue request từ brands',
        goal: 'Staff theo dõi việc cần làm.',
        steps: [
          <>
            Vào <code>/admin/inbox</code> hoặc widget trên admin dashboard.
          </>,
          <>Filter theo brand, ưu tiên, trạng thái.</>,
          <>Take ticket → sửa template → publish → đánh dấu resolved.</>,
        ],
      },
      {
        id: 'XVII.06',
        actor: 'BrandClient',
        title: 'Xem chi tiết analytics 1 template',
        steps: [
          <>
            Click template trong list → mở trang analytics scoped per-template.
          </>,
          <>Xem views/visitors/clicks/CTR + funnel + slide-level.</>,
          <>Export CSV để báo cáo nội bộ brand (nice-to-have).</>,
        ],
      },
    ],
  },

  {
    id: 'architecture',
    num: 'XVIII',
    label: 'Architecture & Tech stack',
    short: 'Next 15 · Fabric · Claude · S3',
    icon: Cpu,
    accent: 'indigo',
    mockup: MockArchitecture,
    intro: (
      <ul>
        <li>
          <b>Frontend</b> — Next.js 15 (App Router + Turbopack), React 19,
          Tailwind v4, Radix UI.
        </li>
        <li>
          <b>Canvas</b> — Fabric.js 7, GSAP, Framer Motion, Swiper.
        </li>
        <li>
          <b>Backend</b> — Next.js API routes, Mongoose, JWT (jose), AWS S3,
          Firebase.
        </li>
        <li>
          <b>AI</b> — Anthropic Claude (Opus / Sonnet) qua{' '}
          <code>@anthropic-ai/sdk</code>.
        </li>
        <li>
          <b>State</b> — Redux Toolkit, react-hook-form + zod, immer.
        </li>
        <li>
          <b>Quality</b> — ESLint, Prettier, Husky, lint-staged, commitlint,
          Playwright.
        </li>
      </ul>
    ),
  },
];

/* ---------- workflow ---------- */

type WfStep = {
  num: string;
  title: string;
  story: string;
  outcome: string;
  time: string;
  actor: string;
  icon: LucideIcon;
  accent: Accent;
};

const WORKFLOW: WfStep[] = [
  {
    num: '01',
    title: 'Ghé thăm lần đầu',
    story:
      'Khách lướt landing, bị thu hút bởi demo → đăng ký 30 giây để trở thành Creator.',
    outcome: 'Account miễn phí',
    time: '~30s',
    actor: 'GUEST',
    icon: Search,
    accent: 'rose',
  },
  {
    num: '02',
    title: 'Khơi nguồn ý tưởng',
    story:
      'Creator chọn AI template phù hợp, gõ vài dòng mô tả sản phẩm bằng tiếng Việt.',
    outcome: 'Brief gửi cho AI',
    time: '~1 phút',
    actor: 'USER',
    icon: Wand2,
    accent: 'violet',
  },
  {
    num: '03',
    title: 'AI dệt nội dung',
    story:
      'Claude đọc brief, tự sinh 4–6 block hoàn chỉnh kèm ảnh gợi ý — sẵn sàng để review.',
    outcome: 'Draft 80% hoàn thiện',
    time: '~8s',
    actor: 'AI',
    icon: Sparkles,
    accent: 'fuchsia',
  },
  {
    num: '04',
    title: 'Tinh chỉnh trên canvas',
    story:
      'Creator kéo-thả block, sửa text inline, gắn motion & hotspot trên Fabric.js canvas.',
    outcome: 'Canvas đẹp như ý',
    time: '~10 phút',
    actor: 'USER',
    icon: LayoutTemplate,
    accent: 'blue',
  },
  {
    num: '05',
    title: 'Phát hành ra thế giới',
    story:
      'Lưu canvas → bật public URL chia sẻ, hoặc gắn vào product showcase để khách đặt mua.',
    outcome: 'Trang đi live',
    time: '~5s',
    actor: 'USER',
    icon: Send,
    accent: 'emerald',
  },
  {
    num: '06',
    title: 'Đo lường & cải thiện',
    story:
      'Admin theo dõi AI usage, đọc feedback từ Creator để tinh chỉnh prompt cho lần sau.',
    outcome: 'Vòng lặp cải tiến',
    time: 'hàng ngày',
    actor: 'ADMIN',
    icon: BarChart3,
    accent: 'amber',
  },
];

/* ---------- page ---------- */

export default function OverviewPage() {
  const [navOpen, setNavOpen] = useState(true);
  const [active, setActive] = useState<string>('overview');
  const [selected, setSelected] = useState<Set<ActorName>>(
    () => new Set(ALL_ACTORS)
  );

  // Hydrate from ?actor=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = params.get('actor');
    if (!a) return;
    const arr = a
      .split(',')
      .filter((x): x is ActorName => ALL_ACTORS.includes(x as ActorName));
    if (arr.length) setSelected(new Set(arr));
  }, []);

  // Sync to URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selected.size === ALL_ACTORS.length || selected.size === 0) {
      url.searchParams.delete('actor');
    } else {
      url.searchParams.set('actor', Array.from(selected).join(','));
    }
    window.history.replaceState({}, '', url);
  }, [selected]);

  const toggleActor = (a: ActorName) =>
    setSelected(s => {
      const n = new Set(s);
      if (n.has(a)) n.delete(a);
      else n.add(a);
      return n.size === 0 ? new Set(ALL_ACTORS) : n;
    });

  const resetActors = () => setSelected(new Set(ALL_ACTORS));

  const totalCounts = useMemo(() => {
    const c: Record<ActorName, number> = {
      Admin: 0,
      BrandClient: 0,
      User: 0,
      Guest: 0,
      AI: 0,
      System: 0,
    };
    for (const m of MODULES) for (const uc of m.cases ?? []) c[uc.actor]++;
    return c;
  }, []);

  const totalUC = useMemo(
    () => MODULES.reduce((s, m) => s + (m.cases?.length ?? 0), 0),
    []
  );

  const visibleCountsPerModule = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of MODULES) {
      map[m.id] = m.cases?.filter(uc => selected.has(uc.actor)).length ?? 0;
    }
    return map;
  }, [selected]);

  const visibleUC = useMemo(
    () => Object.values(visibleCountsPerModule).reduce((s, n) => s + n, 0),
    [visibleCountsPerModule]
  );

  const isFiltered = selected.size < ALL_ACTORS.length;

  useEffect(() => {
    const sections = MODULES.map(n => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => !!el
    );
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <div className='min-h-screen bg-zinc-50 text-zinc-900 antialiased'>
      <header className='sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-6 py-3 backdrop-blur'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => setNavOpen(v => !v)}
            className='rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100'
          >
            {navOpen ? '×' : '☰'} Điều hướng
          </button>
          <div className='flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm'>
              <Sparkles className='size-3.5' />
            </div>
            <span className='text-sm font-semibold tracking-tight'>
              Rexer AI — Use Cases
            </span>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <a
            href='/overview/guide'
            className='hidden items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 sm:inline-flex'
          >
            <BookOpen className='size-3.5' /> Hướng dẫn
          </a>
          <a
            href='/overview/document-BE'
            className='hidden items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 sm:inline-flex'
          >
            <Cpu className='size-3.5' /> BE Docs
          </a>
          <a
            href='/overview/portal-demo'
            className='hidden items-center gap-1.5 rounded-lg border border-cyan-300 bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700 hover:bg-cyan-100 sm:inline-flex'
          >
            <Boxes className='size-3.5' /> Portal Demo
          </a>
          <a
            href='/portal'
            className='hidden items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 sm:inline-flex'
          >
            <Boxes className='size-3.5' /> /portal LIVE
          </a>
          <span className='rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm'>
            {visibleUC}/{totalUC} UC · {MODULES.length} modules
          </span>
        </div>
      </header>

      <FilterBar
        selected={selected}
        counts={totalCounts}
        visible={visibleUC}
        total={totalUC}
        isFiltered={isFiltered}
        onToggle={toggleActor}
        onReset={resetActors}
      />

      <div className='flex'>
        {navOpen && (
          <Sidebar
            active={active}
            visibleCounts={visibleCountsPerModule}
            isFiltered={isFiltered}
          />
        )}

        <main className='mx-auto w-full max-w-5xl px-5 py-8 lg:px-10'>
          <Hero />
          <ValueProp />
          <ActorsCards />
          <BigWorkflow />

          {visibleUC === 0 && isFiltered && (
            <div className='mb-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center'>
              <div className='text-sm font-medium text-zinc-700'>
                Không có use case nào khớp filter.
              </div>
              <button
                onClick={resetActors}
                className='mt-3 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'
              >
                Reset filter
              </button>
            </div>
          )}

          {MODULES.map(m => (
            <ModuleSection key={m.id} m={m} selected={selected} />
          ))}

          <footer className='mt-16 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm'>
            <div className='flex items-start gap-3'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'>
                <Activity className='size-5' />
              </div>
              <div>
                <div className='font-semibold text-zinc-900'>
                  Tài liệu use-case sống
                </div>
                <p className='mt-1 leading-relaxed'>
                  Mỗi UC mô tả 1 hành vi thực tế của Actor lên hệ thống. Khi
                  thêm feature, tạo UC mới (format{' '}
                  <code className='rounded bg-zinc-100 px-1'>UC-Mục.Số</code>)
                  trong module tương ứng.
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function FilterBar({
  selected,
  counts,
  visible,
  total,
  isFiltered,
  onToggle,
  onReset,
}: {
  selected: Set<ActorName>;
  counts: Record<ActorName, number>;
  visible: number;
  total: number;
  isFiltered: boolean;
  onToggle: (a: ActorName) => void;
  onReset: () => void;
}) {
  return (
    <div className='sticky top-[57px] z-20 border-b border-zinc-200 bg-white/95 px-6 py-2.5 backdrop-blur'>
      <div className='flex flex-wrap items-center gap-3'>
        <span className='text-[10px] font-semibold tracking-wider text-zinc-500 uppercase'>
          Lọc theo actor
        </span>
        <div className='flex flex-wrap items-center gap-1.5'>
          {ALL_ACTORS.map(a => {
            const active = selected.has(a);
            const color = ACTOR_COLOR[a];
            return (
              <button
                key={a}
                onClick={() => onToggle(a)}
                className={`group flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                  active
                    ? `${color} border-transparent text-white shadow-sm`
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${active ? 'bg-white' : color}`}
                />
                {a}
                <span
                  className={`rounded px-1 font-mono text-[10px] ${
                    active ? 'bg-white/25' : 'bg-zinc-100'
                  }`}
                >
                  {counts[a]}
                </span>
              </button>
            );
          })}
        </div>
        <div className='ml-auto flex items-center gap-2 text-xs'>
          <span className='font-mono text-zinc-700'>
            <span
              className={
                isFiltered ? 'font-bold text-zinc-900' : 'text-zinc-500'
              }
            >
              {visible}
            </span>
            <span className='text-zinc-400'>/{total} UC</span>
          </span>
          {isFiltered && (
            <button
              onClick={onReset}
              className='rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-zinc-600 transition-colors hover:bg-zinc-100'
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  active,
  visibleCounts,
  isFiltered,
}: {
  active: string;
  visibleCounts: Record<string, number>;
  isFiltered: boolean;
}) {
  return (
    <aside className='sticky top-[105px] hidden h-[calc(100vh-105px)] w-72 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white px-4 py-6 lg:block'>
      <div className='mb-4 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
        {MODULES.length} modules
      </div>
      <nav className='flex flex-col gap-0.5'>
        {MODULES.map(n => {
          const a = ACCENT[n.accent];
          const isActive = active === n.id;
          const Icon = n.icon;
          const count = visibleCounts[n.id] ?? 0;
          const dimmed = isFiltered && count === 0 && !n.intro;
          return (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : dimmed
                    ? 'text-zinc-300'
                    : 'text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-md ${
                  isActive ? a.bg : dimmed ? 'bg-zinc-50' : a.bgSoft
                } ${isActive ? 'text-white' : dimmed ? 'text-zinc-300' : a.text}`}
              >
                <Icon className='size-3.5' />
              </span>
              <span className='flex-1 leading-snug'>{n.label}</span>
              {n.cases && (
                <span
                  className={`rounded px-1 font-mono text-[9px] ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : dimmed
                        ? 'bg-zinc-50 text-zinc-300'
                        : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              )}
              <span
                className={`font-mono text-[10px] ${dimmed ? 'text-zinc-300' : 'text-zinc-400'}`}
              >
                {n.num}
              </span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

function Hero() {
  return (
    <section className='relative mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm'>
      <div className='absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 opacity-70' />
      <div
        className='absolute -top-12 -right-12 size-48 rounded-full bg-violet-200 blur-3xl'
        aria-hidden
      />
      <div
        className='absolute -bottom-16 -left-12 size-48 rounded-full bg-fuchsia-200 blur-3xl'
        aria-hidden
      />
      <div className='relative'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-[11px] font-medium text-white shadow-sm'>
            <Sparkles className='size-3' /> Use-case driven documentation
          </span>
          <span className='inline-flex items-center gap-1.5 rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-[11px] font-bold text-cyan-700'>
            ⚡ Phase 1 — Managed service
          </span>
        </div>
        <h1 className='mt-4 text-4xl font-bold tracking-tight md:text-5xl'>
          Rexer AI{' '}
          <span className='bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent'>
            Use Cases
          </span>
        </h1>
        <p className='mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 md:text-base'>
          <strong>Phase 1</strong>: Rexer cung cấp <em>managed service</em> cho
          brand lớn — Staff làm hết template + landing; brand login portal để
          xem analytics &amp; upload assets. 6 actor, 56+ use cases.
        </p>
        <div className='mt-5 flex flex-wrap gap-2'>
          <ActorBadge actor='Admin' />
          <ActorBadge actor='BrandClient' />
          <ActorBadge actor='User' />
          <ActorBadge actor='Guest' />
          <ActorBadge actor='AI' />
          <ActorBadge actor='System' />
        </div>
      </div>
    </section>
  );
}

function ValueProp() {
  const items: {
    icon: LucideIcon;
    problem: string;
    solution: string;
    ref: string;
    gain: string;
    accent: Accent;
  }[] = [
    {
      icon: Clock,
      problem:
        'Thiết kế landing page tốn 1–2 tuần (designer + dev + sửa qua lại).',
      solution:
        'Mô tả sản phẩm vài dòng → AI sinh template hoàn chỉnh trong < 10 giây.',
      ref: 'UC-VI.01',
      gain: 'Nhanh hơn ~10.000×',
      accent: 'violet',
    },
    {
      icon: Wallet,
      problem:
        'Thuê agency 10–30 triệu / landing — đắt với SMB & người kinh doanh nhỏ.',
      solution:
        'Creator tự sinh + tự edit + tự publish — không tốn phí thiết kế.',
      ref: 'UC-VI · VII',
      gain: 'Tiết kiệm 100% phí design',
      accent: 'emerald',
    },
    {
      icon: PenLine,
      problem: 'Viết copy hấp dẫn khó: phải thuê copywriter hoặc tự vò đầu.',
      solution:
        'Claude viết copy tiếng Việt tự nhiên theo style đã chọn (luxury, casual, bold…).',
      ref: 'UC-V.01 · VI.01',
      gain: 'Hết "writer\'s block"',
      accent: 'fuchsia',
    },
    {
      icon: Copy,
      problem:
        'Mỗi sản phẩm mới phải redesign từ đầu — copy-paste manual rất mệt.',
      solution:
        'Save block / template → 1 click clone & prefill từ Product data.',
      ref: 'UC-IX.01 · X.03',
      gain: 'Tái sử dụng 100%',
      accent: 'sky',
    },
    {
      icon: Inbox,
      problem:
        'Form Google Form rời rạc, không gắn liền template, khó quản lý lead.',
      solution:
        'BookingForm + Collections — visitor submit → record vào DB của Creator ngay.',
      ref: 'UC-XI.03',
      gain: 'Lead nằm trong app',
      accent: 'blue',
    },
    {
      icon: TrendingUp,
      problem: 'Không biết khách click gì, hover gì, drop-off đâu — đoán mò.',
      solution:
        'Bật analytics per-element ngay trong editor — event tracking ra dashboard.',
      ref: 'UC-VIII.04 · XV.01',
      gain: 'Quyết định bằng data',
      accent: 'amber',
    },
  ];
  return (
    <section className='mb-10'>
      <div className='mb-3 flex items-baseline justify-between gap-3'>
        <SectionLabel>Vì sao Rexer AI tồn tại</SectionLabel>
        <span className='text-[11px] text-zinc-500'>
          6 pain points · 6 cách Rexer trả lời
        </span>
      </div>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
        {items.map(it => {
          const c = ACCENT[it.accent];
          const Icon = it.icon;
          return (
            <div
              key={it.ref}
              className='group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'
            >
              {/* Problem half */}
              <div className='border-b border-dashed border-zinc-200 bg-gradient-to-br from-rose-50/60 to-white px-4 pt-4 pb-3'>
                <div className='mb-2 flex items-center justify-between'>
                  <span className='inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-rose-700'>
                    <span className='text-[11px] leading-none'>✕</span> VẤN ĐỀ
                  </span>
                  <Icon className='size-4 text-rose-300' />
                </div>
                <p className='text-[13px] leading-snug text-zinc-700'>
                  {it.problem}
                </p>
              </div>

              {/* Arrow divider */}
              <div className='relative -mt-3 mb-1 flex justify-center'>
                <span
                  className={`flex size-6 items-center justify-center rounded-full border-2 border-white ${c.bg} text-white shadow-sm`}
                >
                  <span className='text-[12px] leading-none'>↓</span>
                </span>
              </div>

              {/* Solution half */}
              <div className={`bg-gradient-to-br ${c.gradient} px-4 pt-2 pb-4`}>
                <div className='mb-2 flex items-center justify-between'>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full ${c.chip} px-2 py-0.5 text-[10px] font-bold tracking-wide`}
                  >
                    <Sparkles className='size-2.5' /> REXER
                  </span>
                  <span
                    className={`rounded-full bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold ${c.text} shadow-sm`}
                  >
                    {it.ref}
                  </span>
                </div>
                <p className='text-[13px] leading-snug text-zinc-800'>
                  {it.solution}
                </p>
                <div className='mt-2.5 flex items-center gap-1.5 border-t border-white/60 pt-2'>
                  <span className={`text-base leading-none ${c.text}`}>✓</span>
                  <span className={`text-[11.5px] font-semibold ${c.text}`}>
                    {it.gain}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ActorsCards() {
  const actors = [
    {
      code: 'ADMIN',
      name: 'Staff Rexer',
      scope: 'Internal — design, AI, manage mọi brand',
      accent: 'orange' as Accent,
      icon: ShieldCheck,
      phase: 'Phase 1 ✓',
    },
    {
      code: 'BRAND',
      name: 'Brand Client',
      scope: 'Khách hàng — xem analytics + upload assets',
      accent: 'cyan' as Accent,
      icon: Boxes,
      phase: 'Phase 1 NEW',
    },
    {
      code: 'USER',
      name: 'Creator',
      scope: 'Self-serve user (Phase 2+)',
      accent: 'blue' as Accent,
      icon: Users,
    },
    {
      code: 'GUEST',
      name: 'Visitor',
      scope: 'Xem trang public /p/[slug]',
      accent: 'zinc' as Accent,
      icon: Users,
    },
    {
      code: 'AI',
      name: 'Claude API',
      scope: 'Sinh blocks + image suggestions',
      accent: 'fuchsia' as Accent,
      icon: Sparkles,
    },
    {
      code: 'SYSTEM',
      name: 'Background',
      scope: 'Init admin, cron, middleware',
      accent: 'indigo' as Accent,
      icon: Cpu,
    },
  ];
  return (
    <section className='mb-8'>
      <SectionLabel>Actors · Phase 1 — Managed service model</SectionLabel>
      <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6'>
        {actors.map(a => {
          const c = ACCENT[a.accent];
          const Icon = a.icon;
          return (
            <div
              key={a.code}
              className={`group relative overflow-hidden rounded-2xl border ${c.border} bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div
                className={`absolute top-0 left-0 h-1 w-full ${c.bg}`}
                aria-hidden
              />
              <div className='flex items-start justify-between'>
                <div
                  className={`flex size-9 items-center justify-center rounded-xl ${c.bg} text-white shadow-sm`}
                >
                  <Icon className='size-[18px]' />
                </div>
                {a.phase && (
                  <span
                    className={`rounded-full ${c.bg} px-1.5 py-0.5 text-[9px] font-bold text-white`}
                  >
                    {a.phase}
                  </span>
                )}
              </div>
              <div className='mt-3 font-mono text-[10px] text-zinc-400'>
                {a.code}
              </div>
              <div className='text-sm font-semibold'>{a.name}</div>
              <div className='mt-0.5 text-[11px] leading-snug text-zinc-500'>
                {a.scope}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BigWorkflow() {
  return (
    <section className='mb-10'>
      <div className='mb-3 flex items-baseline justify-between gap-3'>
        <SectionLabel>Hành trình của một template AI</SectionLabel>
        <span className='text-[11px] text-zinc-500'>
          Từ khách lạ → trang live → vòng lặp cải tiến
        </span>
      </div>
      <div className='relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-white p-6 shadow-sm'>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6'>
          {WORKFLOW.map((s, i) => {
            const c = ACCENT[s.accent];
            const Icon = s.icon;
            return (
              <div key={s.num} className='relative'>
                <div
                  className={`group flex h-full flex-col rounded-2xl border ${c.border} bg-gradient-to-br ${c.gradient} p-4 transition-all hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className='flex items-start justify-between'>
                    <div
                      className={`flex size-11 items-center justify-center rounded-xl ${c.bg} text-white shadow-md transition-transform group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon className='size-[22px]' />
                    </div>
                    <span
                      className={`rounded-md ${c.bg} px-1.5 py-0.5 font-mono text-[9px] font-bold text-white`}
                    >
                      {s.actor}
                    </span>
                  </div>

                  <div className='mt-3 flex items-baseline gap-1.5'>
                    <span
                      className={`font-mono text-[11px] font-bold ${c.text}`}
                    >
                      {s.num}
                    </span>
                    <span className='font-mono text-[9px] text-zinc-400'>
                      · {s.time}
                    </span>
                  </div>
                  <h3 className='mt-0.5 text-[15px] leading-tight font-bold text-zinc-900'>
                    {s.title}
                  </h3>
                  <p className='mt-2 flex-1 text-[12px] leading-relaxed text-zinc-600'>
                    {s.story}
                  </p>

                  <div className='mt-3 flex items-center gap-1.5 border-t border-zinc-200/60 pt-2.5'>
                    <span className={`text-base leading-none ${c.text}`}>
                      →
                    </span>
                    <span className={`text-[11px] font-semibold ${c.text}`}>
                      {s.outcome}
                    </span>
                  </div>
                </div>
                {i < WORKFLOW.length - 1 && (
                  <div className='absolute top-1/2 right-[-14px] hidden -translate-y-1/2 lg:block'>
                    <ArrowConnector />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ArrowConnector() {
  return (
    <svg width='20' height='32' viewBox='0 0 20 32' fill='none' aria-hidden>
      <path
        d='M2 4 C 14 4, 14 28, 2 28'
        stroke='#cbd5e1'
        strokeWidth='1.5'
        strokeLinecap='round'
        fill='none'
      />
      <path
        d='M14 14 L18 16 L14 18'
        stroke='#94a3b8'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
      />
    </svg>
  );
}

function ModuleSection({
  m,
  selected,
}: {
  m: Module;
  selected: Set<ActorName>;
}) {
  const c = ACCENT[m.accent];
  const Mockup = m.mockup;
  const Icon = m.icon;
  const filtered = m.cases?.filter(uc => selected.has(uc.actor)) ?? [];
  const isFiltered = selected.size < ALL_ACTORS.length;

  // Hide module if it has cases, all are filtered out, and no intro
  if (m.cases && !m.intro && filtered.length === 0) return null;

  const totalCases = m.cases?.length ?? 0;

  return (
    <section id={m.id} className='scroll-mt-32 py-6'>
      <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md'>
        <div className={`h-1 ${c.bg}`} aria-hidden />
        <div className='p-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_200px]'>
            <div>
              <div className='flex items-center gap-3'>
                <div
                  className={`flex size-11 items-center justify-center rounded-xl ${c.bg} text-white shadow-sm`}
                >
                  <Icon className='size-[22px]' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='font-mono text-[11px] text-zinc-400'>
                      {m.num}
                    </span>
                    <span
                      className={`rounded-full ${c.chip} px-2 py-0.5 text-[10px] font-medium`}
                    >
                      {m.short}
                    </span>
                    {m.cases && (
                      <span className='rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-600'>
                        {isFiltered
                          ? `${filtered.length}/${totalCases}`
                          : `${totalCases}`}{' '}
                        UC
                      </span>
                    )}
                  </div>
                  <h2 className='mt-0.5 text-xl font-bold tracking-tight'>
                    {m.label}
                  </h2>
                </div>
              </div>
              {m.intro && (
                <div className='mt-4 text-sm leading-relaxed text-zinc-700 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_li]:my-0.5 [&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-zinc-900 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5'>
                  {m.intro}
                </div>
              )}
            </div>
            <div className='flex items-start justify-center lg:justify-end'>
              <div className='w-full max-w-[200px]'>
                <Mockup />
              </div>
            </div>
          </div>

          {filtered.length > 0 && (
            <div className='mt-5'>
              <UseCaseList items={filtered} />
            </div>
          )}

          {m.cases && filtered.length === 0 && (
            <div className='mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-3 text-center text-[11px] text-zinc-500'>
              Không có UC khớp filter trong module này
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className='mb-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
      {children}
    </h2>
  );
}
