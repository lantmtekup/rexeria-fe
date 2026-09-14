'use client';
import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import { gsap } from '@/lib/journey/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { closeOverlay, useOverlay } from '@/lib/journey/overlay-store';

/**
 * Lớp phủ toàn màn — cơ chế `view story` của trang mẫu.
 *
 * Bấm vào một card thì trang giới thiệu nơi đó PHỦ LÊN trang thay vì điều
 * hướng đi. Người xem đóng lại là về đúng chỗ đang cuộn, không mất mạch hành
 * trình. Đây là lý do trang mẫu không có route con nào.
 *
 * Khoá cuộn bằng `overflow: hidden` trên chính lớp phủ (nó tự cuộn trong
 * lòng) chứ không khoá document: khoá document sẽ làm Lenis dồn momentum rồi
 * bắn ra lúc mở khoá.
 */
const COPY = {
  vi: {
    close: 'Đóng',
    back: 'Quay lại hành trình',
    tour: 'Xem tour 360°',
    asked: 'Câu hỏi của anh/chị',
    ack: 'Chúng tôi đã ghi lại câu hỏi này. Đội ngũ tư vấn sẽ phản hồi trực tiếp — hoặc anh/chị có thể liên hệ ngay theo các kênh dưới đây.',
    form: 'Gửi yêu cầu tư vấn',
  },
  en: {
    close: 'Close',
    back: 'Back to the journey',
    tour: 'Open the 360° tour',
    asked: 'Your question',
    ack: 'We have noted your question. Our advisory team will reply personally — or reach us directly through the channels below.',
    form: 'Send an enquiry',
  },
} as const;

export function OverlayView() {
  const overlay = useOverlay();
  const { t, locale } = useLocale();
  const c = COPY[locale];
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!overlay.open) {
      gsap.to(el, { autoAlpha: 0, duration: 0.35, ease: 'power2.out' });
      return;
    }
    el.scrollTop = 0;
    gsap.fromTo(
      el,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.45, ease: 'power2.out' }
    );
    const blocks = gsap.utils.toArray<HTMLElement>('[data-block]', el);
    gsap.fromTo(
      blocks,
      { autoAlpha: 0, y: 34 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.12,
      }
    );
  }, [overlay.open, overlay.open && overlay.mode]);

  useLayoutEffect(() => {
    if (!overlay.open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeOverlay();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [overlay.open]);

  return (
    <div
      ref={ref}
      aria-hidden={!overlay.open}
      className='bg-charcoal-950 invisible fixed inset-0 z-[45] overflow-y-auto overscroll-contain'
      style={{ pointerEvents: overlay.open ? 'auto' : 'none' }}
    >
      <button
        type='button'
        onClick={closeOverlay}
        aria-label={c.close}
        className='border-charcoal-600 text-champagne-50 hover:border-champagne-400 ease-luxe fixed top-6 right-5 z-10 grid size-11 place-items-center rounded-full border text-[15px] transition-colors duration-300 md:top-8 md:right-8'
      >
        <span aria-hidden>✕</span>
      </button>

      {overlay.open && overlay.mode === 'place' && (
        <article className='mx-auto max-w-[62.5rem] px-5 pt-[16svh] pb-[22svh] md:px-8'>
          <p
            data-block
            className='text-champagne-400 tracking-luxe text-center text-[10.5px] uppercase md:text-[11.5px]'
          >
            {t.amenities.eyebrow}
          </p>
          <h1
            data-block
            className='font-display text-ivory mx-auto mt-6 max-w-[40rem] text-center text-[clamp(2.2rem,4.4vw,4.2rem)] leading-[1.06] text-balance'
          >
            {overlay.place.title}
          </h1>
          <figure data-block className='relative mt-14 md:mt-20'>
            <Image
              src={overlay.place.src}
              alt={overlay.place.title}
              width={1176}
              height={936}
              sizes='(max-width: 1023px) 100vw, 1000px'
              className='h-auto w-full'
            />
          </figure>
          <p
            data-block
            className='text-champagne-50/80 mx-auto mt-12 max-w-[42rem] text-[17px] leading-[1.68] md:mt-16 md:text-[18px]'
          >
            {overlay.place.body}
          </p>
          <div data-block className='mt-14 flex flex-wrap justify-center gap-4'>
            {overlay.place.tour && (
              <a
                href={overlay.place.tour}
                target='_blank'
                rel='noreferrer'
                className='border-champagne-400/50 text-champagne-200 hover:bg-champagne-400/10 tracking-luxe ease-luxe border px-7 py-4 text-[11px] uppercase transition-colors duration-500'
              >
                {c.tour}
              </a>
            )}
            <button
              type='button'
              onClick={closeOverlay}
              className='border-charcoal-600 text-champagne-50/70 hover:border-champagne-400/50 tracking-luxe ease-luxe border px-7 py-4 text-[11px] uppercase transition-colors duration-500'
            >
              {c.back}
            </button>
          </div>
        </article>
      )}

      {overlay.open && overlay.mode === 'ask' && (
        <div className='mx-auto max-w-[48rem] px-5 pt-[20svh] pb-[22svh] md:px-8'>
          <p
            data-block
            className='text-champagne-400 tracking-luxe text-[10.5px] uppercase md:text-[11.5px]'
          >
            {c.asked}
          </p>
          <blockquote
            data-block
            className='font-display text-ivory mt-6 text-[clamp(1.7rem,3.2vw,2.9rem)] leading-[1.18] text-balance'
          >
            “{overlay.question}”
          </blockquote>
          <p
            data-block
            className='text-champagne-50/75 mt-10 text-[17px] leading-[1.68]'
          >
            {c.ack}
          </p>
          <dl
            data-block
            className='border-charcoal-700 mt-12 grid gap-x-10 gap-y-5 border-t pt-8 sm:grid-cols-2'
          >
            <div>
              <dt className='text-champagne-50/45 tracking-luxe text-[10px] uppercase'>
                {t.contact.kicker}
              </dt>
              <dd className='font-display text-ivory mt-2 text-[20px]'>
                <a href={`tel:${t.contact.phone.replace(/[^\d+]/g, '')}`}>
                  {t.contact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className='text-champagne-50/45 tracking-luxe text-[10px] uppercase'>
                Email
              </dt>
              <dd className='font-display text-ivory mt-2 text-[20px]'>
                <a href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
              </dd>
            </div>
          </dl>
          <div data-block className='mt-12'>
            <a
              href='#consultation'
              onClick={closeOverlay}
              className='border-champagne-400/50 text-champagne-200 hover:bg-champagne-400/10 tracking-luxe ease-luxe inline-block border px-7 py-4 text-[11px] uppercase transition-colors duration-500'
            >
              {c.form}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
