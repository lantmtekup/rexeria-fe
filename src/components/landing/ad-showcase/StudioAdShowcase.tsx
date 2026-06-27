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

import './ads.css';
import './ads-extra.css';
import './showcase.css';
// content.jsx: registry các block (loose JS — allowJs).
import { GROUPS } from './content';

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

export function StudioAdShowcase() {
  return (
    <div className='ad-showcase-root bg-white pt-20 sm:pt-[100px]'>
      {/* Groups */}
      {GROUP_LIST.map(group => (
        <section
          key={group.title}
          className='mx-auto max-w-6xl px-6 py-10 sm:py-14'
        >
          <div className='mb-10 text-center'>
            <h2 className='text-2xl font-semibold tracking-tight text-neutral-900'>
              {group.title}
            </h2>
            <p className='mt-2 text-sm text-neutral-500'>{group.subtitle}</p>
          </div>
          <div className='grid grid-cols-1 items-start gap-x-8 gap-y-10 sm:grid-cols-2 sm:gap-y-2 lg:grid-cols-3'>
            {group.items.map((item, idx) => (
              <PhoneCard
                key={item.id}
                item={item}
                // So le: cột lẻ đẩy xuống (chỉ từ sm trở lên; mobile 1 cột thẳng).
                offset={idx % 2 === 1 ? 'sm:mt-20 lg:mt-28' : ''}
              />
            ))}
          </div>
        </section>
      ))}

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
