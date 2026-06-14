'use client';

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  Info,
  LayoutTemplate,
  Lightbulb,
  MousePointerClick,
  Send,
  ShieldCheck,
  Star,
  Table,
  UserPlus,
  Wand2,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  MockAITemplates,
  MockAIGen,
  MockAuth,
  MockCanvasEditor,
  MockCollections,
  MockExtraElements,
  MockSavedBlocks,
} from '../_mockups';

/* ---------- types ---------- */

type Accent =
  | 'rose'
  | 'violet'
  | 'fuchsia'
  | 'blue'
  | 'cyan'
  | 'emerald'
  | 'orange';

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
  rose: {
    bg: 'bg-rose-500',
    bgSoft: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-600',
    chip: 'bg-rose-100 text-rose-700',
    gradient: 'from-rose-50 to-white',
  },
  violet: {
    bg: 'bg-violet-500',
    bgSoft: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-600',
    chip: 'bg-violet-100 text-violet-700',
    gradient: 'from-violet-50 to-white',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500',
    bgSoft: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    text: 'text-fuchsia-600',
    chip: 'bg-fuchsia-100 text-fuchsia-700',
    gradient: 'from-fuchsia-50 to-white',
  },
  blue: {
    bg: 'bg-blue-500',
    bgSoft: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    chip: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-50 to-white',
  },
  cyan: {
    bg: 'bg-cyan-500',
    bgSoft: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    chip: 'bg-cyan-100 text-cyan-700',
    gradient: 'from-cyan-50 to-white',
  },
  emerald: {
    bg: 'bg-emerald-500',
    bgSoft: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    chip: 'bg-emerald-100 text-emerald-700',
    gradient: 'from-emerald-50 to-white',
  },
  orange: {
    bg: 'bg-orange-500',
    bgSoft: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    chip: 'bg-orange-100 text-orange-700',
    gradient: 'from-orange-50 to-white',
  },
};

type Callout =
  | { kind: 'tip'; text: React.ReactNode }
  | { kind: 'warn'; text: React.ReactNode }
  | { kind: 'info'; text: React.ReactNode };

type Step = {
  title: string;
  body: React.ReactNode;
  callout?: Callout;
};

type Tutorial = {
  id: string;
  num: number;
  title: string;
  goal: string;
  prereq?: string;
  time: string;
  difficulty: 1 | 2 | 3;
  audience: 'User' | 'Admin';
  icon: LucideIcon;
  accent: Accent;
  mockup?: React.ComponentType;
  steps: Step[];
  done?: string; // what user has after finishing
};

/* ---------- tutorials data ---------- */

const TUTORIALS: Tutorial[] = [
  {
    id: 't0-signup',
    num: 0,
    title: 'Đăng ký account Rexer',
    goal: 'Có account miễn phí để bắt đầu sinh template.',
    time: '30 giây',
    difficulty: 1,
    audience: 'User',
    icon: UserPlus,
    accent: 'rose',
    mockup: MockAuth,
    steps: [
      {
        title: 'Mở trang chủ Rexer',
        body: (
          <>
            Truy cập <code>https://rexer.ai</code> (hoặc localhost khi dev). Bấm
            nút <b>Sign-up</b> ở góc phải header.
          </>
        ),
      },
      {
        title: 'Điền email + password',
        body: (
          <>
            Email phải hợp lệ (sẽ dùng để khôi phục mật khẩu). Password tối
            thiểu 8 ký tự, có chữ hoa + số.
          </>
        ),
        callout: {
          kind: 'tip',
          text: (
            <>
              Dùng email công ty nếu bạn định share template cho khách — chuyên
              nghiệp hơn.
            </>
          ),
        },
      },
      {
        title: 'Bấm Sign-up',
        body: (
          <>
            Hệ thống auto sign-in và redirect bạn về <code>/home</code>. Cookie
            JWT đã được set, các lần sau bạn không phải đăng nhập lại.
          </>
        ),
      },
    ],
    done: 'Bạn đang đăng nhập ở /home, sẵn sàng vào Tutorial 1.',
  },

  {
    id: 't1-first-template',
    num: 1,
    title: 'Tạo template AI đầu tiên',
    goal: 'Có 1 landing page hoàn chỉnh nhờ AI — không code, không design.',
    prereq: 'Đã hoàn thành Tutorial 0 (có account).',
    time: '~5 phút',
    difficulty: 1,
    audience: 'User',
    icon: Wand2,
    accent: 'violet',
    mockup: MockAITemplates,
    steps: [
      {
        title: 'Mở danh sách AI Templates',
        body: (
          <>
            Trên sidebar trái, bấm <b>AI Templates</b> (hoặc URL{' '}
            <code>/ai-templates</code>). Bạn sẽ thấy các template do Admin định
            nghĩa (mỗi cái cho 1 ngành: Du lịch, F&amp;B, BĐS…).
          </>
        ),
      },
      {
        title: 'Chọn template phù hợp',
        body: (
          <>
            Hover từng card để xem preview. Click thumbnail để mở chi tiết, bấm{' '}
            <b>Use this template</b>.
          </>
        ),
        callout: {
          kind: 'tip',
          text: (
            <>
              Không chắc chọn cái nào? Lấy template <em>generic landing</em> —
              luôn hoạt động cho mọi ngành.
            </>
          ),
        },
      },
      {
        title: 'Điền form mô tả sản phẩm',
        body: (
          <>
            Form chứa các trường Admin định nghĩa (thường có: tên, mô tả 50- 200
            từ, style: Luxury / Casual / Bold). Càng cụ thể → AI viết càng đúng.
          </>
        ),
        callout: {
          kind: 'info',
          text: (
            <>
              Ví dụ tốt: &quot;Tour Đà Nẵng 3N2Đ, giá 4.9tr, gồm vé máy bay,
              khách sạn 4*, ăn 3 bữa, hướng dẫn viên tiếng Việt&quot;.
            </>
          ),
        },
      },
      {
        title: 'Bấm Generate',
        body: (
          <>
            Trang loading hiển thị progress; sau ~8 giây bạn được redirect sang
            trang review.
          </>
        ),
        callout: {
          kind: 'warn',
          text: (
            <>
              Nếu báo lỗi <code>QuotaExceeded</code> → bạn đã regenerate quá 10
              lần trong session. Refresh trang để reset.
            </>
          ),
        },
      },
      {
        title: 'Review từng block',
        body: (
          <>
            AI trả ~4-6 block: Hero · Features · Gallery · CTA · Booking… Đọc
            qua nội dung; block nào không vừa ý bấm <b>Regenerate</b> (giới hạn
            10 lần / session).
          </>
        ),
      },
      {
        title: 'Lưu vào canvas',
        body: (
          <>
            Hài lòng → bấm <b>Save to canvas</b> ở footer. Bạn được đưa vào
            editor canvas để tinh chỉnh tiếp (Tutorial 2).
          </>
        ),
      },
    ],
    done: 'Có 1 canvas template AI-generated trong /canvas-templates.',
  },

  {
    id: 't2-edit-canvas',
    num: 2,
    title: 'Edit canvas — thêm / sửa block',
    goal: 'Tinh chỉnh template cho phù hợp brand của bạn.',
    prereq: 'Đã có 1 canvas template từ Tutorial 1.',
    time: '~10 phút',
    difficulty: 2,
    audience: 'User',
    icon: LayoutTemplate,
    accent: 'blue',
    mockup: MockCanvasEditor,
    steps: [
      {
        title: 'Mở canvas',
        body: (
          <>
            Vào <code>/canvas-templates</code> → click template vừa tạo. Editor
            mở với 4 vùng: BlockTabBar (trên), Canvas (giữa), Layers (phải),
            Toolbar (dưới).
          </>
        ),
      },
      {
        title: 'Chỉnh text inline',
        body: (
          <>
            Double-click vào bất kỳ text nào trên canvas → nhập nội dung mới.
            Enter để xuống dòng. Click bên ngoài để thoát edit.
          </>
        ),
      },
      {
        title: 'Đổi ảnh',
        body: (
          <>
            Click ảnh → toolbar hiện nút <b>Replace</b>. Upload ảnh mới (kéo-thả
            hoặc chọn từ máy). Ảnh tự upload lên S3.
          </>
        ),
        callout: {
          kind: 'tip',
          text: (
            <>
              Ảnh tốt nhất: 1920×1080 cho hero, 800×600 cho gallery, dưới 500KB
              để load nhanh.
            </>
          ),
        },
      },
      {
        title: 'Thêm block mới',
        body: (
          <>
            Bấm <b>+ Add block</b> ở BlockTabBar. Chọn loại (FeatureSection,
            BookingForm, ImageCarousel…) hoặc tab <b>Saved</b> để lấy block đã
            lưu.
          </>
        ),
      },
      {
        title: 'Reorder block',
        body: (
          <>
            Mở <b>Layers</b> panel bên phải. Kéo-thả các block để đổi thứ tự
            hiển thị (trên xuống dưới khi visitor scroll).
          </>
        ),
      },
      {
        title: 'Lưu',
        body: (
          <>
            Editor autosave sau mỗi 5 giây. Hoặc bấm Ctrl/Cmd+S. Toast &quot;Đã
            lưu&quot; xác nhận.
          </>
        ),
      },
    ],
    done: 'Canvas được cá nhân hóa theo brand của bạn.',
  },

  {
    id: 't3-motion-hotspot',
    num: 3,
    title: 'Thêm motion & hotspot — làm trang sống động',
    goal: 'Tạo trải nghiệm tương tác cho visitor.',
    prereq: 'Đã edit cơ bản canvas (Tutorial 2).',
    time: '~5 phút',
    difficulty: 2,
    audience: 'User',
    icon: MousePointerClick,
    accent: 'cyan',
    mockup: MockExtraElements,
    steps: [
      {
        title: 'Chọn block muốn animate',
        body: (
          <>
            Click block trên canvas → toolbar hiện nút <b>Motion</b>.
          </>
        ),
      },
      {
        title: 'Thêm keyframe đầu tiên',
        body: (
          <>
            Mở Motion Timeline. Bấm <b>+</b> tại điểm 0s → preset có sẵn:
            Fade-in, Slide-up, Scale-in. Chọn 1 cái.
          </>
        ),
        callout: {
          kind: 'tip',
          text: (
            <>
              Animation đơn giản (fade-in) thường đẹp hơn nhiều effect rối mắt.
            </>
          ),
        },
      },
      {
        title: 'Preview',
        body: (
          <>
            Bấm <b>Play</b> ở Motion Timeline để xem animation chạy. Điều chỉnh
            duration / easing nếu cần.
          </>
        ),
      },
      {
        title: 'Thêm hotspot vào hero image',
        body: (
          <>
            Click ảnh trong hero block → overlay toolbar hiện <b>+ Hotspot</b>.
            Drag dot tới vị trí muốn, gắn link hoặc tooltip.
          </>
        ),
      },
      {
        title: 'Test trên preview',
        body: (
          <>
            Bấm <b>Preview</b> (mắt icon) ở góc trên. Hover hotspot để xem
            tooltip; mở motion để xem animation thực tế.
          </>
        ),
      },
    ],
    done: 'Trang đã có animation + hotspot tương tác.',
  },

  {
    id: 't4-publish',
    num: 4,
    title: 'Publish — chia sẻ trang cho thế giới',
    goal: 'Lấy public URL để gửi khách hoặc gắn vào product.',
    prereq: 'Đã có canvas hoàn chỉnh.',
    time: '1 phút',
    difficulty: 1,
    audience: 'User',
    icon: Send,
    accent: 'emerald',
    steps: [
      {
        title: 'Mở menu Share',
        body: (
          <>
            Trong canvas editor → góc trên bên phải có nút <b>Share</b>.
          </>
        ),
      },
      {
        title: 'Bật Public URL',
        body: (
          <>
            Toggle <b>Public URL</b>. Link <code>/p/[slug]</code> được sinh tự
            động. Copy link.
          </>
        ),
        callout: {
          kind: 'warn',
          text: (
            <>
              Public link ai có cũng xem được. Tắt toggle khi không cần để ngừng
              share.
            </>
          ),
        },
      },
      {
        title: 'Gắn vào Product (optional)',
        body: (
          <>
            Nếu canvas này liên quan đến 1 product → mở{' '}
            <code>/product/[id]</code>→ chọn template = canvas vừa tạo. Khi
            khách vào product page sẽ thấy template của bạn.
          </>
        ),
      },
      {
        title: 'Test trên trình duyệt khác',
        body: (
          <>
            Mở link <code>/p/[slug]</code> ở chế độ ẩn danh để đảm bảo visitor
            (không login) vẫn xem được.
          </>
        ),
      },
    ],
    done: 'Trang đã live, bạn có URL để gửi khách / SEO / quảng cáo.',
  },

  {
    id: 't5-collections',
    num: 5,
    title: 'Tạo Collection để thu thập lead',
    goal: 'Mọi visitor điền form sẽ lưu thành record để theo dõi.',
    prereq: 'Canvas có block BookingForm.',
    time: '~3 phút',
    difficulty: 2,
    audience: 'User',
    icon: Table,
    accent: 'emerald',
    mockup: MockCollections,
    steps: [
      {
        title: 'Tạo collection mới',
        body: (
          <>
            Vào <code>/collections</code> → <b>New collection</b>. Đặt tên (vd:{' '}
            <em>Khách Tour Đà Nẵng</em>) + slug tự sinh.
          </>
        ),
      },
      {
        title: 'Định nghĩa field',
        body: (
          <>
            Thêm field tương ứng form: Name (text), Phone (text), Email (text),
            Travel date (date), Notes (textarea).
          </>
        ),
        callout: {
          kind: 'info',
          text: (
            <>
              Bạn có thể clone từ template <em>Booking</em> có sẵn — schema
              chuẩn nhất.
            </>
          ),
        },
      },
      {
        title: 'Nối với BookingForm',
        body: (
          <>
            Mở canvas → click block <code>BookingForm</code> → settings → ô{' '}
            <em>Data source</em> chọn collection vừa tạo. Map field form ↔ field
            schema.
          </>
        ),
      },
      {
        title: 'Test submit',
        body: (
          <>
            Mở public URL → điền thử form → submit. Quay lại{' '}
            <code>/collections/[name]</code> → record mới xuất hiện.
          </>
        ),
      },
      {
        title: 'Export CSV (khi cần)',
        body: (
          <>
            Trong collection detail → <b>Export</b> → tải CSV về Excel để gọi
            điện / gửi mail.
          </>
        ),
      },
    ],
    done: 'Có pipeline lead chạy tự động từ trang → DB.',
  },

  {
    id: 't6-saved-blocks',
    num: 6,
    title: 'Lưu block tái sử dụng',
    goal: 'Tiết kiệm thời gian khi làm template kế tiếp.',
    time: '1 phút',
    difficulty: 1,
    audience: 'User',
    icon: BookOpen,
    accent: 'cyan',
    mockup: MockSavedBlocks,
    steps: [
      {
        title: 'Chọn block đẹp muốn lưu',
        body: (
          <>
            Click block trên canvas → toolbar → <b>Save as block</b>.
          </>
        ),
      },
      {
        title: 'Đặt tên + tag',
        body: (
          <>
            Tên rõ ràng (vd: <em>Hero Du lịch — gradient xanh</em>) để dễ tìm
            lại. Tag để filter sau (du lịch / F&amp;B / bds).
          </>
        ),
      },
      {
        title: 'Dùng ở canvas khác',
        body: (
          <>
            Sang canvas khác → <b>+ Add block</b> → tab <b>Saved</b> → pick
            block → Insert. Block clone vào, edit độc lập.
          </>
        ),
        callout: {
          kind: 'tip',
          text: (
            <>
              Lưu ý: block là <em>snapshot</em>. Sửa bản gốc không tự update bản
              đã insert.
            </>
          ),
        },
      },
    ],
    done: 'Có thư viện block riêng cho bạn.',
  },

  {
    id: 't7-admin-ai-template',
    num: 7,
    title: '[Admin] Tạo AI template mới',
    goal: 'Tạo template AI dùng chung cho mọi creator.',
    prereq: 'Cần role Admin.',
    time: '~15 phút',
    difficulty: 3,
    audience: 'Admin',
    icon: ShieldCheck,
    accent: 'orange',
    mockup: MockAIGen,
    steps: [
      {
        title: 'Vào trang Admin AI Templates',
        body: (
          <>
            URL <code>/admin/ai-templates</code>. Bấm <b>Create</b>.
          </>
        ),
      },
      {
        title: 'Định nghĩa form fields',
        body: (
          <>
            Drag từng field vào form: text input cho &quot;Tên sản phẩm&quot;,
            textarea cho &quot;Mô tả&quot;, dropdown cho &quot;Style&quot;. Đặt
            label tiếng Việt rõ ràng.
          </>
        ),
        callout: {
          kind: 'tip',
          text: <>Càng ít field càng tốt — User lười điền form dài.</>,
        },
      },
      {
        title: 'Viết prompt template',
        body: (
          <>
            Trong textarea prompt, dùng <code>{'{{tên_biến}}'}</code> để chèn
            giá trị từ form. Ví dụ:{' '}
            <code className='text-2xs'>
              {
                'Tạo landing cho sản phẩm "{{name}}" với mô tả "{{desc}}", style {{style}}.'
              }
            </code>
          </>
        ),
      },
      {
        title: 'Map block schema',
        body: (
          <>
            Chỉ định block Claude phải trả: Hero, Features, Gallery, CTA,
            Booking. Mỗi block có content schema riêng — kiểm JSON.
          </>
        ),
      },
      {
        title: 'Test với sample data',
        body: (
          <>
            Bấm <b>Test generate</b>. Điền sample → xem JSON Claude trả về. Nếu
            sai schema → sửa prompt và test lại.
          </>
        ),
        callout: {
          kind: 'warn',
          text: (
            <>
              Test ít nhất 3 lần với 3 sample khác nhau để đảm bảo ổn định trước
              khi publish.
            </>
          ),
        },
      },
      {
        title: 'Publish',
        body: (
          <>
            Toggle <code>is_active = true</code>. Template xuất hiện ở{' '}
            <code>/ai-templates</code> cho mọi User.
          </>
        ),
      },
    ],
    done: 'Mọi User có thể dùng AI template mới của bạn.',
  },
];

/* ---------- helpers ---------- */

function Difficulty({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className='inline-flex items-center gap-0.5'>
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          className={`size-3 ${i <= level ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
        />
      ))}
    </span>
  );
}

function CalloutBox({ c }: { c: Callout }) {
  const map = {
    tip: {
      icon: Lightbulb,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconClass: 'text-amber-600',
      label: 'Tip',
      labelClass: 'text-amber-700',
    },
    warn: {
      icon: CircleAlert,
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      iconClass: 'text-rose-600',
      label: 'Lưu ý',
      labelClass: 'text-rose-700',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconClass: 'text-blue-600',
      label: 'Ví dụ',
      labelClass: 'text-blue-700',
    },
  }[c.kind];
  const Icon = map.icon;
  return (
    <div
      className={`mt-2 flex items-start gap-2 rounded-lg border ${map.border} ${map.bg} px-3 py-2`}
    >
      <Icon className={`mt-0.5 size-3.5 shrink-0 ${map.iconClass}`} />
      <div className='text-content-muted flex-1 text-xs leading-snug'>
        <span className={`font-semibold ${map.labelClass}`}>{map.label}: </span>
        {c.text}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function GuidePage() {
  const [active, setActive] = useState<string>(TUTORIALS[0].id);
  const [audienceFilter, setAudienceFilter] = useState<
    'all' | 'User' | 'Admin'
  >('all');

  useEffect(() => {
    const sections = TUTORIALS.map(t => document.getElementById(t.id)).filter(
      (el): el is HTMLElement => !!el
    );
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const filtered = TUTORIALS.filter(
    t => audienceFilter === 'all' || t.audience === audienceFilter
  );

  return (
    <div className='bg-background text-foreground min-h-screen antialiased'>
      <header className='border-border sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-6 py-3 backdrop-blur'>
        <div className='flex items-center gap-3'>
          <Link
            href='/overview'
            className='border-border text-content-muted hover:bg-muted flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium'
          >
            <ArrowLeft className='size-3.5' /> Overview
          </Link>
          <div className='flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-blue-500 text-white shadow-sm'>
              <BookOpen className='size-3.5' />
            </div>
            <span className='text-sm font-semibold tracking-tight'>
              Rexer AI — Hướng dẫn từng bước
            </span>
          </div>
        </div>
        <div className='flex items-center gap-1.5'>
          {(['all', 'User', 'Admin'] as const).map(a => (
            <button
              key={a}
              onClick={() => setAudienceFilter(a)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                audienceFilter === a
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'border-border text-content-muted hover:bg-muted border bg-white'
              }`}
            >
              {a === 'all' ? 'Tất cả' : a}
            </button>
          ))}
        </div>
      </header>

      <div className='flex'>
        <aside className='border-border sticky top-[57px] hidden h-[calc(100vh-57px)] w-72 shrink-0 overflow-y-auto border-r bg-white px-4 py-6 lg:block'>
          <div className='mb-4 flex items-center justify-between'>
            <span className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
              Lộ trình
            </span>
            <span className='text-3xs text-muted-foreground font-mono'>
              {filtered.length} bài
            </span>
          </div>
          <nav className='space-y-1'>
            {TUTORIALS.map(t => {
              const hidden =
                audienceFilter !== 'all' && t.audience !== audienceFilter;
              const c = ACCENT[t.accent];
              const isActive = active === t.id;
              const Icon = t.icon;
              return (
                <a
                  key={t.id}
                  href={`#${t.id}`}
                  className={`group flex items-start gap-3 rounded-lg px-2 py-2 text-sm transition-all ${
                    hidden
                      ? 'pointer-events-none opacity-30'
                      : isActive
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'text-content-muted hover:bg-muted'
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                      isActive ? c.bg : c.bgSoft
                    } ${isActive ? 'text-white' : c.text} text-2xs font-mono font-bold`}
                  >
                    {t.num}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-1.5'>
                      <Icon className='size-3 shrink-0 opacity-70' />
                      <span
                        className={`text-3xs truncate font-medium tracking-wider uppercase ${
                          isActive
                            ? 'text-muted-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {t.audience}
                      </span>
                    </div>
                    <div className='mt-0.5 text-sm leading-snug'>{t.title}</div>
                    <div className='text-3xs mt-0.5 flex items-center gap-2'>
                      <span
                        className={`flex items-center gap-0.5 ${
                          isActive
                            ? 'text-muted-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Clock className='size-2.5' /> {t.time}
                      </span>
                      <Difficulty level={t.difficulty} />
                    </div>
                  </div>
                </a>
              );
            })}
          </nav>
          <div className='text-2xs border-border bg-muted text-content-muted mt-6 rounded-xl border border-dashed p-3 leading-relaxed'>
            💡 Mới bắt đầu? Đi tuần tự Tutorial 0 → 5. Admin nhảy thẳng Tutorial
            7.
          </div>
        </aside>

        <main className='mx-auto w-full max-w-3xl px-5 py-8 lg:px-10'>
          <Hero />

          {filtered.length === 0 ? (
            <div className='border-border text-content-muted rounded-2xl border border-dashed bg-white p-8 text-center text-sm'>
              Không có tutorial nào cho filter này.
            </div>
          ) : (
            filtered.map((t, i) => (
              <TutorialSection key={t.id} t={t} next={filtered[i + 1]} />
            ))
          )}

          <footer className='border-border text-content-muted mt-12 rounded-2xl border bg-white p-6 text-sm shadow-sm'>
            <div className='flex items-start gap-3'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white'>
                <CheckCircle2 className='size-5' />
              </div>
              <div>
                <div className='text-foreground font-semibold'>
                  Bạn đã hoàn thành toàn bộ hướng dẫn
                </div>
                <p className='mt-1 leading-relaxed'>
                  Bí tiếp? Mở{' '}
                  <Link
                    href='/overview'
                    className='text-blue-600 underline-offset-2 hover:underline'
                  >
                    /overview
                  </Link>{' '}
                  để xem use case chi tiết, hoặc bấm <em>Feedback</em> trên FAB
                  để hỏi.
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className='border-border relative mb-8 overflow-hidden rounded-3xl border bg-white p-8 shadow-sm'>
      <div className='absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 opacity-70' />
      <div
        className='absolute -top-12 -right-12 size-48 rounded-full bg-emerald-200 blur-3xl'
        aria-hidden
      />
      <div
        className='absolute -bottom-16 -left-12 size-48 rounded-full bg-blue-200 blur-3xl'
        aria-hidden
      />
      <div className='relative'>
        <span className='text-2xs inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 px-3 py-1 font-medium text-white shadow-sm'>
          <BookOpen className='size-3' /> Step-by-step
        </span>
        <h1 className='mt-4 text-4xl font-bold tracking-tight md:text-5xl'>
          Hướng dẫn{' '}
          <span className='bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent'>
            từng bước
          </span>
        </h1>
        <p className='text-content-muted mt-3 max-w-2xl text-sm leading-relaxed md:text-base'>
          {TUTORIALS.length} tutorial chia làm 2 nhánh: <strong>User</strong>{' '}
          (sign-up → publish, 6 bài) và <strong>Admin</strong> (cấu hình hệ
          thống, 1 bài). Mỗi bài ~1-15 phút, làm theo là xong.
        </p>
        <div className='mt-5 flex flex-wrap items-center gap-2 text-xs'>
          <span className='text-content-muted inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200'>
            <Clock className='text-muted-foreground size-3' /> Tổng ~40 phút
          </span>
          <span className='text-content-muted inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200'>
            <Star className='size-3 fill-amber-400 text-amber-400' /> Cơ bản ·
            Trung bình
          </span>
          <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-700'>
            ✓ Không cần code
          </span>
        </div>
      </div>
    </section>
  );
}

function TutorialSection({ t, next }: { t: Tutorial; next?: Tutorial }) {
  const c = ACCENT[t.accent];
  const Icon = t.icon;
  const Mockup = t.mockup;
  return (
    <section id={t.id} className='mb-6 scroll-mt-20'>
      <div className='border-border overflow-hidden rounded-2xl border bg-white shadow-sm'>
        <div className={`h-1 ${c.bg}`} aria-hidden />

        {/* Header */}
        <div className={`bg-gradient-to-br ${c.gradient} px-6 pt-6 pb-5`}>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px]'>
            <div>
              <div className='flex items-center gap-3'>
                <div
                  className={`flex size-12 items-center justify-center rounded-2xl ${c.bg} text-white shadow-md`}
                >
                  <Icon className='size-6' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className={`text-2xs font-mono font-bold ${c.text}`}>
                      TUTORIAL {t.num}
                    </span>
                    <span
                      className={`text-3xs rounded-full px-2 py-0.5 font-medium ${
                        t.audience === 'Admin'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {t.audience}
                    </span>
                  </div>
                  <h2 className='mt-0.5 text-2xl font-bold tracking-tight'>
                    {t.title}
                  </h2>
                </div>
              </div>

              <div className='mt-3 flex flex-wrap items-center gap-2 text-xs'>
                <span className='text-content-muted inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200'>
                  <Clock className='text-muted-foreground size-3' /> {t.time}
                </span>
                <span className='text-content-muted inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200'>
                  <Difficulty level={t.difficulty} />
                </span>
                <span className='text-content-muted inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 ring-1 ring-zinc-200'>
                  {t.steps.length} bước
                </span>
              </div>

              <div className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2'>
                <div className='rounded-lg border border-white/60 bg-white/70 px-3 py-2'>
                  <div className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
                    🎯 Mục tiêu
                  </div>
                  <p className='text-content-muted mt-1 text-xs leading-snug'>
                    {t.goal}
                  </p>
                </div>
                {t.prereq && (
                  <div className='rounded-lg border border-white/60 bg-white/70 px-3 py-2'>
                    <div className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
                      📋 Cần trước
                    </div>
                    <p className='text-content-muted mt-1 text-xs leading-snug'>
                      {t.prereq}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {Mockup && (
              <div className='flex justify-center lg:justify-end'>
                <div className='w-full max-w-[180px]'>
                  <Mockup />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Steps */}
        <ol className='relative px-6 py-5'>
          {/* Vertical line */}
          <div
            className={`absolute top-5 bottom-5 left-[26px] w-0.5 ${c.bgSoft}`}
            aria-hidden
          />
          {t.steps.map((s, i) => (
            <li key={i} className='relative pb-5 pl-12 last:pb-0'>
              <span
                className={`absolute top-0 left-0 flex size-8 items-center justify-center rounded-full ${c.bg} font-mono text-xs font-bold text-white shadow-sm ring-4 ring-white`}
              >
                {i + 1}
              </span>
              <div className='text-foreground text-sm font-semibold'>
                {s.title}
              </div>
              <div className='text-content-muted [&_code]:bg-muted mt-1 text-sm leading-relaxed [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs'>
                {s.body}
              </div>
              {s.callout && <CalloutBox c={s.callout} />}
            </li>
          ))}
        </ol>

        {/* Footer: done + next */}
        {(t.done || next) && (
          <div className='border-border bg-muted/50 border-t px-6 py-4'>
            {t.done && (
              <div className='flex items-start gap-2 text-sm'>
                <CheckCircle2 className={`mt-0.5 size-4 shrink-0 ${c.text}`} />
                <div>
                  <span className={`font-semibold ${c.text}`}>Hoàn tất:</span>{' '}
                  <span className='text-content-muted'>{t.done}</span>
                </div>
              </div>
            )}
            {next && (
              <a
                href={`#${next.id}`}
                className='mt-3 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-zinc-700'
              >
                Tutorial {next.num}: {next.title}
                <ChevronRight className='size-3.5' />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
