'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/motion';

const PLACEHOLDER =
  'What would you like to know? Our AI system will craft the response for you';

const LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
  { label: 'Map', href: '#' },
];

/**
 * Footer cố định đáy màn (trang mẫu: c-site-footer + c-prompt).
 *   - Ô chat luôn hiện; placeholder chạy marquee liên tục khi ô trống và chưa
 *     focus (c-prompt__text-marquee).
 *   - Dòng colophon 3 cụm: cuộn xuống thì cả footer dịch xuống đúng chiều cao
 *     colophon (ẩn 3 cụm, ô chat trượt xuống sát đáy); cuộn lên thì trả về.
 *     Chuyển động theo transition cubic-bezier(.165,.84,.44,1) của trang mẫu
 *     (≈ quart.out); bỏ qua rung cuộn nhỏ để không bật tắt liên tục.
 */
export default function SiteFooter() {
  const rootRef = useRef<HTMLElement>(null);
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const showMarquee = !value && !focused;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const colophon = root?.querySelector<HTMLElement>('[data-colophon]');
    const track = root?.querySelector<HTMLElement>('[data-marquee]');
    if (!root || !colophon || !track) return;

    const mm = gsap.matchMedia(root);
    mm.add(
      {
        reduce: '(prefers-reduced-motion: reduce)',
        motion: '(prefers-reduced-motion: no-preference)',
      },
      ctx => {
        const { reduce } = ctx.conditions as { reduce: boolean };

        // Vào sau intro của Hero (chữ → artwork ~2.6s) để không tranh chú ý
        // với "Craft your experience"; reload giữa trang thì hiện ngay.
        gsap.fromTo(
          root,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reduce ? 0 : 1,
            delay: reduce || window.scrollY > 0 ? 0 : 2.6,
            ease: 'quart.out',
          }
        );

        // Cuộn xuống: cả khối dịch xuống đúng chiều cao colophon (ô chat
        // trượt sát đáy) và colophon mờ đi; cuộn lên: trả về.
        let hidden = false;
        const setHidden = (next: boolean) => {
          if (next === hidden) return;
          hidden = next;
          const d = reduce ? 0 : 0.5;
          gsap.to(root, {
            y: next ? colophon.offsetHeight : 0,
            duration: d,
            ease: 'quart.out',
            overwrite: 'auto',
          });
          gsap.to(colophon, {
            autoAlpha: next ? 0 : 1,
            duration: d * 0.6,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: self => {
            if (self.scroll() < 10) setHidden(false);
            else if (Math.abs(self.getVelocity()) > 20)
              setHidden(self.direction === 1);
          },
        });

        // Marquee placeholder: hai bản chữ nối nhau, dịch −50% rồi lặp.
        // Reduced motion: đứng yên (chữ bị cắt mềm ở mép bằng mask).
        if (!reduce)
          gsap.to(track, {
            xPercent: -50,
            duration: 30,
            ease: 'none',
            repeat: -1,
          });
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <footer
      ref={rootRef}
      className='pointer-events-none invisible fixed inset-x-0 bottom-0 z-40 px-4 md:px-8'
    >
      {/* Nền tan dần dưới đáy — chữ colophon không đè nét vẽ phía sau. */}
      <div
        aria-hidden
        className='absolute inset-x-0 bottom-0 -z-10 h-28 bg-linear-to-b from-[#F8F8F6]/0 via-[#F8F8F6]/80 to-[#F8F8F6]'
      />

      <form
        onSubmit={e => e.preventDefault()}
        className='flex justify-center pb-3 md:pb-4'
      >
        <div className='group pointer-events-auto relative flex w-full max-w-[34rem] items-center rounded-full bg-white py-1.5 pr-1.5 pl-5 shadow-[0_10px_30px_-12px_rgba(60,60,40,0.22),0_0_0_1px_rgba(40,40,30,0.05)] transition-shadow duration-300 focus-within:shadow-[0_12px_36px_-12px_rgba(60,60,40,0.3),0_0_0_1px_rgba(40,40,30,0.14)] md:w-[33vw] md:max-w-none md:min-w-[26rem]'>
          <label htmlFor='site-prompt' className='sr-only'>
            {PLACEHOLDER}
          </label>
          <textarea
            id='site-prompt'
            rows={1}
            value={value}
            onChange={e => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className='min-h-[1.3em] flex-1 resize-none bg-transparent py-1 pr-3 text-[15px] leading-[1.3] text-neutral-900 outline-none'
          />
          {/* Placeholder chạy — overlay không bắt chuột, tan mềm ở hai mép. */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 right-14 left-5 flex items-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_1.25rem,#000_calc(100%-2rem),transparent)] text-[15px] leading-[1.3] text-neutral-500 transition-opacity duration-200 ${showMarquee ? 'opacity-100' : 'opacity-0'}`}
          >
            <div data-marquee className='flex w-max whitespace-nowrap'>
              <span className='pr-20'>{PLACEHOLDER}</span>
              <span className='pr-20'>{PLACEHOLDER}</span>
            </div>
          </div>
          <button
            type='submit'
            aria-label='Send'
            className='font-ui grid size-10 shrink-0 place-items-center rounded-full bg-[#ececea] text-[17px] leading-none text-neutral-800 transition-[background-color,transform] duration-200 hover:bg-[#e2e2df] active:scale-[0.96]'
          >
            <span aria-hidden className='-mt-px'>
              →
            </span>
          </button>
        </div>
      </form>

      {/* Colophon: trái / giữa (tuyệt đối giữa màn) / phải. */}
      <div
        data-colophon
        className='font-ui relative flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pb-3 text-[9.5px] tracking-[0.12em] text-neutral-600 uppercase md:flex-nowrap md:justify-start md:pb-4 md:text-[10.5px]'
      >
        <p>©2026 Brunello Cucinelli SPA - VAT IT01886120540</p>
        <p className='md:absolute md:left-1/2 md:-translate-x-1/2'>
          Beta version powered by Callimacus
        </p>
        <ul className='flex gap-4 md:ml-auto md:gap-5'>
          {LINKS.map(l => (
            <li key={l.label}>
              <a
                href={l.href}
                className='pointer-events-auto text-neutral-600 transition-colors duration-200 hover:text-neutral-900'
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
