import {
  Bell,
  ChevronRight,
  Database,
  Hand,
  Image as ImageIcon,
  Layers,
  Lock,
  MessageSquare,
  MousePointerClick,
  Send,
  ShoppingBag,
  Sparkles,
  Type,
  User,
} from 'lucide-react';

/* ---------- mockup chrome ---------- */

function Frame({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function DotsRow() {
  return (
    <div className='absolute top-2 left-3 flex gap-1'>
      <span className='size-1.5 rounded-full bg-rose-300' />
      <span className='size-1.5 rounded-full bg-amber-300' />
      <span className='size-1.5 rounded-full bg-emerald-300' />
    </div>
  );
}

/* ---------- mockups ---------- */

export function MockOverview() {
  return (
    <Frame className='bg-gradient-to-br from-slate-50 to-white'>
      <DotsRow />
      <div className='mt-4 grid grid-cols-3 gap-1.5'>
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className='h-8 rounded bg-slate-100'
            style={{ opacity: 0.4 + (i % 5) * 0.12 }}
          />
        ))}
      </div>
      <div className='mt-2 flex items-center justify-between text-[10px] text-slate-500'>
        <span>17 modules</span>
        <span className='font-mono'>v1.0</span>
      </div>
    </Frame>
  );
}

export function MockRoles() {
  const roles = [
    { color: 'bg-rose-500', label: 'Admin' },
    { color: 'bg-blue-500', label: 'User' },
    { color: 'bg-slate-400', label: 'Guest' },
  ];
  return (
    <Frame className='bg-gradient-to-br from-rose-50 to-white'>
      <div className='space-y-2'>
        {roles.map(r => (
          <div
            key={r.label}
            className='flex items-center gap-2 rounded-lg border border-zinc-100 bg-white p-2'
          >
            <div
              className={`flex size-7 items-center justify-center rounded-full ${r.color} text-white`}
            >
              <User className='size-3.5' />
            </div>
            <div className='flex-1'>
              <div className='text-[11px] font-semibold'>{r.label}</div>
              <div className='mt-1 h-1 w-full rounded bg-zinc-100'>
                <div
                  className={`h-1 rounded ${r.color}`}
                  style={{
                    width:
                      r.label === 'Admin'
                        ? '100%'
                        : r.label === 'User'
                          ? '60%'
                          : '20%',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function MockAuth() {
  return (
    <Frame className='bg-gradient-to-br from-rose-50 to-white'>
      <div className='flex flex-col items-center py-2'>
        <div className='flex size-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm'>
          <Lock className='size-5' />
        </div>
        <div className='mt-3 w-full space-y-1.5'>
          <div className='h-6 rounded border border-zinc-200 bg-white' />
          <div className='h-6 rounded border border-zinc-200 bg-white' />
          <div className='h-6 rounded bg-rose-500' />
        </div>
        <div className='mt-2 text-[10px] text-zinc-500'>
          JWT · cookie httpOnly
        </div>
      </div>
    </Frame>
  );
}

export function MockMasterData() {
  return (
    <Frame className='bg-gradient-to-br from-emerald-50 to-white'>
      <div className='flex items-center gap-2'>
        <Database className='size-4 text-emerald-600' />
        <div className='text-[11px] font-semibold'>Products / Collections</div>
      </div>
      <div className='mt-2 overflow-hidden rounded border border-zinc-100'>
        <div className='grid grid-cols-3 bg-zinc-50 font-mono text-[9px] text-zinc-500'>
          <span className='border-r border-zinc-100 px-1.5 py-1'>id</span>
          <span className='border-r border-zinc-100 px-1.5 py-1'>name</span>
          <span className='px-1.5 py-1'>price</span>
        </div>
        {[
          ['#01', 'Tour Đà Nẵng', '4.9M'],
          ['#02', 'Tour Sapa', '3.2M'],
          ['#03', 'Hạ Long', '2.8M'],
        ].map((r, i) => (
          <div
            key={i}
            className='grid grid-cols-3 border-t border-zinc-100 text-[10px]'
          >
            <span className='border-r border-zinc-100 px-1.5 py-1 font-mono text-zinc-400'>
              {r[0]}
            </span>
            <span className='border-r border-zinc-100 px-1.5 py-1'>{r[1]}</span>
            <span className='px-1.5 py-1 text-emerald-600'>{r[2]}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function MockAITemplates() {
  return (
    <Frame className='bg-gradient-to-br from-violet-50 to-white'>
      <div className='flex items-center justify-between'>
        <div className='text-[11px] font-semibold'>AI Template</div>
        <span className='rounded bg-violet-500 px-1.5 py-0.5 font-mono text-[9px] text-white'>
          v2
        </span>
      </div>
      <div className='mt-2 space-y-1.5'>
        <div>
          <div className='text-[9px] text-zinc-500'>Tên sản phẩm</div>
          <div className='mt-0.5 h-5 rounded border border-zinc-200 bg-white' />
        </div>
        <div>
          <div className='text-[9px] text-zinc-500'>Style</div>
          <div className='mt-0.5 flex gap-1'>
            <span className='rounded border border-violet-300 bg-violet-100 px-1.5 py-0.5 text-[9px] text-violet-700'>
              Luxury
            </span>
            <span className='rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[9px] text-zinc-500'>
              Casual
            </span>
            <span className='rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[9px] text-zinc-500'>
              Bold
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function MockAIGen() {
  return (
    <Frame className='bg-gradient-to-br from-fuchsia-50 to-white'>
      <div className='flex items-start gap-2'>
        <div className='flex size-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 text-white'>
          <Sparkles className='size-3.5' />
        </div>
        <div className='flex-1 space-y-1.5'>
          <div className='rounded-lg rounded-tl-sm border border-zinc-200 bg-white px-2 py-1.5 text-[10px]'>
            Tạo template cho Tour Đà Nẵng 3N2Đ
          </div>
          <div className='rounded-lg rounded-tl-sm bg-fuchsia-500 px-2 py-1.5 text-[10px] text-white'>
            ⌁ Sinh 5 blocks: Hero · Features · Gallery · CTA · Booking
          </div>
        </div>
      </div>
      <div className='mt-2 flex items-center gap-1'>
        <span className='rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[9px] text-zinc-500'>
          v1 initial
        </span>
        <ChevronRight className='size-2.5 text-zinc-300' />
        <span className='rounded bg-fuchsia-500 px-1.5 py-0.5 font-mono text-[9px] text-white'>
          v2 regen
        </span>
      </div>
    </Frame>
  );
}

export function MockCanvasEditor() {
  return (
    <Frame className='bg-gradient-to-br from-blue-50 to-white'>
      <DotsRow />
      <div className='mt-3 grid grid-cols-[40px_1fr_36px] gap-1.5'>
        <div className='space-y-1'>
          {['H', 'F', 'C', '+'].map((t, i) => (
            <div
              key={i}
              className={`flex h-6 items-center justify-center rounded text-[10px] font-bold ${
                i === 0
                  ? 'bg-blue-500 text-white'
                  : 'border border-zinc-200 bg-white text-zinc-500'
              }`}
            >
              {t}
            </div>
          ))}
        </div>
        <div className='relative aspect-[4/3] rounded border border-zinc-200 bg-white'>
          <div className='absolute inset-x-2 top-2 h-2 rounded bg-blue-200' />
          <div className='absolute top-5 left-2 h-1.5 w-2/3 rounded bg-blue-100' />
          <div className='absolute top-[30px] left-2 h-1.5 w-1/2 rounded bg-blue-100' />
          <div className='absolute right-2 bottom-2 h-3 w-1/3 rounded bg-blue-500' />
        </div>
        <div className='space-y-1'>
          <Layers className='size-3.5 text-blue-500' />
          <Type className='size-3.5 text-zinc-400' />
          <ImageIcon className='size-3.5 text-zinc-400' />
        </div>
      </div>
    </Frame>
  );
}

export function MockExtraElements() {
  return (
    <Frame className='bg-gradient-to-br from-cyan-50 to-white'>
      <div className='relative aspect-[4/3] overflow-hidden rounded border border-zinc-200 bg-white'>
        <div className='absolute inset-0 bg-gradient-to-br from-cyan-100 to-white' />
        {/* hotspots */}
        <span className='absolute top-2 left-3 flex size-3 items-center justify-center rounded-full bg-cyan-500 text-white shadow-md ring-4 ring-cyan-500/20'>
          <span className='size-1 rounded-full bg-white' />
        </span>
        <span className='absolute right-4 bottom-3 flex size-3 items-center justify-center rounded-full bg-cyan-500 text-white shadow-md ring-4 ring-cyan-500/20'>
          <span className='size-1 rounded-full bg-white' />
        </span>
        <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          <MousePointerClick className='size-4 text-cyan-700' />
        </span>
      </div>
      <div className='mt-1.5 flex justify-center gap-1'>
        <span className='size-1.5 rounded-full bg-cyan-500' />
        <span className='size-1.5 rounded-full bg-zinc-300' />
        <span className='size-1.5 rounded-full bg-zinc-300' />
      </div>
    </Frame>
  );
}

export function MockSavedBlocks() {
  const blocks = [
    'from-sky-200 to-sky-50',
    'from-emerald-200 to-emerald-50',
    'from-violet-200 to-violet-50',
    'from-amber-200 to-amber-50',
  ];
  return (
    <Frame className='bg-gradient-to-br from-sky-50 to-white'>
      <div className='grid grid-cols-2 gap-1.5'>
        {blocks.map((b, i) => (
          <div
            key={i}
            className={`aspect-video rounded border border-zinc-200 bg-gradient-to-br ${b} p-1`}
          >
            <div className='h-1 w-1/2 rounded bg-white/70' />
            <div className='mt-1 h-0.5 w-2/3 rounded bg-white/60' />
          </div>
        ))}
      </div>
      <div className='mt-1.5 text-center text-[9px] text-zinc-500'>
        Saved blocks library
      </div>
    </Frame>
  );
}

export function MockCanvasList() {
  return (
    <Frame className='bg-gradient-to-br from-blue-50 to-white'>
      <div className='space-y-1.5'>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className='flex items-center gap-2 rounded border border-zinc-100 bg-white p-1.5'
          >
            <div className='size-8 shrink-0 rounded bg-gradient-to-br from-blue-200 to-blue-50' />
            <div className='flex-1'>
              <div className='h-1.5 w-3/4 rounded bg-zinc-200' />
              <div className='mt-1 h-1 w-1/2 rounded bg-zinc-100' />
            </div>
            <span className='rounded bg-blue-500 px-1 py-0.5 font-mono text-[8px] text-white'>
              AI
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function MockCollections() {
  return (
    <Frame className='bg-gradient-to-br from-emerald-50 to-white'>
      <div className='overflow-hidden rounded border border-zinc-100'>
        <div className='grid grid-cols-4 bg-emerald-50 font-mono text-[9px] text-emerald-700'>
          <span className='border-r border-emerald-100 px-1 py-1'>name</span>
          <span className='border-r border-emerald-100 px-1 py-1'>phone</span>
          <span className='border-r border-emerald-100 px-1 py-1'>date</span>
          <span className='px-1 py-1'>status</span>
        </div>
        {[
          ['An', '0901', '03/05', 'new'],
          ['Bình', '0902', '04/05', 'paid'],
          ['Cường', '0903', '05/05', 'new'],
        ].map((r, i) => (
          <div
            key={i}
            className='grid grid-cols-4 border-t border-emerald-100 text-[9px]'
          >
            <span className='border-r border-emerald-100 px-1 py-1'>
              {r[0]}
            </span>
            <span className='border-r border-emerald-100 px-1 py-1 font-mono text-zinc-500'>
              {r[1]}
            </span>
            <span className='border-r border-emerald-100 px-1 py-1 text-zinc-500'>
              {r[2]}
            </span>
            <span
              className={`px-1 py-1 ${r[3] === 'paid' ? 'text-emerald-600' : 'text-zinc-500'}`}
            >
              {r[3]}
            </span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function MockProducts() {
  return (
    <Frame className='bg-gradient-to-br from-emerald-50 to-white'>
      <div className='overflow-hidden rounded-lg border border-zinc-100 bg-white'>
        <div className='aspect-[3/2] bg-gradient-to-br from-emerald-200 to-emerald-50'>
          <div className='flex h-full items-center justify-center'>
            <ShoppingBag className='size-6 text-emerald-600/60' />
          </div>
        </div>
        <div className='p-1.5'>
          <div className='h-1.5 w-3/4 rounded bg-zinc-200' />
          <div className='mt-1 flex items-center justify-between'>
            <div className='h-1.5 w-1/3 rounded bg-zinc-100' />
            <span className='text-[10px] font-bold text-emerald-600'>$49</span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function MockNotifications() {
  return (
    <Frame className='bg-gradient-to-br from-amber-50 to-white'>
      <div className='flex flex-col items-center gap-2 py-2'>
        <div className='relative'>
          <div className='flex size-10 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm'>
            <Bell className='size-5' />
          </div>
          <span className='absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 font-mono text-[9px] font-bold text-white ring-2 ring-white'>
            3
          </span>
        </div>
        <div className='w-full space-y-1'>
          {[
            ['Feedback mới', 'từ user@…'],
            ['Template publish', '2 phút trước'],
          ].map(([a, b], i) => (
            <div
              key={i}
              className='flex items-center justify-between rounded border border-zinc-100 bg-white px-1.5 py-1'
            >
              <span className='text-[10px]'>{a}</span>
              <span className='text-[9px] text-zinc-400'>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

export function MockAdminDash() {
  const stats = [
    { label: 'Products', value: '142', from: 'from-orange-200' },
    { label: 'Templates', value: '38', from: 'from-blue-200' },
    { label: 'Users', value: '512', from: 'from-emerald-200' },
    { label: 'AI calls', value: '8.2K', from: 'from-violet-200' },
  ];
  return (
    <Frame className='bg-gradient-to-br from-orange-50 to-white'>
      <div className='grid grid-cols-2 gap-1.5'>
        {stats.map(s => (
          <div
            key={s.label}
            className={`rounded-lg border border-zinc-100 bg-gradient-to-br ${s.from} to-white p-1.5`}
          >
            <div className='text-[9px] text-zinc-500'>{s.label}</div>
            <div className='font-mono text-sm font-bold text-zinc-900'>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export function MockAIUsage() {
  const bars = [40, 65, 35, 80, 55, 90, 70];
  return (
    <Frame className='bg-gradient-to-br from-amber-50 to-white'>
      <div className='flex items-end justify-between gap-1 px-1 pt-2'>
        {bars.map((h, i) => (
          <div key={i} className='flex flex-1 flex-col items-center gap-1'>
            <div
              className='w-full rounded-t bg-gradient-to-t from-amber-500 to-amber-300'
              style={{ height: `${h}px` }}
            />
          </div>
        ))}
      </div>
      <div className='mt-1 flex justify-between font-mono text-[8px] text-zinc-400'>
        <span>Mon</span>
        <span>Wed</span>
        <span>Fri</span>
        <span>Sun</span>
      </div>
      <div className='mt-1 text-center text-[9px] text-zinc-500'>
        AI requests / day
      </div>
    </Frame>
  );
}

export function MockSettings() {
  return (
    <Frame className='bg-gradient-to-br from-zinc-50 to-white'>
      <div className='space-y-2'>
        {[
          ['Dark mode', false],
          ['Notifications', true],
          ['Email digest', true],
        ].map(([label, on]) => (
          <div
            key={label as string}
            className='flex items-center justify-between rounded border border-zinc-100 bg-white px-2 py-1.5'
          >
            <span className='text-[10px]'>{label}</span>
            <div
              className={`flex h-3 w-6 items-center rounded-full p-0.5 transition-colors ${
                on ? 'bg-zinc-900' : 'bg-zinc-200'
              }`}
            >
              <span
                className={`size-2 rounded-full bg-white shadow ${on ? 'ml-auto' : ''}`}
              />
            </div>
          </div>
        ))}
        <div className='flex justify-center gap-1 pt-1'>
          <span className='rounded border border-zinc-900 bg-zinc-900 px-1.5 py-0.5 font-mono text-[9px] text-white'>
            EN
          </span>
          <span className='rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[9px] text-zinc-500'>
            VI
          </span>
        </div>
      </div>
    </Frame>
  );
}

export function MockArchitecture() {
  const layers = [
    { label: 'Next.js · React 19', color: 'bg-indigo-500' },
    { label: 'API routes · Mongoose', color: 'bg-indigo-400' },
    { label: 'Claude · MongoDB · S3', color: 'bg-indigo-300' },
  ];
  return (
    <Frame className='bg-gradient-to-br from-indigo-50 to-white'>
      <div className='space-y-1.5 py-1'>
        {layers.map((l, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 rounded ${l.color} px-2 py-1.5 text-white shadow-sm`}
            style={{
              marginLeft: `${i * 6}px`,
              width: `calc(100% - ${i * 6}px)`,
            }}
          >
            <span className='font-mono text-[9px] opacity-70'>L{i + 1}</span>
            <span className='text-[10px] font-medium'>{l.label}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ---------- workflow step mocks (used inside big workflow expand) ---------- */

export function MockWorkflowStep({ step }: { step: number }) {
  switch (step) {
    case 1:
      return (
        <div className='flex items-center gap-2 text-xs text-zinc-600'>
          <Hand className='size-4 text-rose-500' />
          Landing → Sign-up
        </div>
      );
    case 2:
      return (
        <div className='flex items-center gap-2 text-xs text-zinc-600'>
          <MessageSquare className='size-4 text-violet-500' />
          Form fields
        </div>
      );
    case 3:
      return (
        <div className='flex items-center gap-2 text-xs text-zinc-600'>
          <Sparkles className='size-4 text-fuchsia-500' />
          Claude generates
        </div>
      );
    case 4:
      return (
        <div className='flex items-center gap-2 text-xs text-zinc-600'>
          <Layers className='size-4 text-blue-500' />
          Drag blocks
        </div>
      );
    case 5:
      return (
        <div className='flex items-center gap-2 text-xs text-zinc-600'>
          <Send className='size-4 text-emerald-500' />
          Share / Product
        </div>
      );
    case 6:
      return (
        <div className='flex items-center gap-2 text-xs text-zinc-600'>
          <Bell className='size-4 text-amber-500' />
          Track + feedback
        </div>
      );
  }
  return null;
}
