'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/journey/motion';
import { useLocale } from '@/components/shared/locale-provider';
import { askQuestion, useOverlay } from '@/lib/journey/overlay-store';

/**
 * Ô hỏi ghim đáy màn — cơ chế `c-site-footer` + `c-prompt` của trang mẫu.
 *
 * Đây là thứ có mặt suốt cả hành trình, nên nó là thay đổi cảm nhận rõ nhất
 * trên toàn trang: người xem không phải cuộn xuống đáy mới hỏi được.
 *
 * Ba chi tiết lấy đúng của trang mẫu:
 *   - placeholder chạy marquee liên tục khi ô trống và chưa focus; tan mềm ở
 *     hai mép bằng mask thay vì bị cắt cứng;
 *   - cuộn xuống thì CẢ khối dịch xuống đúng chiều cao dòng colophon (ô nhập
 *     trượt sát đáy, colophon mờ đi), cuộn lên thì trả về — bỏ qua rung cuộn
 *     nhỏ để không bật tắt liên tục;
 *   - vào sau khi phim mở màn đã chạy một đoạn, để không tranh chú ý với
 *     dòng slogan; reload giữa trang thì hiện ngay.
 *
 * Khác trang mẫu ở một điểm có chủ ý: trang mẫu trả lời bằng AI. Ở đây câu
 * hỏi mở lớp phủ ghi lại câu hỏi kèm các kênh liên hệ thật và nút đưa xuống
 * form — không dựng một câu trả lời máy không có thật.
 */
const COPY = {
  vi: {
    placeholder:
      'Anh/chị muốn biết gì về The Magnolia? Đội ngũ tư vấn sẽ phản hồi trực tiếp',
    send: 'Gửi',
    label: 'Câu hỏi của anh/chị',
  },
  en: {
    placeholder:
      'What would you like to know about The Magnolia? Our team will reply personally',
    send: 'Send',
    label: 'Your question',
  },
} as const;

export function PromptBar() {
  const { t, locale } = useLocale();
  const c = COPY[locale];
  const rootRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const overlay = useOverlay();
  const showMarquee = !value && !focused;

  const submit = () => {
    if (!value.trim()) return;
    askQuestion(value);
    setValue('');
    (document.activeElement as HTMLElement | null)?.blur();
  };

  // Ô nhập ẩn khi lớp phủ đang mở — trang mẫu cũng vậy, để lớp phủ không bị
  // một ô nhập nổi đè lên.
  useLayoutEffect(() => {
    const form = formRef.current;
    if (!form) return;
    gsap.to(form, {
      autoAlpha: overlay.open ? 0 : 1,
      y: overlay.open ? 12 : 0,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: true,
    });
  }, [overlay.open]);

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

        gsap.fromTo(
          root,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reduce ? 0 : 1,
            delay: reduce || window.scrollY > 0 ? 0 : 2.6,
            ease: 'power3.out',
          }
        );

        let hidden = false;
        const setHidden = (next: boolean) => {
          if (next === hidden) return;
          hidden = next;
          const d = reduce ? 0 : 0.5;
          gsap.to(root, {
            y: next ? colophon.offsetHeight : 0,
            duration: d,
            ease: 'power3.out',
            overwrite: 'auto',
          });
          gsap.to(colophon, {
            autoAlpha: next ? 0 : 1,
            duration: d * 0.6,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };
        const st = ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: self => {
            if (self.scroll() < 10) setHidden(false);
            else if (Math.abs(self.getVelocity()) > 20)
              setHidden(self.direction === 1);
          },
        });

        if (!reduce)
          gsap.to(track, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });

        return () => st.kill();
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <footer
      ref={rootRef}
      className='pointer-events-none invisible fixed inset-x-0 bottom-0 z-40 px-4 md:px-8'
    >
      {/* Nền tan dần dưới đáy — colophon không đè lên cảnh phía sau. */}
      <div
        aria-hidden
        className='from-charcoal-950/0 via-charcoal-950/80 to-charcoal-950 absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b'
      />

      <form
        ref={formRef}
        onSubmit={e => {
          e.preventDefault();
          submit();
        }}
        className='flex justify-center pb-3 md:pb-4'
      >
        <div className='border-charcoal-700 bg-charcoal-900/90 focus-within:border-champagne-400/60 group pointer-events-auto relative flex w-full max-w-[34rem] items-center rounded-full border py-1.5 pr-1.5 pl-5 shadow-[0_14px_40px_-16px_rgba(0,0,0,0.75)] backdrop-blur transition-colors duration-300 md:w-[33vw] md:max-w-none md:min-w-[26rem]'>
          <label htmlFor='journey-prompt' className='sr-only'>
            {c.label}
          </label>
          <textarea
            id='journey-prompt'
            rows={1}
            value={value}
            onChange={e => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            // iOS Safari tự zoom khi focus ô nhập < 16px → mobile giữ 16px.
            className='text-champagne-50 min-h-[1.3em] flex-1 resize-none bg-transparent py-1 pr-3 text-[16px] leading-[1.3] outline-none md:text-[15px]'
          />
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-y-0 right-14 left-5 flex items-center overflow-hidden text-[16px] leading-[1.3] text-champagne-50/45 transition-opacity duration-200 md:text-[15px] ${showMarquee ? 'opacity-100' : 'opacity-0'}`}
            style={{
              maskImage:
                'linear-gradient(to right, transparent, #000 1.25rem, #000 calc(100% - 2rem), transparent)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent, #000 1.25rem, #000 calc(100% - 2rem), transparent)',
            }}
          >
            <div data-marquee className='flex w-max whitespace-nowrap'>
              <span className='pr-20'>{c.placeholder}</span>
              <span className='pr-20'>{c.placeholder}</span>
            </div>
          </div>
          <button
            type='submit'
            aria-label={c.send}
            className='bg-champagne-400/15 text-champagne-200 hover:bg-champagne-400/25 ease-luxe grid size-10 shrink-0 place-items-center rounded-full text-[17px] leading-none transition-[background-color,transform] duration-200 active:scale-[0.96]'
          >
            <span aria-hidden className='-mt-px'>
              →
            </span>
          </button>
        </div>
      </form>

      <div
        data-colophon
        className='text-champagne-50/45 pointer-events-auto relative -mx-4 flex flex-nowrap items-center gap-4 overflow-x-auto px-4 pb-3 text-[9.5px] tracking-[0.12em] uppercase [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 md:pb-4 md:text-[10.5px] [&::-webkit-scrollbar]:hidden'
      >
        <p className='shrink-0 whitespace-nowrap'>
          ©2026 The Magnolia — {t.footer.rights}
        </p>
        <p className='shrink-0 whitespace-nowrap md:absolute md:left-1/2 md:-translate-x-1/2'>
          {t.footer.address}
        </p>
        <ul className='flex shrink-0 flex-nowrap items-center gap-4 md:ml-auto md:gap-5'>
          <li className='shrink-0'>
            <a
              href={`tel:${t.contact.phone.replace(/[^\d+]/g, '')}`}
              className='hover:text-champagne-200 whitespace-nowrap transition-colors duration-200'
            >
              {t.contact.phone}
            </a>
          </li>
          <li className='shrink-0'>
            <a
              href='#consultation'
              className='hover:text-champagne-200 whitespace-nowrap transition-colors duration-200'
            >
              {t.footer.enquire}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
