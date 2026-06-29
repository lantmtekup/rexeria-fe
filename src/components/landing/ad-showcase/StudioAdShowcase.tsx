'use client';

/**
 * StudioAdShowcase — gallery 14 block quảng cáo tương tác (Nguyên 11 + Thảo 3),
 * port từ ads_demo-rexer, render LIVE trong khung điện thoại, mobile-first.
 *
 * - Mỗi block lazy-mount qua IntersectionObserver (không mount 14 ad nặng cùng lúc).
 * - CSS gói trong `.ad-showcase-root` (ads.css/ads-extra.css toàn class riêng,
 *   không leak ra Tailwind/global của rexerai).
 */
import * as React from 'react';
import Link from 'next/link';

import { useAppDispatch } from '@/hooks/useRedux';
import { useAuthRole } from '@/hooks/useAuthRole';
import { fetchMeThunk } from '@/store/slices/authSlice';

import './ads.css';
import './ads-extra.css';
import './showcase.css';
// content.jsx: registry các block (loose JS — allowJs).
import { GROUPS } from './content';

/** Title → anchor id ổn định cho category nav (scroll-to-section). */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Mã mở khoá full catalog cho sales — KHÔNG phải security, chỉ là cổng demo.
 *  Mở `?full=<mã>` hoặc gõ vào ô; lưu localStorage để lần sau khỏi nhập.
 *  Đổi mã qua env NEXT_PUBLIC_ADS_FULL_CODE (build-time). */
const FULL_CODE = process.env.NEXT_PUBLIC_ADS_FULL_CODE ?? 'rexer2026';
const FULL_KEY = 'ads_full_unlocked';

type AdItem = {
  id: string;
  name: string;
  desc: string;
  by: 'Nguyên' | 'Thảo';
  render: () => React.ReactNode;
};
type AdGroup = { title: string; subtitle: string; items: AdItem[] };

const GROUP_LIST = GROUPS as AdGroup[];

/** Khung phone + lazy-mount: chỉ dựng ad khi sắp vào viewport, giữ mount sau đó.
 *  `offset` đẩy item lệch dọc → bố cục so le (staggered) đẹp hơn hàng ngang. */
function PhoneCard({ item, offset }: { item: AdItem; offset?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || live) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setLive(true);
          io.disconnect();
        }
      },
      { rootMargin: '240px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [live]);

  const href = `/rexer/ads/${item.id}`;
  return (
    <figure className={`group flex flex-col items-center ${offset ?? ''}`}>
      <div
        ref={ref}
        className='adsc-phone transition-transform duration-300 group-hover:-translate-y-1'
      >
        <div className='adsc-screen'>
          {live ? (
            item.render()
          ) : (
            <div className='adsc-skeleton'>{item.name}</div>
          )}
          {/* Tap-catcher = Link (sibling của ad, KHÔNG lồng <a>): tap mở trang
              chi tiết; ad bên dưới chỉ để xem (auto-anim vẫn chạy). */}
          <Link
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            className='adsc-tap'
            aria-label={`Open ${item.name} demo`}
          />
        </div>
      </div>
      <figcaption className='mt-5 text-center'>
        <Link
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='text-sm font-semibold tracking-tight text-neutral-900 no-underline group-hover:text-[#b8965a]'
        >
          {item.name}
        </Link>
        <p className='mt-1 text-xs leading-relaxed text-neutral-500'>
          {item.desc}
        </p>
      </figcaption>
    </figure>
  );
}

/** Thanh category dạng pill, sticky dưới navbar. Sales bấm/scroll ngang để
 *  nhảy nhanh tới đúng nhóm block muốn show cho khách. */
function CategoryNav({
  groups,
  total,
  active,
  onJump,
}: {
  groups: AdGroup[];
  total: number;
  active: string;
  onJump: (id: string) => void;
}) {
  const pill = (isOn: boolean) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-4 py-1.5 text-sm font-medium no-underline transition-colors ${
      isOn
        ? 'border-transparent bg-[#b8965a] text-white'
        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
    }`;
  const count = (isOn: boolean) =>
    `text-xs ${isOn ? 'text-white/70' : 'text-neutral-400'}`;

  return (
    <nav className='sticky top-16 z-40 border-b border-neutral-200/70 bg-white/85 backdrop-blur'>
      <div className='adsc-nav-scroll mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 py-3'>
        <button
          type='button'
          onClick={() => onJump('top')}
          className={pill(active === 'top')}
        >
          All <span className={count(active === 'top')}>{total}</span>
        </button>
        {groups.map(g => {
          const id = slugify(g.title);
          const isOn = active === id;
          return (
            <button
              key={id}
              type='button'
              onClick={() => onJump(id)}
              className={pill(isOn)}
            >
              {g.title} <span className={count(isOn)}>{g.items.length}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/** Ô nhập mã mở khoá — sales gõ mã (hoặc dùng `?full=<mã>`) để xem full. */
function UnlockForm({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = React.useState('');
  const [err, setErr] = React.useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === FULL_CODE) {
      try {
        localStorage.setItem(FULL_KEY, '1');
      } catch {
        // localStorage chặn (private mode) — vẫn mở cho phiên hiện tại.
      }
      onUnlock();
    } else {
      setErr(true);
    }
  };

  return (
    <form
      onSubmit={submit}
      className='mx-auto mt-6 flex max-w-sm flex-col gap-2'
    >
      <div className='flex gap-2'>
        <input
          type='text'
          value={code}
          onChange={e => {
            setCode(e.target.value);
            setErr(false);
          }}
          placeholder='Nhập mã mở khoá'
          aria-label='Mã mở khoá'
          className='rounded-pill h-11 flex-1 border border-neutral-300 bg-white px-5 text-sm text-neutral-900 outline-none focus:border-[#b8965a]'
        />
        <button
          type='submit'
          className='rounded-pill inline-flex h-11 shrink-0 items-center bg-[#b8965a] px-6 text-sm font-medium text-white transition-transform duration-300 hover:scale-105'
        >
          Mở khoá
        </button>
      </div>
      {err && (
        <p className='text-xs text-red-500'>
          Mã không đúng — hỏi ReXeR Studio.
        </p>
      )}
    </form>
  );
}

export function StudioAdShowcase() {
  const dispatch = useAppDispatch();
  const { user } = useAuthRole();
  const isLoggedIn = !!user;

  // Landing không tự hydrate auth → hỏi /auth/me (gửi cookie). Đăng nhập
  // same-origin sẽ tự mở; nhưng cookie không chia sẻ qua subdomain nên đây
  // CHỈ là đường phụ — đường chính cho sales là mã mở khoá bên dưới.
  React.useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);

  // Mã mở khoá: ?full=<mã> hoặc đã lưu localStorage → mở full (không cần login,
  // không dính cookie cross-subdomain). Đây là đường chính cho sales demo.
  const [unlocked, setUnlocked] = React.useState(false);
  React.useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get('full');
      if (q && q === FULL_CODE) {
        localStorage.setItem(FULL_KEY, '1');
        setUnlocked(true);
        return;
      }
      if (localStorage.getItem(FULL_KEY) === '1') setUnlocked(true);
    } catch {
      // window/localStorage không khả dụng — giữ teaser.
    }
  }, []);

  // Full khi: đăng nhập same-origin HOẶC có mã mở khoá.
  const isFull = isLoggedIn || unlocked;

  // Teaser (chưa login): gộp block thành MỘT lưới liên tiếp — KHÔNG tách theo
  // category, KHÔNG filter nav. Đăng nhập mới mở full + nav category.
  const total = GROUP_LIST.reduce((n, g) => n + g.items.length, 0);
  const TEASER_COUNT = 6;
  const teaserItems = GROUP_LIST.flatMap(g => g.items).slice(0, TEASER_COUNT);

  const [active, setActive] = React.useState('top');

  const jump = React.useCallback((id: string) => {
    setActive(id);
    const el =
      id === 'top'
        ? document.getElementById('adsc-top')
        : document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Highlight pill theo section đang trong viewport khi user tự scroll.
  React.useEffect(() => {
    const ids = ['adsc-top', ...GROUP_LIST.map(g => slugify(g.title))];
    const els = ids
      .map(id => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      entries => {
        const hit = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit)
          setActive(hit.target.id === 'adsc-top' ? 'top' : hit.target.id);
      },
      { rootMargin: '-128px 0px -55% 0px', threshold: [0.01, 0.25] }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [isFull]);

  return (
    <div className='ad-showcase-root bg-white pt-20 sm:pt-[100px]'>
      <span id='adsc-top' className='block' />

      {isFull ? (
        <>
          {/* Full (đăng nhập same-origin hoặc có mã) → catalog + nav category. */}
          <CategoryNav
            groups={GROUP_LIST}
            total={total}
            active={active}
            onJump={jump}
          />
          {GROUP_LIST.map(group => (
            <section
              key={group.title}
              id={slugify(group.title)}
              className='mx-auto max-w-6xl scroll-mt-32 px-6 py-10 sm:py-14'
            >
              <div className='mb-10 text-center'>
                <h2 className='text-2xl font-semibold tracking-tight text-neutral-900'>
                  {group.title}
                </h2>
                <p className='mt-2 text-sm text-neutral-500'>
                  {group.subtitle}
                </p>
              </div>
              <div className='grid grid-cols-1 items-start gap-x-8 gap-y-10 sm:grid-cols-2 sm:gap-y-2 lg:grid-cols-3 lg:gap-y-[108px]'>
                {group.items.map((item, idx) => (
                  <PhoneCard
                    key={item.id}
                    item={item}
                    // So le: cột lẻ đẩy xuống (từ sm trở lên; mobile 1 cột thẳng).
                    offset={idx % 2 === 1 ? 'sm:mt-20 lg:mt-28' : ''}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      ) : (
        <>
          {/* Chưa đăng nhập → 1 lưới liên tiếp (không filter, không tách nhóm). */}
          <section className='mx-auto max-w-6xl px-6 py-10 sm:py-14'>
            <div className='grid grid-cols-1 items-start gap-x-8 gap-y-10 sm:grid-cols-2 sm:gap-y-2 lg:grid-cols-3 lg:gap-y-[108px]'>
              {teaserItems.map((item, idx) => (
                <PhoneCard
                  key={item.id}
                  item={item}
                  offset={idx % 2 === 1 ? 'sm:mt-20 lg:mt-28' : ''}
                />
              ))}
            </div>
          </section>

          {/* Cổng mã mở khoá — sales nhập mã (hoặc dùng ?full=<mã>) để xem full. */}
          <section className='mx-auto max-w-6xl px-6 pb-4'>
            <div className='rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-12 text-center'>
              <p className='text-xs font-medium tracking-[0.18em] text-[#b8965a] uppercase'>
                Preview
              </p>
              <h3 className='mt-3 text-2xl font-semibold tracking-tight text-neutral-900'>
                Đây mới là {teaserItems.length}/{total} format
              </h3>
              <p className='mx-auto mt-2 max-w-md text-sm text-neutral-500'>
                Nhập mã để mở khoá toàn bộ {total} block quảng cáo tương tác và
                demo trực tiếp cho khách hàng. (Liên hệ ReXeR Studio để lấy mã.)
              </p>
              <UnlockForm onUnlock={() => setUnlocked(true)} />
            </div>
          </section>
        </>
      )}

      {/* CTA */}
      <section className='mt-12 bg-gradient-to-r from-[#0a1c38] via-[#1c3f74] to-[#c9a25b]'>
        <div className='mx-auto max-w-6xl px-6 py-24 text-center'>
          <h2 className='text-4xl font-semibold tracking-tight text-white sm:text-5xl'>
            Want a custom format set for your brand?
          </h2>
          <p className='mx-auto mt-6 max-w-xl text-sm text-white/70'>
            We craft bespoke interactive ads for every campaign.
          </p>
          <a
            href='/rexer/contact'
            className='rounded-pill mt-8 inline-flex h-11 items-center bg-white px-7 text-sm font-medium text-neutral-900 transition-transform duration-300 hover:scale-105'
          >
            Contact ReXeR Studio
          </a>
        </div>
      </section>
    </div>
  );
}

export default StudioAdShowcase;
