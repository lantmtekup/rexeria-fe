'use client';
import Image from 'next/image';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap, MQ } from '@/lib/journey/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { siteConfig } from '@/lib/site-config';
import { DeepCanvas } from '@/components/journey/deep-canvas';
import { OVERVIEW_PREVIEW } from '@/lib/journey/day-canvas';

/**
 * Tour 360° — cơ chế `ep-highlights-container` + trình xem toàn màn của trang
 * mẫu, thay cho khối iframe bo góc 18px.
 *
 * Ba thứ lấy đúng của trang mẫu:
 *   - KHUNG VIỀN MỀM bằng mask, không phải bo góc. Mép khung bất định hình nên
 *     ảnh trông như dán vào trang chứ không như đặt trong một cái hộp.
 *   - NHÃN BÁM CON TRỎ: pill đi theo chuột trong khung (quickTo 0.5s power3),
 *     con trỏ thật thì ẩn đi. Máy cảm ứng thì pill đứng ở góc trên trái.
 *   - Bấm vào MỞ TOÀN MÀN, không điều hướng đi — đóng lại là về đúng chỗ.
 *
 * Nội dung dùng đúng `t.globe` trong `lib/i18n.ts` — heading, body và hint
 * "Kéo để xoay" đã viết sẵn từ bản gốc nhưng CHƯA có section nào render.
 */
export function TourFrame() {
  const { t, locale } = useLocale();
  const { embedUrl, externalUrl } = siteConfig.interactiveTour;
  const frameRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const closeCanvas = useCallback(() => setCanvasOpen(false), []);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const label = labelRef.current;
    if (!frame || !label) return;

    const mm = gsap.matchMedia(frame);
    mm.add(MQ.finePointer, () => {
      // Nhãn neo ở góc trên trái khung rồi dịch bằng x/y tới đúng vị trí
      // chuột; ẩn khi chuột chưa vào khung.
      gsap.set(label, { autoAlpha: 0, xPercent: -50, yPercent: -50 });
      const xTo = gsap.quickTo(label, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(label, 'y', { duration: 0.5, ease: 'power3' });

      const place = (e: PointerEvent, instant = false) => {
        const r = frame.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        if (instant) gsap.set(label, { x, y });
        else {
          xTo(x);
          yTo(y);
        }
      };
      const onEnter = (e: PointerEvent) => {
        place(e, true);
        gsap.to(label, { autoAlpha: 1, scale: 1, duration: 0.3, overwrite: 'auto' });
      };
      const onMove = (e: PointerEvent) => place(e);
      const onLeave = () =>
        gsap.to(label, { autoAlpha: 0, scale: 0.9, duration: 0.25, overwrite: 'auto' });

      frame.addEventListener('pointerenter', onEnter);
      frame.addEventListener('pointermove', onMove, { passive: true });
      frame.addEventListener('pointerleave', onLeave);
      return () => {
        frame.removeEventListener('pointerenter', onEnter);
        frame.removeEventListener('pointermove', onMove);
        frame.removeEventListener('pointerleave', onLeave);
      };
    });

    return () => mm.revert();
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const cta =
    locale === 'vi' ? 'Khám phá bức tranh' : 'Explore the artwork';

  return (
    <section
      id='interactive-tour'
      aria-labelledby='tour-heading'
      className='bg-charcoal-950 relative px-5 pt-[16svh] pb-[20svh] md:px-8'
    >
      <p className='text-champagne-400 tracking-luxe text-center text-[10.5px] uppercase md:text-[11.5px]'>
        {t.gallery.ariaLabel}
      </p>
      <h2
        id='tour-heading'
        className='font-display text-ivory mx-auto mt-6 max-w-[44rem] text-center text-[clamp(2rem,3.2vw,3.2rem)] leading-[1.1] text-balance'
      >
        {t.globe.heading}
      </h2>
      <p className='text-champagne-50/65 mx-auto mt-7 max-w-[40rem] text-center text-[15.5px] leading-[1.66]'>
        {t.globe.body}
      </p>

      <div
        ref={frameRef}
        role='button'
        tabIndex={0}
        aria-label={cta}
        onClick={() => setCanvasOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setCanvasOpen(true);
          }
        }}
        className='relative isolate mx-auto mt-16 aspect-square w-full max-w-[87.5rem] cursor-pointer outline-none md:mt-20 md:aspect-[1641/842] md:w-4/5 [@media(hover:hover)_and_(pointer:fine)]:cursor-none'
      >
        {/* Mask đổi theo khổ màn nên phải là class, không phải inline style:
            vuông trên mobile, 1641:842 trên desktop. */}
        <div className='absolute inset-0 [mask-image:url(/journey/mask/frame-square.svg)] [mask-repeat:no-repeat] [mask-size:100%_100%] md:[mask-image:url(/journey/mask/frame-desktop.svg)]'>
          <Image
            src={OVERVIEW_PREVIEW}
            alt={t.globe.heading}
            fill
            sizes='(max-width: 767px) 100vw, 80vw'
            className='object-cover'
          />
          <div
            aria-hidden
            className='from-charcoal-950/70 via-charcoal-950/5 absolute inset-0 bg-gradient-to-t to-transparent'
          />
        </div>
        <span
          ref={labelRef}
          className='bg-charcoal-900/85 text-champagne-50 border-charcoal-600 pointer-events-none absolute top-[6%] left-[5%] z-10 rounded-full border px-4 py-2 text-[13px] whitespace-nowrap backdrop-blur md:text-[15px] [@media(hover:hover)_and_(pointer:fine)]:top-0 [@media(hover:hover)_and_(pointer:fine)]:left-0'
        >
          {cta}
        </span>
      </div>

      <div className='mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4'>
        <p className='text-champagne-50/40 tracking-luxe text-[10px] uppercase'>
          {t.globe.hint}
        </p>
        <button
          type='button'
          onClick={() => setOpen(true)}
          className='border-champagne-400/45 text-champagne-200 hover:bg-champagne-400/10 tracking-luxe ease-luxe border px-6 py-3 text-[10px] uppercase transition-colors duration-500'
        >
          {t.tour.title}
        </button>
      </div>

      <DeepCanvas open={canvasOpen} onClose={closeCanvas} />

      {open && (
        <div className='bg-charcoal-950 fixed inset-0 z-50'>
          <iframe
            src={embedUrl}
            title={t.tour.title}
            allow='fullscreen; xr-spatial-tracking; gyroscope; accelerometer'
            className='absolute inset-0 h-full w-full border-0'
          />
          {/* Góc trên phải của tour có nhãn của nhà cung cấp; iframe khác
              origin nên không sửa được DOM của nó — che bằng một tấm nền cùng
              màu như bản cũ vẫn làm. */}
          <div
            aria-hidden
            className='bg-charcoal-950 pointer-events-none absolute top-0 right-0 z-10 h-[clamp(44px,4.6vw,62px)] w-[clamp(150px,15vw,230px)]'
          />
          <button
            type='button'
            onClick={close}
            aria-label={t.contact.close}
            className='border-charcoal-600 bg-charcoal-950/80 text-champagne-50 hover:border-champagne-400 ease-luxe absolute top-6 left-5 z-20 grid size-11 place-items-center rounded-full border text-[15px] backdrop-blur transition-colors duration-300 md:top-8 md:left-8'
          >
            <span aria-hidden>✕</span>
          </button>
          <a
            href={externalUrl}
            target='_blank'
            rel='noreferrer'
            className='border-charcoal-600 bg-charcoal-950/80 text-champagne-50/80 hover:border-champagne-400 tracking-luxe ease-luxe absolute bottom-6 left-1/2 z-20 -translate-x-1/2 border px-6 py-3 text-[10.5px] uppercase backdrop-blur transition-colors duration-300'
          >
            {t.tour.openExternal}
          </a>
        </div>
      )}
    </section>
  );
}
